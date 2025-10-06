<!-- lib/carousel/ImageWrapper.svelte -->
<script lang="ts">
  interface Props {
    src: string;
    alt: string;
  }

  let { src, alt }: Props = $props();
</script>

<img {alt} class="w-full overflow-hidden rounded-xl" {src}>
