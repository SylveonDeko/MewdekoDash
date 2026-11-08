<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import type { StickyTemplate } from "$lib/api/channelmessages/channelmessages";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import type { Named } from "./model";

  interface Props {
    template: StickyTemplate | null;
    channels: Named[];
    user?: DiscordUser | null;
    saving: boolean;
    problem: string | null;
    onsave: (template: StickyTemplate) => void;
    onstick: (name: string, channelId: string) => void;
    onclose: () => void;
  }

  let { template: source, channels, user = null, saving, problem, onsave, onstick, onclose }: Props = $props();

  const template = untrack(() => source);

  const isNew = template === null;

  let name = $state(template?.name ?? "");
  let content = $state(template?.content ?? "");
  let channelId = $state("");
  let attempted = $state(false);

  const missing = $derived(!name.trim() ? m.channelMessages.problemName() : !content.trim() ? m.channelMessages.problemMessage() : null);

  function save() {
    attempted = true;
    if (missing || saving) return;
    onsave({ name: name.trim(), content });
  }
</script>

{#snippet footer()}
  {#if (attempted && missing) || problem}
    <p class="grow basis-full sm:basis-0 text-sm text-red-400" role="alert">{problem ?? missing}</p>
  {/if}
  <button
    type="button"
    class="px-5 rounded-xl min-h-[44px] font-medium"
    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
    onclick={onclose}
  >
    {m.common.cancel()}
  </button>
  <button
    type="button"
    class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-60"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    disabled={saving}
    onclick={save}
  >
    {m.common.save()}
  </button>
{/snippet}

<Sheet title={isNew ? m.channelMessages.templateNewTitle() : name} size="lg" {footer} {onclose}>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start [&>*]:min-w-0">
  <div class="space-y-4">
  <SettingField label={m.channelMessages.templateName()} id="cm-template-name">
    <input
      id="cm-template-name"
      type="text"
      bind:value={name}
      maxlength="50"
      disabled={!isNew}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] disabled:opacity-60"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
  </SettingField>

  {#if !isNew}
    <SettingField label={m.channelMessages.templateStickTo()} id="cm-template-channel">
      <div class="flex gap-3 items-stretch">
        <div class="grow min-w-0">
          <DiscordSelector
            id="cm-template-channel"
            type="channel"
            options={channels}
            selected={channelId}
            placeholder={m.common.selectAChannelPlaceholder()}
            onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : "")}
          />
        </div>
        <button
          type="button"
          class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
          style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
          disabled={!channelId}
          onclick={() => onstick(name, channelId)}
        >
          {m.channelMessages.stick()}
        </button>
      </div>
    </SettingField>
  {/if}
  </div>

  <SettingField label={m.common.message()} id="cm-template-message">
    <MessageField
      value={content}
      previewTitle={m.channelMessages.templatePreviewTitle()}
      icon="fa-thumbtack"
      {user}
      onchange={(next) => (content = next)}
    />
  </SettingField>
  </div>
</Sheet>
