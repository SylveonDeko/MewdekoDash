<!-- lib/components/layout/ComponentEmbed.svelte -->
<script lang="ts">
  import { embedScript, type ComponentEmbed } from "$lib/componentEmbed";

  interface Props {
    embed: ComponentEmbed | null;
  }

  let { embed }: Props = $props();

  const script = $derived(embedScript(embed));
</script>

<svelte:head>
  {#if script}
    {@html script}
  {/if}
</svelte:head>
