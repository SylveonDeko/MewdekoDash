<!-- lib/components/settings/BotGuildProfile.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { guildApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";

  // State
  let profile = $state({
    avatar: null as string | null,
    avatarUrl: null as string | null,
    banner: null as string | null,
    bannerUrl: null as string | null,
    bio: null as string | null,
    nickname: null as string | null
  });

  let loading = $state(true);
  let saving = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);

  // Edit states
  let editingAvatar = $state(false);
  let editingBanner = $state(false);
  let editingBio = $state(false);

  // Input values
  let avatarInput = $state("");
  let bannerInput = $state("");
  let bioInput = $state("");

  // File input refs
  let avatarFileInput: HTMLInputElement | undefined = $state();
  let bannerFileInput: HTMLInputElement | undefined = $state();

  function handleAvatarFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error = "File too large. Maximum size is 10MB.";
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      error = "Please select an image file.";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      avatarInput = base64;
      // Auto-save after file selection
      await saveAvatar();
    };
    reader.readAsDataURL(file);
  }

  function handleBannerFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error = "File too large. Maximum size is 10MB.";
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      error = "Please select an image file.";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      bannerInput = base64;
      // Auto-save after file selection
      await saveBanner();
    };
    reader.readAsDataURL(file);
  }

  async function fetchProfile() {
    if (!$currentGuild?.id) return;

    try {
      loading = true;
      const data = await guildApi.getBotGuildProfile($currentGuild.id);
      profile = data;
      bioInput = data.bio || "";
      error = null;
    } catch (err: any) {
      logger.error("Failed to fetch bot guild profile:", err);
      error = "Failed to load profile";
    } finally {
      loading = false;
    }
  }

  async function saveAvatar() {
    if (!$currentGuild?.id || !avatarInput.trim()) return;

    try {
      saving = true;
      error = null;
      await guildApi.setBotGuildProfile($currentGuild.id, {
        avatar: avatarInput.trim()
      });
      success = "Avatar updated successfully!";
      setTimeout(() => success = null, 3000);
      editingAvatar = false;
      avatarInput = "";
      await fetchProfile();
    } catch (err: any) {
      logger.error("Failed to save avatar:", err);
      error = "Failed to update avatar";
    } finally {
      saving = false;
    }
  }

  async function saveBanner() {
    if (!$currentGuild?.id || !bannerInput.trim()) return;

    try {
      saving = true;
      error = null;
      await guildApi.setBotGuildProfile($currentGuild.id, {
        banner: bannerInput.trim()
      });
      success = "Banner updated successfully!";
      setTimeout(() => success = null, 3000);
      editingBanner = false;
      bannerInput = "";
      await fetchProfile();
    } catch (err: any) {
      logger.error("Failed to save banner:", err);
      error = "Failed to update banner";
    } finally {
      saving = false;
    }
  }

  async function saveBio() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      error = null;
      await guildApi.setBotGuildProfile($currentGuild.id, {
        bio: bioInput.trim()
      });
      success = "Bio updated successfully!";
      setTimeout(() => success = null, 3000);
      editingBio = false;
      await fetchProfile();
    } catch (err: any) {
      logger.error("Failed to save bio:", err);
      error = "Failed to update bio";
    } finally {
      saving = false;
    }
  }

  function cancelEdit(type: 'avatar' | 'banner' | 'bio') {
    switch(type) {
      case 'avatar':
        editingAvatar = false;
        avatarInput = "";
        break;
      case 'banner':
        editingBanner = false;
        bannerInput = "";
        break;
      case 'bio':
        editingBio = false;
        bioInput = profile.bio || "";
        break;
    }
    error = null;
  }

  onMount(() => {
    fetchProfile();
  });

  // Watch for guild changes
  $effect(() => {
    if ($currentGuild) {
      fetchProfile();
    }
  });
</script>

