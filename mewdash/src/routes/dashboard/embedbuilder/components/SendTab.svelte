<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import type { EmbedPersona, SendableChannel, SendEmbedResult } from "$lib/api/embeds/models";

  interface Props {
    guildName: string | null;
    channelOptions: Array<{ id: string; name: string }>;
    loadingChannels: boolean;
    channelsError: string;
    selectedChannelId: string | null;
    selectedChannel: SendableChannel | null;
    blockedChannels: SendableChannel[];
    embedPermissionBlock: string | null;
    sendAsWebhook: boolean;
    webhookAvailable: boolean;
    personas: EmbedPersona[];
    loadingPersonas: boolean;
    selectedPersonaId: number | null;
    webhookUsername: string;
    webhookAvatarUrl: string;
    sending: boolean;
    canSend: boolean;
    hasValidationErrors: boolean;
    lastResult: SendEmbedResult | null;
    onmanage: () => void;
    onsend: () => void;
  }

  let {
    guildName,
    channelOptions,
    loadingChannels,
    channelsError,
    selectedChannelId = $bindable(),
    selectedChannel,
    blockedChannels,
    embedPermissionBlock,
    sendAsWebhook = $bindable(),
    webhookAvailable,
    personas,
    loadingPersonas,
    selectedPersonaId = $bindable(),
    webhookUsername = $bindable(),
    webhookAvatarUrl = $bindable(),
    sending,
    canSend,
    hasValidationErrors,
    lastResult,
    onmanage,
    onsend
  }: Props = $props();

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);

  function chipStyle(selected: boolean) {
    return selected
      ? `background: ${$colorStore.selectedSurface}; border-color: ${$colorStore.selectedBorder}; color: ${$colorStore.text};`
      : `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}20; color: ${$colorStore.text};`;
  }
</script>

