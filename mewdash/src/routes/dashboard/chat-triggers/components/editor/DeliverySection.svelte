<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ChatTrigger } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import NumberField from "./NumberField.svelte";
  import type { Named, SectionProps } from "./editorTypes";
  import { hasId, idString, joinList, splitList } from "../triggerModel";

  interface Props extends SectionProps {
    channels: Named[];
    emojis: GuildEmojiInfo[];
    triggers: ChatTrigger[];
  }

  let { trigger, change, channels, emojis, triggers }: Props = $props();

  const reactions = $derived(splitList(trigger.reactions));
  const chainOptions = $derived(
    triggers
      .filter(other => other.id !== trigger.id)
      .map(other => ({ id: String(other.id), name: `#${other.id} ${other.trigger ?? ""}` }))
  );

  const count = $derived(
    [
      trigger.replyToTrigger,
      trigger.deleteResponseAfter > 0,
      hasId(trigger.replyChannelId),
      trigger.dmResponse,
      trigger.ephemeralResponse,
      trigger.anonymous,
      trigger.noRespond,
      trigger.autoDeleteTrigger,
      trigger.reactToTrigger,
      hasId(trigger.crosspostingChannelId),
      !!trigger.crosspostingWebhookUrl,
      trigger.nextTriggerId != null
    ].filter(Boolean).length
  );

  let open = $state(false);
</script>

<EditorGroup title={m.chatTriggers.groupDelivery()} {count} bind:open>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <ToggleRow colors={$colorStore} checked={trigger.replyToTrigger} title={m.chatTriggers.replyToMessage()} onchange={(v) => change({ replyToTrigger: v })} />
    <ToggleRow colors={$colorStore} checked={trigger.dmResponse} title={m.chatTriggers.sendAsDm()} onchange={(v) => change({ dmResponse: v })} />
    <ToggleRow colors={$colorStore} checked={trigger.ephemeralResponse} title={m.chatTriggers.ephemeral()} onchange={(v) => change({ ephemeralResponse: v })} />
    <ToggleRow colors={$colorStore} checked={trigger.anonymous} title={m.chatTriggers.anonymous()} onchange={(v) => change({ anonymous: v })} />
    <ToggleRow colors={$colorStore} checked={trigger.noRespond} title={m.chatTriggers.noMessage()} onchange={(v) => change({ noRespond: v })} />
    <ToggleRow
      colors={$colorStore}
      checked={trigger.autoDeleteTrigger}
      disabled={trigger.reactToTrigger}
      title={m.chatTriggers.deleteTrigger()}
      onchange={(v) => change({ autoDeleteTrigger: v })}
    />
    <ToggleRow
      colors={$colorStore}
      checked={trigger.reactToTrigger}
      disabled={trigger.autoDeleteTrigger}
      title={m.chatTriggers.reactInstead()}
      onchange={(v) => change({ reactToTrigger: v })}
    />
  </div>

  {#if trigger.reactToTrigger}
    <SettingField label={m.chatTriggers.reactionsLabel()} id="ct-reactions">
      <EmojiPicker
        id="ct-reactions"
        guildEmojis={emojis}
        selected={reactions}
        multiple={true}
        maxSelection={6}
        showUnicodeEmojis={true}
        placeholder={m.chatTriggers.reactionsPlaceholder()}
        onchange={(detail) => change({ reactions: joinList(Array.isArray(detail.selected) ? detail.selected : []) })}
      />
    </SettingField>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <NumberField
      id="ct-delete-after"
      label={m.chatTriggers.deleteAfter()}
      value={trigger.deleteResponseAfter}
      max={86400}
      onchange={(v) => change({ deleteResponseAfter: v ?? 0 }, true)}
    />
    <SettingField label={m.chatTriggers.replyChannel()} id="ct-reply-channel">
      <DiscordSelector
        id="ct-reply-channel"
        type="channel"
        options={channels}
        selected={hasId(trigger.replyChannelId) ? idString(trigger.replyChannelId) : null}
        placeholder={m.chatTriggers.replyChannelPlaceholder()}
        onchange={(detail) => change({ replyChannelId: typeof detail.selected === "string" ? BigInt(detail.selected) : 0n })}
      />
    </SettingField>
    <SettingField label={m.chatTriggers.crosspostChannel()} id="ct-crosspost-channel">
      <DiscordSelector
        id="ct-crosspost-channel"
        type="channel"
        options={channels}
        selected={hasId(trigger.crosspostingChannelId) ? idString(trigger.crosspostingChannelId) : null}
        placeholder={m.chatTriggers.crosspostChannelPlaceholder()}
        onchange={(detail) => change({ crosspostingChannelId: typeof detail.selected === "string" ? BigInt(detail.selected) : 0n })}
      />
    </SettingField>
    <SettingField label={m.chatTriggers.crosspostWebhook()} id="ct-crosspost-webhook">
      <input
        id="ct-crosspost-webhook"
        type="url"
        value={trigger.crosspostingWebhookUrl ?? ""}
        oninput={(e) => change({ crosspostingWebhookUrl: e.currentTarget.value.trim() || null }, true)}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </SettingField>
  </div>

  <SettingField label={m.chatTriggers.chain()} id="ct-chain">
    <DiscordSelector
      id="ct-chain"
      type="custom"
      options={chainOptions}
      selected={trigger.nextTriggerId != null ? String(trigger.nextTriggerId) : null}
      placeholder={m.chatTriggers.chainPlaceholder()}
      customIcon="fa-link"
      onchange={(detail) => change({ nextTriggerId: typeof detail.selected === "string" ? Number(detail.selected) : null })}
    />
  </SettingField>
</EditorGroup>