<div class="backdrop-blur-xs rounded-xl p-4 md:p-6 transition-all hover:shadow-lg hover:-translate-y-px border"
     style="background: {$colorStore.primary}05;
            border-color: {$colorStore.primary}15;"
     in:fly={{ y: 20, duration: 300 }}>

  <!-- Header -->
  <div class="flex items-center gap-3 mb-4">
    <div class="p-2 rounded-lg"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-user-circle text-xl"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-lg font-bold" style="color: {$colorStore.text}">Bot Guild Profile</h2>
      <p class="text-xs md:text-sm" style="color: {$colorStore.muted}">Customize bot appearance in this server</p>
    </div>
  </div>

  <!-- Status Messages -->
  {#if error}
    <div class="mb-4 p-3 rounded-lg flex items-center gap-2"
         style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;"
         transition:fly={{ y: -10, duration: 200 }}>
      <i class="fa-utility-duo fa-regular fa-exclamation-circle"
         style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.accent};"></i>
      <span class="text-sm" style="color: {$colorStore.text}">{error}</span>
    </div>
  {/if}

  {#if success}
    <div class="mb-4 p-3 rounded-lg flex items-center gap-2"
         style="background: {$colorStore.secondary}15; border: 1px solid {$colorStore.secondary}30;"
         transition:fly={{ y: -10, duration: 200 }}>
      <i class="fa-utility-duo fa-regular fa-check-circle"
         style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.secondary};"></i>
      <span class="text-sm" style="color: {$colorStore.text}">{success}</span>
    </div>
  {/if}

  {#if loading}
    <!-- Loading State -->
    <div class="space-y-3 animate-pulse">
      <div class="h-32 rounded-lg" style="background: {$colorStore.primary}15;"></div>
      <div class="h-24 rounded-lg" style="background: {$colorStore.primary}15;"></div>
      <div class="h-20 rounded-lg" style="background: {$colorStore.primary}15;"></div>
    </div>
  {:else}
    <div class="space-y-4">

      <!-- Avatar Section -->
      <div class="p-3 md:p-4 rounded-lg border"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-3 mb-3">
          <div class="flex items-center gap-3 flex-1">
            {#if profile.avatarUrl}
              <img src={profile.avatarUrl} alt="Bot Avatar" class="w-12 h-12 md:w-16 md:h-16 rounded-full">
            {:else}
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <i class="fa-utility-duo fa-regular fa-user-circle text-3xl"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
              </div>
            {/if}
            <div class="flex-1">
              <h3 class="font-semibold text-sm md:text-base" style="color: {$colorStore.text}">Guild Avatar</h3>
              <p class="text-xs" style="color: {$colorStore.muted}">Custom avatar for this server</p>
            </div>
          </div>
          {#if !editingAvatar}
            <div class="flex gap-2">
              <button
                class="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                onclick={() => avatarFileInput?.click()}>
                <span class="flex items-center gap-1.5">
                  <i class="fa-utility-duo fa-regular fa-file"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                  <span class="hidden md:inline">Upload</span>
                </span>
              </button>
              <button
                class="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                onclick={() => editingAvatar = true}>
                <span class="flex items-center gap-1.5">
                  <i class="fa-utility-duo fa-regular fa-image"
                     style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
                  <span class="hidden md:inline">URL</span>
                </span>
              </button>
            </div>
          {/if}
        </div>

        <!-- Hidden file input -->
        <input
          bind:this={avatarFileInput}
          type="file"
          accept="image/*"
          class="hidden"
          onchange={handleAvatarFileSelect} />

        {#if editingAvatar}
          <div class="space-y-2" transition:fly={{ y: -10, duration: 200 }}>
            <input
              type="text"
              bind:value={avatarInput}
              placeholder="Enter image URL"
              class="w-full px-3 py-2 rounded-lg text-sm"
              style="background: {$colorStore.background}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;" />
            <div class="flex gap-2">
              <button
                class="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                onclick={saveAvatar}
                disabled={saving || !avatarInput.trim()}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                class="px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
                onclick={() => cancelEdit('avatar')}>
                Cancel
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Banner Section -->
      <div class="p-3 md:p-4 rounded-lg border"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="flex flex-col gap-3 mb-3">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-sm md:text-base" style="color: {$colorStore.text}">Guild Banner</h3>
              <p class="text-xs" style="color: {$colorStore.muted}">Custom banner for this server</p>
            </div>
            {#if !editingBanner}
              <div class="flex gap-2">
                <button
                  class="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                  onclick={() => bannerFileInput?.click()}>
                  <span class="flex items-center gap-1.5">
                    <i class="fa-utility-duo fa-regular fa-file"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                    <span class="hidden md:inline">Upload</span>
                  </span>
                </button>
                <button
                  class="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                  onclick={() => editingBanner = true}>
                  <span class="flex items-center gap-1.5">
                    <i class="fa-utility-duo fa-regular fa-image"
                       style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
                    <span class="hidden md:inline">URL</span>
                  </span>
                </button>
              </div>
            {/if}
          </div>
          {#if profile.bannerUrl}
            <img src={profile.bannerUrl} alt="Bot Banner" class="w-full h-24 md:h-32 object-cover rounded-lg">
          {:else}
            <div class="w-full h-24 md:h-32 rounded-lg flex items-center justify-center"
                 style="background: {$colorStore.primary}10;">
              <p class="text-xs" style="color: {$colorStore.muted}">No banner set</p>
            </div>
          {/if}
        </div>

        <!-- Hidden file input -->
        <input
          bind:this={bannerFileInput}
          type="file"
          accept="image/*"
          class="hidden"
          onchange={handleBannerFileSelect} />

        {#if editingBanner}
          <div class="space-y-2" transition:fly={{ y: -10, duration: 200 }}>
            <input
              type="text"
              bind:value={bannerInput}
              placeholder="Enter image URL"
              class="w-full px-3 py-2 rounded-lg text-sm"
              style="background: {$colorStore.background}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;" />
            <div class="flex gap-2">
              <button
                class="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                onclick={saveBanner}
                disabled={saving || !bannerInput.trim()}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                class="px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
                onclick={() => cancelEdit('banner')}>
                Cancel
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Bio Section -->
      <div class="p-3 md:p-4 rounded-lg border"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="flex items-center justify-between mb-3">
          <div class="flex-1">
            <h3 class="font-semibold text-sm md:text-base" style="color: {$colorStore.text}">Guild Bio</h3>
            <p class="text-xs" style="color: {$colorStore.muted}">Custom bio for this server</p>
          </div>
          {#if !editingBio}
            <button
              class="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
              onclick={() => editingBio = true}>
              Edit
            </button>
          {/if}
        </div>

        {#if editingBio}
          <div class="space-y-2" transition:fly={{ y: -10, duration: 200 }}>
            <textarea
              bind:value={bioInput}
              placeholder="Enter bot bio for this server..."
              rows="3"
              class="w-full px-3 py-2 rounded-lg text-sm resize-none"
              style="background: {$colorStore.background}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            ></textarea>
            <div class="flex gap-2">
              <button
                class="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                onclick={saveBio}
                disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                class="px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
                onclick={() => cancelEdit('bio')}>
                Cancel
              </button>
            </div>
          </div>
        {:else}
          <p class="text-sm whitespace-pre-wrap" style="color: {bioInput ? $colorStore.text : $colorStore.muted}">
            {bioInput || "No bio set"}
          </p>
        {/if}
      </div>

      <!-- Info Note -->
      <div class="p-3 rounded-lg text-xs" style="background: {$colorStore.primary}08; color: {$colorStore.muted}">
        <strong style="color: {$colorStore.text}">Note:</strong> These settings only affect how the bot appears in this specific server.
        The bot's global profile remains unchanged.
      </div>
    </div>
  {/if}
</div>
