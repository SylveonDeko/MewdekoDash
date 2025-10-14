<!-- routes/dashboard/votes/+page.svelte -->
<script lang="ts">
    import {onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import { votesApi, clientApi, type VoteRole, type Vote, type VoteLeaderboardEntry } from "$lib/api/index.ts";
    import {logger} from "$lib/logger";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

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
            showMessage("Failed to load vote data", "error");
        } finally {
            loading = false;
        }
    }

    // Save configuration
    async function saveConfig() {
        if (!$currentGuild?.id) return;

        saving = true;
        try {
            const promises = [];

            if (configForm.message !== voteMessage) {
              promises.push(votesApi.setVoteMessage($currentGuild.id, configForm.message));
            }

            if (configForm.password !== votePassword) {
              promises.push(votesApi.setVotePassword($currentGuild.id, configForm.password));
            }

          const newChannelId = configForm.channelId ? BigInt(configForm.channelId) : null;
          const voteChannelStr = voteChannel ? voteChannel.toString() : null;
          if (configForm.channelId !== voteChannelStr) {
            promises.push(votesApi.setVoteChannel($currentGuild.id, newChannelId || BigInt(0)));
            }

            await Promise.all(promises);
            showMessage("Vote configuration saved successfully!", "success");
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to save vote config:", err);
            showMessage("Failed to save configuration", "error");
        } finally {
            saving = false;
        }
    }

    // Add vote role
    async function addVoteRole() {
        if (!$currentGuild?.id || !newVoteRole.roleId) return;

        saving = true;
        try {
          await votesApi.addVoteRole($currentGuild.id, BigInt(newVoteRole.roleId), newVoteRole.timer);
            showMessage("Vote role added successfully!", "success");
            newVoteRole = { roleId: null, timer: 0 };
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to add vote role:", err);
            showMessage("Failed to add vote role", "error");
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
            showMessage("Vote role removed successfully!", "success");
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to remove vote role:", err);
            showMessage("Failed to remove vote role", "error");
        } finally {
            saving = false;
        }
    }

    // Clear all vote roles
    async function clearAllVoteRoles() {
        if (!$currentGuild?.id) return;
        if (!confirm("Are you sure you want to remove all vote roles?")) return;

        saving = true;
        try {
          await votesApi.clearVoteRoles($currentGuild.id);
            showMessage("All vote roles cleared!", "success");
            await loadAllVoteData();
        } catch (err) {
            logger.error("Failed to clear vote roles:", err);
            showMessage("Failed to clear vote roles", "error");
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
        if (seconds === 0) return "Permanent";
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    }

    onMount(() => {
        loadAllVoteData();
    });

    // Tabs configuration
    const tabs = [
      { id: "config", label: "Configuration", icon: "fa-gear" },
      { id: "roles", label: "Vote Roles", icon: "fa-crown" },
      { id: "stats", label: "Statistics", icon: "fa-chart-column" }
    ];

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: "Refresh",
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
        <i class="fa-utility-duo fa-regular fa-circle-xmark"
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
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-check-to-slot"
  statusMessages={statusMessageContent}
  subtitle="Configure voting rewards and tracking"
  {tabs}
  title="Vote Management"
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
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Basic Settings</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <!-- Channel Selection -->
                        <div>
                            <span id="vote-announcement-channel-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-hashtag inline mr-1" style="font-size: 14px;"></i>
                                Vote Announcement Channel
                            </span>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="channel"
                                        options={guildChannels}
                                        selected={configForm.channelId}
                                        placeholder="No channel selected"
                                        onchange={(detail) => {
                                            configForm.channelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null;
                                            configForm = { ...configForm };
                                        }}
                                />
                            </div>
                        </div>

                        <!-- Password -->
                        <div>
                          <label for="input-6068" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                            <i class="fa-solid fa-key inline mr-1" style="font-size: 14px;"></i>
                                API Password (for webhooks)
                            </label>
                            <div class="relative">
                                <input
                                        type={showPasswordField ? "text" : "password"}
                                        bind:value={configForm.password}
                                        placeholder="Enter API password"
                                        class="w-full p-3 pr-12 rounded-xl border transition-all min-h-[44px] text-base"
                                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                >
                                <button
                                        type="button"
                                        class="absolute right-3 top-1/2 -translate-y-1/2"
                                        onclick={() => showPasswordField = !showPasswordField}
                                        style="color: {$colorStore.muted}"
                                >
                                    {showPasswordField ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Custom Message -->
              <div class="relative z-10  rounded-2xl p-6 md:p-8 shadow-2xl transition-all border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                    border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                      <i class="fa-utility-duo fa-regular fa-message"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Vote Message</h2>
                    </div>

                    <div>
                      <label for="input-6068" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            Custom Vote Announcement
                        </label>
                        <textarea
                                bind:value={configForm.message}
                                placeholder="🗳️ Thanks %user.mention% for voting! You've received your rewards!"
                                rows="3"
                                class="w-full p-3 rounded-xl border transition-all resize-none min-h-[100px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        ></textarea>
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                            Available placeholders: %user.mention%, %user.name%, %user.id%, %server.name%. Leave empty for default message.
                        </p>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                  <button aria-label="Button action"
                          class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[52px]"
                            style="background: {$colorStore.primary}; color: white;"
                            onclick={saveConfig}
                            disabled={saving}
                    >
                    <i class="fa-solid fa-floppy-disk" style="font-size: 20px;"></i>
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>
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
                  <i class="fa-utility-duo fa-regular fa-plus"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Add Vote Role</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                    <div>
                        <span id="role-to-grant-label" class="block text-sm font-medium mb-2"
                              style="color: {$colorStore.text}">
                            <i class="fa-solid fa-crown inline mr-1" style="font-size: 14px;"></i>
                            Role to Grant
                        </span>
                        <DiscordSelector
                                type="role"
                                options={guildRoles}
                                selected={newVoteRole.roleId}
                                placeholder="Select role"
                                onchange={(detail) => {
                                    newVoteRole.roleId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null;
                                    newVoteRole = { ...newVoteRole };
                                }}
                        />
                    </div>

                    <div>
                      <label for="input-6068" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                        <i class="fa-solid fa-clock inline mr-1" style="font-size: 14px;"></i>
                            Duration (seconds, 0 for permanent)
                        </label>
                      <input id="input-6068"
                                type="number"
                                min="0"
                                bind:value={newVoteRole.timer}
                                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                    </div>
                </div>

                <button
                  class="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                        style="background: {$colorStore.primary}; color: white;"
                        onclick={addVoteRole}
                        disabled={saving || !newVoteRole.roleId}
                >
                  <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                    Add Vote Role
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
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Vote Roles ({voteRoles.length})</h2>
                    </div>
                    {#if voteRoles.length > 0}
                        <button
                          class="px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
                                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                onclick={clearAllVoteRoles}
                        >
                            Clear All
                        </button>
                    {/if}
                </div>

                <div class="space-y-3">
                    {#if voteRoles.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-crown"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Vote Roles</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Add roles to grant users when they vote for your server.
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
                                          Duration: {formatDuration(voteRole.seconds)}
                                        </div>
                                    </div>
                                </div>
                              <button aria-label="Delete"
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
                  icon="fa-check-to-slot"
                        label="Total Votes"
                        value={votes.length}
                        subtitle="all time"
                        iconColor="primary"
                        animationDelay={0}
                />

                <StatCard
                  icon="fa-crown"
                        label="Vote Roles"
                        value={voteRoles.length}
                        subtitle="configured rewards"
                        iconColor="secondary"
                        animationDelay={100}
                />

                <StatCard
                  icon="fa-trophy"
                        label="Top Voter"
                        value={leaderboard[0]?.voteCount || 0}
                        subtitle={leaderboard.length > 0 ? "votes" : "no data"}
                        iconColor="accent"
                        animationDelay={200}
                />
            </div>

            <!-- Leaderboard -->
          <div class="mt-6  rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                  <i class="fa-utility-duo fa-regular fa-chart-line"
                     style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Vote Leaderboard</h2>
                </div>

                <div class="space-y-3">
                    {#if leaderboard.length === 0}
                        <div class="text-center py-8">
                          <i class="fa-utility-duo fa-regular fa-trophy"
                             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
                            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Votes Yet</h3>
                            <p class="text-sm" style="color: {$colorStore.muted}">
                                Vote statistics will appear here once users start voting.
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
                                        User {entry.userId.toString()}
                                    </div>
                                    <div class="text-sm" style="color: {$colorStore.muted}">
                                        {entry.voteCount} vote{entry.voteCount !== 1 ? 's' : ''}
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
