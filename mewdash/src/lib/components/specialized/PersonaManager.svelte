<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { embedsApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger.ts";
  import Portal from "$lib/components/ui/Portal.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import type { EmbedPersona } from "$lib/api/embeds/models";

  interface Props {
    isOpen?: boolean;
    personas?: EmbedPersona[];
    userId?: bigint | null;
    guildId?: bigint | null;
    guildName?: string | null;
    /** Called after any change, so the parent can reload its persona list. */
    onchanged?: () => void;
    onnotify?: (message: string, type: "success" | "error") => void;
  }

  let {
    isOpen = $bindable(false),
    personas = [],
    userId = null,
    guildId = null,
    guildName = null,
    onchanged,
    onnotify
  }: Props = $props();

  /** The modal shows one thing at a time: the list of personas, or the add/edit form. */
  let view = $state<"list" | "form">("list");
  let editingId: number | null = $state(null);

  let name = $state("");
  let avatarMode = $state<"url" | "upload">("url");
  let avatarUrl = $state("");
  let avatarData = $state("");
  let avatarFileName = $state("");
  let hasStoredUpload = $state(false);
  /** The avatar already saved on the persona, so editing shows it instead of an empty preview. */
  let storedAvatarUrl = $state("");
  let shared = $state(false);
  let saving = $state(false);

  let pendingDelete: EmbedPersona | null = $state(null);
  let showDeleteConfirm = $state(false);
  let fileInput: HTMLInputElement | undefined = $state();

  function notify(message: string, type: "success" | "error" = "success") {
    onnotify?.(message, type);
  }

  function close() {
    isOpen = false;
    view = "list";
    resetForm();
  }

  function resetForm() {
    editingId = null;
    name = "";
    avatarMode = "url";
    avatarUrl = "";
    avatarData = "";
    avatarFileName = "";
    hasStoredUpload = false;
    storedAvatarUrl = "";
    shared = false;
  }

  function startCreate() {
    resetForm();
    view = "form";
  }

  function startEdit(persona: EmbedPersona) {
    editingId = persona.id;
    name = persona.name;
    avatarMode = persona.hasUploadedAvatar ? "upload" : "url";
    avatarUrl = persona.avatarUrl ?? "";
    avatarData = "";
    avatarFileName = "";
    hasStoredUpload = persona.hasUploadedAvatar;
    storedAvatarUrl = persona.avatarUrl ?? "";
    shared = persona.isGuildShared;
    view = "form";
  }

  function backToList() {
    resetForm();
    view = "list";
  }

  /**
   * Reads a picked image into a data URI, rejecting non-images and anything over the bot's 8MB ceiling.
   */
  function handleUpload(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("The avatar must be an image", "error");
      input.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      notify("The avatar must be 8MB or smaller", "error");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      avatarData = typeof reader.result === "string" ? reader.result : "";
      avatarFileName = file.name;
    };
    reader.onerror = () => notify("Could not read that image", "error");
    reader.readAsDataURL(file);
  }

  /**
   * Creates or updates a persona. On edit the avatar fields are only sent when something new was picked,
   * so leaving them alone keeps whatever is already stored.
   */
  async function save() {
    if (!userId) {
      notify("You must be logged in to save personas", "error");
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      notify("Give the persona a name", "error");
      return;
    }

    if (shared && !guildId) {
      notify("Select a server to share a persona", "error");
      return;
    }

    const url = avatarMode === "url" && avatarUrl.trim() ? avatarUrl.trim() : null;
    const data = avatarMode === "upload" && avatarData ? avatarData : null;

    saving = true;
    try {
      if (editingId !== null) {
        await embedsApi.updatePersona(editingId, { userId, name: trimmed, avatarUrl: url, avatarData: data });
        notify(`Updated "${trimmed}"`);
      } else {
        await embedsApi.createPersona({
          userId,
          guildId: shared ? guildId : null,
          name: trimmed,
          avatarUrl: url,
          avatarData: data,
          isGuildShared: shared
        });
        notify(`Created "${trimmed}"`);
      }

      onchanged?.();
      backToList();
    } catch (error: any) {
      logger.error("Failed to save persona:", error);
      notify(error?.message || "Failed to save persona", "error");
    } finally {
      saving = false;
    }
  }

  function requestDelete(persona: EmbedPersona) {
    pendingDelete = persona;
    showDeleteConfirm = true;
  }

  async function confirmDelete() {
    const persona = pendingDelete;
    pendingDelete = null;
    if (!persona || !userId) return;

    try {
      await embedsApi.deletePersona(persona.id, userId);
      notify(`Deleted "${persona.name}"`);
      if (editingId === persona.id) backToList();
      onchanged?.();
    } catch (error) {
      logger.error("Failed to delete persona:", error);
      notify("Failed to delete persona", "error");
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") close();
  }

  let canSave = $derived(!saving && name.trim().length > 0);
  let previewUrl = $derived(avatarMode === "upload" ? avatarData || storedAvatarUrl : avatarUrl.trim());
</script>

{#if isOpen}
  <Portal>
    <div
      class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="persona-modal-title"
      tabindex="-1"
      onkeydown={handleKeydown}
    >
      <!-- Clicking the backdrop closes, but only the backdrop itself -->
      <button
        aria-label="Close"
        class="absolute inset-0 w-full h-full cursor-default"
        onclick={close}
        tabindex="-1"
      ></button>

      <div
        class="relative rounded-2xl border shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        transition:fly={{ y: 12, duration: 200 }}
      >
        <!-- Header -->
        <div
          class="flex items-center gap-3 p-4 border-b shrink-0"
          style="border-color: {$colorStore.primary}20;"
        >
          {#if view === "form"}
            <button
              aria-label="Back to the persona list"
              class="p-2 rounded-lg transition-all min-h-[44px] min-w-[44px]"
              style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
              onclick={backToList}
            >
              <i class="fa-solid fa-arrow-left" style="font-size: 14px;"></i>
            </button>
          {/if}

          <h2 class="flex-1 text-lg font-semibold" id="persona-modal-title" style="color: {$colorStore.text};">
            {view === "list" ? "Send as personas" : editingId === null ? "New persona" : "Edit persona"}
          </h2>

          <button
            aria-label="Close"
            class="p-2 rounded-lg transition-all min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
            onclick={close}
          >
            <i class="fa-solid fa-xmark" style="font-size: 14px;"></i>
          </button>
        </div>

        <div class="p-4 overflow-y-auto flex-1">
          {#if view === "list"}
            <div class="space-y-3">
              <p class="text-xs" style="color: {$colorStore.muted};">
                A persona is a saved name and avatar your messages can be sent under.
              </p>

              <button
                aria-label="Create a new persona"
                class="w-full px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.01] flex items-center justify-center gap-2 min-h-[44px]"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                onclick={startCreate}
              >
                <i class="fa-solid fa-plus" style="font-size: 14px;"></i>
                New persona
              </button>

              {#if personas.length === 0}
                <p class="text-sm text-center py-6" style="color: {$colorStore.muted};">
                  No personas yet. Create one to send messages under a custom name and avatar.
                </p>
              {:else}
                {#each personas as persona (persona.id)}
                  <div
                    class="flex items-center gap-3 p-3 rounded-lg border"
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                  >
                    {#if persona.avatarUrl}
                      <img
                        alt=""
                        class="w-10 h-10 rounded-full object-cover shrink-0"
                        src={persona.avatarUrl}
                      />
                    {:else}
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                      >
                        <i
                          class="fa-solid {persona.hasUploadedAvatar ? 'fa-image' : 'fa-user'}"
                          style="font-size: 14px;"
                        ></i>
                      </div>
                    {/if}

                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate" style="color: {$colorStore.text};">
                        {persona.name}
                      </p>
                      <p class="text-xs" style="color: {$colorStore.muted};">
                        {persona.isGuildShared ? `Shared with ${guildName ?? "this server"}` : "Personal"}
                      </p>
                    </div>

                    <button
                      aria-label="Edit {persona.name}"
                      class="p-2 rounded-lg transition-all shrink-0 min-h-[44px] min-w-[44px]"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                      onclick={() => startEdit(persona)}
                    >
                      <i class="fa-solid fa-pen" style="font-size: 12px;"></i>
                    </button>
                    <button
                      aria-label="Delete {persona.name}"
                      class="p-2 rounded-lg transition-all shrink-0 min-h-[44px] min-w-[44px]"
                      style="background: #ED424520; color: #ED4245;"
                      onclick={() => requestDelete(persona)}
                    >
                      <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                    </button>
                  </div>
                {/each}
              {/if}
            </div>
          {:else}
            <div class="space-y-4">
              <!-- Live preview of how the persona will appear -->
              <div class="flex items-center gap-3">
                {#if previewUrl}
                  <img alt="" class="w-14 h-14 rounded-full object-cover shrink-0" src={previewUrl} />
                {:else}
                  <div
                    class="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                  >
                    <i
                      class="fa-solid {hasStoredUpload ? 'fa-image' : 'fa-user'}"
                      style="font-size: 18px;"
                    ></i>
                  </div>
                {/if}
                <div class="min-w-0">
                  <p class="text-sm font-medium truncate" style="color: {$colorStore.text};">
                    {name.trim() || "Unnamed persona"}
                  </p>
                  <p class="text-xs" style="color: {$colorStore.muted};">How messages will appear</p>
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-sm font-medium" for="persona-name" style="color: {$colorStore.text};">
                  Name
                </label>
                <input
                  id="persona-name"
                  type="text"
                  class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                  style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  placeholder="Announcements"
                  maxlength="80"
                  bind:value={name}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm font-medium" style="color: {$colorStore.text};">Avatar</span>
                <div class="flex gap-2">
                  <button
                    aria-label="Use an image URL"
                    class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px]"
                    style="background: {$colorStore.primary}{avatarMode === 'url' ? '30' : '10'};
                           color: {$colorStore.primary};
                           border: 1px solid {$colorStore.primary}30;"
                    onclick={() => (avatarMode = "url")}
                  >
                    Link
                  </button>
                  <button
                    aria-label="Upload an image"
                    class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px]"
                    style="background: {$colorStore.primary}{avatarMode === 'upload' ? '30' : '10'};
                           color: {$colorStore.primary};
                           border: 1px solid {$colorStore.primary}30;"
                    onclick={() => (avatarMode = "upload")}
                  >
                    Upload
                  </button>
                </div>

                {#if avatarMode === "url"}
                  <input
                    type="url"
                    class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    placeholder="https://example.com/avatar.png"
                    bind:value={avatarUrl}
                  />
                {:else}
                  <!-- The native file input is unstyleable, so it is hidden behind a real button -->
                  <input
                    bind:this={fileInput}
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={handleUpload}
                  />
                  <button
                    aria-label="Choose an image file"
                    class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.01] flex items-center justify-center gap-2 min-h-[44px]"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                    onclick={() => fileInput?.click()}
                  >
                    <i class="fa-solid fa-arrow-up-from-bracket" style="font-size: 14px;"></i>
                    {avatarFileName || hasStoredUpload ? "Choose a different image" : "Choose an image"}
                  </button>
                  {#if avatarFileName}
                    <p class="text-xs truncate" style="color: {$colorStore.muted};">{avatarFileName}</p>
                  {:else if hasStoredUpload}
                    <p class="text-xs" style="color: {$colorStore.muted};">
                      An uploaded image is already saved.
                    </p>
                  {/if}
                  <p class="text-xs" style="color: {$colorStore.muted};">
                    PNG, JPG, or GIF up to 8MB. Uploaded avatars use one webhook per channel this
                    persona posts in; a link does not.
                  </p>
                {/if}
              </div>

              {#if guildId && editingId === null}
                <label class="flex items-center gap-2 text-sm min-h-[44px]" style="color: {$colorStore.text};">
                  <input type="checkbox" bind:checked={shared} />
                  Share with everyone in {guildName ?? "this server"}
                </label>
              {/if}
            </div>
          {/if}
        </div>

        {#if view === "form"}
          <div class="flex gap-2 p-4 border-t shrink-0" style="border-color: {$colorStore.primary}20;">
            <button
              aria-label="Cancel"
              class="px-4 py-2 rounded-lg font-medium transition-all min-h-[44px]"
              style="background: {$colorStore.primary}10; color: {$colorStore.muted}; border: 1px solid {$colorStore.primary}20;"
              onclick={backToList}
            >
              Cancel
            </button>
            <button
              aria-label="Save persona"
              class="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.01] disabled:opacity-50 min-h-[44px]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              disabled={!canSave}
              onclick={save}
            >
              {saving ? "Saving..." : editingId === null ? "Create persona" : "Save changes"}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </Portal>
{/if}

<ConfirmationModal
  bind:isOpen={showDeleteConfirm}
  title="Delete Persona"
  message={`Delete the persona "${pendingDelete?.name ?? "this persona"}"? Messages already sent as it are unaffected.`}
  confirmText="Delete"
  variant="danger"
  oncancel={() => pendingDelete = null}
  onconfirm={confirmDelete}
/>
