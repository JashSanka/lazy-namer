
import { describe, it, expect } from "vitest";
import { convertName } from "../src/core/conventions";

describe("Naming Conventions", () => {

    it("should convert to snake_case", () => {
        expect(convertName("firstName", "snake_case"))
            .toBe("first_name");
    });

    it("should convert to camelCase", () => {
        expect(convertName("first_name", "camelCase"))
            .toBe("firstName");
    });

    it("should convert to PascalCase", () => {
        expect(convertName("first_name", "PascalCase"))
            .toBe("FirstName");
    });

    it("should convert to UPPER_SNAKE_CASE", () => {
        expect(convertName("firstName", "UPPER_SNAKE_CASE"))
            .toBe("FIRST_NAME");
    });

    it("should handle acronyms", () => {
        expect(convertName("APIKey", "snake_case"))
            .toBe("api_key");
    });

    it("should handle hyphenated names", () => {
        expect(convertName("first-name", "snake_case"))
            .toBe("first_name");
    });

});
