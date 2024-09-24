<script lang="ts">
    import { onMount } from 'svelte';
    import "../app.css";
    import Navbar from "$lib/nav/Navbar.svelte";
    import type { DiscordGuild } from "../lib/types/discordGuild";
    import { userAdminGuilds } from "../lib/stores/adminGuildsStore";
    import { api } from "$lib/api.ts";

    export let data;

    let guildsFetched = false;

    onMount(() => {
        fetchGuilds();
    });

    async function fetchGuilds() {
        if (guildsFetched) return; // Prevent multiple fetches
        guildsFetched = true;

        try {
            const response = await fetch("/api/guilds");
            const guilds: DiscordGuild[] = await response.json();

            // Filter guilds where the user has admin permissions
            const filteredGuilds = guilds.filter(
                guild => (guild.permissions & 0x8) === 0x8
            );

            // Get bot guilds from API
            const botGuilds = await api.getBotGuilds();

            // Set the store with guilds that the bot is in and the user administers
            userAdminGuilds.set(
                filteredGuilds.filter(guild => botGuilds.includes(guild.id))
            );
        } catch (e) {
            console.error('Error fetching guilds:', e);
        }
    }


    type NavItem = {
        title: string,
        elements: {
            title?: string,
            href: string
        }[]
    }
    const navbarItems: NavItem[] = [
        {title: "Home", elements: [{href: "/"}]},
        {title: "Dashboard", elements: [{href: "/dashboard"}]},
        {title: "Commands", elements: [{href: "/commands"}]},
        {
            title: "About",
            elements: [
                {href: "/partners", title: "Partners"},
                {href: "/contacts", title: "Contact Us"},
                {href: "/staff", title: "Staff"}
            ]
        },
        {
            title: "Misc",
            elements: [
                {href: "/placeholders", title: "Placeholders"},
                {href: "/credguide", title: "Credentials Guide"},
                {title: "Privacy", href: "/privacy"},
                {title: "Terms", href: "/terms"}
            ]
        },
        {title: "Reviews", elements: [{href: "/reviews"}]}
    ];

</script>

<svelte:head>
    <meta content="#938018" name="theme-color">
    <meta content="website" property="og:type">
    <meta content="Mewdeko - The most customizable discord bot." name="twitter:title">
    <meta content="summary_large_image" name="twitter:card">
    <meta content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.jpg" name="twitter:image">
    <meta content="Mewdeko, Mewdeko Bot, Mewdeko Discord Bot, Mewdeko Discord, Mewdeko D, free discord bot, free bot, anime themed discord bot, mewdeko.tech, mewdeko website, mewdeko dashboard, mewdeko commands, mewdeko donate, mewdeko paypal, mewdeko discord, mewdeko help"
          name="keywords"/>
    <meta content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.jpg" property="og:image">
    <link href="img/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" type="image/png">
    <link href="img/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png">
    <link href="img/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png">
    <link href="img/apple-touch-icon.png" rel="icon" sizes="180x180" type="image/png">
    <link href="img/android-chrome-192x192.png" rel="icon" sizes="192x192" type="image/png">
</svelte:head>

<Navbar adminGuilds="{userAdminGuilds}" items="{navbarItems}" user="{data.user}"/>
<main>
    <slot/>
</main>