<div class="space-y-6">
  {#if !guildName}
    <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.pageSendNoGuild()}</p>
  {:else}
    <h3 class="text-base font-semibold" style="color: {$colorStore.text};">
      {m.embedbuilder.pageSendHeading({ server: guildName })}
    </h3>

    <div class="space-y-2">
      <span class="block text-sm font-medium" style="color: {$colorStore.text};">{m.common.channel()}</span>
      {#if loadingChannels}
        <p class="text-sm" style="color: {$colorStore.muted};">{m.common.loadingChannels()}</p>
      {:else if channelsError}
        <p class="text-sm" style="color: #ED4245;">{channelsError}</p>
      {:else if channelOptions.length === 0}
        <p class="text-sm" style="color: #ED4245;">{m.embedbuilder.pageSendNoChannels()}</p>
      {:else}
        <DiscordSelector
          type="channel"
          options={channelOptions}
          bind:selected={selectedChannelId}
          placeholder={m.common.selectAChannelPlaceholder()}
          ariaLabel={m.embedbuilder.pageSendChannelAria()}
        />
      {/if}
    </div>

    {#if selectedChannel}
      <div class="p-4 rounded-lg border space-y-2" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <h4 class="text-sm font-semibold" style="color: {$colorStore.text};">
          {m.embedbuilder.pageSendPermissionsHeading({ channel: selectedChannel.name })}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm" style="color: {$colorStore.muted};">
          {#each [
            [selectedChannel.canSend, m.common.sendMessages()],
            [selectedChannel.canEmbed, m.embedbuilder.pageSendPermEmbeds()],
            [selectedChannel.canMentionEveryone, m.embedbuilder.pageSendPermMentions()],
            [selectedChannel.canUseWebhooks, m.common.manageWebhooks()]
          ] as [allowed, label]}
            <span class="flex items-center gap-2">
              <i class="fa-solid {allowed ? 'fa-check' : 'fa-xmark'}" style="color: {allowed ? $colorStore.primary : '#ED4245'};" aria-hidden="true"></i>
              {label}
            </span>
          {/each}
        </div>
        {#if !selectedChannel.canMentionEveryone}
          <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.pageSendMentionsStripped()}</p>
        {/if}
        {#if embedPermissionBlock}
          <p class="text-sm" style="color: #ED4245;">{embedPermissionBlock}</p>
        {/if}
      </div>

      <div class="p-4 rounded-lg border space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <label class="flex items-center gap-3 text-sm min-h-[44px]" style="color: {$colorStore.text};">
          <input type="checkbox" class="size-5" bind:checked={sendAsWebhook} disabled={!webhookAvailable} />
          {m.embedbuilder.pageSendWebhookToggle()}
        </label>

        {#if !webhookAvailable}
          <p class="text-sm" style="color: #ED4245;">
            {selectedChannel.canUseWebhooks ? m.embedbuilder.pageSendWebhookNeedBot() : m.embedbuilder.pageSendWebhookNeedUser()}
          </p>
        {/if}

        {#if sendAsWebhook}
          <div class="space-y-2">
            <span class="block text-sm font-medium" style="color: {$colorStore.text};">{m.embedbuilder.pageSendAs()}</span>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label={m.embedbuilder.pageSendCustomAria()}
                aria-pressed={selectedPersonaId === null}
                class="px-3 rounded-lg border text-sm font-medium min-h-[44px]"
                style={chipStyle(selectedPersonaId === null)}
                onclick={() => (selectedPersonaId = null)}
              >
                {m.common.custom()}
              </button>
              {#each personas as persona (persona.id)}
                <button
                  type="button"
                  aria-label={m.embedbuilder.pageSendAsPersonaAria({ name: persona.name })}
                  aria-pressed={selectedPersonaId === persona.id}
                  class="px-3 rounded-lg border text-sm font-medium flex items-center gap-2 min-h-[44px]"
                  style={chipStyle(selectedPersonaId === persona.id)}
                  onclick={() => (selectedPersonaId = persona.id)}
                >
                  {#if persona.avatarUrl}
                    <img alt="" class="w-5 h-5 rounded-full object-cover" src={persona.avatarUrl} />
                  {/if}
                  {persona.name}
                  {#if persona.isGuildShared}
                    <i class="fa-solid fa-users text-xs" aria-hidden="true"></i>
                  {/if}
                </button>
              {/each}
              {#if loadingPersonas}
                <span class="text-sm" style="color: {$colorStore.muted};">{m.common.loading()}</span>
              {/if}
              <button
                type="button"
                aria-label={m.embedbuilder.pageSendManageAria()}
                class="px-3 rounded-lg text-sm font-medium flex items-center gap-2 min-h-[44px]"
                style="color: {$colorStore.muted}; border: 1px dashed {$colorStore.primary}40;"
                onclick={onmanage}
              >
                <i class="fa-solid fa-gear" aria-hidden="true"></i>
                {m.common.manage()}
              </button>
            </div>
          </div>

          {#if selectedPersonaId === null}
            <div class="space-y-2">
              <input
                type="text"
                class="w-full px-3 py-2 rounded-lg border min-h-[50px]"
                style={inputStyle}
                placeholder={m.embedbuilder.pageSendWebhookNamePlaceholder()}
                aria-label={m.embedbuilder.pageSendWebhookNamePlaceholder()}
                maxlength="80"
                bind:value={webhookUsername}
              />
              <input
                type="url"
                class="w-full px-3 py-2 rounded-lg border min-h-[50px]"
                style={inputStyle}
                placeholder={m.embedbuilder.pageSendWebhookAvatarPlaceholder()}
                aria-label={m.embedbuilder.pageSendWebhookAvatarPlaceholder()}
                bind:value={webhookAvatarUrl}
              />
              <button
                type="button"
                class="min-h-[44px] underline text-sm"
                style="color: {$colorStore.text};"
                onclick={onmanage}
              >
                {m.embedbuilder.pageSendSavePersona()}
              </button>
            </div>
          {/if}
        {/if}
      </div>
    {/if}

    <button
      type="button"
      aria-label={m.embedbuilder.pageSendButton()}
      class="w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 min-h-[50px]"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!canSend}
      onclick={onsend}
    >
      <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
      {sending ? m.common.sending() : m.embedbuilder.pageSendButton()}
    </button>

    {#if hasValidationErrors}
      <p class="text-sm" style="color: #ED4245;">{m.embedbuilder.pageSendBlockedByErrors()}</p>
    {/if}

    {#if lastResult}
      <div class="p-3 rounded-lg border text-sm" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20; color: {$colorStore.text};">
        {lastResult.personaName
          ? m.embedbuilder.pageSendResultPersona({ channel: lastResult.channelName, persona: lastResult.personaName })
          : lastResult.sentViaWebhook
            ? m.embedbuilder.pageSendResultWebhook({ channel: lastResult.channelName })
            : m.embedbuilder.pageSendResultBot({ channel: lastResult.channelName })}
        <a class="underline" href={lastResult.messageLink} rel="noopener noreferrer" style="color: {$colorStore.text};" target="_blank">
          {m.embedbuilder.pageSendJump()}
        </a>
      </div>
    {/if}

    {#if blockedChannels.length > 0}
      <div class="space-y-2">
        <h4 class="text-sm font-semibold" style="color: {$colorStore.text};">
          {m.embedbuilder.pageSendUnavailable({ count: blockedChannels.length })}
        </h4>
        {#each blockedChannels as channel (channel.id)}
          <div class="flex items-center justify-between gap-2 p-2 rounded-lg border text-sm" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <span class="truncate" style="color: {$colorStore.text};">#{channel.name}</span>
            <span class="shrink-0 text-right" style="color: {$colorStore.muted};">{channel.restriction}</span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
