<script lang="ts">
  import { m } from "$lib/i18n";
  /**
   * The defaults every form in this server falls back to.
   */
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { clientApi, formsApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import EmojiPicker from "./EmojiPicker.svelte";

  interface Props {
    /** The signed-in user, whose accessible emoji the picker offers. */
    userId: bigint;
    onShowNotification: (message: string, type: "success" | "error") => void;
  }

  let { userId, onShowNotification }: Props = $props();

  let approveEmote = $state<string | null>(null);
  let rejectEmote = $state<string | null>(null);
  let guildEmojis = $state<any[]>([]);

  let loading = $state(true);
  let saving = $state(false);

  async function load() {
    if (!$currentGuild?.id) return;

    try {
      loading = true;

      const [emojis, defaults] = await Promise.all([
        clientApi.getEmojis(userId, false).catch(() => []),
        formsApi.getReviewEmotes($currentGuild.id).catch(() => null)
      ]);

      guildEmojis = emojis || [];
      approveEmote = defaults?.approveEmote ?? null;
      rejectEmote = defaults?.rejectEmote ?? null;
    } catch (err) {
      onShowNotification(m.forms.settingsGuildLoadFailed(), "error");
    } finally {
      loading = false;
    }
  }

  async function save() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;

      await formsApi.setReviewEmotes($currentGuild.id, {
        approveEmote: approveEmote || null,
        rejectEmote: rejectEmote || null
      });

      onShowNotification(m.forms.settingsGuildSaved(), "success");
    } catch (err: any) {
      onShowNotification(err?.message || m.forms.settingsGuildSaveFailed(), "error");
    } finally {
      saving = false;
    }
  }

  function reset() {
    approveEmote = null;
    rejectEmote = null;
  }

  onMount(load);
</script>

<div class="space-y-4">
  <div
    class="rounded-xl border p-5"
    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}25;"
  >
    <h2 class="text-xl font-bold mb-1" style="color: {$colorStore.text};">{m.common.serverDefaults()}</h2>
    <p class="text-sm" style="color: {$colorStore.muted};">
      {m.forms.settingsGuildSubtitle()}
    </p>
  </div>

  {#if loading}
    <div class="p-10 text-center" style="color: {$colorStore.muted};">
      <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
      <div>{m.forms.settingsGuildLoading()}</div>
    </div>
  {:else}
    <div
      class="rounded-xl border p-5 space-y-4"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}25;"
      in:fade={{ duration: 150 }}
    >
      <div>
        <h3 class="font-semibold mb-1" style="color: {$colorStore.text};">
          <i class="fa-solid fa-gavel mr-2" style="color: {$colorStore.primary};"></i>
          {m.forms.settingsGuildReviewButtons()}
        </h3>
        <p class="text-sm" style="color: {$colorStore.muted};">
          {m.forms.settingsGuildReviewButtonsHint()}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="guild-approve-emote" class="block text-sm mb-2" style="color: {$colorStore.muted};">
            {m.common.approve()}
          </label>
          <EmojiPicker
            id="guild-approve-emote"
            {guildEmojis}
            bind:selected={approveEmote}
            multiple={false}
            placeholder="✅"
            searchable={true}
            groupByGuild={true}
          />
        </div>

        <div>
          <label for="guild-reject-emote" class="block text-sm mb-2" style="color: {$colorStore.muted};">
            {m.forms.queueReject()}
          </label>
          <EmojiPicker
            id="guild-reject-emote"
            {guildEmojis}
            bind:selected={rejectEmote}
            multiple={false}
            placeholder="❌"
            searchable={true}
            groupByGuild={true}
          />
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          type="button"
          onclick={save}
          disabled={saving}
          class="flex-1 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
          style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.secondary}30;"
        >
          {#if saving}
            <i class="fa-solid fa-spinner fa-spin mr-2"></i>
            {m.common.saving()}
          {:else}
            <i class="fa-solid fa-check mr-2"></i>
            {m.common.save()}
          {/if}
        </button>

        <button
          type="button"
          onclick={reset}
          disabled={saving || (!approveEmote && !rejectEmote)}
          class="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-40"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}25;"
        >
          {m.forms.settingsGuildUseBuiltin()}
        </button>
      </div>
    </div>
  {/if}
</div>
