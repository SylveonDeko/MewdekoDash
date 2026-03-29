<!-- routes/dashboard/minecraft/+page.svelte -->
<script lang="ts">
    import { onDestroy, tick } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { colorStore } from "$lib/stores/colorStore";
    import { currentGuild } from "$lib/stores/currentGuild";
    import { clientApi, minecraftApi, type MinecraftServer, type MinecraftStatus, type MinecraftSnapshot } from "$lib/api/index.ts";
    import { logger } from "$lib/logger";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";

    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    let servers: MinecraftServer[] = $state([]);
    let serverStatuses: Map<string, MinecraftStatus> = $state(new Map());
    let guildChannels: Array<{ id: string; name: string }> = $state([]);

    let activeTab = $state("servers");
    let editingServer: string | null = $state(null);
    let showAddForm = $state(false);

    let addForm = $state({
        name: "",
        address: "",
        port: 25565,
        serverType: 0,
        queryPort: 0,
        watchChannelId: null as string | null,
        watchInterval: 5,
        watchMode: 0,
        customEmbedTemplate: "",
    });

    let editForm = $state({
        address: "",
        port: 25565,
        serverType: 0,
        queryPort: 0,
        watchChannelId: null as string | null,
        watchInterval: 5,
        watchMode: 0,
        customEmbedTemplate: "",
    });

    const serverTypeOptions = [
        { id: "0", name: "Java Edition", icon: "fa-coffee" },
        { id: "1", name: "Bedrock Edition", icon: "fa-mobile-screen" },
    ];

    const watchModeOptions = [
        { id: "0", name: "Embed (edit in place)", icon: "fa-message" },
        { id: "1", name: "Channel Topic", icon: "fa-heading" },
        { id: "2", name: "Both", icon: "fa-layer-group" },
    ];

    let selectedHistoryServer: string | null = $state(null);
    let historyHours = $state(24);
    let snapshots: MinecraftSnapshot[] = $state<MinecraftSnapshot[]>([]);
    let historyCanvas: HTMLCanvasElement | undefined = $state();
    let latencyCanvas: HTMLCanvasElement | undefined = $state();
    let resizeObservers: ResizeObserver[] = [];

    const tabs = [
        { id: "servers", label: "Servers", icon: "fa-server" },
        { id: "history", label: "History", icon: "fa-chart-column" },
        { id: "add", label: "Add Server", icon: "fa-plus" },
    ];

    let actionButtons = $derived([
        {
            label: "Refresh",
            icon: "fa-arrows-rotate",
            action: loadAllData,
            loading: loading,
        },
        ...(servers.length > 0 ? [{
            label: "Query All",
            icon: "fa-satellite-dish",
            action: queryAllStatuses,
            loading: saving,
        }] : []),
    ]);

    async function loadAllData() {
        if (!$currentGuild?.id) return;
        loading = true;
        try {
            const [serversData, channelsData] = await Promise.all([
                minecraftApi.getServers($currentGuild.id).catch(() => []),
                clientApi.getTextChannels($currentGuild.id).catch(() => []),
            ]);

            servers = serversData;
            guildChannels = (channelsData || []).map((channel: any) => ({
                id: channel.id.toString(),
                name: channel.name,
            }));

            if (serversData.length > 0) {
                await Promise.allSettled(serversData.map(async (s: any) => {
                    try {
                        const cached = await minecraftApi.getCachedStatus($currentGuild!.id, s.name);
                        if (cached) {
                            const updated = new Map(serverStatuses);
                            updated.set(s.name, cached);
                            serverStatuses = updated;
                        }
                    } catch {
                        // no cached status available
                    }
                }));
            }
        } catch (err) {
            logger.error("Failed to load minecraft data:", err);
            showMessage("Failed to load data", "error");
        } finally {
            loading = false;
        }
    }

    async function queryServerStatus(name: string) {
        if (!$currentGuild?.id) return;
        try {
            const status = await minecraftApi.getServerStatus($currentGuild.id, name);
            const updated = new Map(serverStatuses);
            updated.set(name, status);
            serverStatuses = updated;
        } catch (err) {
            logger.error(`Failed to query status for ${name}:`, err);
            const updated = new Map(serverStatuses);
            updated.set(name, { isOnline: false, motd: "", playersOnline: 0, playersMax: 0, playerList: [], version: "", latency: 0, map: null, gameMode: null, software: null, plugins: [], isQueryResponse: false });
            serverStatuses = updated;
        }
    }

    async function queryAllStatuses() {
        if (!$currentGuild?.id || servers.length === 0) return;
        saving = true;
        try {
            await Promise.allSettled(servers.map(s => queryServerStatus(s.name)));
            showMessage(`Queried ${servers.length} server(s)`, "success");
        } catch (err) {
            showMessage("Failed to refresh statuses", "error");
        } finally {
            saving = false;
        }
    }

    async function addServer() {
        if (!$currentGuild?.id) return;
        if (!addForm.name.trim() || !addForm.address.trim()) {
            showMessage("Name and address are required", "error");
            return;
        }

        saving = true;
        try {
            const serverName = addForm.name.trim();
            await minecraftApi.addServer($currentGuild.id, {
                name: serverName,
                address: addForm.address.trim(),
                port: addForm.port,
                serverType: addForm.serverType,
                queryPort: addForm.queryPort,
            });

            if (addForm.watchChannelId) {
                await minecraftApi.setWatch($currentGuild.id, serverName, {
                    channelId: BigInt(addForm.watchChannelId),
                    interval: addForm.watchInterval,
                    watchMode: addForm.watchMode,
                });
            }

            if (addForm.customEmbedTemplate.trim()) {
                await minecraftApi.setCustomEmbed($currentGuild.id, serverName, {
                    template: addForm.customEmbedTemplate,
                });
            }

            showMessage(`Server "${serverName}" added successfully!`, "success");
            addForm = { name: "", address: "", port: 25565, serverType: 0, queryPort: 0, watchChannelId: null, watchInterval: 5, watchMode: 0, customEmbedTemplate: "" };
            activeTab = "servers";
            await loadAllData();
        } catch (err) {
            logger.error("Failed to add server:", err);
            showMessage("Failed to add server. Name may already exist.", "error");
        } finally {
            saving = false;
        }
    }

    function startEditing(server: MinecraftServer) {
        editingServer = server.name;
        editForm = {
            address: server.address,
            port: server.port,
            serverType: server.serverType,
            queryPort: server.queryPort,
            watchChannelId: server.watchChannelId?.toString() || null,
            watchInterval: server.watchInterval,
            watchMode: server.watchMode,
            customEmbedTemplate: server.customEmbedTemplate || "",
        };
    }

    function cancelEditing() {
        editingServer = null;
    }

    async function saveEditing(server: MinecraftServer) {
        if (!$currentGuild?.id || !editingServer) return;
        saving = true;
        try {
            const updateReq: any = {};
            if (editForm.address !== server.address) updateReq.address = editForm.address;
            if (editForm.port !== server.port) updateReq.port = editForm.port;
            if (editForm.serverType !== server.serverType) updateReq.serverType = editForm.serverType;
            if (editForm.queryPort !== server.queryPort) updateReq.queryPort = editForm.queryPort;

            if (Object.keys(updateReq).length > 0) {
                await minecraftApi.updateServer($currentGuild.id, server.name, updateReq);
            }

            const newWatchChannel = editForm.watchChannelId ? BigInt(editForm.watchChannelId) : null;
            const currentWatchChannel = server.watchChannelId;
            if (newWatchChannel?.toString() !== currentWatchChannel?.toString() || editForm.watchInterval !== server.watchInterval || editForm.watchMode !== server.watchMode) {
                await minecraftApi.setWatch($currentGuild.id, server.name, {
                    channelId: newWatchChannel,
                    interval: editForm.watchInterval,
                    watchMode: editForm.watchMode,
                });
            }

            const newTemplate = editForm.customEmbedTemplate.trim() || null;
            if (newTemplate !== server.customEmbedTemplate) {
                await minecraftApi.setCustomEmbed($currentGuild.id, server.name, { template: newTemplate });
            }

            showMessage(`Server "${server.name}" updated!`, "success");
            editingServer = null;
            await loadAllData();
        } catch (err) {
            logger.error("Failed to update server:", err);
            showMessage("Failed to update server", "error");
        } finally {
            saving = false;
        }
    }

    async function removeServer(name: string) {
        if (!$currentGuild?.id) return;
        if (!confirm(`Are you sure you want to remove server "${name}"?`)) return;

        saving = true;
        try {
            await minecraftApi.removeServer($currentGuild.id, name);
            showMessage(`Server "${name}" removed`, "success");
            await loadAllData();
        } catch (err) {
            logger.error("Failed to remove server:", err);
            showMessage("Failed to remove server", "error");
        } finally {
            saving = false;
        }
    }

    async function setDefault(name: string) {
        if (!$currentGuild?.id) return;
        saving = true;
        try {
            await minecraftApi.updateServer($currentGuild.id, name, { isDefault: true });
            showMessage(`"${name}" set as default server`, "success");
            await loadAllData();
        } catch (err) {
            logger.error("Failed to set default:", err);
            showMessage("Failed to set default server", "error");
        } finally {
            saving = false;
        }
    }

    async function loadHistory(serverName: string) {
        if (!$currentGuild?.id) return;
        selectedHistoryServer = serverName;
        try {
            snapshots = (await minecraftApi.getHistory($currentGuild.id, serverName, historyHours)) ?? [];
            await tick();
            drawGraphs();
        } catch (err) {
            logger.error("Failed to load history:", err);
            showMessage("Failed to load history", "error");
        }
    }

    function drawGraphs() {
        if (!snapshots || snapshots.length < 2) return;

        resizeObservers.forEach(o => o.disconnect());
        resizeObservers = [];

        setupResizableGraph(historyCanvas, snapshots, s => s.playersOnline, "Players");
        setupResizableGraph(latencyCanvas, snapshots, s => s.latency, "Latency (ms)");
    }

    function setupResizableGraph(canvas: HTMLCanvasElement | undefined, data: MinecraftSnapshot[], getValue: (s: MinecraftSnapshot) => number, label: string) {
        if (!canvas?.parentElement) return;
        drawGraph(canvas, data, getValue, label);
        const observer = new ResizeObserver(() => drawGraph(canvas, data, getValue, label));
        observer.observe(canvas.parentElement);
        resizeObservers.push(observer);
    }

    function drawGraph(canvas: HTMLCanvasElement | undefined, data: MinecraftSnapshot[], getValue: (s: MinecraftSnapshot) => number, label: string) {
        if (!canvas || data.length < 2) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const dpr = window.devicePixelRatio || 1;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        const isMobile = width < 400;
        const fontSize = isMobile ? 9 : 11;
        const smallFontSize = isMobile ? 8 : 10;
        const padding = {
            top: 24,
            right: 20,
            bottom: 50,
            left: isMobile ? 35 : 50
        };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        const values = data.map(getValue);
        const maxVal = Math.max(...values, 1);
        const yScale = chartHeight / maxVal;
        const xScale = chartWidth / (data.length - 1);

        ctx.strokeStyle = `${$colorStore.primary}20`;
        ctx.lineWidth = 1;

        const yStep = maxVal <= 10 ? 1 : Math.ceil(maxVal / (isMobile ? 3 : 5));
        for (let i = 0; i <= maxVal; i += yStep) {
            const y = height - padding.bottom - (i * yScale);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillStyle = $colorStore.muted;
            ctx.font = `${fontSize}px system-ui`;
            ctx.textAlign = "right";
            ctx.fillText(i.toString(), padding.left - 6, y + 4);
        }

        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, `${$colorStore.primary}25`);
        gradient.addColorStop(1, `${$colorStore.primary}05`);

        ctx.beginPath();
        data.forEach((point, i) => {
            const x = padding.left + (i * xScale);
            const y = height - padding.bottom - (getValue(point) * yScale);
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = padding.left + ((i - 1) * xScale);
                const prevY = height - padding.bottom - (getValue(data[i - 1]) * yScale);
                const cp1x = prevX + (x - prevX) * 0.5;
                ctx.bezierCurveTo(cp1x, prevY, cp1x, y, x, y);
            }
        });
        ctx.lineTo(padding.left + ((data.length - 1) * xScale), height - padding.bottom);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        data.forEach((point, i) => {
            const x = padding.left + (i * xScale);
            const y = height - padding.bottom - (getValue(point) * yScale);
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = padding.left + ((i - 1) * xScale);
                const prevY = height - padding.bottom - (getValue(data[i - 1]) * yScale);
                const cp1x = prevX + (x - prevX) * 0.5;
                ctx.bezierCurveTo(cp1x, prevY, cp1x, y, x, y);
            }
        });
        ctx.strokeStyle = $colorStore.primary;
        ctx.lineWidth = 2;
        ctx.stroke();

        const maxLabels = isMobile ? 4 : 8;
        const labelStep = Math.max(1, Math.floor(data.length / maxLabels));
        data.forEach((point, i) => {
            if (i % labelStep !== 0 && i !== data.length - 1) return;
            const x = padding.left + (i * xScale);
            ctx.save();
            ctx.fillStyle = $colorStore.muted;
            ctx.font = `${smallFontSize}px system-ui`;
            ctx.textAlign = "center";
            const date = new Date(point.timestamp);
            const timeStr = historyHours <= 48
                ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : date.toLocaleDateString([], { month: "short", day: "numeric" });
            ctx.translate(x, height - padding.bottom + 16);
            ctx.rotate(Math.PI / 4);
            ctx.fillText(timeStr, 0, 0);
            ctx.restore();
        });

        ctx.fillStyle = $colorStore.muted;
        ctx.font = `${fontSize}px system-ui`;
        ctx.textAlign = "left";
        ctx.fillText(label, padding.left, padding.top - 6);
    }

    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => { message = ""; }, 5000);
    }

    function getServerTypeLabel(type: number): string {
        return type === 1 ? "Bedrock" : "Java";
    }

    function getChannelName(channelId: bigint | null): string {
        if (!channelId) return "None";
        const ch = guildChannels.find(c => c.id === channelId.toString());
        return ch ? `#${ch.name}` : "Unknown";
    }

    onDestroy(() => {
        resizeObservers.forEach(o => o.disconnect());
    });

    $effect(() => {
        const guildId = $currentGuild?.id;
        if (guildId) {
            serverStatuses = new Map();
            selectedHistoryServer = null;
            snapshots = [];
            loadAllData();
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
  icon="fa-server"
  statusMessages={statusMessageContent}
  subtitle="Minecraft server monitoring and status"
  {tabs}
  title="Minecraft"
>
    {#if activeTab === 'servers'}
        <div class="w-full space-y-4" in:fade={{ duration: 200 }}>
            {#each servers as server (server.id)}
                <div class="rounded-2xl border p-6 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">

                    {#if editingServer === server.name}
                        <!-- Edit Mode -->
                        <div class="space-y-4">
                            <div class="flex items-center gap-3 mb-4">
                                <i class="fa-utility-duo fa-regular fa-pen-to-square" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                <h3 class="text-lg font-bold" style="color: {$colorStore.text}">Editing: {server.name}</h3>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Address</label>
                                    <input type="text" bind:value={editForm.address}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Port</label>
                                    <input type="number" bind:value={editForm.port}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Type</label>
                                    <DiscordSelector
                                        type="custom"
                                        options={serverTypeOptions}
                                        selected={editForm.serverType.toString()}
                                        placeholder="Select type"
                                        onchange={(detail) => {
                                            editForm.serverType = detail.selected ? parseInt(detail.selected as string) : 0;
                                        }}
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Query Port (0 = game port)</label>
                                    <input type="number" bind:value={editForm.queryPort}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Channel</label>
                                    <div class="min-h-[44px]">
                                        <DiscordSelector
                                          type="channel"
                                          options={guildChannels}
                                          selected={editForm.watchChannelId}
                                          placeholder="No watch channel"
                                          onchange={(detail) => {
                                              editForm.watchChannelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null;
                                          }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Interval (minutes)</label>
                                    <input type="number" min="1" max="60" bind:value={editForm.watchInterval}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Mode</label>
                                    <DiscordSelector
                                        type="custom"
                                        options={watchModeOptions}
                                        selected={editForm.watchMode.toString()}
                                        placeholder="Select watch mode"
                                        onchange={(detail) => {
                                            editForm.watchMode = detail.selected ? parseInt(detail.selected as string) : 0;
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Custom Watch Embed</label>
                                <FullscreenEmbedBuilder
                                    value={editForm.customEmbedTemplate}
                                    previewTitle="Server Status Embed"
                                    previewDescription="Displayed in the watch channel"
                                    icon="fa-server"
                                    allowContent={true}
                                    allowMultipleEmbeds={false}
                                    allowComponents={true}
                                    additionalPlaceholders={[
                                        { category: "Server", name: "%mc.server.name%", description: "Server label" },
                                        { category: "Server", name: "%mc.server.address%", description: "Server address" },
                                        { category: "Server", name: "%mc.server.port%", description: "Server port" },
                                        { category: "Server", name: "%mc.online%", description: "Online/Offline" },
                                        { category: "Server", name: "%mc.version%", description: "Server version" },
                                        { category: "Server", name: "%mc.latency%", description: "Ping latency" },
                                        { category: "Server", name: "%mc.motd%", description: "Message of the Day" },
                                        { category: "Server", name: "%mc.favicon%", description: "Server icon URL" },
                                        { category: "Players", name: "%mc.players.online%", description: "Online player count" },
                                        { category: "Players", name: "%mc.players.max%", description: "Max player count" },
                                        { category: "Players", name: "%mc.player.list%", description: "List of online players" },
                                        { category: "Query", name: "%mc.map%", description: "Current map name" },
                                        { category: "Query", name: "%mc.gamemode%", description: "Game mode" },
                                        { category: "Query", name: "%mc.software%", description: "Server software" },
                                        { category: "Query", name: "%mc.plugins%", description: "Plugin list" },
                                        { category: "Query", name: "%mc.query%", description: "Whether Query protocol was used" },
                                    ]}
                                    guildId={$currentGuild?.id}
                                    user={data.user}
                                    placeholder="Click to configure watch embed (leave empty for default)"
                                    onchange={(newValue) => { editForm.customEmbedTemplate = typeof newValue === 'string' ? newValue : JSON.stringify(newValue); }}
                                />
                            </div>

                            <div class="flex gap-3">
                                <button
                                  class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02]"
                                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                                  onclick={() => saveEditing(server)}
                                  disabled={saving}
                                >
                                    <i class="fa-solid fa-floppy-disk" style="font-size: 14px;"></i>
                                    {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02]"
                                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                                  onclick={cancelEditing}
                                >
                                    <i class="fa-solid fa-xmark" style="font-size: 14px;"></i>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    {:else}
                        <!-- View Mode -->
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                                     style="background: {$colorStore.primary}20;">
                                    <i class="fa-utility-duo fa-regular fa-server"
                                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 22px;"></i>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2">
                                        <h3 class="text-lg font-bold" style="color: {$colorStore.text}">{server.name}</h3>
                                        {#if server.isDefault}
                                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};">Default</span>
                                        {/if}
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                              style="background: {$colorStore.primary}10; color: {$colorStore.muted};">{getServerTypeLabel(server.serverType)}</span>
                                    </div>
                                    <p class="text-sm" style="color: {$colorStore.muted}">
                                        {server.address}:{server.port}
                                        {#if server.watchChannelId}
                                            &middot; Watching in {getChannelName(server.watchChannelId)} every {server.watchInterval}m
                                        {/if}
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 flex-wrap">
                                <!-- Status Badge -->
                                {#if serverStatuses.has(server.name)}
                                    {@const status = serverStatuses.get(server.name)!}
                                    {#if status.isOnline}
                                        <span class="px-3 py-1 rounded-full text-xs font-medium" style="background: #10b98120; color: #10b981; border: 1px solid #10b98130;">
                                            {status.playersOnline}/{status.playersMax} online &middot; {status.latency}ms
                                        </span>
                                    {:else}
                                        <span class="px-3 py-1 rounded-full text-xs font-medium" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;">
                                            Offline
                                        </span>
                                    {/if}
                                {/if}

                                <button
                                  class="p-2 rounded-lg transition-all hover:scale-110"
                                  style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                                  onclick={() => queryServerStatus(server.name)}
                                  title="Query status"
                                >
                                    <i class="fa-solid fa-satellite-dish" style="font-size: 14px;"></i>
                                </button>
                                {#if !server.isDefault}
                                    <button
                                      class="p-2 rounded-lg transition-all hover:scale-110"
                                      style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                                      onclick={() => setDefault(server.name)}
                                      title="Set as default"
                                    >
                                        <i class="fa-solid fa-star" style="font-size: 14px;"></i>
                                    </button>
                                {/if}
                                <button
                                  class="p-2 rounded-lg transition-all hover:scale-110"
                                  style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                                  onclick={() => startEditing(server)}
                                  title="Edit"
                                >
                                    <i class="fa-solid fa-pen" style="font-size: 14px;"></i>
                                </button>
                                <button
                                  class="p-2 rounded-lg transition-all hover:scale-110"
                                  style="background: #ef444410; color: #ef4444;"
                                  onclick={() => removeServer(server.name)}
                                  title="Remove"
                                >
                                    <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Extended Status Info -->
                        {#if serverStatuses.has(server.name)}
                            {@const status = serverStatuses.get(server.name)!}
                            {#if status.isOnline}
                                <div class="mt-4 pt-4" style="border-top: 1px solid {$colorStore.primary}15;">
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <span style="color: {$colorStore.muted}">Version</span>
                                            <p style="color: {$colorStore.text}">{status.version}</p>
                                        </div>
                                        {#if status.motd}
                                            <div>
                                                <span style="color: {$colorStore.muted}">MOTD</span>
                                                <p style="color: {$colorStore.text}" class="truncate">{status.motd}</p>
                                            </div>
                                        {/if}
                                        {#if status.map}
                                            <div>
                                                <span style="color: {$colorStore.muted}">Map</span>
                                                <p style="color: {$colorStore.text}">{status.map}</p>
                                            </div>
                                        {/if}
                                        {#if status.software}
                                            <div>
                                                <span style="color: {$colorStore.muted}">Software</span>
                                                <p style="color: {$colorStore.text}">{status.software}</p>
                                            </div>
                                        {/if}
                                    </div>
                                    {#if status.playerList.length > 0}
                                        <div class="mt-3">
                                            <span class="text-sm" style="color: {$colorStore.muted}">Players:</span>
                                            <div class="flex flex-wrap gap-1 mt-1">
                                                {#each status.playerList as player}
                                                    <span class="px-2 py-0.5 rounded-md text-xs"
                                                          style="background: {$colorStore.primary}15; color: {$colorStore.text};">{player}</span>
                                                {/each}
                                            </div>
                                        </div>
                                    {/if}
                                    {#if status.plugins.length > 0}
                                        <div class="mt-3">
                                            <span class="text-sm" style="color: {$colorStore.muted}">Plugins ({status.plugins.length}):</span>
                                            <p class="text-xs mt-1 truncate" style="color: {$colorStore.text}">{status.plugins.join(", ")}</p>
                                        </div>
                                    {/if}
                                    {#if status.isQueryResponse}
                                        <span class="inline-block mt-2 px-2 py-0.5 rounded-full text-xs"
                                              style="background: {$colorStore.primary}10; color: {$colorStore.muted};">
                                            via Query protocol
                                        </span>
                                    {/if}
                                </div>
                            {/if}
                        {/if}
                    {/if}
                </div>
            {:else}
                <div class="rounded-2xl border p-12 text-center"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <i class="fa-utility-duo fa-regular fa-server" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
                    <p class="mt-4 text-lg font-medium" style="color: {$colorStore.text}">No servers registered</p>
                    <p class="text-sm mt-1" style="color: {$colorStore.muted}">Add a Minecraft server to start monitoring</p>
                    <button
                      class="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] mx-auto"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                      onclick={() => { activeTab = 'add'; }}
                    >
                        <i class="fa-solid fa-plus" style="font-size: 14px;"></i>
                        Add Server
                    </button>
                </div>
            {/each}
        </div>

    {:else if activeTab === 'history'}
        <div class="w-full space-y-4" in:fade={{ duration: 200 }}>
            {#if servers.length === 0}
                <div class="rounded-2xl border p-12 text-center"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <p class="text-lg font-medium" style="color: {$colorStore.text}">No servers registered</p>
                </div>
            {:else}
                <div class="flex flex-wrap items-center gap-3">
                    {#each servers as server}
                        <button
                          class="px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02]"
                          style="background: {selectedHistoryServer === server.name ? $colorStore.primary + '30' : $colorStore.primary + '10'};
                                 color: {selectedHistoryServer === server.name ? $colorStore.primary : $colorStore.muted};
                                 border: 1px solid {selectedHistoryServer === server.name ? $colorStore.primary : $colorStore.primary + '20'};"
                          onclick={() => loadHistory(server.name)}
                        >
                            {server.name}
                        </button>
                    {/each}

                    <div class="ml-auto flex items-center gap-2">
                        {#each [{ label: "24h", value: 24 }, { label: "7d", value: 168 }, { label: "30d", value: 720 }] as period}
                            <button
                              class="px-3 py-1.5 rounded-lg text-sm transition-all"
                              style="background: {historyHours === period.value ? $colorStore.primary + '30' : $colorStore.primary + '08'};
                                     color: {historyHours === period.value ? $colorStore.primary : $colorStore.muted};
                                     border: 1px solid {historyHours === period.value ? $colorStore.primary : 'transparent'};"
                              onclick={() => { historyHours = period.value; if (selectedHistoryServer) loadHistory(selectedHistoryServer); }}
                            >
                                {period.label}
                            </button>
                        {/each}
                    </div>
                </div>

                {#if !selectedHistoryServer}
                    <div class="rounded-2xl border p-12 text-center"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                                border-color: {$colorStore.primary}30;">
                        <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
                        <p class="mt-4 text-lg font-medium" style="color: {$colorStore.text}">Select a server to view its history</p>
                        <p class="text-sm mt-1" style="color: {$colorStore.muted}">Player counts, latency, and uptime over time</p>
                    </div>
                {:else if snapshots && snapshots.length > 1}
                    <div class="rounded-2xl border p-6 shadow-2xl"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                                border-color: {$colorStore.primary}30;">
                        <div class="flex items-center gap-3 mb-4">
                            <i class="fa-utility-duo fa-regular fa-users"
                               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                            <h3 class="font-semibold" style="color: {$colorStore.text}">Players Online — {selectedHistoryServer}</h3>
                        </div>
                        <div class="w-full overflow-x-auto">
                            <div class="h-[250px] min-w-[500px] relative">
                                <canvas bind:this={historyCanvas}></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-2xl border p-6 shadow-2xl"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                                border-color: {$colorStore.primary}30;">
                        <div class="flex items-center gap-3 mb-4">
                            <i class="fa-utility-duo fa-regular fa-signal"
                               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                            <h3 class="font-semibold" style="color: {$colorStore.text}">Latency — {selectedHistoryServer}</h3>
                        </div>
                        <div class="w-full overflow-x-auto">
                            <div class="h-[250px] min-w-[500px] relative">
                                <canvas bind:this={latencyCanvas}></canvas>
                            </div>
                        </div>
                    </div>

                    {#if snapshots && snapshots.length > 0}
                        {@const onlineSnaps = snapshots.filter(s => s.isOnline)}
                        {@const avgPlayers = onlineSnaps.length > 0 ? Math.round(onlineSnaps.reduce((a, s) => a + s.playersOnline, 0) / onlineSnaps.length) : 0}
                        {@const peakPlayers = Math.max(...snapshots.map(s => s.playersOnline), 0)}
                        {@const avgLatency = onlineSnaps.length > 0 ? Math.round(onlineSnaps.reduce((a, s) => a + s.latency, 0) / onlineSnaps.length) : 0}
                        {@const uptime = snapshots.length > 0 ? Math.round((onlineSnaps.length / snapshots.length) * 100) : 0}

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10;">
                                <div class="text-sm" style="color: {$colorStore.muted}">Avg Players</div>
                                <div class="text-lg font-semibold" style="color: {$colorStore.text}">{avgPlayers}</div>
                            </div>
                            <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10;">
                                <div class="text-sm" style="color: {$colorStore.muted}">Peak Players</div>
                                <div class="text-lg font-semibold" style="color: {$colorStore.text}">{peakPlayers}</div>
                            </div>
                            <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10;">
                                <div class="text-sm" style="color: {$colorStore.muted}">Avg Latency</div>
                                <div class="text-lg font-semibold" style="color: {$colorStore.text}">{avgLatency}ms</div>
                            </div>
                            <div class="p-4 rounded-xl" style="background: {$colorStore.primary}10;">
                                <div class="text-sm" style="color: {$colorStore.muted}">Uptime</div>
                                <div class="text-lg font-semibold" style="color: {$colorStore.text}">{uptime}%</div>
                            </div>
                        </div>
                    {/if}
                {:else if selectedHistoryServer}
                    <div class="rounded-2xl border p-8 text-center"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                                border-color: {$colorStore.primary}30;">
                        <p style="color: {$colorStore.muted}">Not enough data yet. Snapshots are recorded each time the watch timer runs.</p>
                    </div>
                {/if}
            {/if}
        </div>

    {:else if activeTab === 'add'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fa-utility-duo fa-regular fa-plus" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Add Minecraft Server</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-tag" style="font-size: 14px;"></i>
                            Server Name
                        </label>
                        <input type="text" bind:value={addForm.name}
                               placeholder="e.g. survival, creative, smp"
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-globe" style="font-size: 14px;"></i>
                            Server Address
                        </label>
                        <input type="text" bind:value={addForm.address}
                               placeholder="e.g. play.example.com"
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-ethernet" style="font-size: 14px;"></i>
                            Port
                        </label>
                        <input type="number" bind:value={addForm.port}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-gamepad" style="font-size: 14px;"></i>
                            Server Type
                        </label>
                        <DiscordSelector
                            type="custom"
                            options={serverTypeOptions}
                            selected={addForm.serverType.toString()}
                            placeholder="Select server type"
                            onchange={(detail) => {
                                addForm.serverType = detail.selected ? parseInt(detail.selected as string) : 0;
                            }}
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-terminal" style="font-size: 14px;"></i>
                            Query Port (0 = same as game port)
                        </label>
                        <input type="number" bind:value={addForm.queryPort}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted}">Requires enable-query=true in server.properties for extended info</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-hashtag" style="font-size: 14px;"></i>
                            Watch Channel
                        </label>
                        <div class="min-h-[44px]">
                            <DiscordSelector
                                type="channel"
                                options={guildChannels}
                                selected={addForm.watchChannelId}
                                placeholder="No watch channel (optional)"
                                onchange={(detail) => {
                                    addForm.watchChannelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null;
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-clock" style="font-size: 14px;"></i>
                            Watch Interval (minutes)
                        </label>
                        <input type="number" min="1" max="60" bind:value={addForm.watchInterval}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-display" style="font-size: 14px;"></i>
                            Watch Mode
                        </label>
                        <DiscordSelector
                            type="custom"
                            options={watchModeOptions}
                            selected={addForm.watchMode.toString()}
                            placeholder="Select watch mode"
                            onchange={(detail) => {
                                addForm.watchMode = detail.selected ? parseInt(detail.selected as string) : 0;
                            }}
                        />
                    </div>
                </div>

                <div class="mt-6">
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Custom Watch Embed (optional)</label>
                    <FullscreenEmbedBuilder
                        value={addForm.customEmbedTemplate}
                        previewTitle="Server Status Embed"
                        previewDescription="Displayed in the watch channel"
                        icon="fa-server"
                        allowContent={true}
                        allowMultipleEmbeds={false}
                        allowComponents={true}
                        additionalPlaceholders={[
                            { category: "Server", name: "%mc.server.name%", description: "Server label" },
                            { category: "Server", name: "%mc.server.address%", description: "Server address" },
                            { category: "Server", name: "%mc.server.port%", description: "Server port" },
                            { category: "Server", name: "%mc.online%", description: "Online/Offline" },
                            { category: "Server", name: "%mc.version%", description: "Server version" },
                            { category: "Server", name: "%mc.latency%", description: "Ping latency" },
                            { category: "Server", name: "%mc.motd%", description: "Message of the Day" },
                            { category: "Server", name: "%mc.favicon%", description: "Server icon URL" },
                            { category: "Players", name: "%mc.players.online%", description: "Online player count" },
                            { category: "Players", name: "%mc.players.max%", description: "Max player count" },
                            { category: "Players", name: "%mc.player.list%", description: "List of online players" },
                            { category: "Query", name: "%mc.map%", description: "Current map name" },
                            { category: "Query", name: "%mc.gamemode%", description: "Game mode" },
                            { category: "Query", name: "%mc.software%", description: "Server software" },
                            { category: "Query", name: "%mc.plugins%", description: "Plugin list" },
                            { category: "Query", name: "%mc.query%", description: "Whether Query protocol was used" },
                        ]}
                        guildId={$currentGuild?.id}
                        user={data.user}
                        placeholder="Click to configure watch embed (leave empty for default)"
                        onchange={(newValue) => { addForm.customEmbedTemplate = typeof newValue === 'string' ? newValue : JSON.stringify(newValue); }}
                    />
                </div>

                <button
                  class="mt-6 flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[52px] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  onclick={addServer}
                  disabled={saving}
                >
                    <i class="fa-solid fa-plus {saving ? 'fa-spin' : ''}" style="font-size: 18px;"></i>
                    {saving ? "Adding..." : "Add Server"}
                </button>
            </div>
        </div>
    {/if}
</DashboardPageLayout>
