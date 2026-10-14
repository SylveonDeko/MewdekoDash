<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    textChannels,
    showConfirm,
    fetchAllData
  } = $props();

  let saving = $state(false);
  let expandedOperation: string | null = $state(null);

  // Prune inactive users
  let pruneDays = $state(7);

  // Mass ban
  let massBanUserIds = $state("");
  let massBanReason = $state("");

  // Mass rename
  let massRenamePattern = $state("{username}");

  // Prune to message
  let pruneToChannel: string | null = $state(null);
  let pruneToMessageId = $state("");

  async function performPrune() {
    if (!$currentGuild?.id || pruneDays <= 0) return;

    try {
      saving = true;
      const result = await administrationApi.pruneUsers($currentGuild.id, { days: pruneDays });
      await fetchAllData();
      logger.info(`Pruned ${result.pruned} users`);
      return result;
    } catch (err) {
      logger.error("Failed to prune users:", err);
      throw err;
    } finally {
      saving = false;
    }
  }

  async function performMassBan() {
    if (!$currentGuild?.id || !massBanUserIds.trim()) return;

    try {
      saving = true;
      const userIds = massBanUserIds.split(/[\n,]/).map(id => BigInt(id.trim())).filter(id => id > 0n);
      const result = await administrationApi.massBan($currentGuild.id, {
        userIds,
        reason: massBanReason || "Mass ban"
      });
      logger.info(`Banned ${result.succeeded} users, ${result.failed} failed`);
      massBanUserIds = "";
      massBanReason = "";
      expandedOperation = null;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to mass ban:", err);
    } finally {
      saving = false;
    }
  }

  async function performMassRename() {
    if (!$currentGuild?.id || !massRenamePattern.trim()) return;

    try {
      saving = true;
      const result = await administrationApi.massRename($currentGuild.id, {
        pattern: massRenamePattern
      });
      logger.info(`Renamed ${result.renamed} users`);
      massRenamePattern = "{username}";
      expandedOperation = null;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to mass rename:", err);
    } finally {
      saving = false;
    }
  }

  async function performPruneToMessage() {
    if (!$currentGuild?.id || !pruneToChannel || !pruneToMessageId.trim()) return;

    try {
      saving = true;
      const result = await administrationApi.pruneToMessage($currentGuild.id, {
        channelId: BigInt(pruneToChannel),
        messageId: BigInt(pruneToMessageId)
      });
      logger.info(`Deleted ${result.deleted} messages`);
      pruneToChannel = null;
      pruneToMessageId = "";
      expandedOperation = null;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to prune to message:", err);
    } finally {
      saving = false;
    }
  }
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 200 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.accent}20, {$colorStore.accent}30);">
      <i class="fa-utility-duo fa-regular fa-bolt"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.advancedMassTitle()}</h2>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.administration.advancedMassSubtitle()}</p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Prune Inactive Users -->
    <div class="p-4 rounded-xl border"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
      <h3 class="font-semibold mb-3 flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-user-slash"></i>
        {m.administration.advancedMassPruneTitle()}
      </h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-1" for="prune-days" style="color: {$colorStore.text}">{m.administration.advancedMassPruneDays()}</label>
          <input bind:value={pruneDays}
                 class="w-full px-3 py-2 rounded-lg border transition-colors"
                 id="prune-days"
                 max="30"
                 min="1"
                 placeholder="7"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                 type="number"
          />
        </div>
        <button
          class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
          disabled={pruneDays <= 0 || saving}
          onclick={() => showConfirm(m.administration.advancedMassPruneConfirmTitle(), m.administration.advancedMassPruneConfirmMessage({ days: pruneDays }), performPrune)}
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        >
          {m.administration.advancedMassPruneExecute()}
        </button>
      </div>
    </div>

    <!-- Mass Ban -->
    <div class="p-4 rounded-xl border"
         style="background: {$colorStore.accent}05; border-color: {$colorStore.accent}30;">
      <h3 class="font-semibold mb-3 flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-gavel"></i>
        {m.administration.advancedMassBanTitle()}
      </h3>
      <button
        class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
        onclick={() => expandedOperation = expandedOperation === 'massBan' ? null : 'massBan'}
        style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
      >
        {expandedOperation === 'massBan' ? m.common.collapse() : m.common.configure()}
      </button>
    </div>

    <!-- Mass Rename -->
    <div class="p-4 rounded-xl border"
         style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}30;">
      <h3 class="font-semibold mb-3 flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-pen"></i>
        {m.administration.advancedMassRenameTitle()}
      </h3>
      <button
        class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
        onclick={() => expandedOperation = expandedOperation === 'massRename' ? null : 'massRename'}
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
      >
        {expandedOperation === 'massRename' ? m.common.collapse() : m.common.configure()}
      </button>
    </div>

    <!-- Prune to Message -->
    <div class="p-4 rounded-xl border"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
      <h3 class="font-semibold mb-3 flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-eraser"></i>
        {m.administration.advancedMassPruneMessageTitle()}
      </h3>
      <button
        class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
        onclick={() => expandedOperation = expandedOperation === 'pruneToMessage' ? null : 'pruneToMessage'}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        {expandedOperation === 'pruneToMessage' ? m.common.collapse() : m.common.configure()}
      </button>
    </div>
  </div>

  <!-- Expanded Mass Ban Form -->
  {#if expandedOperation === 'massBan'}
    <div transition:slide={{ duration: 300 }} class="mt-6 p-4 rounded-xl border-2 border-dashed"
         style="border-color: {$colorStore.accent}30; background: {$colorStore.accent}05;">
      <h4 class="font-medium mb-3" style="color: {$colorStore.text}">{m.administration.advancedMassBanConfig()}</h4>

      <div class="space-y-3">
        <div>
          <label for="mass-ban-users" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">
            {m.administration.advancedMassBanUserIds()}
          </label>
          <textarea
            id="mass-ban-users"
            bind:value={massBanUserIds}
            class="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
            placeholder={m.administration.advancedMassBanUserIdsPlaceholder()}
            rows="4"
          ></textarea>
        </div>

        <div>
          <label for="mass-ban-reason" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.banReason()}</label>
          <input
            id="mass-ban-reason"
            type="text"
            bind:value={massBanReason}
            placeholder={m.administration.advancedMassBanReasonPlaceholder()}
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          />
        </div>

        <button
          class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => showConfirm(m.administration.advancedMassBanTitle(), m.administration.advancedMassBanConfirmMessage({ count: massBanUserIds.split(/[\n,]/).filter(id => id.trim()).length }), performMassBan, "danger")}
          disabled={!massBanUserIds.trim() || saving}
        >
          {#if saving}
            <i class="fa-solid fa-spinner fa-spin"></i>
          {:else}
            <i class="fa-solid fa-gavel"></i>
          {/if}
          {m.administration.advancedMassBanExecute()}
        </button>
      </div>
    </div>
  {/if}

  <!-- Expanded Mass Rename Form -->
  {#if expandedOperation === 'massRename'}
    <div transition:slide={{ duration: 300 }} class="mt-6 p-4 rounded-xl border-2 border-dashed"
         style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
      <h4 class="font-medium mb-3" style="color: {$colorStore.text}">{m.administration.advancedMassRenameConfig()}</h4>

      <div class="space-y-3">
        <div>
          <label for="rename-pattern" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">
            {m.administration.advancedMassRenamePattern()}
          </label>
          <input
            id="rename-pattern"
            type="text"
            bind:value={massRenamePattern}
            placeholder="&#123;username&#125;"
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          />
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">
            {m.administration.advancedMassRenameHint({ placeholder: "{username}" })}
          </p>
        </div>

        <div class="p-3 rounded-lg" style="background: {$colorStore.accent}10;">
          <p class="text-xs" style="color: {$colorStore.accent}">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i>
            {m.administration.advancedMassRenameWarning()}
          </p>
        </div>

        <button
          class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => showConfirm(m.administration.advancedMassRenameTitle(), m.administration.advancedMassRenameConfirmMessage(), performMassRename, "danger")}
          disabled={!massRenamePattern.trim() || saving}
        >
          {#if saving}
            <i class="fa-solid fa-spinner fa-spin"></i>
          {:else}
            <i class="fa-solid fa-pen"></i>
          {/if}
          {m.administration.advancedMassRenameExecute()}
        </button>
      </div>
    </div>
  {/if}

  <!-- Expanded Prune to Message Form -->
  {#if expandedOperation === 'pruneToMessage'}
    <div transition:slide={{ duration: 300 }} class="mt-6 p-4 rounded-xl border-2 border-dashed"
         style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
      <h4 class="font-medium mb-3" style="color: {$colorStore.text}">{m.administration.advancedMassPruneMessageConfig()}</h4>

      <div class="space-y-3">
        <div>
          <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.channel()}</span>
          <DiscordSelector
            type="channel"
            options={textChannels}
            bind:selected={pruneToChannel}
            placeholder={m.common.selectChannelPlaceholder()}
            multiple={false}
          />
        </div>

        <div>
          <label for="prune-message-id" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">
            {m.administration.advancedMassPruneMessageId()}
          </label>
          <input
            id="prune-message-id"
            type="text"
            bind:value={pruneToMessageId}
            placeholder={m.administration.advancedMassPruneMessageIdPlaceholder()}
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          />
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">
            {m.administration.advancedMassPruneMessageHint()}
          </p>
        </div>

        <button
          class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => showConfirm(m.administration.advancedMassPruneMessageConfirmTitle(), m.administration.advancedMassPruneMessageConfirmMessage(), performPruneToMessage, "danger")}
          disabled={!pruneToChannel || !pruneToMessageId.trim() || saving}
        >
          {#if saving}
            <i class="fa-solid fa-spinner fa-spin"></i>
          {:else}
            <i class="fa-solid fa-eraser"></i>
          {/if}
          {m.administration.advancedMassPruneExecute()}
        </button>
      </div>
    </div>
  {/if}
</div>
