<!-- routes/contacts/+page.svelte -->
<script lang="ts">
  import MailIcon from "$lib/components/Mail.svelte";
  import DiscordIcon from "$lib/components/Discord.svelte";
</script>

<svelte:head>
  <title>Mewdeko - Ways to contact us!</title>
  <meta content="Mewdeko - Ways to contact us!" property="og:title" />
  <meta content="Ways to contact us!" name="description" />
  <meta content="Ways to contact us!" property="og:description" />
  <meta content="Ways to contact us!" name="twitter:description" />
</svelte:head>

<div
  class="min-h-[calc(100vh-5.6rem)] w-full bg-mewd-light-grey flex flex-col justify-center items-center px-4 py-12"
>
  <h2
    class="text-4xl font-bold mb-12 text-center text-mewd-green animate-fade-in"
  >
    Connect with Us
  </h2>

  <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    <a href="mailto:sylveon@mewdeko.tech" target="_new" class="contact-card">
      <MailIcon class="w-12 h-12 mb-4 text-mewd-offwhite" />
      <span class="text-lg font-semibold">Sylveon</span>
      <span class="text-sm text-mewd-offwhite mt-2">sylveon@mewdeko.tech</span>
    </a>

    <a href="mailto:cottage@mewdeko.tech" target="_new" class="contact-card">
      <MailIcon class="w-12 h-12 mb-4 text-mewd-offwhite" />
      <span class="text-lg font-semibold">GraveyardDwellingCat</span>
      <span class="text-sm text-mewd-offwhite mt-2">cottage@mewdeko.tech</span>
    </a>

    <a
      href="https://discord.gg/invite/4stkEfZ6As"
      target="_new"
      class="contact-card"
    >
      <DiscordIcon class="w-12 h-12 mb-4 text-mewd-offwhite" />
      <span class="text-lg font-semibold">Join Our Discord</span>
      <span class="text-sm text-mewd-offwhite mt-2"
        >https://discord.gg/invite/4stkEfZ6As</span
      >
    </a>
  </div>
</div>

<style lang="scss">
  .contact-card {
    @apply bg-mewd-dark-grey bg-opacity-50 rounded-lg p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 text-mewd-white no-underline hover:text-mewd-green;
  }

  .animate-fade-in {
    animation: fadeIn 1s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
