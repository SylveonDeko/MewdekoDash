<!-- XpMobileTemplateEditor.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import XpMobileTemplatePreview from "$lib/components/dashboard/xp/XpMobileTemplatePreview.svelte";
  import {
    ChevronDown,
    ChevronUp,
    Move,
    Grid,
    Database,
    Save,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Settings,
    User,
    BarChart3,
    Users,
    Clock,
    Award,
    Type,
    Image,
    Palette,
    Eye,
    EyeOff
  } from "lucide-svelte";

  const dispatch = createEventDispatcher();

  // Props
  export let localTemplate: any;
  export let changedSettings: Set<string>;
  export let currentUserData: any = null;
  export let sampleData: any;

  // Debug logging
  $: if (localTemplate) {
    console.log("Mobile editor received template:", localTemplate);
  }

  // Mobile-first state management
  let viewMode: "preview" | "edit" | "fullscreen" = "preview";
  let activePanel: string | null = null;
  let isDesignMode = false;
  let showRealDataPreview = false;
  let showGrid = false;
  let gridSize = 20;
  let previewScale = 1;
  let isDragging = false;
  let dragElement: any = null;
  let selectedElement: any = null;

  // Touch interaction state
  let touchStartTime = 0;
  let touchStartPos = { x: 0, y: 0 };
  let lastTouchPos = { x: 0, y: 0 };
  let touchDistance = 0;
  let initialPinchDistance = 0;
  let isPinching = false;
  let isLongPress = false;
  let longPressTimer: number;

  // Panel states
  let panelStates: Record<string, boolean> = {
    general: false,
    user: false,
    bar: false,
    guild: false,
    time: false,
    club: false
  };

  // Element positioning  
  let elementBounds: DOMRect | null = null;

  // Mobile-optimized panels configuration
  const panels = [
    {
      id: "general",
      title: "Canvas & Background",
      icon: Settings,
      color: "primary"
    },
    {
      id: "user",
      title: "User Information",
      icon: User,
      color: "secondary"
    },
    {
      id: "bar",
      title: "Progress Bar",
      icon: BarChart3,
      color: "primary"
    },
    {
      id: "guild",
      title: "Guild Information",
      icon: Users,
      color: "secondary"
    },
    {
      id: "time",
      title: "Time Display",
      icon: Clock,
      color: "accent"
    },
    {
      id: "club",
      title: "Club Settings",
      icon: Award,
      color: "primary"
    }
  ];

  // Draggable elements configuration for mobile
  $: draggableElements = localTemplate ? [
    {
      id: "username",
      label: "Username",
      icon: Type,
      getX: () => localTemplate?.templateUser?.textX || 0,
      getY: () => localTemplate?.templateUser?.textY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateUser.textX", Math.round(x));
        handleChange("templateUser.textY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateUser?.showText,
      color: "#3B82F6",
      bounds: { width: 120, height: 24 }
    },
    {
      id: "userAvatar",
      label: "Avatar",
      icon: User,
      getX: () => localTemplate?.templateUser?.iconX || 0,
      getY: () => localTemplate?.templateUser?.iconY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateUser.iconX", Math.round(x));
        handleChange("templateUser.iconY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateUser?.showIcon,
      color: "#10B981",
      bounds: { 
        width: localTemplate?.templateUser?.iconSizeX || 50, 
        height: localTemplate?.templateUser?.iconSizeY || 50 
      }
    },
    {
      id: "guildLevel",
      label: "Level",
      icon: BarChart3,
      getX: () => localTemplate?.templateGuild?.guildLevelX || 0,
      getY: () => localTemplate?.templateGuild?.guildLevelY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateGuild.guildLevelX", Math.round(x));
        handleChange("templateGuild.guildLevelY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateGuild?.showGuildLevel,
      color: "#8B5CF6",
      bounds: { width: 80, height: 20 }
    },
    {
      id: "guildRank",
      label: "Rank",
      icon: Award,
      getX: () => localTemplate?.templateGuild?.guildRankX || 0,
      getY: () => localTemplate?.templateGuild?.guildRankY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateGuild.guildRankX", Math.round(x));
        handleChange("templateGuild.guildRankY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateGuild?.showGuildRank,
      color: "#EC4899",
      bounds: { width: 60, height: 20 }
    },
    {
      id: "timeOnLevel",
      label: "Time",
      icon: Clock,
      getX: () => localTemplate?.timeOnLevelX || 0,
      getY: () => localTemplate?.timeOnLevelY || 0,
      setPos: (x: number, y: number) => {
        handleChange("timeOnLevelX", Math.round(x));
        handleChange("timeOnLevelY", Math.round(y));
      },
      isVisible: () => localTemplate?.showTimeOnLevel,
      color: "#F59E0B",
      bounds: { width: 100, height: 20 }
    },
    {
      id: "clubName",
      label: "Club",
      icon: Users,
      getX: () => localTemplate?.templateClub?.clubNameX || 0,
      getY: () => localTemplate?.templateClub?.clubNameY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateClub.clubNameX", Math.round(x));
        handleChange("templateClub.clubNameY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateClub?.showClubName,
      color: "#14B8A6",
      bounds: { width: 80, height: 20 }
    },
    {
      id: "progressBarStart",
      label: "Bar Start",
      icon: BarChart3,
      getX: () => localTemplate?.templateBar?.barPointAx || 0,
      getY: () => localTemplate?.templateBar?.barPointAy || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateBar.barPointAx", Math.round(x));
        handleChange("templateBar.barPointAy", Math.round(y));
      },
      isVisible: () => localTemplate?.templateBar?.showBar,
      color: "#EF4444",
      bounds: { width: 20, height: 20 }
    },
    {
      id: "progressBarEnd",
      label: "Bar End",
      icon: BarChart3,
      getX: () => localTemplate?.templateBar?.barPointBx || 0,
      getY: () => localTemplate?.templateBar?.barPointBy || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateBar.barPointBx", Math.round(x));
        handleChange("templateBar.barPointBy", Math.round(y));
      },
      isVisible: () => localTemplate?.templateBar?.showBar,
      color: "#EF4444",
      bounds: { width: 20, height: 20 }
    }
  ] : [];

  // Event handlers
  function handleChange(property: string, value: any) {
    const keys = property.split('.');
    let obj = localTemplate;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    changedSettings.add("template");
    localTemplate = { ...localTemplate };
  }

  function handleColorInput(property: string) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      let value = target.value;
      if (!value.startsWith('#')) value = '#' + value;
      handleChange(property, value);
    };
  }

  function formatColor(colorString: string): string {
    if (!colorString) return "#ffffff";
    if (colorString.startsWith('#')) return colorString;
    return `#${colorString}`;
  }

  function handleInputFocus(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
  }

  // Background image variables
  let imageUrl = "";
  let imageLoading = false;
  let imageError = "";
  let updateSizeFromImage = false;
  let previewBackgroundUrl: string | null = null;

  function loadImage() {
    if (!imageUrl) return;
    imageLoading = true;
    imageError = "";
    
    const img = new Image();
    img.onload = () => {
      previewBackgroundUrl = imageUrl;
      if (updateSizeFromImage && localTemplate) {
        handleChange('outputSizeX', img.width);
        handleChange('outputSizeY', img.height);
      }
      imageLoading = false;
    };
    img.onerror = () => {
      imageError = "Failed to load image";
      imageLoading = false;
    };
    img.src = imageUrl;
  }

  function togglePanel(panelId: string) {
    if (activePanel === panelId) {
      activePanel = null;
    } else {
      activePanel = panelId;
      // Close all other panels for mobile
      Object.keys(panelStates).forEach(key => {
        panelStates[key] = key === panelId;
      });
    }
  }

  function toggleDesignMode() {
    isDesignMode = !isDesignMode;
    if (isDesignMode && viewMode === "edit") {
      viewMode = "preview";
    }
  }

  function toggleDataPreview() {
    showRealDataPreview = !showRealDataPreview;
  }

  function toggleGrid() {
    showGrid = !showGrid;
  }

  function zoomIn() {
    previewScale = Math.min(previewScale * 1.2, 3);
  }

  function zoomOut() {
    previewScale = Math.max(previewScale / 1.2, 0.3);
  }

  function resetZoom() {
    previewScale = 1;
  }

  function enterFullscreen() {
    viewMode = "fullscreen";
  }

  function exitFullscreen() {
    viewMode = "preview";
  }

  // Event handlers for mobile preview component
  function handleElementTapped(detail: any) {
    if (isDesignMode) {
      selectedElement = detail.element;
    }
  }

  function handleCanvasTapped(detail: any) {
    if (isDesignMode) {
      selectedElement = null;
    }
  }

  // Legacy touch event handlers (unused but kept for reference)
  function handleTouchStart(event: TouchEvent) {
    touchStartTime = Date.now();
    
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      touchStartPos = { x: touch.clientX, y: touch.clientY };
      lastTouchPos = { x: touch.clientX, y: touch.clientY };
      
      // Start long press timer
      longPressTimer = window.setTimeout(() => {
        isLongPress = true;
        if (!isDesignMode) {
          toggleDesignMode();
          // Haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }
      }, 500);
    } else if (event.touches.length === 2) {
      // Pinch gesture
      clearTimeout(longPressTimer);
      isPinching = true;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      initialPinchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length === 1 && !isPinching) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastTouchPos.x;
      const deltaY = touch.clientY - lastTouchPos.y;
      const distance = Math.hypot(deltaX, deltaY);
      
      if (distance > 10) {
        clearTimeout(longPressTimer);
        isLongPress = false;
      }
      
      lastTouchPos = { x: touch.clientX, y: touch.clientY };
      
      if (isDragging && dragElement) {
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (touch.clientX - rect.left) / previewScale;
        const y = (touch.clientY - rect.top) / previewScale;
        dragElement.setPos(x, y);
      }
    } else if (event.touches.length === 2 && isPinching) {
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scaleChange = currentDistance / initialPinchDistance;
      previewScale = Math.max(0.3, Math.min(3, previewScale * scaleChange));
      initialPinchDistance = currentDistance;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    clearTimeout(longPressTimer);
    
    const touchDuration = Date.now() - touchStartTime;
    const distance = Math.hypot(
      lastTouchPos.x - touchStartPos.x,
      lastTouchPos.y - touchStartPos.y
    );
    
    if (touchDuration < 200 && distance < 10 && !isLongPress) {
      // Quick tap
      if (isDesignMode) {
        // Select element or toggle panel
        const target = event.target as HTMLElement;
        const elementId = target.getAttribute('data-element-id');
        if (elementId) {
          selectedElement = draggableElements.find(el => el.id === elementId);
        }
      }
    }
    
    isDragging = false;
    dragElement = null;
    isPinching = false;
    isLongPress = false;
  }

  // Save function
  function handleSave() {
    dispatch('save');
  }

  // Reset function
  function handleReset() {
    dispatch('reset');
  }

  onMount(() => {
    // Prevent default touch behaviors
    document.addEventListener('touchmove', (e) => {
      if (viewMode === 'fullscreen') {
        e.preventDefault();
      }
    }, { passive: false });
  });

  onDestroy(() => {
    clearTimeout(longPressTimer);
  });
</script>

{#if localTemplate}
  <div 
    class="flex flex-col bg-gray-900 text-white touch-manipulation"
    class:h-full={viewMode !== 'fullscreen'}
    class:min-h-[calc(100vh-200px)]={viewMode !== 'fullscreen'}
    class:fixed={viewMode === 'fullscreen'}
    class:inset-0={viewMode === 'fullscreen'}
    class:z-50={viewMode === 'fullscreen'}
  >
    <!-- Mobile Header -->
    <div 
      class="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20);"
    >
      <div class="flex items-center gap-3">
        <div
          class="p-2 rounded-lg"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
        >
          <Image size={20} />
        </div>
        <div>
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">
            XP Template
          </h2>
          <p class="text-xs" style="color: {$colorStore.muted}">
            {localTemplate.outputSizeX}×{localTemplate.outputSizeY}px
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Quick Actions -->
        <button
          class="p-2 rounded-lg transition-all duration-200 touch-manipulation"
          class:ring-2={isDesignMode}
          style="background: {isDesignMode ? $colorStore.primary + '30' : 'transparent'}; 
                 ring-color: {$colorStore.primary}; color: {$colorStore.text};"
          on:click={toggleDesignMode}
          aria-label="Toggle design mode"
        >
          <Move size={20} />
        </button>

        <button
          class="p-2 rounded-lg transition-all duration-200 touch-manipulation"
          class:ring-2={showRealDataPreview}
          style="background: {showRealDataPreview ? $colorStore.secondary + '30' : $colorStore.primary + '10'}; 
                 ring-color: {$colorStore.secondary}; color: {$colorStore.text};"
          on:click={toggleDataPreview}
          aria-label="Toggle real data preview"
        >
          {#if showRealDataPreview}
            <Eye size={20} />
          {:else}
            <EyeOff size={20} />
          {/if}
        </button>

        {#if viewMode === 'fullscreen'}
          <button
            class="p-2 rounded-lg transition-all duration-200 touch-manipulation"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            on:click={exitFullscreen}
            aria-label="Exit fullscreen"
          >
            <Maximize2 size={20} class="rotate-45" />
          </button>
        {/if}
      </div>
    </div>

    <!-- Mobile View Toggle -->
    {#if viewMode !== 'fullscreen'}
      <div class="flex bg-gray-800 border-b border-gray-700">
        <button
          class="flex-1 py-3 px-4 text-center transition-all duration-200 touch-manipulation"
          class:font-semibold={viewMode === 'preview'}
          style="background: {viewMode === 'preview' ? $colorStore.primary + '20' : 'transparent'};
                 color: {viewMode === 'preview' ? $colorStore.primary : $colorStore.muted};
                 border-bottom: {viewMode === 'preview' ? '2px solid ' + $colorStore.primary : 'none'};"
          on:click={() => viewMode = 'preview'}
        >
          Preview
        </button>
        <button
          class="flex-1 py-3 px-4 text-center transition-all duration-200 touch-manipulation"
          class:font-semibold={viewMode === 'edit'}
          style="background: {viewMode === 'edit' ? $colorStore.primary + '20' : 'transparent'};
                 color: {viewMode === 'edit' ? $colorStore.primary : $colorStore.muted};
                 border-bottom: {viewMode === 'edit' ? '2px solid ' + $colorStore.primary : 'none'};"
          on:click={() => viewMode = 'edit'}
        >
          Settings
        </button>
      </div>
    {/if}

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      {#if viewMode === 'preview' || viewMode === 'fullscreen'}
        <!-- Preview Mode -->
        <div class="flex-1 relative">
          <!-- Zoom Controls -->
          <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              class="p-3 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; 
                     border: 1px solid {$colorStore.primary}30; backdrop-filter: blur(8px);"
              on:click={zoomIn}
              aria-label="Zoom in"
            >
              <ZoomIn size={20} />
            </button>
            <button
              class="p-3 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; 
                     border: 1px solid {$colorStore.primary}30; backdrop-filter: blur(8px);"
              on:click={zoomOut}
              aria-label="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              class="p-3 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; 
                     border: 1px solid {$colorStore.secondary}30; backdrop-filter: blur(8px);"
              on:click={resetZoom}
              aria-label="Reset zoom"
            >
              <Maximize2 size={20} />
            </button>
            {#if viewMode === 'preview'}
              <button
                class="p-3 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
                style="background: {$colorStore.primary}90; color: white; 
                       backdrop-filter: blur(8px);"
                on:click={enterFullscreen}
                aria-label="Enter fullscreen"
              >
                <Maximize2 size={20} />
              </button>
            {/if}
          </div>

          <!-- Grid Toggle -->
          {#if isDesignMode}
            <div class="absolute top-4 left-4 z-10">
              <button
                class="p-3 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
                class:ring-2={showGrid}
                style="background: {showGrid ? $colorStore.accent + '30' : $colorStore.accent + '20'}; 
                       color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;
                       backdrop-filter: blur(8px); ring-color: {$colorStore.accent};"
                on:click={toggleGrid}
                aria-label="Toggle grid"
              >
                <Grid size={20} />
              </button>
            </div>
          {/if}

          <!-- Template Preview -->
          <XpMobileTemplatePreview
            template={localTemplate}
            userData={showRealDataPreview ? currentUserData : sampleData}
            scale={previewScale}
            {showGrid}
            {gridSize}
            {isDesignMode}
            {selectedElement}
            viewMode={viewMode}
            touchZoomEnabled={true}
            panEnabled={true}
            on:elementSelected={(e) => selectedElement = e.detail.element}
            on:elementTapped={(e) => handleElementTapped(e.detail)}
            on:canvasTapped={(e) => handleCanvasTapped(e.detail)}
            on:scaleChanged={(e) => previewScale = e.detail.scale}
          />

          <!-- Element Info Overlay -->
          {#if selectedElement && isDesignMode}
            <div 
              class="absolute bottom-4 left-4 right-4 z-10 p-4 rounded-lg shadow-lg"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}40;
                     backdrop-filter: blur(8px);"
              transition:slide={{ duration: 200 }}
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="p-2 rounded-lg"
                    style="background: {selectedElement.color}20; color: {selectedElement.color};"
                  >
                    <svelte:component this={selectedElement.icon} size={16} />
                  </div>
                  <div>
                    <p class="font-medium" style="color: {$colorStore.text}">
                      {selectedElement.label}
                    </p>
                    <p class="text-sm" style="color: {$colorStore.muted}">
                      X: {Math.round(selectedElement.getX())}, Y: {Math.round(selectedElement.getY())}
                    </p>
                  </div>
                </div>
                <button
                  class="p-2 rounded-lg transition-all duration-200 touch-manipulation"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                  on:click={() => selectedElement = null}
                  aria-label="Deselect element"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          {/if}
        </div>

      {:else if viewMode === 'edit'}
        <!-- Edit Mode - Mobile-optimized panels -->
        <div class="flex-1 overflow-y-auto">
          <!-- Quick Elements Bar -->
          {#if isDesignMode}
            <div class="p-4 bg-gray-800 border-b border-gray-700">
              <p class="text-sm font-medium mb-3" style="color: {$colorStore.text}">
                Tap elements to position:
              </p>
              <div class="flex gap-2 overflow-x-auto pb-2">
                {#each draggableElements.filter(el => el.isVisible()) as element (element.id)}
                  <button
                    class="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation"
                    class:ring-2={selectedElement?.id === element.id}
                    style="background: {element.color}20; color: {element.color}; 
                           ring-color: {element.color};"
                    on:click={() => selectedElement = element}
                  >
                    <svelte:component this={element.icon} size={16} />
                    <span class="whitespace-nowrap">{element.label}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Settings Panels -->
          <div class="space-y-2 p-4">
            {#each panels as panel (panel.id)}
              <div class="rounded-lg overflow-hidden" style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                <!-- Panel Header -->
                <button
                  class="w-full flex items-center justify-between p-4 transition-all duration-200 touch-manipulation"
                  style="background: {panelStates[panel.id] ? (panel.color === 'primary' ? $colorStore.primary : panel.color === 'secondary' ? $colorStore.secondary : $colorStore.accent) + '20' : 'transparent'};"
                  on:click={() => {
                    panelStates[panel.id] = !panelStates[panel.id];
                    activePanel = panelStates[panel.id] ? panel.id : null;
                  }}
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="p-2 rounded-lg"
                      style="background: {(panel.color === 'primary' ? $colorStore.primary : panel.color === 'secondary' ? $colorStore.secondary : $colorStore.accent)}20; color: {(panel.color === 'primary' ? $colorStore.primary : panel.color === 'secondary' ? $colorStore.secondary : $colorStore.accent)};"
                    >
                      <svelte:component this={panel.icon} size={20} />
                    </div>
                    <span class="font-medium" style="color: {$colorStore.text}">
                      {panel.title}
                    </span>
                  </div>
                  <div style="color: {$colorStore.muted};">
                    {#if panelStates[panel.id]}
                      <ChevronUp size={20} />
                    {:else}
                      <ChevronDown size={20} />
                    {/if}
                  </div>
                </button>

                <!-- Panel Content -->
                {#if panelStates[panel.id]}
                  <div class="p-4 border-t" style="border-color: {$colorStore.primary}20;" transition:slide>
                    {#if panel.id === 'general'}
                      <!-- Canvas Size Controls -->
                      <div class="space-y-4">
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            Canvas Size
                          </label>
                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label class="block text-xs mb-1" style="color: {$colorStore.muted}">Width</label>
                              <input
                                type="number"
                                bind:value={localTemplate.outputSizeX}
                                on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                                class="w-full p-3 rounded-lg bg-gray-800 border text-center font-mono touch-manipulation"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                min="300"
                                max="1200"
                              />
                            </div>
                            <div>
                              <label class="block text-xs mb-1" style="color: {$colorStore.muted}">Height</label>
                              <input
                                type="number"
                                bind:value={localTemplate.outputSizeY}
                                on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                                class="w-full p-3 rounded-lg bg-gray-800 border text-center font-mono touch-manipulation"
                                style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                min="150"
                                max="600"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Size Presets -->
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                            Quick Sizes
                          </label>
                          <div class="grid grid-cols-1 gap-2">
                            <button
                              class="p-3 rounded-lg text-sm transition-all duration-200 touch-manipulation"
                              style="background: {$colorStore.primary}10; color: {$colorStore.text}; 
                                     border: 1px solid {$colorStore.primary}30;"
                              on:click={() => {
                                handleChange('outputSizeX', 800);
                                handleChange('outputSizeY', 280);
                              }}
                            >
                              Standard (800×280)
                            </button>
                            <button
                              class="p-3 rounded-lg text-sm transition-all duration-200 touch-manipulation"
                              style="background: {$colorStore.primary}10; color: {$colorStore.text}; 
                                     border: 1px solid {$colorStore.primary}30;"
                              on:click={() => {
                                handleChange('outputSizeX', 1000);
                                handleChange('outputSizeY', 350);
                              }}
                            >
                              Large (1000×350)
                            </button>
                            <button
                              class="p-3 rounded-lg text-sm transition-all duration-200 touch-manipulation"
                              style="background: {$colorStore.primary}10; color: {$colorStore.text}; 
                                     border: 1px solid {$colorStore.primary}30;"
                              on:click={() => {
                                handleChange('outputSizeX', 600);
                                handleChange('outputSizeY', 210);
                              }}
                            >
                              Compact (600×210)
                            </button>
                          </div>
                        </div>

                        <!-- Background Image Section -->
                        <div class="space-y-4 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
                          <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                              Background Image
                            </label>
                            <div class="space-y-3">
                              <div class="flex flex-col gap-3">
                                <input
                                  type="url"
                                  bind:value={imageUrl}
                                  class="flex-1 p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  placeholder="https://example.com/background.jpg"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                                <button
                                  class="px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium touch-manipulation"
                                  on:click={loadImage}
                                  disabled={imageLoading || !imageUrl}
                                  style="background: {$colorStore.primary}; color: white; opacity: {imageLoading || !imageUrl ? '0.5' : '1'};"
                                  aria-label="Load background image"
                                >
                                  {#if imageLoading}
                                    <div class="w-4 h-4 border-2 rounded-full animate-spin"
                                         style="border-color: white; border-top-color: transparent;"></div>
                                  {:else}
                                    <Image size={16} />
                                  {/if}
                                  <span>Load Image</span>
                                </button>
                              </div>
                              {#if imageError}
                                <p class="text-sm flex items-center gap-1 p-2 rounded"
                                   style="color: {$colorStore.accent}; background: {$colorStore.accent}10;">
                                  ⚠️ {imageError}
                                </p>
                              {/if}
                            </div>
                          </div>

                          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors touch-manipulation"
                                 style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            <input
                              type="checkbox"
                              bind:checked={updateSizeFromImage}
                              class="w-5 h-5 rounded"
                              style="accent-color: {$colorStore.primary};"
                            />
                            <div class="flex-1">
                              <span class="block text-sm font-medium" style="color: {$colorStore.text}">
                                Auto-resize canvas
                              </span>
                              <span class="block text-xs" style="color: {$colorStore.muted}">
                                Match canvas size to loaded image dimensions
                              </span>
                            </div>
                          </label>
                          
                          {#if previewBackgroundUrl}
                            <div class="flex items-center justify-between p-3 rounded-lg"
                                 style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30;">
                              <span class="text-sm" style="color: {$colorStore.text}">
                                Background image loaded
                              </span>
                              <button
                                class="text-sm underline touch-manipulation"
                                style="color: {$colorStore.accent};"
                                on:click={() => { previewBackgroundUrl = null; imageUrl = ''; }}
                              >
                                Remove
                              </button>
                            </div>
                          {/if}
                        </div>
                      </div>

                    {:else if panel.id === 'user'}
                      <!-- User Settings -->
                      <div class="space-y-6">
                        <!-- Username Toggle -->
                        <div class="flex items-center justify-between p-4 rounded-lg" 
                             style="background: {$colorStore.primary}10;">
                          <div>
                            <p class="font-medium" style="color: {$colorStore.text}">Username Text</p>
                            <p class="text-sm" style="color: {$colorStore.muted}">Display user's name</p>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              class="sr-only peer"
                              checked={localTemplate.templateUser.showText}
                              on:change={() => handleChange('templateUser.showText', !localTemplate.templateUser.showText)}
                            />
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                 style="peer-checked:bg-color: {$colorStore.primary};">
                            </div>
                          </label>
                        </div>

                        {#if localTemplate.templateUser.showText}
                          <div class="space-y-4" transition:slide>
                            <!-- Text Color -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Text Color
                              </label>
                              <div class="flex gap-2">
                                <input
                                  type="text"
                                  value={formatColor(localTemplate.templateUser.textColor)}
                                  on:input={handleColorInput('templateUser.textColor')}
                                  class="flex-1 p-3 rounded-lg bg-gray-800 border font-mono text-sm touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  placeholder="#FFFFFF"
                                />
                                <input
                                  type="color"
                                  value={formatColor(localTemplate.templateUser.textColor)}
                                  on:input={handleColorInput('templateUser.textColor')}
                                  class="w-14 h-12 rounded-lg border cursor-pointer touch-manipulation"
                                  style="border-color: {$colorStore.primary}30;"
                                />
                              </div>
                            </div>

                            <!-- Font Size -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Font Size: {localTemplate.templateUser.fontSize}px
                              </label>
                              <input
                                type="range"
                                bind:value={localTemplate.templateUser.fontSize}
                                on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                                min="10"
                                max="100"
                                class="w-full h-3 rounded-lg appearance-none cursor-pointer touch-manipulation"
                                style="background: linear-gradient(to right, {$colorStore.primary}40 0%, {$colorStore.primary}40 {(localTemplate.templateUser.fontSize - 10) / 0.9}%, {$colorStore.muted}20 {(localTemplate.templateUser.fontSize - 10) / 0.9}%, {$colorStore.muted}20 100%);"
                              />
                            </div>

                            <!-- Position Controls -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position X</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateUser.textX}
                                  on:input={() => handleChange('templateUser.textX', localTemplate.templateUser.textX)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position Y</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateUser.textY}
                                  on:input={() => handleChange('templateUser.textY', localTemplate.templateUser.textY)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>
                          </div>
                        {/if}

                        <!-- Avatar Toggle -->
                        <div class="flex items-center justify-between p-4 rounded-lg" 
                             style="background: {$colorStore.secondary}10;">
                          <div>
                            <p class="font-medium" style="color: {$colorStore.text}">User Avatar</p>
                            <p class="text-sm" style="color: {$colorStore.muted}">Display user's avatar</p>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              class="sr-only peer"
                              checked={localTemplate.templateUser.showIcon}
                              on:change={() => handleChange('templateUser.showIcon', !localTemplate.templateUser.showIcon)}
                            />
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                 style="peer-checked:bg-color: {$colorStore.secondary};">
                            </div>
                          </label>
                        </div>

                        {#if localTemplate.templateUser.showIcon}
                          <div class="space-y-4" transition:slide>
                            <!-- Avatar Size -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Width</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateUser.iconSizeX}
                                  on:input={() => handleChange('templateUser.iconSizeX', localTemplate.templateUser.iconSizeX)}
                                  min="10"
                                  max="200"
                                  class="w-full touch-manipulation"
                                />
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateUser.iconSizeX}
                                  on:input={() => handleChange('templateUser.iconSizeX', localTemplate.templateUser.iconSizeX)}
                                  class="w-full p-2 mt-1 rounded-lg bg-gray-800 border text-sm touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Height</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateUser.iconSizeY}
                                  on:input={() => handleChange('templateUser.iconSizeY', localTemplate.templateUser.iconSizeY)}
                                  min="10"
                                  max="200"
                                  class="w-full touch-manipulation"
                                />
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateUser.iconSizeY}
                                  on:input={() => handleChange('templateUser.iconSizeY', localTemplate.templateUser.iconSizeY)}
                                  class="w-full p-2 mt-1 rounded-lg bg-gray-800 border text-sm touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>

                            <!-- Position Controls -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position X</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateUser.iconX}
                                  on:input={() => handleChange('templateUser.iconX', localTemplate.templateUser.iconX)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position Y</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateUser.iconY}
                                  on:input={() => handleChange('templateUser.iconY', localTemplate.templateUser.iconY)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>
                          </div>
                        {/if}
                      </div>

                    {:else if panel.id === 'bar'}
                      <!-- Progress Bar Settings -->
                      <div class="space-y-6">
                        <!-- Progress Bar Toggle -->
                        <div class="flex items-center justify-between p-4 rounded-lg" 
                             style="background: {$colorStore.accent}10;">
                          <div>
                            <p class="font-medium" style="color: {$colorStore.text}">XP Progress Bar</p>
                            <p class="text-sm" style="color: {$colorStore.muted}">Show experience progress</p>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              class="sr-only peer"
                              checked={localTemplate.templateBar.showBar}
                              on:change={() => handleChange('templateBar.showBar', !localTemplate.templateBar.showBar)}
                            />
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                 style="peer-checked:bg-color: {$colorStore.accent};">
                            </div>
                          </label>
                        </div>

                        {#if localTemplate.templateBar.showBar}
                          <div class="space-y-4" transition:slide>
                            <!-- Bar Color -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Bar Color
                              </label>
                              <div class="flex gap-2">
                                <input
                                  type="text"
                                  value={formatColor(localTemplate.templateBar.barColor)}
                                  on:input={handleColorInput('templateBar.barColor')}
                                  class="flex-1 p-3 rounded-lg bg-gray-800 border font-mono text-sm touch-manipulation"
                                  style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                  placeholder="#FFFFFF"
                                />
                                <input
                                  type="color"
                                  value={formatColor(localTemplate.templateBar.barColor)}
                                  on:input={handleColorInput('templateBar.barColor')}
                                  class="w-14 h-12 rounded-lg border cursor-pointer touch-manipulation"
                                  style="border-color: {$colorStore.accent}30;"
                                />
                              </div>
                            </div>

                            <!-- Bar Width -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Bar Width: {localTemplate.templateBar.barWidth || 4}px
                              </label>
                              <input
                                type="range"
                                bind:value={localTemplate.templateBar.barWidth}
                                on:input={() => handleChange('templateBar.barWidth', localTemplate.templateBar.barWidth)}
                                min="1"
                                max="30"
                                class="w-full h-3 rounded-lg appearance-none cursor-pointer touch-manipulation"
                              />
                            </div>

                            <!-- Bar Transparency -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Transparency: {Math.round((localTemplate.templateBar.barTransparency / 255) * 100)}%
                              </label>
                              <input
                                type="range"
                                bind:value={localTemplate.templateBar.barTransparency}
                                on:input={() => handleChange('templateBar.barTransparency', localTemplate.templateBar.barTransparency)}
                                min="0"
                                max="255"
                                class="w-full h-3 rounded-lg appearance-none cursor-pointer touch-manipulation"
                              />
                            </div>

                            <!-- Bar Length -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Bar Length: {localTemplate.templateBar.barLength}px
                              </label>
                              <input
                                type="number"
                                bind:value={localTemplate.templateBar.barLength}
                                on:input={() => handleChange('templateBar.barLength', localTemplate.templateBar.barLength)}
                                class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                min="1"
                              />
                            </div>

                            <!-- Start Point -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Start Point
                              </label>
                              <div class="grid grid-cols-2 gap-3">
                                <div>
                                  <label class="block text-xs mb-1" style="color: {$colorStore.muted}">X</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateBar.barPointAx}
                                    on:input={() => handleChange('templateBar.barPointAx', localTemplate.templateBar.barPointAx)}
                                    class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                    style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div>
                                  <label class="block text-xs mb-1" style="color: {$colorStore.muted}">Y</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateBar.barPointAy}
                                    on:input={() => handleChange('templateBar.barPointAy', localTemplate.templateBar.barPointAy)}
                                    class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                    style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>

                            <!-- End Point -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                End Point
                              </label>
                              <div class="grid grid-cols-2 gap-3">
                                <div>
                                  <label class="block text-xs mb-1" style="color: {$colorStore.muted}">X</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateBar.barPointBx}
                                    on:input={() => handleChange('templateBar.barPointBx', localTemplate.templateBar.barPointBx)}
                                    class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                    style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div>
                                  <label class="block text-xs mb-1" style="color: {$colorStore.muted}">Y</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateBar.barPointBy}
                                    on:input={() => handleChange('templateBar.barPointBy', localTemplate.templateBar.barPointBy)}
                                    class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                    style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        {/if}
                      </div>

                    {:else if panel.id === 'guild'}
                      <!-- Guild Settings -->
                      <div class="space-y-6">
                        <!-- Guild Level -->
                        <div class="flex items-center justify-between p-4 rounded-lg" 
                             style="background: {$colorStore.primary}10;">
                          <div>
                            <p class="font-medium" style="color: {$colorStore.text}">Guild Level</p>
                            <p class="text-sm" style="color: {$colorStore.muted}">Show server level</p>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              class="sr-only peer"
                              checked={localTemplate.templateGuild.showGuildLevel}
                              on:change={() => handleChange('templateGuild.showGuildLevel', !localTemplate.templateGuild.showGuildLevel)}
                            />
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                 style="peer-checked:bg-color: {$colorStore.primary};">
                            </div>
                          </label>
                        </div>

                        {#if localTemplate.templateGuild.showGuildLevel}
                          <div class="space-y-4" transition:slide>
                            <!-- Guild Level Color -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Text Color
                              </label>
                              <div class="flex gap-2">
                                <input
                                  type="text"
                                  value={formatColor(localTemplate.templateGuild.guildLevelColor)}
                                  on:input={handleColorInput('templateGuild.guildLevelColor')}
                                  class="flex-1 p-3 rounded-lg bg-gray-800 border font-mono text-sm touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  placeholder="#FFFFFF"
                                />
                                <input
                                  type="color"
                                  value={formatColor(localTemplate.templateGuild.guildLevelColor)}
                                  on:input={handleColorInput('templateGuild.guildLevelColor')}
                                  class="w-14 h-12 rounded-lg border cursor-pointer touch-manipulation"
                                  style="border-color: {$colorStore.primary}30;"
                                />
                              </div>
                            </div>

                            <!-- Guild Level Font Size -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Font Size: {localTemplate.templateGuild.guildLevelFontSize}px
                              </label>
                              <input
                                type="range"
                                bind:value={localTemplate.templateGuild.guildLevelFontSize}
                                on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                                min="10"
                                max="100"
                                class="w-full h-3 rounded-lg appearance-none cursor-pointer touch-manipulation"
                              />
                            </div>

                            <!-- Guild Level Position -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position X</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateGuild.guildLevelX}
                                  on:input={() => handleChange('templateGuild.guildLevelX', localTemplate.templateGuild.guildLevelX)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position Y</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateGuild.guildLevelY}
                                  on:input={() => handleChange('templateGuild.guildLevelY', localTemplate.templateGuild.guildLevelY)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>
                          </div>
                        {/if}

                        <!-- Guild Rank -->
                        <div class="flex items-center justify-between p-4 rounded-lg" 
                             style="background: {$colorStore.secondary}10;">
                          <div>
                            <p class="font-medium" style="color: {$colorStore.text}">Guild Rank</p>
                            <p class="text-sm" style="color: {$colorStore.muted}">Show user's rank</p>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              class="sr-only peer"
                              checked={localTemplate.templateGuild.showGuildRank}
                              on:change={() => handleChange('templateGuild.showGuildRank', !localTemplate.templateGuild.showGuildRank)}
                            />
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                 style="peer-checked:bg-color: {$colorStore.secondary};">
                            </div>
                          </label>
                        </div>

                        {#if localTemplate.templateGuild.showGuildRank}
                          <div class="space-y-4" transition:slide>
                            <!-- Guild Rank Color -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Text Color
                              </label>
                              <div class="flex gap-2">
                                <input
                                  type="text"
                                  value={formatColor(localTemplate.templateGuild.guildRankColor)}
                                  on:input={handleColorInput('templateGuild.guildRankColor')}
                                  class="flex-1 p-3 rounded-lg bg-gray-800 border font-mono text-sm touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                  placeholder="#FFFFFF"
                                />
                                <input
                                  type="color"
                                  value={formatColor(localTemplate.templateGuild.guildRankColor)}
                                  on:input={handleColorInput('templateGuild.guildRankColor')}
                                  class="w-14 h-12 rounded-lg border cursor-pointer touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30;"
                                />
                              </div>
                            </div>

                            <!-- Guild Rank Font Size -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Font Size: {localTemplate.templateGuild.guildRankFontSize}px
                              </label>
                              <input
                                type="range"
                                bind:value={localTemplate.templateGuild.guildRankFontSize}
                                on:input={() => handleChange('templateGuild.guildRankFontSize', localTemplate.templateGuild.guildRankFontSize)}
                                min="10"
                                max="100"
                                class="w-full h-3 rounded-lg appearance-none cursor-pointer touch-manipulation"
                              />
                            </div>

                            <!-- Guild Rank Position -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position X</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateGuild.guildRankX}
                                  on:input={() => handleChange('templateGuild.guildRankX', localTemplate.templateGuild.guildRankX)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position Y</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateGuild.guildRankY}
                                  on:input={() => handleChange('templateGuild.guildRankY', localTemplate.templateGuild.guildRankY)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>
                          </div>
                        {/if}
                      </div>

                    {:else if panel.id === 'time'}
                      <!-- Time Display Settings -->
                      <div class="space-y-6">
                        <!-- Time on Level Toggle -->
                        <div class="flex items-center justify-between p-4 rounded-lg" 
                             style="background: {$colorStore.accent}10;">
                          <div>
                            <p class="font-medium" style="color: {$colorStore.text}">Time on Level</p>
                            <p class="text-sm" style="color: {$colorStore.muted}">Show time spent on current level</p>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              class="sr-only peer"
                              checked={localTemplate.showTimeOnLevel}
                              on:change={() => handleChange('showTimeOnLevel', !localTemplate.showTimeOnLevel)}
                            />
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                 style="peer-checked:bg-color: {$colorStore.accent};">
                            </div>
                          </label>
                        </div>

                        {#if localTemplate.showTimeOnLevel}
                          <div class="space-y-4" transition:slide>
                            <!-- Time Format -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Format
                              </label>
                              <input
                                type="text"
                                bind:value={localTemplate.timeOnLevelFormat}
                                on:input={() => handleChange('timeOnLevelFormat', localTemplate.timeOnLevelFormat)}
                                class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                placeholder="{0}d{1}h{2}m"
                              />
                              <p class="text-xs mt-1 p-2 rounded" style="background: {$colorStore.accent}10; color: {$colorStore.muted};">
                                Format uses {'{0}'} for days, {'{1}'} for hours, {'{2}'} for minutes
                              </p>
                            </div>

                            <!-- Time Color -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Text Color
                              </label>
                              <div class="flex gap-2">
                                <input
                                  type="text"
                                  value={formatColor(localTemplate.timeOnLevelColor)}
                                  on:input={handleColorInput('timeOnLevelColor')}
                                  class="flex-1 p-3 rounded-lg bg-gray-800 border font-mono text-sm touch-manipulation"
                                  style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                  placeholder="#FFFFFF"
                                />
                                <input
                                  type="color"
                                  value={formatColor(localTemplate.timeOnLevelColor)}
                                  on:input={handleColorInput('timeOnLevelColor')}
                                  class="w-14 h-12 rounded-lg border cursor-pointer touch-manipulation"
                                  style="border-color: {$colorStore.accent}30;"
                                />
                              </div>
                            </div>

                            <!-- Time Font Size -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Font Size: {localTemplate.timeOnLevelFontSize}px
                              </label>
                              <input
                                type="range"
                                bind:value={localTemplate.timeOnLevelFontSize}
                                on:input={() => handleChange('timeOnLevelFontSize', localTemplate.timeOnLevelFontSize)}
                                min="10"
                                max="100"
                                class="w-full h-3 rounded-lg appearance-none cursor-pointer touch-manipulation"
                              />
                            </div>

                            <!-- Time Position -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position X</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.timeOnLevelX}
                                  on:input={() => handleChange('timeOnLevelX', localTemplate.timeOnLevelX)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position Y</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.timeOnLevelY}
                                  on:input={() => handleChange('timeOnLevelY', localTemplate.timeOnLevelY)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>
                          </div>
                        {/if}
                      </div>

                    {:else if panel.id === 'club'}
                      <!-- Club Settings -->
                      <div class="space-y-6">
                        <!-- Club Name -->
                        <div class="flex items-center justify-between p-4 rounded-lg" 
                             style="background: {$colorStore.primary}10;">
                          <div>
                            <p class="font-medium" style="color: {$colorStore.text}">Club Name</p>
                            <p class="text-sm" style="color: {$colorStore.muted}">Show club name text</p>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              class="sr-only peer"
                              checked={localTemplate.templateClub.showClubName}
                              on:change={() => handleChange('templateClub.showClubName', !localTemplate.templateClub.showClubName)}
                            />
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                 style="peer-checked:bg-color: {$colorStore.primary};">
                            </div>
                          </label>
                        </div>

                        {#if localTemplate.templateClub.showClubName}
                          <div class="space-y-4" transition:slide>
                            <!-- Club Name Color -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Text Color
                              </label>
                              <div class="flex gap-2">
                                <input
                                  type="text"
                                  value={formatColor(localTemplate.templateClub.clubNameColor)}
                                  on:input={handleColorInput('templateClub.clubNameColor')}
                                  class="flex-1 p-3 rounded-lg bg-gray-800 border font-mono text-sm touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  placeholder="#FFFFFF"
                                />
                                <input
                                  type="color"
                                  value={formatColor(localTemplate.templateClub.clubNameColor)}
                                  on:input={handleColorInput('templateClub.clubNameColor')}
                                  class="w-14 h-12 rounded-lg border cursor-pointer touch-manipulation"
                                  style="border-color: {$colorStore.primary}30;"
                                />
                              </div>
                            </div>

                            <!-- Club Name Font Size -->
                            <div>
                              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                                Font Size: {localTemplate.templateClub.clubNameFontSize}px
                              </label>
                              <input
                                type="range"
                                bind:value={localTemplate.templateClub.clubNameFontSize}
                                on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                                min="10"
                                max="100"
                                class="w-full h-3 rounded-lg appearance-none cursor-pointer touch-manipulation"
                              />
                            </div>

                            <!-- Club Name Position -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position X</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateClub.clubNameX}
                                  on:input={() => handleChange('templateClub.clubNameX', localTemplate.templateClub.clubNameX)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position Y</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateClub.clubNameY}
                                  on:input={() => handleChange('templateClub.clubNameY', localTemplate.templateClub.clubNameY)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>
                          </div>
                        {/if}

                        <!-- Club Icon -->
                        <div class="flex items-center justify-between p-4 rounded-lg" 
                             style="background: {$colorStore.secondary}10;">
                          <div>
                            <p class="font-medium" style="color: {$colorStore.text}">Club Icon</p>
                            <p class="text-sm" style="color: {$colorStore.muted}">Show club icon</p>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer touch-manipulation">
                            <input
                              type="checkbox"
                              class="sr-only peer"
                              checked={localTemplate.templateClub.showClubIcon}
                              on:change={() => handleChange('templateClub.showClubIcon', !localTemplate.templateClub.showClubIcon)}
                            />
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                 style="peer-checked:bg-color: {$colorStore.secondary};">
                            </div>
                          </label>
                        </div>

                        {#if localTemplate.templateClub.showClubIcon}
                          <div class="space-y-4" transition:slide>
                            <!-- Club Icon Size -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Width</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateClub.clubIconSizeX}
                                  on:input={() => handleChange('templateClub.clubIconSizeX', localTemplate.templateClub.clubIconSizeX)}
                                  min="10"
                                  max="200"
                                  class="w-full touch-manipulation"
                                />
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateClub.clubIconSizeX}
                                  on:input={() => handleChange('templateClub.clubIconSizeX', localTemplate.templateClub.clubIconSizeX)}
                                  class="w-full p-2 mt-1 rounded-lg bg-gray-800 border text-sm touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Height</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateClub.clubIconSizeY}
                                  on:input={() => handleChange('templateClub.clubIconSizeY', localTemplate.templateClub.clubIconSizeY)}
                                  min="10"
                                  max="200"
                                  class="w-full touch-manipulation"
                                />
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateClub.clubIconSizeY}
                                  on:input={() => handleChange('templateClub.clubIconSizeY', localTemplate.templateClub.clubIconSizeY)}
                                  class="w-full p-2 mt-1 rounded-lg bg-gray-800 border text-sm touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>

                            <!-- Club Icon Position -->
                            <div class="grid grid-cols-2 gap-3">
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position X</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateClub.clubIconX}
                                  on:input={() => handleChange('templateClub.clubIconX', localTemplate.templateClub.clubIconX)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                              <div>
                                <label class="block text-sm mb-1" style="color: {$colorStore.muted}">Position Y</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateClub.clubIconY}
                                  on:input={() => handleChange('templateClub.clubIconY', localTemplate.templateClub.clubIconY)}
                                  class="w-full p-3 rounded-lg bg-gray-800 border touch-manipulation"
                                  style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                />
                              </div>
                            </div>
                          </div>
                        {/if}
                      </div>

                    {:else}
                      <!-- Placeholder for future panels -->
                      <div class="text-center py-8">
                        <p style="color: {$colorStore.muted}">
                          {panel.title} settings will be implemented here
                        </p>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Mobile Action Bar -->
    {#if changedSettings.has('template')}
      <div 
        class="flex gap-3 p-4 bg-gray-800 border-t border-gray-700 safe-area-inset-bottom"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20);"
        transition:slide
      >
        <button
          class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 touch-manipulation"
          style="background: {$colorStore.accent}30; color: {$colorStore.accent};"
          on:click={handleReset}
          aria-label="Reset changes"
        >
          <RotateCcw size={20} />
          <span>Reset</span>
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 touch-manipulation"
          style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary}); color: white;"
          on:click={handleSave}
          aria-label="Save changes"
        >
          <Save size={20} />
          <span>Save</span>
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-center h-64">
    <p style="color: {$colorStore.muted}">No template data available</p>
  </div>
{/if}

<style lang="postcss">
  .touch-manipulation {
    touch-action: manipulation;
  }
  
  .safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Custom range slider styling for mobile */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: #374151;
    height: 6px;
    border-radius: 3px;
    cursor: pointer;
    outline: none;
  }

  input[type="range"]::-webkit-slider-track {
    -webkit-appearance: none;
    appearance: none;
    background: #374151;
    height: 6px;
    border-radius: 3px;
    border: none;
    outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    margin-top: -7px; /* Center the thumb on the track */
  }

  input[type="range"]::-moz-range-track {
    background: #374151;
    height: 6px;
    border-radius: 3px;
    border: none;
    outline: none;
  }

  input[type="range"]::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: none; /* Remove default border */
  }

  /* Firefox specific fixes */
  input[type="range"]::-moz-range-progress {
    background: #3b82f6;
    height: 6px;
    border-radius: 3px;
  }

  /* Edge/IE specific */
  input[type="range"]::-ms-track {
    background: #374151;
    height: 6px;
    border-radius: 3px;
    border: none;
    color: transparent;
  }

  input[type="range"]::-ms-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Improve touch targets on mobile */
  @media (pointer: coarse) {
    button, input, select {
      min-height: 44px;
      min-width: 44px;
    }
    
    .touch-manipulation {
      touch-action: manipulation;
    }
  }

  /* Custom scrollbar for mobile */
  :global(::-webkit-scrollbar) {
    width: 4px;
  }
  
  :global(::-webkit-scrollbar-track) {
    background: #1f2937;
  }
  
  :global(::-webkit-scrollbar-thumb) {
    background: #4b5563;
    border-radius: 2px;
  }
  
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #6b7280;
  }
</style>