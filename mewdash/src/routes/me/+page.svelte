<!-- routes/me/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { clientApi, guildApi, lastfmApi, meApi, xpApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { clickOutside } from "$lib/clickOutside";
  import Notification from "$lib/components/ui/Notification.svelte";
  import { dyslexicFontStore } from "$lib/stores/accessibilityStore.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { TIMEZONE_OPTIONS } from "$lib/config/timezones";
  import MyAchievements from "./MyAchievements.svelte";

  /** Zodiac sign options for the profile editor */
  const zodiacOptions = $derived([
    { id: "", name: "Not specified" },
    { id: "Aries", name: `♈ ${m.me.zodiacAries()}` },
    { id: "Taurus", name: `♉ ${m.me.zodiacTaurus()}` },
    { id: "Gemini", name: `♊ ${m.me.zodiacGemini()}` },
    { id: "Cancer", name: `♋ ${m.me.zodiacCancer()}` },
    { id: "Leo", name: `♌ ${m.me.zodiacLeo()}` },
    { id: "Virgo", name: `♍ ${m.me.zodiacVirgo()}` },
    { id: "Libra", name: `♎ ${m.me.zodiacLibra()}` },
    { id: "Scorpio", name: `♏ ${m.me.zodiacScorpio()}` },
    { id: "Sagittarius", name: `♐ ${m.me.zodiacSagittarius()}` },
    { id: "Capricorn", name: `♑ ${m.me.zodiacCapricorn()}` },
    { id: "Aquarius", name: `♒ ${m.me.zodiacAquarius()}` },
    { id: "Pisces", name: `♓ ${m.me.zodiacPisces()}` }
  ]);

  /** Last.fm period options */
  const lastFmPeriodOptions = $derived([
    { id: "7day", name: m.me.lastfmPeriodWeek() },
    { id: "1month", name: m.me.lastfmPeriodMonth() },
    { id: "3month", name: m.me.lastfmPeriod3Months() },
    { id: "6month", name: m.me.lastfmPeriod6Months() },
    { id: "12month", name: m.me.lastfmPeriodYear() },
    { id: "overall", name: m.common.allTime() }
  ]);

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
    currency: { balance: 0, bank: 0, netWorth: 0, recentTransactions: [] },
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
      showMessage(m.me.failedToLoadProfileData(), "error");
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
        meApi.getMyCurrency(selectedGuild.id, userId).catch(() => ({ balance: 0, bank: 0, netWorth: 0, recentTransactions: [] })),
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
      showMessage(m.me.failedToLoadServerData(), "error");
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
      showMessage(result.greetDmsOptOut ? m.me.toastWelcomeDmsBlocked() : m.me.toastWelcomeDmsAllowed(), "success");
    } catch (err) {
      showMessage(m.common.notifyUpdateFailed(), "error");
    } finally {
      saving = false;
    }
  }

  async function toggleStats() {
    saving = true;
    try {
      const result = await meApi.toggleStats(BigInt("0"), userId);
      (userProfile as any).statsOptOut = result.statsOptOut;
      showMessage(result.statsOptOut ? m.me.toastStatsTrackingBlocked() : m.me.toastStatsTrackingAllowed(), "success");
    } catch (err) {
      showMessage(m.common.notifyUpdateFailed(), "error");
    } finally {
      saving = false;
    }
  }

  async function toggleLevelUpPings() {
    saving = true;
    try {
      const result = await meApi.toggleLevelUpPings(BigInt("0"), userId);
      (userPreferences as any).levelUpPingsDisabled = result.levelUpPingsDisabled;
      showMessage(result.levelUpPingsDisabled ? m.me.toastLevelUpPingsDisabled() : m.me.toastLevelUpPingsEnabled(), "success");
    } catch (err) {
      showMessage(m.me.failedToUpdatePreference(), "error");
    } finally {
      saving = false;
    }
  }

  async function togglePronouns() {
    saving = true;
    try {
      const result = await meApi.togglePronouns(BigInt("0"), userId);
      (userPreferences as any).pronounsDisabled = result.pronounsDisabled;
      showMessage(result.pronounsDisabled ? m.me.toastPronounFetchingDisabled() : m.me.toastPronounFetchingEnabled(), "success");
    } catch (err) {
      showMessage(m.me.failedToUpdatePreference(), "error");
    } finally {
      saving = false;
    }
  }

  async function toggleBirthdayAnnouncements() {
    saving = true;
    try {
      const result = await meApi.toggleBirthdayAnnouncements(BigInt("0"), userId);
      (userProfile as any).birthdayAnnouncementsEnabled = result.birthdayAnnouncementsEnabled;
      showMessage(result.birthdayAnnouncementsEnabled ? m.me.toastBirthdayAnnouncementsEnabled() : m.me.toastBirthdayAnnouncementsDisabled(), "success");
    } catch (err) {
      showMessage(m.common.notifyUpdateFailed(), "error");
    } finally {
      saving = false;
    }
  }

  async function toggleGuidedSetup() {
    saving = true;
    try {
      const result = await meApi.toggleGuidedSetup(BigInt("0"), userId);
      (userPreferences as any).prefersGuidedSetup = result.prefersGuidedSetup;
      showMessage(result.prefersGuidedSetup ? m.me.toastGuidedSetupEnabled() : m.me.toastGuidedSetupDisabled(), "success");
    } catch (err) {
      showMessage(m.me.failedToUpdatePreference(), "error");
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
      showMessage(m.me.toastWizardReset(), "success");
      await loadGlobalData(); // Refresh data
    } catch (err) {
      showMessage(m.me.failedToResetWizard(), "error");
    } finally {
      saving = false;
    }
  }

  async function resetGuildWizard() {
    if (!selectedGuild?.id) return;

    saving = true;
    try {
      await meApi.resetGuildWizard(BigInt("0"), userId, selectedGuild.id);
      showMessage(m.me.toastGuildWizardReset({ server: selectedGuild.name }), "success");

      // Refresh server data to update guild config
      if (guildConfig) {
        guildConfig.wizardCompleted = false;
        guildConfig.wizardSkipped = false;
      }
      await loadServerData();
    } catch (err) {
      showMessage(m.me.failedToResetGuildWizard(), "error");
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
      showMessage(m.me.profileUpdated(), "success");
      await loadGlobalData();
    } catch (err) {
      showMessage(m.me.failedToSaveProfile(), "error");
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
      showMessage(m.me.highlightAdded(), "success");
      await loadServerData();
    } catch (err) {
      showMessage(m.me.failedToAddHighlight(), "error");
    }
  }

  // Remove highlight
  async function removeHighlight(highlightId: number) {
    if (!selectedGuild?.id) return;

    try {
      await meApi.removeHighlight(selectedGuild.id, userId, highlightId);
      showMessage(m.me.highlightRemoved(), "success");
      await loadServerData();
    } catch (err) {
      showMessage(m.me.failedToRemoveHighlight(), "error");
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
      showMessage(m.me.afkStatusSet(), "success");
      await loadServerData();
    } catch (err) {
      showMessage(m.me.failedToSetAfkStatus(), "error");
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
      showMessage(m.me.afkStatusRemoved(), "success");
      await loadServerData();
    } catch (err) {
      showMessage(m.me.failedToRemoveAfkStatus(), "error");
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
      currency: { balance: 0, bank: 0, netWorth: 0, recentTransactions: [] },
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
  <title>{m.me.mySettingsMewdeko()}</title>
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
        <h1 class="text-3xl font-bold" style="color: {$colorStore.text}">{m.common.mySettings()}</h1>
        <p class="text-lg mt-1" style="color: {$colorStore.muted}">
          {m.me.yourProfileAndServerPreferences()}
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
            {m.me.personalInformation()}
          </h2>
          {#if !editingProfile}
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] border"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
              onclick={() => editingProfile = true}
            >
              {m.common.edit()}
            </button>
          {/if}
        </div>

        {#if editingProfile}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Bio -->
            <div class="md:col-span-2">
              <label for="input-9136" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">{m.me.bio()}</label>
              <textarea
                bind:value={profileForm.bio}
                placeholder={m.me.tellOthersAboutYourself()}
                rows="3"
                class="w-full px-3 py-2 rounded-lg border resize-none"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              ></textarea>
            </div>

            <!-- Pronouns -->
            <div>
              <label for="input-9136" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">{m.common.pronouns()}</label>
              <input id="input-9136"
                type="text"
                bind:value={profileForm.pronouns}
                placeholder={m.me.theyThemSheHerHe()}
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              >
            </div>

            <!-- Zodiac Sign -->
            <div>
              <span id="zodiac-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.me.zodiacSign()}</span>
              <DiscordSelector
                type="custom"
                options={zodiacOptions}
                selected={profileForm.zodiacSign || ""}
                ariaLabelledby="zodiac-label"
                placeholder={m.me.notSpecified()}
                onchange={(e) => { profileForm.zodiacSign = typeof e.selected === "string" ? e.selected : ""; }}
              />
            </div>

            <!-- Birthday -->
            <div>
              <label for="input-1516" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">{m.placeholders.categoryBirthday()}</label>
              <input id="input-1516"
                type="date"
                bind:value={profileForm.birthday}
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              >
            </div>

            <!-- Timezone -->
            <div>
              <span id="birthday-timezone-label" class="block text-sm font-medium mb-2"
                    style="color: {$colorStore.text}">{m.common.timezone()}</span>
              <DiscordSelector
                type="timezone"
                options={TIMEZONE_OPTIONS}
                selected={profileForm.birthdayTimezone || "UTC"}
                ariaLabelledby="birthday-timezone-label"
                placeholder={m.common.selectTimezonePlaceholder()}
                onchange={(e) => { profileForm.birthdayTimezone = typeof e.selected === "string" ? e.selected : "UTC"; }}
              />
            </div>

            <!-- Switch Friend Code -->
            <div>
              <label for="input-4352" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.me.switchFriendCode()}</label>
              <input id="input-4352"
                type="text"
                bind:value={profileForm.switchFriendCode}
                placeholder={m.me.sw000000000000()}
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              >
            </div>

            <!-- Profile Color -->
            <div>
              <label for="input-8750" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.me.profileColor()}</label>
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
                {m.common.cancel()}
              </button>
              <button aria-label={m.me.buttonAction()}
                class="px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                style="background: {$colorStore.primary}; color: white;"
                onclick={saveProfile}
                disabled={saving}
              >
                <i class="fa-solid fa-floppy-disk" style="font-size: 12px;"></i>
                {saving ? m.common.saving() : m.common.save()}
              </button>
            </div>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.bio2()}</span>
              <p class="text-sm mt-1 p-2 rounded-lg min-h-[60px]" style="background: {$colorStore.primary}05; color: {$colorStore.muted}">
                {userProfile.bio || "No bio set"}
              </p>
            </div>
            <div>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.pronouns2()}</span>
              <span class="text-sm ml-2" style="color: {$colorStore.muted}">
                {userProfile.pronouns || "Not specified"}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.zodiac()}</span>
              <span class="text-sm ml-2" style="color: {$colorStore.muted}">
                {userProfile.zodiacSign || "Not specified"}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.birthday2()}</span>
              <span class="text-sm ml-2" style="color: {$colorStore.muted}">
                {userProfile.birthday ? new Date(userProfile.birthday).toLocaleDateString() : "Not set"}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.switchFc()}</span>
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
            {m.common.privacy()}
          </h3>

          <div class="space-y-4">
            <!-- Block Welcome DMs -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.blockWelcomeDms()}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.preventWelcomeMessages()}</div>
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
                <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.blockMessageTracking()}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.preventMessageCountTracking()}</div>
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
                <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.birthdayAnnouncements()}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.allowBirthdayCelebrations()}</div>
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
            {m.me.preferences()}
          </h3>

          <div class="space-y-4">
            <!-- Level-up Pings -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.levelUpPings()}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.disableLevelUpNotifications()}</div>
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
                <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.autoPronounFetching()}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.disablePronoundbIntegration()}</div>
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
                <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.dyslexiaFriendlyFont()}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.useOpendyslexicAcrossTheDashboard()}</div>
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
                <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.guidedSetup()}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.preferStepByStepGuidance()}</div>
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
                    <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.resetSetupWizard()}</div>
                    <div class="text-xs" style="color: {$colorStore.muted}">{m.me.seeSetupGuidesAgainFor()}</div>
                  </div>
                  <button
                    class="px-3 py-1.5 rounded-lg text-sm border transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                    onclick={resetWizard}
                    disabled={saving}
                  >
                    {saving ? m.me.resetting() : m.common.reset()}
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
            {m.me.lastFmScrobbling()}
          </h3>

          {#if lastFmStatus?.linked}
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div class="text-sm font-medium" style="color: {$colorStore.text}">
                  {m.me.connectedAs()} <strong>{lastFmStatus?.username}</strong>
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">
                  {lastFmStatus?.scrobblingEnabled ? m.me.lastfmScrobblingEnabled() : m.me.lastfmScrobblingDisabled()}
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
                      showMessage(lastFmStatus?.scrobblingEnabled ? m.me.toastScrobblingDisabled() : m.me.toastScrobblingEnabled(), 'success');
                    } catch (err) {
                      showMessage(m.me.failedToToggleScrobbling(), 'error');
                    } finally {
                      saving = false;
                    }
                  }}
                  disabled={saving}
                >
                  {lastFmStatus?.scrobblingEnabled ? m.common.disable() : m.common.enable()}
                </button>
                <button
                  class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm border transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                  onclick={async () => {
                    if (await requestConfirmation({ message: m.me.lastfmUnlinkConfirm(), confirmText: m.common.unlink() })) {
                      saving = true;
                      try {
                        await lastfmApi.unlink(BigInt("0"), userId);
                        await loadGlobalData();
                        showMessage(m.me.lastFmAccountUnlinked(), 'success');
                      } catch (err) {
                        showMessage(m.me.failedToUnlinkLastFm(), 'error');
                      } finally {
                        saving = false;
                      }
                    }
                  }}
                  disabled={saving}
                >
                  {m.common.unlink()}
                </button>
              </div>
            </div>
          {:else}
            <div class="text-center p-2">
              <p class="text-sm mb-3" style="color: {$colorStore.muted}">
                {m.me.linkYourLastFmAccount()}
              </p>
              <button
                class="w-full sm:w-auto px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
                style="background: #d51007; color: white;"
                onclick={async () => {
                  try {
                    const { authUrl } = await lastfmApi.getAuthUrl(BigInt("0"), userId);
                    window.open(authUrl, '_blank');
                    showMessage(m.me.completeAuthenticationInTheOpened(), 'success');
                  } catch (err) {
                    showMessage(m.me.lastfmAuthUrlFailed(), 'error');
                  }
                }}
                disabled={saving}
              >
                <i class="fa-brands fa-lastfm mr-2"></i>
                {m.me.connectLastFm()}
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
            {m.me.recentTracks()}
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
                        {m.common.nowPlaying()}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
              {m.me.noRecentTracks()}
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
              {m.me.topArtists()}
            </h3>
            <div class="w-36">
              <DiscordSelector
                type="custom"
                options={lastFmPeriodOptions}
                selected={lastFmPeriod}
                searchable={false}
                ariaLabel={m.me.lastfmPeriodAria()}
                onchange={(e) => { lastFmPeriod = typeof e.selected === "string" ? e.selected : "7day"; loadLastFmStats(); }}
              />
            </div>
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
                      {m.me.lastfmPlays({ count: artist.playcount })}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
              {m.me.noDataForThisPeriod()}
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
            {m.me.listeningStats()}
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
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.totalScrobbles()}</div>
              </div>
              <div>
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {lastFmTopArtists.length}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.topArtists()}</div>
              </div>
              <div>
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {lastFmTopAlbums.length}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.topAlbums()}</div>
              </div>
              <div>
                <div class="text-2xl font-bold" style="color: {$colorStore.text}">
                  {lastFmUserInfo?.country || m.common.unknown()}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">{m.me.country()}</div>
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
          <h2 class="text-2xl font-bold" style="color: {$colorStore.text}">{m.common.serverSettings()}</h2>
          <p class="text-sm" style="color: {$colorStore.muted}">{m.me.settingsSpecificToEachServer()}</p>
        </div>
      </div>

      {#if !selectedGuild}
        <!-- Server Selection -->
        <div class="text-center p-8 rounded-2xl border"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                    border-color: {$colorStore.primary}30;">
          <i class="fa-utility-duo fa-regular fa-server text-6xl mx-auto mb-4 block"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          <h3 class="text-xl font-semibold mb-3" style="color: {$colorStore.text}">{m.me.chooseAServer()}</h3>
          <p class="mb-6" style="color: {$colorStore.muted}">
            {m.me.selectAServerToManage()}
          </p>

          {#if availableGuilds.length > 0}
              <div class="relative max-w-md mx-auto" use:clickOutside onclickoutside={() => showGuildDropdown = false}>
              <button
                class="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}; color: white;"
                onclick={() => showGuildDropdown = !showGuildDropdown}
              >
                <i class="fa-solid fa-server" style="font-size: 20px;"></i>
                {m.me.chooseServer()}
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
                      placeholder={m.common.searchServersPlaceholder()}
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
                            {m.common.membersCount({ count: guild.memberCount?.toLocaleString() || m.common.unknown() })}
                          </span>
                        </span>
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <p style="color: {$colorStore.muted}">{m.common.noServersAvailable()}</p>
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
                  <span class="hidden sm:inline">{m.me.yourPersonalSettingsAndActivity()}</span>
                  <span class="sm:hidden">{m.common.membersCount({ count: selectedGuild.memberCount?.toLocaleString() || m.common.notAvailable() })}</span>
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
                {m.me.changeServer()}
              </button>

              <!-- Guild Wizard Reset (only for admins with completed/skipped wizard) -->
              {#if selectedGuild.hasAdminAccess && (guildConfig?.wizardCompleted || guildConfig?.wizardSkipped)}
                <button
                  class="px-4 py-3 rounded-xl font-medium border transition-all hover:scale-[1.02] flex items-center gap-2"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                  onclick={resetGuildWizard}
                  disabled={saving}
                  title={m.me.resetSetupWizardForThis()}
                >
                  <i class="fa-solid fa-gear" style="font-size: 16px;"></i>
                  <span class="hidden sm:inline">{m.me.resetWizard()}</span>
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
                <div class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.levelNumber({ level: serverData.xpStats.level })}</div>
                <div class="text-sm" style="color: {$colorStore.muted}">{m.common.rankNumber({ rank: serverData.xpStats.rank })}</div>
                <div class="text-xs" style="color: {$colorStore.muted}">{serverData.xpStats.totalXp.toLocaleString()} XP</div>
              </div>
            {/if}

            <!-- Reputation -->
            <div class="p-4 rounded-xl text-center border"
                 style="background: {$colorStore.secondary}08; border-color: {$colorStore.secondary}20;">
              <i class="fa-utility-duo fa-regular fa-star text-2xl mx-auto mb-2 block"
                 style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
              <div class="text-xl font-bold" style="color: {$colorStore.text}">{serverData.reputation.totalRep}</div>
              <div class="text-sm" style="color: {$colorStore.muted}">{m.features.reputationName()}</div>
              <div class="text-xs" style="color: {$colorStore.muted}">{m.common.rankNumber({ rank: serverData.reputation.rank })}</div>
            </div>

            <!-- Message Stats -->
            <div class="p-4 rounded-xl text-center border"
                 style="background: {$colorStore.accent}08; border-color: {$colorStore.accent}20;">
              <i class="fa-utility-duo fa-regular fa-list-numeric text-2xl mx-auto mb-2 block"
                 style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
              <div class="text-xl font-bold" style="color: {$colorStore.text}">{serverData.messages.totalMessages?.toLocaleString() || '0'}</div>
              <div class="text-sm" style="color: {$colorStore.muted}">{m.common.messages()}</div>
              <div class="text-xs" style="color: {$colorStore.muted}">{m.me.statInvites({ count: serverData.invites.inviteCount || 0 })}</div>
            </div>
          </div>

          {#key selectedGuild.id}
            <MyAchievements guildId={selectedGuild.id} {userId} onerror={(text) => showMessage(text, "error")} />
          {/key}

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
                {m.me.sectionHighlights({ count: serverData.highlights.length })}
              </h3>

              <!-- Add highlight -->
              <div class="flex gap-2 mb-4">
                <input
                  type="text"
                  bind:value={newHighlightWord}
                  placeholder={m.me.addHighlightWord()}
                  class="flex-1 px-3 py-2 rounded-lg border text-sm"
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                  onkeydown={(e) => e.key === 'Enter' && addHighlight()}
                >
                <button aria-label={m.common.add()}
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
                    <button aria-label={m.common.delete()}
                            class="p-1 rounded-sm transition-all hover:scale-110"
                      style="color: {$colorStore.accent};"
                      onclick={() => removeHighlight(highlight.id)}
                    >
                      <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                    </button>
                  </div>
                {:else}
                  <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
                    {m.me.noHighlightWordsSet()}
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
                <i class="fa-utility-duo fa-regular fa-list-numeric text-xl"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                {m.common.suggestionsCount({ count: serverData.suggestions.length })}
              </h3>

              {#if serverData.currency.bank}
                <div class="text-xs mb-3" style="color: {$colorStore.muted}">
                  {m.me.currencyWallet({ amount: serverData.currency.balance.toLocaleString() })}
                  {m.me.currencyBanked({ amount: serverData.currency.bank.toLocaleString() })}
                </div>
              {/if}

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
                        {suggestion.currentState === 1 ? m.common.accepted() : suggestion.currentState === 2 ? m.common.denied() : m.common.pending()}
                      </span>
                    </div>
                  </div>
                {:else}
                  <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">
                    {m.me.noSuggestionsMade()}
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
                {m.me.currencyNetWorth({ amount: (serverData.currency.netWorth ?? serverData.currency.balance).toLocaleString() })}
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
                    {m.me.noRecentTransactions()}
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
                {m.me.afkStatus()}
              </h3>

              {#if serverData.afkStatus.isAfk}
                <div class="p-3 rounded-lg mb-4 border"
                     style="background: {$colorStore.accent}15; border-color: {$colorStore.accent}30;">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.me.currentlyAfk()}</span>
                  </div>
                  {#if serverData.afkStatus.message}
                    <p class="text-sm" style="color: {$colorStore.muted}">"{serverData.afkStatus.message}"</p>
                  {/if}
                  {#if serverData.afkStatus.when}
                    <p class="text-xs" style="color: {$colorStore.muted}">
                      {m.me.afkSince({ time: new Date(serverData.afkStatus.when).toLocaleString() })}
                    </p>
                  {/if}
                </div>
              {/if}

              <!-- Set AFK -->
              <div class="space-y-3">
                <textarea
                  bind:value={newAfkMessage}
                  placeholder={m.me.enterAfkMessageOptional()}
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
                    {saving ? m.me.afkSetting() : m.me.afkSet()}
                  </button>
                  {#if serverData.afkStatus.isAfk}
                    <button
                      class="px-4 py-2 rounded-lg text-sm border min-h-[40px]"
                      style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border-color: {$colorStore.accent}30;"
                      onclick={removeAfkStatus}
                      disabled={saving}
                    >
                      {m.common.remove()}
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
                {m.common.recentActivity()}
              </h3>

              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div class="text-lg font-bold" style="color: {$colorStore.text}">{serverData.giveaways.length}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">{m.features.giveawaysName()}</div>
                </div>
                <div>
                  <div class="text-lg font-bold" style="color: {$colorStore.text}">{serverData.reminders.length}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">{m.common.reminders()}</div>
                </div>
                <div>
                  <div class="text-lg font-bold" style="color: {$colorStore.text}">{serverData.analytics.featureUsage?.totalTransactions || 0}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">{m.common.transactions()}</div>
                </div>
                <div>
                  <div class="text-lg font-bold" style="color: {$colorStore.text}">{serverData.starboard?.starsReceived || 0}</div>
                  <div class="text-xs" style="color: {$colorStore.muted}">{m.me.stars()}</div>
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
