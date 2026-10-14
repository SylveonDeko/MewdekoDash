<!-- routes/dashboard/votes/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { clientApi, type Vote, type VoteLeaderboardEntry, type VoteRole, votesApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  const autoSave = createAutoSave({
    onError: () => showMessage(m.votes.pageErrorAutosave(), "error")
  });

  // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    // Data state
    let voteRoles: VoteRole[] = $state([]);
    let voteMessage: string = $state("");
    let votePassword: string = $state("");
    let voteChannel: bigint | null = $state(null);
    let votes: Vote[] = $state([]);
    let leaderboard: VoteLeaderboardEntry[] = $state([]);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
    let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);

    // Form data
    let configForm = $state({
        message: "",
        password: "",
      channelId: null as string | null
    });
    let newVoteRole = $state({
        roleId: null as string | null,
        timer: 0
    });

    // UI state
    let activeTab = $state("config");
    let showPasswordField = $state(false);

    // Load all vote data
    async function loadAllVoteData() {
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            // Send anything still waiting before the form is replaced with fresh data
            await autoSave.flush();
            const [
                rolesData,
                messageData,
                passwordData,
                channelData,
                votesData,
              leaderboardData,
                channelsData,
              rolesListData
            ] = await Promise.all([
              votesApi.getVoteRoles($currentGuild.id).catch(() => []),
              votesApi.getVoteMessage($currentGuild.id).catch(() => ""),
              votesApi.getVotePassword($currentGuild.id).catch(() => ""),
              votesApi.getVoteChannel($currentGuild.id).catch(() => null),
              votesApi.getVotes($currentGuild.id).catch(() => []),
              votesApi.getVoteLeaderboard($currentGuild.id, 10).catch(() => []),
              clientApi.getTextChannels($currentGuild.id).catch(() => []),
              clientApi.getRoles($currentGuild.id).catch(() => [])
            ]);

            voteRoles = rolesData;

          // Unwrap string responses if they come as { data: "value" }
          voteMessage = typeof messageData === "object" && messageData !== null && "data" in messageData
            ? (messageData as any).data
            : (messageData || "");
          votePassword = typeof passwordData === "object" && passwordData !== null && "data" in passwordData
            ? (passwordData as any).data
            : (passwordData || "");
            voteChannel = channelData;
            votes = votesData;
            leaderboard = leaderboardData;

            guildChannels = (channelsData || []).map((channel: any) => ({
                id: channel.id.toString(),
                name: channel.name
            }));

            guildRoles = (rolesListData || [])
              .filter((role) =>
                    role.id !== $currentGuild?.id?.toString() &&
                    !role.name.startsWith("@")
                )
              .map((role) => ({
                id: role.id,
                    name: role.name,
                color: 0
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

          const channelIdStr = voteChannel ? voteChannel.toString() : null;

            configForm = {
                message: voteMessage,
                password: votePassword,
              channelId: channelIdStr
            };
        } catch (err) {
            logger.error("Failed to load vote data:", err);
            showMessage(m.votes.pageErrorLoad(), "error");
        } finally {
            loading = false;
        }
    }

    // Auto-save. voteMessage, votePassword and voteChannel hold the values the server last
    // confirmed; the guild id and value are captured when each save is triggered.
    function saveChannel(detail: { selected: string | string[] | null }) {
        if (!$currentGuild?.id) return;
        const channelId = detail.selected && typeof detail.selected === "string" ? detail.selected : null;
        configForm.channelId = channelId;
        const previous = voteChannel ? voteChannel.toString() : null;
        const guildId = $currentGuild.id;
        const value = channelId ? BigInt(channelId) : null;
        autoSave.now("channel", async () => {
            try {
                await votesApi.setVoteChannel(guildId, value || BigInt(0));
                if ($currentGuild?.id === guildId) voteChannel = value;
            } catch (err) {
                if ($currentGuild?.id === guildId) configForm.channelId = previous;
                throw err;
            }
        });
    }

    /** Empty uses the default announcement, so an empty message is a valid value to save. */
    function scheduleMessageSave() {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = configForm.message;
        autoSave.schedule("message", async () => {
            await votesApi.setVoteMessage(guildId, value);
            if ($currentGuild?.id === guildId) voteMessage = value;
        });
    }

    function savePassword(value: string, immediate: boolean) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const save = async () => {
            await votesApi.setVotePassword(guildId, value);
            if ($currentGuild?.id === guildId) votePassword = value;
        };
        if (immediate) autoSave.now("password", save);
        else autoSave.schedule("password", save);
    }

    /**
     * An empty password is never saved while typing, since clearing the field is often the
     * first step of replacing it. Leaving the field empty is what clears the password.
     */
    function handlePasswordInput() {
        if (!configForm.password) {
            autoSave.cancel("password");
            return;
        }
        savePassword(configForm.password, false);
    }

    function handlePasswordBlur() {
        if (!configForm.password && votePassword) {
            savePassword("", true);
            return;
        }
        void autoSave.flush("password");
    }

    // Add vote role
    async function addVoteRole() {
        if (!$currentGuild?.id || !newVoteRole.roleId) return;

        saving = true;
        try {
          await votesApi.addVoteRole($currentGuild.id, BigInt(newVoteRole.roleId), newVoteRole.timer);
            showMessage(m.votes.pageNotifyRoleAdded(), "success");
            newVoteRole = { roleId: null, timer: 0 };
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to add vote role:", err);
            showMessage(m.votes.pageErrorRoleAdd(), "error");
        } finally {
            saving = false;
        }
    }

    // Remove vote role
    async function removeVoteRole(roleId: bigint) {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
          await votesApi.removeVoteRole($currentGuild.id, roleId);
            showMessage(m.votes.pageNotifyRoleRemoved(), "success");
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to remove vote role:", err);
            showMessage(m.votes.pageErrorRoleRemove(), "error");
        } finally {
            saving = false;
        }
    }

    // Clear all vote roles
    async function clearAllVoteRoles() {
        if (!$currentGuild?.id) return;
        if (!(await requestConfirmation({ message: m.votes.pageConfirmClear(), confirmText: m.votes.pageConfirmClearConfirm() }))) return;

        saving = true;
        try {
          await votesApi.clearVoteRoles($currentGuild.id);
            showMessage(m.votes.pageNotifyCleared(), "success");
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to clear vote roles:", err);
            showMessage(m.votes.pageErrorClear(), "error");
        } finally {
            saving = false;
        }
    }

    // Utility functions
    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = "";
        }, 5000);
    }

    function formatDuration(seconds: number): string {
        if (seconds === 0) return m.common.permanent();
        if (seconds < 60) return m.widgets.intervalSecondsShort({ count: seconds });
        if (seconds < 3600) return m.common.minutesShort({ count: Math.floor(seconds / 60) });
        if (seconds < 86400) return m.common.hoursShort({ count: Math.floor(seconds / 3600) });
        return m.common.daysShort({ count: Math.floor(seconds / 86400) });
    }

    onMount(() => {
        loadAllVoteData();
    });

    // Tabs configuration
    const tabs = $derived([
      { id: "config", label: m.common.configuration(), icon: "fa-gear" },
      { id: "roles", label: m.votes.pageTabRoles(), icon: "fa-crown" },
      { id: "stats", label: m.common.statistics(), icon: "fa-chart-column" }
    ]);

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: m.common.refresh(),
          icon: "fa-arrows-rotate",
            action: loadAllVoteData,
            loading: loading
        }
    ]);

