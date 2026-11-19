export interface Migration {
  version: number;
  name: string;
  sql: string;
}

/**
 * Orders the bundled migration files. Files are named `<number>_<name>.sql` and run in numeric
 * order; a malformed name or a repeated number stops the server from migrating at all.
 *
 * @param files Raw SQL keyed by the path the bundler saw.
 */
export function orderMigrations(files: Record<string, string>): Migration[] {
  const migrations: Migration[] = [];
  const seen = new Set<number>();
  for (const [path, sql] of Object.entries(files)) {
    const file = path.split("/").pop() ?? path;
    const match = /^(\d{1,6})_([a-z0-9_]+)\.sql$/.exec(file);
    if (!match) throw new Error(`Migration file name is not <number>_<name>.sql: ${file}`);
    const version = Number(match[1]);
    if (seen.has(version)) throw new Error(`Two migrations share the number ${version}`);
    seen.add(version);
    migrations.push({ version, name: match[2], sql });
  }
  return migrations.sort((a, b) => a.version - b.version);
}
