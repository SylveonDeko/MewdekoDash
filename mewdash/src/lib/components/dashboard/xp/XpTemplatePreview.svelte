<script lang="ts">
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { RotateCcw } from "lucide-svelte";

  export let localTemplate: any;
  export let previewScale: number;
  export let previewWidth: number;
  export let previewHeight: number;
  export let previewOffset: { x: number; y: number };
  export let previewBackgroundUrl: string | null;
  export let showGrid: boolean;
  export let gridSize: number;
  export let showGuideLines: boolean;
  export let guideLinesPos: { x: number | null; y: number | null };
  export let draggableElements: any[];
  export let isDesignMode: boolean;
  export let draggingElement: any;
  export let hoverElement: any;
  export let showRealDataPreview: boolean;
  export let currentUserData: any;
  export let sampleData: any;
  export let showTooltips: boolean;
  export let showCoordinateOverlay: boolean;
  export let undoStack: string[];
  export let startDrag: (event: MouseEvent | TouchEvent, element: any) => void;
  export let formatColor: (colorString: string) => string;
  export let calculateProgressPosition: () => { x: number; y: number };
  export let undo: () => void;
  export let resetZoom: () => void;

  export let previewContainerRef: HTMLDivElement;
  export let isFullPageMode = false;

  // Debug reactive statements
  $: console.log("XpTemplatePreview - localTemplate changed:", localTemplate);
  $: console.log("XpTemplatePreview - preview dimensions:", previewWidth, "x", previewHeight);
  $: console.log("XpTemplatePreview - draggableElements:", draggableElements);
</script>

<div
  class="relative overflow-hidden border rounded-lg bg-gray-900"
  class:min-h-[250px]={!isFullPageMode}
  class:sm:min-h-[300px]={!isFullPageMode}
  class:lg:min-h-[400px]={!isFullPageMode}
  class:max-h-[60vh]={!isFullPageMode}
  class:sm:max-h-none={!isFullPageMode}
  class:h-full={isFullPageMode}
  class:min-h-full={isFullPageMode}
  style="border-color: {$colorStore.primary}30;"
  bind:this={previewContainerRef}
