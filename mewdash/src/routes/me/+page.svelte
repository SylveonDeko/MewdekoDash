<!-- routes/me/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { clientApi, guildApi, lastfmApi, meApi, xpApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { clickOutside } from "$lib/clickOutside";
  import Notification from "$lib/components/ui/Notification.svelte";
  import { dyslexicFontStore } from "$lib/stores/accessibilityStore.ts";

  let {data} = $props();

  // State
    let loading = $state(false);
  let saving = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let showNotification = $state(false);

  // User data
  let currentUser = $derived(data.user);
  let userId = $derived(BigInt(currentUser?.id || "0"));

  // Global data (loads immediately)
  let userProfile: any = $state({});
  let userPreferences: any = $state({});
  let editingProfile = $state(false);
  let profileForm: any = $state({});
  let lastFmStatus: any = $state({ linked: false, username: null, scrobblingEnabled: false });
  let lastFmUserInfo: any = $state(null);
  let lastFmRecentTracks: any[] = $state([]);
  let lastFmTopArtists: any[] = $state([]);
  let lastFmTopAlbums: any[] = $state([]);
  let lastFmPeriod = $state("7day");
  let loadingLastFmStats = $state(false);

  // Server selection for per-server settings
  let availableGuilds: any[] = $state([]);
  let selectedGuild: any = $state(null);
  let showGuildDropdown = $state(false);
  let guildSearchTerm = $state("");
  let guildConfig: any = $state(null);

  // Per-server data (loads after guild selection)
  let serverData: any = $state({
    highlights: [],
    highlightSettings: { highlightsEnabled: true, ignoredChannels: [], ignoredUsers: [] },
    afkStatus: { isAfk: false, message: "", when: null, wasTimed: false },
    xpStats: null,
    reputation: { totalRep: 0, rank: 0, totalGiven: 0, totalReceived: 0 },
    suggestions: [],
    currency: { balance: 0, recentTransactions: [] },
    giveaways: [],
    reminders: [],
    invites: { inviteCount: 0, invitedUsers: [] },
    messages: { totalMessages: 0, channelBreakdown: [] },
    starboard: null,
    analytics: {}
  });

  // Form state
  let newHighlightWord = $state("");
  let newAfkMessage = $state("");

  // Load global profile data
  async function loadGlobalData() {
    if (!userId) return;

    loading = true;
    try {
      const dummyGuildId = BigInt("0");
      const [profile, preferences, lastfm] = await Promise.all([
        meApi.getUserProfile(dummyGuildId, userId).catch(() => ({})),
        meApi.getUserPreferences(dummyGuildId, userId).catch(() => ({})),
        lastfmApi.getStatus(dummyGuildId, userId).catch(() => ({
          linked: false,
          username: null,
          scrobblingEnabled: false
        }))
      ]);

      userProfile = profile;
      userPreferences = preferences;
      lastFmStatus = lastfm;

      // Load Last.fm stats if linked
      if (lastfm.linked) {
        await loadLastFmStats();
      }

      profileForm = {
        bio: (profile as any).bio || "",
        pronouns: (profile as any).pronouns || "",
        zodiacSign: (profile as any).zodiacSign || "",
        switchFriendCode: (profile as any).switchFriendCode || "",
        profileImageUrl: (profile as any).profileImageUrl || "",
        profileColor: (profile as any).profileColor ? "#" + (profile as any).profileColor.toString(16).padStart(6, "0") : "",
        birthday: (profile as any).birthday ? new Date((profile as any).birthday).toISOString().split("T")[0] : "",
        birthdayTimezone: (profile as any).birthdayTimezone || "UTC",
        profilePrivacy: (profile as any).profilePrivacy || 0,
        birthdayDisplayMode: (profile as any).birthdayDisplayMode || 0
      };
    } catch (err) {
      logger.error("Failed to load profile:", err);
      showMessage("Failed to load profile data", "error");
    } finally {
      loading = false;
    }
  }

  // Load available guilds
  async function loadAvailableGuilds() {
    if (!userId) return;

    try {
      const guilds = await clientApi.getMutualGuilds(userId, false);
      availableGuilds = guilds || [];
    } catch (err) {
      logger.error("Failed to load guilds:", err);
    }
  }

  // Load server-specific data
  async function loadServerData() {
    if (!selectedGuild?.id || !userId) return;

    loading = true;
    try {
      const [
        highlights, hlSettings, afk, xpStats, reputation, suggestions,
        currency, giveaways, reminders, invites, messages, starboard, analytics, config
      ] = await Promise.all([
        meApi.getHighlights(selectedGuild.id, userId).catch(() => []),
        meApi.getHighlightSettings(selectedGuild.id, userId).catch(() => ({
          highlightsEnabled: true, ignoredChannels: [], ignoredUsers: []
        })),
        meApi.getAfkStatus(selectedGuild.id, userId).catch(() => ({
          isAfk: false, message: "", when: null, wasTimed: false
        })),
        xpApi.getUserXpStats(selectedGuild.id, userId).catch(() => null),
        meApi.getReputation(selectedGuild.id, userId).catch(() => ({
          totalRep: 0, rank: 0, totalGiven: 0, totalReceived: 0
        })),
        meApi.getMySuggestions(selectedGuild.id, userId).catch(() => []),
        meApi.getMyCurrency(selectedGuild.id, userId).catch(() => ({ balance: 0, recentTransactions: [] })),
        meApi.getMyGiveaways(selectedGuild.id, userId).catch(() => []),
        meApi.getMyReminders(selectedGuild.id, userId).catch(() => []),
        meApi.getMyInvites(selectedGuild.id, userId).catch(() => ({ inviteCount: 0, invitedUsers: [] })),
        meApi.getMyMessages(selectedGuild.id, userId).catch(() => ({
          totalMessages: 0,
          channelBreakdown: []
        })),
        meApi.getMyStarboard(selectedGuild.id, userId).catch(() => null),
        meApi.getMyGlobalAnalytics(selectedGuild.id, userId).catch(() => ({})),
        // Only load guild config if user has admin access
        selectedGuild.hasAdminAccess ? guildApi.getGuildConfig(selectedGuild.id).catch(() => null) : Promise.resolve(null)
      ]);

      serverData = {
        highlights,
        highlightSettings: hlSettings,
        afkStatus: afk,
        xpStats,
        reputation,
        suggestions,
        currency,
        giveaways,
        reminders,
        invites,
        messages,
        starboard,
        analytics
      };
      
      guildConfig = config;
    } catch (err) {
      logger.error("Failed to load server data:", err);
      showMessage("Failed to load server data", "error");
    } finally {
      loading = false;
    }
  }

  // Toggle functions
  async function toggleGreetDms() {
    saving = true;
    try {
      const result = await meApi.toggleGreetDms(BigInt("0"), userId);
      (userProfile as any).greetDmsOptOut = result.greetDmsOptOut;
      showMessage(`Welcome DMs ${result.greetDmsOptOut ? 'blocked' : 'allowed'}!`, "success");
    } catch (err) {
      showMessage("Failed to update setting", "error");
    } finally {
      saving = false;
    }
  }

  async function toggleStats() {
    saving = true;
    try {
      const result = await meApi.toggleStats(BigInt("0"), userId);
      (userProfile as any).statsOptOut = result.statsOptOut;
      showMessage(`Stats tracking ${result.statsOptOut ? 'blocked' : 'allowed'}!`, "success");
    } catch (err) {
      showMessage("Failed to update setting", "error");
    } finally {
      saving = false;
    }
  }

  async function toggleLevelUpPings() {
    saving = true;
    try {
      const result = await meApi.toggleLevelUpPings(BigInt("0"), userId);
      (userPreferences as any).levelUpPingsDisabled = result.levelUpPingsDisabled;
      showMessage(`Level-up pings ${result.levelUpPingsDisabled ? 'disabled' : 'enabled'}!`, "success");
    } catch (err) {
      showMessage("Failed to update preference", "error");
    } finally {
      saving = false;
    }
  }

  async function togglePronouns() {
    saving = true;
    try {
      const result = await meApi.togglePronouns(BigInt("0"), userId);
      (userPreferences as any).pronounsDisabled = result.pronounsDisabled;
      showMessage(`Pronoun fetching ${result.pronounsDisabled ? 'disabled' : 'enabled'}!`, "success");
    } catch (err) {
      showMessage("Failed to update preference", "error");
    } finally {
      saving = false;
    }
  }

  async function toggleBirthdayAnnouncements() {
    saving = true;
    try {
      const result = await meApi.toggleBirthdayAnnouncements(BigInt("0"), userId);
      (userProfile as any).birthdayAnnouncementsEnabled = result.birthdayAnnouncementsEnabled;
      showMessage(`Birthday announcements ${result.birthdayAnnouncementsEnabled ? 'enabled' : 'disabled'}!`, "success");
    } catch (err) {
      showMessage("Failed to update setting", "error");
    } finally {
      saving = false;
    }
  }

  async function toggleGuidedSetup() {
    saving = true;
    try {
      const result = await meApi.toggleGuidedSetup(BigInt("0"), userId);
      (userPreferences as any).prefersGuidedSetup = result.prefersGuidedSetup;
      showMessage(`Guided setup ${result.prefersGuidedSetup ? 'enabled' : 'disabled'}!`, "success");
    } catch (err) {
      showMessage("Failed to update preference", "error");
    } finally {
      saving = false;
    }
  }

  async function resetWizard() {
    saving = true;
    try {
      const result = await meApi.resetWizard(BigInt("0"), userId);
      (userPreferences as any).hasCompletedAnyWizard = result.hasCompletedAnyWizard;
      (userPreferences as any).prefersGuidedSetup = result.prefersGuidedSetup;
      showMessage("Wizard state reset! You'll see setup guides again.", "success");
      await loadGlobalData(); // Refresh data
    } catch (err) {
      showMessage("Failed to reset wizard", "error");
    } finally {
      saving = false;
    }
  }

  async function resetGuildWizard() {
    if (!selectedGuild?.id) return;

    saving = true;
    try {
      await meApi.resetGuildWizard(BigInt("0"), userId, selectedGuild.id);
      showMessage(`Setup wizard reset for ${selectedGuild.name}!`, "success");

      // Refresh server data to update guild config
      if (guildConfig) {
        guildConfig.wizardCompleted = false;
        guildConfig.wizardSkipped = false;
      }
      await loadServerData();
    } catch (err) {
      showMessage("Failed to reset guild wizard", "error");
    } finally {
      saving = false;
    }
  }

  async function saveProfile() {
    saving = true;
    try {
      await meApi.updateUserProfile(BigInt("0"), userId, {
        bio: profileForm.bio,
        pronouns: profileForm.pronouns,
        zodiacSign: profileForm.zodiacSign,
        switchFriendCode: profileForm.switchFriendCode,
        profileImageUrl: profileForm.profileImageUrl,
        profileColor: profileForm.profileColor ? parseInt(profileForm.profileColor.replace('#', ''), 16) : null,
        birthday: profileForm.birthday ? new Date(profileForm.birthday).toISOString() : null,
        birthdayTimezone: profileForm.birthdayTimezone,
        profilePrivacy: profileForm.profilePrivacy,
        birthdayDisplayMode: profileForm.birthdayDisplayMode
      });
      
      editingProfile = false;
      showMessage("Profile updated!", "success");
      await loadGlobalData();
    } catch (err) {
      showMessage("Failed to save profile", "error");
    } finally {
      saving = false;
    }
  }

  // Add highlight
  async function addHighlight() {
    if (!selectedGuild?.id || !newHighlightWord.trim()) return;

    try {
      await meApi.addHighlight(selectedGuild.id, userId, newHighlightWord.trim());
      newHighlightWord = "";
      showMessage("Highlight added!", "success");
      await loadServerData();
    } catch (err) {
      showMessage("Failed to add highlight", "error");
    }
  }

  // Remove highlight
  async function removeHighlight(highlightId: number) {
    if (!selectedGuild?.id) return;

    try {
      await meApi.removeHighlight(selectedGuild.id, userId, highlightId);
      showMessage("Highlight removed!", "success");
      await loadServerData();
    } catch (err) {
      showMessage("Failed to remove highlight", "error");
    }
  }

  // Set AFK status
  async function setAfkStatus() {
    if (!selectedGuild?.id) return;

    saving = true;
    try {
      await meApi.setAfkStatus(selectedGuild.id, userId, {
        message: newAfkMessage.trim() || "",
        isTimed: false,
        until: undefined
      });
      newAfkMessage = "";
      showMessage("AFK status set!", "success");
      await loadServerData();
    } catch (err) {
      showMessage("Failed to set AFK status", "error");
    } finally {
      saving = false;
    }
  }

  // Remove AFK status
  async function removeAfkStatus() {
    if (!selectedGuild?.id) return;

    saving = true;
    try {
      await meApi.removeAfkStatus(selectedGuild.id, userId);
      showMessage("AFK status removed!", "success");
      await loadServerData();
    } catch (err) {
      showMessage("Failed to remove AFK status", "error");
    } finally {
      saving = false;
    }
  }

  // Guild selection with smooth transition
  function handleGuildSelect(guild: any) {
    selectedGuild = guild;
    showGuildDropdown = false;
    guildSearchTerm = "";
    // Small delay to let the selection UI update before loading data
    setTimeout(() => loadServerData(), 100);
  }

  // Smooth server change
  function changeServer() {
    // Fade out current data, then show server selection
    serverData = {
      highlights: [],
      highlightSettings: { highlightsEnabled: true, ignoredChannels: [], ignoredUsers: [] },
      afkStatus: { isAfk: false, message: "", when: null, wasTimed: false },
      xpStats: null,
      reputation: { totalRep: 0, rank: 0, totalGiven: 0, totalReceived: 0 },
      suggestions: [],
      currency: { balance: 0, recentTransactions: [] },
      giveaways: [],
      reminders: [],
      invites: { inviteCount: 0, invitedUsers: [] },
      messages: { totalMessages: 0, channelBreakdown: [] },
      starboard: null,
      analytics: {}
    };
    
    setTimeout(() => {
      selectedGuild = null;
    }, 200);
  }

  // Load Last.fm statistics
  async function loadLastFmStats() {
    if (!userId || !lastFmStatus?.linked) return;

    loadingLastFmStats = true;
    try {
      const dummyGuildId = BigInt("0");
      const [userInfo, recentTracks, topArtists, topAlbums] = await Promise.all([
        lastfmApi.getUserInfo(dummyGuildId, userId).catch(() => null),
        lastfmApi.getRecentTracks(dummyGuildId, userId, 5).catch(() => []),
        lastfmApi.getTopArtists(dummyGuildId, userId, lastFmPeriod, 5).catch(() => []),
        lastfmApi.getTopAlbums(dummyGuildId, userId, lastFmPeriod, 5).catch(() => [])
      ]);

      lastFmUserInfo = userInfo;
      lastFmRecentTracks = recentTracks;
      lastFmTopArtists = topArtists;
      lastFmTopAlbums = topAlbums;
    } catch (err) {
      logger.error("Failed to load Last.fm stats:", err);
    } finally {
      loadingLastFmStats = false;
    }
  }

  // Show notification
  function showMessage(text: string, type: "success" | "error" | "info") {
    notificationMessage = text;
    notificationType = type as "success" | "error";
    showNotification = true;
  }

  function dismissNotification() {
    showNotification = false;
  }

  let filteredGuilds = $derived(availableGuilds.filter(guild =>
    guild.name.toLowerCase().includes(guildSearchTerm.toLowerCase())
  ));

  onMount(async () => {
    // Extract colors from user avatar
    if (currentUser?.avatar) {
      const avatarUrl = currentUser.avatar.startsWith("a_")
        ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
        : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`;
      await colorStore.extractFromImage(avatarUrl);
    }
    
    // Load data
    await loadGlobalData();
    await loadAvailableGuilds();
  });
</script>

<svelte:head>
  <title>My Settings - Mewdeko</title>
</svelte:head>

<div class="min-h-screen p-4 md:p-6"
     style="background: radial-gradient(circle at top, {$colorStore.gradientStart}15 0%, {$colorStore.gradientMid}10 50%, {$colorStore.gradientEnd}05 100%);">

  <!-- Header -->
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center gap-4 mb-8">
      <div class="p-4 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-user text-3xl"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
      </div>
      <div>
        <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">My Settings</h1>
        <p class="text-lg mt-1" style="color: {$colorStore.muted}">
          Your profile and server preferences
        </p>
      </div>
    </div>


    <!-- COMPREHENSIVE PROFILE SECTION -->
    <div class="space-y-6 mb-12">
      <!-- Personal Information -->
      <div class="rounded-2xl p-6 border "
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                  border-color: {$colorStore.primary}30;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-utility-duo fa-regular fa-user text-xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            Personal Information
          </h2>
          {#if !editingProfile}
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] border"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
              onclick={() => editingProfile = true}
            >
              Edit
            </button>
          {/if}
        </div>

        {#if editingProfile}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Bio -->
            <div class="md:col-span-2">
              <label for="input-9136" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">Bio</label>
              <textarea
                bind:value={profileForm.bio}
                placeholder="Tell others about yourself..."
                rows="3"
                class="w-full px-3 py-2 rounded-lg border resize-none"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              ></textarea>
            </div>

            <!-- Pronouns -->
            <div>
              <label for="input-9136" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">Pronouns</label>
              <input id="input-9136"
                type="text"
                bind:value={profileForm.pronouns}
                placeholder="they/them, she/her, he/him..."
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              >
            </div>

            <!-- Zodiac Sign -->
            <div>
              <label for="input-1516" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Zodiac
                Sign</label>
              <select
                bind:value={profileForm.zodiacSign}
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              >
                <option value="">Not specified</option>
                <option value="Aries">♈ Aries</option>
                <option value="Taurus">♉ Taurus</option>
                <option value="Gemini">♊ Gemini</option>
                <option value="Cancer">♋ Cancer</option>
                <option value="Leo">♌ Leo</option>
                <option value="Virgo">♍ Virgo</option>
                <option value="Libra">♎ Libra</option>
                <option value="Scorpio">♏ Scorpio</option>
                <option value="Sagittarius">♐ Sagittarius</option>
                <option value="Capricorn">♑ Capricorn</option>
                <option value="Aquarius">♒ Aquarius</option>
                <option value="Pisces">♓ Pisces</option>
              </select>
            </div>

            <!-- Birthday -->
            <div>
              <label for="input-1516" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">Birthday</label>
              <input id="input-1516"
                type="date"
                bind:value={profileForm.birthday}
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              >
            </div>

            <!-- Timezone -->
            <div>
              <label for="input-4352" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">Timezone</label>
              <select
                bind:value={profileForm.birthdayTimezone}
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <!-- Switch Friend Code -->
            <div>
              <label for="input-4352" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Switch
                Friend Code</label>
              <input id="input-4352"
                type="text"
                bind:value={profileForm.switchFriendCode}
                placeholder="SW-0000-0000-0000"
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              >
            </div>

            <!-- Profile Color -->
            <div>
              <label for="input-8750" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Profile
                Color</label>
              <input id="input-8750"
                type="color"
                bind:value={profileForm.profileColor}
                class="w-full h-10 rounded-lg border"
                style="border-color: {$colorStore.primary}30;"
              >
            </div>

            <!-- Action buttons -->
            <div class="md:col-span-2 flex gap-3 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
              <button
                class="px-4 py-2 rounded-lg text-sm border"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                onclick={() => editingProfile = false}
                disabled={saving}
              >
                Cancel
              </button>
              <button aria-label="Button action"
                class="px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                style="background: {$colorStore.primary}; color: white;"
                onclick={saveProfile}
                disabled={saving}
              >
                <i class="fa-solid fa-floppy-disk" style="font-size: 12px;"></i>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <span class="text-sm font-medium" style="color: {$colorStore.text}">Bio:</span>
              <p class="text-sm mt-1 p-2 rounded-lg min-h-[60px]" style="background: {$colorStore.primary}05; color: {$colorStore.muted}">
                {userProfile.bio || "No bio set"}
              </p>
            </div>
            <div>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">Pronouns:</span>
              <span class="text-sm ml-2" style="color: {$colorStore.muted}">
                {userProfile.pronouns || "Not specified"}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">Zodiac:</span>
              <span class="text-sm ml-2" style="color: {$colorStore.muted}">
                {userProfile.zodiacSign || "Not specified"}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">Birthday:</span>
              <span class="text-sm ml-2" style="color: {$colorStore.muted}">
                {userProfile.birthday ? new Date(userProfile.birthday).toLocaleDateString() : "Not set"}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">Switch FC:</span>
              <span class="text-sm ml-2" style="color: {$colorStore.muted}">
                {userProfile.switchFriendCode || "Not set"}
              </span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Privacy & Preferences -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Privacy Settings -->
        <div class="rounded-2xl p-6 border "
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-utility-duo fa-regular fa-shield text-xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            Privacy
          </h3>

          <div class="space-y-4">
            <!-- Block Welcome DMs -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">Block Welcome DMs</div>
                <div class="text-xs" style="color: {$colorStore.muted}">Prevent welcome messages</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userProfile.greetDmsOptOut}
                  onchange={toggleGreetDms}
                  disabled={saving}
                  class="sr-only"
                >
                <span class="w-11 h-6 rounded-full transition-all relative shadow-inner block"
                     style="background: {userProfile.greetDmsOptOut ? $colorStore.primary : '#374151'};">
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform block"
                       class:translate-x-5={userProfile.greetDmsOptOut}>
                  </span>
                </span>
              </label>
            </div>

            <!-- Block Stats -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">Block Message Tracking</div>
                <div class="text-xs" style="color: {$colorStore.muted}">Prevent message count tracking</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userProfile.statsOptOut}
                  onchange={toggleStats}
                  disabled={saving}
                  class="sr-only"
                >
                <span class="w-11 h-6 rounded-full transition-all relative shadow-inner block"
                     style="background: {userProfile.statsOptOut ? $colorStore.primary : '#374151'};">
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform block"
                       class:translate-x-5={userProfile.statsOptOut}>
                  </span>
                </span>
              </label>
            </div>

            <!-- Birthday Announcements -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">Birthday Announcements</div>
                <div class="text-xs" style="color: {$colorStore.muted}">Allow birthday celebrations</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userProfile.birthdayAnnouncementsEnabled}
                  onchange={toggleBirthdayAnnouncements}
                  disabled={saving}
                  class="sr-only"
                >
                <span class="w-11 h-6 rounded-full transition-all relative shadow-inner block"
                     style="background: {userProfile.birthdayAnnouncementsEnabled ? $colorStore.primary : '#374151'};">
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform block"
                       class:translate-x-5={userProfile.birthdayAnnouncementsEnabled}>
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="rounded-2xl p-6 border "
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-utility-duo fa-regular fa-gear text-xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            Preferences
          </h3>

          <div class="space-y-4">
            <!-- Level-up Pings -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">Level-up Pings</div>
                <div class="text-xs" style="color: {$colorStore.muted}">Disable level-up notifications</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userPreferences.levelUpPingsDisabled}
                  onchange={toggleLevelUpPings}
                  disabled={saving}
                  class="sr-only"
                >
                <span class="w-11 h-6 rounded-full transition-all relative shadow-inner block"
                     style="background: {userPreferences.levelUpPingsDisabled ? $colorStore.primary : '#374151'};">
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform block"
                       class:translate-x-5={userPreferences.levelUpPingsDisabled}>
                  </span>
                </span>
              </label>
            </div>

            <!-- Pronoun Fetching -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">Auto Pronoun Fetching</div>
                <div class="text-xs" style="color: {$colorStore.muted}">Disable PronounDB integration</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userPreferences.pronounsDisabled}
                  onchange={togglePronouns}
                  disabled={saving}
                  class="sr-only"
                >
                <span class="w-11 h-6 rounded-full transition-all relative shadow-inner block"
                     style="background: {userPreferences.pronounsDisabled ? $colorStore.primary : '#374151'};">
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform block"
                       class:translate-x-5={userPreferences.pronounsDisabled}>
                  </span>
                </span>
              </label>
            </div>

            <!-- Dyslexia-friendly Font -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">Dyslexia-friendly Font</div>
                <div class="text-xs" style="color: {$colorStore.muted}">Use OpenDyslexic across the dashboard (this device only)</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={$dyslexicFontStore}
                  onchange={() => dyslexicFontStore.toggle()}
                  class="sr-only"
                >
                <span class="w-11 h-6 rounded-full transition-all relative shadow-inner block"
                     style="background: {$dyslexicFontStore ? $colorStore.primary : '#374151'};">
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform block"
                       class:translate-x-5={$dyslexicFontStore}>
                  </span>
                </span>
              </label>
            </div>

            <!-- Guided Setup -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">Guided Setup</div>
                <div class="text-xs" style="color: {$colorStore.muted}">Prefer step-by-step guidance</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userPreferences.prefersGuidedSetup}
                  onchange={toggleGuidedSetup}
                  disabled={saving}
                  class="sr-only"
                >
                <span class="w-11 h-6 rounded-full transition-all relative shadow-inner block"
                     style="background: {userPreferences.prefersGuidedSetup ? $colorStore.primary : '#374151'};">
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform block"
                       class:translate-x-5={userPreferences.prefersGuidedSetup}>
                  </span>
                </span>
              </label>
            </div>

            <!-- Wizard Reset -->
            {#if userPreferences.hasCompletedAnyWizard}
              <div class="pt-4 border-t" style="border-color: {$colorStore.primary}20;">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm font-medium" style="color: {$colorStore.text}">Reset Setup Wizard</div>
                    <div class="text-xs" style="color: {$colorStore.muted}">See setup guides again for all servers</div>
                  </div>
                  <button
                    class="px-3 py-1.5 rounded-lg text-sm border transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                    onclick={resetWizard}
                    disabled={saving}
                  >
                    {saving ? 'Resetting...' : 'Reset'}
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Last.fm Integration -->
        <div class="md:col-span-2 rounded-2xl p-6 border"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-brands fa-lastfm text-xl" style="color: #d51007;"></i>
            Last.fm Scrobbling
          </h3>

          {#if lastFmStatus?.linked}
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">
                  Connected as: <strong>{lastFmStatus?.username}</strong>
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">
                  Scrobbling: {lastFmStatus?.scrobblingEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <button
                  class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm border transition-all hover:scale-[1.02]"
                  style="background: {lastFmStatus?.scrobblingEnabled ? $colorStore.accent : $colorStore.primary}20;
                         color: {lastFmStatus?.scrobblingEnabled ? $colorStore.accent : $colorStore.primary};
                         border-color: {lastFmStatus?.scrobblingEnabled ? $colorStore.accent : $colorStore.primary}30;"
                  onclick={async () => {
                    saving = true;
                    try {
                      await lastfmApi.toggleScrobbling(BigInt("0"), userId, !lastFmStatus?.scrobblingEnabled);
                      await loadGlobalData();
                      showMessage(lastFmStatus?.scrobblingEnabled ? 'Scrobbling disabled' : 'Scrobbling enabled', 'success');
                    } catch (err) {
                      showMessage('Failed to toggle scrobbling', 'error');
                    } finally {
                      saving = false;
                    }
                  }}
                  disabled={saving}
                >
                  {lastFmStatus?.scrobblingEnabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm border transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                  onclick={async () => {
                    if (confirm('Are you sure you want to unlink your Last.fm account?')) {
                      saving = true;
                      try {
                        await lastfmApi.unlink(BigInt("0"), userId);
                        await loadGlobalData();
                        showMessage('Last.fm account unlinked', 'success');
                      } catch (err) {
                        showMessage('Failed to unlink Last.fm', 'error');
                      } finally {
                        saving = false;
                      }
                    }
                  }}
                  disabled={saving}
                >
                  Unlink
                </button>
              </div>
            </div>
          {:else}
            <div class="text-center p-2">
              <p class="text-sm mb-3" style="color: {$colorStore.muted}">
                Link your Last.fm account to automatically scrobble music
              </p>
              <button
                class="w-full sm:w-auto px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
                style="background: #d51007; color: white;"
                onclick={async () => {
                  try {
                    const { authUrl } = await lastfmApi.getAuthUrl(BigInt("0"), userId);
                    window.open(authUrl, '_blank');
                    showMessage('Complete authentication in the opened window', 'success');
                  } catch (err) {
                    showMessage('Failed to get Last.fm auth URL', 'error');
                  }
                }}
                disabled={saving}
              >
                <i class="fa-brands fa-lastfm mr-2"></i>
                Connect Last.fm
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Last.fm Statistics (if linked) -->
    {#if lastFmStatus?.linked}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Recent Tracks -->
        <div class="rounded-2xl p-6 border"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-utility-duo fa-regular fa-music text-xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            Recent Tracks
          </h3>

          {#if loadingLastFmStats}
            <div class="space-y-3 animate-pulse">
              {#each Array(3) as _, i}
                <div class="flex items-center gap-3 p-2 rounded-lg" style="background: {$colorStore.primary}08;">
                  <div class="w-12 h-12 rounded" style="background: {$colorStore.primary}20;"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 rounded" style="background: {$colorStore.primary}20; width: 70%;"></div>
                    <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 50%;"></div>
                  </div>
                </div>
              {/each}
            </div>
          {:else if lastFmRecentTracks.length > 0}
            <div class="space-y-3">
              {#each lastFmRecentTracks.slice(0, 5) as track}
                <div class="flex items-center gap-3 p-2 rounded-lg" style="background: {$colorStore.primary}08;">
                  {#if track.image}
                    <img src={track.image} alt="" class="w-12 h-12 rounded" />
                  {/if}
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">
                      {track.name}
                    </div>
                    <div class="text-xs truncate" style="color: {$colorStore.muted}">
                      {track.artist}
                    </div>
                    {#if track.isNowPlaying}
                      <div class="text-xs flex items-center gap-1" style="color: #10b981;">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Now Playing
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
              No recent tracks
            </p>
          {/if}
        </div>

        <!-- Top Artists -->
        <div class="rounded-2xl p-6 border"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold flex items-center gap-2" style="color: {$colorStore.text}">
              <i class="fa-utility-duo fa-regular fa-headphones text-xl"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
              Top Artists
            </h3>
            <select
              bind:value={lastFmPeriod}
              onchange={() => loadLastFmStats()}
              class="px-2 py-1 rounded text-xs border"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
              <option value="7day">Week</option>
              <option value="1month">Month</option>
              <option value="3month">3 Months</option>
              <option value="6month">6 Months</option>
              <option value="12month">Year</option>
              <option value="overall">All Time</option>
            </select>
          </div>

          {#if loadingLastFmStats}
            <div class="space-y-2 animate-pulse">
              {#each Array(5) as _, i}
                <div class="flex items-center gap-2 p-2 rounded-lg" style="background: {$colorStore.primary}08;">
                  <span class="text-sm font-bold w-6" style="color: {$colorStore.muted}">#{i + 1}</span>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 rounded" style="background: {$colorStore.primary}20; width: 60%;"></div>
                    <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 40%;"></div>
                  </div>
                </div>
              {/each}
            </div>
          {:else if lastFmTopArtists.length > 0}
            <div class="space-y-2">
              {#each lastFmTopArtists.slice(0, 5) as artist, i}
                <div class="flex items-center gap-2 p-2 rounded-lg" style="background: {$colorStore.primary}08;">
                  <span class="text-sm font-bold w-6" style="color: {$colorStore.muted}">#{i + 1}</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">
                      {artist.name}
                    </div>
                    <div class="text-xs" style="color: {$colorStore.muted}">
                      {artist.playcount} plays
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
              No data for this period
            </p>
          {/if}
        </div>

        <!-- Last.fm Profile Stats -->
        <div class="rounded-2xl p-6 border md:col-span-2"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-utility-duo fa-regular fa-star text-xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            Listening Stats
          </h3>

          {#if loadingLastFmStats}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center animate-pulse">
              {#each Array(4) as _}
                <div>
                  <div class="h-8 rounded mx-auto mb-2" style="background: {$colorStore.primary}20; width: 60%;"></div>
                  <div class="h-3 rounded mx-auto" style="background: {$colorStore.primary}15; width: 50%;"></div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {lastFmUserInfo?.playcount?.toLocaleString() || '0'}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Total Scrobbles</div>
              </div>
              <div>
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {lastFmTopArtists.length}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Top Artists</div>
              </div>
              <div>
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {lastFmTopAlbums.length}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Top Albums</div>
              </div>
              <div>
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {lastFmUserInfo?.country || 'Unknown'}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Country</div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- SERVER SETTINGS SECTION -->
    <div class="border-t pt-8" style="border-color: {$colorStore.primary}20;">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.secondary}20, {$colorStore.accent}20);">
          <i class="fa-utility-duo fa-regular fa-server text-2xl"
             style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold" style="color: {$colorStore.text}">Server Settings</h2>
          <p class="text-sm" style="color: {$colorStore.muted}">Settings specific to each server</p>
        </div>
      </div>

      {#if !selectedGuild}
        <!-- Server Selection -->
        <div class="text-center p-8 rounded-2xl border"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;">
          <i class="fa-utility-duo fa-regular fa-server text-6xl mx-auto mb-4 block"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          <h3 class="text-xl font-semibold mb-3" style="color: {$colorStore.text}">Choose a Server</h3>
          <p class="mb-6" style="color: {$colorStore.muted}">
            Select a server to manage your highlights, AFK status, and view your activity
          </p>

          {#if availableGuilds.length > 0}
              <div class="relative max-w-md mx-auto" use:clickOutside onclickoutside={() => showGuildDropdown = false}>
              <button
                class="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}; color: white;"
                onclick={() => showGuildDropdown = !showGuildDropdown}
              >
                <i class="fa-solid fa-server" style="font-size: 20px;"></i>
                Choose Server
                <i class="fa-solid fa-chevron-down transition-transform {showGuildDropdown ? 'rotate-180' : ''}" style="font-size: 16px;"></i>
              </button>

              {#if showGuildDropdown}
                <div class="absolute bottom-full mb-2 w-full rounded-xl shadow-2xl border z-50"
                     style="background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.9)); border-color: {$colorStore.primary}30;"
                     in:fade={{ duration: 200 }}>
                  
                  <!-- Search -->
                  <div class="p-3 border-b" style="border-color: {$colorStore.primary}20;">
                    <input
                      type="text"
                      placeholder="Search servers..."
                      bind:value={guildSearchTerm}
                      class="w-full px-3 py-2 rounded-lg border text-sm"
                      style="background: rgba(0,0,0,0.5); border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    >
                  </div>

                  <!-- Server List -->
                  <div class="max-h-60 overflow-y-auto">
                    {#each filteredGuilds as guild (guild.id)}
                      <button
                        class="w-full flex items-center gap-3 p-3 hover:bg-black hover:bg-opacity-30 transition-colors text-left"
                        onclick={() => handleGuildSelect(guild)}
                      >
                        <img
                          src={guild.icon ? 
                            `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64` :
                            'https://cdn.discordapp.com/embed/avatars/0.png'
                          }
                          alt=""
                          class="w-10 h-10 rounded-lg"
                        >
                        <span class="flex-1 min-w-0 block">
                          <span class="font-medium truncate block" style="color: {$colorStore.text}">
                            {guild.name}
                          </span>
                          <span class="text-xs block" style="color: {$colorStore.muted}">
                            {guild.memberCount?.toLocaleString() || 'Unknown'} members
                          </span>
                        </span>
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <p style="color: {$colorStore.muted}">No servers available</p>
          {/if}
        </div>

      {:else}
        <!-- Selected Server Header (Improved) -->
        <div class="mb-8 p-6 rounded-2xl border "
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                    border-color: {$colorStore.primary}40;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="flex items-center gap-4 flex-1">
              <img
                src={selectedGuild.icon ? 
                  `https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png?size=128` :
                  'https://cdn.discordapp.com/embed/avatars/0.png'
                }
                alt=""
                class="w-16 h-16 rounded-2xl border-2"
                style="border-color: {$colorStore.primary}50;"
              >
              <div class="text-center sm:text-left">
                <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{selectedGuild.name}</h3>
                <p class="text-sm" style="color: {$colorStore.muted}">
                  <span class="hidden sm:inline">Your personal settings and activity for this server</span>
                  <span class="sm:hidden">{selectedGuild.memberCount?.toLocaleString() || 'N/A'} members</span>
                </p>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button
                class="px-6 py-3 rounded-xl font-medium border transition-all hover:scale-[1.02] flex items-center gap-2"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border-color: {$colorStore.secondary}40;"
                onclick={changeServer}
              >
                <i class="fa-solid fa-server" style="font-size: 16px;"></i>
                Change Server
              </button>

              <!-- Guild Wizard Reset (only for admins with completed/skipped wizard) -->
              {#if selectedGuild.hasAdminAccess && (guildConfig?.wizardCompleted || guildConfig?.wizardSkipped)}
                <button
                  class="px-4 py-3 rounded-xl font-medium border transition-all hover:scale-[1.02] flex items-center gap-2"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                  onclick={resetGuildWizard}
                  disabled={saving}
                  title="Reset setup wizard for this server"
                >
                  <i class="fa-solid fa-gear" style="font-size: 16px;"></i>
                  <span class="hidden sm:inline">Reset Wizard</span>
                </button>
              {/if}
            </div>
          </div>
        </div>

        <!-- Comprehensive Server Data -->
        <div class="space-y-6" in:fade={{ duration: 300, delay: 100 }}>
          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4"
               in:fly={{ y: 20, duration: 400, delay: 200 }}>
            <!-- XP Stats -->
            {#if serverData.xpStats}
              <div class="p-4 rounded-xl text-center border"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                <i class="fa-utility-duo fa-regular fa-star text-2xl mx-auto mb-2 block"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                <div class="text-xl font-bold" style="color: {$colorStore.text}">Level {serverData.xpStats.level}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Rank #{serverData.xpStats.rank}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{serverData.xpStats.totalXp.toLocaleString()} XP</div>
              </div>
            {/if}

            <!-- Reputation -->
            <div class="p-4 rounded-xl text-center border"
                 style="background: {$colorStore.secondary}08; border-color: {$colorStore.secondary}20;">
              <i class="fa-utility-duo fa-regular fa-star text-2xl mx-auto mb-2 block"
                 style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
              <div class="text-xl font-bold" style="color: {$colorStore.text}">{serverData.reputation.totalRep}</div>
              <div class="text-sm" style="color: {$colorStore.muted}">Reputation</div>
              <div class="text-xs" style="color: {$colorStore.muted}">Rank #{serverData.reputation.rank}</div>
            </div>

            <!-- Message Stats -->
            <div class="p-4 rounded-xl text-center border"
                 style="background: {$colorStore.accent}08; border-color: {$colorStore.accent}20;">
              <i class="fa-utility-duo fa-regular fa-hashtag text-2xl mx-auto mb-2 block"
                 style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
              <div class="text-xl font-bold" style="color: {$colorStore.text}">{serverData.messages.totalMessages?.toLocaleString() || '0'}</div>
              <div class="text-sm" style="color: {$colorStore.muted}">Messages</div>
              <div class="text-xs" style="color: {$colorStore.muted}">{serverData.invites.inviteCount || 0} invites</div>
            </div>
          </div>

          <!-- Settings & Activity Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Highlights -->
            <div class="rounded-2xl p-6 border "
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-lightbulb text-xl"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                Highlights ({serverData.highlights.length})
              </h3>

              <!-- Add highlight -->
              <div class="flex gap-2 mb-4">
                <input
                  type="text"
                  bind:value={newHighlightWord}
                  placeholder="Add highlight word..."
                  class="flex-1 px-3 py-2 rounded-lg border text-sm"
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                  onkeydown={(e) => e.key === 'Enter' && addHighlight()}
                >
                <button aria-label="Add"
                        class="px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.primary}; color: white;"
                  onclick={addHighlight}
                  disabled={!newHighlightWord.trim()}
                >
                  <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                </button>
              </div>

              <!-- Highlight list -->
              <div class="space-y-2 max-h-32 overflow-y-auto">
                {#each serverData.highlights as highlight}
                  <div class="flex items-center justify-between p-2 rounded-lg"
                       style="background: {$colorStore.primary}08;">
                    <span class="text-sm" style="color: {$colorStore.text}">{highlight.word}</span>
                    <button aria-label="Delete"
                            class="p-1 rounded-sm transition-all hover:scale-110"
                      style="color: {$colorStore.accent};"
                      onclick={() => removeHighlight(highlight.id)}
                    >
                      <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                    </button>
                  </div>
                {:else}
                  <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
                    No highlight words set
                  </p>
                {/each}
              </div>
            </div>

            <!-- Suggestions Activity -->
            <div class="rounded-2xl p-6 border "
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-hashtag text-xl"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                Suggestions ({serverData.suggestions.length})
              </h3>

              <div class="space-y-2 max-h-32 overflow-y-auto">
                {#each serverData.suggestions.slice(0, 5) as suggestion}
                  <div class="p-3 rounded-lg border" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1">
                        <div class="text-sm font-medium" style="color: {$colorStore.text}">#{suggestion.suggestionId}</div>
                        <p class="text-xs" style="color: {$colorStore.muted}">
                          {suggestion.suggestion1?.substring(0, 60)}{suggestion.suggestion1?.length > 60 ? '...' : ''}
                        </p>
                      </div>
                      <span class="px-2 py-1 rounded-sm text-xs"
                            style="background: {suggestion.currentState === 1 ? '#10b981' :
                                            suggestion.currentState === 2 ? '#ef4444' : '#6b7280'}20;
                                  color: {suggestion.currentState === 1 ? '#10b981' :
                                         suggestion.currentState === 2 ? '#ef4444' : '#6b7280'};">
                        {suggestion.currentState === 1 ? 'Accepted' : suggestion.currentState === 2 ? 'Denied' : 'Pending'}
                      </span>
                    </div>
                  </div>
                {:else}
                  <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
                    No suggestions made
                  </p>
                {/each}
              </div>
            </div>

            <!-- Currency & Transactions -->
            <div class="rounded-2xl p-6 border "
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-star text-xl"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                Currency: {serverData.currency.balance.toLocaleString()}
              </h3>

              <div class="space-y-2 max-h-32 overflow-y-auto">
                {#each serverData.currency.recentTransactions.slice(0, 5) as transaction}
                  <div class="flex items-center justify-between p-2 rounded-lg"
                       style="background: {$colorStore.primary}08;">
                    <div class="flex-1">
                      <div class="text-sm" style="color: {$colorStore.text}">{transaction.description}</div>
                      <div class="text-xs" style="color: {$colorStore.muted}">
                        {new Date(transaction.dateAdded).toLocaleDateString()}
                      </div>
                    </div>
                    <div class="text-sm font-bold" style="color: {transaction.amount > 0 ? '#10b981' : '#ef4444'}">
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                {:else}
                  <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
                    No recent transactions
                  </p>
                {/each}
              </div>
            </div>

            <!-- AFK Status Management -->
            <div class="rounded-2xl p-6 border "
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-clock text-xl"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                AFK Status
              </h3>

              {#if serverData.afkStatus.isAfk}
                <div class="p-3 rounded-lg mb-4 border"
                     style="background: {$colorStore.accent}15; border-color: {$colorStore.accent}30;">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    <span class="text-sm font-medium" style="color: {$colorStore.text}">Currently AFK</span>
                  </div>
                  {#if serverData.afkStatus.message}
                    <p class="text-sm" style="color: {$colorStore.muted}">"{serverData.afkStatus.message}"</p>
                  {/if}
                  {#if serverData.afkStatus.when}
                    <p class="text-xs" style="color: {$colorStore.muted}">
                      Since {new Date(serverData.afkStatus.when).toLocaleString()}
                    </p>
                  {/if}
                </div>
              {/if}

              <!-- Set AFK -->
              <div class="space-y-3">
                <textarea
                  bind:value={newAfkMessage}
                  placeholder="Enter AFK message (optional)..."
                  rows="2"
                  class="w-full px-3 py-2 rounded-lg border resize-none text-sm"
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                ></textarea>
                
                <div class="flex gap-2">
                  <button
                    class="flex-1 px-4 py-2 rounded-lg text-sm font-medium min-h-[40px]"
                    style="background: {$colorStore.primary}; color: white;"
                    onclick={setAfkStatus}
                    disabled={saving}
                  >
                    {saving ? 'Setting...' : 'Set AFK'}
                  </button>
                  {#if serverData.afkStatus.isAfk}
                    <button
                      class="px-4 py-2 rounded-lg text-sm border min-h-[40px]"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                      onclick={removeAfkStatus}
                      disabled={saving}
                    >
                      Remove
                    </button>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Activity Summary -->
            <div class="rounded-2xl p-6 border "
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-bell text-xl"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                Recent Activity
              </h3>

              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div class="text-lg font-bold" style="color: {$colorStore.text}">{serverData.giveaways.length}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">Giveaways</div>
                </div>
                <div>
                  <div class="text-lg font-bold" style="color: {$colorStore.text}">{serverData.reminders.length}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">Reminders</div>
                </div>
                <div>
                  <div class="text-lg font-bold" style="color: {$colorStore.text}">{serverData.analytics.featureUsage?.totalTransactions || 0}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">Transactions</div>
                </div>
                <div>
                  <div class="text-lg font-bold" style="color: {$colorStore.text}">{serverData.starboard?.starsReceived || 0}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">Stars</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Notification -->
{#if showNotification}
  <Notification
    message={notificationMessage}
    type={notificationType}
    timeout={5000}
    onDismiss={dismissNotification}
  />
{/if}

<style>
</style>