<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { AiProvider, utilityApi, type AiConfigResponse, type AiModel } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { errorText, type Named, type TabProps } from "./utilityModel";

  interface Props extends TabProps {
    channels: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
  }

  let { guildId, channels, autoSave, user = null, onerror }: Props = $props();

  type Field = "enabled" | "channelId" | "provider" | "webSearchEnabled" | "hideWebSearchMessages";

  let ai: AiConfigResponse | null = $state(null);
  let form = $state({
    enabled: false,
    channelId: null as string | null,
    provider: AiProvider.OpenAi.toString(),
    model: "",
    systemPrompt: "",
    webSearchEnabled: false,
    hideWebSearchMessages: true,
    apiKey: "",
    webhookUrl: "",
    customEmbed: ""
  });
  let models: AiModel[] = $state([]);
  let loadingModels = $state(false);

  const providers = [
    { id: AiProvider.OpenAi.toString(), name: "OpenAI" },
    { id: AiProvider.Claude.toString(), name: "Claude (Anthropic)" },
    { id: AiProvider.Groq.toString(), name: "Groq" }
  ];

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const dangerStyle = $derived(`background: #ef444420; color: ${$colorStore.text}; border: 1px solid #ef444440;`);
  const placeholders = $derived([
    { category: m.utility.aiCustomEmbed(), name: "%airesponse%", description: m.utility.aiResponsePlaceholder() }
  ]);

  async function load() {
    try {
      const loaded = await utilityApi.getAiConfig(guildId);
      ai = loaded;
      form = {
        enabled: loaded.enabled,
        channelId: loaded.channelId && loaded.channelId.toString() !== "0" ? loaded.channelId.toString() : null,
        provider: loaded.provider.toString(),
        model: loaded.model ?? "",
        systemPrompt: loaded.systemPrompt ?? "",
        webSearchEnabled: loaded.webSearchEnabled,
        hideWebSearchMessages: loaded.hideWebSearchMessages,
        apiKey: "",
        webhookUrl: "",
        customEmbed: loaded.customEmbed ?? ""
      };
    } catch (err) {
      logger.error("Failed to load AI config:", err);
      onerror(errorText(err, m.utility.aiLoadFailed()));
    }
  }

  async function send() {
    if (form.enabled && !form.channelId) return;
    const sentKey = form.apiKey;
    const sentWebhook = form.webhookUrl;
    const sentEmbed = form.customEmbed;
    const embedChanged = sentEmbed !== (ai?.customEmbed ?? "");
    await utilityApi.updateAiConfig(guildId, {
      enabled: form.enabled,
      channelId: form.channelId ? BigInt(form.channelId) : 0n,
      provider: parseInt(form.provider),
      model: form.model,
      systemPrompt: form.systemPrompt,
      webSearchEnabled: form.webSearchEnabled,
      hideWebSearchMessages: form.hideWebSearchMessages,
      apiKey: sentKey.trim() || null,
      webhookUrl: sentWebhook.trim() || null,
      customEmbed: embedChanged ? sentEmbed || "-" : null
    });
    if (form.apiKey === sentKey) form.apiKey = "";
    if (form.webhookUrl === sentWebhook) form.webhookUrl = "";
    ai = await utilityApi.getAiConfig(guildId);
  }

  function saveNow<K extends Field>(field: K, value: (typeof form)[K]) {
    const previous = form[field];
    form[field] = value;
    if (field === "enabled" && value && !form.channelId) {
      form[field] = previous;
      onerror(m.utility.aiChannelRequired());
      return;
    }
    void autoSave.now("ai", async () => {
      try {
        await send();
      } catch (err) {
        form[field] = previous;
        throw err;
      }
    });
  }

  function saveLater() {
    autoSave.schedule("ai", send);
  }

  async function clearKey() {
    const confirmed = await requestConfirmation({
      message: m.utility.aiRemoveKeyConfirm(),
      confirmText: m.utility.aiRemoveKeyConfirmButton()
    });
    if (!confirmed) return;
    try {
      await utilityApi.updateAiConfig(guildId, { clearApiKey: true, enabled: false });
      await load();
    } catch (err) {
      logger.error("Failed to remove AI key:", err);
      onerror(errorText(err, m.utility.aiRemoveKeyFailed()));
    }
  }

  async function clearWebhook() {
    try {
      await utilityApi.updateAiConfig(guildId, { webhookUrl: "" });
      await load();
    } catch (err) {
      logger.error("Failed to remove AI webhook:", err);
      onerror(errorText(err, m.utility.aiRemoveWebhookFailed()));
    }
  }

  async function fetchModels() {
    loadingModels = true;
    try {
      models = await utilityApi.getAiModels(guildId, parseInt(form.provider));
    } catch (err) {
      logger.error("Failed to load AI models:", err);
      onerror(errorText(err, m.utility.aiModelsFailed()));
      models = [];
    } finally {
      loadingModels = false;
    }
  }

  onMount(load);
</script>

