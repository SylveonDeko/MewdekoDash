<script lang="ts">
    import "../app.css";
    import Navbar from "$lib/nav/Navbar.svelte";

    export type NavItem = {
        title: string,
        elements: {
            title?: string,
            href: string
        }[]
    }
    const navbarItems: NavItem[] = [
        {title: "Home", elements: [{href: "/"}]},
        {title: "Commands", elements: [{href: "/commands"}]},
        {
            title: "Persons",
            elements: [
                {href: "/partners", title: "Partners"},
                {href: "/contacts", title: "Contact Us"},
                {href: "/staff", title: "Staff"}
            ]
        },
        {title: "Resources", elements: [{href: "/resources"}]}
    ]
</script>

<svelte:head>
    <meta content="#938018" name="theme-color">
    <meta content="The only completely free bot that's both open source and completely customizable."
          name="description">
    <meta content="Invite Mewdeko! The only completely free bot that's both open source and completely customizable."
          property="og:description">
    <meta content="website" property="og:type">
    <meta content="Mewdeko - The most customizable discord bot." name="twitter:title">
    <meta content="summary_large_image" name="twitter:card">
    <meta content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.jpg" name="twitter:image">
    <meta content="Invite Mewdeko! The only completely free bot that's both open source and completely customizable."
          name="twitter:description">
    <meta content="https://mewdeko.tech/img/monogatari-series-background-hd-1600x900-108924-1.jpg" property="og:image">
    <meta content="Mewdeko - The most customizable discord bot." property="og:title">
    <link href="img/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" type="image/png">
    <link href="img/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png">
    <link href="img/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png">
    <link href="img/apple-touch-icon.png" rel="icon" sizes="180x180" type="image/png">
    <link href="img/android-chrome-192x192.png" rel="icon" sizes="192x192" type="image/png">
</svelte:head>

<Navbar items="{navbarItems}"/>
<main>
    <slot/>
</main>
