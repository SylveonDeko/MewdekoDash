<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { protectionApi, type AutomodRuleName } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import { errorText, idString, type Named, type Notify, type SaveMode } from "../automodModel";
  import {
    FIELD_RANGES,
    RULE_ACTIONS,
    RULES,
    toAutomodRule,
    toRuleRequest,
    type AutomodRule,
    type RuleActionName,
    type RuleField
  } from "./rulesModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    roles: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  type Shared = { logChannelId: string | null; reviewChannelId: string | null; exemptRoleIds: string[]; exemptChannelIds: string[] };

  let { guildId, channels, roles, autoSave, notify }: Props = $props();

  let rules: AutomodRule[] = $state([]);
  let shared: Shared = $state({ logChannelId: null, reviewChannelId: null, exemptRoleIds: [], exemptChannelIds: [] });
  let loaded = $state(false);

  const titles = $derived<Record<AutomodRuleName, string>>({
    Caps: m.automod.ruleCaps(),
    Attachments: m.automod.ruleAttachments(),
    Emoji: m.automod.ruleEmoji(),
    Spoilers: m.automod.ruleSpoilers(),
    Zalgo: m.automod.ruleZalgo(),
    Files: m.automod.ruleFiles(),
    Media: m.automod.ruleMedia(),
    ImageOnly: m.automod.ruleImageOnly(),
    VideoOnly: m.automod.ruleVideoOnly(),
    Commands: m.automod.ruleCommands()
  });

  const fieldLabels = $derived<Record<RuleField, string>>({
    minLength: m.automod.fieldMinLength(),
    capsPercent: m.automod.fieldCapsPercent(),
    maxAttachments: m.automod.fieldMaxAttachments(),
    windowSeconds: m.automod.windowSeconds(),
    maxEmojis: m.automod.fieldMaxEmojis(),
    maxSpoilers: m.automod.fieldMaxSpoilers(),
    zalgoThreshold: m.automod.fieldZalgo()
  });

  const actionLabels = $derived<Record<RuleActionName, string>>({
    delete: m.automod.actionDelete(),
    warn: m.common.warn(),
    timeout: m.common.timeout(),
    mute: m.common.actionMute(),
    kick: m.common.actionKick(),
    ban: m.common.actionBan(),
    message: m.automod.ruleActionMessage(),
    dm: m.automod.ruleActionDm(),
    review: m.automod.ruleActionReview()
  });

  const actionOptions = $derived(
    RULE_ACTIONS.filter((x) => x !== "review" || shared.reviewChannelId).map((id) => ({ id, name: actionLabels[id] }))
  );

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function load() {
    try {
      const [loadedRules, loadedShared] = await Promise.all([
        protectionApi.getAutomodRules(guildId),
        protectionApi.getAutomodSettings(guildId)
      ]);
      rules = RULES.map(({ rule }) => loadedRules.find((x) => x.rule === rule)).filter((x) => x !== undefined).map(toAutomodRule);
      shared = {
        logChannelId: loadedShared.logChannelId ? idString(loadedShared.logChannelId) : null,
        reviewChannelId: loadedShared.reviewChannelId ? idString(loadedShared.reviewChannelId) : null,
        exemptRoleIds: loadedShared.exemptRoleIds.map(idString),
        exemptChannelIds: loadedShared.exemptChannelIds.map(idString)
      };
    } catch (err) {
      logger.error("Failed to load automod rules:", err);
      notify(errorText(err, m.automod.errorLoad()), "error");
    } finally {
      loaded = true;
    }
  }

  function patch(name: AutomodRuleName, changes: Partial<AutomodRule>, mode: SaveMode = "now") {
    rules = rules.map((x) => (x.rule === name ? { ...x, ...changes } : x));
    const send = async () => {
      const current = rules.find((x) => x.rule === name);
      if (!current || (current.enabled && current.actions.length === 0)) return;
      try {
        await protectionApi.configureAutomodRule(guildId, name, toRuleRequest(current));
      } catch (err) {
        await load();
        throw err;
      }
    };
    const key = `automod-rule:${name}`;
    if (mode === "typing") autoSave.schedule(key, send);
    else void autoSave.now(key, send);
  }

  function toggle(rule: AutomodRule, enabled: boolean) {
    patch(rule.rule, { enabled, actions: enabled && rule.actions.length === 0 ? ["delete"] : rule.actions });
  }

  function setNumber(rule: AutomodRule, key: RuleField, value: number) {
    patch(rule.rule, { numbers: { ...rule.numbers, [key]: value } }, "typing");
  }

  function changeShared(changes: Partial<Shared>) {
    shared = { ...shared, ...changes };
    void autoSave.now("automod-settings", async () => {
      try {
        await protectionApi.updateAutomodSettings(guildId, {
          logChannelId: shared.logChannelId ? BigInt(shared.logChannelId) : 0,
          reviewChannelId: shared.reviewChannelId ? BigInt(shared.reviewChannelId) : 0,
          exemptRoleIds: shared.exemptRoleIds.map((x) => BigInt(x)),
          exemptChannelIds: shared.exemptChannelIds.map((x) => BigInt(x))
        });
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  const list = (selected: unknown): string[] => (Array.isArray(selected) ? selected : []);

  onMount(() => {
    void load();
  });
</script>

{#if loaded}
  <PluginCard title={m.automod.sharedTitle()} alwaysOpen>
    <div class="grid gap-4 sm:grid-cols-2">
      <SettingField label={m.automod.sharedLog()} id="automod-log">
        <DiscordSelector
          id="automod-log"
          type="channel"
          options={channels}
          selected={shared.logChannelId}
          onchange={({ selected }) => changeShared({ logChannelId: (selected as string) ?? null })}
        />
      </SettingField>
      <SettingField label={m.automod.sharedReview()} id="automod-review">
        <DiscordSelector
          id="automod-review"
          type="channel"
          options={channels}
          selected={shared.reviewChannelId}
          onchange={({ selected }) => changeShared({ reviewChannelId: (selected as string) ?? null })}
        />
      </SettingField>
    </div>
    <SettingField label={m.automod.exemptRoles()} id="automod-exempt-roles">
      <DiscordSelector
        id="automod-exempt-roles"
        type="role"
        options={roles}
        selected={shared.exemptRoleIds}
        multiple
        placeholder={m.common.addARole()}
        onchange={({ selected }) => changeShared({ exemptRoleIds: list(selected) })}
      />
    </SettingField>
    <SettingField label={m.automod.exemptChannels()} id="automod-exempt-channels">
      <DiscordSelector
        id="automod-exempt-channels"
        type="channel"
        options={channels}
        selected={shared.exemptChannelIds}
        multiple
        placeholder={m.common.addAChannel()}
        onchange={({ selected }) => changeShared({ exemptChannelIds: list(selected) })}
      />
    </SettingField>
  </PluginCard>

  {#each rules as rule (rule.rule)}
    {@const config = RULES.find((x) => x.rule === rule.rule)}
    {@const id = `rule-${rule.rule}`}
    <PluginCard title={titles[rule.rule]} enabled={rule.enabled} onToggle={(on) => toggle(rule, on)}>
      {#if config && config.fields.length > 0}
        <div class="grid gap-4 sm:grid-cols-2">
          {#each config.fields as key (key)}
            <NumberField
              id="{id}-{key}"
              label={fieldLabels[key]}
              min={FIELD_RANGES[key][0]}
              max={FIELD_RANGES[key][1]}
              value={rule.numbers[key]}
              onchange={(value) => setNumber(rule, key, value)}
            />
          {/each}
        </div>
      {/if}

      {#if config?.media}
        <SettingField label={m.automod.ruleChannels()} id="{id}-media">
          <DiscordSelector
            id="{id}-media"
            type="channel"
            options={channels}
            selected={rule.mediaChannelIds}
            multiple
            placeholder={m.common.addAChannel()}
            onchange={({ selected }) => patch(rule.rule, { mediaChannelIds: list(selected) })}
          />
        </SettingField>
        <ToggleRow
          checked={rule.allowThreads}
          title={m.automod.ruleThreads()}
          colors={$colorStore}
          onchange={(on) => patch(rule.rule, { allowThreads: on })}
        />
      {/if}

      <SettingField label={m.automod.actions()} id="{id}-actions">
        <DiscordSelector
          id="{id}-actions"
          type="custom"
          options={actionOptions}
          selected={rule.actions}
          multiple
          searchable={false}
          customIcon="fa-bolt"
          onchange={({ selected }) => patch(rule.rule, { actions: list(selected) as RuleActionName[] })}
        />
      </SettingField>

      {#if rule.actions.includes("timeout") || rule.actions.includes("mute")}
        <NumberField
          id="{id}-minutes"
          label={m.common.durationMinutes()}
          min={1}
          max={40320}
          value={rule.actionMinutes}
          onchange={(value) => patch(rule.rule, { actionMinutes: value }, "typing")}
        />
      {/if}

      {#if rule.actions.includes("message")}
        <SettingField label={m.automod.ruleReply()} id="{id}-reply">
          <input
            id="{id}-reply"
            type="text"
            value={rule.actionMessage}
            class="w-full p-3 rounded-lg border min-h-[50px]"
            style={field}
            oninput={(e) => patch(rule.rule, { actionMessage: e.currentTarget.value }, "typing")}
          >
        </SettingField>
      {/if}

      <SettingField label={m.automod.exemptRoles()} id="{id}-roles">
        <DiscordSelector
          id="{id}-roles"
          type="role"
          options={roles}
          selected={rule.exemptRoleIds}
          multiple
          placeholder={m.common.addARole()}
          onchange={({ selected }) => patch(rule.rule, { exemptRoleIds: list(selected) })}
        />
      </SettingField>
      <SettingField label={m.automod.exemptChannels()} id="{id}-channels">
        <DiscordSelector
          id="{id}-channels"
          type="channel"
          options={channels}
          selected={rule.exemptChannelIds}
          multiple
          placeholder={m.common.addAChannel()}
          onchange={({ selected }) => patch(rule.rule, { exemptChannelIds: list(selected) })}
        />
      </SettingField>
    </PluginCard>
  {/each}
{/if}
