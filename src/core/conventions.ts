
export type NamingConvention =
    | "snake_case"
    | "camelCase"
    | "PascalCase"
    | "UPPER_SNAKE_CASE";

function extractWords(name: string): string[] {
    return name
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_\-\s]+/g, " ")
        .trim()
        .toLowerCase()
        .split(" ")
        .filter(Boolean);
}

export function convertName(
    name: string,
    convention: NamingConvention
): string {
    const words = extractWords(name);

    switch (convention) {
        case "snake_case":
            return words.join("_");

        case "camelCase":
            return words
                .map((word, index) =>
                    index === 0
                        ? word
                        : word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join("");

        case "PascalCase":
            return words
                .map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join("");

        case "UPPER_SNAKE_CASE":
            return words.join("_").toUpperCase();
    }
}
