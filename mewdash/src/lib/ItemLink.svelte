<!-- lib/ItemLink.svelte -->
<script lang="ts">
  export let link: { href: string; target: string | "_blank"; text: string };
</script>

<div class="flex flex-col items-center">
  <slot />
  <a class="text-xl pb-2" href={link.href} target={link.target}>{link.text}</a>
</div>
