<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { multiGreetApi, type MultiGreet, MultiGreetType } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { parseStoredMessage, serializeMessage } from "$lib/utils/embedMessage";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";

  interface Props {
    guildId: bigint;
    channels: Array<{ id: string; name: string }>;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onerror: (message: string) => void;
  }

  let { guildId, channels, autoSave, user = null, onerror }: Props = $props();

  let greets: MultiGreet[] = $state([]);
  let greetType: MultiGreetType = $state(MultiGreetType.Off);
  let lastMode = MultiGreetType.MultiGreet;
  let loading = $state(true);
  let selectedChannel: string | null = $state(null);
  let deleteTimes: Record<number, string> = $state({});
  let editWebhook: { id: number; name: string; avatarUrl: string } | null = $state(null);
  let editingId: number | null = $state(null);

  let sortedGreets = $derived([...greets].sort((a, b) => a.id - b.id));
  const editing = $derived(greets.find(greet => greet.id === editingId) ?? null);

  const modeOptions = $derived([
    { id: String(MultiGreetType.MultiGreet), name: m.multigreets.modeAll() },
    { id: String(MultiGreetType.RandomGreet), name: m.multigreets.modeRandom() }
  ]);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function channelTitle(id: bigint | string): string {
    const key = id.toString();
    const name = channels.find(channel => channel.id.toString() === key)?.name;
    return name ? `#${name}` : m.common.unknownChannel();
  }

  function summaryOf(greet: MultiGreet): string {
    const parsed = parseStoredMessage(greet.message);
    const embed = parsed.embeds[0];
    return parsed.content.trim() || embed?.title || embed?.description || "";
  }

  function badgesOf(greet: MultiGreet): string[] {
    const list: string[] = [];
    if (greet.webhookUrl) list.push(m.multigreets.webhook());
    if (greet.deleteTime) list.push(m.multigreets.rowDeletes({ seconds: greet.deleteTime }));
    if (greet.greetBots) list.push(m.common.greetBots());
    return list;
  }

  function toggleGreet(greet: MultiGreet, on: boolean) {
    void saveGreet(`disabled:${greet.id}`, () => multiGreetApi.updateMultiGreetDisabled(guildId, greet.id, !on));
  }

  function closeEditor() {
    if (editingId !== null) void autoSave.flush(`deleteTime:${editingId}`);
    editingId = null;
    editWebhook = null;
  }

  function secondsOf(greet: MultiGreet): string {
    return greet.deleteTime ? String(greet.deleteTime) : "";
  }

  async function fetchGreets(quiet = false) {
    try {
      if (!quiet) loading = true;
      greets = await multiGreetApi.getMultiGreets(guildId);
      deleteTimes = Object.fromEntries(greets.map(greet => [greet.id, secondsOf(greet)]));
      greetType = await multiGreetApi.getMultiGreetType(guildId);
      if (greetType !== MultiGreetType.Off) lastMode = greetType;
    } catch (err) {
      logger.error("Failed to fetch greets:", err);
      onerror(err instanceof Error ? err.message : m.multigreets.errorFetchGreets());
    } finally {
      loading = false;
    }
  }

  async function addGreet() {
    if (!selectedChannel) return;
    try {
      await multiGreetApi.addMultiGreet(guildId, BigInt(selectedChannel));
      selectedChannel = null;
      await fetchGreets(true);
    } catch (err) {
      onerror(err instanceof Error ? err.message : m.multigreets.errorAdd());
    }
  }

  async function removeGreet(id: number) {
    try {
      await multiGreetApi.removeMultiGreet(guildId, id);
      if (editingId === id) editingId = null;
      await fetchGreets(true);
    } catch (err) {
      onerror(err instanceof Error ? err.message : m.multigreets.errorRemove());
    }
  }

  function saveGreet(key: string, send: () => Promise<unknown>) {
    return autoSave.now(key, async () => {
      try {
        await send();
      } catch (err) {
        await fetchGreets(true);
        throw err;
      }
      await fetchGreets(true);
    });
  }

  function updateMessage(id: number, message: string) {
    return saveGreet(`message:${id}`, () => multiGreetApi.updateMultiGreetMessage(guildId, id, serializeMessage(message)));
  }

  function queueDeleteTime(id: number) {
    autoSave.schedule(`deleteTime:${id}`, () => multiGreetApi.updateMultiGreetDeleteTime(guildId, id, deleteTimes[id] ?? ""));
  }

  async function saveWebhook() {
    if (!editWebhook) return;
    const { id, name, avatarUrl } = editWebhook;
    try {
      await multiGreetApi.updateMultiGreetWebhook(guildId, id, { name, avatarUrl });
      editWebhook = null;
      await fetchGreets(true);
    } catch (err) {
      onerror(err instanceof Error ? err.message : m.multigreets.errorUpdateWebhook());
    }
  }

  function updateGreetType(type: MultiGreetType) {
    if (type === greetType) return;
    const previous = greetType;
    greetType = type;
    if (type !== MultiGreetType.Off) lastMode = type;
    void autoSave.now("greetType", async () => {
      try {
        await multiGreetApi.setMultiGreetType(guildId, type);
      } catch (err) {
        greetType = previous;
        throw err;
      }
    });
  }

  onMount(() => {
    void fetchGreets();
  });
</script>

<PluginCard
  title={m.multigreets.cardJoinTitle()}
  enabled={greetType !== MultiGreetType.Off}
  onToggle={(on) => updateGreetType(on ? lastMode : MultiGreetType.Off)}
