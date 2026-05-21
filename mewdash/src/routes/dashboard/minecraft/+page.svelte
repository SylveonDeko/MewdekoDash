<!-- routes/dashboard/minecraft/+page.svelte -->
<script lang="ts">
    import { onDestroy, tick } from "svelte";
    import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, TimeScale, Filler, Tooltip, Legend } from "chart.js";

    Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);
    import { fade, fly } from "svelte/transition";
    import { colorStore } from "$lib/stores/colorStore";
    import { currentInstance } from "$lib/stores/instanceStore";
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
    let selectedServer: MinecraftServer | null = $state(null);
    let whitelistPlayers: string[] = $state([]);
    let whitelistLoading = $state(false);
    let whitelistAddName = $state("");
    let pluginKey: string | null = $state(null);
    let showPluginKey = $state(false);
    let pluginWsUrl = $derived.by(() => {
        if (!$currentInstance?.port) return "ws://localhost:5001/botapi/mc-bridge/ws";
        const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
        return `ws://${host}:${$currentInstance.port}/botapi/mc-bridge/ws`;
    });
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
        chatChannelId: null as string | null,
        joinLeaveChannelId: null as string | null,
        deathChannelId: null as string | null,
        advancementChannelId: null as string | null,
        eventTemplates: {
            joinDiscord: "",
            leaveDiscord: "",
            chatDiscord: "",
            chatIngame: "",
            deathDiscord: "",
            advancementDiscord: "",
        } as Record<string, string>,
        customOnlineMessage: "",
        customOfflineMessage: "",
        rconEnabled: false,
        rconPort: 25575,
        rconPassword: "",
    });

    const serverTypeOptions = [
        { id: "0", name: "Java Edition", icon: "fa-coffee" },
        { id: "1", name: "Bedrock Edition", icon: "fa-mobile-screen" },
        { id: "2", name: "Geyser (Java + Bedrock)", icon: "fa-shuffle" },
    ];

    const mcPlaceholders = [
        { category: "Server", name: "%mc.server.name%", description: "Server label" },
        { category: "Server", name: "%mc.server.address%", description: "Server address" },
        { category: "Server", name: "%mc.server.port%", description: "Server port" },
        { category: "Server", name: "%mc.online%", description: "Online/Offline" },
        { category: "Server", name: "%mc.version%", description: "Server version" },
        { category: "Server", name: "%mc.latency%", description: "Ping latency" },
        { category: "Server", name: "%mc.motd%", description: "Message of the Day" },
        { category: "Server", name: "%mc.favicon%", description: "Server icon URL" },
        { category: "Server", name: "%mc.geyser%", description: "Whether Geyser is enabled" },
        { category: "Players", name: "%mc.players.online%", description: "Online player count" },
        { category: "Players", name: "%mc.players.max%", description: "Max player count" },
        { category: "Players", name: "%mc.player.list%", description: "List of online players" },
        { category: "Query", name: "%mc.map%", description: "Current map name" },
        { category: "Query", name: "%mc.gamemode%", description: "Game mode" },
        { category: "Query", name: "%mc.software%", description: "Server software" },
        { category: "Query", name: "%mc.plugins%", description: "Plugin list" },
        { category: "Query", name: "%mc.query%", description: "Whether Query protocol was used" },
    ];

    const watchModeOptions = [
        { id: "0", name: "Embed (edit in place)", icon: "fa-message" },
        { id: "1", name: "Channel Topic", icon: "fa-heading" },
        { id: "2", name: "Both", icon: "fa-layer-group" },
    ];

    let selectedHistoryServer: string | null = $state(null);
    let historyHours = $state(24);
    let snapshots: MinecraftSnapshot[] = $state<MinecraftSnapshot[]>([]);
    let playersCanvas: HTMLCanvasElement | undefined = $state();
    let latencyCanvas: HTMLCanvasElement | undefined = $state();
    let playersChart: Chart | null = null;
    let latencyChart: Chart | null = null;

    let rconServer: string | null = $state(null);
    let rconCommand = $state("");
    let rconHistory: Array<{ command: string; response: string; rawResponse: string | null; success: boolean; time: Date }> = $state([]);
    let rconSending = $state(false);

    let tabs = $derived.by(() => {
        const base = [{ id: "servers", label: "Servers", icon: "fa-server" }];
        if (selectedServer) {
            base.push({ id: "manage", label: selectedServer.name, icon: "fa-sliders" });
        }
        base.push(
            { id: "history", label: "History", icon: "fa-chart-simple" },
            { id: "console", label: "Console", icon: "fa-terminal" },
            { id: "add", label: "Add Server", icon: "fa-plus" },
        );
        return base;
    });

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
            updated.set(name, { isOnline: false, motd: "", playersOnline: 0, playersMax: 0, playerList: [], playerUuids: {}, version: "", latency: 0, map: null, gameMode: null, software: null, plugins: [], isQueryResponse: false });
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
            chatChannelId: server.chatChannelId?.toString() || null,
            joinLeaveChannelId: server.joinLeaveChannelId?.toString() || null,
            deathChannelId: server.deathChannelId?.toString() || null,
            advancementChannelId: server.advancementChannelId?.toString() || null,
            eventTemplates: (() => {
                try { return server.eventTemplates ? JSON.parse(server.eventTemplates) : {}; }
                catch { return {}; }
            })(),
            customOnlineMessage: server.customOnlineMessage || "",
            customOfflineMessage: server.customOfflineMessage || "",
            rconEnabled: server.rconEnabled,
            rconPort: server.rconPort || 25575,
            rconPassword: "",
        };
    }

    function cancelEditing() {
        editingServer = null;
    }

    async function saveEditing(server: MinecraftServer) {
        if (!$currentGuild?.id) return;
        saving = true;
        try {
            const updateReq: any = {};
            if (editForm.address !== server.address) updateReq.address = editForm.address;
            if (editForm.port !== server.port) updateReq.port = editForm.port;
            if (editForm.serverType !== server.serverType) updateReq.serverType = editForm.serverType;
            if (editForm.queryPort !== server.queryPort) updateReq.queryPort = editForm.queryPort;

            const chatCh = editForm.chatChannelId ? BigInt(editForm.chatChannelId) : BigInt(0);
            const joinLeaveCh = editForm.joinLeaveChannelId ? BigInt(editForm.joinLeaveChannelId) : BigInt(0);
            const deathCh = editForm.deathChannelId ? BigInt(editForm.deathChannelId) : BigInt(0);
            const advCh = editForm.advancementChannelId ? BigInt(editForm.advancementChannelId) : BigInt(0);
            if (chatCh.toString() !== (server.chatChannelId?.toString() || "0")) updateReq.chatChannelId = chatCh;
            if (joinLeaveCh.toString() !== (server.joinLeaveChannelId?.toString() || "0")) updateReq.joinLeaveChannelId = joinLeaveCh;
            if (deathCh.toString() !== (server.deathChannelId?.toString() || "0")) updateReq.deathChannelId = deathCh;
            if (advCh.toString() !== (server.advancementChannelId?.toString() || "0")) updateReq.advancementChannelId = advCh;

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

            const newOnlineMsg = editForm.customOnlineMessage.trim() || null;
            if (newOnlineMsg !== server.customOnlineMessage) {
                await minecraftApi.setOnlineMessage($currentGuild.id, server.name, newOnlineMsg);
            }

            const newOfflineMsg = editForm.customOfflineMessage.trim() || null;
            if (newOfflineMsg !== server.customOfflineMessage) {
                await minecraftApi.setOfflineMessage($currentGuild.id, server.name, newOfflineMsg);
            }

            const hasTemplateValues = Object.values(editForm.eventTemplates).some(v => v && v.trim());
            const newTemplatesJson = hasTemplateValues ? JSON.stringify(editForm.eventTemplates) : null;
            if (newTemplatesJson !== server.eventTemplates) {
                await minecraftApi.setEventTemplates($currentGuild.id, server.name, newTemplatesJson);
            }

            if (editForm.rconEnabled !== server.rconEnabled || editForm.rconPort !== (server.rconPort || 25575) || editForm.rconPassword) {
                await minecraftApi.setRconConfig($currentGuild.id, server.name, {
                    enabled: editForm.rconEnabled,
                    port: editForm.rconPort,
                    password: editForm.rconPassword || undefined,
                });
            }

            showMessage(`Server "${server.name}" updated!`, "success");
            editingServer = null;
            await loadAllData();
            if (selectedServer?.name === server.name) {
                const updated = await minecraftApi.getServer($currentGuild.id, server.name);
                if (updated) selectedServer = updated;
            }
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
            createCharts();
        } catch (err) {
            logger.error("Failed to load history:", err);
            showMessage("Failed to load history", "error");
        }
    }

    function createCharts() {
        if (!snapshots || snapshots.length < 2) return;

        const labels = snapshots.map(s => {
            const date = new Date(s.timestamp);
            return historyHours <= 48
                ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : date.toLocaleDateString([], { month: "short", day: "numeric" });
        });

        const primary = $colorStore.primary;
        const muted = $colorStore.muted;

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#1a1a2e",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    borderColor: primary + "40",
                    borderWidth: 1,
                }
            },
            scales: {
                x: {
                    ticks: { color: muted, maxRotation: 45, autoSkip: true, maxTicksLimit: 10, font: { size: 11 } },
                    grid: { color: primary + "10" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: muted, precision: 0, font: { size: 11 } },
                    grid: { color: primary + "10" }
                }
            }
        };

        playersChart?.destroy();
        if (playersCanvas) {
            playersChart = new Chart(playersCanvas, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        data: snapshots.map(s => s.playersOnline),
                        borderColor: primary,
                        backgroundColor: primary + "20",
                        fill: true,
                        tension: 0.4,
                        pointRadius: snapshots.length > 50 ? 0 : 3,
                        pointBackgroundColor: primary,
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        tooltip: {
                            ...commonOptions.plugins.tooltip,
                            callbacks: { label: (item: any) => `Players: ${item.raw}` }
                        }
                    }
                }
            });
        }

        latencyChart?.destroy();
        if (latencyCanvas) {
            latencyChart = new Chart(latencyCanvas, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        data: snapshots.map(s => s.latency),
                        borderColor: "#f59e0b",
                        backgroundColor: "#f59e0b20",
                        fill: true,
                        tension: 0.4,
                        pointRadius: snapshots.length > 50 ? 0 : 3,
                        pointBackgroundColor: "#f59e0b",
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        tooltip: {
                            ...commonOptions.plugins.tooltip,
                            callbacks: { label: (item: any) => `Latency: ${item.raw}ms` }
                        }
                    }
                }
            });
        }
    }

    async function openServerDetail(server: MinecraftServer) {
        selectedServer = server;
        pluginKey = null;
        showPluginKey = false;
        editForm = {
            address: server.address,
            port: server.port,
            serverType: server.serverType,
            queryPort: server.queryPort,
            watchChannelId: server.watchChannelId?.toString() || null,
            watchInterval: server.watchInterval,
            watchMode: server.watchMode,
            customEmbedTemplate: server.customEmbedTemplate || "",
            chatChannelId: server.chatChannelId?.toString() || null,
            joinLeaveChannelId: server.joinLeaveChannelId?.toString() || null,
            deathChannelId: server.deathChannelId?.toString() || null,
            advancementChannelId: server.advancementChannelId?.toString() || null,
            eventTemplates: (() => {
                try { return server.eventTemplates ? JSON.parse(server.eventTemplates) : {}; }
                catch { return {}; }
            })(),
            customOnlineMessage: server.customOnlineMessage || "",
            customOfflineMessage: server.customOfflineMessage || "",
            rconEnabled: server.rconEnabled,
            rconPort: server.rconPort || 25575,
            rconPassword: "",
        };
        activeTab = "manage";
        if (!serverStatuses.has(server.name)) {
            await queryServerStatus(server.name);
        }
        if (server.rconEnabled) {
            await loadWhitelist(server.name);
        }
    }

    async function loadWhitelist(serverName: string) {
        if (!$currentGuild?.id) return;
        whitelistLoading = true;
        whitelistPlayers = [];
        try {
            const result = await minecraftApi.sendRconCommand($currentGuild.id, serverName, "whitelist list");
            if (result.success && result.response) {
                const match = result.response.match(/:\s*(.*)/);
                if (match && match[1]) {
                    whitelistPlayers = match[1].split(",").map(p => p.trim()).filter(p => p.length > 0);
                }
            }
        } catch {
            // whitelist not available
        } finally {
            whitelistLoading = false;
        }
    }

    async function generatePluginKey() {
        if (!$currentGuild?.id || !selectedServer) return;
        if (selectedServer.hasPluginKey && !confirm("This will replace the existing key. The old key will stop working. Continue?")) return;
        try {
            const result = await minecraftApi.generatePluginKey($currentGuild.id, selectedServer.name);
            pluginKey = result.key;
            showPluginKey = true;
            selectedServer.hasPluginKey = true;
            showMessage("Plugin API key generated. Copy it now, it won't be shown again.", "success");
        } catch {
            showMessage("Failed to generate key", "error");
        }
    }

    async function revokePluginKey() {
        if (!$currentGuild?.id || !selectedServer) return;
        if (!confirm("This will revoke the plugin API key. The companion plugin will disconnect. Continue?")) return;
        try {
            await minecraftApi.revokePluginKey($currentGuild.id, selectedServer.name);
            pluginKey = null;
            showPluginKey = false;
            selectedServer.hasPluginKey = false;
            showMessage("Plugin API key revoked", "success");
        } catch {
            showMessage("Failed to revoke key", "error");
        }
    }

    async function whitelistAdd() {
        if (!$currentGuild?.id || !selectedServer || !whitelistAddName.trim()) return;
        whitelistLoading = true;
        try {
            await minecraftApi.sendRconCommand($currentGuild.id, selectedServer.name, `whitelist add ${whitelistAddName.trim()}`);
            whitelistAddName = "";
            await loadWhitelist(selectedServer.name);
            showMessage("Player added to whitelist", "success");
        } catch {
            showMessage("Failed to add player", "error");
        } finally {
            whitelistLoading = false;
        }
    }

    async function whitelistRemove(player: string) {
        if (!$currentGuild?.id || !selectedServer) return;
        whitelistLoading = true;
        try {
            await minecraftApi.sendRconCommand($currentGuild.id, selectedServer.name, `whitelist remove ${player}`);
            await loadWhitelist(selectedServer.name);
            showMessage(`${player} removed from whitelist`, "success");
        } catch {
            showMessage("Failed to remove player", "error");
        } finally {
            whitelistLoading = false;
        }
    }

    const mcColors: Record<string, string> = {
        "0": "#000000", "1": "#0000AA", "2": "#00AA00", "3": "#00AAAA",
        "4": "#AA0000", "5": "#AA00AA", "6": "#FFAA00", "7": "#AAAAAA",
        "8": "#555555", "9": "#5555FF", "a": "#55FF55", "b": "#55FFFF",
        "c": "#FF5555", "d": "#FF55FF", "e": "#FFFF55", "f": "#FFFFFF",
    };

    function mcToHtml(raw: string): string {
        let result = "";
        let currentColor = "#AAAAAA";
        let bold = false;
        let italic = false;
        let underline = false;
        let strikethrough = false;

        const chars = [...raw];
        let i = 0;
        while (i < chars.length) {
            if (chars[i] === "§" && i + 1 < chars.length) {
                const code = chars[i + 1].toLowerCase();
                if (code === "x" && i + 13 < chars.length) {
                    let hex = "#";
                    for (let j = 0; j < 6; j++) {
                        const ci = i + 2 + j * 2 + 1;
                        if (ci < chars.length) hex += chars[ci];
                    }
                    if (hex.length === 7) currentColor = hex;
                    i += 14;
                    continue;
                }
                if (mcColors[code]) { currentColor = mcColors[code]; i += 2; continue; }
                if (code === "l") { bold = true; i += 2; continue; }
                if (code === "o") { italic = true; i += 2; continue; }
                if (code === "n") { underline = true; i += 2; continue; }
                if (code === "m") { strikethrough = true; i += 2; continue; }
                if (code === "r") { currentColor = "#AAAAAA"; bold = false; italic = false; underline = false; strikethrough = false; i += 2; continue; }
                if (code === "k") { i += 2; continue; }
                i += 2;
                continue;
            }

            let styles = `color:${currentColor};`;
            if (bold) styles += "font-weight:bold;";
            if (italic) styles += "font-style:italic;";
            if (underline) styles += "text-decoration:underline;";
            if (strikethrough) styles += "text-decoration:line-through;";

            const ch = chars[i] === "<" ? "&lt;" : chars[i] === ">" ? "&gt;" : chars[i] === "&" ? "&amp;" : chars[i];
            result += `<span style="${styles}">${ch}</span>`;
            i++;
        }
        return result;
    }

    async function sendRconCommand() {
        if (!$currentGuild?.id || !rconServer || !rconCommand.trim()) return;

        const rconServerEntry = servers.find(s => s.name === rconServer);
        if (!rconServerEntry?.rconEnabled) {
            showMessage("RCON is not enabled for this server. Configure it in the edit panel.", "error");
            return;
        }

        rconSending = true;
        const cmd = rconCommand.trim();
        rconCommand = "";
        try {
            const result = await minecraftApi.sendRconCommand($currentGuild.id, rconServer, cmd);
            rconHistory = [...rconHistory, { command: cmd, response: result.response, rawResponse: result.rawResponse, success: result.success, time: new Date() }];
        } catch (err) {
            logger.error("RCON failed:", err);
            rconHistory = [...rconHistory, { command: cmd, response: "Failed to send command", rawResponse: null, success: false, time: new Date() }];
        } finally {
            rconSending = false;
        }
    }

    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => { message = ""; }, 5000);
    }

    function getAvatarUrl(player: string, size: number = 32): string {
        return `https://minotar.net/avatar/${player}/${size}`;
    }

    function getServerTypeLabel(type: number): string {
        if (type === 1) return "Bedrock";
        if (type === 2) return "Geyser";
        return "Java";
    }

    function getChannelName(channelId: bigint | null): string {
        if (!channelId) return "None";
        const ch = guildChannels.find(c => c.id === channelId.toString());
        return ch ? `#${ch.name}` : "Unknown";
    }

    onDestroy(() => {
        playersChart?.destroy();
        latencyChart?.destroy();
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

    $effect(() => {
        if (activeTab === "history" && selectedHistoryServer && snapshots && snapshots.length > 1) {
            tick().then(() => createCharts());
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
                                    <label for="f-+page-address-803" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Address</label>
                                    <input id="f-+page-address-803" type="text" bind:value={editForm.address}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                </div>
                                <div>
                                    <label for="f-+page-port-809" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Port</label>
                                    <input id="f-+page-port-809" type="number" bind:value={editForm.port}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                </div>
                                <div>
                                    <label for="f-+page-type-815" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Type</label>
                                    <DiscordSelector id="f-+page-type-815"
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
                                    <label for="f-+page-query-port-0-game-port-827" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Query Port (0 = game port)</label>
                                    <input id="f-+page-query-port-0-game-port-827" type="number" bind:value={editForm.queryPort}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                </div>
                                <div>
                                    <label for="mc-edit-watch-channel" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Channel</label>
                                    <div class="min-h-[44px]">
                                        <DiscordSelector
                                          id="mc-edit-watch-channel"
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
                                    <label for="f-+page-watch-interval-minutes-847" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Interval (minutes)</label>
                                    <input id="f-+page-watch-interval-minutes-847" type="number" min="1" max="60" bind:value={editForm.watchInterval}
                                           class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                </div>
                                <div>
                                    <label for="f-+page-watch-mode-853" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Mode</label>
                                    <DiscordSelector id="f-+page-watch-mode-853"
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
                                <label for="f-+page-custom-watch-embed-867" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Custom Watch Embed</label>
                                <FullscreenEmbedBuilder id="f-+page-custom-watch-embed-867"
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

                            <div>
                                <label for="f-+page-server-online-alert-902" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Server Online Alert</label>
                                <FullscreenEmbedBuilder id="f-+page-server-online-alert-902"
                                    value={editForm.customOnlineMessage}
                                    previewTitle="Online Alert"
                                    previewDescription="Sent when the server comes back online"
                                    icon="fa-circle-check"
                                    allowContent={true}
                                    allowMultipleEmbeds={false}
                                    allowComponents={true}
                                    additionalPlaceholders={mcPlaceholders}
                                    guildId={$currentGuild?.id}
                                    user={data.user}
                                    placeholder="Click to configure online alert (leave empty for default)"
                                    onchange={(newValue) => { editForm.customOnlineMessage = typeof newValue === 'string' ? newValue : JSON.stringify(newValue); }}
                                />
                            </div>

                            <div>
                                <label for="f-+page-server-offline-alert-920" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Server Offline Alert</label>
                                <FullscreenEmbedBuilder id="f-+page-server-offline-alert-920"
                                    value={editForm.customOfflineMessage}
                                    previewTitle="Offline Alert"
                                    previewDescription="Sent when the server goes offline"
                                    icon="fa-circle-xmark"
                                    allowContent={true}
                                    allowMultipleEmbeds={false}
                                    allowComponents={true}
                                    additionalPlaceholders={mcPlaceholders}
                                    guildId={$currentGuild?.id}
                                    user={data.user}
                                    placeholder="Click to configure offline alert (leave empty for default)"
                                    onchange={(newValue) => { editForm.customOfflineMessage = typeof newValue === 'string' ? newValue : JSON.stringify(newValue); }}
                                />
                            </div>

                            <div class="rounded-xl border p-4 mt-2" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}05;">
                                <div class="flex items-center gap-2 mb-3">
                                    <i class="fa-solid fa-terminal" style="color: {$colorStore.primary}; font-size: 14px;"></i>
                                    <span class="text-sm font-medium" style="color: {$colorStore.text}">RCON Settings</span>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div class="flex items-center gap-3">
                                        <label for="f-+page-enabled-944" class="text-sm" style="color: {$colorStore.text}">Enabled</label>
                                        <button id="f-+page-enabled-944"
                                          class="w-10 h-6 rounded-full transition-all relative"
                                          style="background: {editForm.rconEnabled ? $colorStore.primary : $colorStore.primary + '30'};"
                                          aria-label="Toggle RCON"
                                          aria-pressed={editForm.rconEnabled}
                                          onclick={() => { editForm.rconEnabled = !editForm.rconEnabled; }}
                                        >
                                            <div class="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                                                 style="left: {editForm.rconEnabled ? '22px' : '4px'};"></div>
                                        </button>
                                    </div>
                                    <div>
                                        <label for="f-+page-rcon-port-957" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">RCON Port</label>
                                        <input id="f-+page-rcon-port-957" type="number" bind:value={editForm.rconPort}
                                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                    </div>
                                    <div>
                                        <label for="f-+page-rcon-password-963" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">RCON Password</label>
                                        <input id="f-+page-rcon-password-963" type="password" bind:value={editForm.rconPassword}
                                               placeholder={server.hasRconPassword ? "••••••• (unchanged)" : "Enter password"}
                                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                                    </div>
                                </div>
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
                        <div class="space-y-4">
                            <!-- Server Header -->
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                     style="background: {$colorStore.primary}20;">
                                    <i class="fa-utility-duo fa-regular fa-server"
                                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 22px;"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <h3 class="text-lg font-bold" style="color: {$colorStore.text}">{server.name}</h3>
                                        {#if server.isDefault}
                                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};">Default</span>
                                        {/if}
                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                              style="background: {$colorStore.primary}10; color: {$colorStore.muted};">{getServerTypeLabel(server.serverType)}</span>
                                        {#if serverStatuses.has(server.name)}
                                            {@const status = serverStatuses.get(server.name)!}
                                            {#if status.isOnline}
                                                <span class="px-2 py-0.5 rounded-full text-xs font-medium" style="background: #10b98120; color: #10b981; border: 1px solid #10b98130;">
                                                    {status.playersOnline}/{status.playersMax} online
                                                </span>
                                            {:else}
                                                <span class="px-2 py-0.5 rounded-full text-xs font-medium" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;">
                                                    Offline
                                                </span>
                                            {/if}
                                        {/if}
                                    </div>
                                    <p class="text-sm" style="color: {$colorStore.muted}">
                                        {server.address}:{server.port}
                                        {#if server.watchChannelId}
                                            &middot; Watching in {getChannelName(server.watchChannelId)} every {server.watchInterval}m
                                        {/if}
                                        {#if server.rconEnabled}
                                            &middot; RCON enabled
                                        {/if}
                                    </p>
                                </div>
                            </div>

                            <!-- Status Details -->
                            {#if serverStatuses.has(server.name)}
                                {@const status = serverStatuses.get(server.name)!}
                                {#if status.isOnline}
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <div class="p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
                                            <div class="text-xs" style="color: {$colorStore.muted}">Version</div>
                                            <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">{status.version}</div>
                                        </div>
                                        <div class="p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
                                            <div class="text-xs" style="color: {$colorStore.muted}">Latency</div>
                                            <div class="text-sm font-medium" style="color: {$colorStore.text}">{status.latency}ms</div>
                                        </div>
                                        {#if status.software}
                                            <div class="p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
                                                <div class="text-xs" style="color: {$colorStore.muted}">Software</div>
                                                <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">{status.software}</div>
                                            </div>
                                        {/if}
                                        {#if status.motd}
                                            <div class="p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
                                                <div class="text-xs" style="color: {$colorStore.muted}">MOTD</div>
                                                <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">{status.motd}</div>
                                            </div>
                                        {/if}
                                    </div>

                                    {#if status.playerList.length > 0}
                                        <div class="flex flex-wrap gap-1.5">
                                            {#each status.playerList.slice(0, 10) as player}
                                                <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
                                                     style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}10;">
                                                    <img src={getAvatarUrl(player, 24)}
                                                         alt={player} class="w-5 h-5 rounded"
                                                         onerror={(e) => { (e.target as HTMLImageElement).src = `https://minotar.net/avatar/MHF_Steve/24`; }} />
                                                    <span style="color: {$colorStore.text}">{player}</span>
                                                </div>
                                            {/each}
                                            {#if status.playerList.length > 10}
                                                <span class="px-2 py-1 text-xs" style="color: {$colorStore.muted}">+{status.playerList.length - 10} more</span>
                                            {/if}
                                        </div>
                                    {/if}
                                {/if}
                            {/if}

                            <!-- Manage Button -->
                            <button class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.01]"
                                    style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}25;"
                                    onclick={() => openServerDetail(server)}>
                                <i class="fa-solid fa-sliders" style="font-size: 14px;"></i>
                                Manage Server
                            </button>
                        </div>
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

    {:else if activeTab === 'manage' && selectedServer}
        {@const status = serverStatuses.get(selectedServer.name)}
        <div class="w-full space-y-4" in:fade={{ duration: 200 }}>
            <!-- Header -->
            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <button class="p-2 rounded-lg transition-all hover:scale-110 shrink-0"
                            style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                            aria-label="Back to servers list"
                            onclick={() => { activeTab = 'servers'; }}>
                        <i class="fa-solid fa-arrow-left" style="font-size: 14px;"></i>
                    </button>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{selectedServer.name}</h2>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                  style="background: {$colorStore.primary}10; color: {$colorStore.muted};">{getServerTypeLabel(selectedServer.serverType)}</span>
                        </div>
                        <p class="text-sm truncate" style="color: {$colorStore.muted}">{selectedServer.address}:{selectedServer.port}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:inline-flex md:items-center gap-2 md:flex-wrap w-full md:w-auto">
                    <button class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02] text-sm {selectedServer.isDefault ? 'col-span-2 md:col-span-1' : ''}"
                            style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                            onclick={() => queryServerStatus(selectedServer!.name)}>
                        <i class="fa-solid fa-satellite-dish" style="font-size: 13px;"></i> Refresh
                    </button>
                    {#if !selectedServer.isDefault}
                        <button class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02] text-sm"
                                style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                                onclick={() => setDefault(selectedServer!.name)}>
                            <i class="fa-solid fa-star" style="font-size: 13px;"></i> Default
                        </button>
                    {/if}
                    <button class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02] text-sm col-span-2 md:col-span-1"
                            style="background: #ef444410; color: #ef4444;"
                            onclick={() => { removeServer(selectedServer!.name); activeTab = 'servers'; selectedServer = null; }}>
                        <i class="fa-solid fa-trash" style="font-size: 13px;"></i> Remove
                    </button>
                </div>
            </div>

            <!-- Status Overview -->
            {#if status}
                <div class="rounded-2xl border p-6 shadow-2xl"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    {#if status.isOnline}
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
                                <div class="text-xs" style="color: {$colorStore.muted}">Status</div>
                                <div class="font-semibold" style="color: #10b981;">Online</div>
                            </div>
                            <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
                                <div class="text-xs" style="color: {$colorStore.muted}">Players</div>
                                <div class="font-semibold" style="color: {$colorStore.text}">{status.playersOnline}/{status.playersMax}</div>
                            </div>
                            <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
                                <div class="text-xs" style="color: {$colorStore.muted}">Version</div>
                                <div class="font-semibold" style="color: {$colorStore.text}">{status.version}</div>
                            </div>
                            <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
                                <div class="text-xs" style="color: {$colorStore.muted}">Latency</div>
                                <div class="font-semibold" style="color: {$colorStore.text}">{status.latency}ms</div>
                            </div>
                            {#if status.motd}
                                <div class="p-3 rounded-xl col-span-2" style="background: {$colorStore.primary}10;">
                                    <div class="text-xs" style="color: {$colorStore.muted}">MOTD</div>
                                    <div class="text-sm" style="color: {$colorStore.text}">{status.motd}</div>
                                </div>
                            {/if}
                            {#if status.software}
                                <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
                                    <div class="text-xs" style="color: {$colorStore.muted}">Software</div>
                                    <div class="text-sm" style="color: {$colorStore.text}">{status.software}</div>
                                </div>
                            {/if}
                            {#if status.map}
                                <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
                                    <div class="text-xs" style="color: {$colorStore.muted}">Map</div>
                                    <div class="text-sm" style="color: {$colorStore.text}">{status.map}</div>
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <div class="p-4 rounded-xl text-center" style="background: #ef444410;">
                            <span class="font-semibold" style="color: #ef4444;">Server is offline or unreachable</span>
                        </div>
                    {/if}
                </div>
            {/if}

            <!-- Player List with Avatars -->
            {#if status?.isOnline && status.playerList.length > 0}
                <div class="rounded-2xl border p-6 shadow-2xl"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-2 mb-4">
                        <i class="fa-solid fa-users" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                        <h3 class="font-semibold" style="color: {$colorStore.text}">Online Players ({status.playerList.length})</h3>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {#each status.playerList as player}
                            <div class="flex items-center gap-3 p-3 rounded-xl group relative"
                                 style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
                                <img src={getAvatarUrl(player, 48)}
                                     alt={player}
                                     class="w-10 h-10 rounded-lg"
                                     onerror={(e) => { (e.target as HTMLImageElement).src = `https://minotar.net/avatar/MHF_Steve/48`; }} />
                                <div class="flex-1 min-w-0">
                                    <span class="text-sm font-medium truncate block" style="color: {$colorStore.text}">{player}</span>
                                    <span class="text-xs" style="color: {$colorStore.muted}">Online</span>
                                </div>
                                {#if selectedServer?.rconEnabled}
                                    <div class="absolute right-2 top-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        {#if whitelistPlayers.includes(player)}
                                            <button class="p-1.5 rounded-lg text-xs"
                                                    style="background: #ef444420; color: #ef4444;"
                                                    onclick={() => whitelistRemove(player)}
                                                    title="Remove from whitelist">
                                                <i class="fa-solid fa-user-minus" style="font-size: 11px;"></i>
                                            </button>
                                        {:else}
                                            <button class="p-1.5 rounded-lg text-xs"
                                                    style="background: #10b98120; color: #10b981;"
                                                    onclick={() => { whitelistAddName = player; whitelistAdd(); }}
                                                    title="Add to whitelist">
                                                <i class="fa-solid fa-user-plus" style="font-size: 11px;"></i>
                                            </button>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Whitelist Management (if RCON enabled) -->
            {#if selectedServer.rconEnabled}
                <div class="rounded-2xl border p-6 shadow-2xl"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-list-check" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                            <h3 class="font-semibold" style="color: {$colorStore.text}">Whitelist</h3>
                        </div>
                        <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
                                style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                                onclick={() => loadWhitelist(selectedServer!.name)}
                                disabled={whitelistLoading}>
                            <i class="fa-solid fa-arrows-rotate {whitelistLoading ? 'fa-spin' : ''}" style="font-size: 12px;"></i>
                            Refresh
                        </button>
                    </div>

                    <!-- Add player -->
                    <div class="flex gap-2 mb-4">
                        <input type="text" bind:value={whitelistAddName}
                               placeholder="Player name..."
                               class="flex-1 p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;"
                               onkeydown={(e) => { if (e.key === 'Enter') whitelistAdd(); }} />
                        <button class="flex items-center gap-2 px-4 rounded-xl font-medium transition-all hover:scale-[1.02]"
                                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                                onclick={whitelistAdd}
                                disabled={whitelistLoading || !whitelistAddName.trim()}>
                            <i class="fa-solid fa-plus" style="font-size: 13px;"></i> Add
                        </button>
                    </div>

                    <!-- Player list -->
                    {#if whitelistPlayers.length > 0}
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {#each whitelistPlayers as player}
                                <div class="flex items-center gap-3 p-3 rounded-xl group relative"
                                     style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
                                    <img src={getAvatarUrl(player, 48)}
                                         alt={player}
                                         class="w-10 h-10 rounded-lg"
                                         onerror={(e) => { (e.target as HTMLImageElement).src = `https://minotar.net/avatar/MHF_Steve/48`; }} />
                                    <div class="flex-1 min-w-0">
                                        <span class="text-sm font-medium truncate block" style="color: {$colorStore.text}">{player}</span>
                                        <span class="text-xs" style="color: {$colorStore.muted}">Whitelisted</span>
                                    </div>
                                    <button class="absolute right-2 top-2 p-1.5 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                            style="background: #ef444420; color: #ef4444;"
                                            onclick={() => whitelistRemove(player)}
                                            title="Remove from whitelist">
                                        <i class="fa-solid fa-user-minus" style="font-size: 11px;"></i>
                                    </button>
                                </div>
                            {/each}
                        </div>
                    {:else if !whitelistLoading}
                        <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">No players on whitelist, or whitelist is disabled on the server.</p>
                    {/if}
                </div>
            {/if}

            <!-- Plugins -->
            {#if status?.isOnline && status.plugins.length > 0}
                <div class="rounded-2xl border p-6 shadow-2xl"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-2 mb-4">
                        <i class="fa-solid fa-puzzle-piece" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                        <h3 class="font-semibold" style="color: {$colorStore.text}">Plugins ({status.plugins.length})</h3>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each status.plugins as plugin}
                            <span class="px-3 py-1 rounded-lg text-sm"
                                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}15;">
                                {plugin}
                            </span>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Server Configuration -->
            <div class="rounded-2xl border p-6 shadow-2xl"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                        border-color: {$colorStore.primary}30;">
                <div class="flex items-center gap-2 mb-4">
                    <i class="fa-solid fa-gear" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                    <h3 class="font-semibold" style="color: {$colorStore.text}">Configuration</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label for="f-+page-address-1343" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Address</label>
                        <input id="f-+page-address-1343" type="text" bind:value={editForm.address}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label for="f-+page-port-1349" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Port</label>
                        <input id="f-+page-port-1349" type="number" bind:value={editForm.port}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label for="f-+page-type-1355" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Type</label>
                        <DiscordSelector id="f-+page-type-1355" type="custom" options={serverTypeOptions}
                            selected={editForm.serverType.toString()} placeholder="Select type"
                            onchange={(detail) => { editForm.serverType = detail.selected ? parseInt(detail.selected as string) : 0; }} />
                    </div>
                    <div>
                        <label for="f-+page-query-port-0-game-port-1361" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Query Port (0 = game port)</label>
                        <input id="f-+page-query-port-0-game-port-1361" type="number" bind:value={editForm.queryPort}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label for="f-+page-watch-channel-1367" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Channel</label>
                        <DiscordSelector id="f-+page-watch-channel-1367" type="channel" options={guildChannels}
                            selected={editForm.watchChannelId} placeholder="No watch channel"
                            onchange={(detail) => { editForm.watchChannelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                    </div>
                    <div>
                        <label for="f-+page-watch-interval-minutes-1373" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Interval (minutes)</label>
                        <input id="f-+page-watch-interval-minutes-1373" type="number" min="1" max="60" bind:value={editForm.watchInterval}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label for="f-+page-watch-mode-1379" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Watch Mode</label>
                        <DiscordSelector id="f-+page-watch-mode-1379" type="custom" options={watchModeOptions}
                            selected={editForm.watchMode.toString()} placeholder="Select watch mode"
                            onchange={(detail) => { editForm.watchMode = detail.selected ? parseInt(detail.selected as string) : 0; }} />
                    </div>
                </div>

                <!-- Event Channels -->
                <div class="mt-6">
                    <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.text}">Event Channels (leave empty to use Watch Channel)</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="f-+page-chat-bridge-1391" class="block text-xs font-medium mb-1" style="color: {$colorStore.muted}">Chat Bridge</label>
                            <DiscordSelector id="f-+page-chat-bridge-1391" type="channel" options={guildChannels}
                                selected={editForm.chatChannelId} placeholder="Use watch channel"
                                onchange={(detail) => { editForm.chatChannelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                        <div>
                            <label for="f-+page-join-leave-1397" class="block text-xs font-medium mb-1" style="color: {$colorStore.muted}">Join/Leave</label>
                            <DiscordSelector id="f-+page-join-leave-1397" type="channel" options={guildChannels}
                                selected={editForm.joinLeaveChannelId} placeholder="Use watch channel"
                                onchange={(detail) => { editForm.joinLeaveChannelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                        <div>
                            <label for="f-+page-deaths-1403" class="block text-xs font-medium mb-1" style="color: {$colorStore.muted}">Deaths</label>
                            <DiscordSelector id="f-+page-deaths-1403" type="channel" options={guildChannels}
                                selected={editForm.deathChannelId} placeholder="Use watch channel"
                                onchange={(detail) => { editForm.deathChannelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                        <div>
                            <label for="f-+page-advancements-1409" class="block text-xs font-medium mb-1" style="color: {$colorStore.muted}">Advancements</label>
                            <DiscordSelector id="f-+page-advancements-1409" type="channel" options={guildChannels}
                                selected={editForm.advancementChannelId} placeholder="Use watch channel"
                                onchange={(detail) => { editForm.advancementChannelId = detail.selected && typeof detail.selected === 'string' ? detail.selected : null; }} />
                        </div>
                    </div>
                </div>

                <!-- Embeds -->
                <div class="mt-6 space-y-4">
                    <div>
                        <label for="f-+page-custom-watch-embed-1420" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Custom Watch Embed</label>
                        <FullscreenEmbedBuilder id="f-+page-custom-watch-embed-1420" value={editForm.customEmbedTemplate}
                            previewTitle="Server Status Embed" previewDescription="Displayed in the watch channel" icon="fa-server"
                            allowContent={true} allowMultipleEmbeds={false} allowComponents={true}
                            additionalPlaceholders={mcPlaceholders} guildId={$currentGuild?.id} user={data.user}
                            placeholder="Click to configure watch embed (leave empty for default)"
                            onchange={(v) => { editForm.customEmbedTemplate = typeof v === 'string' ? v : JSON.stringify(v); }} />
                    </div>
                    <div>
                        <label for="f-+page-server-online-alert-1429" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Server Online Alert</label>
                        <FullscreenEmbedBuilder id="f-+page-server-online-alert-1429" value={editForm.customOnlineMessage}
                            previewTitle="Online Alert" previewDescription="Sent when the server comes back online" icon="fa-circle-check"
                            allowContent={true} allowMultipleEmbeds={false} allowComponents={true}
                            additionalPlaceholders={mcPlaceholders} guildId={$currentGuild?.id} user={data.user}
                            placeholder="Click to configure online alert (leave empty for default)"
                            onchange={(v) => { editForm.customOnlineMessage = typeof v === 'string' ? v : JSON.stringify(v); }} />
                    </div>
                    <div>
                        <label for="f-+page-server-offline-alert-1438" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Server Offline Alert</label>
                        <FullscreenEmbedBuilder id="f-+page-server-offline-alert-1438" value={editForm.customOfflineMessage}
                            previewTitle="Offline Alert" previewDescription="Sent when the server goes offline" icon="fa-circle-xmark"
                            allowContent={true} allowMultipleEmbeds={false} allowComponents={true}
                            additionalPlaceholders={mcPlaceholders} guildId={$currentGuild?.id} user={data.user}
                            placeholder="Click to configure offline alert (leave empty for default)"
                            onchange={(v) => { editForm.customOfflineMessage = typeof v === 'string' ? v : JSON.stringify(v); }} />
                    </div>
                </div>

                <!-- Event Templates -->
                <div class="mt-6 space-y-4">
                    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Bridge Event Templates</h4>
                    <p class="text-xs" style="color: {$colorStore.muted}">
                        Customize how events from the companion plugin appear in Discord and in-game. Leave empty for defaults.
                        Placeholders: %mc.player%, %mc.avatar%, %mc.uuid%, %mc.message%, %mc.death.message%, %mc.advancement%
                    </p>

                    <div>
                        <label for="f-+page-player-join-discord-1457" class="block text-xs font-medium mb-2" style="color: {$colorStore.muted}">Player Join (Discord)</label>
                        <FullscreenEmbedBuilder id="f-+page-player-join-discord-1457" value={editForm.eventTemplates.joinDiscord || ""}
                            previewTitle="Join Event" previewDescription="When a player joins" icon="fa-right-to-bracket"
                            allowContent={true} allowMultipleEmbeds={false} allowComponents={true}
                            additionalPlaceholders={mcPlaceholders} guildId={$currentGuild?.id} user={data.user}
                            placeholder="Default: green embed with player name"
                            onchange={(v) => { editForm.eventTemplates.joinDiscord = typeof v === 'string' ? v : JSON.stringify(v); }} />
                    </div>
                    <div>
                        <label for="f-+page-player-leave-discord-1466" class="block text-xs font-medium mb-2" style="color: {$colorStore.muted}">Player Leave (Discord)</label>
                        <FullscreenEmbedBuilder id="f-+page-player-leave-discord-1466" value={editForm.eventTemplates.leaveDiscord || ""}
                            previewTitle="Leave Event" previewDescription="When a player leaves" icon="fa-right-from-bracket"
                            allowContent={true} allowMultipleEmbeds={false} allowComponents={true}
                            additionalPlaceholders={mcPlaceholders} guildId={$currentGuild?.id} user={data.user}
                            placeholder="Default: red embed with player name"
                            onchange={(v) => { editForm.eventTemplates.leaveDiscord = typeof v === 'string' ? v : JSON.stringify(v); }} />
                    </div>
                    <div>
                        <label for="f-+page-chat-message-discord-1475" class="block text-xs font-medium mb-2" style="color: {$colorStore.muted}">Chat Message (Discord)</label>
                        <FullscreenEmbedBuilder id="f-+page-chat-message-discord-1475" value={editForm.eventTemplates.chatDiscord || ""}
                            previewTitle="Chat Relay" previewDescription="MC chat relayed to Discord" icon="fa-comment"
                            allowContent={true} allowMultipleEmbeds={false} allowComponents={true}
                            additionalPlaceholders={[...mcPlaceholders, { category: "Chat", name: "%mc.message%", description: "Chat message content" }]}
                            guildId={$currentGuild?.id} user={data.user}
                            placeholder="Default: **player**: message"
                            onchange={(v) => { editForm.eventTemplates.chatDiscord = typeof v === 'string' ? v : JSON.stringify(v); }} />
                    </div>
                    <div>
                        <label for="f-+page-chat-from-discord-in-game-form-1485" class="block text-xs font-medium mb-2" style="color: {$colorStore.muted}">Chat from Discord (In-game format)</label>
                        <input id="f-+page-chat-from-discord-in-game-form-1485" type="text" bind:value={editForm.eventTemplates.chatIngame}
                               placeholder="Default: [Discord] %user%: %message%  |  Use §-codes for MC colors"
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted}">Placeholders: %user%, %message%, %channel%</p>
                    </div>
                    <div>
                        <label for="f-+page-death-message-discord-1493" class="block text-xs font-medium mb-2" style="color: {$colorStore.muted}">Death Message (Discord)</label>
                        <FullscreenEmbedBuilder id="f-+page-death-message-discord-1493" value={editForm.eventTemplates.deathDiscord || ""}
                            previewTitle="Death Event" previewDescription="When a player dies" icon="fa-skull"
                            allowContent={true} allowMultipleEmbeds={false} allowComponents={true}
                            additionalPlaceholders={[...mcPlaceholders, { category: "Death", name: "%mc.death.message%", description: "Full death message" }]}
                            guildId={$currentGuild?.id} user={data.user}
                            placeholder="Default: gray embed with skull emoji"
                            onchange={(v) => { editForm.eventTemplates.deathDiscord = typeof v === 'string' ? v : JSON.stringify(v); }} />
                    </div>
                    <div>
                        <label for="f-+page-advancement-discord-1503" class="block text-xs font-medium mb-2" style="color: {$colorStore.muted}">Advancement (Discord)</label>
                        <FullscreenEmbedBuilder id="f-+page-advancement-discord-1503" value={editForm.eventTemplates.advancementDiscord || ""}
                            previewTitle="Advancement" previewDescription="When a player earns an advancement" icon="fa-trophy"
                            allowContent={true} allowMultipleEmbeds={false} allowComponents={true}
                            additionalPlaceholders={[...mcPlaceholders, { category: "Advancement", name: "%mc.advancement%", description: "Advancement title" }]}
                            guildId={$currentGuild?.id} user={data.user}
                            placeholder="Default: green embed with trophy emoji"
                            onchange={(v) => { editForm.eventTemplates.advancementDiscord = typeof v === 'string' ? v : JSON.stringify(v); }} />
                    </div>
                </div>

                <!-- RCON -->
                <div class="mt-6 rounded-xl border p-4" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}05;">
                    <div class="flex items-center gap-2 mb-3">
                        <i class="fa-solid fa-terminal" style="color: {$colorStore.primary}; font-size: 14px;"></i>
                        <span class="text-sm font-medium" style="color: {$colorStore.text}">RCON Settings</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="flex items-center gap-3">
                            <label for="f-+page-enabled-1522" class="text-sm" style="color: {$colorStore.text}">Enabled</label>
                            <button id="f-+page-enabled-1522" class="w-10 h-6 rounded-full transition-all relative"
                                    style="background: {editForm.rconEnabled ? $colorStore.primary : $colorStore.primary + '30'};"
                                    aria-label="Toggle RCON"
                                    aria-pressed={editForm.rconEnabled}
                                    onclick={() => { editForm.rconEnabled = !editForm.rconEnabled; }}>
                                <div class="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                                     style="left: {editForm.rconEnabled ? '22px' : '4px'};"></div>
                            </button>
                        </div>
                        <div>
                            <label for="f-+page-rcon-port-1533" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">RCON Port</label>
                            <input id="f-+page-rcon-port-1533" type="number" bind:value={editForm.rconPort}
                                   class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        </div>
                        <div>
                            <label for="f-+page-rcon-password-1539" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">RCON Password</label>
                            <input id="f-+page-rcon-password-1539" type="password" bind:value={editForm.rconPassword}
                                   placeholder={selectedServer.hasRconPassword ? "••••••• (unchanged)" : "Enter password"}
                                   class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        </div>
                    </div>
                </div>

                <!-- Companion Plugin -->
                <div class="mt-6 rounded-xl border p-4" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}05;">
                    <div class="flex items-center gap-2 mb-3">
                        <i class="fa-solid fa-plug" style="color: {$colorStore.primary}; font-size: 14px;"></i>
                        <span class="text-sm font-medium" style="color: {$colorStore.text}">Companion Plugin</span>
                    </div>
                    <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                        Generate an API key for the Mewdeko companion Minecraft plugin. Each server gets its own key.
                    </p>

                    {#if showPluginKey && pluginKey}
                        <div class="mb-3 p-3 rounded-lg space-y-3" style="background: #10b98110; border: 1px solid #10b98130;">
                            <p class="text-xs" style="color: #10b981;">Copy these values into your plugin's config.yml. The key will not be shown again.</p>
                            <div>
                                <span class="text-xs font-medium block mb-1" style="color: {$colorStore.muted}">api-key:</span>
                                <div class="flex items-center gap-2">
                                    <code class="flex-1 text-xs p-2 rounded" style="background: #00000040; color: {$colorStore.text}; word-break: break-all;">{pluginKey}</code>
                                    <button class="p-2 rounded-lg shrink-0"
                                            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                            aria-label="Copy API key"
                                            onclick={() => { navigator.clipboard.writeText(pluginKey!); showMessage("Key copied!", "success"); }}>
                                        <i class="fa-solid fa-copy" style="font-size: 13px;"></i>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <span class="text-xs font-medium block mb-1" style="color: {$colorStore.muted}">api-url:</span>
                                <div class="flex items-center gap-2">
                                    <code class="flex-1 text-xs p-2 rounded" style="background: #00000040; color: {$colorStore.text}; word-break: break-all;">{pluginWsUrl}</code>
                                    <button class="p-2 rounded-lg shrink-0"
                                            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                                            aria-label="Copy API URL"
                                            onclick={() => { navigator.clipboard.writeText(pluginWsUrl); showMessage("URL copied!", "success"); }}>
                                        <i class="fa-solid fa-copy" style="font-size: 13px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <div class="flex items-center gap-2 flex-wrap">
                        <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
                                style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}25;"
                                onclick={generatePluginKey}>
                            <i class="fa-solid fa-key" style="font-size: 12px;"></i>
                            {selectedServer.hasPluginKey ? "Regenerate Key" : "Generate Key"}
                        </button>
                        {#if selectedServer.hasPluginKey}
                            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
                                    style="background: #ef444415; color: #ef4444; border: 1px solid #ef444425;"
                                    onclick={revokePluginKey}>
                                <i class="fa-solid fa-ban" style="font-size: 12px;"></i>
                                Revoke Key
                            </button>
                        {/if}
                        <span class="text-xs" style="color: {$colorStore.muted}">
                            {selectedServer.hasPluginKey ? "Key active" : "No key configured"}
                        </span>
                    </div>
                </div>

                <!-- Save Button -->
                <button class="mt-6 flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                        onclick={() => saveEditing(selectedServer!)}
                        disabled={saving}>
                    <i class="fa-solid fa-floppy-disk {saving ? 'fa-spin' : ''}" style="font-size: 16px;"></i>
                    {saving ? "Saving..." : "Save Configuration"}
                </button>
            </div>
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
                        <div class="w-full h-[250px] relative">
                            <canvas bind:this={playersCanvas}></canvas>
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
                        <div class="w-full h-[250px] relative">
                            <canvas bind:this={latencyCanvas}></canvas>
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

    {:else if activeTab === 'console'}
        <div class="w-full space-y-4" in:fade={{ duration: 200 }}>
            {#if servers.filter(s => s.rconEnabled).length === 0}
                <div class="rounded-2xl border p-12 text-center"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                            border-color: {$colorStore.primary}30;">
                    <i class="fa-solid fa-terminal" style="color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
                    <p class="mt-4 text-lg font-medium" style="color: {$colorStore.text}">No servers have RCON enabled</p>
                    <p class="text-sm mt-1" style="color: {$colorStore.muted}">Edit a server and configure RCON settings to use the console</p>
                </div>
            {:else}
                <div class="flex flex-wrap items-center gap-3 mb-2">
                    {#each servers.filter(s => s.rconEnabled) as server}
                        <button
                          class="px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02]"
                          style="background: {rconServer === server.name ? $colorStore.primary + '30' : $colorStore.primary + '10'};
                                 color: {rconServer === server.name ? $colorStore.primary : $colorStore.muted};
                                 border: 1px solid {rconServer === server.name ? $colorStore.primary : $colorStore.primary + '20'};"
                          onclick={() => { rconServer = server.name; rconHistory = []; }}
                        >
                            {server.name}
                        </button>
                    {/each}
                </div>

                {#if !rconServer}
                    <div class="rounded-2xl border p-8 text-center"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                                border-color: {$colorStore.primary}30;">
                        <p style="color: {$colorStore.muted}">Select a server to open the console</p>
                    </div>
                {:else}
                    <div class="rounded-2xl border shadow-2xl overflow-hidden"
                         style="background: #0d1117; border-color: {$colorStore.primary}30;">
                        <div class="p-3 flex items-center gap-2" style="background: {$colorStore.primary}10; border-bottom: 1px solid {$colorStore.primary}20;">
                            <i class="fa-solid fa-terminal" style="color: {$colorStore.primary}; font-size: 14px;"></i>
                            <span class="text-sm font-mono font-medium" style="color: {$colorStore.text}">RCON — {rconServer}</span>
                        </div>

                        <div class="p-4 font-mono text-sm space-y-2 max-h-[400px] overflow-y-auto" style="color: #c9d1d9;">
                            {#if rconHistory.length === 0}
                                <p style="color: #484f58;">Type a command below and press Enter...</p>
                            {/if}
                            {#each rconHistory as entry}
                                <div>
                                    <div class="flex items-center gap-2">
                                        <span style="color: {$colorStore.primary};">$</span>
                                        <span style="color: #e6edf3;">{entry.command}</span>
                                        <span class="text-xs" style="color: #484f58;">{entry.time.toLocaleTimeString()}</span>
                                    </div>
                                    {#if entry.success && entry.rawResponse}
                                        <pre class="mt-1 whitespace-pre-wrap text-xs pl-4 font-mono">{@html mcToHtml(entry.rawResponse)}</pre>
                                    {:else}
                                        <pre class="mt-1 whitespace-pre-wrap text-xs pl-4" style="color: {entry.success ? '#7ee787' : '#f85149'};">{entry.response}</pre>
                                    {/if}
                                </div>
                            {/each}
                        </div>

                        <div class="p-3 flex items-center gap-2" style="border-top: 1px solid {$colorStore.primary}20;">
                            <span class="font-mono" style="color: {$colorStore.primary};">$</span>
                            <input
                              type="text"
                              bind:value={rconCommand}
                              placeholder="Enter command..."
                              class="flex-1 bg-transparent font-mono text-sm focus:outline-none"
                              style="color: #e6edf3;"
                              disabled={rconSending}
                              onkeydown={(e) => { if (e.key === 'Enter') sendRconCommand(); }}
                            />
                            <button
                              class="px-3 py-1 rounded-lg font-medium text-sm transition-all"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                              onclick={sendRconCommand}
                              disabled={rconSending || !rconCommand.trim()}
                            >
                                {rconSending ? "..." : "Send"}
                            </button>
                        </div>
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
                        <label for="f-+page-server-name-1824" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-tag" style="font-size: 14px;"></i>
                            Server Name
                        </label>
                        <input id="f-+page-server-name-1824" type="text" bind:value={addForm.name}
                               placeholder="e.g. survival, creative, smp"
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label for="f-+page-server-address-1834" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-globe" style="font-size: 14px;"></i>
                            Server Address
                        </label>
                        <input id="f-+page-server-address-1834" type="text" bind:value={addForm.address}
                               placeholder="e.g. play.example.com"
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label for="f-+page-port-1844" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-ethernet" style="font-size: 14px;"></i>
                            Port
                        </label>
                        <input id="f-+page-port-1844" type="number" bind:value={addForm.port}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label for="f-+page-server-type-1853" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-gamepad" style="font-size: 14px;"></i>
                            Server Type
                        </label>
                        <DiscordSelector id="f-+page-server-type-1853"
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
                        <label for="f-+page-query-port-0-same-as-game-port-1868" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-terminal" style="font-size: 14px;"></i>
                            Query Port (0 = same as game port)
                        </label>
                        <input id="f-+page-query-port-0-same-as-game-port-1868" type="number" bind:value={addForm.queryPort}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                        <p class="text-xs mt-1" style="color: {$colorStore.muted}">Requires enable-query=true in server.properties for extended info</p>
                    </div>
                    <div>
                        <label for="mc-add-watch-channel" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-hashtag" style="font-size: 14px;"></i>
                            Watch Channel
                        </label>
                        <div class="min-h-[44px]">
                            <DiscordSelector
                                id="mc-add-watch-channel"
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
                        <label for="f-+page-watch-interval-minutes-1895" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-clock" style="font-size: 14px;"></i>
                            Watch Interval (minutes)
                        </label>
                        <input id="f-+page-watch-interval-minutes-1895" type="number" min="1" max="60" bind:value={addForm.watchInterval}
                               class="w-full p-2.5 rounded-xl border backdrop-blur-md focus:outline-none"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}; min-height: 50px;" />
                    </div>
                    <div>
                        <label for="f-+page-watch-mode-1904" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            <i class="fa-solid fa-display" style="font-size: 14px;"></i>
                            Watch Mode
                        </label>
                        <DiscordSelector id="f-+page-watch-mode-1904"
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
                    <label for="f-+page-custom-watch-embed-optional-1921" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Custom Watch Embed (optional)</label>
                    <FullscreenEmbedBuilder id="f-+page-custom-watch-embed-optional-1921"
                        value={addForm.customEmbedTemplate}
                        previewTitle="Server Status Embed"
                        previewDescription="Displayed in the watch channel"
                        icon="fa-server"
                        allowContent={true}
                        allowMultipleEmbeds={false}
                        allowComponents={true}
                        additionalPlaceholders={mcPlaceholders}
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
