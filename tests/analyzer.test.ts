
import { describe, it, expect } from "vitest";
import { parsePrismaSchema } from "../src/core/parser";
import { analyzeSchema } from "../src/core/analyzer";

describe("Schema Analyzer", () => {
    it("should detect naming convention issues", () => {
        const models = parsePrismaSchema("examples/schema.prisma");

        const issues = analyzeSchema(models);

        expect(issues.length).toBeGreaterThan(0);

        console.log(issues);
    });
    it("should detect existing @map values that don't match the convention", () => {
    const models = [
        {
            name: "User",
            mappedName: undefined,
            fields: [
                {
                    name: "createdAt",
                    fieldType: "DateTime",
                    optional: false,
                    array: false,
                    attributes: ["map"],
                    mappedName: "created_at"
                }
            ]
        }
    ];

    const issues = analyzeSchema(models, {
        convention: "PascalCase"
    });

    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual({
        originalName: "createdAt",
        suggestedName: "CreatedAt",
        type: "field"
    });
});
});
