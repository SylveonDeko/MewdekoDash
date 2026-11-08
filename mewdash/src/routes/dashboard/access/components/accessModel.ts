import { m } from "$lib/i18n";
import { DashboardAccessTargetType } from "$lib/api/dashboardaccess/models";

export type Named = { id: string; name: string };

/**
 * Reads an error's own message, which is the bot's when it gave one.
 * @param err The thrown value
 * @param fallback What to say when there is no message
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Names a grant or manager target, falling back to its id when it is no longer in the server.
 * @param type Whether the target is a user or a role
 * @param id The target's id
 * @param roles The server's roles
 * @param members The server's members
 */
export function targetName(type: DashboardAccessTargetType, id: bigint | string, roles: Named[], members: Named[]): string {
  const key = id.toString();
  const found = (type === DashboardAccessTargetType.Role ? roles : members).find((x) => x.id === key);
  if (found) return found.name;
  return type === DashboardAccessTargetType.Role ? m.common.roleFallback({ id: key }) : m.common.userFallback({ id: key });
}
