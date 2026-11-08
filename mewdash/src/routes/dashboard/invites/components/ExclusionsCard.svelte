<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { InviteExclusionKind, inviteTrackingApi, type InviteExclusionKindValue } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { errorText, idString, type Member, type Role } from "./inviteModel";

  interface Props {
    guildId: bigint;
    members: Member[];
    roles: Role[];
    autoSave: AutoSave;
    onerror: (message: string) => void;
  }

  let { guildId, members, roles, autoSave, onerror }: Props = $props();

  type Kind = "users" | "roles" | "hidden";

  const kinds: Record<Kind, InviteExclusionKindValue> = {
    users: InviteExclusionKind.BlacklistedUser,
    roles: InviteExclusionKind.BlacklistedRole,
    hidden: InviteExclusionKind.HiddenUser
  };

  let lists: Record<Kind, string[]> = $state({ users: [], roles: [], hidden: [] });

  async function load() {
    try {
      const [users, roleIds, hidden] = await Promise.all([
        inviteTrackingApi.getExclusions(guildId, kinds.users),
        inviteTrackingApi.getExclusions(guildId, kinds.roles),
        inviteTrackingApi.getExclusions(guildId, kinds.hidden)
      ]);
      lists = { users: users.map(idString), roles: roleIds.map(idString), hidden: hidden.map(idString) };
    } catch (err) {
      logger.error("Failed to load invite exclusions:", err);
      onerror(errorText(err, m.common.notifyLoadSettingsFailed()));
    }
  }

  function setList(kind: Kind, detail: { selected: string | string[] | null }) {
    const next = [...new Set(Array.isArray(detail.selected) ? detail.selected : detail.selected ? [detail.selected] : [])];
    const before = lists[kind];
    lists = { ...lists, [kind]: next };
    void autoSave.now(`exclusions:${kind}`, async () => {
      try {
        for (const id of next.filter(x => !before.includes(x))) await inviteTrackingApi.addExclusion(guildId, kinds[kind], BigInt(id));
        for (const id of before.filter(x => !next.includes(x))) await inviteTrackingApi.removeExclusion(guildId, kinds[kind], BigInt(id));
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.invites.exclusionsTitle()} alwaysOpen>
  <SettingField label={m.invites.settingsBlacklistUsers()} id="invites-excluded-users">
    <DiscordSelector id="invites-excluded-users" type="custom" multiple options={members} customIcon="fa-user" selected={lists.users} placeholder={m.common.addAMember()} onchange={(detail) => setList("users", detail)} />
  </SettingField>
  <SettingField label={m.common.blacklistedRoles()} id="invites-excluded-roles">
    <DiscordSelector id="invites-excluded-roles" type="role" multiple options={roles} selected={lists.roles} placeholder={m.common.addARole()} onchange={(detail) => setList("roles", detail)} />
  </SettingField>
  <SettingField label={m.invites.settingsHidden()} hint={m.invites.settingsHiddenNote()} id="invites-hidden-users">
    <DiscordSelector id="invites-hidden-users" type="custom" multiple options={members} customIcon="fa-user" selected={lists.hidden} placeholder={m.common.addAMember()} onchange={(detail) => setList("hidden", detail)} />
  </SettingField>
</PluginCard>
