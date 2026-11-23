<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { BuilderMode } from "$lib/embedbuilder/mode.svelte";
  import BuilderModeSwitch from "./BuilderModeSwitch.svelte";

  interface Props {
    mode: BuilderMode;
    onmode: (mode: BuilderMode) => void;
    ontour: () => void;
  }

  let { mode, onmode, ontour }: Props = $props();

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}30;`);
</script>

<BuilderModeSwitch {mode} onchange={onmode} />

<div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-4 rounded-xl min-h-[44px] grow sm:grow-0 text-sm font-medium"
    style={buttonStyle}
    onclick={ontour}
    data-tour="replay"
  >
    <i class="fa-solid fa-play" aria-hidden="true"></i>
    {m.embedbuilder.tourReplay()}
  </button>
  <a
    href="/wiki/embedbuilder"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center justify-center gap-2 px-4 rounded-xl min-h-[44px] grow sm:grow-0 text-sm font-medium"
    style={buttonStyle}
  >
    <i class="fa-solid fa-book" aria-hidden="true"></i>
    {m.home.tailsReadGuide()}
  </a>
</div>
