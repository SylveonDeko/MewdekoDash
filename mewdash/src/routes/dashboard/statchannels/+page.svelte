<!-- routes/dashboard/statchannels/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
    import { fade, fly } from "svelte/transition";
    import { colorStore } from "$lib/stores/colorStore";
    import { currentGuild } from "$lib/stores/currentGuild";
    import {
        clientApi,
        countingApi,
        minecraftApi,
        statChannelsApi,
        type StatChannel,
        type StatChannelMetadata,
        type StatChannelSettings,
        type StatTypeDefinition
    } from "$lib/api/index.ts";
    import { logger } from "$lib/logger";

    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
    import { createAutoSave } from "$lib/utils/autoSave.svelte";

    const autoSave = createAutoSave({
        onError: () => showMessage(m.statchannels.notifySaveFailed(), "error")
    });

    /**
     * Every stat channel edit makes the bot refresh the channel straight away, and Discord only allows two channel
     * renames per 10 minutes, so per-channel edits wait longer than the default before saving.
     */
    const CHANNEL_SAVE_DELAY = 2000;

    /** Mirrors StatChannelRequirement on the bot. */
    const REQUIREMENT = {
        None: 0,
        Role: 1,
        Date: 2,
        Goal: 3,
        CounterName: 4,
        CountingChannel: 5,
        MinecraftServer: 6
    } as const;

    /** Mirrors StatChannelUpdateMechanism on the bot. */
    const MECHANISM = { Rename: 0, Recreate: 1, Auto: 2 } as const;

    /** Mirrors StatChannelValueKind on the bot. */
    const VALUE_KIND = { Number: 0, Text: 1, Boolean: 2 } as const;

    const mechanismCopy: Record<number, { label: string; blurb: string; caution?: string }> = $derived({
        0: {
            label: m.statchannels.mechanismRenameLabel(),
            blurb: m.statchannels.mechanismRenameBlurb(),
            caution: m.statchannels.mechanismRenameCaution()
        },
        1: {
            label: m.statchannels.mechanismRecreateLabel(),
            blurb: m.statchannels.mechanismRecreateBlurb(),
            caution: m.statchannels.mechanismRecreateCaution()
        },
        2: {
            label: m.statchannels.mechanismAutoLabel(),
            blurb: m.statchannels.mechanismAutoBlurb()
        }
    });

    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    let statChannels: StatChannel[] = $state([]);
    let metadata = $state<StatChannelMetadata | null>(null);
    let settings: StatChannelSettings = $state({
        defaultMechanism: 2,
        defaultIntervalMinutes: 5,
        defaultDisplayStyle: 1
    });
    /** The defaults as the server last confirmed them, so a failed save can put a selector back. */
    let savedSettings: StatChannelSettings = { defaultMechanism: 2, defaultIntervalMinutes: 5, defaultDisplayStyle: 1 };

    let voiceChannels: Array<{ id: string; name: string }> = $state([]);
    let guildRoles: Array<{ id: string; name: string }> = $state([]);
    let categoryChannels: Array<{ id: string; name: string }> = $state([]);
    let countingChannels: Array<{ id: string; name: string }> = $state([]);
    let minecraftServers: Array<{ id: string; name: string }> = $state([]);

    let activeTab = $state("channels");
    let createNew = $state(true);
    let previewText = $state("");
    let previewPending = $state(false);

    let editingId: number | null = $state(null);
    let editForm = $state({
        template: "",
        displayStyle: 1,
        updateMechanism: 2,
        updateIntervalMinutes: 5
    });

    let removeTarget: StatChannel | null = $state(null);
    let removeModalOpen = $state(false);

    let addForm = $state({
        channelId: null as string | null,
        categoryId: null as string | null,
        statType: 0,
        template: "👥 Members: %count%",
        displayStyle: 1,
        updateMechanism: 2,
        updateIntervalMinutes: 5,
        roleId: null as string | null,
        countdownDate: "",
        goalTarget: 1000,
        targetId: null as string | null,
        targetName: ""
    });

    let selectedDefinition: StatTypeDefinition | null = $derived(
        metadata?.statTypes.find((t) => t.type === addForm.statType) ?? null
    );

    /**
     * Stat type options grouped by category so the picker reads as a catalogue rather than a flat list of 57 entries.
     */
    let statTypeOptions = $derived(
        (metadata?.statTypes ?? []).map((t) => ({
            id: t.type.toString(),
            name: `${t.category} · ${t.name}`
        }))
    );

    let styleOptions = $derived(
        (metadata?.displayStyles ?? []).map((s) => ({
            id: s.style.toString(),
            name: `${s.name}: ${s.example}`
        }))
    );

    let mechanismOptions = $derived(
        (metadata?.mechanisms ?? []).map((mech) => ({
            id: mech.mechanism.toString(),
            name: mechanismCopy[mech.mechanism]?.label ?? mech.name
        }))
    );

    /**
     * The shortest refresh the currently chosen mechanism can actually sustain.
     */
    let minimumInterval = $derived(
        metadata?.mechanisms.find((mech) => mech.mechanism === addForm.updateMechanism)?.minimumIntervalMinutes ?? 1
    );

    /**
     * Every placeholder usable with the selected stat type.
     */
    let availablePlaceholders = $derived([
        ...(metadata?.commonPlaceholders ?? []),
        ...(selectedDefinition?.placeholders ?? [])
    ]);

    const tabs = $derived([
        { id: "channels", label: m.features.statchannelsName(), icon: "fa-chart-simple" },
        { id: "add", label: m.common.add(), icon: "fa-plus" },
        { id: "settings", label: m.statchannels.tabDefaults(), icon: "fa-sliders" }
    ]);

    let actionButtons = $derived([
        { label: m.common.refresh(), icon: "fa-arrows-rotate", action: loadData, loading }
    ]);

    async function loadData() {
        if (!$currentGuild?.id) return;
        loading = true;
        try {
            const [channelsData, metaData, settingsData, voiceData, rolesData, catData, countingData, mcData] =
                await Promise.all([
                    statChannelsApi.getStatChannels($currentGuild.id).catch(() => []),
                    statChannelsApi.getMetadata($currentGuild.id).catch(() => null),
                    statChannelsApi.getSettings($currentGuild.id).catch(() => null),
                    clientApi.getVoiceChannels($currentGuild.id).catch(() => []),
                    clientApi.getRoles($currentGuild.id).catch(() => []),
                    clientApi.getChannelsByType($currentGuild.id, 2).catch(() => []),
                    countingApi.getCountingChannels($currentGuild.id).catch(() => []),
                    minecraftApi.getServers($currentGuild.id).catch(() => [])
                ]);

            statChannels = channelsData ?? [];
            metadata = metaData;
            if (settingsData) {
                settings = settingsData;
                savedSettings = { ...settingsData };
            }

            voiceChannels = (voiceData || []).map((c: any) => ({ id: c.id.toString(), name: c.name }));
            categoryChannels = (catData || []).map((c: any) => ({ id: c.id.toString(), name: c.name }));
            countingChannels = (countingData || []).map((c: any) => ({
                id: c.channelId.toString(),
                name: c.channelName || c.channelId.toString()
            }));
            minecraftServers = (mcData || []).map((s: any) => ({ id: s.id.toString(), name: s.name }));
            guildRoles = (rolesData || [])
                .filter((r: any) => !r.managed && !r.name.startsWith("@"))
                .map((r: any) => ({ id: r.id.toString(), name: r.name }))
                .sort((a: any, b: any) => a.name.localeCompare(b.name));

            await refreshPreview();
        } catch (err) {
            logger.error("Failed to load stat channel data:", err);
            showMessage(m.common.failedToLoadData(), "error");
        } finally {
            loading = false;
        }
    }

    /**
     * Applies the sensible defaults for a newly picked stat type: its template, its recommended style, and a faster
     * refresh for the stats that are only useful when they are live.
     */
    function onStatTypeChange(newType: number) {
        addForm.statType = newType;
        const definition = metadata?.statTypes.find((t) => t.type === newType);
        if (!definition) return;

        addForm.template = definition.defaultTemplate;
        addForm.displayStyle = definition.recommendedStyle;

        if (definition.realtime && addForm.updateMechanism !== MECHANISM.Rename) {
            addForm.updateIntervalMinutes = 1;
        }

        addForm.roleId = null;
        addForm.targetId = null;
        addForm.targetName = "";
        refreshPreview();
    }

    function onMechanismChange(mechanism: number) {
        addForm.updateMechanism = mechanism;
        const min = metadata?.mechanisms.find((mech) => mech.mechanism === mechanism)?.minimumIntervalMinutes ?? 1;
        if (addForm.updateIntervalMinutes < min) addForm.updateIntervalMinutes = min;
    }

    let previewTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Asks the bot to render the current template against live guild data, debounced so typing does not spam the API.
     */
    function refreshPreview() {
        if (previewTimer) clearTimeout(previewTimer);
        previewTimer = setTimeout(async () => {
            if (!$currentGuild?.id || !addForm.template) {
                previewText = "";
                return;
            }
            previewPending = true;
            try {
                const result = await statChannelsApi.preview($currentGuild.id, {
                    statType: addForm.statType,
                    template: addForm.template,
                    displayStyle: addForm.displayStyle,
                    roleId: addForm.roleId ? BigInt(addForm.roleId) : undefined,
                    countdownDate: addForm.countdownDate || undefined,
                    goalTarget: addForm.goalTarget,
                    targetId: addForm.targetId ? BigInt(addForm.targetId) : undefined,
                    targetName: addForm.targetName || undefined
                });
                previewText = result.rendered;
            } catch (err) {
                previewText = "";
            } finally {
                previewPending = false;
            }
        }, 350);
    }

    async function addStatChannel() {
        if (!$currentGuild?.id) return;
        if (!createNew && !addForm.channelId) {
            showMessage(m.statchannels.notifySelectVoice(), "error");
            return;
        }

        saving = true;
        try {
            await statChannelsApi.addStatChannel($currentGuild.id, {
                channelId: createNew ? BigInt(0) : BigInt(addForm.channelId!),
                categoryId: createNew && addForm.categoryId ? BigInt(addForm.categoryId) : undefined,
                statType: addForm.statType,
                template: addForm.template,
                displayStyle: addForm.displayStyle,
                updateMechanism: addForm.updateMechanism,
                updateIntervalMinutes: addForm.updateIntervalMinutes,
                roleId: needs(REQUIREMENT.Role) && addForm.roleId ? BigInt(addForm.roleId) : undefined,
                countdownDate: needs(REQUIREMENT.Date) && addForm.countdownDate ? addForm.countdownDate : undefined,
                goalTarget: needs(REQUIREMENT.Goal) ? addForm.goalTarget : undefined,
                targetId:
                    (needs(REQUIREMENT.CountingChannel) || needs(REQUIREMENT.MinecraftServer)) && addForm.targetId
                        ? BigInt(addForm.targetId)
                        : undefined,
                targetName: needs(REQUIREMENT.CounterName) && addForm.targetName ? addForm.targetName : undefined
            });
            addForm.channelId = null;
            activeTab = "channels";
            await loadData();
        } catch (err) {
            logger.error("Failed to add stat channel:", err);
            showMessage(m.statchannels.notifyAddFailed(), "error");
        } finally {
            saving = false;
        }
    }

    function needs(requirement: number) {
        return selectedDefinition?.requirement === requirement;
    }

    function confirmRemove(sc: StatChannel) {
        removeTarget = sc;
        removeModalOpen = true;
    }

    async function removeStatChannel() {
        if (!$currentGuild?.id || !removeTarget) return;
        try {
            await statChannelsApi.removeStatChannel($currentGuild.id, removeTarget.channelId);
            await loadData();
        } catch (err) {
            showMessage(m.statchannels.notifyRemoveFailed(), "error");
        } finally {
            removeTarget = null;
        }
    }

    /** The edited channel's settings as the server last confirmed them, so a failed save can put a selector back. */
    let savedEdit = { template: "", displayStyle: 1, updateMechanism: 2, updateIntervalMinutes: 5 };

    function channelKey(id: number) {
        return `channel:${id}`;
    }

    function intervalMinimum(mechanism: number) {
        return metadata?.mechanisms.find((mech) => mech.mechanism === mechanism)?.minimumIntervalMinutes ?? 1;
    }

    function isValidInterval(value: unknown, min: number): value is number {
        return typeof value === "number" && Number.isInteger(value) && value >= min && value <= 1440;
    }

    function startEditing(sc: StatChannel) {
        if (editingId !== null) void autoSave.flush(channelKey(editingId));
        editingId = sc.id;
        editForm = {
            template: sc.template,
            displayStyle: sc.displayStyle,
            updateMechanism: sc.updateMechanism,
            updateIntervalMinutes: sc.updateIntervalMinutes
        };
        savedEdit = { ...editForm };
    }

    function stopEditing() {
        if (editingId !== null) void autoSave.flush(channelKey(editingId));
        editingId = null;
    }

    /**
     * Saves the channel being edited. All of a channel's fields share one key and one debounced save, so a burst of
     * edits reaches the bot as a single update and costs a single rename.
     */
    function saveChannel(sc: StatChannel) {
        if (!$currentGuild?.id) return;
        if (!editForm.template.trim()) return;
        if (!isValidInterval(editForm.updateIntervalMinutes, intervalMinimum(editForm.updateMechanism))) return;

        const guildId = $currentGuild.id;
        const id = sc.id;
        const fallbackChannelId = sc.channelId;
        const request = { ...editForm };
        const previous = { ...savedEdit };

        autoSave.schedule(channelKey(id), async () => {
            try {
                // A recreate gives the channel a new Discord ID, so resolve it when the save runs rather than when it
                // was queued. The stat channel's own id never changes.
                const channelId =
                    ($currentGuild?.id === guildId ? statChannels.find((c) => c.id === id)?.channelId : undefined) ??
                    fallbackChannelId;
                const updated = await statChannelsApi.updateStatChannel(guildId, channelId, request);
                refreshChannelsSoon(guildId);
                if ($currentGuild?.id !== guildId) return;
                if (editingId === id) savedEdit = { ...request };
                statChannels = statChannels.map((c) =>
                    c.id === id
                        ? {
                              ...c,
                              template: updated.template,
                              displayStyle: updated.displayStyle,
                              updateMechanism: updated.updateMechanism,
                              updateIntervalMinutes: updated.updateIntervalMinutes,
                              styleName:
                                  metadata?.displayStyles.find((s) => s.style === updated.displayStyle)?.name ??
                                  c.styleName,
                              mechanismName:
                                  metadata?.mechanisms.find((mech) => mech.mechanism === updated.updateMechanism)?.name ??
                                  c.mechanismName
                          }
                        : c
                );
            } catch (err) {
                if ($currentGuild?.id === guildId && editingId === id) {
                    editForm.displayStyle = previous.displayStyle;
                    editForm.updateMechanism = previous.updateMechanism;
                }
                throw err;
            }
        }, CHANNEL_SAVE_DELAY);
    }

    let channelRefreshTimer: ReturnType<typeof setTimeout> | undefined;

    /**
     * The bot refreshes a channel in the background after each edit, possibly recreating it under a new ID, so the
     * list is reloaded once that has had time to finish.
     */
    function refreshChannelsSoon(guildId: bigint) {
        clearTimeout(channelRefreshTimer);
        channelRefreshTimer = setTimeout(async () => {
            try {
                const channels = await statChannelsApi.getStatChannels(guildId);
                if ($currentGuild?.id === guildId) statChannels = channels ?? [];
            } catch (err) {
                logger.error("Failed to refresh stat channels:", err);
            }
        }, 4000);
    }

    function setDefaultSelect(field: "defaultMechanism" | "defaultDisplayStyle", value: number) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const previous = savedSettings[field];
        settings[field] = value;

        autoSave.now(field, async () => {
            try {
                await statChannelsApi.updateSettings(guildId, { [field]: value });
                if ($currentGuild?.id === guildId) savedSettings[field] = value;
            } catch (err) {
                if ($currentGuild?.id === guildId) settings[field] = previous;
                throw err;
            }
        });
    }

    function saveDefaultInterval() {
        if (!$currentGuild?.id) return;
        const value = settings.defaultIntervalMinutes;
        if (!isValidInterval(value, 1)) return;
        const guildId = $currentGuild.id;

        autoSave.schedule("defaultIntervalMinutes", async () => {
            await statChannelsApi.updateSettings(guildId, { defaultIntervalMinutes: value });
            if ($currentGuild?.id === guildId) savedSettings.defaultIntervalMinutes = value;
        });
    }

    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = "";
        }, 5000);
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
                <i class="fa-utility-duo fa-regular fa-circle-exclamation"
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
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-chart-simple"
  statusMessages={statusMessageContent}
  subtitle={m.statchannels.pageSubtitle()}
  {tabs}
  title={m.features.statchannelsName()}
