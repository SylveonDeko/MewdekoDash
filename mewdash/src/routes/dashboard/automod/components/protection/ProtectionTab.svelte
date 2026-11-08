<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { clientApi, protectionApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { diffIds, errorText, idString, type Named, type Notify, type SaveMode } from "../automodModel";
  import AltCard from "./AltCard.svelte";
  import AutomodRulesSection from "./AutomodRulesSection.svelte";
  import ExternalAppCard from "./ExternalAppCard.svelte";
  import ImageHashCard from "./ImageHashCard.svelte";
  import MassPostCard from "./MassPostCard.svelte";
  import MentionCard from "./MentionCard.svelte";
  import PatternCard from "./PatternCard.svelte";
  import PostChannelCard from "./PostChannelCard.svelte";
  import RaidCard from "./RaidCard.svelte";
  import SpamCard from "./SpamCard.svelte";
  import {
    Action,
    normalize,
    PROTECTION_KEYS,
    senders,
    toRequest,
    type ProtectionKey,
    type Status,
    type StatusMap
  } from "./protectionModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    roles: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  let { guildId, channels, roles, autoSave, notify }: Props = $props();

  let status: StatusMap = $state(
    Object.fromEntries(PROTECTION_KEYS.map((key) => [key, normalize(key, undefined)])) as StatusMap
  );
  let loading = $state(true);
  let members: Named[] = $state([]);
  let membersLoaded = false;

  async function load() {
    try {
      const raw = (await protectionApi.getProtectionStatus(guildId)) as unknown as Record<string, Status>;
      status = Object.fromEntries(PROTECTION_KEYS.map((key) => [key, normalize(key, raw[key])])) as StatusMap;
    } catch (err) {
      logger.error("Failed to load protection:", err);
      notify(errorText(err, m.automod.errorLoad()), "error");
    } finally {
      loading = false;
    }
  }

  async function loadMembers() {
    try {
      members = (await clientApi.getMembers(guildId))
        .map((x) => ({ id: idString(x.id), name: x.username ?? idString(x.id) }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load members:", err);
    }
  }

  function save(key: ProtectionKey, mode: SaveMode) {
    const send = async () => {
      const current = $state.snapshot(status[key]);
      if (current.enabled && Number(current.action) === Action.AddRole && !current.roleId) return;
      try {
        await senders[key](guildId, toRequest(key, current));
      } catch (err) {
        await load();
        throw err;
      }
    };
    if (mode === "typing") autoSave.schedule(`protection:${key}`, send);
    else void autoSave.now(`protection:${key}`, send);
  }

  function patch(key: ProtectionKey, changes: Status, mode: SaveMode = "now") {
    status[key] = { ...status[key], ...changes };
    save(key, mode);
  }

  function toggle(key: ProtectionKey, enabled: boolean) {
    patch(key, { enabled }, "now");
  }

  function setList(
    key: ProtectionKey,
    list: string,
    ids: string[],
    apply: (id: string, added: boolean) => Promise<unknown>
  ) {
    const before: string[] = status[key][list];
    status[key] = { ...status[key], [list]: ids };
    void autoSave.now(`protection:${key}:${list}`, async () => {
      try {
        for (const id of diffIds(before, ids)) await apply(id, ids.includes(id));
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  $effect(() => {
    if (status.antiPostChannel.enabled && !membersLoaded) {
      membersLoaded = true;
      void loadMembers();
    }
  });

  onMount(() => {
    void load();
  });
</script>

{#if loading}
  <div class="flex justify-center py-8">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{:else}
  <RaidCard status={status.antiRaid} {roles} onpatch={(c, mode) => patch("antiRaid", c, mode)} ontoggle={(on) => toggle("antiRaid", on)} />
  <SpamCard
    status={status.antiSpam}
    {roles}
    {channels}
    onpatch={(c, mode) => patch("antiSpam", c, mode)}
    ontoggle={(on) => toggle("antiSpam", on)}
    onignored={(ids) => setList("antiSpam", "ignoredChannels", ids, (id) => protectionApi.toggleAntiSpamIgnoredChannel(guildId, BigInt(id)))}
  />
  <AltCard status={status.antiAlt} {roles} onpatch={(c, mode) => patch("antiAlt", c, mode)} ontoggle={(on) => toggle("antiAlt", on)} />
  <MentionCard status={status.antiMassMention} {roles} onpatch={(c, mode) => patch("antiMassMention", c, mode)} ontoggle={(on) => toggle("antiMassMention", on)} />
  <MassPostCard status={status.antiMassPost} {roles} onpatch={(c, mode) => patch("antiMassPost", c, mode)} ontoggle={(on) => toggle("antiMassPost", on)} />
  <PostChannelCard
    status={status.antiPostChannel}
    {roles}
    {channels}
    {members}
    onpatch={(c, mode) => patch("antiPostChannel", c, mode)}
    ontoggle={(on) => toggle("antiPostChannel", on)}
    onlist={(kind, ids) =>
      setList("antiPostChannel", kind, ids, (id, added) =>
        kind === "channels"
          ? added
            ? protectionApi.addAntiPostChannel(guildId, BigInt(id))
            : protectionApi.removeAntiPostChannel(guildId, BigInt(id))
          : kind === "ignoredRoles"
            ? protectionApi.toggleAntiPostChannelIgnoredRole(guildId, BigInt(id))
            : protectionApi.toggleAntiPostChannelIgnoredUser(guildId, BigInt(id))
      )}
  />
  <PatternCard
    {guildId}
    status={status.antiPattern}
    {roles}
    {notify}
    onpatch={(c, mode) => patch("antiPattern", c, mode)}
    ontoggle={(on) => toggle("antiPattern", on)}
  />
  <ImageHashCard
    {guildId}
    status={status.antiImageHash}
    {roles}
    {notify}
    onreload={load}
    onpatch={(c, mode) => patch("antiImageHash", c, mode)}
    ontoggle={(on) => toggle("antiImageHash", on)}
  />
  <ExternalAppCard status={status.antiExternalApp} {roles} onpatch={(c, mode) => patch("antiExternalApp", c, mode)} ontoggle={(on) => toggle("antiExternalApp", on)} />
  <AutomodRulesSection {guildId} {channels} {roles} {autoSave} {notify} />
{/if}
