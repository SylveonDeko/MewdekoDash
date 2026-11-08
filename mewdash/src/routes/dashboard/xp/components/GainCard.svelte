<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GuildXpSetting } from "$lib/api/xp/models/index.ts";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingsGroup from "./SettingsGroup.svelte";
  import NumberField from "./NumberField.svelte";
  import { MAX_MESSAGE_XP, MAX_VOICE_XP, type SettingsPatch } from "./xpModel";

  interface Props {
    settings: GuildXpSetting;
    onpatch: SettingsPatch;
  }

  let { settings, onpatch }: Props = $props();

  let voiceOpen = $state(false);

  const curves = $derived([
    { id: "0", name: m.common.default() },
    { id: "1", name: m.common.linear() },
    { id: "2", name: m.common.quadratic() },
    { id: "3", name: m.common.exponential() },
    { id: "5", name: m.common.legacy() },
    { id: "6", name: m.xp.curveSteps({ number: 1 }) },
    { id: "7", name: m.xp.curveSteps({ number: 2 }) },
    { id: "8", name: m.xp.curveSteps({ number: 3 }) }
  ]);
</script>

<PluginCard
  title={m.xp.cardGainTitle()}
  enabled={!settings.xpGainDisabled}
  onToggle={(on) => onpatch({ xpGainDisabled: !on }, "now")}
>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="xp-per-message"
      label={m.xp.xpPerMessage()}
      min={1}
      max={MAX_MESSAGE_XP}
      value={settings.xpPerMessage}
      onchange={(value) => onpatch({ xpPerMessage: value ?? 1 }, "typing")}
    />
    <NumberField
      id="xp-cooldown"
      label={m.xp.messageCooldown()}
      value={settings.messageXpCooldown}
      onchange={(value) => onpatch({ messageXpCooldown: value ?? 0 }, "typing")}
    />
    <NumberField
      id="xp-multiplier"
      label={m.xp.serverMultiplier()}
      min={0.1}
      decimal
      value={settings.xpMultiplier}
      onchange={(value) => onpatch({ xpMultiplier: value ?? 1 }, "typing")}
    />
    <SettingField label={m.xp.levelCurve()} hint={m.xp.levelCurveHint()} id="xp-curve">
      <DiscordSelector
        id="xp-curve"
        type="custom"
        options={curves}
        selected={String(settings.xpCurveType)}
        searchable={false}
        clearable={false}
        customIcon="fa-layer-group"
        onchange={({ selected }) => onpatch({ xpCurveType: Number(selected) }, "now")}
      />
    </SettingField>
  </div>

  <SettingsGroup title={m.xp.groupVoice()} bind:open={voiceOpen} count={settings.voiceXpPerMinute > 0 ? 1 : 0}>
    <div class="grid gap-4 sm:grid-cols-2">
      <NumberField
        id="xp-voice-per-minute"
        label={m.xp.voiceXpPerMinute()}
        max={MAX_VOICE_XP}
        value={settings.voiceXpPerMinute}
        onchange={(value) => onpatch({ voiceXpPerMinute: value ?? 0 }, "typing")}
      />
      <NumberField
        id="xp-voice-timeout"
        label={m.xp.voiceTimeout()}
        min={1}
        value={settings.voiceXpTimeout}
        onchange={(value) => onpatch({ voiceXpTimeout: value ?? 1 }, "typing")}
      />
    </div>
  </SettingsGroup>
</PluginCard>
