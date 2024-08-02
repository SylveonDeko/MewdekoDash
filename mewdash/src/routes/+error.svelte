<script lang="ts">
  import { page } from "$app/stores";
  import Interactable from "$lib/util/InteractableElement.svelte";
</script>

<svelte:head>
  <title>Error {$page.status} - Mewdeko</title>
  <meta name="description" content="Oops! Something went wrong. Error {$page.status}">
</svelte:head>

<div class="min-h-[calc(100vh-5.6rem)] w-full bg-mewd-light-grey flex flex-col justify-center items-center px-4 py-8">
  <h1 class="text-4xl font-bold mb-4 text-mewd-green">Error {$page.status}</h1>
  <p class="text-xl text-mewd-offwhite mb-8">Oops! Something went wrong.</p>

  <div class="max-w-3xl w-full flex justify-center">
    <Interactable cta={{text: "Return Home", href: "/", target: "_self"}}>
      <div class="flex justify-center">
        <img
                class="max-w-full h-auto rounded-lg shadow-lg"
                alt="Error {$page.status} Cat"
                title="Error Cat"
                src="https://http.cat/{$page.status}"
                loading="lazy"
        >
      </div>
    </Interactable>
  </div>

  <p class="mt-8 text-mewd-offwhite text-center">
    If the problem persists, please <a href="/contact" class="text-mewd-green hover:underline">contact us</a>.
  </p>
</div>

<style lang="scss">
  :global(.interactable-element) {
    @apply transition-transform duration-300 hover:scale-105;
  }
</style>