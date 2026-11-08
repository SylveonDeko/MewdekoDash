<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { moderationApi, type PunishDms } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";

  interface Props {
    guildId: bigint;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onerror: (message: string) => void;
  }

  let { guildId, autoSave, user = null, onerror }: Props = $props();

  const names = ["Warn", "Mute", "Timeout", "Kick", "Ban", "Softban"];

  let dms: PunishDms = $state({});
  let action = $state("Warn");

  const options = $derived(names.map(name => ({ id: name, name })));
  const current = $derived(dms[action] ?? null);

  const placeholders = $derived([
    { category: m.moderation.dmsPlaceholderCategory(), name: "%user%", description: m.moderation.dmsPlaceholderUser() },
    { category: m.moderation.dmsPlaceholderCategory(), name: "%reason%", description: m.moderation.dmsPlaceholderReason() },
    { category: m.moderation.dmsPlaceholderCategory(), name: "%mod%", description: m.moderation.dmsPlaceholderMod() },
    { category: m.moderation.dmsPlaceholderCategory(), name: "%duration%", description: m.moderation.dmsPlaceholderDuration() },
    { category: m.moderation.dmsPlaceholderCategory(), name: "%case%", description: m.moderation.dmsPlaceholderCase() },
    { category: m.moderation.dmsPlaceholderCategory(), name: "%server%", description: m.placeholders.server() }
  ]);

  async function load() {
    try {
      dms = await moderationApi.getPunishDms(guildId);
    } catch (err) {
      logger.error("Failed to load punishment DMs:", err);
      onerror(m.moderation.dmsLoadFailed());
    }
  }

  function save(template: string) {
    const target = action;
    const previous = dms;
    if (!template.trim()) return;
    dms = { ...dms, [target]: template };
    return autoSave.now(`punishDm:${target}`, async () => {
      try {
        await moderationApi.setPunishDm(guildId, target, template);
      } catch (err) {
        dms = previous;
        throw err;
      }
    });
  }

  function reset() {
    const target = action;
    const previous = dms;
    dms = { ...dms, [target]: null };
    return autoSave.now(`punishDm:${target}`, async () => {
      try {
        await moderationApi.resetPunishDm(guildId, target);
      } catch (err) {
        dms = previous;
        throw err;
      }
    });
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.moderation.dmsTitle()}>
  <SettingField label={m.common.punishment()} id="punish-dm-action">
    <DiscordSelector id="punish-dm-action" type="custom" {options} selected={action} searchable={false} clearable={false} customIcon="fa-shield-halved"
                     onchange={(e) => { if (typeof e.selected === "string") action = e.selected; }} />
  </SettingField>

  {#key action}
    <MessageField
      value={current}
      {placeholders}
      {user}
      icon="fa-envelope"
      previewTitle={m.moderation.dmsPreviewTitle({ action })}
      onchange={save}
    />
  {/key}

  {#if current}
    <button
      class="px-6 rounded-xl min-h-[50px]"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={reset}
    >
      {m.moderation.dmsReset()}
    </button>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.dmsDefault()}</p>
  {/if}
</PluginCard>
