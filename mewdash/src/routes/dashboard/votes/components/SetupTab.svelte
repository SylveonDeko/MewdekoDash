<script lang="ts">
  import { m } from "$lib/i18n";
  import { votesApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import { randomPassword, type Named, type Notify } from "./votesModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    notify: Notify;
  }

  let { guildId, channels, autoSave, user = null, notify }: Props = $props();

  let loading = $state(true);
  let channelId: string | null = $state(null);
  let password = $state("");
  let message = $state("");
  let savedPassword = "";
  let savedMessage = "";
  let showPassword = $state(false);
  let messageVersion = $state(0);

  const placeholders = $derived([
    { category: m.votes.phCategory(), name: "%votestotalcount%", description: m.votes.phTotal() },
    { category: m.votes.phCategory(), name: "%votesmonthcount%", description: m.votes.phMonth() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user%", description: m.placeholders.user() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.id%", description: m.placeholders.userId() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.avatar%", description: m.placeholders.userAvatar() },
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() },
    { category: m.features.categoryServer(), name: "%server.members%", description: m.placeholders.serverMembers() }
  ]);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function unwrap(value: unknown): string {
    if (typeof value === "object" && value !== null && "data" in value) return String((value as { data: unknown }).data ?? "");
    return typeof value === "string" ? value : "";
  }

  async function load() {
    const results = await Promise.allSettled([
      votesApi.getVoteChannel(guildId),
      votesApi.getVotePassword(guildId),
      votesApi.getVoteMessage(guildId)
    ]);
    if (results[0].status === "fulfilled") {
      const value = results[0].value;
      channelId = value && String(value) !== "0" ? String(value) : null;
    }
    if (results[1].status === "fulfilled") password = savedPassword = unwrap(results[1].value);
    if (results[2].status === "fulfilled") message = savedMessage = unwrap(results[2].value);
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Failed to load vote settings:", result.reason);
        notify(m.votes.pageErrorLoad(), "error");
        break;
      }
    }
    loading = false;
  }

  function saveChannel(selected: string | string[] | null) {
    const next = typeof selected === "string" ? selected : null;
    const previous = channelId;
    channelId = next;
    autoSave.now("votes:channel", async () => {
      try {
        await votesApi.setVoteChannel(guildId, next ? BigInt(next) : BigInt(0));
      } catch (err) {
        channelId = previous;
        throw err;
      }
    });
  }

  function savePassword(value: string, immediate: boolean) {
    const save = async () => {
      try {
        await votesApi.setVotePassword(guildId, value);
        savedPassword = value;
      } catch (err) {
        password = savedPassword;
        throw err;
      }
    };
    if (immediate) autoSave.now("votes:password", save);
    else autoSave.schedule("votes:password", save);
  }

  function inputPassword() {
    if (!password) {
      autoSave.cancel("votes:password");
      return;
    }
    savePassword(password, false);
  }

  function blurPassword() {
    if (!password && savedPassword) {
      savePassword("", true);
      return;
    }
    void autoSave.flush("votes:password");
  }

  function generate() {
    password = randomPassword();
    showPassword = true;
    savePassword(password, true);
  }

  function saveMessage(next: string) {
    message = next;
    autoSave.schedule("votes:message", async () => {
      try {
        await votesApi.setVoteMessage(guildId, next);
        savedMessage = next;
      } catch (err) {
        message = savedMessage;
        messageVersion++;
        throw err;
      }
    });
  }

  function resetMessage() {
    const previous = savedMessage;
    message = "";
    messageVersion++;
    autoSave.now("votes:message", async () => {
      try {
        await votesApi.setVoteMessage(guildId, "");
        savedMessage = "";
      } catch (err) {
        message = previous;
        messageVersion++;
        throw err;
      }
    });
  }

  void load();
</script>

{#if loading}
  <div class="flex justify-center py-6">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{:else}
  <PluginCard title={m.votes.deliveryTitle()} alwaysOpen>
    <SettingField label={m.common.voteAnnouncementChannel()} id="vote-channel">
      <DiscordSelector
        id="vote-channel"
        type="channel"
        options={channels}
        selected={channelId}
        placeholder={m.common.noChannelSelected()}
        onchange={({ selected }) => saveChannel(selected)}
      />
    </SettingField>

    <SettingField label={m.votes.pageConfigPassword()} id="vote-password">
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          id="vote-password"
          type={showPassword ? "text" : "password"}
          autocomplete="off"
          bind:value={password}
          oninput={inputPassword}
          onblur={blurPassword}
          placeholder={m.votes.pageConfigPasswordPlaceholder()}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
        <div class="flex gap-2">
          <button
            type="button"
            class="grow sm:grow-0 px-4 rounded-lg min-h-[50px] text-sm font-medium"
            style={buttonStyle}
            aria-pressed={showPassword}
            onclick={() => (showPassword = !showPassword)}
          >
            {showPassword ? m.common.hide() : m.common.show()}
          </button>
          <button
            type="button"
            class="grow sm:grow-0 px-4 rounded-lg min-h-[50px] text-sm font-medium"
            style={buttonStyle}
            onclick={generate}
          >
            {m.votes.generate()}
          </button>
        </div>
      </div>
    </SettingField>
  </PluginCard>

  <PluginCard title={m.votes.pageMessageTitle()} alwaysOpen>
    {#key messageVersion}
      <MessageField
        value={message}
        previewTitle={m.votes.pageMessageTitle()}
        icon="fa-circle-check"
        {user}
        {placeholders}
        placeholder={m.votes.pageMessagePlaceholder()}
        onchange={saveMessage}
      />
    {/key}
    {#if message}
      <button
        type="button"
        class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
        style={buttonStyle}
        onclick={resetMessage}
      >
        {m.common.resetToDefault()}
      </button>
    {/if}
  </PluginCard>
{/if}
