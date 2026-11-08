<script lang="ts">
  import { m } from "$lib/i18n";
  import type { AutoModEscalateAction, AutoModPunishAction } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import NumberField from "../NumberField.svelte";
  import type { Named, SaveMode } from "../automodModel";
  import { DISCORD_LIMITS, EMPTY_FOLLOW_UP, type FollowUp } from "./discordModel";

  interface Props {
    followUp: FollowUp | null;
    channels: Named[];
    onchange: (next: FollowUp, mode: SaveMode) => void;
  }

  let { followUp, channels, onchange }: Props = $props();

  const value = $derived(followUp ?? EMPTY_FOLLOW_UP);

  const punishOptions = $derived([
    { id: "None", name: m.common.none() },
    { id: "Timeout", name: m.common.timeout() },
    { id: "Mute", name: m.common.actionMute() }
  ]);
  const escalateOptions = $derived([
    { id: "None", name: m.common.none() },
    { id: "Kick", name: m.common.actionKick() },
    { id: "Ban", name: m.common.actionBan() }
  ]);

  function change(changes: Partial<FollowUp>, mode: SaveMode = "now") {
    onchange({ ...value, ...changes }, mode);
  }
</script>

<div class="space-y-4">
  <ToggleRow checked={value.warn} title={m.automod.followWarn()} colors={$colorStore} onchange={(on) => change({ warn: on })} />
  {#if value.warn}
    <SettingField label={m.common.reason()} id="follow-reason">
      <input
        id="follow-reason"
        type="text"
        value={value.warnReason}
        class="w-full p-3 rounded-lg border min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        oninput={(e) => change({ warnReason: e.currentTarget.value }, "typing")}
      >
    </SettingField>
  {/if}

  <div class="grid gap-4 sm:grid-cols-2">
    <SettingField label={m.automod.followPunish()} id="follow-punish">
      <DiscordSelector
        id="follow-punish"
        type="custom"
        options={punishOptions}
        selected={value.punishAction}
        searchable={false}
        clearable={false}
        customIcon="fa-bolt"
        onchange={({ selected }) => change({ punishAction: selected as AutoModPunishAction })}
      />
    </SettingField>
    {#if value.punishAction !== "None"}
      <NumberField
        id="follow-punish-minutes"
        label={m.common.durationMinutes()}
        min={1}
        max={value.punishAction === "Timeout" ? DISCORD_LIMITS.timeoutMinutes : 525600}
        value={value.punishMinutes}
        onchange={(minutes) => change({ punishMinutes: minutes }, "typing")}
      />
    {/if}
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <SettingField label={m.automod.followEscalate()} id="follow-escalate">
      <DiscordSelector
        id="follow-escalate"
        type="custom"
        options={escalateOptions}
        selected={value.escalateAction}
        searchable={false}
        clearable={false}
        customIcon="fa-bolt"
        onchange={({ selected }) => change({ escalateAction: selected as AutoModEscalateAction })}
      />
    </SettingField>
    {#if value.escalateAction !== "None"}
      <NumberField
        id="follow-hits"
        label={m.automod.followHits()}
        min={2}
        max={100}
        value={value.escalateHits}
        onchange={(hits) => change({ escalateHits: hits }, "typing")}
      />
      <NumberField
        id="follow-window"
        label={m.automod.followWindow()}
        min={1}
        max={43200}
        value={value.escalateWindowMinutes}
        onchange={(minutes) => change({ escalateWindowMinutes: minutes }, "typing")}
      />
    {/if}
  </div>

  <SettingField label={m.automod.followLog()} id="follow-log">
    <DiscordSelector
      id="follow-log"
      type="channel"
      options={channels}
      selected={value.logChannelId}
      onchange={({ selected }) => change({ logChannelId: (selected as string) ?? null })}
    />
  </SettingField>
</div>
