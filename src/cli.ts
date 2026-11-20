#!/usr/bin/env node

import { Command, Option } from "commander";
import { parsePrismaSchema } from "./core/parser";
import { analyzeSchema } from "./core/analyzer";
import { transformSchema } from "./core/transformer";
import * as fs from "node:fs";

const program = new Command();

const conventions = [
    "snake_case",
    "camelCase",
    "PascalCase",
    "UPPER_SNAKE_CASE"
] as const;

function conventionOption() {
    return new Option("-c, --convention <type>", "Naming convention")
        .choices([...conventions])
        .default("snake_case");
}

function collect(value: string, previous: string[] = []) {
    return [...previous, value];
}

function parseExcludedFields(values: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const value of values) {
        const separator = value.indexOf(".");

        if (separator <= 0 || separator === value.length - 1) {
            throw new Error(
                `Invalid field exclusion "${value}". Use ModelName.fieldName.`
            );
        }

        const model = value.slice(0, separator);
        const field = value.slice(separator + 1);

        result[model] ??= [];
        result[model].push(field);
    }

    return result;
}

function handleError(error: unknown) {
    const message =
        error instanceof Error ? error.message : String(error);

    console.error(`\nError: ${message}`);
    process.exitCode = 1;
}

function addCommonOptions(command: Command) {
    return command
        .option(
            "-s, --schema <path>",
            "Path to Prisma schema",
            "prisma/schema.prisma"
        )
        .addOption(conventionOption())
        .option(
            "--exclude-model <model>",
            "Model to exclude (repeatable)",
            collect,
            []
        )
        .option(
            "--exclude-field <model.field>",
            "Field to exclude (repeatable)",
            collect,
            []
        );
}

program
    .name("lazy-namer")
    .description("Naming convention management for Prisma schemas")
    .version("1.0.0");

// CHECK COMMAND
addCommonOptions(
    program
        .command("check")
        .description("Check Prisma database naming mappings")
).action(options => {
    try {
        if (!fs.existsSync(options.schema)) {
            throw new Error(`Schema file not found: ${options.schema}`);
        }

        const models = parsePrismaSchema(options.schema);
        const excludeFields = parseExcludedFields(options.excludeField);

        const issues = analyzeSchema(models, {
            convention: options.convention,
            excludeModels: options.excludeModel,
            excludeFields
        });

        if (issues.length === 0) {
            console.log("All database mappings follow the naming convention!");
            return;
        }

        console.log("\nMissing database mappings:\n");

        for (const issue of issues) {
            console.log(
                `${issue.type}: ${issue.originalName} → ${issue.suggestedName}`
            );
        }

        console.log(`\nTotal issues: ${issues.length}`);
    } catch (error) {
        handleError(error);
    }
});

// FIX COMMAND
addCommonOptions(
    program
        .command("fix")
        .description("Automatically add Prisma database mappings")
        .option("--dry-run", "Preview changes without modifying the schema")
).action(options => {
    try {
        const schemaPath = options.schema;

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }

        const source = fs.readFileSync(schemaPath, "utf-8");
        const excludeFields = parseExcludedFields(options.excludeField);

        const transformed = transformSchema(source, {
            convention: options.convention,
            excludeModels: options.excludeModel,
            excludeFields
        });

        if (source === transformed) {
            console.log("Schema already follows the naming convention!");
            return;
        }
        if (options.dryRun) {
            console.log("\nDry run: Preview of transformed schema\n");
            console.log(transformed);
            console.log("\nNo files were modified.");
            return;
        }
        fs.writeFileSync(schemaPath, transformed, "utf-8");

        console.log("Schema successfully updated!");
    } catch (error) {
        handleError(error);
    }
});

program.parse();