>
    {#if activeTab === 'channels'}
        <div class="w-full space-y-4" in:fade={{ duration: 200 }}>
            {#if statChannels.length === 0}
                <div class="rounded-2xl border p-12 text-center"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <i class="fa-utility-duo fa-regular fa-chart-simple"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
                    <p class="mt-4 text-lg font-medium" style="color: {$colorStore.text}">{m.statchannels.listEmptyTitle()}</p>
                    <p class="text-sm mt-1" style="color: {$colorStore.muted}">{m.statchannels.listEmptyText()}</p>
                    <button class="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] mx-auto"
                            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                            onclick={() => { activeTab = 'add'; }}>
                        <i class="fa-solid fa-plus" style="font-size: 14px;"></i>
                        {m.statchannels.listAdd()}
                    </button>
                </div>
            {:else}
                {#each statChannels as sc (sc.id)}
                    <div class="rounded-2xl border p-5 shadow-2xl transition-all"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                                border-color: {$colorStore.primary}30;">
                        <div class="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            <div class="flex items-start gap-4 min-w-0">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                     style="background: {$colorStore.primary}20;">
                                    <i class="fa-solid fa-volume-high"
                                       style="color: {$colorStore.primary}; font-size: 16px;"></i>
                                </div>
                                <div class="min-w-0">
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
                                    <p class="text-sm" style="color: {$colorStore.muted}">{m.statchannels.listTemplate()}
                                        <code>{sc.template}</code></p>
                                    <div class="flex items-center gap-3 flex-wrap mt-1 text-xs"
                                         style="color: {$colorStore.muted}">
                                        <span><i class="fa-solid fa-rotate"></i>
                                            {m.statchannels.listRefreshEvery({ mechanism: mechanismCopy[sc.updateMechanism]?.label ?? sc.mechanismName, minutes: sc.updateIntervalMinutes })}</span>
                                        <span><i class="fa-solid fa-hashtag"></i> {sc.styleName}</span>
                                        {#if sc.roleName}
                                            <span><i class="fa-solid fa-at"></i> {sc.roleName}</span>
                                        {/if}
                                        {#if sc.targetName}
                                            <span><i class="fa-solid fa-tag"></i> {sc.targetName}</span>
                                        {/if}
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 shrink-0">
                                {#if editingId !== sc.id}
                                    <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-[1.02] text-sm"
                                            style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                                            onclick={() => startEditing(sc)}>
                                        <i class="fa-solid fa-pen" style="font-size: 12px;"></i>
                                        <span class="md:hidden">{m.common.edit()}</span>
                                    </button>
                                    <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-[1.02] text-sm"
                                            style="background: #ef444410; color: #ef4444;"
                                            onclick={() => confirmRemove(sc)}>
                                        <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                                        <span class="md:hidden">{m.common.remove()}</span>
                                    </button>
                                {/if}
                            </div>
                        </div>

                        {#if editingId === sc.id}
                            <div class="mt-5 pt-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4"
                                 style="border-color: {$colorStore.primary}20;"
                                 transition:fade={{ duration: 150 }}>
                                <div class="md:col-span-2">
                                    <label for="edit-template-{sc.id}" class="block text-sm font-medium mb-2"
                                           style="color: {$colorStore.text}">{m.common.template()}</label>
                                    <input id="edit-template-{sc.id}" type="text" bind:value={editForm.template}
                                           oninput={() => saveChannel(sc)}
                                           onblur={() => autoSave.flush(channelKey(sc.id))}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 46px;" />
                                </div>

                                <div>
                                    <label for="edit-style-{sc.id}" class="block text-sm font-medium mb-2"
                                           style="color: {$colorStore.text}">{m.statchannels.editStyle()}</label>
                                    <DiscordSelector id="edit-style-{sc.id}" type="custom" options={styleOptions}
                                                     selected={editForm.displayStyle.toString()}
                                                     placeholder={m.statchannels.editStylePlaceholder()}
                                                     onchange={(detail) => { editForm.displayStyle = detail.selected ? parseInt(detail.selected as string) : 1; saveChannel(sc); }} />
                                </div>

                                <div>
                                    <label for="edit-mechanism-{sc.id}" class="block text-sm font-medium mb-2"
                                           style="color: {$colorStore.text}">{m.statchannels.editMechanism()}</label>
                                    <DiscordSelector id="edit-mechanism-{sc.id}" type="custom"
                                                     options={mechanismOptions}
                                                     selected={editForm.updateMechanism.toString()}
                                                     placeholder={m.statchannels.editMechanismPlaceholder()}
                                                     onchange={(detail) => {
                                                         editForm.updateMechanism = detail.selected ? parseInt(detail.selected as string) : 2;
                                                         const min = intervalMinimum(editForm.updateMechanism);
                                                         if (!(editForm.updateIntervalMinutes >= min)) editForm.updateIntervalMinutes = min;
                                                         saveChannel(sc);
                                                     }} />
                                </div>

                                <div>
                                    <label for="edit-interval-{sc.id}" class="block text-sm font-medium mb-2"
                                           style="color: {$colorStore.text}">{m.statchannels.editInterval()}</label>
                                    <input id="edit-interval-{sc.id}" type="number"
                                           min={intervalMinimum(editForm.updateMechanism)}
                                           max="1440" bind:value={editForm.updateIntervalMinutes}
                                           oninput={() => saveChannel(sc)}
                                           onblur={() => autoSave.flush(channelKey(sc.id))}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 46px;" />
                                </div>

                                <div class="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-2">
                                    <button class="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                                            style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                                            onclick={stopEditing}>
                                        <i class="fa-solid fa-check" style="font-size: 13px;"></i>
                                        {m.common.done()}
                                    </button>
                                    <p class="text-xs" style="color: {$colorStore.muted}">
                                        {m.statchannels.editHint()}
                                    </p>
                                </div>
                            </div>
                        {/if}
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
                    <i class="fa-utility-duo fa-regular fa-circle-plus"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.statchannels.listAdd()}</h2>
                </div>

                <!-- Create/Existing toggle -->
                <div class="flex items-center gap-3 mb-6">
                    <button class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style="background: {createNew ? $colorStore.primary + '30' : $colorStore.primary + '10'};
                                   color: {createNew ? $colorStore.primary : $colorStore.muted};
                                   border: 1px solid {createNew ? $colorStore.primary : $colorStore.primary + '20'};"
                            onclick={() => { createNew = true; }}>
                        {m.statchannels.addCreateNew()}
                    </button>
                    <button class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style="background: {!createNew ? $colorStore.primary + '30' : $colorStore.primary + '10'};
                                   color: {!createNew ? $colorStore.primary : $colorStore.muted};
                                   border: 1px solid {!createNew ? $colorStore.primary : $colorStore.primary + '20'};"
                            onclick={() => { createNew = false; }}>
                        {m.statchannels.addUseExisting()}
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {#if createNew}
                        <div>
                            <label for="f-category" class="block text-sm font-medium mb-2"
                                   style="color: {$colorStore.text}">{m.common.categoryOptional()}</label>
                            <DiscordSelector id="f-category" type="channel" options={categoryChannels}
                                             selected={addForm.categoryId} placeholder={m.statchannels.addNoCategory()}
                                             onchange={(detail) => { addForm.categoryId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                    {:else}
                        <div>
                            <label for="f-voice" class="block text-sm font-medium mb-2"
                                   style="color: {$colorStore.text}">{m.common.voiceChannel()}</label>
                            <DiscordSelector id="f-voice" type="channel" options={voiceChannels}
                                             selected={addForm.channelId} placeholder={m.statchannels.addSelectVoice()}
                                             onchange={(detail) => { addForm.channelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                    {/if}

                    <div>
                        <label for="f-stat-type" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">{m.statchannels.addCounter()}</label>
                        <DiscordSelector id="f-stat-type" type="custom" options={statTypeOptions}
                                         selected={addForm.statType.toString()} placeholder={m.statchannels.addSelectCounter()}
                                         onchange={(detail) => onStatTypeChange(detail.selected ? parseInt(detail.selected as string) : 0)} />
                        {#if selectedDefinition}
                            <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                                {selectedDefinition.description}
                            </p>
                            <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                                {m.statchannels.addExample()} <code
                              style="color: {$colorStore.primary}">{selectedDefinition.example}</code>
                            </p>
                        {/if}
                    </div>

                    <!-- Requirement specific inputs -->
                    {#if needs(REQUIREMENT.Role)}
                        <div>
                            <label for="f-role" class="block text-sm font-medium mb-2"
                                   style="color: {$colorStore.text}">{m.common.role()}</label>
                            <DiscordSelector id="f-role" type="role" options={guildRoles}
                                             selected={addForm.roleId} placeholder={m.common.selectRolePlaceholder()}
                                             onchange={(detail) => { addForm.roleId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; refreshPreview(); }} />
                        </div>
                    {/if}

                    {#if needs(REQUIREMENT.Date)}
                        <div>
                            <label for="f-date" class="block text-sm font-medium mb-2"
                                   style="color: {$colorStore.text}">{m.statchannels.addTargetDate()}</label>
                            <input id="f-date" type="datetime-local" bind:value={addForm.countdownDate}
                                   oninput={refreshPreview}
                                   class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        </div>
                    {/if}

                    {#if needs(REQUIREMENT.Goal)}
                        <div>
                            <label for="f-goal" class="block text-sm font-medium mb-2"
                                   style="color: {$colorStore.text}">{m.statchannels.addGoal()}</label>
                            <input id="f-goal" type="number" min="1" bind:value={addForm.goalTarget}
                                   oninput={refreshPreview}
                                   class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        </div>
                    {/if}

                    {#if needs(REQUIREMENT.CounterName)}
                        <div>
                            <label for="f-counter-name" class="block text-sm font-medium mb-2"
                                   style="color: {$colorStore.text}">{m.statchannels.addTwitchCounter()}</label>
                            <input id="f-counter-name" type="text" bind:value={addForm.targetName}
                                   oninput={refreshPreview} placeholder={m.statchannels.addTwitchCounterPlaceholder()}
                                   class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                            <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                                {m.statchannels.addTwitchCounterHint()}
                            </p>
                        </div>
                    {/if}

                    {#if needs(REQUIREMENT.CountingChannel)}
                        <div>
                            <label for="f-counting" class="block text-sm font-medium mb-2"
                                   style="color: {$colorStore.text}">{m.features.wizardCountingStepChannelTitle()}</label>
                            <DiscordSelector id="f-counting" type="channel" options={countingChannels}
                                             selected={addForm.targetId} placeholder={m.statchannels.addSelectCounting()}
                                             onchange={(detail) => { addForm.targetId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; refreshPreview(); }} />
                        </div>
                    {/if}

                    {#if needs(REQUIREMENT.MinecraftServer)}
                        <div>
                            <label for="f-mcserver" class="block text-sm font-medium mb-2"
                                   style="color: {$colorStore.text}">{m.statchannels.addMinecraftServer()}</label>
                            <DiscordSelector id="f-mcserver" type="custom" options={minecraftServers}
                                             selected={addForm.targetId} placeholder={m.statchannels.addSelectServer()}
                                             onchange={(detail) => { addForm.targetId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; refreshPreview(); }} />
                        </div>
                    {/if}

                    <div class="md:col-span-2">
                        <label for="f-template" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">{m.common.template()}</label>
                        <input id="f-template" type="text" bind:value={addForm.template} oninput={refreshPreview}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />

                        <div class="flex flex-wrap gap-1.5 mt-2">
                            {#each availablePlaceholders as placeholder}
                                <button type="button"
                                        class="px-2 py-0.5 rounded-md text-xs font-mono transition-all hover:scale-[1.05]"
                                        style="background: {$colorStore.primary}10; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}20;"
                                        onclick={() => { addForm.template += placeholder; refreshPreview(); }}>
                                    {placeholder}
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- Live preview -->
                    <div class="md:col-span-2">
                        <div class="rounded-xl border p-4 flex items-center gap-3"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                            <i class="fa-solid fa-volume-high"
                               style="color: {$colorStore.muted}; font-size: 15px;"></i>
                            <span class="font-medium truncate" style="color: {$colorStore.text}">
                                {previewText || (previewPending ? m.statchannels.addPreviewRendering() : m.statchannels.addPreviewUnavailable())}
                            </span>
                            {#if previewPending}
                                <i class="fa-solid fa-circle-notch fa-spin"
                                   style="color: {$colorStore.muted}; font-size: 12px;"></i>
                            {/if}
                        </div>
                        <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                            {m.statchannels.addPreviewHint()}
                        </p>
                    </div>

                    <div>
                        <label for="f-style" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">{m.statchannels.editStyle()}</label>
                        <DiscordSelector id="f-style" type="custom" options={styleOptions}
                                         selected={addForm.displayStyle.toString()} placeholder={m.statchannels.editStylePlaceholder()}
                                         onchange={(detail) => { addForm.displayStyle = detail.selected ? parseInt(detail.selected as string) : 1; refreshPreview(); }} />
                        {#if selectedDefinition?.valueKind !== VALUE_KIND.Number}
                            <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                                {m.statchannels.addStyleTextHint({ kind: selectedDefinition?.valueKindName?.toLowerCase() ?? "" })}
                            </p>
                        {/if}
                    </div>

                    <div>
                        <label for="f-mechanism" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">{m.statchannels.editMechanism()}</label>
                        <DiscordSelector id="f-mechanism" type="custom" options={mechanismOptions}
                                         selected={addForm.updateMechanism.toString()}
                                         placeholder={m.statchannels.editMechanismPlaceholder()}
                                         onchange={(detail) => onMechanismChange(detail.selected ? parseInt(detail.selected as string) : 2)} />
                    </div>

                    <div class="md:col-span-2">
                        <div class="rounded-xl border p-4"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                            <p class="text-sm" style="color: {$colorStore.text}">
                                {mechanismCopy[addForm.updateMechanism]?.blurb}
                            </p>
                            {#if mechanismCopy[addForm.updateMechanism]?.caution}
                                <p class="text-xs mt-2 flex items-start gap-2" style="color: #f59e0b;">
                                    <i class="fa-solid fa-triangle-exclamation mt-0.5" style="font-size: 11px;"></i>
                                    <span>{mechanismCopy[addForm.updateMechanism].caution}</span>
                                </p>
                            {/if}
                        </div>
                    </div>

                    <div>
                        <label for="f-interval" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">{m.statchannels.editInterval()}</label>
                        <input id="f-interval" type="number" min={minimumInterval} max="1440"
                               bind:value={addForm.updateIntervalMinutes}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                            {(minimumInterval === 1 ? m.statchannels.addMinIntervalOne : m.statchannels.addMinIntervalOther)({ count: minimumInterval })}
                            {#if selectedDefinition?.realtime}
                                {m.statchannels.addRealtimeHint()}
                            {/if}
                        </p>
                    </div>
                </div>

                <button class="mt-6 flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={addStatChannel}
                        disabled={saving}>
                    <i class="fa-solid fa-plus {saving ? 'fa-spin' : ''}" style="font-size: 16px;"></i>
                    {saving ? m.common.adding() : m.statchannels.listAdd()}
                </button>
            </div>
        </div>

    {:else if activeTab === 'settings'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-2">
                    <i class="fa-utility-duo fa-regular fa-sliders"
                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.statchannels.defaultsTitle()}</h2>
                </div>
                <p class="text-sm mb-6" style="color: {$colorStore.muted}">
                    {m.statchannels.defaultsText()}
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label for="s-mechanism" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">{m.statchannels.defaultsMechanism()}</label>
                        <DiscordSelector id="s-mechanism" type="custom" options={mechanismOptions}
                                         selected={settings.defaultMechanism.toString()}
                                         placeholder={m.statchannels.editMechanismPlaceholder()}
                                         onchange={(detail) => setDefaultSelect("defaultMechanism", detail.selected ? parseInt(detail.selected as string) : 2)} />
                    </div>

                    <div>
                        <label for="s-style" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">{m.statchannels.defaultsStyle()}</label>
                        <DiscordSelector id="s-style" type="custom" options={styleOptions}
                                         selected={settings.defaultDisplayStyle.toString()}
                                         placeholder={m.statchannels.editStylePlaceholder()}
                                         onchange={(detail) => setDefaultSelect("defaultDisplayStyle", detail.selected ? parseInt(detail.selected as string) : 1)} />
                    </div>

                    <div>
                        <label for="s-interval" class="block text-sm font-medium mb-2"
                               style="color: {$colorStore.text}">{m.statchannels.defaultsInterval()}</label>
                        <input id="s-interval" type="number" min="1" max="1440"
                               bind:value={settings.defaultIntervalMinutes}
                               oninput={saveDefaultInterval}
                               onblur={() => autoSave.flush("defaultIntervalMinutes")}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                </div>
            </div>

            {#if metadata}
                <div class="rounded-2xl border p-6 md:p-8 shadow-2xl mt-6"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <h2 class="text-xl font-bold mb-1" style="color: {$colorStore.text}">{m.statchannels.stylesTitle()}</h2>
                    <p class="text-sm mb-5" style="color: {$colorStore.muted}">
                        {m.statchannels.stylesText()}
                    </p>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {#each metadata.displayStyles as style}
                            <div class="rounded-xl border p-3"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                                <p class="text-xs font-medium mb-1"
                                   style="color: {$colorStore.muted}">{style.name}</p>
                                <p class="font-mono text-sm truncate"
                                   style="color: {$colorStore.text}">{style.example}</p>
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="rounded-2xl border p-6 md:p-8 shadow-2xl mt-6"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <h2 class="text-xl font-bold mb-1" style="color: {$colorStore.text}">{m.statchannels.countersTitle()}</h2>
                    <p class="text-sm mb-5" style="color: {$colorStore.muted}">
                        {m.statchannels.countersText()}
                    </p>

                    {#each [...new Set(metadata.statTypes.map((t) => t.category))] as category}
                        <div class="mb-5 last:mb-0">
                            <h3 class="text-sm font-bold uppercase tracking-wide mb-2"
                                style="color: {$colorStore.primary}">{category}</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {#each metadata.statTypes.filter((t) => t.category === category) as definition}
                                    <div class="rounded-xl border p-3"
                                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <span class="text-sm font-medium"
                                                  style="color: {$colorStore.text}">{definition.name}</span>
                                            {#if definition.realtime}
                                                <span class="px-1.5 py-0.5 rounded text-xs"
                                                      style="background: #10b98120; color: #10b981;">{m.common.live()}</span>
                                            {/if}
                                        </div>
                                        <p class="text-xs mt-0.5"
                                           style="color: {$colorStore.muted}">{definition.description}</p>
                                        <p class="text-xs font-mono mt-1.5"
                                           style="color: {$colorStore.primary}">{definition.example}</p>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</DashboardPageLayout>

<ConfirmationModal
  bind:isOpen={removeModalOpen}
  confirmText={m.common.remove()}
  message={removeTarget
    ? m.statchannels.removeMessage({ name: removeTarget.channelName })
    : ""}
  title={m.statchannels.removeTitle()}
  variant="danger"
  onconfirm={removeStatChannel}
  oncancel={() => { removeTarget = null; }}
/>
