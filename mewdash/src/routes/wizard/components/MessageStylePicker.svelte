<!--
@component
Message style picker for choosing between plain text, embeds, and buttons
Includes template gallery integration for quick setup
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import TemplateGallery from "$lib/components/specialized/TemplateGallery.svelte";

  interface Props {
    selected?: string;
    showTemplates?: boolean;
    onselect?: (detail: { style: string }) => void;
    ontemplate?: (detail: { template: any }) => void;
  }

  let {
    selected = $bindable("plain"),
    showTemplates = false,
    onselect,
    ontemplate
  }: Props = $props();

  const styles = [
    {
      id: "plain",
      name: "Plain Text",
      description: "Simple text message",
      icon: "fa-regular fa-message",
      example: "Welcome to the server, @NewMember! 🎉"
    },
    {
      id: "embed",
      name: "Rich Embed",
      description: "Styled embed with colors and formatting",
      icon: "fa-regular fa-rectangle-list",
      example: "Embedded message with title, description, and color"
    },
    {
      id: "embed-buttons",
      name: "Embed + Buttons",
      description: "Embed with interactive buttons",
      icon: "fa-regular fa-grid-2",
      example: "Full interactive message with buttons"
    }
  ];

  let selectedCategory = $state("all");

  function selectStyle(styleId: string) {
    selected = styleId;
    onselect?.({ style: styleId });
  }

  function handleTemplateSelect(detail: { template: any }) {
    ontemplate?.(detail);
  }
</script>

<div class="space-y-6">
  <!-- Style Selection -->
  <div>
    <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.text};">Choose Message Style</h4>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      {#each styles as style}
        <button
          class="text-left p-4 rounded-lg border-2 transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2"
          class:selected={selected === style.id}
          style="background: {selected === style.id ? $colorStore.primary + '10' : 'transparent'};
                 border-color: {selected === style.id ? $colorStore.primary : $colorStore.primary + '20'};
                 focus:ring-color: {$colorStore.primary};"
          onclick={() => selectStyle(style.id)}
        >
          <div class="flex items-start gap-3 mb-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg"
                 style="background: {selected === style.id ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                        color: {selected === style.id ? $colorStore.primary : $colorStore.muted};">
              <i class="fa-solid {style.icon}" style="font-size: 20px;"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h5 class="font-semibold text-sm mb-1" style="color: {$colorStore.text};">
                {style.name}
              </h5>
              <p class="text-xs" style="color: {$colorStore.muted};">
                {style.description}
              </p>
            </div>
          </div>

          <!-- Example Preview -->
          <div class="bg-[#36393f] rounded-sm p-2 text-white text-xs font-mono">
            {style.example}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Template Gallery (shown when embed is selected) -->
  {#if showTemplates && (selected === 'embed' || selected === 'embed-buttons')}
    <div class="border-t pt-6" style="border-color: {$colorStore.primary}20;">
      <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.text};">
        Or Start with a Template
      </h4>
      <TemplateGallery
        bind:selectedCategory={selectedCategory}
        onselect={handleTemplateSelect}
      />
    </div>
  {/if}
</div>

<style>
    .selected {
        box-shadow: 0 0 0 3px var(--ring-color, transparent);
    }
</style>
