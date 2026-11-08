<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { administrationApi } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { DEFAULT_CURRENCY_EMOJI, LANGUAGES, type Patch, type Settings } from "./settingsModel";

  interface Props {
    guildId: bigint;
    settings: Settings;
    emojis: GuildEmojiInfo[];
    autoSave: AutoSave;
    onpatch: Patch;
  }

  let { guildId, settings, emojis, autoSave, onpatch }: Props = $props();

  type Timezone = { id: string; name: string; label: string; offset: string; value: string };

  let timezones: Timezone[] = $state([]);
  let timezone: string | null = $state(null);
  let confirmedTimezone: string | null = null;

  const languages = $derived([{ id: "", name: m.settings.pageLanguageDefault() }, ...LANGUAGES]);

  async function loadTimezone() {
    try {
      const [list, current] = await Promise.all([
        administrationApi.getTimezones(guildId).catch(() => []),
        administrationApi.getGuildTimezone(guildId).catch(() => null)
      ]);
      timezones = (list || []).map((tz) => ({
        id: tz.id,
        name: tz.displayName,
        label: tz.displayName,
        offset: tz.offset,
        value: tz.id
      }));
      timezone = confirmedTimezone = current || null;
    } catch (err) {
      logger.error("Failed to load the timezone:", err);
    }
  }

  function saveTimezone(timezoneId: string | null) {
    if (!timezoneId || timezoneId === timezone) return;
    timezone = timezoneId;
    void autoSave.now("timezone", async () => {
      try {
        await administrationApi.setGuildTimezone(guildId, { timezoneId });
        confirmedTimezone = timezoneId;
      } catch (err) {
        timezone = confirmedTimezone;
        throw err;
      }
    });
  }

  onMount(() => {
    void loadTimezone();
  });
</script>

<PluginCard title={m.settings.cardGeneral()} alwaysOpen>
  <div class="grid gap-4 sm:grid-cols-2">
    <SettingField label={m.common.commandPrefix()} id="settings-prefix">
      <input
        id="settings-prefix"
        type="text"
        value={settings.prefix}
        autocomplete="off"
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        oninput={(e) => {
          const value = e.currentTarget.value.trim();
          if (value) onpatch({ prefix: value }, "typing");
        }}
        onblur={(e) => {
          if (!e.currentTarget.value.trim()) e.currentTarget.value = settings.prefix;
        }}
      >
    </SettingField>
    <SettingField label={m.common.language()} id="settings-language">
      <DiscordSelector
        id="settings-language"
        type="custom"
        options={languages}
        selected={settings.locale}
        placeholder={m.settings.pageLanguageDefault()}
        customIcon="fa-language"
        onchange={({ selected }) => onpatch({ locale: typeof selected === "string" ? selected : "" }, "now")}
      />
    </SettingField>
    <SettingField label={m.common.serverTimezone()} id="settings-timezone">
      <DiscordSelector
        id="settings-timezone"
        type="timezone"
        options={timezones}
        selected={timezone}
        placeholder={timezones.length ? m.common.selectTimezonePlaceholder() : m.settings.pageTimezoneLoading()}
        disabled={timezones.length === 0}
        onchange={({ selected }) => saveTimezone(typeof selected === "string" ? selected : null)}
      />
    </SettingField>
    <SettingField label={m.settings.pageCurrencyTitle()} id="settings-currency">
      <EmojiPicker
        id="settings-currency"
        guildEmojis={emojis}
        selected={settings.currencyEmoji}
        onchange={({ selected }) =>
          onpatch({ currencyEmoji: typeof selected === "string" && selected ? selected : DEFAULT_CURRENCY_EMOJI }, "now")}
      />
    </SettingField>
  </div>
</PluginCard>
