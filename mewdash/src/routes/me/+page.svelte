<!-- routes/me/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import { clickOutside } from "$lib/clickOutside";
  import Notification from "$lib/components/ui/Notification.svelte";
  import {
    AlertCircle,
    Bell,
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    Hash,
    Lightbulb,
    Plus,
    Save,
    Server,
    Settings,
    Shield,
    Star,
    Trash2,
    User,
    XCircle
  } from "lucide-svelte";

  export let data;

  // State
  let loading = false;
  let saving = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let showNotification = false;

  // User data
  let currentUser = data.user;
  let userId = BigInt(currentUser?.id || "0");

  // Global data (loads immediately)
  let userProfile: any = {};
  let userPreferences: any = {};
  let editingProfile = false;
  let profileForm: any = {};

  // Server selection for per-server settings
  let availableGuilds: any[] = [];
  let selectedGuild: any = null;
  let showGuildDropdown = false;
  let guildSearchTerm = "";
  let guildConfig: any = null;

  // Per-server data (loads after guild selection)
  let serverData: any = {
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

  // Form state
  let newHighlightWord = "";
  let newAfkMessage = "";

  // Load global profile data
  async function loadGlobalData() {
    if (!userId) return;

    loading = true;
    try {
      const dummyGuildId = BigInt("0");
      const [profile, preferences] = await Promise.all([
        api.getUserProfile(dummyGuildId, userId).catch(() => ({})),
        api.getUserPreferences(dummyGuildId, userId).catch(() => ({}))
      ]);

      userProfile = profile;
      userPreferences = preferences;
      
      profileForm = {
        bio: profile.bio || "",
        pronouns: profile.pronouns || "",
        zodiacSign: profile.zodiacSign || "",
        switchFriendCode: profile.switchFriendCode || "",
        profileImageUrl: profile.profileImageUrl || "",
        profileColor: profile.profileColor ? '#' + profile.profileColor.toString(16).padStart(6, '0') : "",
        birthday: profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : "",
        birthdayTimezone: profile.birthdayTimezone || "UTC",
        profilePrivacy: profile.profilePrivacy || 0,
        birthdayDisplayMode: profile.birthdayDisplayMode || 0
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
      const guilds = await api.getMutualGuilds(userId, false);
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
        api.getUserHighlights(selectedGuild.id, userId).catch(() => []),
        api.getUserHighlightSettings(selectedGuild.id, userId).catch(() => ({ 
          highlightsEnabled: true, ignoredChannels: [], ignoredUsers: [] 
        })),
        api.getUserAfkStatus(selectedGuild.id, userId).catch(() => ({
          isAfk: false, message: "", when: null, wasTimed: false
        })),
        api.getUserXpStats(selectedGuild.id, userId).catch(() => null),
        api.getUserReputation(selectedGuild.id, userId).catch(() => ({
          totalRep: 0, rank: 0, totalGiven: 0, totalReceived: 0
        })),
        api.getUserSuggestions(selectedGuild.id, userId).catch(() => []),
        api.getUserCurrency(selectedGuild.id, userId).catch(() => ({ balance: 0, recentTransactions: [] })),
        api.getUserGiveaways(selectedGuild.id, userId).catch(() => []),
        api.getUserReminders(selectedGuild.id, userId).catch(() => []),
        api.getUserInvites(selectedGuild.id, userId).catch(() => ({ inviteCount: 0, invitedUsers: [] })),
        api.getUserMessages(selectedGuild.id, userId).catch(() => ({ totalMessages: 0, channelBreakdown: [] })),
        api.getUserStarboard(selectedGuild.id, userId).catch(() => null),
        api.getUserAnalytics(selectedGuild.id, userId).catch(() => ({})),
        // Only load guild config if user has admin access
        selectedGuild.hasAdminAccess ? api.getGuildConfig(selectedGuild.id).catch(() => null) : Promise.resolve(null)
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
      const result = await api.toggleUserGreetDms(BigInt("0"), userId);
      userProfile.greetDmsOptOut = result.greetDmsOptOut;
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
      const result = await api.toggleUserStats(BigInt("0"), userId);
      userProfile.statsOptOut = result.statsOptOut;
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
      const result = await api.toggleUserLevelUpPings(BigInt("0"), userId);
      userPreferences.levelUpPingsDisabled = result.levelUpPingsDisabled;
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
      const result = await api.toggleUserPronouns(BigInt("0"), userId);
      userPreferences.pronounsDisabled = result.pronounsDisabled;
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
      const result = await api.toggleUserBirthdayAnnouncements(BigInt("0"), userId);
      userProfile.birthdayAnnouncementsEnabled = result.birthdayAnnouncementsEnabled;
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
      const result = await api.toggleUserGuidedSetup(BigInt("0"), userId);
      userPreferences.prefersGuidedSetup = result.prefersGuidedSetup;
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
      const result = await api.resetUserWizard(BigInt("0"), userId);
      userPreferences.hasCompletedAnyWizard = result.hasCompletedAnyWizard;
      userPreferences.prefersGuidedSetup = result.prefersGuidedSetup;
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
      // For guild wizard reset, we need to reset the guild config, not user data
      // This should probably call a different endpoint that resets guildConfig.wizardCompleted/wizardSkipped
      const result = await api.resetGuildWizard(BigInt("0"), userId, selectedGuild.id);
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
      await api.updateUserProfile(BigInt("0"), userId, {
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
      await api.addUserHighlight(selectedGuild.id, userId, newHighlightWord.trim());
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
      await api.removeUserHighlight(selectedGuild.id, userId, highlightId);
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
      await api.setUserAfkStatus(selectedGuild.id, userId, {
        message: newAfkMessage.trim() || undefined,
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
      await api.removeUserAfkStatus(selectedGuild.id, userId);
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

  // Show notification
  function showMessage(text: string, type: "success" | "error" | "info") {
    notificationMessage = text;
    notificationType = type as "success" | "error";
    showNotification = true;
  }

  function dismissNotification() {
    showNotification = false;
  }

  $: filteredGuilds = availableGuilds.filter(guild =>
    guild.name.toLowerCase().includes(guildSearchTerm.toLowerCase())
  );

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
        <User class="w-8 h-8" style="color: {$colorStore.primary}" />
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
      <div class="rounded-2xl p-6 border backdrop-blur-sm"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                  border-color: {$colorStore.primary}30;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold flex items-center gap-2" style="color: {$colorStore.text}">
            <User class="w-5 h-5" />
            Personal Information
          </h2>
          {#if !editingProfile}
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 border"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
              on:click={() => editingProfile = true}
            >
              Edit
            </button>
          {/if}
        </div>

        {#if editingProfile}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Bio -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Bio</label>
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
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Pronouns</label>
              <input
                type="text"
                bind:value={profileForm.pronouns}
                placeholder="they/them, she/her, he/him..."
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              />
            </div>

            <!-- Zodiac Sign -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Zodiac Sign</label>
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
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Birthday</label>
              <input
                type="date"
                bind:value={profileForm.birthday}
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              />
            </div>

            <!-- Timezone -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Timezone</label>
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
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Switch Friend Code</label>
              <input
                type="text"
                bind:value={profileForm.switchFriendCode}
                placeholder="SW-0000-0000-0000"
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              />
            </div>

            <!-- Profile Color -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Profile Color</label>
              <input
                type="color"
                bind:value={profileForm.profileColor}
                class="w-full h-10 rounded-lg border"
                style="border-color: {$colorStore.primary}30;"
              />
            </div>

            <!-- Action buttons -->
            <div class="md:col-span-2 flex gap-3 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
              <button
                class="px-4 py-2 rounded-lg text-sm border"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                on:click={() => editingProfile = false}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                style="background: {$colorStore.primary}; color: white;"
                on:click={saveProfile}
                disabled={saving}
              >
                <Save class="w-3 h-3" />
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
        <div class="rounded-2xl p-6 border backdrop-blur-sm"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
            <Shield class="w-5 h-5" />
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
                  on:change={toggleGreetDms}
                  disabled={saving}
                  class="sr-only"
                />
                <div class="w-11 h-6 rounded-full transition-all relative shadow-inner"
                     style="background: {userProfile.greetDmsOptOut ? $colorStore.primary : '#374151'};">
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                       class:translate-x-5={userProfile.greetDmsOptOut}>
                  </div>
                </div>
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
                  on:change={toggleStats}
                  disabled={saving}
                  class="sr-only"
                />
                <div class="w-11 h-6 rounded-full transition-all relative shadow-inner"
                     style="background: {userProfile.statsOptOut ? $colorStore.primary : '#374151'};">
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                       class:translate-x-5={userProfile.statsOptOut}>
                  </div>
                </div>
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
                  on:change={toggleBirthdayAnnouncements}
                  disabled={saving}
                  class="sr-only"
                />
                <div class="w-11 h-6 rounded-full transition-all relative shadow-inner"
                     style="background: {userProfile.birthdayAnnouncementsEnabled ? $colorStore.primary : '#374151'};">
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                       class:translate-x-5={userProfile.birthdayAnnouncementsEnabled}>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="rounded-2xl p-6 border backdrop-blur-sm"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                    border-color: {$colorStore.primary}30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
            <Settings class="w-5 h-5" />
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
                  on:change={toggleLevelUpPings}
                  disabled={saving}
                  class="sr-only"
                />
                <div class="w-11 h-6 rounded-full transition-all relative shadow-inner"
                     style="background: {userPreferences.levelUpPingsDisabled ? $colorStore.primary : '#374151'};">
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                       class:translate-x-5={userPreferences.levelUpPingsDisabled}>
                  </div>
                </div>
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
                  on:change={togglePronouns}
                  disabled={saving}
                  class="sr-only"
                />
                <div class="w-11 h-6 rounded-full transition-all relative shadow-inner"
                     style="background: {userPreferences.pronounsDisabled ? $colorStore.primary : '#374151'};">
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                       class:translate-x-5={userPreferences.pronounsDisabled}>
                  </div>
                </div>
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
                  on:change={toggleGuidedSetup}
                  disabled={saving}
                  class="sr-only"
                />
                <div class="w-11 h-6 rounded-full transition-all relative shadow-inner"
                     style="background: {userPreferences.prefersGuidedSetup ? $colorStore.primary : '#374151'};">
                  <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                       class:translate-x-5={userPreferences.prefersGuidedSetup}>
                  </div>
                </div>
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
                    class="px-3 py-1.5 rounded-lg text-sm border transition-all hover:scale-105"
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                    on:click={resetWizard}
                    disabled={saving}
                  >
                    {saving ? 'Resetting...' : 'Reset'}
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- SERVER SETTINGS SECTION -->
    <div class="border-t pt-8" style="border-color: {$colorStore.primary}20;">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.secondary}20, {$colorStore.accent}20);">
          <Server class="w-6 h-6" style="color: {$colorStore.secondary}" />
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
          <Server class="w-16 h-16 mx-auto mb-4" style="color: {$colorStore.primary}" />
          <h3 class="text-xl font-semibold mb-3" style="color: {$colorStore.text}">Choose a Server</h3>
          <p class="mb-6" style="color: {$colorStore.muted}">
            Select a server to manage your highlights, AFK status, and view your activity
          </p>

          {#if availableGuilds.length > 0}
            <div class="relative max-w-md mx-auto" use:clickOutside on:clickoutside={() => showGuildDropdown = false}>
              <button
                class="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                style="background: {$colorStore.primary}; color: white;"
                on:click={() => showGuildDropdown = !showGuildDropdown}
              >
                <Server size={20} />
                Choose Server
                <ChevronDown size={16} class="transition-transform {showGuildDropdown ? 'rotate-180' : ''}" />
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
                    />
                  </div>

                  <!-- Server List -->
                  <div class="max-h-60 overflow-y-auto">
                    {#each filteredGuilds as guild (guild.id)}
                      <button
                        class="w-full flex items-center gap-3 p-3 hover:bg-black hover:bg-opacity-30 transition-colors text-left"
                        on:click={() => handleGuildSelect(guild)}
                      >
                        <img
                          src={guild.icon ? 
                            `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64` :
                            'https://cdn.discordapp.com/embed/avatars/0.png'
                          }
                          alt=""
                          class="w-10 h-10 rounded-lg"
                        />
                        <div class="flex-1 min-w-0">
                          <div class="font-medium truncate" style="color: {$colorStore.text}">
                            {guild.name}
                          </div>
                          <div class="text-xs" style="color: {$colorStore.muted}">
                            {guild.memberCount?.toLocaleString() || 'Unknown'} members
                          </div>
                        </div>
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
        <div class="mb-8 p-6 rounded-2xl border backdrop-blur-sm"
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
              />
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
                class="px-6 py-3 rounded-xl font-medium border transition-all hover:scale-105 flex items-center gap-2"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border-color: {$colorStore.secondary}40;"
                on:click={changeServer}
              >
                <Server class="w-4 h-4" />
                Change Server
              </button>
              
              <!-- Guild Wizard Reset (only for admins with completed/skipped wizard) -->
              {#if selectedGuild.hasAdminAccess && (guildConfig?.wizardCompleted || guildConfig?.wizardSkipped)}
                <button
                  class="px-4 py-3 rounded-xl font-medium border transition-all hover:scale-105 flex items-center gap-2"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                  on:click={resetGuildWizard}
                  disabled={saving}
                  title="Reset setup wizard for this server"
                >
                  <Settings class="w-4 h-4" />
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
                <Star class="w-6 h-6 mx-auto mb-2" style="color: {$colorStore.primary}" />
                <div class="text-xl font-bold" style="color: {$colorStore.text}">Level {serverData.xpStats.level}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">Rank #{serverData.xpStats.rank}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{serverData.xpStats.totalXp.toLocaleString()} XP</div>
              </div>
            {/if}

            <!-- Reputation -->
            <div class="p-4 rounded-xl text-center border"
                 style="background: {$colorStore.secondary}08; border-color: {$colorStore.secondary}20;">
              <Star class="w-6 h-6 mx-auto mb-2" style="color: {$colorStore.secondary}" />
              <div class="text-xl font-bold" style="color: {$colorStore.text}">{serverData.reputation.totalRep}</div>
              <div class="text-sm" style="color: {$colorStore.muted}">Reputation</div>
              <div class="text-xs" style="color: {$colorStore.muted}">Rank #{serverData.reputation.rank}</div>
            </div>

            <!-- Message Stats -->
            <div class="p-4 rounded-xl text-center border"
                 style="background: {$colorStore.accent}08; border-color: {$colorStore.accent}20;">
              <Hash class="w-6 h-6 mx-auto mb-2" style="color: {$colorStore.accent}" />
              <div class="text-xl font-bold" style="color: {$colorStore.text}">{serverData.messages.totalMessages?.toLocaleString() || '0'}</div>
              <div class="text-sm" style="color: {$colorStore.muted}">Messages</div>
              <div class="text-xs" style="color: {$colorStore.muted}">{serverData.invites.inviteCount || 0} invites</div>
            </div>
          </div>

          <!-- Settings & Activity Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Highlights -->
            <div class="rounded-2xl p-6 border backdrop-blur-sm"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <Lightbulb class="w-5 h-5" />
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
                  on:keydown={(e) => e.key === 'Enter' && addHighlight()}
                />
                <button
                  class="px-4 py-2 rounded-lg transition-all hover:scale-105"
                  style="background: {$colorStore.primary}; color: white;"
                  on:click={addHighlight}
                  disabled={!newHighlightWord.trim()}
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>

              <!-- Highlight list -->
              <div class="space-y-2 max-h-32 overflow-y-auto">
                {#each serverData.highlights as highlight}
                  <div class="flex items-center justify-between p-2 rounded-lg"
                       style="background: {$colorStore.primary}08;">
                    <span class="text-sm" style="color: {$colorStore.text}">{highlight.word}</span>
                    <button
                      class="p-1 rounded transition-all hover:scale-110"
                      style="color: {$colorStore.accent};"
                      on:click={() => removeHighlight(highlight.id)}
                    >
                      <Trash2 class="w-3 h-3" />
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
            <div class="rounded-2xl p-6 border backdrop-blur-sm"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <Hash class="w-5 h-5" />
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
                      <div class="px-2 py-1 rounded text-xs"
                           style="background: {suggestion.currentState === 1 ? '#10b981' : 
                                            suggestion.currentState === 2 ? '#ef4444' : '#6b7280'}20;
                                  color: {suggestion.currentState === 1 ? '#10b981' : 
                                         suggestion.currentState === 2 ? '#ef4444' : '#6b7280'};">
                        {suggestion.stateName}
                      </div>
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
            <div class="rounded-2xl p-6 border backdrop-blur-sm"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <Star class="w-5 h-5" />
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
            <div class="rounded-2xl p-6 border backdrop-blur-sm"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <Clock class="w-5 h-5" />
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
                    on:click={setAfkStatus}
                    disabled={saving}
                  >
                    {saving ? 'Setting...' : 'Set AFK'}
                  </button>
                  {#if serverData.afkStatus.isAfk}
                    <button
                      class="px-4 py-2 rounded-lg text-sm border min-h-[40px]"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                      on:click={removeAfkStatus}
                      disabled={saving}
                    >
                      Remove
                    </button>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Activity Summary -->
            <div class="rounded-2xl p-6 border backdrop-blur-sm"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
                        border-color: {$colorStore.primary}30;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
                <Bell class="w-5 h-5" />
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
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>