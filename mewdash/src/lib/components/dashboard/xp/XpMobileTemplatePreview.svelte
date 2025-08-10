<!-- XpMobileTemplatePreview.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { Move, ZoomIn, ZoomOut, RotateCcw } from "lucide-svelte";

  const dispatch = createEventDispatcher();

  // Props
  export let template: any;
  export let userData: any;
  export let scale = 1;
  export let showGrid = false;
  export let gridSize = 20;
  export let isDesignMode = false;
  export let selectedElement: any = null;
  export let viewMode: "preview" | "edit" | "fullscreen" = "preview";
  export let touchZoomEnabled = true;
  export let panEnabled = true;

  // Mobile preview state
  let canvasRef: HTMLCanvasElement;
  let containerRef: HTMLDivElement;
  let ctx: CanvasRenderingContext2D;
  let animationFrame: number;
  let isInitialized = false;

  // Touch interaction state
  let touchState = {
    isActive: false,
    startDistance: 0,
    startScale: 1,
    startPos: { x: 0, y: 0 },
    lastPos: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
    isPanning: false,
    isZooming: false,
    longPressTimer: null as number | null,
    tapStartTime: 0
  };

  // Pan and zoom state
  let panOffset = { x: 0, y: 0 };
  let minScale = 0.1;
  let maxScale = 5;

  // Canvas dimensions
  let canvasWidth = template?.outputSizeX || 800;
  let canvasHeight = template?.outputSizeY || 280;

  // Responsive canvas sizing
  $: containerWidth = viewMode === "fullscreen" ? window.innerWidth : 
                    typeof window !== "undefined" ? Math.min(window.innerWidth - 40, 800) : 800;
  $: containerHeight = viewMode === "fullscreen" ? window.innerHeight : 
                      typeof window !== "undefined" ? Math.min(window.innerHeight - 200, 600) : 600;

  // Touch event handlers
  function handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    touchState.isActive = true;
    touchState.tapStartTime = Date.now();

    if (e.touches.length === 1) {
      // Single touch - potential pan or tap
      const touch = e.touches[0];
      touchState.startPos = { x: touch.clientX, y: touch.clientY };
      touchState.lastPos = { x: touch.clientX, y: touch.clientY };
      
      // Start long press timer for element selection
      if (isDesignMode) {
        touchState.longPressTimer = window.setTimeout(() => {
          const rect = canvasRef.getBoundingClientRect();
          const canvasX = (touch.clientX - rect.left - panOffset.x) / scale;
          const canvasY = (touch.clientY - rect.top - panOffset.y) / scale;
          
          const element = getElementAtPosition(canvasX, canvasY);
          if (element) {
            dispatch('elementSelected', { element, position: { x: canvasX, y: canvasY } });
            navigator.vibrate?.(50); // Haptic feedback
          }
        }, 500);
      }
    } else if (e.touches.length === 2 && touchZoomEnabled) {
      // Two touches - zoom
      touchState.isZooming = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      touchState.startDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      touchState.startScale = scale;
      touchState.center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
      
      // Clear long press timer
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
        touchState.longPressTimer = null;
      }
    }
  }

  function handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    
    if (!touchState.isActive) return;

    if (e.touches.length === 1 && !touchState.isZooming) {
      // Single touch pan
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchState.lastPos.x;
      const deltaY = touch.clientY - touchState.lastPos.y;
      
      // Check if we've moved enough to be considered a pan
      const totalDelta = Math.hypot(
        touch.clientX - touchState.startPos.x,
        touch.clientY - touchState.startPos.y
      );
      
      if (totalDelta > 10) {
        touchState.isPanning = true;
        // Clear long press timer
        if (touchState.longPressTimer) {
          clearTimeout(touchState.longPressTimer);
          touchState.longPressTimer = null;
        }
        
        if (panEnabled) {
          panOffset.x += deltaX;
          panOffset.y += deltaY;
          constrainPan();
        }
      }
      
      touchState.lastPos = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2 && touchZoomEnabled) {
      // Two touch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scaleChange = currentDistance / touchState.startDistance;
      const newScale = Math.max(minScale, Math.min(maxScale, touchState.startScale * scaleChange));
      
      if (newScale !== scale) {
        const rect = canvasRef.getBoundingClientRect();
        const centerX = touchState.center.x - rect.left;
        const centerY = touchState.center.y - rect.top;
        
        // Zoom around touch center
        const scaleDiff = newScale - scale;
        panOffset.x -= (centerX - panOffset.x) * scaleDiff / scale;
        panOffset.y -= (centerY - panOffset.y) * scaleDiff / scale;
        
        scale = newScale;
        constrainPan();
        dispatch('scaleChanged', { scale });
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    e.preventDefault();
    
    const tapDuration = Date.now() - touchState.tapStartTime;
    
    // Handle tap (short touch without pan)
    if (!touchState.isPanning && !touchState.isZooming && tapDuration < 300) {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const rect = canvasRef.getBoundingClientRect();
        const canvasX = (touch.clientX - rect.left - panOffset.x) / scale;
        const canvasY = (touch.clientY - rect.top - panOffset.y) / scale;
        
        if (isDesignMode) {
          const element = getElementAtPosition(canvasX, canvasY);
          dispatch('elementTapped', { element, position: { x: canvasX, y: canvasY } });
        } else {
          dispatch('canvasTapped', { position: { x: canvasX, y: canvasY } });
        }
      }
    }
    
    // Clear long press timer
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
      touchState.longPressTimer = null;
    }
    
    // Reset touch state
    touchState.isActive = false;
    touchState.isPanning = false;
    touchState.isZooming = false;
  }

  function constrainPan() {
    const maxPanX = Math.max(0, (canvasWidth * scale - containerWidth) / 2);
    const maxPanY = Math.max(0, (canvasHeight * scale - containerHeight) / 2);
    
    panOffset.x = Math.max(-maxPanX, Math.min(maxPanX, panOffset.x));
    panOffset.y = Math.max(-maxPanY, Math.min(maxPanY, panOffset.y));
  }

  function getElementAtPosition(x: number, y: number): any {
    // Check each template element to see if coordinates are within bounds
    const elements = [];
    
    // Add template elements based on actual structure
    if (template.templateUser?.showText) {
      elements.push({
        type: 'user-text',
        x: template.templateUser.textX,
        y: template.templateUser.textY,
        width: 100, // Approximate width
        height: template.templateUser.fontSize || 20
      });
    }
    
    if (template.templateUser?.showIcon) {
      elements.push({
        type: 'user-icon',
        x: template.templateUser.iconX,
        y: template.templateUser.iconY,
        width: template.templateUser.iconSizeX,
        height: template.templateUser.iconSizeY
      });
    }
    
    if (template.templateBar?.showBar) {
      elements.push({
        type: 'progress-bar',
        x: Math.min(template.templateBar.barPointAx, template.templateBar.barPointBx),
        y: Math.min(template.templateBar.barPointAy, template.templateBar.barPointBy),
        width: Math.abs(template.templateBar.barPointBx - template.templateBar.barPointAx),
        height: Math.abs(template.templateBar.barPointBy - template.templateBar.barPointAy) + (template.templateBar.barWidth || 4)
      });
    }
    
    for (const element of elements) {
      if (x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height) {
        return element;
      }
    }
    return null;
  }

  function resetView() {
    scale = 1;
    panOffset = { x: 0, y: 0 };
    dispatch('scaleChanged', { scale });
  }

  function zoomIn() {
    const newScale = Math.min(maxScale, scale * 1.2);
    if (newScale !== scale) {
      scale = newScale;
      constrainPan();
      dispatch('scaleChanged', { scale });
    }
  }

  function zoomOut() {
    const newScale = Math.max(minScale, scale / 1.2);
    if (newScale !== scale) {
      scale = newScale;
      constrainPan();
      dispatch('scaleChanged', { scale });
    }
  }

  function drawCanvas() {
    if (!ctx || !isInitialized) {
      console.log('Canvas not ready:', { ctx: !!ctx, isInitialized, canvasRef: !!canvasRef });
      return;
    }
    
    if (!template) {
      console.log('No template available');
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = `${$colorStore.primary}20`;
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }

    // Draw template elements
    drawTemplateElements();

    // Draw selection outline
    if (selectedElement && isDesignMode) {
      drawSelectionOutline(selectedElement);
    }
  }

  function drawTemplateElements() {
    if (!template || !ctx) return;

    // Draw user info
    if (template.templateUser) {
      drawUserElement(template.templateUser);
    }

    // Draw progress bar
    if (template.templateBar?.showBar) {
      drawProgressBar(template.templateBar);
    }

    // Draw guild info
    if (template.templateGuild) {
      drawGuildElement(template.templateGuild);
    }

    // Draw time info
    if (template.showTimeOnLevel) {
      drawTimeElement(template);
    }

    // Draw club info
    if (template.templateClub) {
      drawClubElement(template.templateClub);
    }
  }

  function drawUserElement(element: any) {
    if (!ctx) return;

    // Draw user icon
    if (element.showIcon) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(element.iconX || 10, element.iconY || 10, element.iconSizeX || 64, element.iconSizeY || 64);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      const iconX = (element.iconX || 10) + (element.iconSizeX || 64) / 2;
      const iconY = (element.iconY || 10) + (element.iconSizeY || 64) / 2 + 7;
      ctx.fillText('👤', iconX, iconY);
    }

    // Draw user text
    if (element.showText) {
      // Handle color format: FF000000 -> #000000 (remove alpha prefix)
      const color = element.textColor && element.textColor.length === 8 
        ? `#${element.textColor.slice(2)}` 
        : element.textColor || '#ffffff';
      ctx.fillStyle = color;
      ctx.font = `${element.fontSize || 16}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(userData?.username || 'Sample User', element.textX || 80, element.textY || 30);
    }
  }

  function drawProgressBar(element: any) {
    if (!ctx) return;

    // Calculate bar dimensions
    const x = Math.min(element.barPointAx, element.barPointBx);
    const y = Math.min(element.barPointAy, element.barPointBy);
    const width = Math.abs(element.barPointBx - element.barPointAx);
    const height = element.barWidth || 20;
    
    // Draw background
    ctx.fillStyle = '#374151';
    ctx.fillRect(x, y, width, height);
    
    // Draw progress (sample 70%)
    const progress = 0.7;
    const barColor = element.barColor && element.barColor.length === 8 
      ? `#${element.barColor.slice(2)}` 
      : element.barColor || '#3b82f6';
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, width * progress, height);
    
    // Draw progress text
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${userData?.level || 5} - 70%`, x + width / 2, y + height / 2 + 5);
  }

  function drawGuildElement(element: any) {
    if (!ctx) return;

    // Draw guild level if enabled
    if (element.showGuildLevel) {
      const levelColor = element.guildLevelColor && element.guildLevelColor.length === 8 
        ? `#${element.guildLevelColor.slice(2)}` 
        : element.guildLevelColor || '#ffffff';
      ctx.fillStyle = levelColor;
      ctx.font = `${element.guildLevelFontSize || 14}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Level 45', element.guildLevelX || 10, element.guildLevelY || 60);
    }
    
    // Draw guild rank if enabled
    if (element.showGuildRank) {
      const rankColor = element.guildRankColor && element.guildRankColor.length === 8 
        ? `#${element.guildRankColor.slice(2)}` 
        : element.guildRankColor || '#ffffff';
      ctx.fillStyle = rankColor;
      ctx.font = `${element.guildRankFontSize || 12}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Rank #23', element.guildRankX || 10, element.guildRankY || 40);
    }
  }

  function drawTimeElement(element: any) {
    if (!ctx) return;

    // Draw time text (template is the main template object)
    const timeColor = element.timeOnLevelColor && element.timeOnLevelColor.length === 8 
      ? `#${element.timeOnLevelColor.slice(2)}` 
      : element.timeOnLevelColor || '#ffffff';
    ctx.fillStyle = timeColor;
    ctx.font = `${element.timeOnLevelFontSize || 12}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('2d 5h 30m', element.timeOnLevelX || 10, element.timeOnLevelY || 140);
  }

  function drawClubElement(element: any) {
    if (!ctx) return;

    // Draw club name if enabled
    if (element.showClubName) {
      const clubColor = element.clubNameColor && element.clubNameColor.length === 8 
        ? `#${element.clubNameColor.slice(2)}` 
        : element.clubNameColor || '#ffffff';
      ctx.fillStyle = clubColor;
      ctx.font = `${element.clubNameFontSize || 14}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Elite Club', element.clubNameX || 10, element.clubNameY || 110);
    }
    
    // Draw club icon if enabled
    if (element.showClubIcon) {
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(element.clubIconX || 10, element.clubIconY || 120, element.clubIconSizeX || 32, element.clubIconSizeY || 32);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      const iconX = (element.clubIconX || 10) + (element.clubIconSizeX || 32) / 2;
      const iconY = (element.clubIconY || 120) + (element.clubIconSizeY || 32) / 2 + 5;
      ctx.fillText('🏆', iconX, iconY);
    }
  }

  function drawSelectionOutline(element: any) {
    if (!ctx) return;

    let x, y, width, height;
    
    // Determine element bounds based on type
    if (element.type === 'user-text') {
      x = element.x;
      y = element.y;
      width = element.width;
      height = element.height;
    } else if (element.type === 'user-icon') {
      x = element.x;
      y = element.y;
      width = element.width;
      height = element.height;
    } else if (element.type === 'progress-bar') {
      x = element.x;
      y = element.y;
      width = element.width;
      height = element.height;
    } else {
      return; // Unknown element type
    }
    
    ctx.strokeStyle = $colorStore.accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    ctx.setLineDash([]);

    // Draw resize handles
    const handleSize = 8;
    ctx.fillStyle = $colorStore.accent;
    
    // Corner handles
    ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(x + width - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(x - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(x + width - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);
  }

  // Removed continuous render loop - now only draws when needed
  

  onMount(() => {
    if (canvasRef) {
      ctx = canvasRef.getContext('2d');
      if (ctx) {
        canvasRef.width = canvasWidth;
        canvasRef.height = canvasHeight;
        isInitialized = true;
        // Draw once instead of continuous loop
        drawCanvas();
      }
    }
  });

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
    }
  });

  // Reactive updates
  $: if (template && canvasRef && ctx) {
    console.log('Reactive update: All conditions met, redrawing canvas.');
    canvasWidth = template.outputSizeX || 800;
    canvasHeight = template.outputSizeY || 280;
    canvasRef.width = canvasWidth;
    canvasRef.height = canvasHeight;
    drawCanvas();
  }
</script>

<div 
  class="relative w-full h-full overflow-hidden rounded-lg border bg-gray-900"
  style="border-color: {$colorStore.primary}30;"
  bind:this={containerRef}
>
  <!-- Mobile zoom controls -->
  {#if viewMode !== "fullscreen"}
    <div class="absolute top-2 right-2 z-10 flex gap-2">
      <button
        class="p-2 rounded-full backdrop-blur-sm transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px]"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
        on:click={zoomOut}
        disabled={scale <= minScale}
        aria-label="Zoom out"
      >
        <ZoomOut class="w-4 h-4" />
      </button>
      <button
        class="p-2 rounded-full backdrop-blur-sm transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px]"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
        on:click={zoomIn}
        disabled={scale >= maxScale}
        aria-label="Zoom in"
      >
        <ZoomIn class="w-4 h-4" />
      </button>
      <button
        class="p-2 rounded-full backdrop-blur-sm transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px]"
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
        on:click={resetView}
        aria-label="Reset view"
      >
        <RotateCcw class="w-4 h-4" />
      </button>
    </div>
  {/if}

  <!-- Scale indicator -->
  {#if scale !== 1}
    <div 
      class="absolute top-2 left-2 z-10 px-3 py-1 rounded-full backdrop-blur-sm text-sm font-medium"
      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
    >
      {Math.round(scale * 100)}%
    </div>
  {/if}

  <!-- Preview container with proper padding -->
  <div class="relative w-full h-full flex items-center justify-center p-4">
    <div 
      class="relative flex items-center justify-center"
      style="transform: translate({panOffset.x}px, {panOffset.y}px);"
    >
      <canvas
        bind:this={canvasRef}
        class="border border-gray-700 rounded-lg touch-none shadow-lg"
        style="transform: scale({scale}); 
               transform-origin: center;
               max-width: none;
               max-height: none;"
        on:touchstart={handleTouchStart}
        on:touchmove|preventDefault={handleTouchMove}
        on:touchend={handleTouchEnd}
      />
    </div>
  </div>

  <!-- Touch instructions overlay -->
  {#if !touchState.isActive && viewMode === "edit"}
    <div class="absolute bottom-4 left-4 right-4 z-10">
      <div 
        class="p-3 rounded-lg backdrop-blur-sm text-sm text-center"
        style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
      >
        <p>Tap to select • Drag to pan • Pinch to zoom</p>
        {#if isDesignMode}
          <p class="mt-1 text-xs">Long press to select elements</p>
        {/if}
      </div>
    </div>
  {/if}
</div>