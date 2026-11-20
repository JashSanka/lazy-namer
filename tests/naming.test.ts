import { describe, it, expect } from "vitest";
import { camelCaseToSnakeCase } from "../src/core/naming";

describe("camelCaseToSnakeCase",()=>{
    it("converts normal camelCase", ()=>{
        expect(camelCaseToSnakeCase("firstName")).toBe("first_name");
    });
    it("handles acronyms", () => {
        expect(camelCaseToSnakeCase("APIKey")).toBe("api_key");
        expect(camelCaseToSnakeCase("userID")).toBe("user_id");
        expect(camelCaseToSnakeCase("OAuthToken")).toBe("oauth_token");
    });
    it("handles already lowercase names", () => {
        expect(camelCaseToSnakeCase("username")).toBe("username");
    });
    it("handles multiple words", () => {
        expect(camelCaseToSnakeCase("createdAtDate")).toBe("created_at_date");
    });
    it("handles mixed-case technical terms", () => {
    expect(camelCaseToSnakeCase("OAuthToken")).toBe("oauth_token");
    expect(camelCaseToSnakeCase("APIKey")).toBe("api_key");
    expect(camelCaseToSnakeCase("URLValue")).toBe("url_value");
});

})