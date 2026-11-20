export function camelCaseToSnakeCase(name: string): string { 
    return name.replace(/([A-Z]{2,})([A-Z][a-z])/g, "$1_$2").replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}