<!-- components/editors/OpenMessageEditor.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import EmbedEditor from "$lib/components/specialized/EmbedEditor.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";

  interface Props {
    openMessageJson: string | null;
    modalJson?: string | null;
  }

  let { openMessageJson = $bindable(null), modalJson = null }: Props = $props();

  // Default embed structure
  let messageEmbed = $state({
    title: "Support Ticket",
    description: "Welcome to your ticket!\\n\\nPlease describe your issue and wait for a staff member to assist you.",
    color: "#5865F2",
    url: "",
    author: { name: "", url: "", icon_url: "" },
    thumbnail: { url: "" },
    image: { url: "" },
    footer: { text: "Ticket Support", icon_url: "" },
    fields: []
  });

  let messageContent = $state("");
  let useCustomMessage = $state(false);

  // Parse existing JSON
  $effect(() => {
    if (openMessageJson) {
      try {
        const parsed = JSON.parse(openMessageJson);
        messageContent = parsed.content || "";
        if (parsed.embeds && parsed.embeds.length > 0) {
          messageEmbed = parsed.embeds[0];
        }
        useCustomMessage = true;
      } catch {
        // Invalid JSON, use defaults
      }
    }
  });

  function handleEmbedUpdate(detail: { embed: any; index: number }) {
    messageEmbed = detail.embed;
    updateJson();
  }

  function updateJson() {
    if (!useCustomMessage) {
      openMessageJson = null;
      return;
    }

    const cleanedEmbed = cleanEmbed(messageEmbed);
    const config: any = {};

    if (messageContent.trim()) {
      config.content = messageContent.trim();
    }

    if (cleanedEmbed.title || cleanedEmbed.description || cleanedEmbed.fields?.length > 0) {
      config.embeds = [cleanedEmbed];
    }

    openMessageJson = Object.keys(config).length > 0 ? JSON.stringify(config) : null;
  }

  function cleanEmbed(embed: any) {
    const cleaned: any = {};
    if (embed.title?.trim()) cleaned.title = embed.title;
    if (embed.description?.trim()) cleaned.description = embed.description;
    if (embed.color) cleaned.color = embed.color;
    if (embed.url?.trim()) cleaned.url = embed.url;

    if (embed.author?.name?.trim() || embed.author?.url?.trim() || embed.author?.icon_url?.trim()) {
      cleaned.author = {};
      if (embed.author.name?.trim()) cleaned.author.name = embed.author.name;
      if (embed.author.url?.trim()) cleaned.author.url = embed.author.url;
      if (embed.author.icon_url?.trim()) cleaned.author.icon_url = embed.author.icon_url;
    }

    if (embed.footer?.text?.trim() || embed.footer?.icon_url?.trim()) {
      cleaned.footer = {};
      if (embed.footer.text?.trim()) cleaned.footer.text = embed.footer.text;
      if (embed.footer.icon_url?.trim()) cleaned.footer.icon_url = embed.footer.icon_url;
    }

    if (embed.thumbnail?.url?.trim()) cleaned.thumbnail = { url: embed.thumbnail.url };
    if (embed.image?.url?.trim()) cleaned.image = { url: embed.image.url };
    if (embed.fields?.length > 0) cleaned.fields = embed.fields;

    return cleaned;
  }

  // Ticket-specific placeholders
  const ticketPlaceholders = [
    { category: "Ticket", name: "%ticket.id%", description: "Ticket ID number" },
    { category: "Ticket", name: "%ticket.channel%", description: "Ticket channel mention" },
    { category: "Ticket", name: "%ticket.created%", description: "Ticket creation timestamp" },
    { category: "User", name: "%ticket.user%", description: "Ticket creator username" },
    { category: "User", name: "%ticket.user.mention%", description: "Mention the ticket creator" },
    { category: "User", name: "%ticket.user.avatar%", description: "Ticket creator's avatar URL" },
    { category: "User", name: "%ticket.user.id%", description: "Ticket creator's user ID" }
  ];

  // Parse modal JSON to extract field information
  let modalPlaceholders = $derived(() => {
    if (!modalJson) return [];

    try {
      const parsed = JSON.parse(modalJson);
      const fields = parsed.Fields || parsed.fields || {};

      return Object.entries(fields).map(([fieldId, field]: [string, any]) => ({
        category: "Modal Fields",
        name: `%modal.${fieldId}%`,
        description: field.Label || field.label || "Modal field",
        placeholder: field.Placeholder || field.placeholder || ""
      }));
    } catch {
      return [];
    }
  });

  let allPlaceholders = $derived([...ticketPlaceholders, ...modalPlaceholders()]);
