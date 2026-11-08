<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { starboardApi } from "$lib/api/index.ts";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import EditorGroup from "./EditorGroup.svelte";
  import type { Named, SectionProps } from "../starboardModel";

  interface Props extends SectionProps {
    guildId: bigint;
    channels: Named[];
    placeholders: string[];
    user?: DiscordUser | null;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, starboard, change, channels, placeholders, user = null, onerror, onsuccess }: Props = $props();

  const describe: Record<string, () => string> = {
    "%star.author%": m.starboard.phAuthor,
    "%star.author.mention%": m.starboard.phAuthorMention,
    "%star.author.id%": m.starboard.phAuthorId,
    "%star.author.avatar%": m.starboard.phAuthorAvatar,
    "%star.content%": m.starboard.phContent,
    "%star.channel%": m.starboard.phChannel,
    "%star.channel.mention%": m.starboard.phChannelMention,
    "%star.channel.id%": m.starboard.phChannelId,
    "%star.link%": m.starboard.phLink,
    "%star.id%": m.starboard.phId,
    "%star.count%": m.starboard.phCount,
    "%star.emote%": m.starboard.phEmote,
    "%star.emotes%": m.starboard.phEmotes,
    "%star.attachments%": m.starboard.phAttachments,
    "%star.attachments.count%": m.starboard.phAttachmentsCount,
    "%star.image%": m.starboard.phImage,
    "%star.timestamp%": m.starboard.phTimestamp,
    "%server.name%": m.starboard.phServerName,
    "%server.id%": m.starboard.phServerId
  };

  const placeholderList = $derived(
    placeholders.map(name => ({
      category: name.startsWith("%server.") ? m.features.categoryServer() : m.starboard.phCategory(),
      name,
      description: describe[name]?.() ?? ""
    }))
  );

  let open = $state(false);
  let resetKey = $state(0);
  let testChannel = $state("");
  let testMessage = $state("");
  let testing = $state(false);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function reset() {
    change({ postDesign: null });
    resetKey++;
  }

  async function test() {
    if (!testChannel || testing) return;
    const raw = testMessage.trim();
    if (raw && !/^\d+$/.test(raw)) {
      onerror(m.starboard.testMessageInvalid());
      return;
    }
    testing = true;
    try {
      await starboardApi.sendDesignTest(guildId, starboard.id, BigInt(testChannel), raw ? BigInt(raw) : null);
      onsuccess(m.starboard.testSent());
    } catch (err) {
      logger.error("Failed to send design preview:", err);
      onerror(err instanceof Error && err.message ? err.message : m.starboard.testFailed());
    } finally {
      testing = false;
    }
  }
</script>

<EditorGroup title={m.starboard.groupDesign()} count={starboard.postDesign ? 1 : 0} bind:open>
  {#key resetKey}
    <MessageField
      value={starboard.postDesign}
      previewTitle={m.starboard.designPreviewTitle()}
      icon="fa-star"
      {user}
      placeholders={placeholderList}
      onchange={(message) => change({ postDesign: message || null }, true)}
    />
  {/key}

  {#if starboard.postDesign}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={reset}>
      <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
      {m.starboard.designReset()}
    </button>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
    <SettingField label={m.starboard.testChannel()} id="sb-test-channel">
      <DiscordSelector
        id="sb-test-channel"
        type="channel"
        options={channels}
        selected={testChannel}
        placeholder={m.common.selectAChannelPlaceholder()}
        onchange={(detail) => (testChannel = typeof detail.selected === "string" ? detail.selected : "")}
      />
    </SettingField>
    <SettingField label={m.starboard.testMessage()} id="sb-test-message">
      <input
        id="sb-test-message"
        type="text"
        inputmode="numeric"
        bind:value={testMessage}
        placeholder={m.starboard.testMessagePlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </SettingField>
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style={buttonStyle}
      disabled={!testChannel || testing}
      onclick={test}
    >
      <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
      {m.starboard.testSend()}
    </button>
  </div>
</EditorGroup>
