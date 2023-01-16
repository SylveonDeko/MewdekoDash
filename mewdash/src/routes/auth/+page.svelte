<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<svelte:head>
  <title>Home - Mewdeko</title>
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

<div class="bg-mewd-light-grey h-screen">
    <h1 class="text-center"><br><br>Auth Code Receiver</h1>
    {#if data.code}
        <h3 class="text-center text-mewd-white text-2xl">Your Discord Auth Code is&nbsp;<code
          style="color: rgb(147,128,24);">{data.code}</code>.
            Run the command&nbsp;<code style="color: rgb(147,128,24);">.auth</code>&nbsp;in any server to finish
            authorizing.</h3>
    {:else}
        <h3 class="text-center text-mewd-white text-2xl">You have discovered a cool feature! Run <code style="color: rgb(147,128,24);">.dragon</code> to get some beta commands!</h3>
    {/if}
  <h4 class="fw-bold text-center"><br><br><br>Do NOT, and I repeat, do NOT, give this code to anyone else. As
    depending on how the bot is setup, it can be used to impersonate you.</h4>
</div>