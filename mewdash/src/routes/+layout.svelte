<!-- routes/+layout.svelte -->
<script lang="ts">
  import "../app.css";
  import UnifiedNav from "$lib/nav/UnifiedNav.svelte";
  import { userAdminGuilds } from "../lib/stores/adminGuildsStore";
  import type { LayoutData } from "../../.svelte-kit/types/src/routes/$types";


  export let data: LayoutData;

  $: userAdminGuilds.set(data.guilds);

  // Main navigation items
  const navItems = [
    { title: "Home", elements: [{ href: "/" }] },
    { title: "Dashboard", elements: [{ href: "/dashboard" }] },
    { title: "Commands", elements: [{ href: "/commands" }] },
    {
      title: "About",
      elements: [
        { href: "/partners", title: "Partners" },
        { href: "/contacts", title: "Contact Us" },
        { href: "/staff", title: "Staff" },
      ],
    },
    {
      title: "Misc",
      elements: [
        { href: "/placeholders", title: "Placeholders" },
        { href: "/credguide", title: "Credentials Guide" },
        { title: "Privacy", href: "/privacy" },
        { title: "Terms", href: "/terms" },
      ],
    },
    { title: "Reviews", elements: [{ href: "/reviews" }] },
    { title: "Embed Builder", elements: [{ href: "/embedbuilder" }] },
  ];
</script>

<svelte:head>
  <meta content="#938018" name="theme-color" />
  <meta content="website" property="og:type" />
  <meta
    content="Mewdeko - The most customizable discord bot."
    name="twitter:title"
  />
  <meta content="summary_large_image" name="twitter:card" />
  <meta
    content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.webp"
    name="twitter:image"
  />
  <meta
    content="Mewdeko, Mewdeko Bot, Mewdeko Discord Bot, Mewdeko Discord, Mewdeko D, free discord bot, free bot, anime themed discord bot, mewdeko.tech, mewdeko website, mewdeko dashboard, mewdeko commands, mewdeko donate, mewdeko paypal, mewdeko discord, mewdeko help"
    name="keywords"
  />
  <meta
    content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.webp"
    property="og:image"
  />
</svelte:head>

<UnifiedNav items={navItems} data={data} />

<main class="min-h-screen bg-mewd-dark-grey">
  <slot />
</main>