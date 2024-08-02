  <script lang="ts">
    import "../app.css";
    import Navbar from "$lib/nav/Navbar.svelte";
    import {onDestroy, onMount} from "svelte";
    import type { DiscordGuild } from "../lib/types/discordGuild";
    import { userAdminGuilds } from "../lib/stores/adminGuildsStore";
    import { navigating } from '$app/stores';
    import {api} from "$lib/api.ts";

    export let data;
    let unsubscribe: boolean;


      onMount(() => {
        unsubscribe = data?.user && userAdminGuilds.subscribe(async () => {
          try {
            const response = await fetch("/api/guilds");
            const guilds: DiscordGuild[] = await response.json();

            // Filter out guilds whe  re the user is not an admin
            const filteredGuilds: DiscordGuild[] = guilds.filter(guild => (guild.permissions & 0x8) === 0x8);
            const botGuilds = await api.getBotGuilds();

            userAdminGuilds.set(filteredGuilds.filter(guild => botGuilds.includes(guild.id)));
          } catch (e) {
            console.error(e);
          }
        });
      })



    onDestroy(() => {
      unsubscribe = false;
    });


    type NavItem = {
      title: string,
      elements: {
        title?: string,
        href: string
      }[]
    }
    const navbarItems: NavItem[] = [
      { title: "Home", elements: [{ href: "/" }] },
      { title: "Dashboard", elements: [{ href: "/dashboard" }] },
      { title: "Commands", elements: [{ href: "/commands" }] },
      {
        title: "About",
        elements: [
          { href: "/partners", title: "Partners" },
          { href: "/contacts", title: "Contact Us" },
          { href: "/staff", title: "Staff" }
        ]
      },
      {
        title: "Misc",
        elements: [
          { href: "/placeholders", title: "Placeholders" },
          {href: "/credguide", title: "Credentials Guide"}
        ]
      },
      { title: "Privacy", elements: [{ href: "/privacy" }] },
      { title: "Terms", elements: [{ href: "/terms" }] }
    ];

  </script>

  <svelte:head>
    <meta content="#938018" name="theme-color">
    <meta content="website" property="og:type">
    <meta content="Mewdeko - The most customizable discord bot." name="twitter:title">
    <meta content="summary_large_image" name="twitter:card">
    <meta content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.jpg" name="twitter:image">
    <meta name="keywords"
          content="Mewdeko, Mewdeko Bot, Mewdeko Discord Bot, Mewdeko Discord, Mewdeko D, free discord bot, free bot, anime themed discord bot, mewdeko.tech, mewdeko website, mewdeko dashboard, mewdeko commands, mewdeko donate, mewdeko paypal, mewdeko discord, mewdeko help" />
    <meta content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.jpg" property="og:image">
    <link href="img/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" type="image/png">
    <link href="img/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png">
    <link href="img/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png">
    <link href="img/apple-touch-icon.png" rel="icon" sizes="180x180" type="image/png">
    <link href="img/android-chrome-192x192.png" rel="icon" sizes="192x192" type="image/png">
  </svelte:head>

  <Navbar user="{data.user}" items="{navbarItems}" adminGuilds="{userAdminGuilds}" />
  {#if $navigating} 
    <div class="loading">Loading...</div>
  {/if}
  <main>
    <slot />
  </main>
