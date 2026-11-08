<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { moderationApi, PunishmentAction, type WarningPunishment } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    guildId: bigint;
    channels: Array<{ id: string; name: string }>;
    roles: Array<{ id: string; name: string; color?: number }>;
    autoSave: AutoSave;
    onerror: (message: string) => void;
  }

  let { guildId, channels, roles, autoSave, onerror }: Props = $props();

  let punishments: WarningPunishment[] = $state([]);
  let warnlogChannelId: string | null = $state(null);
  let busy = $state(false);
  let formError = $state("");
  let pendingRemove: number | null = $state(null);
  let draft = $state({ count: 3, punishment: PunishmentAction.Mute.toString(), timeMinutes: null as number | null, roleId: null as string | null });

  const options = $derived([
    { id: PunishmentAction.Mute.toString(), name: m.common.actionMute() },
    { id: PunishmentAction.ChatMute.toString(), name: m.features.wizardPun5() },
    { id: PunishmentAction.VoiceMute.toString(), name: m.features.wizardPun6() },
    { id: PunishmentAction.Timeout.toString(), name: m.common.timeout() },
    { id: PunishmentAction.Kick.toString(), name: m.common.actionKick() },
    { id: PunishmentAction.Softban.toString(), name: m.features.wizardPun3() },
    { id: PunishmentAction.Ban.toString(), name: m.common.actionBan() },
    { id: PunishmentAction.AddRole.toString(), name: m.common.addRole() },
    { id: PunishmentAction.RemoveRoles.toString(), name: m.common.removeAllRoles() }
  ]);

  const timed = new Set([
    PunishmentAction.Mute, PunishmentAction.ChatMute, PunishmentAction.VoiceMute,
    PunishmentAction.Timeout, PunishmentAction.Ban, PunishmentAction.AddRole
  ]);

  const isTimed = $derived(timed.has(parseInt(draft.punishment)));
  const needsRole = $derived(parseInt(draft.punishment) === PunishmentAction.AddRole);
  const inputStyle = $derived(
    `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  const byCount = (list: WarningPunishment[]) => list.slice().sort((a, b) => a.count - b.count);

  function describe(p: WarningPunishment): string {
    const parts = [options.find(o => o.id === p.punishment.toString())?.name ?? p.punishmentName];
    if (p.punishment === PunishmentAction.AddRole && p.roleId) {
      parts.push(`@${roles.find(r => r.id === p.roleId?.toString())?.name ?? p.roleId}`);
    }
    if (p.time > 0) {
      parts.push(
        p.time >= 1440
          ? m.moderation.durationDays({ count: Math.round(p.time / 1440) })
          : p.time >= 60
            ? m.moderation.durationHours({ count: Math.round(p.time / 60) })
            : m.moderation.durationMinutes({ count: p.time })
      );
    }
    return parts.join(" ");
  }

  async function load() {
    try {
      const [list, channel] = await Promise.all([
        moderationApi.getWarningPunishments(guildId).catch(() => []),
        moderationApi.getWarnlogChannel(guildId).catch(() => null)
      ]);
      punishments = byCount(list || []);
      warnlogChannelId = channel?.channelId && channel.channelId.toString() !== "0" ? channel.channelId.toString() : null;
    } catch (err) {
      logger.error("Failed to load punishment settings:", err);
    }
  }

  async function add() {
    formError = "";
    if (!draft.count || draft.count < 1) {
      formError = m.moderation.punishMinCount();
      return;
    }
    if (needsRole && !draft.roleId) {
      formError = m.moderation.punishChooseRole();
      return;
    }
    busy = true;
    try {
      punishments = byCount(await moderationApi.setWarningPunishment(guildId, {
        count: draft.count,
        punishment: parseInt(draft.punishment),
        timeMinutes: isTimed ? draft.timeMinutes || null : null,
        roleId: needsRole && draft.roleId ? BigInt(draft.roleId) : null
      }));
      draft = { ...draft, count: draft.count + 1, timeMinutes: null };
    } catch (err: any) {
      logger.error("Failed to save punishment:", err);
      formError = err?.message || m.moderation.punishSaveFailed();
    } finally {
      busy = false;
    }
  }

  async function remove(count: number) {
    busy = true;
    try {
      punishments = byCount(await moderationApi.removeWarningPunishment(guildId, count));
    } catch (err) {
      logger.error("Failed to remove punishment:", err);
      onerror(m.moderation.errorRemovePunishment());
    } finally {
      busy = false;
    }
  }

  function saveWarnlog(channelId: string | null) {
    if (!channelId) return;
    const previous = warnlogChannelId;
    warnlogChannelId = channelId;
    return autoSave.now("warnlogChannel", async () => {
      try {
        await moderationApi.setWarnlogChannel(guildId, BigInt(channelId));
      } catch (err) {
        warnlogChannelId = previous;
        throw err;
      }
    });
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.moderation.punishTitle()}>
  <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); void add(); }}>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <SettingField label={m.moderation.punishAtWarning()} id="punish-count">
        <input id="punish-count" type="number" min="1" max="100" bind:value={draft.count}
               class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
      </SettingField>
      <SettingField label={m.common.punishment()} id="punish-action">
        <DiscordSelector id="punish-action" type="custom" {options} selected={draft.punishment} searchable={false} clearable={false} customIcon="fa-shield-halved"
                         onchange={(e) => { if (typeof e.selected === "string") draft.punishment = e.selected; }} />
      </SettingField>
      {#if isTimed}
        <SettingField label={m.common.durationMinutes()} id="punish-minutes">
          <input id="punish-minutes" type="number" min="1" max="70560" bind:value={draft.timeMinutes} placeholder={m.common.permanent()}
                 class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
        </SettingField>
      {/if}
      {#if needsRole}
        <SettingField label={m.common.roleToAdd()} id="punish-role">
          <DiscordSelector id="punish-role" type="role" options={roles} selected={draft.roleId} placeholder={m.common.selectRolePlaceholder()}
                           onchange={(e) => { draft.roleId = typeof e.selected === "string" ? e.selected : null; }} />
        </SettingField>
      {/if}
    </div>
    {#if formError}
      <p class="text-sm" role="alert" style="color: {$colorStore.accent}">{formError}</p>
    {/if}
    <button
      type="submit"
      disabled={busy}
      class="px-6 rounded-xl font-medium flex items-center gap-2 min-h-[50px] disabled:opacity-50"
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.moderation.punishAddToLadder()}
    </button>
  </form>

  {#if punishments.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.punishEmpty()}</p>
  {:else}
    <ol class="space-y-2">
      {#each punishments as p (p.count)}
        <li class="flex items-center gap-4 p-3 rounded-xl border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="w-12 shrink-0 text-center" style="color: {$colorStore.text};">
            <div class="text-lg font-bold leading-none">{p.count}</div>
            <div class="text-[10px]" style="color: {$colorStore.muted}">{p.count === 1 ? m.moderation.punishUnitOne() : m.moderation.punishUnitOther()}</div>
          </div>
          <div class="flex-1 min-w-0 font-medium" style="color: {$colorStore.text}">{describe(p)}</div>
          <button
            class="px-3 rounded-lg text-sm min-h-[44px] disabled:opacity-50"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            disabled={busy}
            onclick={() => (pendingRemove = p.count)}
          >
            {m.common.remove()}
          </button>
        </li>
      {/each}
    </ol>
  {/if}

  <SettingField label={m.common.warningLogChannel()} id="warnlog-channel">
    <DiscordSelector id="warnlog-channel" type="channel" options={channels} selected={warnlogChannelId} placeholder={m.moderation.warnlogPlaceholder()}
                     onchange={(e) => saveWarnlog(typeof e.selected === "string" ? e.selected : null)} />
  </SettingField>
</PluginCard>

<ConfirmationModal
  isOpen={pendingRemove !== null}
  title={m.moderation.removePunishmentTitle()}
  message={pendingRemove !== null ? m.moderation.removePunishmentMessage({ count: pendingRemove }) : ""}
  confirmText={m.common.remove()}
  onconfirm={async () => {
    const target = pendingRemove;
    pendingRemove = null;
    if (target !== null) await remove(target);
  }}
  oncancel={() => (pendingRemove = null)}
/>
