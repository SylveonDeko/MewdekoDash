<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/nav/Navbar.svelte";
  import { onMount } from "svelte";
  import type { DiscordGuild } from "../lib/types/discordGuild";

  export let data;
  export let userAdminGuilds: DiscordGuild[];

  onMount(async () => {
    if (data.user) {
      try {
        const response = await fetch("/api/guilds");
        console.log(response);
        const guilds: DiscordGuild[] = await response.json();

        // Filter out guilds where the user is not an admin
        userAdminGuilds = guilds.filter(guild => (guild.permissions & 0x8) === 0x8);
        console.log(userAdminGuilds.length);
      } catch (e) {
        console.error(e);
      }
    }
  });

  export type NavItem = {
    title: string,
    elements: {
      title?: string,
      href: string
    }[]
  }
  const navbarItems: NavItem[] = [
    { title: "Home", elements: [{ href: "/" }] },
    { title: "Commands", elements: [{ href: "/commands" }] },
    {
      title: "About",
      elements: [
        { href: "/partners", title: "Partners" },
        { href: "/contacts", title: "Contact Us" },
        { href: "/staff", title: "Staff" }
      ]
    },
    { title: "Placeholders", elements: [{ href: "/placeholders" }] },
    { title: "Resources", elements: [{ href: "/resources" }] }
  ];

</script>

<svelte:head>
  <meta content="#938018" name="theme-color">
  <meta content="website" property="og:type">
  <meta content="Mewdeko - The most customizable discord bot." name="twitter:title">
  <meta content="summary_large_image" name="twitter:card">
  <meta content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.jpg" name="twitter:image">

  <meta content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.jpg" property="og:image">
  <link href="img/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" type="image/png">
  <link href="img/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png">
  <link href="img/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png">
  <link href="img/apple-touch-icon.png" rel="icon" sizes="180x180" type="image/png">
  <link href="img/android-chrome-192x192.png" rel="icon" sizes="192x192" type="image/png">
</svelte:head>

<Navbar user="{data.user}" items="{navbarItems}" adminGuilds="{userAdminGuilds}" />
<main>
  <slot />
</main>
