import * as fs from "node:fs";
import { getSchema } from "@mrleebo/prisma-ast";
import type { PrismaField, PrismaModel } from "../types/schema";

interface AstArgument {
    type: string;
    value: string;
}

interface AstAttribute {
    type: "attribute";
    name: string;
    args?: AstArgument[];
}

interface AstField {
    type: "field";
    name: string;
    fieldType: string;
    optional?: boolean;
    array?: boolean;
    attributes?: AstAttribute[];
}

interface AstProperty {
    type: string;
    name?: string;
    args?: AstArgument[];
    properties?: AstField[];
}

interface AstModel {
    type: "model";
    name: string;
    properties?: (AstField | AstProperty)[];
}

interface AstSchema {
    list: AstModel[];
}

function getMappedName(
    attributes: AstAttribute[] = []
): string | undefined {
    const mapAttribute = attributes.find(
        attribute => attribute.name === "map"
    );

    const value = mapAttribute?.args?.[0]?.value;

    if (typeof value !== "string") {
        return undefined;
    }

    return value.replace(/^["']|["']$/g, "");
}

export function parsePrismaSchema(filePath: string): PrismaModel[] {
    const source = fs.readFileSync(filePath, "utf-8");
    const schema = getSchema(source) as unknown as AstSchema;

    const models: PrismaModel[] = [];

    for (const model of schema.list) {
        if (model.type !== "model") continue;

        const fields: PrismaField[] = [];
        let modelMappedName: string | undefined;

        for (const property of model.properties ?? []) {
            if (property.type === "field") {
                const field = property as AstField;

                fields.push({
                    name: field.name,
                    fieldType: field.fieldType,
                    optional: field.optional ?? false,
                    array: field.array ?? false,
                    attributes: field.attributes?.map(
                        attribute => attribute.name
                    ) ?? [],
                    mappedName: getMappedName(field.attributes)
                });
            }

            if (
                property.type === "attribute" &&
                property.name === "map"
            ) {
                modelMappedName = getMappedName([
                    property as AstAttribute
                ]);
            }
        }

        models.push({
            name: model.name,
            fields,
            mappedName: modelMappedName
        });
    }

    return models;
}
