# Lazy-Namer

**Automatic naming convention management for Prisma schemas.**

Lazy-Namer helps you maintain consistent database naming conventions in your Prisma schema without manually writing `@map` and `@@map` attributes.

Switch naming conventions, detect inconsistent mappings, and automatically update your schema with a simple CLI.

## Features

- **Multiple naming conventions:** Supports `snake_case`, `camelCase`, `PascalCase`, and `UPPER_SNAKE_CASE`.
- **Automatic mapping:** Adds missing `@map` and `@@map` attributes.
- **Mapping updates:** Updates existing database mappings when switching conventions.
- **Schema analysis:** Detects missing or inconsistent database mappings.
- **Selective exclusions:** Exclude entire models or individual fields.
- **Dry-run mode:** Preview schema changes without modifying files.
- **Custom schema paths:** Run Lazy-Namer against schemas outside the default Prisma directory.

## Installation

Install Lazy-Namer as a development dependency:

```bash
npm install -D lazy-namer
```

You can also run it directly using `npx`:

```bash
npx lazy-namer --help
```

## Supported naming conventions

| Convention | Example |
|---|---|
| `snake_case` | `first_name` |
| `camelCase` | `firstName` |
| `PascalCase` | `FirstName` |
| `UPPER_SNAKE_CASE` | `FIRST_NAME` |

The default convention is `snake_case`.

## Usage

Lazy-Namer provides two main commands: `check` and `fix`.

### 1. Check your schema

Identify database mappings that don't follow your selected convention.

```bash
npx lazy-namer check
```

Specify a convention:

```bash
npx lazy-namer check --convention PascalCase
```

Specify a custom schema path:

```bash
npx lazy-namer check --schema ./prisma/schema.prisma
```

### 2. Fix your schema

Automatically add or update database mappings.

```bash
npx lazy-namer fix
```

Choose a convention:

```bash
npx lazy-namer fix --convention camelCase
```

### 3. Preview changes

Use `--dry-run` to preview the transformed schema without modifying the original file.

```bash
npx lazy-namer fix --convention PascalCase --dry-run
```

Remove `--dry-run` to apply the changes.

## Excluding models and fields

Sometimes you don't want certain models or fields to be modified.

Lazy-Namer supports repeatable exclusion options.

**Exclude an entire model:**

```bash
npx lazy-namer fix --exclude-model User
```

**Exclude a specific field:**

```bash
npx lazy-namer fix --exclude-field BlogPost.createdAt
```

**Combine exclusions:**

```bash
npx lazy-namer fix \
  --convention PascalCase \
  --exclude-model User \
  --exclude-field BlogPost.createdAt \
  --dry-run
```

Exclusion names must match the Prisma model and field names, including capitalization.

## Example

Consider the following Prisma model:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  firstName String
  lastName  String
  createdAt DateTime @default(now())
}
```

Run:

```bash
npx lazy-namer fix --convention snake_case
```

Lazy-Namer transforms the database mappings:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("user")
}
```

Notice that Prisma field and model identifiers remain unchanged. Only database mapping attributes are modified.

## CLI reference

| Option | Description |
|---|---|
| `-s, --schema <path>` | Path to the Prisma schema |
| `-c, --convention <type>` | Select the naming convention |
| `--exclude-model <model>` | Exclude a model (repeatable) |
| `--exclude-field <model.field>` | Exclude a field (repeatable) |
| `--dry-run` | Preview changes without writing to the schema |
| `-h, --help` | Display help |
| `-V, --version` | Display package version |

The default schema path is `prisma/schema.prisma`.

## Supported databases

Lazy-Namer is intended for Prisma schemas using SQL database providers, including:

- PostgreSQL
- MySQL
- MariaDB
- SQLite
- Microsoft SQL Server
- CockroachDB

MongoDB is not currently supported.

## Development

Clone the repository:

```bash
git clone https://github.com/JashSanka/lazy-namer.git
cd Lazy-Namer
```

Install dependencies:

```bash
npm install
```

Run the test suite:

```bash
npm test
```

Build the package:

```bash
npm run build
```

## Tech Stack

- TypeScript
- Node.js
- Prisma AST
- Commander.js
- Vitest

## License

This project is licensed under the [ISC License](LICENSE).

Copyright (c) 2026, Jash Sanka.

See the [LICENSE](LICENSE) file for details.

---

**Lazy-Namer** — Less manual mapping. More building.