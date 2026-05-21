<!-- routes/dashboard/statchannels/+page.svelte -->
<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { colorStore } from "$lib/stores/colorStore";
    import { currentGuild } from "$lib/stores/currentGuild";
    import { clientApi, statChannelsApi, type StatChannel } from "$lib/api/index.ts";
    import { logger } from "$lib/logger";

    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    let statChannels: StatChannel[] = $state([]);
    let voiceChannels: Array<{ id: string; name: string }> = $state([]);
    let guildRoles: Array<{ id: string; name: string }> = $state([]);

    let activeTab = $state("channels");
    let editingId: number | null = $state(null);
    let editTemplate = $state("");

    let createNew = $state(true);
    let categoryChannels: Array<{ id: string; name: string }> = $state([]);

    let addForm = $state({
        channelId: null as string | null,
        categoryId: null as string | null,
        statType: 0,
        template: "Members: %count%",
        roleId: null as string | null,
        countdownDate: "",
        goalTarget: 1000,
    });

    const statTypeOptions = [
        { id: "0", name: "Total Members" },
        { id: "1", name: "Human Members" },
        { id: "2", name: "Bot Count" },
        { id: "3", name: "Online Members" },
        { id: "4", name: "Role Members" },
        { id: "5", name: "Channel Count" },
        { id: "6", name: "Role Count" },
        { id: "7", name: "Boost Count" },
        { id: "8", name: "Boost Level" },
        { id: "9", name: "Emoji Count" },
        { id: "10", name: "Countdown" },
        { id: "11", name: "Member Goal" },
    ];

    const defaultTemplates: Record<number, string> = {
        0: "Members: %count%",
        1: "Humans: %count%",
        2: "Bots: %count%",
        3: "Online: %count%",
        4: "%role.name%: %count%",
        5: "Channels: %count%",
        6: "Roles: %count%",
        7: "Boosts: %count%",
        8: "Boost Level: %count%",
        9: "Emojis: %count%",
        10: "Days until event: %days%",
        11: "Members: %count% / %goal%",
    };

    const tabs = [
        { id: "channels", label: "Stat Channels", icon: "fa-chart-simple" },
        { id: "add", label: "Add", icon: "fa-plus" },
    ];

    let actionButtons = $derived([
        { label: "Refresh", icon: "fa-arrows-rotate", action: loadData, loading },
    ]);

    async function loadData() {
        if (!$currentGuild?.id) return;
        loading = true;
        try {
            const [channelsData, voiceData, rolesData, catData] = await Promise.all([
                statChannelsApi.getStatChannels($currentGuild.id).catch(() => []),
                clientApi.getVoiceChannels($currentGuild.id).catch(() => []),
                clientApi.getRoles($currentGuild.id).catch(() => []),
                clientApi.getChannelsByType($currentGuild.id, 2).catch(() => []),
            ]);

            statChannels = channelsData ?? [];
            voiceChannels = (voiceData || []).map((c: any) => ({ id: c.id.toString(), name: c.name }));
            categoryChannels = (catData || []).map((c: any) => ({ id: c.id.toString(), name: c.name }));
            guildRoles = (rolesData || [])
                .filter((r: any) => !r.managed && !r.name.startsWith("@"))
                .map((r: any) => ({ id: r.id.toString(), name: r.name }))
                .sort((a: any, b: any) => a.name.localeCompare(b.name));
        } catch (err) {
            logger.error("Failed to load stat channel data:", err);
            showMessage("Failed to load data", "error");
        } finally {
            loading = false;
        }
    }

    async function addStatChannel() {
        if (!$currentGuild?.id) return;
        if (!createNew && !addForm.channelId) {
            showMessage("Select a voice channel", "error");
            return;
        }

        saving = true;
        try {
            await statChannelsApi.addStatChannel($currentGuild.id, {
                channelId: createNew ? BigInt(0) : BigInt(addForm.channelId!),
                categoryId: createNew && addForm.categoryId ? BigInt(addForm.categoryId) : undefined,
                statType: addForm.statType,
                template: addForm.template,
                roleId: addForm.statType === 4 && addForm.roleId ? BigInt(addForm.roleId) : undefined,
                countdownDate: addForm.statType === 10 && addForm.countdownDate ? addForm.countdownDate : undefined,
                goalTarget: addForm.statType === 11 ? addForm.goalTarget : undefined,
            });
            showMessage("Stat channel added!", "success");
            addForm.channelId = null;
            activeTab = "channels";
            await loadData();
        } catch (err) {
            logger.error("Failed to add stat channel:", err);
            showMessage("Failed to add. Channel may already be a stat channel.", "error");
        } finally {
            saving = false;
        }
    }

    async function removeStatChannel(channelId: bigint) {
        if (!$currentGuild?.id) return;
        if (!confirm("Remove this stat channel?")) return;

        try {
            await statChannelsApi.removeStatChannel($currentGuild.id, channelId);
            showMessage("Stat channel removed", "success");
            await loadData();
        } catch (err) {
            showMessage("Failed to remove", "error");
        }
    }

    function startEditing(sc: StatChannel) {
        editingId = sc.id;
        editTemplate = sc.template;
    }

    async function saveTemplate(sc: StatChannel) {
        if (!$currentGuild?.id) return;
        saving = true;
        try {
            await statChannelsApi.updateStatChannel($currentGuild.id, sc.channelId, { template: editTemplate });
            showMessage("Template updated!", "success");
            editingId = null;
            await loadData();
        } catch (err) {
            showMessage("Failed to update", "error");
        } finally {
            saving = false;
        }
    }

    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => { message = ""; }, 5000);
    }

    $effect(() => {
        if ($currentGuild?.id) {
            loadData();
        }
    });
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
            <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
        </div>
    {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-chart-simple"
  statusMessages={statusMessageContent}
  subtitle="Voice channels displaying live server statistics"
  {tabs}
  title="Stat Channels"
>
    {#if activeTab === 'channels'}
        <div class="w-full space-y-4" in:fade={{ duration: 200 }}>
            {#if statChannels.length === 0}
                <div class="rounded-2xl border p-12 text-center"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
                    <p class="mt-4 text-lg font-medium" style="color: {$colorStore.text}">No stat channels configured</p>
                    <p class="text-sm mt-1" style="color: {$colorStore.muted}">Add a voice channel to display live server stats</p>
                    <button class="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] mx-auto"
                            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                            onclick={() => { activeTab = 'add'; }}>
                        <i class="fa-solid fa-plus" style="font-size: 14px;"></i>
                        Add Stat Channel
                    </button>
                </div>
            {:else}
                {#each statChannels as sc (sc.id)}
                    <div class="rounded-2xl border p-5 shadow-2xl transition-all"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                                border-color: {$colorStore.primary}30;">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                     style="background: {$colorStore.primary}20;">
                                    <i class="fa-solid fa-volume-high" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <h3 class="font-bold" style="color: {$colorStore.text}">{sc.channelName}</h3>
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                              style="background: {$colorStore.primary}10; color: {$colorStore.muted};">{sc.typeName}</span>
                                        {#if sc.currentValue}
                                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                                  style="background: #10b98120; color: #10b981; border: 1px solid #10b98130;">
                                                {sc.currentValue}
                                            </span>
                                        {/if}
                                    </div>
                                    <p class="text-sm" style="color: {$colorStore.muted}">Template: <code>{sc.template}</code></p>
                                    {#if sc.roleName}
                                        <p class="text-xs" style="color: {$colorStore.muted}">Role: {sc.roleName}</p>
                                    {/if}
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                {#if editingId === sc.id}
                                    <input type="text" bind:value={editTemplate}
                                           class="p-2 rounded-xl border backdrop-blur-md focus:outline-none text-sm"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 40px; min-width: 200px;" />
                                    <button class="p-2 rounded-lg transition-all hover:scale-110"
                                            style="background: #10b98120; color: #10b981;"
                                            aria-label="Save template"
                                            onclick={() => saveTemplate(sc)}>
                                        <i class="fa-solid fa-check" style="font-size: 13px;"></i>
                                    </button>
                                    <button class="p-2 rounded-lg transition-all hover:scale-110"
                                            style="background: #ef444420; color: #ef4444;"
                                            aria-label="Cancel editing"
                                            onclick={() => { editingId = null; }}>
                                        <i class="fa-solid fa-xmark" style="font-size: 13px;"></i>
                                    </button>
                                {:else}
                                    <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-[1.02] text-sm"
                                            style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                                            onclick={() => startEditing(sc)}>
                                        <i class="fa-solid fa-pen" style="font-size: 12px;"></i>
                                        <span class="md:hidden">Edit</span>
                                    </button>
                                    <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-[1.02] text-sm"
                                            style="background: #ef444410; color: #ef4444;"
                                            onclick={() => removeStatChannel(sc.channelId)}>
                                        <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                                        <span class="md:hidden">Remove</span>
                                    </button>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

    {:else if activeTab === 'add'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fa-utility-duo fa-regular fa-plus" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Add Stat Channel</h2>
                </div>

                <!-- Create/Existing toggle -->
                <div class="flex items-center gap-3 mb-6">
                    <button class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style="background: {createNew ? $colorStore.primary + '30' : $colorStore.primary + '10'};
                                   color: {createNew ? $colorStore.primary : $colorStore.muted};
                                   border: 1px solid {createNew ? $colorStore.primary : $colorStore.primary + '20'};"
                            onclick={() => { createNew = true; }}>
                        Create New Channel
                    </button>
                    <button class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style="background: {!createNew ? $colorStore.primary + '30' : $colorStore.primary + '10'};
                                   color: {!createNew ? $colorStore.primary : $colorStore.muted};
                                   border: 1px solid {!createNew ? $colorStore.primary : $colorStore.primary + '20'};"
                            onclick={() => { createNew = false; }}>
                        Use Existing Channel
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {#if createNew}
                        <div>
                            <label for="f-+page-category-optional-325" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Category (optional)</label>
                            <DiscordSelector id="f-+page-category-optional-325" type="channel" options={categoryChannels}
                                selected={addForm.categoryId} placeholder="No category"
                                onchange={(detail) => { addForm.categoryId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                    {:else}
                        <div>
                            <label for="f-+page-voice-channel-332" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Voice Channel</label>
                            <DiscordSelector id="f-+page-voice-channel-332" type="channel" options={voiceChannels}
                                selected={addForm.channelId} placeholder="Select voice channel"
                                onchange={(detail) => { addForm.channelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                    {/if}
                    <div>
                        <label for="f-+page-stat-type-339" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Stat Type</label>
                        <DiscordSelector id="f-+page-stat-type-339" type="custom" options={statTypeOptions}
                            selected={addForm.statType.toString()} placeholder="Select stat type"
                            onchange={(detail) => {
                                const newType = detail.selected ? parseInt(detail.selected as string) : 0;
                                addForm.statType = newType;
                                addForm.template = defaultTemplates[newType] || "%count%";
                            }} />
                    </div>
                    <div class="md:col-span-2">
                        <label for="f-+page-template-349" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Template</label>
                        <input id="f-+page-template-349" type="text" bind:value={addForm.template}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                            Placeholders: %count%, %count.raw%, %server.name%, %server.members%, %server.boostcount%, %server.boostlevel%
                            {#if addForm.statType === 4}, %role.name%{/if}
                            {#if addForm.statType === 10}, %days%, %hours%{/if}
                            {#if addForm.statType === 11}, %goal%, %goal.raw%, %goal.percent%{/if}
                        </p>
                    </div>

                    {#if addForm.statType === 4}
                        <div>
                            <label for="f-+page-role-363" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role</label>
                            <DiscordSelector id="f-+page-role-363" type="role" options={guildRoles}
                                selected={addForm.roleId} placeholder="Select role"
                                onchange={(detail) => { addForm.roleId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                    {/if}

                    {#if addForm.statType === 10}
                        <div>
                            <label for="f-+page-target-date-372" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Target Date</label>
                            <input id="f-+page-target-date-372" type="datetime-local" bind:value={addForm.countdownDate}
                                   class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        </div>
                    {/if}

                    {#if addForm.statType === 11}
                        <div>
                            <label for="f-+page-goal-target-381" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Goal Target</label>
                            <input id="f-+page-goal-target-381" type="number" min="1" bind:value={addForm.goalTarget}
                                   class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        </div>
                    {/if}
                </div>

                <button class="mt-6 flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={addStatChannel}
                        disabled={saving}>
                    <i class="fa-solid fa-plus {saving ? 'fa-spin' : ''}" style="font-size: 16px;"></i>
                    {saving ? "Adding..." : "Add Stat Channel"}
                </button>
            </div>
        </div>
    {/if}
</DashboardPageLayout>
