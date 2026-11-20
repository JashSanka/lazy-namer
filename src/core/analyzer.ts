
import { convertName, type NamingConvention } from "./conventions";
import type {
    PrismaModel,
    NamingIssue,
    AnalyzeOptions
} from "../types/schema";

export function analyzeSchema(
    models: PrismaModel[],
    options: AnalyzeOptions = {}
): NamingIssue[] {
    const convention: NamingConvention =
        options.convention ?? "snake_case";

    const issues: NamingIssue[] = [];

    const modelNames = new Set(models.map(model => model.name));

    for (const model of models) {
        if (options.excludeModels?.includes(model.name)) {
            continue;
        }

        const suggestedModelName = convertName(
            model.name,
            convention
        );

        if (
            model.name !== suggestedModelName &&
            model.mappedName!==suggestedModelName
        ) {
            issues.push({
                originalName: model.name,
                suggestedName: suggestedModelName,
                type: "model"
            });
        }

        const excludedFields =
            options.excludeFields?.[model.name] ?? [];

        for (const field of model.fields) {
            if (excludedFields.includes(field.name)) {
                continue;
            }

            // Ignore relation fields.
            const isRelation =
                modelNames.has(field.fieldType) ||
                field.attributes.includes("relation");

            if (isRelation) {
                continue;
            }

            const suggestedName = convertName(
                field.name,
                convention
            );

            if (
                field.name !== suggestedName &&
                field.mappedName !==suggestedName
            ) {
                issues.push({
                    originalName: field.name,
                    suggestedName,
                    type: "field"
                });
            }
        }
    }

    return issues;
}
