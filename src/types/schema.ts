
export interface PrismaField {
    name: string;
    fieldType: string;
    optional: boolean;
    array: boolean;
    attributes: string[];
    mappedName?: string;
}

export interface PrismaModel {
    name: string;
    fields: PrismaField[];
    mappedName?: string;
}

export interface NamingIssue {
    originalName: string;
    suggestedName: string;
    type: "field" | "model";
}

export interface AnalyzeOptions {
    convention?: import("../core/conventions").NamingConvention;
    excludeModels?: string[];
    excludeFields?: Record<string, string[]>;
}
