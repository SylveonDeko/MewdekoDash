import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { orderMigrations } from "../src/lib/server/migrationOrder.ts";

describe("migration ordering", () => {
  it("runs files in numeric order", () => {
    const ordered = orderMigrations({ "./migrations/010_c.sql": "c", "./migrations/002_b.sql": "b", "./migrations/001_a.sql": "a" });
    assert.deepEqual(ordered.map((m) => [m.version, m.name, m.sql]), [
      [1, "a", "a"],
      [2, "b", "b"],
      [10, "c", "c"],
    ]);
  });

  it("refuses a badly named file", () => {
    assert.throws(() => orderMigrations({ "./migrations/wiki.sql": "x" }));
    assert.throws(() => orderMigrations({ "./migrations/001-wiki.sql": "x" }));
  });

  it("refuses two files with the same number", () => {
    assert.throws(() => orderMigrations({ "./migrations/001_a.sql": "x", "./migrations/001_b.sql": "y" }));
  });

  const dir = fileURLToPath(new URL("../src/lib/server/migrations", import.meta.url));

  it("accepts the bundled migration files", () => {
    const files = Object.fromEntries(readdirSync(dir).map((file) => [`./migrations/${file}`, readFileSync(join(dir, file), "utf8")]));
    const ordered = orderMigrations(files);
    assert.ok(ordered.length >= 1);
    for (const migration of ordered) assert.match(migration.sql, /create table/i);
  });

  it("prefixes every table the bundled migrations create with dash_", () => {
    for (const file of readdirSync(dir)) {
      const sql = readFileSync(join(dir, file), "utf8");
      for (const match of sql.matchAll(/create table (?:if not exists )?([a-z_0-9]+)/gi)) {
        assert.match(match[1], /^dash_[a-z0-9_]+$/, `${file}: ${match[1]}`);
      }
    }
  });
});
