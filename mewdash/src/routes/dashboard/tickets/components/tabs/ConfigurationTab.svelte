<!-- components/tabs/ConfigurationTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";

  interface Props {
    priorities: any[];
    tags: any[];
    transcriptChannelId: bigint | null;
    logChannelId: bigint | null;
    showPriorityCreator: boolean;
    newPriority: any;
    showTagCreator: boolean;
    newTag: any;
    textChannels: any[];
    guildEmojis: any[];
    saving: boolean;
    createPriority: () => Promise<void>;
    deletePriority: (priorityId: number) => Promise<void>;
    createTag: () => Promise<void>;
    deleteTag: (tagId: number) => Promise<void>;
    setTranscriptChannel: (channelId: bigint | null) => Promise<void>;
    setLogChannel: (channelId: bigint | null) => Promise<void>;
    showConfirm: (title: string, message: string, action: () => void, variant?: "danger" | "warning" | "info") => void;
    fetchAllData: () => Promise<void>;
  }

  let {
    priorities,
    tags,
    transcriptChannelId = $bindable(),
    logChannelId = $bindable(),
    showPriorityCreator = $bindable(),
    newPriority = $bindable(),
    showTagCreator = $bindable(),
    newTag = $bindable(),
    textChannels,
    guildEmojis,
    saving,
    createPriority,
    deletePriority,
    createTag,
    deleteTag,
    setTranscriptChannel,
    setLogChannel,
    showConfirm,
    fetchAllData
  }: Props = $props();

  let tempTranscriptChannel = $state(transcriptChannelId?.toString() || null);
  let tempLogChannel = $state(logChannelId?.toString() || null);

  async function saveTranscriptChannel() {
    const channelId = tempTranscriptChannel ? BigInt(tempTranscriptChannel) : null;
    await setTranscriptChannel(channelId);
  }

  async function saveLogChannel() {
    const channelId = tempLogChannel ? BigInt(tempLogChannel) : null;
    await setLogChannel(channelId);
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Priorities Section -->
  <div class="rounded-2xl border p-6 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">

    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-flag" style="color: {$colorStore.primary};"></i>
        Priorities ({priorities.length})
      </h3>
      <button
        class="px-3 py-2 rounded-lg transition-all hover:scale-[1.02] text-sm font-medium"
        onclick={() => showPriorityCreator = true}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-plus"></i>
        New
      </button>
    </div>

    {#if priorities.length === 0}
      <div class="text-center py-8">
        <i class="fa-solid fa-flag" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
        <p class="mt-4" style="color: {$colorStore.muted}">No priorities configured</p>
        <p class="text-sm mt-2" style="color: {$colorStore.muted}">Click "New" to create a priority level</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each priorities as priority}
          <div class="p-4 rounded-lg"
               style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  {#if priority.emoji}
                    <span class="text-lg">{priority.emoji}</span>
                  {/if}
                  <p class="font-medium" style="color: {$colorStore.text}">{priority.name}</p>
                  <span class="text-xs px-2 py-1 rounded"
                        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
                    Level {priority.level}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs" style="color: {$colorStore.muted}">
                  <span>ID: {priority.id}</span>
                  <span>Ping Staff: {priority.pingStaff ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <button
                class="px-2 py-1 rounded transition-all hover:scale-110 text-sm"
                style="background: #ef444420; color: #ef4444;"
                aria-label="Delete priority {priority.name}"
                onclick={() => showConfirm(
                  "Delete Priority",
                  `Delete priority "${priority.name}"?`,
                  () => deletePriority(priority.id),
                  "danger"
                )}
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Tags Section -->
  <div class="rounded-2xl border p-6 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">

    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-tags" style="color: {$colorStore.accent};"></i>
        Tags ({tags.length})
      </h3>
      <button
        class="px-3 py-2 rounded-lg transition-all hover:scale-[1.02] text-sm font-medium"
        onclick={() => showTagCreator = true}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-plus"></i>
        New
      </button>
    </div>

    {#if tags.length === 0}
      <div class="text-center py-8">
        <i class="fa-solid fa-tags" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
        <p class="mt-4" style="color: {$colorStore.muted}">No tags configured</p>
        <p class="text-sm mt-2" style="color: {$colorStore.muted}">Click "New" to create a tag</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each tags as tag}
          <div class="p-4 rounded-lg"
               style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="font-medium" style="color: {$colorStore.text}">{tag.name}</p>
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                  ID: {tag.id}
                </p>
                {#if tag.description}
                  <p class="text-sm mt-2" style="color: {$colorStore.muted}">{tag.description}</p>
                {/if}
              </div>
              <button
                class="px-2 py-1 rounded transition-all hover:scale-110 text-sm"
                style="background: #ef444420; color: #ef4444;"
                aria-label="Delete tag {tag.name}"
                onclick={() => showConfirm(
                  "Delete Tag",
                  `Delete tag "${tag.name}"?`,
                  () => deleteTag(tag.id),
                  "danger"
                )}
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Channels Configuration -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <!-- Transcript Channel -->
  <div class="rounded-2xl border p-6 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
      <i class="fa-solid fa-file-lines" style="color: {$colorStore.secondary};"></i>
      Transcript Channel
    </h3>
    <div class="space-y-4">
      <DiscordSelector
        bind:selected={tempTranscriptChannel}
        multiple={false}
        options={textChannels}
        placeholder="Select transcript channel..."
        type="channel"
      />
      <button
        class="w-full px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center justify-center gap-2"
        disabled={saving}
        onclick={saveTranscriptChannel}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-floppy-disk"></i>
        Save Channel
      </button>
    </div>
  </div>

  <!-- Log Channel -->
  <div class="rounded-2xl border p-6 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
      <i class="fa-solid fa-clipboard-list" style="color: {$colorStore.accent};"></i>
      Log Channel
    </h3>
    <div class="space-y-4">
      <DiscordSelector
        bind:selected={tempLogChannel}
        multiple={false}
        options={textChannels}
        placeholder="Select log channel..."
        type="channel"
      />
      <button
        class="w-full px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center justify-center gap-2"
        disabled={saving}
        onclick={saveLogChannel}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-floppy-disk"></i>
        Save Channel
      </button>
    </div>
  </div>
</div>

<!-- Priority Creator Modal -->
{#if showPriorityCreator}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.7);"
       role="dialog" aria-modal="true" tabindex="-1"
       onclick={(e) => { if (e.target === e.currentTarget) showPriorityCreator = false; }}
       onkeydown={(e) => { if (e.key === 'Escape') showPriorityCreator = false; }}>
    <div class="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">

      <h3 class="text-xl font-bold mb-6 flex items-center gap-3" style="color: {$colorStore.text}">
        <i class="fa-solid fa-flag" style="color: {$colorStore.primary};"></i>
        Create Priority
      </h3>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- ID -->
          <div>
            <label for="f-ConfigurationTab-label-272" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              ID <span style="color: #ef4444;">*</span>
            </label>
            <input id="f-ConfigurationTab-label-272"
              type="text"
              bind:value={newPriority.id}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              placeholder="urgent"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>

          <!-- Name -->
          <div>
            <label for="f-ConfigurationTab-label-286" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              Name <span style="color: #ef4444;">*</span>
            </label>
            <input id="f-ConfigurationTab-label-286"
              type="text"
              bind:value={newPriority.name}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              placeholder="Urgent"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
        </div>

        <!-- Emoji -->
        <div>
          <label for="f-ConfigurationTab-emoji-optional-301" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Emoji (Optional)
          </label>
          <EmojiPicker id="f-ConfigurationTab-emoji-optional-301"
            {guildEmojis}
            bind:selected={newPriority.emoji}
            multiple={false}
            placeholder="Select an emoji..."
            searchable={true}
            groupByGuild={true}
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Level -->
          <div>
            <label for="f-ConfigurationTab-level-317" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              Level
            </label>
            <input id="f-ConfigurationTab-level-317"
              type="number"
              bind:value={newPriority.level}
              min="1"
              max="10"
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>

          <!-- Ping Staff -->
          <div>
            <label for="cfg-priority-ping-staff" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              Ping Staff
            </label>
            <div class="flex items-center h-[42px] px-3 rounded-lg border"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;">
              <input
                id="cfg-priority-ping-staff"
                type="checkbox"
                bind:checked={newPriority.pingStaff}
                class="rounded"
              />
              <span class="ml-2 text-sm" style="color: {$colorStore.text}">Notify staff</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
          <button
            class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
            onclick={() => showPriorityCreator = false}
          >
            Cancel
          </button>
          <button
            class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center gap-2"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            disabled={saving || !newPriority.id || !newPriority.name}
            onclick={createPriority}
          >
            {#if saving}
              <i class="fa-solid fa-spinner fa-spin"></i>
            {:else}
              <i class="fa-solid fa-plus"></i>
            {/if}
            Create Priority
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Tag Creator Modal -->
{#if showTagCreator}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.7);"
       role="dialog" aria-modal="true" tabindex="-1"
       onclick={(e) => { if (e.target === e.currentTarget) showTagCreator = false; }}
       onkeydown={(e) => { if (e.key === 'Escape') showTagCreator = false; }}>
    <div class="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">

      <h3 class="text-xl font-bold mb-6 flex items-center gap-3" style="color: {$colorStore.text}">
        <i class="fa-solid fa-tags" style="color: {$colorStore.accent};"></i>
        Create Tag
      </h3>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- ID -->
          <div>
            <label for="f-ConfigurationTab-label-396" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              ID <span style="color: #ef4444;">*</span>
            </label>
            <input id="f-ConfigurationTab-label-396"
              type="text"
              bind:value={newTag.id}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              placeholder="billing"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>

          <!-- Name -->
          <div>
            <label for="f-ConfigurationTab-label-410" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              Name <span style="color: #ef4444;">*</span>
            </label>
            <input id="f-ConfigurationTab-label-410"
              type="text"
              bind:value={newTag.name}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              placeholder="Billing Issue"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="f-ConfigurationTab-description-425" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Description
          </label>
          <textarea id="f-ConfigurationTab-description-425"
            bind:value={newTag.description}
            class="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
            placeholder="Issues related to billing and payments"
            rows="3"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
          <button
            class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
            onclick={() => showTagCreator = false}
          >
            Cancel
          </button>
          <button
            class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center gap-2"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            disabled={saving || !newTag.id || !newTag.name}
            onclick={createTag}
          >
            {#if saving}
              <i class="fa-solid fa-spinner fa-spin"></i>
            {:else}
              <i class="fa-solid fa-plus"></i>
            {/if}
            Create Tag
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
