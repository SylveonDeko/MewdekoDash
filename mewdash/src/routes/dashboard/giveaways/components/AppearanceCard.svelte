<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { GiveawaySettings } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    settings: GiveawaySettings;
    roles: Array<{ id: string; name: string; color?: number }>;
    emojis: GuildEmojiInfo[];
    onchange: (patch: Partial<GiveawaySettings>, typing?: boolean) => void;
  }

  let { settings, roles, emojis, onchange }: Props = $props();

  const HEX = /^#?([0-9a-f]{6})$/i;

  let colorText = $state(untrack(() => settings.embedColor ?? ""));
  let bannerText = $state(untrack(() => settings.banner ?? ""));

  const colorValid = $derived(colorText.trim() === "" || HEX.test(colorText.trim()));
  const bannerValid = $derived(bannerText.trim() === "" || /^https?:\/\/\S+$/i.test(bannerText.trim()));
  const swatch = $derived(HEX.test(colorText.trim()) ? `#${colorText.trim().replace("#", "")}` : "#000000");

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function setColor(value: string) {
    colorText = value;
    const trimmed = value.trim();
    if (trimmed === "") onchange({ embedColor: "" }, true);
    else if (HEX.test(trimmed)) onchange({ embedColor: `#${trimmed.replace("#", "")}` }, true);
  }

  function setBanner(value: string) {
    bannerText = value;
    if (bannerValid) onchange({ banner: value.trim() }, true);
  }
</script>

<PluginCard title={m.giveaways.cardAppearance()}>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.giveaways.settingEmote()} id="gw-default-emote">
      <EmojiPicker
        id="gw-default-emote"
        guildEmojis={emojis}
        selected={settings.emote}
        placeholder={m.common.selectEmojiPlaceholder()}
        onchange={(detail) => typeof detail.selected === "string" && detail.selected && onchange({ emote: detail.selected })}
      />
    </SettingField>

    <SettingField label={m.giveaways.settingPingRole()} id="gw-ping-role">
      <DiscordSelector
        id="gw-ping-role"
        type="role"
        options={roles}
        selected={settings.pingRole && String(settings.pingRole) !== "0" ? String(settings.pingRole) : null}
        placeholder={m.common.noPingRole()}
        onchange={(detail) => onchange({ pingRole: typeof detail.selected === "string" ? BigInt(detail.selected) : 0n })}
      />
    </SettingField>

    <SettingField label={m.giveaways.settingBanner()} id="gw-banner">
      <input
        id="gw-banner"
        type="url"
        value={bannerText}
        oninput={(e) => setBanner(e.currentTarget.value)}
        placeholder="https://"
        aria-invalid={!bannerValid}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {bannerValid ? `${$colorStore.primary}30` : '#ef4444'}; color: {$colorStore.text};"
      >
    </SettingField>

    <SettingField label={m.giveaways.settingColor()} id="gw-color">
      <div class="flex gap-3">
        <input
          type="color"
          value={swatch}
          oninput={(e) => setColor(e.currentTarget.value)}
          aria-label={m.giveaways.settingColor()}
          class="w-[50px] h-[50px] shrink-0 rounded-lg border p-1 cursor-pointer"
          style={inputStyle}
        >
        <input
          id="gw-color"
          type="text"
          value={colorText}
          oninput={(e) => setColor(e.currentTarget.value)}
          placeholder="#5865f2"
          aria-invalid={!colorValid}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {colorValid ? `${$colorStore.primary}30` : '#ef4444'}; color: {$colorStore.text};"
        >
      </div>
    </SettingField>
  </div>
</PluginCard>
