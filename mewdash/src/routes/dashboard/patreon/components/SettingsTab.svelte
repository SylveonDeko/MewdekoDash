<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { patreonApi, type PatreonConfig, type PatreonConfigUpdateRequest } from "$lib/api/index.ts";
  import type { DiscordUser } from "$lib/types/discord";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import NumberField from "$lib/components/plugin/NumberField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, hasId, idString, type Named, type Notify } from "./patreonModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    notify: Notify;
  }

  let { guildId, channels, autoSave, user = null, notify }: Props = $props();

  let config: PatreonConfig | null = $state(null);
  let confirmed: PatreonConfig | null = null;
  let announcing = $state(false);

  const placeholders = $derived(
    [
      ["%month%", m.placeholders.month()],
      ["%year%", m.placeholders.timeYear()],
      ["%patreon.link%", m.placeholders.patreonLink()],
      ["%patron.name%", m.placeholders.patronName()],
      ["%patron.tier%", m.placeholders.patronTier()],
      ["%patron.amount%", m.placeholders.patronAmount()],
      ["%supporter.count%", m.placeholders.supporterCount()],
      ["%supporter.total%", m.placeholders.supporterTotal()],
      ["%supporter.new%", m.placeholders.supporterNew()],
      ["%supporter.former%", m.placeholders.supporterFormer()],
      ["%supporter.linked%", m.placeholders.supporterLinked()],
      ["%revenue.monthly%", m.placeholders.revenueMonthly()],
      ["%revenue.average%", m.placeholders.revenueAverage()],
      ["%revenue.lifetime%", m.placeholders.revenueLifetime()],
      ["%tiers.count%", m.placeholders.tiersCount()],
      ["%tier.popular%", m.placeholders.tierPopular()],
      ["%tier.popular.count%", m.placeholders.tierPopularCount()],
      ["%supporters.summary%", m.placeholders.supportersSummary()],
      ["%revenue.summary%", m.placeholders.revenueSummary()],
      ["%growth.summary%", m.placeholders.growthSummary()]
    ].map(([name, description]) => ({ category: m.patreon.placeholderCategory(), name, description }))
  );

  async function load() {
    try {
      const loaded = await patreonApi.getPatreonConfig(guildId);
      config = { ...loaded };
      confirmed = { ...loaded };
    } catch (err) {
      logger.error("Failed to load Patreon settings:", err);
      notify(errorText(err, m.patreon.errorLoadSettings()), "error");
    }
  }

  /**
   * Shows a change and saves it, putting the fields back if the save fails.
   * @param key The save's name
   * @param changes The settings that changed
   * @param request What the bot is told
   * @param mode Whether to save now or once typing stops
   */
  function patch(key: string, changes: Partial<PatreonConfig>, request: PatreonConfigUpdateRequest, mode: "now" | "typing") {
    if (!config || !confirmed) return;
    const current = config;
    const known = confirmed;
    const previous = { ...known };
    Object.assign(current, changes);
    const save = async () => {
      try {
        const result = await patreonApi.updatePatreonConfig(guildId, request);
        Object.assign(known, changes);
        if (mode === "now") {
          current.patreonEnabled = known.patreonEnabled = result.patreonEnabled;
          current.patreonRoleSync = known.patreonRoleSync = result.patreonRoleSync;
          current.patreonChannelId = known.patreonChannelId = result.patreonChannelId;
        }
      } catch (err) {
        if (mode === "now") {
          for (const field of Object.keys(changes) as (keyof PatreonConfig)[]) {
            (current as unknown as Record<string, unknown>)[field] = previous[field];
          }
        }
        throw err;
      }
    };
    if (mode === "now") void autoSave.now(key, save);
    else autoSave.schedule(key, save);
  }

  async function announce() {
    announcing = true;
    try {
      const result = await patreonApi.triggerPatreonOperation(guildId, { operation: "manual_announcement" });
      notify(result.message);
    } catch (err) {
      logger.error("Failed to send the announcement:", err);
      notify(errorText(err, m.patreon.notifyAnnounceFailed()), "error");
    } finally {
      announcing = false;
    }
  }

  onMount(() => {
    void load();
  });
</script>

<div class="space-y-4 min-w-0" onfocusout={() => autoSave.flush()}>
  {#if config}
    <PluginCard
      title={m.patreon.announcementsTitle()}
      enabled={config.patreonEnabled}
      onToggle={(on) => patch("enabled", { patreonEnabled: on }, { announcementsEnabled: on }, "now")}
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <SettingField label={m.patreon.settingsChannel()} id="patreon-channel">
          <DiscordSelector
            id="patreon-channel"
            type="channel"
            options={channels}
            selected={hasId(config.patreonChannelId) ? idString(config.patreonChannelId) : null}
            placeholder={m.common.selectAChannelPlaceholder()}
            onchange={({ selected }) => {
              const id = typeof selected === "string" && selected ? selected : null;
              patch("channel", { patreonChannelId: BigInt(id ?? 0) }, { channelId: BigInt(id ?? 0) }, "now");
            }}
          />
        </SettingField>
        <NumberField
          id="patreon-day"
          label={m.patreon.settingsDay()}
          min={1}
          max={28}
          value={config.patreonAnnouncementDay || 1}
          onchange={(value) => {
            const day = value ?? 1;
            patch("day", { patreonAnnouncementDay: day }, { announcementDay: day }, "typing");
          }}
        />
      </div>

      <MessageField
        value={config.patreonMessage}
        previewTitle={m.patreon.settingsPreviewTitle()}
        icon="fa-heart"
        {user}
        {placeholders}
        placeholder={m.patreon.settingsMessagePlaceholder()}
        onchange={(message) => patch("message", { patreonMessage: message || null }, { message }, "typing")}
      />

      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              disabled={announcing || !hasId(config.patreonChannelId)} onclick={announce}>
        <i class="fa-solid fa-bullhorn" aria-hidden="true"></i>
        {m.patreon.actionAnnounce()}
      </button>
    </PluginCard>

    <PluginCard
      title={m.patreon.roleSyncTitle()}
      enabled={config.patreonRoleSync}
      onToggle={(on) => patch("roleSync", { patreonRoleSync: on }, { roleSyncEnabled: on }, "now")}
    >
      <p class="text-sm" style="color: {$colorStore.muted}">{m.patreon.roleSyncHint()}</p>
    </PluginCard>
  {/if}
</div>
