<!-- components/tabs/ConfigurationTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
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
        {m.tickets.configPrioritiesTitle({ count: priorities.length })}
      </h3>
      <button
        class="px-3 py-2 rounded-lg transition-all hover:scale-[1.02] text-sm font-medium"
        onclick={() => showPriorityCreator = true}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-plus"></i>
        {m.common.new()}
      </button>
    </div>

    {#if priorities.length === 0}
      <div class="text-center py-8">
        <i class="fa-solid fa-flag" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
        <p class="mt-4" style="color: {$colorStore.muted}">{m.tickets.configPrioritiesEmpty()}</p>
        <p class="text-sm mt-2" style="color: {$colorStore.muted}">{m.tickets.configPrioritiesEmptyHint()}</p>
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
                    {m.common.levelNumber({ level: priority.level })}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs" style="color: {$colorStore.muted}">
                  <span>{m.common.idLabel({ id: priority.id })}</span>
                  <span>{m.tickets.configPingStaffLabel({ value: priority.pingStaff ? m.common.yes() : m.common.no() })}</span>
                </div>
              </div>
              <button
                class="px-2 py-1 rounded transition-all hover:scale-110 text-sm"
                style="background: #ef444420; color: #ef4444;"
                aria-label={m.tickets.configDeletePriorityAria({ name: priority.name })}
                onclick={() => showConfirm(
                  m.tickets.configDeletePriorityTitle(),
                  m.tickets.configDeletePriorityConfirm({ name: priority.name }),
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
        {m.tickets.configTagsTitle({ count: tags.length })}
      </h3>
      <button
        class="px-3 py-2 rounded-lg transition-all hover:scale-[1.02] text-sm font-medium"
        onclick={() => showTagCreator = true}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-plus"></i>
        {m.common.new()}
      </button>
    </div>

    {#if tags.length === 0}
      <div class="text-center py-8">
        <i class="fa-solid fa-tags" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
        <p class="mt-4" style="color: {$colorStore.muted}">{m.tickets.configTagsEmpty()}</p>
        <p class="text-sm mt-2" style="color: {$colorStore.muted}">{m.tickets.configTagsEmptyHint()}</p>
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
                  {m.common.idLabel({ id: tag.id })}
                </p>
                {#if tag.description}
                  <p class="text-sm mt-2" style="color: {$colorStore.muted}">{tag.description}</p>
                {/if}
              </div>
              <button
                class="px-2 py-1 rounded transition-all hover:scale-110 text-sm"
                style="background: #ef444420; color: #ef4444;"
                aria-label={m.tickets.configDeleteTagAria({ name: tag.name })}
                onclick={() => showConfirm(
                  m.tickets.configDeleteTagTitle(),
                  m.tickets.configDeleteTagConfirm({ name: tag.name }),
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
      {m.tickets.configTranscriptChannel()}
    </h3>
    <div class="space-y-4">
      <DiscordSelector
        bind:selected={tempTranscriptChannel}
        multiple={false}
        options={textChannels}
        placeholder={m.tickets.configTranscriptChannelPlaceholder()}
        type="channel"
      />
      <button
        class="w-full px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center justify-center gap-2"
        disabled={saving}
        onclick={saveTranscriptChannel}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-floppy-disk"></i>
        {m.common.saveChannel()}
      </button>
    </div>
  </div>

  <!-- Log Channel -->
  <div class="rounded-2xl border p-6 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
      <i class="fa-solid fa-clipboard-list" style="color: {$colorStore.accent};"></i>
      {m.common.logChannel()}
    </h3>
    <div class="space-y-4">
      <DiscordSelector
        bind:selected={tempLogChannel}
        multiple={false}
        options={textChannels}
        placeholder={m.tickets.configLogChannelPlaceholder()}
        type="channel"
      />
      <button
        class="w-full px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center justify-center gap-2"
        disabled={saving}
        onclick={saveLogChannel}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-floppy-disk"></i>
        {m.common.saveChannel()}
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
        {m.tickets.configCreatePriority()}
      </h3>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- ID -->
          <div>
            <label for="f-ConfigurationTab-label-272" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.common.id()} <span style="color: #ef4444;">*</span>
            </label>
            <input id="f-ConfigurationTab-label-272"
              type="text"
              bind:value={newPriority.id}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              placeholder={m.tickets.configPriorityIdPlaceholder()}
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>

          <!-- Name -->
          <div>
            <label for="f-ConfigurationTab-label-286" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.common.name()} <span style="color: #ef4444;">*</span>
            </label>
            <input id="f-ConfigurationTab-label-286"
              type="text"
              bind:value={newPriority.name}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              placeholder={m.tickets.configPriorityNamePlaceholder()}
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
        </div>

        <!-- Emoji -->
        <div>
          <label for="f-ConfigurationTab-emoji-optional-301" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            {m.common.emoji()} {m.common.optionalSuffix()}
          </label>
          <EmojiPicker id="f-ConfigurationTab-emoji-optional-301"
            {guildEmojis}
            bind:selected={newPriority.emoji}
            multiple={false}
            placeholder={m.common.selectEmojiPlaceholder()}
            searchable={true}
            groupByGuild={true}
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Level -->
          <div>
            <label for="f-ConfigurationTab-level-317" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.common.level()}
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
              {m.tickets.configPingStaff()}
            </label>
            <div class="flex items-center h-[42px] px-3 rounded-lg border"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;">
              <input
                id="cfg-priority-ping-staff"
                type="checkbox"
                bind:checked={newPriority.pingStaff}
                class="rounded"
              />
              <span class="ml-2 text-sm" style="color: {$colorStore.text}">{m.tickets.configNotifyStaff()}</span>
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
            {m.common.cancel()}
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
            {m.tickets.configCreatePriority()}
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
        {m.tickets.configCreateTag()}
      </h3>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- ID -->
          <div>
            <label for="f-ConfigurationTab-label-396" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.common.id()} <span style="color: #ef4444;">*</span>
            </label>
            <input id="f-ConfigurationTab-label-396"
              type="text"
              bind:value={newTag.id}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              placeholder={m.tickets.configTagIdPlaceholder()}
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>

          <!-- Name -->
          <div>
            <label for="f-ConfigurationTab-label-410" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.common.name()} <span style="color: #ef4444;">*</span>
            </label>
            <input id="f-ConfigurationTab-label-410"
              type="text"
              bind:value={newTag.name}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              placeholder={m.tickets.configTagNamePlaceholder()}
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="f-ConfigurationTab-description-425" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            {m.common.description()}
          </label>
          <textarea id="f-ConfigurationTab-description-425"
            bind:value={newTag.description}
            class="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
            placeholder={m.tickets.configTagDescriptionPlaceholder()}
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
            {m.common.cancel()}
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
            {m.tickets.configCreateTag()}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
