<script lang="ts">
  import { m } from "$lib/i18n";
  import { featureRequestsApi } from "$lib/api/index.ts";
  import type { FeatureRequestCategory, FeatureRequestEntry } from "$lib/api/featurerequests/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import {
    BODY_MAX,
    BODY_MIN,
    categoryOptions,
    errorText,
    TITLE_MAX,
    TITLE_MIN,
    type Notify
  } from "./requestModel";

  interface Props {
    notify: Notify;
    onopenmine: () => void;
  }

  let { notify, onopenmine }: Props = $props();

  let category: FeatureRequestCategory = $state("feature");
  let title = $state("");
  let body = $state("");
  let attachGuild = $state(true);
  let busy = $state(false);
  let sent: FeatureRequestEntry | null = $state(null);

  const titleLeft = $derived(TITLE_MAX - title.length);
  const bodyLeft = $derived(BODY_MAX - body.length);
  const canSend = $derived(
    !busy && title.trim().length >= TITLE_MIN && body.trim().length >= BODY_MIN && titleLeft >= 0 && bodyLeft >= 0
  );

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function send() {
    if (!canSend) return;
    busy = true;
    try {
      sent = await featureRequestsApi.submit({
        guildId: attachGuild && $currentGuild ? BigInt($currentGuild.id) : null,
        category,
        title: title.trim(),
        body: body.trim()
      });
      title = "";
      body = "";
      category = "feature";
    } catch (err) {
      logger.error("Failed to submit feature request:", err);
      notify(errorText(err, m.featureRequests.errorSubmit()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.featureRequests.tabSuggest()} alwaysOpen>
  <div class="space-y-4">
    {#if sent}
      <div class="rounded-lg p-3 text-sm flex flex-wrap items-center gap-x-3 gap-y-1" style="background: {$colorStore.primary}15; color: {$colorStore.text};" role="status">
        <span class="grow min-w-0 break-words">
          <span class="font-semibold">{m.featureRequests.submittedThanks()}</span>
          {m.featureRequests.submittedMessage({ title: sent.title })}
        </span>
        <button type="button" class="px-4 rounded-lg min-h-[44px] underline" onclick={onopenmine}>{m.featureRequests.tabMine()}</button>
      </div>
    {/if}

    <div>
      <span id="fr-category-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.featureRequests.formCategoryLabel()}</span>
      <DiscordSelector
        type="custom"
        options={categoryOptions()}
        selected={category}
        placeholder={m.common.pickCategoryPlaceholder()}
        searchable={false}
        clearable={false}
        customIcon="fa-tag"
        ariaLabelledby="fr-category-label"
        onchange={(detail) => {
          if (typeof detail.selected === "string" && detail.selected) category = detail.selected as FeatureRequestCategory;
        }}
      />
    </div>

    <div>
      <label for="fr-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.title()}</label>
      <input
        id="fr-title"
        type="text"
        bind:value={title}
        maxlength={TITLE_MAX}
        disabled={busy}
        placeholder={m.featureRequests.formTitlePlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
      <p class="text-xs mt-1 text-right" style="color: {$colorStore.muted}">{m.featureRequests.charsLeft({ count: titleLeft })}</p>
    </div>

    <div>
      <label for="fr-body" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.details()}</label>
      <textarea
        id="fr-body"
        bind:value={body}
        rows="7"
        maxlength={BODY_MAX}
        disabled={busy}
        placeholder={m.featureRequests.formDetailsPlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 resize-y"
        style={inputStyle}
      ></textarea>
      <p class="text-xs mt-1 text-right" style="color: {$colorStore.muted}">{m.featureRequests.charsLeft({ count: bodyLeft })}</p>
    </div>

    {#if $currentGuild}
      <ToggleRow
        checked={attachGuild}
        title={m.featureRequests.formAttachGuild({ guild: $currentGuild.name })}
        colors={$colorStore}
        onchange={(value) => (attachGuild = value)}
      />
    {/if}

    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!canSend}
      onclick={send}
    >
      {busy ? m.common.sending() : m.featureRequests.sendButton()}
    </button>
  </div>
</PluginCard>
