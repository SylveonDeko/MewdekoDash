<script lang="ts">
  import { m } from "$lib/i18n";
  import type { AutoModRuleKind } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import NumberField from "../NumberField.svelte";
  import type { Named, SaveMode } from "../automodModel";
  import ListField from "./ListField.svelte";
  import {
    DISCORD_LIMITS,
    KINDS,
    PRESETS,
    timeoutAllowed,
    type Rule,
    type RuleAction,
    type RulePatch
  } from "./discordModel";

  interface Props {
    rule: Rule;
    creating?: boolean;
    onpatch: (changes: RulePatch, mode?: SaveMode) => void;
    channels: Named[];
    roles: Named[];
    canModerate: boolean;
    counts: Record<AutoModRuleKind, number>;
  }

  let { rule, creating = false, onpatch, channels, roles, canModerate, counts }: Props = $props();

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  const kindLabels = $derived<Record<AutoModRuleKind, string>>({
    Keyword: m.automod.kindKeyword(),
    Spam: m.automod.kindSpam(),
    Preset: m.automod.kindPreset(),
    MentionSpam: m.automod.kindMention()
  });

  const presetLabels = $derived<Record<string, string>>({
    Profanity: m.automod.presetProfanity(),
    SexualContent: m.automod.presetSexual(),
    Slurs: m.automod.presetSlurs()
  });

  const kindOptions = $derived(
    KINDS.map((kind) => ({
      id: kind,
      name: `${kindLabels[kind]} (${counts[kind]} / ${DISCORD_LIMITS.rulesPerKind[kind]})`
    }))
  );

  const block = $derived(rule.actions.find((x) => x.kind === "BlockMessage"));
  const alert = $derived(rule.actions.find((x) => x.kind === "SendAlert"));
  const timeout = $derived(rule.actions.find((x) => x.kind === "Timeout"));

  function toggleAction(kind: RuleAction["kind"], on: boolean) {
    const present = rule.actions.some((x) => x.kind === kind);
    if (!on && rule.actions.length === 1 && present) return;
    const rest = rule.actions.filter((x) => x.kind !== kind);
    onpatch({
      actions: on
        ? [...rest, { kind, channelId: null, timeoutSeconds: kind === "Timeout" ? 3600 : null, customMessage: "" }]
        : rest
    });
  }

  function changeAction(kind: RuleAction["kind"], changes: Partial<RuleAction>, mode: SaveMode = "now") {
    onpatch({ actions: rule.actions.map((x) => (x.kind === kind ? { ...x, ...changes } : x)) }, mode);
  }

  function togglePreset(name: string, on: boolean) {
    const next = PRESETS.filter((x) => (x === name ? on : rule.presets.includes(x)));
    onpatch({ presets: next });
  }
</script>

<SettingField label={m.common.name()} id="rule-name">
  <input
    id="rule-name"
    type="text"
    value={rule.name}
    maxlength={DISCORD_LIMITS.name}
    class="w-full p-3 rounded-lg border min-h-[50px]"
    style={field}
    oninput={(e) => onpatch({ name: e.currentTarget.value }, "typing")}
  >
</SettingField>