>
  {#if loading}
    <div class="flex justify-center py-6">
      <div
        class="w-10 h-10 border-4 rounded-full animate-spin"
        style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"
      ></div>
    </div>
  {:else}
    <SettingField label={m.multigreets.modeLabel()} id="greet-mode">
      <DiscordSelector
        id="greet-mode"
        type="custom"
        options={modeOptions}
        selected={String(greetType)}
        searchable={false}
        clearable={false}
        customIcon="fa-arrow-right-arrow-left"
        onchange={(detail) => typeof detail.selected === "string" && updateGreetType(Number(detail.selected) as MultiGreetType)}
      />
    </SettingField>

    <SettingField label={m.multigreets.addTitle()} id="greet-add-channel">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="grow">
          <DiscordSelector
            id="greet-add-channel"
            type="channel"
            options={channels}
            selected={selectedChannel}
            placeholder={m.common.selectAChannelPlaceholder()}
            onchange={(detail) => (selectedChannel = typeof detail.selected === "string" ? detail.selected : null)}
          />
        </div>
        <button
          class="flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          disabled={!selectedChannel}
          onclick={addGreet}
        >
          <i class="fa-solid fa-plus" style="font-size: 16px;" aria-hidden="true"></i>
          {m.multigreets.actionAddGreet()}
        </button>
      </div>
    </SettingField>

    {#if !greets.length}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.multigreets.emptyTitle()}</p>
    {:else}
      <div>
        {#each sortedGreets as greet (greet.id)}
          {@const badges = badgesOf(greet)}
          <div class="flex items-center gap-2 sm:gap-3 py-2 border-t first:border-t-0" class:opacity-60={greet.disabled}
               style="border-color: {$colorStore.primary}20;">
            <label class="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer shrink-0">
              <input
                type="checkbox"
                class="sr-only peer"
                checked={!greet.disabled}
                aria-label={channelTitle(greet.channelId)}
                onchange={(e) => toggleGreet(greet, e.currentTarget.checked)}
              >
              <span
                class="w-11 h-6 rounded-full relative block peer-focus-visible:ring-2
                       after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
                       after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5"
                style="background: {greet.disabled ? `${$colorStore.primary}30` : $colorStore.primary};"
              ></span>
            </label>
            <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={() => (editingId = greet.id)}>
              <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{channelTitle(greet.channelId)}</span>
              <span class="block text-sm truncate" style="color: {$colorStore.muted}">{summaryOf(greet) || m.multigreets.rowNoText()}</span>
              {#if badges.length}
                <span class="flex flex-wrap gap-1.5 mt-1">
                  {#each badges as badge (badge)}
                    <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
                  {/each}
                </span>
              {/if}
            </button>
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                    aria-label={m.common.edit()} onclick={() => (editingId = greet.id)}>
              <i class="fa-solid fa-pen" aria-hidden="true"></i>
            </button>
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style="color: {$colorStore.muted}"
                    aria-label={m.multigreets.deleteAria()} onclick={() => removeGreet(greet.id)}>
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</PluginCard>

{#if editing}
  {@const greet = editing}
  <Sheet title={channelTitle(greet.channelId)} size="lg" onclose={closeEditor}>
    <div class="space-y-5">
      <MessageField
        value={typeof greet.message === "string" ? greet.message : serializeMessage(greet.message)}
        previewTitle={m.multigreets.previewTitle({ id: greet.id })}
        {user}
        card={{ guildId, target: "greet", ownerId: greet.id, autoSave, onerror }}
        onchange={(message) => updateMessage(greet.id, message)}
      />

      <SettingField label={m.common.deleteAfter()} id="greet-delete-{greet.id}">
        <input
          id="greet-delete-{greet.id}"
          type="text"
          bind:value={deleteTimes[greet.id]}
          oninput={() => queueDeleteTime(greet.id)}
          onblur={() => autoSave.flush(`deleteTime:${greet.id}`)}
          placeholder={m.multigreets.deleteTimePlaceholder()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>

      <SettingToggle
        id="greet-bots-{greet.id}"
        label={m.common.greetBots()}
        checked={greet.greetBots}
        onchange={(on) => saveGreet(`greetBots:${greet.id}`, () => multiGreetApi.updateMultiGreetGreetBots(guildId, greet.id, on))}
      />

      {#if editWebhook?.id === greet.id}
        <SettingField label={m.multigreets.webhook()} id="greet-webhook-name-{greet.id}">
          <div class="space-y-2">
            <input
              id="greet-webhook-name-{greet.id}"
              type="text"
              bind:value={editWebhook.name}
              placeholder={m.multigreets.webhookNamePlaceholder()}
              class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
              style={inputStyle}
            >
            <input
              type="text"
              aria-label={m.multigreets.webhookAvatarPlaceholder()}
              bind:value={editWebhook.avatarUrl}
              placeholder={m.multigreets.webhookAvatarPlaceholder()}
              class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
              style={inputStyle}
            >
            <div class="flex gap-2">
              <button
                class="flex-1 rounded-xl min-h-[50px] font-medium"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                onclick={saveWebhook}
              >
                {m.common.save()}
              </button>
              <button
                class="flex-1 rounded-xl min-h-[50px]"
                style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                onclick={() => (editWebhook = null)}
              >
                {m.common.cancel()}
              </button>
            </div>
          </div>
        </SettingField>
      {:else}
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm">
            <div class="font-medium" style="color: {$colorStore.text}">{m.multigreets.webhook()}</div>
            <div style="color: {$colorStore.muted}">{greet.webhookUrl ? m.common.configured() : m.common.notConfigured()}</div>
          </div>
          <button
            aria-label={m.multigreets.editWebhookAria()}
            class="p-2 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.muted}"
            onclick={() => (editWebhook = { id: greet.id, name: "", avatarUrl: "" })}
          >
            <i class="fa-solid fa-pen" style="font-size: 16px;" aria-hidden="true"></i>
          </button>
        </div>
      {/if}
    </div>
  </Sheet>
{/if}