</script>

{#snippet statusMessageContent()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
          border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      {#if messageType === 'success'}
        <i class="fa-utility-duo fa-regular fa-circle-check"
           style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
      {:else if messageType === 'error'}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
      {:else}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {/if}
      <span
        style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-circle-check"
  statusMessages={statusMessageContent}
  subtitle={m.votes.pageSubtitle()}
  {tabs}
  title={m.votes.pageTitle()}
>

    <!-- Tab Content -->
    {#if activeTab === 'config'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="space-y-6 md:space-y-8">
                <!-- Basic Settings -->
              <div class="relative z-20  rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                      <i class="fa-utility-duo fa-regular fa-gear"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.basicSettings()}</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <!-- Channel Selection -->
                        <div>
                            <span id="vote-announcement-channel-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-hashtag inline mr-1" style="font-size: 14px;"></i>
                                {m.common.voteAnnouncementChannel()}
                            </span>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="channel"
                                        options={guildChannels}
                                        selected={configForm.channelId}
                                        placeholder={m.common.noChannelSelected()}
                                        onchange={saveChannel}
                                />
                            </div>
                        </div>

                        <!-- Password -->
                        <div>
                          <label for="vote-password" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                            <i class="fa-solid fa-key inline mr-1" style="font-size: 14px;"></i>
                                {m.votes.pageConfigPassword()}
                            </label>
                            <div class="relative">
                                <input
                                        id="vote-password"
                                        type={showPasswordField ? "text" : "password"}
                                        bind:value={configForm.password}
                                        oninput={handlePasswordInput}
                                        onblur={handlePasswordBlur}
                                        placeholder={m.votes.pageConfigPasswordPlaceholder()}
                                        class="w-full p-3 pr-12 rounded-xl border transition-all min-h-[44px] text-base"
                                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                >
                                <button
                                        type="button"
                                        class="absolute right-3 top-1/2 -translate-y-1/2"
                                        onclick={() => showPasswordField = !showPasswordField}
                                        style="color: {$colorStore.muted}"
                                >
                                    {showPasswordField ? m.common.hide() : m.common.show()}
                                </button>
                            </div>
                            <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                                {m.votes.pageConfigPasswordHint()}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Custom Message -->
              <div class="relative z-10  rounded-2xl p-6 md:p-8 shadow-2xl transition-all border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                    border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                      <i class="fa-utility-duo fa-regular fa-comment"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.votes.pageMessageTitle()}</h2>
                    </div>

                    <div>
                      <label for="vote-message" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            {m.votes.pageMessageLabel()}
                        </label>
                        <textarea
                                id="vote-message"
                                bind:value={configForm.message}
                                oninput={scheduleMessageSave}
                                onblur={() => autoSave.flush("message")}
                                placeholder={m.votes.pageMessagePlaceholder()}
                                rows="3"
                                class="w-full p-3 rounded-xl border transition-all resize-none min-h-[100px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        ></textarea>
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            {m.votes.pageMessageHint({ tokens: "%user.mention%, %user.name%, %user.id%, %server.name%" })}
                        </p>
                    </div>
                </div>
            </div>
        </div>

    {:else if activeTab === 'roles'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <!-- Add New Vote Role -->
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-circle-plus"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.votes.pageRoleAddAria()}</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                    <div>
                        <span id="role-to-grant-label" class="block text-sm font-medium mb-2"
                              style="color: {$colorStore.text}">
                            <i class="fa-solid fa-crown inline mr-1" style="font-size: 14px;"></i>
                            {m.votes.pageRoleToGrant()}
                        </span>
                        <DiscordSelector
                                type="role"
                                options={guildRoles}
                                selected={newVoteRole.roleId}
                                placeholder={m.common.selectRolePlaceholder()}
                                onchange={(detail) => {
                                    newVoteRole.roleId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null;
                                    newVoteRole = { ...newVoteRole };
                                }}
                        />
                    </div>

                    <div>
                      <label for="vote-role-duration" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-clock inline mr-1" style="font-size: 14px;"></i>
                            {m.votes.pageRoleDurationLabel()}
                        </label>
                      <input id="vote-role-duration"
                                type="number"
                                min="0"
                                bind:value={newVoteRole.timer}
                                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                    </div>
                </div>

                <button
                  aria-label={m.votes.pageRoleAddAria()}
                  aria-busy={saving}
                  class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                        onclick={addVoteRole}
                        disabled={saving || !newVoteRole.roleId}
                >
                  <i class="fa-solid fa-plus {saving ? 'fa-spin' : ''}" style="font-size: 18px;"></i>
                  {saving ? m.common.adding() : m.votes.pageRoleAddAria()}
                </button>
            </div>

            <!-- Vote Roles List -->
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-10"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                      <i class="fa-utility-duo fa-regular fa-crown"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.votes.pageRolesTitle({ count: voteRoles.length })}</h2>
                    </div>
                    {#if voteRoles.length > 0}
                        <button
                          class="px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
                                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                onclick={clearAllVoteRoles}
                        >
                            {m.common.clearAll()}
                        </button>
                    {/if}
                </div>

                <div class="space-y-3">
                    {#if voteRoles.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-crown"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.votes.pageRolesEmptyTitle()}</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                {m.votes.pageRolesEmptyHint()}
                            </p>
                        </div>
                    {:else}
                      {#each voteRoles as voteRole (voteRole.roleId)}
                            <div class="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                  <i class="fa-utility-duo fa-regular fa-crown"
                                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-semibold" style="color: {$colorStore.text}">
                                          {voteRole.roleName}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                          {m.votes.pageRoleDuration({ duration: formatDuration(voteRole.seconds) })}
                                        </div>
                                    </div>
                                </div>
                              <button aria-label={m.common.delete()}
                                        class="p-2 rounded-lg transition-all hover:scale-110"
                                        style="background: #ef444420; color: #ef4444;"
                                        onclick={() => removeVoteRole(voteRole.roleId)}
                                >
                                <i class="fa-solid fa-circle-xmark" style="font-size: 16px;"></i>
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                  icon="fa-circle-check"
                        label={m.votes.pageStatTotal()}
                        value={votes.length}
                        subtitle={m.common.allTimeLower()}
                        iconColor="primary"
                        animationDelay={0}
                />

                <StatCard
                  icon="fa-crown"
                        label={m.votes.pageTabRoles()}
                        value={voteRoles.length}
                        subtitle={m.votes.pageStatRolesSub()}
                        iconColor="secondary"
                        animationDelay={100}
                />

                <StatCard
                  icon="fa-trophy"
                        label={m.votes.pageStatTop()}
                        value={leaderboard[0]?.voteCount || 0}
                        subtitle={leaderboard.length > 0 ? m.votes.pageStatTopSubVotes() : m.common.noDataLower()}
                        iconColor="accent"
                        animationDelay={200}
                />
            </div>

            <!-- Leaderboard -->
          <div class="mt-6  rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-chart-simple"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.votes.pageLeaderboardTitle()}</h2>
                </div>

                <div class="space-y-3">
                    {#if leaderboard.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-trophy"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.votes.pageLeaderboardEmptyTitle()}</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                {m.votes.pageLeaderboardEmptyHint()}
                            </p>
                        </div>
                    {:else}
                      {#each leaderboard as entry, index (entry.userId)}
                            <div class="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center justify-center w-8 h-8 rounded-full"
                                     style="background: {index < 3 ? $colorStore.accent : $colorStore.primary}20; color: {index < 3 ? $colorStore.accent : $colorStore.primary};">
                                    {index + 1}
                                </div>
                                <div class="flex-1">
                                    <div class="font-semibold" style="color: {$colorStore.text}">
                                        {m.common.userFallback({ id: entry.userId.toString() })}
                                    </div>
                                    <div class="text-sm" style="color: {$colorStore.muted}">
                                        {entry.voteCount === 1 ? m.common.votesOne({ count: entry.voteCount }) : m.common.votesOther({ count: entry.voteCount })}
                                    </div>
                                </div>
                                {#if index === 0}
                                  <i class="fa-solid fa-trophy" style="color: #fbbf24; font-size: 24px;"></i>
                                {:else if index === 1}
                                  <i class="fa-solid fa-award" style="color: #94a3b8; font-size: 24px;"></i>
                                {:else if index === 2}
                                  <i class="fa-solid fa-award" style="color: #c2410c; font-size: 24px;"></i>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</DashboardPageLayout>