>
  {#if localTemplate}
    <!-- Preview Container with proper scaling -->
    <div class="relative w-full h-full flex items-center justify-center" class:p-4={!isFullPageMode} class:p-8={isFullPageMode}>
      <!-- Template wrapper with pan offset -->
      <div 
        class="relative"
        style="transform: translate({previewOffset.x}px, {previewOffset.y}px);"
      >
        <!-- Grid background (if enabled) -->
        {#if showGrid}
          <div
            class="absolute inset-0 z-0"
            style="width: {localTemplate.outputSizeX * previewScale}px;
                   height: {localTemplate.outputSizeY * previewScale}px;
                   background-size: {gridSize * previewScale}px {gridSize * previewScale}px;
                   background-image: linear-gradient({$colorStore.primary}20 1px, transparent 1px),
                                    linear-gradient(90deg, {$colorStore.primary}20 1px, transparent 1px);
                   opacity: 0.3;"
          >
          </div>
        {/if}

        <!-- Template canvas -->
        <div
          class="relative bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"
          style="width: {localTemplate.outputSizeX * previewScale}px;
                 height: {localTemplate.outputSizeY * previewScale}px;
                 background-image: url('{previewBackgroundUrl || ''}');
                 background-size: cover;
                 background-position: center;
                 border: 1px solid {$colorStore.primary}30;"
        >
      <!-- Guidelines -->
      {#if showGuideLines && (guideLinesPos.x !== null || guideLinesPos.y !== null)}
        <svg class="absolute inset-0 w-full h-full pointer-events-none">
          {#if guideLinesPos.x !== null}
            <line
              x1={guideLinesPos.x * previewScale}
              y1="0"
              x2={guideLinesPos.x * previewScale}
              y2={localTemplate.outputSizeY * previewScale}
              stroke={$colorStore.secondary}
              stroke-width="1"
              stroke-dasharray="4,4"
            />
          {/if}

          {#if guideLinesPos.y !== null}
            <line
              x1="0"
              y1={guideLinesPos.y * previewScale}
              x2={localTemplate.outputSizeX * previewScale}
              y2={guideLinesPos.y * previewScale}
              stroke={$colorStore.secondary}
              stroke-width="1"
              stroke-dasharray="4,4"
            />
          {/if}
        </svg>
      {/if}

      {#each draggableElements as element (element.id)}
        {#if element.isVisible()}
          <!-- Draggable element representation -->
          <div
            class="absolute flex items-center justify-center border-2 transition-all duration-100"
            class:cursor-move={isDesignMode}
            class:transform-gpu={true}
            class:scale-105={draggingElement === element}
            class:outline-dashed={draggingElement === element}
            role="button"
            tabindex={isDesignMode ? 0 : -1}
            style="left: {element.getX() * previewScale}px;
             top: {element.getY() * previewScale}px;
             width: {element.getWidth() * previewScale}px;
             height: {element.getHeight() * previewScale}px;
             background: {element.color}30;
             border-color: {element.color};
             {!isDesignMode ? 'pointer-events: none;' : ''}
             {isDesignMode ? 'opacity: 0.9;' : 'opacity: 0.6;'}
             {draggingElement === element ? 'z-index: 100; outline-color: ' + $colorStore.secondary + ';' : ''}
             {hoverElement === element ? 'box-shadow: 0 0 0 3px ' + element.color + ';' : ''}"
            on:mousedown={(e) => startDrag(e, element)}
            on:touchstart={(e) => startDrag(e, element)}
            on:mouseover={() => isDesignMode && (hoverElement = element)}
            on:mouseleave={() => isDesignMode && hoverElement === element && (hoverElement = null)}
            on:focus={() => isDesignMode && (hoverElement = element)}
            on:blur={() => isDesignMode && hoverElement === element && (hoverElement = null)}
            aria-label={`${element.label} element`}
          >
            <div class="relative w-full h-full flex items-center justify-center overflow-hidden">
        <span
          class="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1"
          style="color: {$colorStore.text};"
        >
          {element.label}
        </span>

              <!-- Show real data preview if enabled -->
              {#if showRealDataPreview}
                {#if element.id === 'username'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.templateUser.textColor)};">
              {currentUserData ? currentUserData.username : sampleData.displayName || sampleData.username}
            </span>
                {:else if element.id === 'userAvatar'}
                  <div class="absolute inset-0 flex items-center justify-center opacity-30">
                    <div class="rounded-full overflow-hidden" style="width: 80%; height: 80%;">
                      <img src={currentUserData ? currentUserData.avatarUrl : sampleData.avatarUrl}
                           alt="Avatar preview" class="w-full h-full object-cover" />
                    </div>
                  </div>
                {:else if element.id === 'guildLevel'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.templateGuild.guildLevelColor)};">
              Level {currentUserData ? currentUserData.level : sampleData.level}
            </span>
                {:else if element.id === 'guildRank'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.templateGuild.guildRankColor)};">
              Rank #{currentUserData ? currentUserData.rank : sampleData.rank}
            </span>
                {:else if element.id === 'timeOnLevel'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.timeOnLevelColor)};">
              {currentUserData ? currentUserData.timeOnLevel : sampleData.timeOnLevel}
            </span>
                {:else if element.id === 'clubName'}
            <span class="absolute inset-0 flex items-center justify-center text-xs opacity-50"
                  style="color: {formatColor(localTemplate.templateClub.clubNameColor)};">
              {sampleData.clubIcon} {currentUserData?.clubName || sampleData.clubName}
            </span>
                {/if}
              {/if}

              <!-- Show tooltip if hovering -->
              {#if hoverElement === element && showTooltips && element.tooltip}
                <div
                  class="absolute -top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap z-50"
                  style="background: {$colorStore.primary}; color: {$colorStore.text};"
                >
                  {element.tooltip}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      {/each}

      <!-- Progress bar line representation -->
      {#if localTemplate.templateBar.showBar}
        <svg
          class="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
          style="opacity: 0.9;"
        >
          <line
            x1={localTemplate.templateBar.barPointAx * previewScale}
            y1={localTemplate.templateBar.barPointAy * previewScale}
            x2={localTemplate.templateBar.barPointBx * previewScale}
            y2={localTemplate.templateBar.barPointBy * previewScale}
            stroke={formatColor(localTemplate.templateBar.barColor) || '#ffffff'}
            stroke-width={(localTemplate.templateBar.barWidth || 4) * previewScale}
            stroke-opacity={localTemplate.templateBar.barTransparency / 255}
          />

          <!-- Show progress with sample data -->
          {#if showRealDataPreview}
            <line
              x1={localTemplate.templateBar.barPointAx * previewScale}
              y1={localTemplate.templateBar.barPointAy * previewScale}
              x2={calculateProgressPosition().x * previewScale}
              y2={calculateProgressPosition().y * previewScale}
              stroke={formatColor(localTemplate.templateBar.barColor) || '#ffffff'}
              stroke-width={(localTemplate.templateBar.barWidth || 4) * previewScale}
              stroke-opacity={1}
            />
          {/if}
        </svg>
      {/if}
    </div>
      </div>
    </div>
  {/if}

  <!-- Size indicator -->
  <div
    class="absolute bottom-1 left-1 px-2 py-1 rounded text-xs opacity-60 transition-opacity bg-black/70"
    style="color: {$colorStore.text};"
  >
    {localTemplate?.outputSizeX || 0} × {localTemplate?.outputSizeY || 0}px
  </div>

  <!-- Coordinate overlay during drag -->
  {#if showCoordinateOverlay && draggingElement}
    <div
      class="absolute top-1 right-1 px-3 py-2 rounded text-xs font-mono bg-black/80"
      style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
      transition:fade={{ duration: 100 }}
    >
      X: {Math.round(draggingElement.getX())} Y: {Math.round(draggingElement.getY())}
    </div>
  {/if}
</div>

<!-- Coordinates and element info display -->
<div
  class="mt-2 p-3 rounded-lg flex flex-wrap gap-2 text-sm items-center"
  style="color: {$colorStore.text}; background: {$colorStore.primary}20;"
>
  {#if draggingElement}
    <div class="flex items-center gap-2">
<span
  class="w-3 h-3 rounded-full"
  style="background-color: {draggingElement.color};"
></span>
      <span class="font-medium">{draggingElement.label}:</span>
    </div>
    <span class="px-2 py-1 rounded" style="background: {draggingElement.color}20;">
X: {Math.round(draggingElement.getX())}
</span>
    <span class="px-2 py-1 rounded" style="background: {draggingElement.color}20;">
Y: {Math.round(draggingElement.getY())}
</span>
  {:else if hoverElement}
    <div class="flex items-center gap-2">
<span
  class="w-3 h-3 rounded-full"
  style="background-color: {hoverElement.color};"
></span>
      <span class="font-medium">{hoverElement.label}:</span>
    </div>
    <span class="px-2 py-1 rounded" style="background: {hoverElement.color}20;">
X: {Math.round(hoverElement.getX())}
</span>
    <span class="px-2 py-1 rounded" style="background: {hoverElement.color}20;">
Y: {Math.round(hoverElement.getY())}
</span>
  {:else if isDesignMode}
    <span>Hover over elements to see coordinates</span>
  {:else}
    <span>Enable Design Mode to position elements by dragging</span>
  {/if}

  <div class="ml-auto flex gap-2">
    <button
      class="p-1 rounded-lg transition-colors opacity-70 hover:opacity-100 disabled:opacity-30 min-w-[44px] min-h-[44px]"
      on:click={undo}
      disabled={undoStack.length === 0}
      aria-label="Undo"
      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
    >
      <RotateCcw size={16} />
    </button>
    <button
      class="p-1 rounded-lg transition-colors opacity-70 hover:opacity-100 text-xs flex items-center min-h-[44px]"
      on:click={resetZoom}
      aria-label="Reset zoom"
      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
    >
      Reset Zoom
    </button>
  </div>
</div>

<style lang="postcss">
  .transform-gpu {
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform;
  }
</style>