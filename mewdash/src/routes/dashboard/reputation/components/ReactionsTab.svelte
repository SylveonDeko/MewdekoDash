<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { reputationApi } from "$lib/api/index.ts";
  import type { CustomRepType, ReactionRule } from "$lib/api/reputation/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import type { Notify } from "./repModel";

  interface Props {
    guildId: bigint;
    emojis: GuildEmojiInfo[];
    notify: Notify;
  }

  let { guildId, emojis, notify }: Props = $props();

  let rules = $state<ReactionRule[]>([]);
  let types = $state<CustomRepType[]>([]);
  let busy = $state(false);

  let emoji = $state<string | null>(null);
  let amount = $state(1);
  let repType = $state("standard");
  let typeName = $state("");
  let displayName = $state("");

  const typeOptions = $derived([
    { id: "standard", name: m.reputation.typeStandard() },
    ...types.map((t) => ({ id: t.typeName, name: t.displayName || t.typeName }))
  ]);
  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      [rules, types] = await Promise.all([
        reputationApi.getReactionRules(guildId),
        reputationApi.getCustomTypes(guildId)
      ]);
    } catch (err) {
      logger.error("Failed to load reaction rules:", err);
      notify(m.reputation.errorLoad(), "error");
    }
  }

  async function run(action: () => Promise<unknown>, failed: string): Promise<boolean> {
    busy = true;
    try {
      await action();
      await load();
      return true;
    } catch (err: any) {
      logger.error(failed, err);
      notify(err?.message || failed, "error");
      return false;
    } finally {
      busy = false;
    }
  }

  async function addRule() {
    if (!emoji) return;
    const ok = await run(() => reputationApi.addReactionRule(guildId, { emoji: emoji!, amount, repType }), m.reputation.errorSaveRule());
    if (ok) emoji = null;
  }

  async function addType() {
    if (!typeName.trim() || !displayName.trim()) return;
    const ok = await run(() => reputationApi.addCustomType(guildId, typeName.trim(), displayName.trim()), m.reputation.errorSaveType());
    if (ok) {
      typeName = "";
      displayName = "";
    }
  }

  onMount(() => {
    void load();
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.reputation.reactionsTitle()} alwaysOpen>
    {#each rules as rule (rule.emoji)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="text-lg shrink-0">{rule.emoji.startsWith("<") ? `:${rule.emojiName}:` : rule.emoji}</span>
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{rule.amount > 0 ? "+" : ""}{rule.amount} · {rule.repType}</span>
        <button
          type="button"
          class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
          style={iconButton}
          disabled={busy}
          aria-label="{m.common.delete()}: {rule.emojiName}"
          onclick={() => run(() => reputationApi.removeReactionRule(guildId, rule.emoji), m.reputation.errorSaveRule())}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.reputation.reactionsEmpty()}</p>
    {/each}

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
      <EmojiPicker guildEmojis={emojis} selected={emoji} ariaLabel={m.common.emoji()} onchange={({ selected }) => (emoji = typeof selected === "string" ? selected : null)} />
      <NumberField id="rep-rule-amount" label={m.reputation.reactionAmount()} value={amount} min={-100} onchange={(value) => (amount = value || 1)} />
      <DiscordSelector type="custom" options={typeOptions} selected={repType} searchable={false} clearable={false} customIcon="fa-tag" ariaLabel={m.common.type()} onchange={({ selected }) => (repType = String(selected))} />
    </div>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy || !emoji} onclick={addRule}>
      {m.common.add()}
    </button>
  </PluginCard>

  <PluginCard title={m.reputation.typesTitle()} alwaysOpen>
    {#each types as type (type.typeName)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{type.displayName} <span style="color: {$colorStore.muted}">({type.typeName})</span></span>
        <button
          type="button"
          class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
          style={iconButton}
          disabled={busy}
          aria-label="{m.common.delete()}: {type.displayName}"
          onclick={() => run(() => reputationApi.removeCustomType(guildId, type.typeName), m.reputation.errorSaveType())}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.reputation.typesEmpty()}</p>
    {/each}

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input type="text" class="w-full p-3 rounded-lg border min-h-[50px]" style={field} placeholder={m.reputation.typeNamePlaceholder()} aria-label={m.reputation.typeNamePlaceholder()} bind:value={typeName} />
      <input type="text" class="w-full p-3 rounded-lg border min-h-[50px]" style={field} placeholder={m.reputation.typeDisplayPlaceholder()} aria-label={m.reputation.typeDisplayPlaceholder()} bind:value={displayName} />
    </div>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy || !typeName.trim() || !displayName.trim()} onclick={addType}>
      {m.common.add()}
    </button>
  </PluginCard>
</div>