</script>

<div class="space-y-4">
  <!-- Enable Custom Message -->
  <div class="p-4 rounded-lg" style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
    <label class="flex items-center gap-3 cursor-pointer">
      <input
        bind:checked={useCustomMessage}
        class="rounded"
        onchange={updateJson}
        type="checkbox"
      />
      <div>
        <span class="font-medium block" style="color: {$colorStore.text}">Use Custom Open Message</span>
        <span class="text-xs" style="color: {$colorStore.muted}">
          Override the default ticket opening message with a custom embed
        </span>
      </div>
    </label>
  </div>

  {#if useCustomMessage}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Editor Side -->
      <div class="space-y-4">
        <!-- Plain Text Content -->
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Message Content (Optional)
          </label>
          <textarea
            bind:value={messageContent}
            oninput={updateJson}
            class="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
            placeholder="Optional text above the embed..."
            rows="2"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          ></textarea>
        </div>

        <!-- Embed Editor -->
        <div class="p-4 rounded-lg"
             style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}15;">
          <h5 class="font-semibold mb-3 text-sm" style="color: {$colorStore.text}">Custom Embed</h5>
          <EmbedEditor
            bind:embed={messageEmbed}
            index={0}
            placeholders={allPlaceholders}
            onupdate={handleEmbedUpdate}
          />
        </div>
      </div>

      <!-- Preview Side -->
      <div>
        <h5 class="font-semibold mb-3 text-sm" style="color: {$colorStore.text}">Preview</h5>
        <PreviewCard
          content={messageContent}
          embeds={[messageEmbed]}
          componentRows={[]}
          emptyMessage="Your ticket opening message preview"
        />

        <!-- Placeholder Reference -->
        <div class="mt-4 p-3 rounded-lg"
             style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
          <h6 class="font-semibold text-xs mb-2" style="color: {$colorStore.text}">Available Placeholders:</h6>

          <!-- Ticket Placeholders -->
          <div class="mb-3">
            <div class="text-xs font-medium mb-1" style="color: {$colorStore.text}">Ticket & User:</div>
            <div class="grid grid-cols-2 gap-1 text-xs">
              {#each ticketPlaceholders as placeholder}
                <code class="truncate" style="color: {$colorStore.muted};" title={placeholder.description}>
                  {placeholder.name}
                </code>
              {/each}
            </div>
          </div>

          <!-- Modal Field Placeholders -->
          {#if modalPlaceholders().length > 0}
            <div>
              <div class="text-xs font-medium mb-1" style="color: {$colorStore.text}">Modal Fields:</div>
              <div class="space-y-1.5">
                {#each modalPlaceholders() as placeholder}
                  <div class="p-2 rounded" style="background: {$colorStore.primary}10;">
                    <code class="text-xs font-mono" style="color: {$colorStore.primary};">
                      {placeholder.name}
                    </code>
                    <div class="text-xs mt-0.5" style="color: {$colorStore.text};">
                      <span class="font-medium">{placeholder.description}</span>
                      {#if placeholder.placeholder}
                        <span class="ml-1" style="color: {$colorStore.muted};">
                          · Hint: "{placeholder.placeholder}"
                        </span>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8 rounded-lg"
         style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
      <i class="fa-solid fa-message" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
      <p class="mt-4" style="color: {$colorStore.muted}">Using default ticket opening message</p>
      <p class="text-sm mt-2" style="color: {$colorStore.muted}">
        Enable custom message above to create a personalized ticket greeting
      </p>
    </div>
  {/if}
</div>
