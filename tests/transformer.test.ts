
import { describe, it, expect } from "vitest";
import { transformSchema } from "../src/core/transformer";

describe("Schema Transformer", () => {
    // Your existing 4 tests stay exactly as they are.

    it("should skip implicit relation fields", () => {
        const source = `
        model User {
            id    Int    @id
            posts Post[]
        }

        model Post {
            id     Int  @id
            userId Int
            user   User
        }
        `;

        const result = transformSchema(source);

        expect(result).not.toMatch(/^\s*posts\s+Post\[\].*@map/m);
        expect(result).not.toMatch(/^\s*user\s+User\b.*@map/m);

        expect(result).toContain('@map("user_id")');
    });

    it("should skip explicit relation fields", () => {
        const source = `
        model User {
            id    Int    @id
            posts Post[]
        }

        model Post {
            id     Int  @id
            userId Int
            user   User @relation(fields: [userId], references: [id])
        }
        `;

        const result = transformSchema(source);

        expect(result).not.toMatch(/^\s*user\s+User\b.*@map/m);
        expect(result).toContain('@map("user_id")');
    });

it("should support camelCase convention", () => {
    const source = `
model UserProfile {
    first_name String
}
`;

    const result = transformSchema(source, {
        convention: "camelCase"
    });

    expect(result).toContain('@@map("userProfile")');
    expect(result).toContain('@map("firstName")');
});

it("should support PascalCase convention", () => {
    const source = `
model UserProfile {
    first_name String
}
`;

    const result = transformSchema(source, {
        convention: "PascalCase"
    });

    // Model is already PascalCase, so no @@map is needed.
    expect(result).not.toContain('@@map("UserProfile")');

    // Field needs conversion.
    expect(result).toContain('@map("FirstName")');
});
    it("should support UPPER_SNAKE_CASE convention", () => {
        const source = `
    model UserProfile {
        firstName String
    }
    `;

        const result = transformSchema(source, {
            convention: "UPPER_SNAKE_CASE"
        });

        expect(result).toContain('@@map("USER_PROFILE")');
        expect(result).toContain('@map("FIRST_NAME")');
    });

    it("should skip excluded models", () => {
        const source = `
    model User {
        firstName String
    }

    model AuditLog {
        createdAt DateTime
    }
    `;

        const result = transformSchema(source, {
            excludeModels: ["AuditLog"]
        });

        expect(result).toContain('@map("first_name")');
        expect(result).not.toContain('@@map("audit_log")');
        expect(result).not.toContain('@map("created_at")');
    });

    it("should skip excluded fields but transform others", () => {
        const source = `
    model User {
        firstName String
        legacyCode String
    }
    `;

        const result = transformSchema(source, {
            excludeFields: {
                User: ["legacyCode"]
            }
        });

        expect(result).toContain('@map("first_name")');
        expect(result).not.toContain('@map("legacy_code")');
    });

    it("should skip excluded models", () => {
        const source = `
    model User {
        id        Int    @id
        firstName String
    }

    model AuditLog {
        id        Int    @id
        createdAt DateTime
    }
    `;

        const result = transformSchema(source, {
            excludeModels: ["AuditLog"]
        });

        expect(result).not.toContain('@@map("audit_log")');
        expect(result).not.toContain('@map("created_at")');
    });

    it("should skip excluded fields", () => {
        const source = `
    model User {
        id           Int    @id
        firstName    String
        emailAddress String
    }
    `;

        const result = transformSchema(source, {
            excludeFields: {
                User: ["emailAddress"]
            }
        });

        expect(result).toContain('@map("first_name")');
        expect(result).not.toContain('@map("email_address")');
    });

});

describe("Exclusion options", () => {
    const source = `
model User {
    id        Int    @id
    firstName String
    password  String
}

model AuditLog {
    id          Int    @id
    eventName   String
}
`;

    it("should exclude an entire model", () => {
        const result = transformSchema(source, {
            excludeModels: ["AuditLog"]
        });

        expect(result).not.toContain('@map("event_name")');
        expect(result).toContain('@map("first_name")');
    });

    it("should exclude specific fields", () => {
        const result = transformSchema(source, {
            excludeFields: {
                User: ["password"]
            }
        });

        expect(result).toContain('@map("first_name")');
        expect(result).not.toContain('@map("password")');
    });

    it("should support both model and field exclusions", () => {
        const result = transformSchema(source, {
            excludeModels: ["AuditLog"],
            excludeFields: {
                User: ["password"]
            }
        });

        expect(result).toContain('@map("first_name")');
        expect(result).not.toContain('@map("password")');
        expect(result).not.toContain('@map("event_name")');
    });
});