<div onfocusout={() => autoSave.flush("ai")} role="presentation" class="space-y-4 min-w-0">
  <PluginCard
    title={m.utility.tabAi()}
    enabled={form.enabled}
    onToggle={(value) => saveNow("enabled", value)}
    alwaysOpen
  >
    {#if ai?.tokensUsed}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.utility.aiEnabledHintTokens({ count: ai.tokensUsed.toLocaleString() })}</p>
    {/if}

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SettingField label={m.common.channel()} id="ai-channel">
        <DiscordSelector
          type="channel"
          options={channels}
          selected={form.channelId}
          placeholder={m.utility.aiChannelPlaceholder()}
          id="ai-channel"
          ariaLabel={m.common.channel()}
          onchange={({ selected }) => saveNow("channelId", typeof selected === "string" ? selected : null)}
        />
      </SettingField>
      <SettingField label={m.common.provider()} id="ai-provider">
        <DiscordSelector
          type="custom"
          customIcon="fa-server"
          options={providers}
          selected={form.provider}
          searchable={false}
          clearable={false}
          id="ai-provider"
          ariaLabel={m.common.provider()}
          onchange={({ selected }) => {
            if (typeof selected !== "string") return;
            models = [];
            saveNow("provider", selected);
          }}
        />
      </SettingField>
    </div>

    <SettingField label={m.utility.aiApiKey()} id="ai-key">
      <div class="flex flex-col sm:flex-row gap-3">
        <input
          id="ai-key"
          type="password"
          bind:value={form.apiKey}
          autocomplete="off"
          oninput={saveLater}
          placeholder={ai?.hasApiKey ? m.utility.aiApiKeyStored({ hint: ai.apiKeyHint ?? m.utility.aiApiKeyHidden() }) : m.utility.aiApiKeyPlaceholder()}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
        {#if ai?.hasApiKey}
          <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={dangerStyle} onclick={clearKey}>
            {m.utility.aiRemoveKeyConfirmButton()}
          </button>
        {/if}
      </div>
    </SettingField>

    <SettingField label={m.common.model()} id="ai-model">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="grow min-w-0">
          {#if models.length > 0}
            <DiscordSelector
              type="custom"
              customIcon="fa-sparkles"
              clearable={false}
              options={models.map((md) => ({ id: md.id, name: md.name, label: `${md.name} (${md.id})` }))}
              selected={form.model || null}
              placeholder={m.utility.aiModelPlaceholder()}
              id="ai-model"
              ariaLabel={m.common.model()}
              onchange={({ selected }) => {
                if (typeof selected !== "string") return;
                form.model = selected;
                saveLater();
                void autoSave.flush("ai");
              }}
            />
          {:else}
            <input
              id="ai-model"
              type="text"
              bind:value={form.model}
              oninput={saveLater}
              placeholder={m.utility.aiModelIdPlaceholder()}
              class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
              style={inputStyle}
            >
          {/if}
        </div>
        <button
          type="button"
          class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          disabled={loadingModels || !ai?.hasApiKey}
          onclick={fetchModels}
        >
          {#if loadingModels}<i class="fa-solid fa-spinner fa-spin mr-2" aria-hidden="true"></i>{/if}{m.utility.aiFetchModels()}
        </button>
      </div>
    </SettingField>

    <SettingField label={m.utility.aiSystemPrompt()} id="ai-prompt">
      <textarea
        id="ai-prompt"
        rows="4"
        bind:value={form.systemPrompt}
        oninput={saveLater}
        placeholder={m.utility.aiSystemPromptPlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 resize-y"
        style={inputStyle}
      ></textarea>
    </SettingField>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <ToggleRow
        checked={form.webSearchEnabled}
        title={m.utility.aiWebSearch()}
        colors={$colorStore}
        onchange={(value) => saveNow("webSearchEnabled", value)}
      />
      <ToggleRow
        checked={form.hideWebSearchMessages}
        title={m.utility.aiHideWebSearch()}
        colors={$colorStore}
        onchange={(value) => saveNow("hideWebSearchMessages", value)}
      />
    </div>
  </PluginCard>

  <PluginCard title={m.utility.aiReplyStyle()} alwaysOpen>
    <SettingField label={ai?.hasWebhook ? m.utility.aiWebhookSet() : m.common.webhookUrlOptional()} id="ai-webhook">
      <div class="flex flex-col sm:flex-row gap-3">
        <input
          id="ai-webhook"
          type="url"
          bind:value={form.webhookUrl}
          oninput={saveLater}
          placeholder={ai?.hasWebhook ? m.utility.aiWebhookPlaceholderSet() : m.utility.aiWebhookPlaceholder()}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
        {#if ai?.hasWebhook}
          <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={dangerStyle} onclick={clearWebhook}>
            {m.common.remove()}
          </button>
        {/if}
      </div>
    </SettingField>

    <div class="space-y-2">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.utility.aiCustomEmbed()}</span>
      <MessageField
        value={form.customEmbed}
        previewTitle={m.utility.aiCustomEmbed()}
        {user}
        {placeholders}
        onchange={(message) => {
          form.customEmbed = message;
          saveLater();
        }}
      />
    </div>
  </PluginCard>
</div>
