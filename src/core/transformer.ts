
import { getSchema, printSchema } from "@mrleebo/prisma-ast";
import { convertName, type NamingConvention } from "./conventions";

interface AstArgument {
    type: "attributeArgument";
    value: string;
}

interface AstAttribute {
    type: "attribute";
    name: string;
    kind: "field" | "object";
    args?: AstArgument[];
}

interface AstField {
    type: "field";
    name: string;
    fieldType: string;
    attributes?: AstAttribute[];
}

interface AstNode {
    type: string;
    name?: string;
    properties?: (AstField | AstAttribute)[];
}

interface AstSchema {
    type: "schema";
    list: AstNode[];
}

export interface TransformOptions {
    convention?: NamingConvention;
    excludeModels?: string[];
    excludeFields?: Record<string, string[]>;
}

// Find an existing @map or @@map attribute.
function findMapAttribute(
    attributes: AstAttribute[] | undefined
): AstAttribute | undefined {
    return attributes?.find(attribute => attribute.name === "map");
}

// Read the existing mapping value.
function getMapValue(attribute: AstAttribute): string | undefined {
    const value = attribute.args?.[0]?.value;

    if (typeof value !== "string") {
        return undefined;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value.replace(/^["']|["']$/g, "");
    }
}

// Create or update a mapping attribute.
function updateMap(
    attributes: AstAttribute[],
    kind: "field" | "object",
    suggestedName: string
): void {
    const existingMap = findMapAttribute(attributes);

    if (existingMap) {
        const currentName = getMapValue(existingMap);

        // Mapping already follows the requested convention.
        if (currentName === suggestedName) {
            return;
        }

        // Update the existing mapping.
        existingMap.args = [
            {
                type: "attributeArgument",
                value: JSON.stringify(suggestedName)
            }
        ];

        return;
    }

    // Add a new mapping.
    attributes.push({
        type: "attribute",
        name: "map",
        kind,
        args: [
            {
                type: "attributeArgument",
                value: JSON.stringify(suggestedName)
            }
        ]
    });
}

export function transformSchema(
    source: string,
    options: TransformOptions = {}
): string {
    const convention = options.convention ?? "snake_case";
    const schema = getSchema(source) as unknown as AstSchema;

    const modelNames = new Set(
        schema.list
            .filter(node => node.type === "model")
            .map(model => model.name!)
    );

    for (const model of schema.list) {
        if (model.type !== "model" || !model.properties) {
            continue;
        }

        const modelName = model.name!;

        // Skip excluded models completely.
        if (options.excludeModels?.includes(modelName)) {
            continue;
        }

        const excludedFields =
            options.excludeFields?.[modelName] ?? [];

        for (const property of model.properties) {
            if (property.type !== "field") {
                continue;
            }

            const field = property as AstField;

            // Skip excluded fields.
            if (excludedFields.includes(field.name)) {
                continue;
            }

            // Skip relation fields.
            const isRelation =
                modelNames.has(field.fieldType) ||
                field.attributes?.some(
                    attribute => attribute.name === "relation"
                );

            if (isRelation) {
                continue;
            }

            const suggestedName = convertName(
                field.name,
                convention
            );

            // Update existing mapping or add a missing one.
            if (suggestedName !== field.name) {
                field.attributes ??= [];

                updateMap(
                    field.attributes,
                    "field",
                    suggestedName
                );
            } else {
                // Remove an unnecessary mapping when the field
                // already has the requested database name.
                if (field.attributes) {
                    const existingMap = findMapAttribute(
                        field.attributes
                    );

                    if (
                        existingMap &&
                        getMapValue(existingMap) !== field.name
                    ) {
                        field.attributes =
                            field.attributes.filter(
                                attribute => attribute !== existingMap
                            );
                    }
                }
            }
        }

        const suggestedModelName = convertName(
            modelName,
            convention
        );

        const modelAttributes = model.properties.filter(
            (property): property is AstAttribute =>
                property.type === "attribute" &&
                (property as AstAttribute).kind === "object"
        );

        const existingModelMap = findMapAttribute(modelAttributes);

        if (suggestedModelName !== modelName) {
            updateMap(
                modelAttributes,
                "object",
                suggestedModelName
            );

            // If the map didn't exist, attach the new attribute.
            if (!existingModelMap) {
                const newMap = modelAttributes[modelAttributes.length - 1];
                model.properties.push(newMap);
            }
        } else if (
            existingModelMap &&
            getMapValue(existingModelMap) !== modelName
        ) {
            model.properties = model.properties.filter(
                property => property !== existingModelMap
            );
        }
    }

    return printSchema(
        schema as Parameters<typeof printSchema>[0]
    );
}
