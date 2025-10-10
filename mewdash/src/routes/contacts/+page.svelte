<!-- routes/contacts/+page.svelte -->
<script lang="ts">
    import {colorStore} from "$lib/stores/colorStore";
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
      <i class="fa-solid fa-envelope text-5xl mb-4 text-mewd-offwhite"></i>
      <span class="text-lg font-semibold">Sylveon</span>
      <span class="text-sm text-mewd-offwhite mt-2">sylveon@mewdeko.tech</span>
    </a>

    <a href="mailto:cottage@mewdeko.tech" target="_new" class="contact-card">
      <i class="fa-solid fa-envelope text-5xl mb-4 text-mewd-offwhite"></i>
      <span class="text-lg font-semibold">GraveyardDwellingCat</span>
      <span class="text-sm text-mewd-offwhite mt-2">cottage@mewdeko.tech</span>
    </a>

    <a
      href="https://discord.gg/Z9DYApMXFN"
      target="_new"
      class="contact-card"
    >
      <i class="fa-brands fa-discord text-5xl mb-4 text-mewd-offwhite"></i>
      <span class="text-lg font-semibold">Join Our Discord</span>
      <span class="text-sm text-mewd-offwhite mt-2"
      >https://discord.gg/Z9DYApMXFN</span
      >
    </a>
  </div>
</div>

<style lang="postcss">
  @reference '../../app.css';

  .contact-card {
      @apply bg-mewd-dark-grey opacity-50 rounded-lg p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-mewd-white no-underline hover:text-mewd-green;
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