{#if creating}
  <SettingField label={m.automod.kind()} id="rule-kind">
    <DiscordSelector
      id="rule-kind"
      type="custom"
      options={kindOptions}
      selected={rule.kind}
      searchable={false}
      clearable={false}
      customIcon="fa-shield-halved"
      onchange={({ selected }) => onpatch({ kind: selected as AutoModRuleKind })}
    />
  </SettingField>
{/if}

{#if rule.kind === "Keyword"}
  <ListField
    id="rule-keywords"
    label={m.automod.keywords()}
    items={rule.keywords}
    max={DISCORD_LIMITS.keywords}
    maxLength={DISCORD_LIMITS.keywordLength}
    onchange={(items) => onpatch({ keywords: items })}
  />
  <ListField
    id="rule-regex"
    label={m.automod.regex()}
    items={rule.regexPatterns}
    max={DISCORD_LIMITS.regex}
    maxLength={DISCORD_LIMITS.regexLength}
    mono
    onchange={(items) => onpatch({ regexPatterns: items })}
  />
{/if}

{#if rule.kind === "Preset"}
  <div class="grid gap-2 sm:grid-cols-3">
    {#each PRESETS as preset (preset)}
      <ToggleRow
        checked={rule.presets.includes(preset)}
        title={presetLabels[preset]}
        colors={$colorStore}
        onchange={(on) => togglePreset(preset, on)}
      />
    {/each}
  </div>
{/if}

{#if rule.kind === "Keyword" || rule.kind === "Preset"}
  <ListField
    id="rule-allow"
    label={m.automod.allowList()}
    items={rule.allowList}
    max={rule.kind === "Keyword" ? DISCORD_LIMITS.allowKeyword : DISCORD_LIMITS.allowPreset}
    maxLength={DISCORD_LIMITS.keywordLength}
    onchange={(items) => onpatch({ allowList: items })}
  />
{/if}

{#if rule.kind === "MentionSpam"}
  <NumberField
    id="rule-mentions"
    label={m.automod.mentionLimit()}
    min={1}
    max={DISCORD_LIMITS.mentions}
    value={rule.mentionLimit}
    onchange={(value) => onpatch({ mentionLimit: value }, "typing")}
  />
  <ToggleRow
    checked={rule.mentionRaidProtection}
    title={m.automod.mentionRaid()}
    colors={$colorStore}
    onchange={(on) => onpatch({ mentionRaidProtection: on })}
  />
{/if}

<div class="space-y-2">
  <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.automod.actions()}</h4>

  <ToggleRow checked={Boolean(block)} title={m.automod.actionBlock()} colors={$colorStore} onchange={(on) => toggleAction("BlockMessage", on)} />
  {#if block}
    <SettingField label={m.automod.blockMessage()} id="rule-block-message">
      <textarea
        id="rule-block-message"
        rows="2"
        value={block.customMessage}
        maxlength={DISCORD_LIMITS.customMessage}
        class="w-full p-3 rounded-lg border"
        style={field}
        oninput={(e) => changeAction("BlockMessage", { customMessage: e.currentTarget.value }, "typing")}
      ></textarea>
    </SettingField>
  {/if}

  <ToggleRow checked={Boolean(alert)} title={m.automod.actionAlert()} colors={$colorStore} onchange={(on) => toggleAction("SendAlert", on)} />
  {#if alert}
    <SettingField label={m.common.channel()} id="rule-alert-channel">
      <DiscordSelector
        id="rule-alert-channel"
        type="channel"
        options={channels}
        selected={alert.channelId}
        clearable={false}
        onchange={({ selected }) => changeAction("SendAlert", { channelId: (selected as string) ?? null })}
      />
    </SettingField>
  {/if}

  {#if timeoutAllowed(rule.kind)}
    <ToggleRow
      checked={Boolean(timeout)}
      title={m.automod.actionTimeout()}
      subtitle={canModerate ? undefined : m.automod.needModerate()}
      colors={$colorStore}
      onchange={(on) => toggleAction("Timeout", on)}
    />
    {#if timeout}
      <NumberField
        id="rule-timeout"
        label={m.common.durationMinutes()}
        min={1}
        max={DISCORD_LIMITS.timeoutMinutes}
        value={Math.round((timeout.timeoutSeconds ?? 60) / 60)}
        onchange={(value) => changeAction("Timeout", { timeoutSeconds: value * 60 }, "typing")}
      />
    {/if}
  {/if}
</div>

<SettingField label="{m.automod.exemptRoles()} ({rule.exemptRoleIds.length} / {DISCORD_LIMITS.exemptRoles})" id="rule-exempt-roles">
  <DiscordSelector
    id="rule-exempt-roles"
    type="role"
    options={roles}
    selected={rule.exemptRoleIds}
    multiple
    placeholder={m.common.addARole()}
    onchange={({ selected }) => {
      const ids = Array.isArray(selected) ? selected : [];
      if (ids.length <= DISCORD_LIMITS.exemptRoles) onpatch({ exemptRoleIds: ids });
    }}
  />
</SettingField>

<SettingField label="{m.automod.exemptChannels()} ({rule.exemptChannelIds.length} / {DISCORD_LIMITS.exemptChannels})" id="rule-exempt-channels">
  <DiscordSelector
    id="rule-exempt-channels"
    type="channel"
    options={channels}
    selected={rule.exemptChannelIds}
    multiple
    placeholder={m.common.addAChannel()}
    onchange={({ selected }) => {
      const ids = Array.isArray(selected) ? selected : [];
      if (ids.length <= DISCORD_LIMITS.exemptChannels) onpatch({ exemptChannelIds: ids });
    }}
  />
</SettingField>
