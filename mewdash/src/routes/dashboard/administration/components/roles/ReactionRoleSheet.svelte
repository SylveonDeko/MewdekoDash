<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, clientApi } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { userStore } from "$lib/stores/userStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";

  interface Props {
    guildId: bigint;
    roles: Named[];
    textChannels: Named[];
    existing: Array<{ messageId: bigint; reactionRoles: Array<{ emoteName: string }> }>;
    notify: Notify;
    user?: DiscordUser | null;
    onclose: () => void;
    ondone: () => void;
  }

  let { guildId, roles, textChannels, existing, notify, user = null, onclose, ondone }: Props = $props();

  const MAX_REACTIONS = 20;

  type Pair = { key: number; emoji: string | null; roleId: string | null };

  let nextKey = 1;
  let messageId = $state("");
  let channelId: string | null = $state(null);
  let exclusive = $state(false);
  let pairs: Pair[] = $state([{ key: 0, emoji: null, roleId: null }]);
  let guildEmojis: GuildEmojiInfo[] = $state([]);
  let busy = $state(false);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  const onMessage = $derived(existing.find(item => item.messageId.toString() === messageId.trim()) ?? null);
  const total = $derived(
    new Set([...pairs.map(p => p.emoji).filter(Boolean), ...(onMessage?.reactionRoles.map(r => r.emoteName) ?? [])]).size
  );
  const complete = $derived(pairs.filter(p => p.emoji && p.roleId));
  const valid = $derived(/^\d+$/.test(messageId.trim()) && !!channelId && complete.length > 0 && total <= MAX_REACTIONS);

  async function loadEmojis() {
    const id = user?.id ?? $userStore?.id;
    if (!id) return;
    try {
      guildEmojis = await clientApi.getEmojis(BigInt(id), true);
    } catch (err) {
      logger.error("Failed to load guild emojis:", err);
    }
  }

  function addPair() {
    pairs = [...pairs, { key: nextKey++, emoji: null, roleId: null }];
  }

  function removePair(key: number) {
    pairs = pairs.filter(p => p.key !== key);
  }

  async function save() {
    if (busy || !valid || !channelId) return;
    busy = true;
    try {
      await administrationApi.addReactionRoles(guildId, {
        messageId: BigInt(messageId.trim()),
        channelId: BigInt(channelId),
        exclusive,
        roles: complete.map(p => ({ emoteName: p.emoji as string, roleId: BigInt(p.roleId as string) }))
      });
      ondone();
    } catch (err) {
      logger.error("Failed to add reaction roles:", err);
      notify(errorText(err, m.administrationRoles.addFailed()), "error");
    } finally {
      busy = false;
    }
  }

  void loadEmojis();
</script>

<Sheet title={m.administrationRoles.reactionNew()} {onclose}>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <input
      type="text"
      inputmode="numeric"
      bind:value={messageId}
      placeholder={m.administrationRoles.reactionMessageId()}
      aria-label={m.administrationRoles.reactionMessageId()}
      class="min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
    <DiscordSelector
      type="channel"
      options={textChannels}
      selected={channelId}
      placeholder={m.common.selectChannelPlaceholder()}
      onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : null)}
    />
  </div>

  <ToggleRow
    checked={exclusive}
    title={m.administrationRoles.reactionExclusive()}
    subtitle={m.administrationRoles.reactionExclusiveHint()}
    colors={$colorStore}
    onchange={(value) => (exclusive = value)}
  />

  <div class="space-y-3">
    {#each pairs as pair (pair.key)}
      <div class="flex items-start gap-2">
        <div class="grow min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <EmojiPicker
            {guildEmojis}
            selected={pair.emoji}
            multiple={false}
            showUnicodeEmojis={true}
            placeholder={m.common.selectEmojiPlaceholder()}
            onchange={(detail) => (pair.emoji = typeof detail.selected === "string" ? detail.selected : null)}
          />
          <DiscordSelector
            type="role"
            options={roles}
            selected={pair.roleId}
            placeholder={m.common.selectARolePlaceholder()}
            onchange={(detail) => (pair.roleId = typeof detail.selected === "string" ? detail.selected : null)}
          />
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg min-h-[50px] min-w-[50px] disabled:opacity-50"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          aria-label={m.administrationRoles.reactionRemovePair()}
          disabled={pairs.length === 1}
          onclick={() => removePair(pair.key)}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {/each}

    <div class="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-4 rounded-xl min-h-[50px] disabled:opacity-50"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        disabled={total >= MAX_REACTIONS}
        onclick={addPair}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.administrationRoles.reactionAddPair()}
      </button>
      <div class="text-sm text-right" style="color: {total > MAX_REACTIONS ? $colorStore.text : $colorStore.muted}">
        <div>{m.administrationRoles.reactionPairCount({ total, max: MAX_REACTIONS })}</div>
        {#if onMessage}
          <div>{m.administrationRoles.reactionExisting({ count: onMessage.reactionRoles.length })}</div>
        {/if}
      </div>
    </div>
    {#if total > MAX_REACTIONS}
      <p class="text-sm" style="color: {$colorStore.text}">{m.administrationRoles.reactionErrorLimit({ max: MAX_REACTIONS })}</p>
    {/if}
  </div>

  {#snippet footer()}
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !valid}
      onclick={save}
    >
      {m.administrationRoles.reactionSave()}
    </button>
  {/snippet}
</Sheet>
