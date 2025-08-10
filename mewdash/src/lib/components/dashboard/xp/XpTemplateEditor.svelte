<!-- XpTemplateEditor.svelte -->
<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import XpTemplatePreview from "./XpTemplatePreview.svelte";
  import Portal from "$lib/components/ui/Portal.svelte";
  import {
    AlignCenter,
    AlertCircle,
    Award,
    BarChart3 as BarChart,
    ChevronDown,
    Clock,
    Database,
    Grid,
    Image,
    Maximize2,
    Minimize2,
    Move,
    Settings,
    Type,
    User,
    Users,
    ZoomIn,
    ZoomOut,
    RotateCcw,
  } from "lucide-svelte";

  // Props
  export let localTemplate: any;
  export let changedSettings: Set<string>;
  export let isMobile: boolean;
  export let currentUserData: any;
  export let sampleData: any;

  // Template editor state
  let editorActiveTab = "general";
  let editorMobileView = "preview";
  let showGrid = false;
  let gridSize = 20;
  let showGuideLines = false;
  let guideLinesPos = { x: null, y: null };
  let draggableElements: any[] = [];
  let isDesignMode = false;
  let draggingElement: any = null;
  let hoverElement: any = null;
  let showRealDataPreview = false;
  let showTooltips = true;
  let showCoordinateOverlay = true;
  let undoStack: string[] = [];
  let previewScale = 1.0;
  let previewWidth = 800;
  let previewHeight = 280;
  let previewOffset = { x: 0, y: 0 };
  let previewBackgroundUrl: string | null = null;
  let imageUrl = "";
  let imageLoading = false;
  let imageError = "";
  let updateSizeFromImage = false;
  let previewContainerRef: HTMLDivElement;
  
  // Responsive layout state
  let isDesktop = false;
  let isTablet = false;
  let expandedCategories = new Set(["canvas"]); // Canvas expanded by default
  
  // Settings categories for accordion layout
  const settingsCategories = [
    { id: "canvas", label: "Canvas & Background", icon: AlignCenter },
    { id: "user", label: "User Elements", icon: User },
    { id: "progress", label: "Progress Bar", icon: BarChart },
    { id: "guild", label: "Guild Information", icon: Users },
    { id: "time", label: "Time Display", icon: Clock },
    { id: "club", label: "Club Features", icon: Award }
  ];
  
  // Drag state
  let dragStartPos = { x: 0, y: 0 };
  let dragStartElementPos = { x: 0, y: 0 };
  let lastDragUpdate = 0;
  const THROTTLE_MS = 16;
  let dragAnimationFrameId: number | null = null;
  let isDragging = false;
  let snapToGrid = false;
  let showSnapping = false;
  let isFullPageMode = false;

  // Responsive helper functions
  function checkScreenSize() {
    if (browser) {
      const width = window.innerWidth;
      isDesktop = width >= 1024;
      isTablet = width >= 768 && width < 1024;
    }
  }

  function toggleCategory(categoryId: string) {
    if (expandedCategories.has(categoryId)) {
      expandedCategories.delete(categoryId);
    } else {
      expandedCategories.add(categoryId);
    }
    expandedCategories = expandedCategories; // Trigger reactivity
  }

  // Enhanced zoom functions with instant cursor-based zooming (no animation)
  function instantZoom(targetScale: number, centerX?: number, centerY?: number) {
    const oldScale = previewScale;
    previewScale = targetScale;

    // If cursor position is provided, adjust offset to keep zoom point stable
    if (centerX !== undefined && centerY !== undefined && previewContainerRef) {
      const rect = previewContainerRef.getBoundingClientRect();
      const containerCenterX = rect.width / 2;
      const containerCenterY = rect.height / 2;
      
      // Calculate the point we want to zoom into relative to container center
      const pointX = centerX - containerCenterX;
      const pointY = centerY - containerCenterY;
      
      // Calculate new offset to keep the zoom point stable
      const scaleDiff = targetScale - oldScale;
      previewOffset.x = previewOffset.x - (pointX * scaleDiff) / oldScale;
      previewOffset.y = previewOffset.y - (pointY * scaleDiff) / oldScale;
      
      // Constrain pan limits
      previewOffset.x = Math.max(-2000, Math.min(2000, previewOffset.x));
      previewOffset.y = Math.max(-2000, Math.min(2000, previewOffset.y));
      previewOffset = { ...previewOffset }; // Trigger reactivity
    }
  }

  function zoomIn(amount = 0.15, centerX?: number, centerY?: number) {
    const targetScale = Math.min(previewScale + amount, 3.0);
    instantZoom(targetScale, centerX, centerY);
  }

  function zoomOut(amount = 0.15, centerX?: number, centerY?: number) {
    const targetScale = Math.max(previewScale - amount, 0.1);
    instantZoom(targetScale, centerX, centerY);
  }

  function panHorizontal(deltaX: number) {
    previewOffset.x = Math.max(-2000, Math.min(2000, previewOffset.x + deltaX));
    previewOffset = { ...previewOffset }; // Trigger reactivity
  }

  function panVertical(deltaY: number) {
    previewOffset.y = Math.max(-2000, Math.min(2000, previewOffset.y + deltaY));
    previewOffset = { ...previewOffset }; // Trigger reactivity
  }

  // Mouse wheel handler for zoom and pan
  function handleWheel(event: WheelEvent) {
    // Only handle wheel events when in full page mode or when the preview container is focused
    if (!isFullPageMode && !previewContainerRef?.contains(event.target as Node)) {
      return;
    }

    event.preventDefault();
    
    const zoomSpeed = 0.0008;
    const panSpeed = 0.5;
    
    if (event.ctrlKey || event.metaKey) {
      // Zoom with Ctrl/Cmd + scroll - zoom toward cursor
      const rect = previewContainerRef.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;
      
      const zoomDelta = -event.deltaY * zoomSpeed;
      if (zoomDelta > 0) {
        zoomIn(Math.abs(zoomDelta), cursorX, cursorY);
      } else {
        zoomOut(Math.abs(zoomDelta), cursorX, cursorY);
      }
    } else if (event.shiftKey) {
      // Horizontal pan with Shift + scroll
      panHorizontal(-event.deltaY * panSpeed);
    } else {
      // Vertical pan with normal scroll
      panVertical(-event.deltaY * panSpeed);
    }
  }

  // Keyboard shortcuts handler
  function handleKeydown(event: KeyboardEvent) {
    if (browser) {
      // Toggle design mode with 'D' key
      if (event.key === 'd' || event.key === 'D') {
        if (!event.ctrlKey && !event.altKey && !event.metaKey) {
          const target = event.target as HTMLElement;
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            isDesignMode = !isDesignMode;
          }
        }
      }
      
      // Toggle full page mode with 'F' key
      if (event.key === 'f' || event.key === 'F') {
        if (!event.ctrlKey && !event.altKey && !event.metaKey) {
          const target = event.target as HTMLElement;
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            isFullPageMode = !isFullPageMode;
          }
        }
      }
      
      // Exit full page mode with Escape
      if (event.key === 'Escape') {
        if (isFullPageMode) {
          event.preventDefault();
          isFullPageMode = false;
        }
      }
      
      // Toggle grid with 'G' key
      if (event.key === 'g' || event.key === 'G') {
        if (!event.ctrlKey && !event.altKey && !event.metaKey) {
          const target = event.target as HTMLElement;
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            showGrid = !showGrid;
          }
        }
      }

      // Reset zoom with 'R' key
      if (event.key === 'r' || event.key === 'R') {
        if (!event.ctrlKey && !event.altKey && !event.metaKey) {
          const target = event.target as HTMLElement;
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            resetZoom();
          }
        }
      }

      // Zoom shortcuts
      if (event.key === '=' || event.key === '+') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          zoomIn(0.2);
        }
      }
      
      if (event.key === '-' || event.key === '_') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          zoomOut(0.2);
        }
      }
      
      if (event.key === '0') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          resetZoom();
        }
      }
    }
  }

  // Direction options for bar direction dropdown
  const directions = [
    { value: 0, label: "Left to Right" },
    { value: 1, label: "Right to Left" },
    { value: 2, label: "Top to Bottom" },
    { value: 3, label: "Bottom to Top" }
  ];

  // Editor tabs configuration
  const editorTabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "user", label: "User", icon: User },
    { id: "bar", label: "Progress", icon: BarChart },
    { id: "guild", label: "Guild", icon: Users },
    { id: "time", label: "Time", icon: Clock },
    { id: "club", label: "Club", icon: Award }
  ];

  // Event handlers
  function handleChange(property: string, value: any) {
    const keys = property.split('.');
    let obj = localTemplate;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    changedSettings.add("template");
  }

  function handleColorInput(property: string) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      let value = target.value;
      if (!value.startsWith('#')) value = '#' + value;
      handleChange(property, value);
    };
  }

  function handleInputFocus(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
  }

  function formatColor(colorString: string): string {
    if (!colorString) return "#ffffff";
    if (colorString.startsWith('#')) return colorString;
    return `#${colorString}`;
  }

  function calculateProgressPosition(): { x: number; y: number } {
    if (!localTemplate?.templateBar) return { x: 0, y: 0 };
    
    const startX = localTemplate.templateBar.barPointAx;
    const startY = localTemplate.templateBar.barPointAy;
    const endX = localTemplate.templateBar.barPointBx;
    const endY = localTemplate.templateBar.barPointBy;

    // Calculate the point at the percentage position (using real or sample data)
    const progressValue = (showRealDataPreview && currentUserData) ?
      currentUserData.progress : sampleData.progress;
    const progress = progressValue / 100;

    const x = startX + (endX - startX) * progress;
    const y = startY + (endY - startY) * progress;

    return { x, y };
  }

  function undo() {
    if (undoStack.length > 0) {
      // Implementation for undo functionality would go here
    }
  }

  function resetZoom() {
    previewScale = 1.0;
    previewOffset = { x: 0, y: 0 };
  }

  // Apply snap to grid
  function applySnapToGrid(x: number, y: number) {
    if (!snapToGrid) return { x, y };

    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }

  // Start dragging an element
  function startDrag(event: MouseEvent | TouchEvent, element: any) {
    if (!isDesignMode) return;

    // Prevent default to avoid triggering other events
    event.preventDefault();
    event.stopPropagation();

    draggingElement = element;
    // Get initial pointer position
    const clientX = event.type.includes("mouse")
      ? (event as MouseEvent).clientX
      : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
        ? (event as TouchEvent).touches[0].clientX : 0;

    const clientY = event.type.includes("mouse")
      ? (event as MouseEvent).clientY
      : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
        ? (event as TouchEvent).touches[0].clientY : 0;

    dragStartPos = {
      x: clientX,
      y: clientY
    };

    // Get initial element position
    dragStartElementPos = {
      x: element.getX(),
      y: element.getY()
    };

    // Show coordinate overlay during drag
    showCoordinateOverlay = true;

    document.body.classList.add("dragging-active");

    // Add event listeners for drag movement and end
    window.addEventListener("mousemove", handleDragMove, { passive: false });
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    // Only update UI once to show initial drag state
    localTemplate = { ...localTemplate };
  }

  // Handle drag movement
  function handleDragMove(event: MouseEvent | TouchEvent) {
    if (!draggingElement) return;

    // Prevent default behaviors
    event.preventDefault();
    event.stopPropagation();

    // Throttle event handling
    const now = Date.now();
    if (now - lastDragUpdate < THROTTLE_MS) return;
    lastDragUpdate = now;

    // Cancel any existing animation frame to prevent queuing
    if (dragAnimationFrameId) {
      cancelAnimationFrame(dragAnimationFrameId);
    }

    dragAnimationFrameId = requestAnimationFrame(() => {
      // Get current pointer position
      const clientX = event.type.includes("mouse")
        ? (event as MouseEvent).clientX
        : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
          ? (event as TouchEvent).touches[0].clientX : 0;

      const clientY = event.type.includes("mouse")
        ? (event as MouseEvent).clientY
        : (event as TouchEvent).touches && (event as TouchEvent).touches[0]
          ? (event as TouchEvent).touches[0].clientY : 0;

      // Calculate the difference in position, accounting for preview scale
      const deltaX = (clientX - dragStartPos.x) / previewScale;
      const deltaY = (clientY - dragStartPos.y) / previewScale;

      // Calculate new element position
      let newX = dragStartElementPos.x + deltaX;
      let newY = dragStartElementPos.y + deltaY;

      // Apply snapping if enabled
      if (snapToGrid) {
        const snapped = applySnapToGrid(newX, newY);
        newX = snapped.x;
        newY = snapped.y;
      } else if (showSnapping) {
        const snapResult = calculateSimplifiedSnapLines(draggingElement, newX, newY);

        if (snapResult.snapX !== null) {
          newX = snapResult.snapX;
          guideLinesPos.x = snapResult.snapX;
        } else {
          guideLinesPos.x = null;
        }

        if (snapResult.snapY !== null) {
          newY = snapResult.snapY;
          guideLinesPos.y = snapResult.snapY;
        } else {
          guideLinesPos.y = null;
        }

        // Show guidelines during snapping
        showGuideLines = (guideLinesPos.x !== null || guideLinesPos.y !== null);
      }

      // Update element position
      draggingElement.setPos(newX, newY);

      // Only update the UI elements we actually need for visual feedback during drag
      if (localTemplate && draggingElement) {
        // Force Svelte to update just what we need
        localTemplate = { ...localTemplate };
      }
    });
  }

  // End dragging
  function endDrag() {
    // Cancel any pending animation frame
    if (dragAnimationFrameId) {
      cancelAnimationFrame(dragAnimationFrameId);
      dragAnimationFrameId = null;
    }

    document.body.classList.remove("dragging-active");

    draggingElement = null;
    isDragging = false;
    showCoordinateOverlay = false;
    showGuideLines = false;

    // Remove event listeners
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("touchend", endDrag);

    // One final update to ensure the UI is in sync
    localTemplate = { ...localTemplate };
  }

  function calculateSimplifiedSnapLines(currentElement: any, x: number, y: number) {
    const snapDistance = 5; // Distance in pixels to trigger snapping
    let snapX = null;
    let snapY = null;

    // Center of the canvas
    const canvasCenterX = localTemplate.outputSizeX / 2;
    const canvasCenterY = localTemplate.outputSizeY / 2;

    // Quick checks for basic alignment points

    // Canvas center
    if (Math.abs(x - canvasCenterX) < snapDistance) snapX = canvasCenterX;
    if (Math.abs(y - canvasCenterY) < snapDistance) snapY = canvasCenterY;

    // Canvas edges
    if (Math.abs(x) < snapDistance) snapX = 0;
    if (Math.abs(y) < snapDistance) snapY = 0;
    if (Math.abs(x - localTemplate.outputSizeX) < snapDistance) snapX = localTemplate.outputSizeX;
    if (Math.abs(y - localTemplate.outputSizeY) < snapDistance) snapY = localTemplate.outputSizeY;

    // Only check other elements if we haven't found a snap yet
    if (snapX === null || snapY === null) {
      // Check only visible elements that aren't the current one
      const visibleElements = draggableElements.filter(element =>
        element !== currentElement && element.isVisible()
      );

      const limitedElements = visibleElements.slice(0, 5);

      for (const element of limitedElements) {
        const elementX = element.getX();
        const elementY = element.getY();

        // Only check for X alignment if we haven't found one yet
        if (snapX === null && Math.abs(x - elementX) < snapDistance) {
          snapX = elementX;
        }

        // Only check for Y alignment if we haven't found one yet
        if (snapY === null && Math.abs(y - elementY) < snapDistance) {
          snapY = elementY;
        }

        // If we've found both alignments, we can stop
        if (snapX !== null && snapY !== null) break;
      }
    }

    return { snapX, snapY };
  }

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
        previewWidth = img.width;
        previewHeight = img.height;
      }
      imageLoading = false;
    };
    img.onerror = () => {
      imageError = "Failed to load image";
      imageLoading = false;
    };
    img.src = imageUrl;
  }

  // Function to calculate preview scale
  function updatePreviewScale() {
    if (localTemplate && previewContainerRef) {
      previewWidth = localTemplate.outputSizeX || 800;
      previewHeight = localTemplate.outputSizeY || 280;
      
      // Calculate scale to fit in container
      const containerRect = previewContainerRef.getBoundingClientRect();
      const containerWidth = containerRect.width - 32; // Account for padding
      const containerHeight = containerRect.height - 32;
      
      const scaleX = containerWidth / previewWidth;
      const scaleY = containerHeight / previewHeight;
      previewScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      console.log("XpTemplateEditor - preview scale updated:", previewScale);
    }
  }

  // Initialize preview dimensions and scale
  $: if (localTemplate) {
    console.log("XpTemplateEditor - localTemplate updated:", localTemplate);
    updatePreviewScale();
  }

  // Update scale on window resize
  let resizeTimeout: number;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(updatePreviewScale, 100);
  }

  // Draggable elements configuration
  $: draggableElements = localTemplate ? [
    {
      id: "username",
      label: "Username",
      getX: () => localTemplate?.templateUser?.textX || 0,
      getY: () => localTemplate?.templateUser?.textY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateUser.textX", Math.round(x));
        handleChange("templateUser.textY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateUser?.showText,
      getWidth: () => {
        // Estimate text width based on font size
        const fontSize = localTemplate?.templateUser?.fontSize || 20;
        return fontSize * 6; // Rough estimate of text width
      },
      getHeight: () => localTemplate?.templateUser?.fontSize || 20,
      color: "#3B82F6",
      tooltip: "Username text position"
    },
    {
      id: "userAvatar",
      label: "User Avatar",
      getX: () => localTemplate?.templateUser?.iconX || 0,
      getY: () => localTemplate?.templateUser?.iconY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateUser.iconX", Math.round(x));
        handleChange("templateUser.iconY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateUser?.showIcon,
      getWidth: () => localTemplate?.templateUser?.iconSizeX || 50,
      getHeight: () => localTemplate?.templateUser?.iconSizeY || 50,
      color: "#10B981",
      tooltip: "User avatar position and size"
    },
    {
      id: "guildLevel",
      label: "Guild Level",
      getX: () => localTemplate?.templateGuild?.guildLevelX || 0,
      getY: () => localTemplate?.templateGuild?.guildLevelY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateGuild.guildLevelX", Math.round(x));
        handleChange("templateGuild.guildLevelY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateGuild?.showGuildLevel,
      getWidth: () => (localTemplate?.templateGuild?.guildLevelFontSize || 20) * 5,
      getHeight: () => localTemplate?.templateGuild?.guildLevelFontSize || 20,
      color: "#8B5CF6",
      tooltip: "Guild level text position"
    },
    {
      id: "guildRank",
      label: "Guild Rank",
      getX: () => localTemplate?.templateGuild?.guildRankX || 0,
      getY: () => localTemplate?.templateGuild?.guildRankY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateGuild.guildRankX", Math.round(x));
        handleChange("templateGuild.guildRankY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateGuild?.showGuildRank,
      getWidth: () => (localTemplate?.templateGuild?.guildRankFontSize || 20) * 4,
      getHeight: () => localTemplate?.templateGuild?.guildRankFontSize || 20,
      color: "#EC4899",
      tooltip: "Guild rank position"
    },
    {
      id: "timeOnLevel",
      label: "Time On Level",
      getX: () => localTemplate?.timeOnLevelX || 0,
      getY: () => localTemplate?.timeOnLevelY || 0,
      setPos: (x: number, y: number) => {
        handleChange("timeOnLevelX", Math.round(x));
        handleChange("timeOnLevelY", Math.round(y));
      },
      isVisible: () => localTemplate?.showTimeOnLevel,
      getWidth: () => (localTemplate?.timeOnLevelFontSize || 20) * 6,
      getHeight: () => localTemplate?.timeOnLevelFontSize || 20,
      color: "#F59E0B",
      tooltip: "Time on level display position"
    },
    {
      id: "clubName",
      label: "Club Name",
      getX: () => localTemplate?.templateClub?.clubNameX || 0,
      getY: () => localTemplate?.templateClub?.clubNameY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateClub.clubNameX", Math.round(x));
        handleChange("templateClub.clubNameY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateClub?.showClubName,
      getWidth: () => (localTemplate?.templateClub?.clubNameFontSize || 20) * 5,
      getHeight: () => localTemplate?.templateClub?.clubNameFontSize || 20,
      color: "#14B8A6",
      tooltip: "Club name text position"
    },
    {
      id: "clubIcon",
      label: "Club Icon",
      getX: () => localTemplate?.templateClub?.clubIconX || 0,
      getY: () => localTemplate?.templateClub?.clubIconY || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateClub.clubIconX", Math.round(x));
        handleChange("templateClub.clubIconY", Math.round(y));
      },
      isVisible: () => localTemplate?.templateClub?.showClubIcon,
      getWidth: () => localTemplate?.templateClub?.clubIconSizeX || 50,
      getHeight: () => localTemplate?.templateClub?.clubIconSizeY || 50,
      color: "#6366F1",
      tooltip: "Club icon position and size"
    },
    {
      id: "progressBarStart",
      label: "Progress Bar Start",
      getX: () => localTemplate?.templateBar?.barPointAx || 0,
      getY: () => localTemplate?.templateBar?.barPointAy || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateBar.barPointAx", Math.round(x));
        handleChange("templateBar.barPointAy", Math.round(y));
      },
      isVisible: () => localTemplate?.templateBar?.showBar,
      getWidth: () => 20,
      getHeight: () => 20,
      color: "#EF4444",
      tooltip: "Progress bar starting point"
    },
    {
      id: "progressBarEnd",
      label: "Progress Bar End",
      getX: () => localTemplate?.templateBar?.barPointBx || 0,
      getY: () => localTemplate?.templateBar?.barPointBy || 0,
      setPos: (x: number, y: number) => {
        handleChange("templateBar.barPointBx", Math.round(x));
        handleChange("templateBar.barPointBy", Math.round(y));
      },
      isVisible: () => localTemplate?.templateBar?.showBar,
      getWidth: () => 20,
      getHeight: () => 20,
      color: "#EF4444",
      tooltip: "Progress bar ending point"
    }
  ] : [];

  // Lifecycle hooks
  onMount(() => {
    if (typeof window !== 'undefined') {
      checkScreenSize();
      window.addEventListener('resize', handleResize);
      window.addEventListener('resize', checkScreenSize);
      window.addEventListener('keydown', handleKeydown);
      window.addEventListener('wheel', handleWheel, { passive: false });
      // Initial scale calculation after mount
      setTimeout(updatePreviewScale, 100);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('wheel', handleWheel);
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  });
</script>

{#if localTemplate}
  <div class="space-y-6">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <h2 class="text-2xl font-bold flex items-center gap-2" style="color: {$colorStore.text}">
        <Image size={24} style="color: {$colorStore.primary}" />
        XP Template Editor
      </h2>
      
      <!-- Controls only shown on mobile -->
      {#if isMobile}
        <div class="flex flex-wrap gap-2">
          <button
            class="px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm min-h-[44px]"
            class:ring-2={isDesignMode}
            style="background: {isDesignMode ? $colorStore.primary + '20' : $colorStore.secondary};
                   border: 1px solid {isDesignMode ? $colorStore.primary : $colorStore.primary + '30'};
                   ring-color: {$colorStore.primary}50;
                   color: {$colorStore.text};"
            on:click={() => isDesignMode = !isDesignMode}
            aria-label="Toggle design mode"
            aria-pressed={isDesignMode}
          >
            <Move size={16} />
            <span>Design</span>
          </button>
          
          <button
            class="px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm min-h-[44px]"
            class:ring-2={showRealDataPreview}
            style="background: {showRealDataPreview ? $colorStore.secondary + '20' : 'linear-gradient(135deg, ' + $colorStore.gradientStart + '15, ' + $colorStore.gradientMid + '20, ' + $colorStore.gradientEnd + '15)'};
                   border: 1px solid {showRealDataPreview ? $colorStore.secondary : $colorStore.secondary + '30'};
                   ring-color: {$colorStore.secondary}50;
                   color: {$colorStore.text};"
            on:click={() => showRealDataPreview = !showRealDataPreview}
            aria-label="Toggle real data preview"
            aria-pressed={showRealDataPreview}
          >
            <Database size={16} />
            <span>Data</span>
          </button>
          
          <button
            class="px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm min-h-[44px]"
            class:ring-2={showGrid}
            style="background: {showGrid ? $colorStore.accent + '20' : 'linear-gradient(135deg, ' + $colorStore.gradientMid + '10, ' + $colorStore.gradientEnd + '15)'};
                   border: 1px solid {showGrid ? $colorStore.accent : $colorStore.accent + '30'};
                   ring-color: {$colorStore.accent}50;
                   color: {$colorStore.text};"
            on:click={() => showGrid = !showGrid}
            aria-label="Toggle grid"
            aria-pressed={showGrid}
          >
            <Grid size={16} />
            <span>Grid</span>
          </button>
        </div>
      {/if}
    </div>


    {#if isMobile}
      <div class="mb-4 flex justify-center">
        <div class="bg-gray-800/50 rounded-lg p-1 inline-flex w-full max-w-md justify-center">
          <button
            class="flex-1 px-3 py-2 rounded-lg transition-all duration-200 mr-1 min-h-[44px] font-medium"
            class:bg-opacity-100={editorMobileView === 'preview'}
            style="background: {editorMobileView === 'preview' ? $colorStore.primary : 'transparent'};
                   color: {editorMobileView === 'preview' ? 'white' : $colorStore.text};"
            on:click={() => editorMobileView = 'preview'}
            aria-label="Show preview"
          >
            Preview
          </button>
          <button
            class="flex-1 px-3 py-2 rounded-lg transition-all duration-200 min-h-[44px] font-medium"
            class:bg-opacity-100={editorMobileView === 'controls'}
            style="background: {editorMobileView === 'controls' ? $colorStore.primary : 'transparent'};
                   color: {editorMobileView === 'controls' ? 'white' : $colorStore.text};"
            on:click={() => editorMobileView = 'controls'}
            aria-label="Show controls"
          >
            Settings
          </button>
        </div>
      </div>
    {/if}

    <!-- Full Page Mode Portal -->
    {#if isFullPageMode}
      <Portal>
        <div class="template-editor-fullpage" transition:fade={{ duration: 300 }}>
          <!-- Enhanced Preview Area -->
          <div class="preview-section-fullpage">
            <div class="preview-container">
              <!-- Floating Toolbar for Full Page Mode -->
              <div class="floating-toolbar">
                <div class="toolbar-group">
                  <button
                    class="toolbar-btn"
                    class:active={isDesignMode}
                    on:click={() => isDesignMode = !isDesignMode}
                    title="Toggle Design Mode (D)"
                    style="background: {isDesignMode ? $colorStore.primary + '30' : 'transparent'}; 
                           color: {$colorStore.text}; 
                           border-color: {$colorStore.primary}40;"
                  >
                    <Move size={16} />
                  </button>
                  <button
                    class="toolbar-btn"
                    class:active={showRealDataPreview}
                    on:click={() => showRealDataPreview = !showRealDataPreview}
                    title="Toggle Real Data Preview (R)"
                    style="background: {showRealDataPreview ? $colorStore.secondary + '30' : 'transparent'}; 
                           color: {$colorStore.text}; 
                           border-color: {$colorStore.secondary}40;"
                  >
                    <Database size={16} />
                  </button>
                  <button
                    class="toolbar-btn"
                    class:active={showGrid}
                    on:click={() => showGrid = !showGrid}
                    title="Toggle Grid (G)"
                    style="background: {showGrid ? $colorStore.accent + '30' : 'transparent'}; 
                           color: {$colorStore.text}; 
                           border-color: {$colorStore.accent}40;"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    class="toolbar-btn"
                    class:active={isFullPageMode}
                    on:click={() => isFullPageMode = !isFullPageMode}
                    title="Exit Full Page Mode (F / Esc)"
                    style="background: {isFullPageMode ? $colorStore.primary + '30' : 'transparent'}; 
                           color: {$colorStore.text}; 
                           border-color: {$colorStore.primary}40;"
                  >
                    <Minimize2 size={16} />
                  </button>
                </div>
                
                <div class="toolbar-group">
                  <button
                    class="toolbar-btn"
                    on:click={() => zoomIn(0.2)}
                    title="Zoom In (Ctrl + Plus or Mouse Wheel)"
                    style="color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
                    disabled={previewScale >= 2.9}
                  >
                    <ZoomIn size={16} />
                  </button>
                  <span class="zoom-display" style="color: {$colorStore.muted}; min-width: 50px; text-align: center; font-weight: 500;">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <button
                    class="toolbar-btn"
                    on:click={() => zoomOut(0.2)}
                    title="Zoom Out (Ctrl + Minus or Mouse Wheel)"
                    style="color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
                    disabled={previewScale <= 0.2}
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    class="toolbar-btn"
                    on:click={() => resetZoom()}
                    title="Reset Zoom (Ctrl + 0 or R)"
                    style="color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              <!-- Enhanced Preview Component -->
              <div class="preview-wrapper">
                <XpTemplatePreview
                  bind:localTemplate
                  bind:previewScale
                  bind:previewWidth
                  bind:previewHeight
                  bind:previewOffset
                  bind:previewBackgroundUrl
                  bind:showGrid
                  bind:gridSize
                  bind:showGuideLines
                  bind:guideLinesPos
                  {draggableElements}
                  bind:isDesignMode
                  bind:draggingElement
                  bind:hoverElement
                  bind:showRealDataPreview
                  bind:currentUserData
                  bind:sampleData
                  bind:showTooltips
                  bind:showCoordinateOverlay
                  bind:undoStack
                  bind:previewContainerRef
                  isFullPageMode={true}
                  {startDrag}
                  {formatColor}
                  {calculateProgressPosition}
                  {undo}
                  {resetZoom}
                />
              </div>
            </div>
          </div>

          <!-- Settings Panel in Full Page Mode -->
          <div class="settings-section-fullpage">
            <div class="border rounded-lg flex flex-col h-full"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15); border-color: {$colorStore.primary}20;">
              
              <div class="accordion-container">
                {#each settingsCategories as category}
                  <div class="border-b border-opacity-20" style="border-color: {$colorStore.primary}20;">
                    <button
                      class="w-full p-4 flex items-center justify-between text-left hover:bg-opacity-5 transition-all duration-200"
                      style="background: {expandedCategories.has(category.id) ? $colorStore.primary + '10' : 'transparent'};
                             color: {$colorStore.text};"
                      on:click={() => toggleCategory(category.id)}
                      aria-expanded={expandedCategories.has(category.id)}
                      aria-controls="category-{category.id}"
                    >
                      <div class="flex items-center gap-3">
                        <svelte:component this={category.icon} size={18} style="color: {$colorStore.primary}" />
                        <span class="font-medium">{category.label}</span>
                      </div>
                      <ChevronDown 
                        size={16} 
                        style="color: {$colorStore.muted}; transform: rotate({expandedCategories.has(category.id) ? '180deg' : '0deg'}); transition: transform 0.2s ease;"
                      />
                    </button>
                    
                    {#if expandedCategories.has(category.id)}
                      <div class="p-4 pt-0" transition:slide={{ duration: 200 }} id="category-{category.id}">
                        {#if category.id === 'canvas'}
                          <!-- Canvas & Background Settings -->
                          <div class="space-y-6">
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Canvas Size</h4>
                              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label for="output-width-fp" class="block text-sm font-medium" style="color: {$colorStore.text}">
                                    Width
                                  </label>
                                  <div class="space-y-3">
                                    <input
                                      id="output-width-fp"
                                      type="range"
                                      bind:value={localTemplate.outputSizeX}
                                      on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                                      min="300"
                                      max="1200"
                                      step="10"
                                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                      style="background: linear-gradient(to right, {$colorStore.primary}40 0%, {$colorStore.primary}40 {(localTemplate.outputSizeX - 300) / 9}%, {$colorStore.muted}20 {(localTemplate.outputSizeX - 300) / 9}%, {$colorStore.muted}20 100%);"
                                    />
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="number"
                                        bind:value={localTemplate.outputSizeX}
                                        on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                                        on:focus={handleInputFocus}
                                        class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        min="300"
                                        max="1200"
                                        step="10"
                                        aria-labelledby="output-width-fp"
                                      />
                                      <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div class="space-y-2">
                                  <label for="output-height-fp" class="block text-sm font-medium" style="color: {$colorStore.text}">
                                    Height
                                  </label>
                                  <div class="space-y-3">
                                    <input
                                      id="output-height-fp"
                                      type="range"
                                      bind:value={localTemplate.outputSizeY}
                                      on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                                      min="150"
                                      max="600"
                                      step="10"
                                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                      style="background: linear-gradient(to right, {$colorStore.primary}40 0%, {$colorStore.primary}40 {(localTemplate.outputSizeY - 150) / 4.5}%, {$colorStore.muted}20 {(localTemplate.outputSizeY - 150) / 4.5}%, {$colorStore.muted}20 100%);"
                                    />
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="number"
                                        bind:value={localTemplate.outputSizeY}
                                        on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                                        on:focus={handleInputFocus}
                                        class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        min="150"
                                        max="600"
                                        step="10"
                                        aria-labelledby="output-height-fp"
                                      />
                                      <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        {:else if category.id === 'user'}
                          <!-- User Elements Settings -->
                          <div class="space-y-6">
                            <!-- Username Display -->
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Username Display</h4>
                              <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                                <div class="flex items-center gap-3">
                                  <Type size={20} style="color: {$colorStore.primary}" />
                                  <div>
                                    <span class="block font-medium" style="color: {$colorStore.text}">Username Text</span>
                                    <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's name</span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  class="w-5 h-5 rounded"
                                  checked={localTemplate.templateUser?.showText}
                                  on:change={() => handleChange('templateUser.showText', !localTemplate.templateUser?.showText)}
                                  aria-label="Show username text"
                                  style="accent-color: {$colorStore.primary};"
                                />
                              </label>

                              {#if localTemplate.templateUser?.showText}
                                <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                                  <!-- Text Color -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="text"
                                        bind:value={localTemplate.templateUser.textColor}
                                        on:input={() => handleChange('templateUser.textColor', localTemplate.templateUser.textColor)}
                                        class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        placeholder="FF000000"
                                      />
                                      <input
                                        type="color"
                                        value="#{localTemplate.templateUser.textColor?.replace('FF', '') || '000000'}"
                                        on:input={(e) => handleChange('templateUser.textColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                        class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                        style="border-color: {$colorStore.primary}30;"
                                      />
                                    </div>
                                  </div>

                                  <!-- Font Size -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                    <input
                                      type="range"
                                      bind:value={localTemplate.templateUser.fontSize}
                                      on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                                      min="10"
                                      max="100"
                                      step="1"
                                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateUser.fontSize}
                                        on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                                        class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        min="10"
                                        max="100"
                                      />
                                      <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                    </div>
                                  </div>

                                  <!-- Position -->
                                  <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateUser.textX}
                                        on:input={() => handleChange('templateUser.textX', localTemplate.templateUser.textX)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      />
                                    </div>
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateUser.textY}
                                        on:input={() => handleChange('templateUser.textY', localTemplate.templateUser.textY)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      />
                                    </div>
                                  </div>
                                </div>
                              {/if}
                            </div>

                            <!-- User Icon Display -->
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text}">User Icon</h4>
                              <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                                <div class="flex items-center gap-3">
                                  <User size={20} style="color: {$colorStore.primary}" />
                                  <div>
                                    <span class="block font-medium" style="color: {$colorStore.text}">Show User Icon</span>
                                    <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's avatar</span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  class="w-5 h-5 rounded"
                                  checked={localTemplate.templateUser?.showIcon}
                                  on:change={() => handleChange('templateUser.showIcon', !localTemplate.templateUser?.showIcon)}
                                  aria-label="Show user icon"
                                  style="accent-color: {$colorStore.primary};"
                                />
                              </label>

                              {#if localTemplate.templateUser?.showIcon}
                                <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                                  <!-- Icon Position -->
                                  <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateUser.iconX}
                                        on:input={() => handleChange('templateUser.iconX', localTemplate.templateUser.iconX)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      />
                                    </div>
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateUser.iconY}
                                        on:input={() => handleChange('templateUser.iconY', localTemplate.templateUser.iconY)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      />
                                    </div>
                                  </div>

                                  <!-- Icon Size -->
                                  <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">Width</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateUser.iconSizeX}
                                        on:input={() => handleChange('templateUser.iconSizeX', localTemplate.templateUser.iconSizeX)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        min="10"
                                      />
                                    </div>
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">Height</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateUser.iconSizeY}
                                        on:input={() => handleChange('templateUser.iconSizeY', localTemplate.templateUser.iconSizeY)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        min="10"
                                      />
                                    </div>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {:else if category.id === 'progress'}
                          <!-- Progress Bar Settings -->
                          <div class="space-y-6">
                            <!-- Show Progress Bar -->
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Progress Bar Display</h4>
                              <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                                <div class="flex items-center gap-3">
                                  <BarChart size={20} style="color: {$colorStore.primary}" />
                                  <div>
                                    <span class="block font-medium" style="color: {$colorStore.text}">Show Progress Bar</span>
                                    <span class="block text-xs" style="color: {$colorStore.muted}">Display the XP progress bar</span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  class="w-5 h-5 rounded"
                                  checked={localTemplate.templateBar?.showBar}
                                  on:change={() => handleChange('templateBar.showBar', !localTemplate.templateBar?.showBar)}
                                  aria-label="Show progress bar"
                                  style="accent-color: {$colorStore.primary};"
                                />
                              </label>

                              {#if localTemplate.templateBar?.showBar}
                                <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                                  <!-- Bar Color -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Bar Color</label>
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="text"
                                        bind:value={localTemplate.templateBar.barColor}
                                        on:input={() => handleChange('templateBar.barColor', localTemplate.templateBar.barColor)}
                                        class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        placeholder="FF000000"
                                      />
                                      <input
                                        type="color"
                                        value="#{localTemplate.templateBar.barColor?.replace('FF', '') || '000000'}"
                                        on:input={(e) => handleChange('templateBar.barColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                        class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                        style="border-color: {$colorStore.primary}30;"
                                      />
                                    </div>
                                  </div>

                                  <!-- Bar Direction -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Direction</label>
                                    <select
                                      bind:value={localTemplate.templateBar.barDirection}
                                      on:change={() => handleChange('templateBar.barDirection', localTemplate.templateBar.barDirection)}
                                      class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border min-h-[44px]"
                                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    >
                                      <option value={0}>Left to Right</option>
                                      <option value={1}>Right to Left</option>
                                      <option value={2}>Top to Bottom</option>
                                      <option value={3}>Bottom to Top</option>
                                    </select>
                                  </div>

                                  <!-- Bar Position -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Start Position</label>
                                    <div class="grid grid-cols-2 gap-4">
                                      <div class="space-y-2">
                                        <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                        <input
                                          type="number"
                                          bind:value={localTemplate.templateBar.barPointAx}
                                          on:input={() => handleChange('templateBar.barPointAx', localTemplate.templateBar.barPointAx)}
                                          class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                          style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        />
                                      </div>
                                      <div class="space-y-2">
                                        <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                        <input
                                          type="number"
                                          bind:value={localTemplate.templateBar.barPointAy}
                                          on:input={() => handleChange('templateBar.barPointAy', localTemplate.templateBar.barPointAy)}
                                          class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                          style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">End Position</label>
                                    <div class="grid grid-cols-2 gap-4">
                                      <div class="space-y-2">
                                        <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                        <input
                                          type="number"
                                          bind:value={localTemplate.templateBar.barPointBx}
                                          on:input={() => handleChange('templateBar.barPointBx', localTemplate.templateBar.barPointBx)}
                                          class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                          style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        />
                                      </div>
                                      <div class="space-y-2">
                                        <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                        <input
                                          type="number"
                                          bind:value={localTemplate.templateBar.barPointBy}
                                          on:input={() => handleChange('templateBar.barPointBy', localTemplate.templateBar.barPointBy)}
                                          class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                          style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {:else if category.id === 'guild'}
                          <!-- Guild Information Settings -->
                          <div class="space-y-6">
                            <!-- Guild Level Display -->
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Guild Level</h4>
                              <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                                <div class="flex items-center gap-3">
                                  <Users size={20} style="color: {$colorStore.primary}" />
                                  <div>
                                    <span class="block font-medium" style="color: {$colorStore.text}">Show Guild Level</span>
                                    <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's level in the guild</span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  class="w-5 h-5 rounded"
                                  checked={localTemplate.templateGuild?.showGuildLevel}
                                  on:change={() => handleChange('templateGuild.showGuildLevel', !localTemplate.templateGuild?.showGuildLevel)}
                                  aria-label="Show guild level"
                                  style="accent-color: {$colorStore.primary};"
                                />
                              </label>

                              {#if localTemplate.templateGuild?.showGuildLevel}
                                <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                                  <!-- Level Text Color -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="text"
                                        bind:value={localTemplate.templateGuild.guildLevelColor}
                                        on:input={() => handleChange('templateGuild.guildLevelColor', localTemplate.templateGuild.guildLevelColor)}
                                        class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        placeholder="FF000000"
                                      />
                                      <input
                                        type="color"
                                        value="#{localTemplate.templateGuild.guildLevelColor?.replace('FF', '') || '000000'}"
                                        on:input={(e) => handleChange('templateGuild.guildLevelColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                        class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                        style="border-color: {$colorStore.primary}30;"
                                      />
                                    </div>
                                  </div>

                                  <!-- Level Font Size -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                    <input
                                      type="range"
                                      bind:value={localTemplate.templateGuild.guildLevelFontSize}
                                      on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                                      min="10"
                                      max="100"
                                      step="1"
                                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateGuild.guildLevelFontSize}
                                        on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                                        class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        min="10"
                                        max="100"
                                      />
                                      <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                    </div>
                                  </div>

                                  <!-- Level Position -->
                                  <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateGuild.guildLevelX}
                                        on:input={() => handleChange('templateGuild.guildLevelX', localTemplate.templateGuild.guildLevelX)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      />
                                    </div>
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateGuild.guildLevelY}
                                        on:input={() => handleChange('templateGuild.guildLevelY', localTemplate.templateGuild.guildLevelY)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      />
                                    </div>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {:else if category.id === 'time'}
                          <!-- Time Display Settings -->
                          <div class="space-y-6">
                            <!-- Show Time on Level -->
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Time on Level Display</h4>
                              <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                                <div class="flex items-center gap-3">
                                  <Clock size={20} style="color: {$colorStore.primary}" />
                                  <div>
                                    <span class="block font-medium" style="color: {$colorStore.text}">Show Time on Level</span>
                                    <span class="block text-xs" style="color: {$colorStore.muted}">Display how long the user has been at current level</span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  class="w-5 h-5 rounded"
                                  checked={localTemplate.showTimeOnLevel}
                                  on:change={() => handleChange('showTimeOnLevel', !localTemplate.showTimeOnLevel)}
                                  aria-label="Show time on level"
                                  style="accent-color: {$colorStore.primary};"
                                />
                              </label>

                              {#if localTemplate.showTimeOnLevel}
                                <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                                  <!-- Time Format -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Time Format</label>
                                    <input
                                      type="text"
                                      bind:value={localTemplate.timeOnLevelFormat}
                                      on:input={() => handleChange('timeOnLevelFormat', localTemplate.timeOnLevelFormat)}
                                      class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      placeholder="{0}d{1}h{2}m"
                                    />
                                    <p class="text-xs" style="color: {$colorStore.muted}">
                                      Use {0} for days, {1} for hours, {2} for minutes
                                    </p>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {:else if category.id === 'club'}
                          <!-- Club Features Settings -->
                          <div class="space-y-6">
                            <!-- Club Name Display -->
                            <div class="space-y-4">
                              <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Club Name Display</h4>
                              <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                                <div class="flex items-center gap-3">
                                  <Award size={20} style="color: {$colorStore.primary}" />
                                  <div>
                                    <span class="block font-medium" style="color: {$colorStore.text}">Show Club Name</span>
                                    <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's club name</span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  class="w-5 h-5 rounded"
                                  checked={localTemplate.templateClub?.showClubName}
                                  on:change={() => handleChange('templateClub.showClubName', !localTemplate.templateClub?.showClubName)}
                                  aria-label="Show club name"
                                  style="accent-color: {$colorStore.primary};"
                                />
                              </label>

                              {#if localTemplate.templateClub?.showClubName}
                                <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                                  <!-- Club Name Text Color -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="text"
                                        bind:value={localTemplate.templateClub.clubNameColor}
                                        on:input={() => handleChange('templateClub.clubNameColor', localTemplate.templateClub.clubNameColor)}
                                        class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        placeholder="FF000000"
                                      />
                                      <input
                                        type="color"
                                        value="#{localTemplate.templateClub.clubNameColor?.replace('FF', '') || '000000'}"
                                        on:input={(e) => handleChange('templateClub.clubNameColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                        class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                        style="border-color: {$colorStore.primary}30;"
                                      />
                                    </div>
                                  </div>

                                  <!-- Club Name Font Size -->
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                    <input
                                      type="range"
                                      bind:value={localTemplate.templateClub.clubNameFontSize}
                                      on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                                      min="10"
                                      max="100"
                                      step="1"
                                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div class="flex items-center gap-2">
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateClub.clubNameFontSize}
                                        on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                                        class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                        min="10"
                                        max="100"
                                      />
                                      <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                    </div>
                                  </div>

                                  <!-- Club Name Position -->
                                  <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateClub.clubNameX}
                                        on:input={() => handleChange('templateClub.clubNameX', localTemplate.templateClub.clubNameX)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      />
                                    </div>
                                    <div class="space-y-2">
                                      <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                      <input
                                        type="number"
                                        bind:value={localTemplate.templateClub.clubNameY}
                                        on:input={() => handleChange('templateClub.clubNameY', localTemplate.templateClub.clubNameY)}
                                        class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                      />
                                    </div>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {:else}
                          <!-- Placeholder for any remaining categories -->
                          <div class="text-sm" style="color: {$colorStore.muted}">
                            {category.label} settings not yet implemented...
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    {/if}

    <!-- Regular Responsive Grid Layout -->
    {#if !isFullPageMode}
    <div 
      class="template-editor-grid"
      class:desktop-layout={isDesktop}
      class:tablet-layout={isTablet}
      class:mobile-layout={isMobile}
    >
      <!-- Enhanced Preview Area -->
      <div
        class="preview-section"
        class:hidden={isMobile && editorMobileView === 'controls'}
      >
        <div class="preview-container">
          <!-- Floating Toolbar for Desktop/Tablet -->
          {#if !isMobile}
            <div class="floating-toolbar">
              <div class="toolbar-group">
                <button
                  class="toolbar-btn"
                  class:active={isDesignMode}
                  on:click={() => isDesignMode = !isDesignMode}
                  title="Toggle Design Mode (D)"
                  style="background: {isDesignMode ? $colorStore.primary + '30' : 'transparent'}; 
                         color: {$colorStore.text}; 
                         border-color: {$colorStore.primary}40;"
                >
                  <Move size={16} />
                </button>
                <button
                  class="toolbar-btn"
                  class:active={showRealDataPreview}
                  on:click={() => showRealDataPreview = !showRealDataPreview}
                  title="Toggle Real Data Preview (R)"
                  style="background: {showRealDataPreview ? $colorStore.secondary + '30' : 'transparent'}; 
                         color: {$colorStore.text}; 
                         border-color: {$colorStore.secondary}40;"
                >
                  <Database size={16} />
                </button>
                <button
                  class="toolbar-btn"
                  class:active={showGrid}
                  on:click={() => showGrid = !showGrid}
                  title="Toggle Grid (G)"
                  style="background: {showGrid ? $colorStore.accent + '30' : 'transparent'}; 
                         color: {$colorStore.text}; 
                         border-color: {$colorStore.accent}40;"
                >
                  <Grid size={16} />
                </button>
                <button
                  class="toolbar-btn"
                  class:active={isFullPageMode}
                  on:click={() => isFullPageMode = !isFullPageMode}
                  title="Toggle Full Page Mode (F)"
                  style="background: {isFullPageMode ? $colorStore.primary + '30' : 'transparent'}; 
                         color: {$colorStore.text}; 
                         border-color: {$colorStore.primary}40;"
                >
                  {#if isFullPageMode}
                    <Minimize2 size={16} />
                  {:else}
                    <Maximize2 size={16} />
                  {/if}
                </button>
              </div>
              
              <div class="toolbar-group">
                <button
                  class="toolbar-btn"
                  on:click={() => previewScale = Math.min(previewScale + 0.1, 2.0)}
                  title="Zoom In"
                  style="color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
                >
                  <ZoomIn size={16} />
                </button>
                <span class="zoom-display" style="color: {$colorStore.muted};">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  class="toolbar-btn"
                  on:click={() => previewScale = Math.max(previewScale - 0.1, 0.2)}
                  title="Zoom Out"
                  style="color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  class="toolbar-btn"
                  on:click={() => resetZoom()}
                  title="Reset Zoom (R)"
                  style="color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          {/if}

          <!-- Enhanced Preview Component -->
          <div class="preview-wrapper">
            <XpTemplatePreview
              bind:localTemplate
              bind:previewScale
              bind:previewWidth
              bind:previewHeight
              bind:previewOffset
              bind:previewBackgroundUrl
              bind:showGrid
              bind:gridSize
              bind:showGuideLines
              bind:guideLinesPos
              {draggableElements}
              bind:isDesignMode
              bind:draggingElement
              bind:hoverElement
              bind:showRealDataPreview
              bind:currentUserData
              bind:sampleData
              bind:showTooltips
              bind:showCoordinateOverlay
              bind:undoStack
              bind:previewContainerRef
              isFullPageMode={false}
              {startDrag}
              {formatColor}
              {calculateProgressPosition}
              {undo}
              {resetZoom}
            />
          </div>
        </div>
      </div>

      <!-- Settings Panel -->
      <div
        class="settings-section"
        class:hidden={isMobile && editorMobileView === 'preview'}
      >
        <div class="border rounded-lg flex flex-col h-full"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15); border-color: {$colorStore.primary}20;">
          
          <!-- Show tabs on mobile, accordion on desktop/tablet -->
          {#if isMobile}
            <div class="p-4">
              <div class="overflow-x-auto -mx-2 px-2">
                <div class="flex gap-1 border-b pb-2 min-w-max" style="border-color: {$colorStore.primary}30;">
                  {#each editorTabs as tab}
                    <button
                      class="px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm min-h-[44px] whitespace-nowrap"
                      class:font-medium={editorActiveTab === tab.id}
                      style="background: {editorActiveTab === tab.id ? $colorStore.primary + '30' : 'transparent'};
                             color: {editorActiveTab === tab.id ? $colorStore.text : $colorStore.muted};
                             border-bottom: {editorActiveTab === tab.id ? '2px solid ' + $colorStore.primary : 'none'};"
                      on:click={() => editorActiveTab = tab.id}
                      aria-label="Switch to {tab.label} tab"
                      aria-selected={editorActiveTab === tab.id}
                      role="tab"
                    >
                      <svelte:component this={tab.icon} size={16} style="color: {editorActiveTab === tab.id ? $colorStore.primary : $colorStore.muted}" />
                      <span class="hidden sm:inline">{tab.label}</span>
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Accordion Layout for Desktop/Tablet -->
          {#if !isMobile}
            {#each settingsCategories as category}
              <div class="border-b border-opacity-20" style="border-color: {$colorStore.primary}20;">
                <button
                  class="w-full p-4 flex items-center justify-between text-left hover:bg-opacity-5 transition-all duration-200"
                  style="background: {expandedCategories.has(category.id) ? $colorStore.primary + '10' : 'transparent'};
                         color: {$colorStore.text};"
                  on:click={() => toggleCategory(category.id)}
                  aria-expanded={expandedCategories.has(category.id)}
                  aria-controls="category-{category.id}"
                >
                  <div class="flex items-center gap-3">
                    <svelte:component this={category.icon} size={18} style="color: {$colorStore.primary}" />
                    <span class="font-medium">{category.label}</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    style="color: {$colorStore.muted}; transform: rotate({expandedCategories.has(category.id) ? '180deg' : '0deg'}); transition: transform 0.2s ease;"
                  />
                </button>
                
                {#if expandedCategories.has(category.id)}
                  <div class="p-4 pt-0" transition:slide={{ duration: 200 }} id="category-{category.id}">
                    {#if category.id === 'canvas'}
                      <!-- Canvas & Background Settings -->
                      <div class="space-y-6">
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Canvas Size</h4>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-2">
                              <label for="output-width" class="block text-sm font-medium" style="color: {$colorStore.text}">
                                Width
                              </label>
                              <div class="space-y-3">
                                <input
                                  id="output-width"
                                  type="range"
                                  bind:value={localTemplate.outputSizeX}
                                  on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                                  min="300"
                                  max="1200"
                                  step="10"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                  style="background: linear-gradient(to right, {$colorStore.primary}40 0%, {$colorStore.primary}40 {(localTemplate.outputSizeX - 300) / 9}%, {$colorStore.muted}20 {(localTemplate.outputSizeX - 300) / 9}%, {$colorStore.muted}20 100%);"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.outputSizeX}
                                    on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                                    on:focus={handleInputFocus}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="300"
                                    max="1200"
                                    step="10"
                                    aria-labelledby="output-width"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                </div>
                              </div>
                            </div>
                            
                            <div class="space-y-2">
                              <label for="output-height" class="block text-sm font-medium" style="color: {$colorStore.text}">
                                Height
                              </label>
                              <div class="space-y-3">
                                <input
                                  id="output-height"
                                  type="range"
                                  bind:value={localTemplate.outputSizeY}
                                  on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                                  min="150"
                                  max="600"
                                  step="10"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                  style="background: linear-gradient(to right, {$colorStore.primary}40 0%, {$colorStore.primary}40 {(localTemplate.outputSizeY - 150) / 4.5}%, {$colorStore.muted}20 {(localTemplate.outputSizeY - 150) / 4.5}%, {$colorStore.muted}20 100%);"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.outputSizeY}
                                    on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                                    on:focus={handleInputFocus}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="150"
                                    max="600"
                                    step="10"
                                    aria-labelledby="output-height"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    {:else if category.id === 'user'}
                      <!-- User Elements Settings -->
                      <div class="space-y-6">
                        <!-- Username Display -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Username Display</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            <div class="flex items-center gap-3">
                              <Type size={20} style="color: {$colorStore.primary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Username Text</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's name</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.templateUser?.showText}
                              on:change={() => handleChange('templateUser.showText', !localTemplate.templateUser?.showText)}
                              aria-label="Show username text"
                              style="accent-color: {$colorStore.primary};"
                            />
                          </label>

                          {#if localTemplate.templateUser?.showText}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                              <!-- Text Color -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                <div class="flex items-center gap-2">
                                  <input
                                    type="text"
                                    bind:value={localTemplate.templateUser.textColor}
                                    on:input={() => handleChange('templateUser.textColor', localTemplate.templateUser.textColor)}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    placeholder="FF000000"
                                  />
                                  <input
                                    type="color"
                                    value="#{localTemplate.templateUser.textColor?.replace('FF', '') || '000000'}"
                                    on:input={(e) => handleChange('templateUser.textColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                    class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                    style="border-color: {$colorStore.primary}30;"
                                  />
                                </div>
                              </div>

                              <!-- Font Size -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateUser.fontSize}
                                  on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                                  min="10"
                                  max="100"
                                  step="1"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.fontSize}
                                    on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                                    class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="10"
                                    max="100"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                </div>
                              </div>

                              <!-- Position -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.textX}
                                    on:input={() => handleChange('templateUser.textX', localTemplate.templateUser.textX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.textY}
                                    on:input={() => handleChange('templateUser.textY', localTemplate.templateUser.textY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>

                        <!-- User Icon Display -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">User Icon</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            <div class="flex items-center gap-3">
                              <User size={20} style="color: {$colorStore.primary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Show User Icon</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's avatar</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.templateUser?.showIcon}
                              on:change={() => handleChange('templateUser.showIcon', !localTemplate.templateUser?.showIcon)}
                              aria-label="Show user icon"
                              style="accent-color: {$colorStore.primary};"
                            />
                          </label>

                          {#if localTemplate.templateUser?.showIcon}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                              <!-- Icon Position -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.iconX}
                                    on:input={() => handleChange('templateUser.iconX', localTemplate.templateUser.iconX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.iconY}
                                    on:input={() => handleChange('templateUser.iconY', localTemplate.templateUser.iconY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>

                              <!-- Icon Size -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Width</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.iconSizeX}
                                    on:input={() => handleChange('templateUser.iconSizeX', localTemplate.templateUser.iconSizeX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="10"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Height</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateUser.iconSizeY}
                                    on:input={() => handleChange('templateUser.iconSizeY', localTemplate.templateUser.iconSizeY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="10"
                                  />
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {:else if category.id === 'progress'}
                      <!-- Progress Bar Settings -->
                      <div class="space-y-6">
                        <!-- Show Progress Bar -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Progress Bar Display</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            <div class="flex items-center gap-3">
                              <BarChart size={20} style="color: {$colorStore.primary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Show Progress Bar</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display the XP progress bar</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.templateBar?.showBar}
                              on:change={() => handleChange('templateBar.showBar', !localTemplate.templateBar?.showBar)}
                              aria-label="Show progress bar"
                              style="accent-color: {$colorStore.primary};"
                            />
                          </label>

                          {#if localTemplate.templateBar?.showBar}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                              <!-- Bar Color -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Bar Color</label>
                                <div class="flex items-center gap-2">
                                  <input
                                    type="text"
                                    bind:value={localTemplate.templateBar.barColor}
                                    on:input={() => handleChange('templateBar.barColor', localTemplate.templateBar.barColor)}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    placeholder="FF000000"
                                  />
                                  <input
                                    type="color"
                                    value="#{localTemplate.templateBar.barColor?.replace('FF', '') || '000000'}"
                                    on:input={(e) => handleChange('templateBar.barColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                    class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                    style="border-color: {$colorStore.primary}30;"
                                  />
                                </div>
                              </div>

                              <!-- Bar Transparency -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Transparency</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateBar.barTransparency}
                                  on:input={() => handleChange('templateBar.barTransparency', localTemplate.templateBar.barTransparency)}
                                  min="0"
                                  max="100"
                                  step="1"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateBar.barTransparency}
                                    on:input={() => handleChange('templateBar.barTransparency', localTemplate.templateBar.barTransparency)}
                                    class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="0"
                                    max="100"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">%</span>
                                </div>
                              </div>

                              <!-- Bar Length -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Bar Length</label>
                                <input
                                  type="number"
                                  bind:value={localTemplate.templateBar.barLength}
                                  on:input={() => handleChange('templateBar.barLength', localTemplate.templateBar.barLength)}
                                  class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  min="10"
                                />
                              </div>

                              <!-- Bar Direction -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Direction</label>
                                <select
                                  bind:value={localTemplate.templateBar.barDirection}
                                  on:change={() => handleChange('templateBar.barDirection', localTemplate.templateBar.barDirection)}
                                  class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border min-h-[44px]"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                >
                                  <option value={0}>Left to Right</option>
                                  <option value={1}>Right to Left</option>
                                  <option value={2}>Top to Bottom</option>
                                  <option value={3}>Bottom to Top</option>
                                </select>
                              </div>

                              <!-- Bar Position -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Start Position</label>
                                <div class="grid grid-cols-2 gap-4">
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                    <input
                                      type="number"
                                      bind:value={localTemplate.templateBar.barPointAx}
                                      on:input={() => handleChange('templateBar.barPointAx', localTemplate.templateBar.barPointAx)}
                                      class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    />
                                  </div>
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                    <input
                                      type="number"
                                      bind:value={localTemplate.templateBar.barPointAy}
                                      on:input={() => handleChange('templateBar.barPointAy', localTemplate.templateBar.barPointAy)}
                                      class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">End Position</label>
                                <div class="grid grid-cols-2 gap-4">
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                    <input
                                      type="number"
                                      bind:value={localTemplate.templateBar.barPointBx}
                                      on:input={() => handleChange('templateBar.barPointBx', localTemplate.templateBar.barPointBx)}
                                      class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    />
                                  </div>
                                  <div class="space-y-2">
                                    <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                    <input
                                      type="number"
                                      bind:value={localTemplate.templateBar.barPointBy}
                                      on:input={() => handleChange('templateBar.barPointBy', localTemplate.templateBar.barPointBy)}
                                      class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {:else if category.id === 'guild'}
                      <!-- Guild Information Settings -->
                      <div class="space-y-6">
                        <!-- Guild Level Display -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Guild Level</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            <div class="flex items-center gap-3">
                              <Users size={20} style="color: {$colorStore.primary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Show Guild Level</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's level in the guild</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.templateGuild?.showGuildLevel}
                              on:change={() => handleChange('templateGuild.showGuildLevel', !localTemplate.templateGuild?.showGuildLevel)}
                              aria-label="Show guild level"
                              style="accent-color: {$colorStore.primary};"
                            />
                          </label>

                          {#if localTemplate.templateGuild?.showGuildLevel}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                              <!-- Level Text Color -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                <div class="flex items-center gap-2">
                                  <input
                                    type="text"
                                    bind:value={localTemplate.templateGuild.guildLevelColor}
                                    on:input={() => handleChange('templateGuild.guildLevelColor', localTemplate.templateGuild.guildLevelColor)}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    placeholder="FF000000"
                                  />
                                  <input
                                    type="color"
                                    value="#{localTemplate.templateGuild.guildLevelColor?.replace('FF', '') || '000000'}"
                                    on:input={(e) => handleChange('templateGuild.guildLevelColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                    class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                    style="border-color: {$colorStore.primary}30;"
                                  />
                                </div>
                              </div>

                              <!-- Level Font Size -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateGuild.guildLevelFontSize}
                                  on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                                  min="10"
                                  max="100"
                                  step="1"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateGuild.guildLevelFontSize}
                                    on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                                    class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="10"
                                    max="100"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                </div>
                              </div>

                              <!-- Level Position -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateGuild.guildLevelX}
                                    on:input={() => handleChange('templateGuild.guildLevelX', localTemplate.templateGuild.guildLevelX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateGuild.guildLevelY}
                                    on:input={() => handleChange('templateGuild.guildLevelY', localTemplate.templateGuild.guildLevelY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>

                        <!-- Guild Rank Display -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Guild Rank</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                            <div class="flex items-center gap-3">
                              <Award size={20} style="color: {$colorStore.secondary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Show Guild Rank</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's rank in the guild</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.templateGuild?.showGuildRank}
                              on:change={() => handleChange('templateGuild.showGuildRank', !localTemplate.templateGuild?.showGuildRank)}
                              aria-label="Show guild rank"
                              style="accent-color: {$colorStore.secondary};"
                            />
                          </label>

                          {#if localTemplate.templateGuild?.showGuildRank}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.secondary}30;">
                              <!-- Rank Text Color -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                <div class="flex items-center gap-2">
                                  <input
                                    type="text"
                                    bind:value={localTemplate.templateGuild.guildRankColor}
                                    on:input={() => handleChange('templateGuild.guildRankColor', localTemplate.templateGuild.guildRankColor)}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                    placeholder="FF000000"
                                  />
                                  <input
                                    type="color"
                                    value="#{localTemplate.templateGuild.guildRankColor?.replace('FF', '') || '000000'}"
                                    on:input={(e) => handleChange('templateGuild.guildRankColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                    class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                    style="border-color: {$colorStore.secondary}30;"
                                  />
                                </div>
                              </div>

                              <!-- Rank Font Size -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateGuild.guildRankFontSize}
                                  on:input={() => handleChange('templateGuild.guildRankFontSize', localTemplate.templateGuild.guildRankFontSize)}
                                  min="10"
                                  max="100"
                                  step="1"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateGuild.guildRankFontSize}
                                    on:input={() => handleChange('templateGuild.guildRankFontSize', localTemplate.templateGuild.guildRankFontSize)}
                                    class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                    min="10"
                                    max="100"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                </div>
                              </div>

                              <!-- Rank Position -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateGuild.guildRankX}
                                    on:input={() => handleChange('templateGuild.guildRankX', localTemplate.templateGuild.guildRankX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateGuild.guildRankY}
                                    on:input={() => handleChange('templateGuild.guildRankY', localTemplate.templateGuild.guildRankY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {:else if category.id === 'time'}
                      <!-- Time Display Settings -->
                      <div class="space-y-6">
                        <!-- Show Time on Level -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Time on Level Display</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            <div class="flex items-center gap-3">
                              <Clock size={20} style="color: {$colorStore.primary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Show Time on Level</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display how long the user has been at current level</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.showTimeOnLevel}
                              on:change={() => handleChange('showTimeOnLevel', !localTemplate.showTimeOnLevel)}
                              aria-label="Show time on level"
                              style="accent-color: {$colorStore.primary};"
                            />
                          </label>

                          {#if localTemplate.showTimeOnLevel}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                              <!-- Time Format -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Time Format</label>
                                <input
                                  type="text"
                                  bind:value={localTemplate.timeOnLevelFormat}
                                  on:input={() => handleChange('timeOnLevelFormat', localTemplate.timeOnLevelFormat)}
                                  class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                  style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  placeholder="{0}d{1}h{2}m"
                                />
                                <p class="text-xs" style="color: {$colorStore.muted}">
                                  Use {0} for days, {1} for hours, {2} for minutes
                                </p>
                              </div>

                              <!-- Time Text Color -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                <div class="flex items-center gap-2">
                                  <input
                                    type="text"
                                    bind:value={localTemplate.timeOnLevelColor}
                                    on:input={() => handleChange('timeOnLevelColor', localTemplate.timeOnLevelColor)}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    placeholder="FF000000"
                                  />
                                  <input
                                    type="color"
                                    value="#{localTemplate.timeOnLevelColor?.replace('FF', '') || '000000'}"
                                    on:input={(e) => handleChange('timeOnLevelColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                    class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                    style="border-color: {$colorStore.primary}30;"
                                  />
                                </div>
                              </div>

                              <!-- Time Font Size -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.timeOnLevelFontSize}
                                  on:input={() => handleChange('timeOnLevelFontSize', localTemplate.timeOnLevelFontSize)}
                                  min="10"
                                  max="100"
                                  step="1"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.timeOnLevelFontSize}
                                    on:input={() => handleChange('timeOnLevelFontSize', localTemplate.timeOnLevelFontSize)}
                                    class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="10"
                                    max="100"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                </div>
                              </div>

                              <!-- Time Position -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.timeOnLevelX}
                                    on:input={() => handleChange('timeOnLevelX', localTemplate.timeOnLevelX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.timeOnLevelY}
                                    on:input={() => handleChange('timeOnLevelY', localTemplate.timeOnLevelY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>

                        <!-- Show Awarded XP -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Awarded XP Display</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                            <div class="flex items-center gap-3">
                              <Award size={20} style="color: {$colorStore.secondary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Show Awarded XP</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display recently awarded XP amount</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.showAwarded}
                              on:change={() => handleChange('showAwarded', !localTemplate.showAwarded)}
                              aria-label="Show awarded XP"
                              style="accent-color: {$colorStore.secondary};"
                            />
                          </label>

                          {#if localTemplate.showAwarded}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.secondary}30;">
                              <!-- Awarded Text Color -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                <div class="flex items-center gap-2">
                                  <input
                                    type="text"
                                    bind:value={localTemplate.awardedColor}
                                    on:input={() => handleChange('awardedColor', localTemplate.awardedColor)}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                    placeholder="ffffffff"
                                  />
                                  <input
                                    type="color"
                                    value="#{localTemplate.awardedColor?.substring(2) || 'ffffff'}"
                                    on:input={(e) => handleChange('awardedColor', localTemplate.awardedColor?.substring(0, 2) + e.target.value.slice(1).toUpperCase())}
                                    class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                    style="border-color: {$colorStore.secondary}30;"
                                  />
                                </div>
                              </div>

                              <!-- Awarded Font Size -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.awardedFontSize}
                                  on:input={() => handleChange('awardedFontSize', localTemplate.awardedFontSize)}
                                  min="10"
                                  max="100"
                                  step="1"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.awardedFontSize}
                                    on:input={() => handleChange('awardedFontSize', localTemplate.awardedFontSize)}
                                    class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                    min="10"
                                    max="100"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                </div>
                              </div>

                              <!-- Awarded Position -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.awardedX}
                                    on:input={() => handleChange('awardedX', localTemplate.awardedX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.awardedY}
                                    on:input={() => handleChange('awardedY', localTemplate.awardedY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {:else if category.id === 'club'}
                      <!-- Club Features Settings -->
                      <div class="space-y-6">
                        <!-- Club Name Display -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Club Name Display</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                            <div class="flex items-center gap-3">
                              <Award size={20} style="color: {$colorStore.primary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Show Club Name</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's club name</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.templateClub?.showClubName}
                              on:change={() => handleChange('templateClub.showClubName', !localTemplate.templateClub?.showClubName)}
                              aria-label="Show club name"
                              style="accent-color: {$colorStore.primary};"
                            />
                          </label>

                          {#if localTemplate.templateClub?.showClubName}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;">
                              <!-- Club Name Text Color -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Text Color</label>
                                <div class="flex items-center gap-2">
                                  <input
                                    type="text"
                                    bind:value={localTemplate.templateClub.clubNameColor}
                                    on:input={() => handleChange('templateClub.clubNameColor', localTemplate.templateClub.clubNameColor)}
                                    class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    placeholder="FF000000"
                                  />
                                  <input
                                    type="color"
                                    value="#{localTemplate.templateClub.clubNameColor?.replace('FF', '') || '000000'}"
                                    on:input={(e) => handleChange('templateClub.clubNameColor', 'FF' + e.target.value.slice(1).toUpperCase())}
                                    class="w-12 h-[44px] rounded-lg border cursor-pointer"
                                    style="border-color: {$colorStore.primary}30;"
                                  />
                                </div>
                              </div>

                              <!-- Club Name Font Size -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Font Size</label>
                                <input
                                  type="range"
                                  bind:value={localTemplate.templateClub.clubNameFontSize}
                                  on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                                  min="10"
                                  max="100"
                                  step="1"
                                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                />
                                <div class="flex items-center gap-2">
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateClub.clubNameFontSize}
                                    on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                                    class="w-20 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    min="10"
                                    max="100"
                                  />
                                  <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                                </div>
                              </div>

                              <!-- Club Name Position -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateClub.clubNameX}
                                    on:input={() => handleChange('templateClub.clubNameX', localTemplate.templateClub.clubNameX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateClub.clubNameY}
                                    on:input={() => handleChange('templateClub.clubNameY', localTemplate.templateClub.clubNameY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>

                        <!-- Club Icon Display -->
                        <div class="space-y-4">
                          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">Club Icon Display</h4>
                          <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                                 style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                            <div class="flex items-center gap-3">
                              <Users size={20} style="color: {$colorStore.secondary}" />
                              <div>
                                <span class="block font-medium" style="color: {$colorStore.text}">Show Club Icon</span>
                                <span class="block text-xs" style="color: {$colorStore.muted}">Display the club's icon/logo</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              class="w-5 h-5 rounded"
                              checked={localTemplate.templateClub?.showClubIcon}
                              on:change={() => handleChange('templateClub.showClubIcon', !localTemplate.templateClub?.showClubIcon)}
                              aria-label="Show club icon"
                              style="accent-color: {$colorStore.secondary};"
                            />
                          </label>

                          {#if localTemplate.templateClub?.showClubIcon}
                            <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.secondary}30;">
                              <!-- Club Icon Position -->
                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">X Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateClub.clubIconX}
                                    on:input={() => handleChange('templateClub.clubIconX', localTemplate.templateClub.clubIconX)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                  />
                                </div>
                                <div class="space-y-2">
                                  <label class="block text-sm font-medium" style="color: {$colorStore.text}">Y Position</label>
                                  <input
                                    type="number"
                                    bind:value={localTemplate.templateClub.clubIconY}
                                    on:input={() => handleChange('templateClub.clubIconY', localTemplate.templateClub.clubIconY)}
                                    class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                    style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                  />
                                </div>
                              </div>

                              <!-- Club Icon Size -->
                              <div class="space-y-2">
                                <label class="block text-sm font-medium" style="color: {$colorStore.text}">Icon Size</label>
                                <div class="grid grid-cols-2 gap-4">
                                  <div class="space-y-2">
                                    <label class="block text-xs font-medium" style="color: {$colorStore.muted}">Width</label>
                                    <input
                                      type="number"
                                      bind:value={localTemplate.templateClub.clubIconSizeX}
                                      on:input={() => handleChange('templateClub.clubIconSizeX', localTemplate.templateClub.clubIconSizeX)}
                                      class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                      style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                      min="10"
                                    />
                                  </div>
                                  <div class="space-y-2">
                                    <label class="block text-xs font-medium" style="color: {$colorStore.muted}">Height</label>
                                    <input
                                      type="number"
                                      bind:value={localTemplate.templateClub.clubIconSizeY}
                                      on:input={() => handleChange('templateClub.clubIconSizeY', localTemplate.templateClub.clubIconSizeY)}
                                      class="w-full px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                                      style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                                      min="10"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          {:else}
            <div class="accordion-container">
              <!-- Mobile Tab Content -->
              {#if editorActiveTab === 'general'}
            <div class="space-y-6" transition:fade={{ duration: 200 }}>
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                  <AlignCenter size={20} style="color: {$colorStore.primary}" />
                  <h3 class="text-lg font-medium" style="color: {$colorStore.text}">Canvas Size</h3>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label for="output-width" class="block text-sm font-medium" style="color: {$colorStore.text}">
                      Width
                    </label>
                    <div class="space-y-3">
                      <input
                        id="output-width"
                        type="range"
                        bind:value={localTemplate.outputSizeX}
                        on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                        min="300"
                        max="1200"
                        step="10"
                        class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style="background: linear-gradient(to right, {$colorStore.primary}40 0%, {$colorStore.primary}40 {(localTemplate.outputSizeX - 300) / 9}%, {$colorStore.muted}20 {(localTemplate.outputSizeX - 300) / 9}%, {$colorStore.muted}20 100%);"
                      />
                      <div class="flex items-center gap-2">
                        <input
                          type="number"
                          bind:value={localTemplate.outputSizeX}
                          on:input={() => handleChange('outputSizeX', localTemplate.outputSizeX)}
                          on:focus={handleInputFocus}
                          class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                          style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          min="300"
                          max="1200"
                          step="10"
                          aria-labelledby="output-width"
                        />
                        <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <label for="output-height" class="block text-sm font-medium" style="color: {$colorStore.text}">
                      Height
                    </label>
                    <div class="space-y-3">
                      <input
                        id="output-height"
                        type="range"
                        bind:value={localTemplate.outputSizeY}
                        on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                        min="150"
                        max="600"
                        step="10"
                        class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style="background: linear-gradient(to right, {$colorStore.primary}40 0%, {$colorStore.primary}40 {(localTemplate.outputSizeY - 150) / 4.5}%, {$colorStore.muted}20 {(localTemplate.outputSizeY - 150) / 4.5}%, {$colorStore.muted}20 100%);"
                      />
                      <div class="flex items-center gap-2">
                        <input
                          type="number"
                          bind:value={localTemplate.outputSizeY}
                          on:input={() => handleChange('outputSizeY', localTemplate.outputSizeY)}
                          on:focus={handleInputFocus}
                          class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border text-center font-mono min-h-[44px]"
                          style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          min="150"
                          max="600"
                          step="10"
                          aria-labelledby="output-height"
                        />
                        <span class="text-sm" style="color: {$colorStore.muted}">px</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Size Presets -->
                <div class="flex flex-wrap gap-2 pt-2">
                  <button
                    class="px-3 py-1.5 rounded-lg text-sm transition-colors min-h-[36px]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                    on:click={() => { handleChange('outputSizeX', 800); handleChange('outputSizeY', 280); }}
                  >
                    Standard (800×280)
                  </button>
                  <button
                    class="px-3 py-1.5 rounded-lg text-sm transition-colors min-h-[36px]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                    on:click={() => { handleChange('outputSizeX', 1000); handleChange('outputSizeY', 350); }}
                  >
                    Large (1000×350)
                  </button>
                  <button
                    class="px-3 py-1.5 rounded-lg text-sm transition-colors min-h-[36px]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                    on:click={() => { handleChange('outputSizeX', 600); handleChange('outputSizeY', 210); }}
                  >
                    Compact (600×210)
                  </button>
                </div>
              </div>

              <div class="space-y-4 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
                <div class="flex items-center gap-2 mb-4">
                  <Image size={20} style="color: {$colorStore.primary}" />
                  <h3 class="text-lg font-medium" style="color: {$colorStore.text}">Background</h3>
                </div>
                
                <div class="space-y-4">
                  <div>
                    <label for="image-url" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                      Image URL
                    </label>
                    <div class="flex flex-col sm:flex-row gap-3">
                      <input
                        id="image-url"
                        type="url"
                        bind:value={imageUrl}
                        class="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border min-h-[44px]"
                        placeholder="https://example.com/background.jpg"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                      <button
                        class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium min-h-[44px]"
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
                      <p class="mt-2 text-sm flex items-center gap-1" style="color: {$colorStore.accent};">
                        <AlertCircle size={14} />
                        {imageError}
                      </p>
                    {/if}
                  </div>

                  <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                         style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                    <input
                      type="checkbox"
                      id="update-size"
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
                         style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}30;">
                      <span class="text-sm" style="color: {$colorStore.accent}">
                        Background image loaded
                      </span>
                      <button
                        class="text-sm underline"
                        style="color: {$colorStore.accent};"
                        on:click={() => { previewBackgroundUrl = null; imageUrl = ''; }}
                      >
                        Remove
                      </button>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            <!-- User Tab Content -->
          {:else if editorActiveTab === 'user'}
            <div class="space-y-6" transition:fade={{ duration: 200 }}>
              <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                <User size={20} style="color: {$colorStore.primary}" />
                User Information Settings
              </h3>

              <!-- Username Settings -->
              <div class="space-y-4">
                <label class="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                       style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="flex items-center gap-3">
                    <Type size={20} style="color: {$colorStore.primary}" />
                    <div>
                      <span class="block font-medium" style="color: {$colorStore.text}">Username Text</span>
                      <span class="block text-xs" style="color: {$colorStore.muted}">Display the user's name</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    class="w-5 h-5 rounded"
                    checked={localTemplate.templateUser.showText}
                    on:change={() => handleChange('templateUser.showText', !localTemplate.templateUser.showText)}
                    aria-label="Show username text"
                    style="accent-color: {$colorStore.primary};"
                  />
                </label>

                {#if localTemplate.templateUser.showText}
                  <div class="space-y-4 pl-4 border-l-2" style="border-color: {$colorStore.primary}30;" transition:fade={{ duration: 200 }}>
                    <!-- Color Input -->
                    <div class="space-y-2">
                      <label for="username-color" class="block text-sm font-medium" style="color: {$colorStore.text}">
                        Text Color
                      </label>
                      <div class="flex items-stretch gap-2">
                        <div class="flex-1 relative">
                          <input
                            id="username-color"
                            type="text"
                            value={formatColor(localTemplate.templateUser.textColor)}
                            on:input={handleColorInput('templateUser.textColor')}
                            on:focus={handleInputFocus}
                            class="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-900/50 border font-mono text-sm min-h-[44px]"
                            style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            pattern="^#?[0-9A-Fa-f]{6,8}$"
                            placeholder="#RRGGBB"
                          />
                          <div class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded"
                               style="background: {formatColor(localTemplate.templateUser.textColor)}; border: 1px solid {$colorStore.primary}50;">
                          </div>
                        </div>
                        <input
                          type="color"
                          value={formatColor(localTemplate.templateUser.textColor)}
                          on:input={handleColorInput('templateUser.textColor')}
                          class="w-12 h-[44px] rounded-lg border cursor-pointer"
                          style="border-color: {$colorStore.primary}30;"
                          aria-labelledby="username-color"
                        />
                      </div>
                    </div>

                    <!-- Font Size with Slider -->
                  <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                    <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                    <div class="flex items-center">
                      <input
                        id="username-font-size"
                        type="range"
                        bind:value={localTemplate.templateUser.fontSize}
                        on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                        min="10"
                        max="100"
                        step="1"
                        class="w-full mr-2"
                        aria-label="Username font size"
                      />
                      <input
                        type="number"
                        bind:value={localTemplate.templateUser.fontSize}
                        on:input={() => handleChange('templateUser.fontSize', localTemplate.templateUser.fontSize)}
                        on:focus={handleInputFocus}
                        class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        min="10"
                        max="100"
                        aria-labelledby="username-font-size"
                      />
                    </div>
                    <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="username-position-x" class="block text-sm mb-1"
                             style="color: {$colorStore.muted}">Position X</label>
                      <input
                        id="username-position-x"
                        type="number"
                        bind:value={localTemplate.templateUser.textX}
                        on:input={() => handleChange('templateUser.textX', localTemplate.templateUser.textX)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="username-position-y" class="block text-sm mb-1"
                             style="color: {$colorStore.muted}">Position Y</label>
                      <input
                        id="username-position-y"
                        type="number"
                        bind:value={localTemplate.templateUser.textY}
                        on:input={() => handleChange('templateUser.textY', localTemplate.templateUser.textY)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>
                  </div>
                {/if}
              </div>

              <!-- User Avatar Settings -->
              <div
                class="border rounded-lg p-4 space-y-4"
                style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}20;"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                    <User size={18} style="color: {$colorStore.secondary}" />
                    User Avatar
                  </h4>
                  <label class="flex items-center gap-2">
                    <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                    <input
                      type="checkbox"
                      class="w-4 h-4 rounded"
                      checked={localTemplate.templateUser.showIcon}
                      on:change={() => handleChange('templateUser.showIcon', !localTemplate.templateUser.showIcon)}
                      aria-label="Show user avatar"
                    />
                  </label>
                </div>

                <div class="space-y-3" class:opacity-50={!localTemplate.templateUser.showIcon}>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="avatar-position-x" class="block text-sm mb-1"
                             style="color: {$colorStore.muted}">Position X</label>
                      <input
                        id="avatar-position-x"
                        type="number"
                        bind:value={localTemplate.templateUser.iconX}
                        on:input={() => handleChange('templateUser.iconX', localTemplate.templateUser.iconX)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="avatar-position-y" class="block text-sm mb-1"
                             style="color: {$colorStore.muted}">Position Y</label>
                      <input
                        id="avatar-position-y"
                        type="number"
                        bind:value={localTemplate.templateUser.iconY}
                        on:input={() => handleChange('templateUser.iconY', localTemplate.templateUser.iconY)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>

                  <!-- Avatar Size with Sliders -->
                  <div class="mt-4 p-3 rounded-lg" style="background: {$colorStore.secondary}15;">
                    <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Avatar Size</h5>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label for="avatar-width" class="block text-xs mb-1" style="color: {$colorStore.muted}">Width</label>
                        <div class="flex items-center">
                          <input
                            id="avatar-width"
                            type="range"
                            bind:value={localTemplate.templateUser.iconSizeX}
                            on:input={() => handleChange('templateUser.iconSizeX', localTemplate.templateUser.iconSizeX)}
                            min="10"
                            max="200"
                            step="1"
                            class="w-full mr-2"
                          />
                          <input
                            type="number"
                            bind:value={localTemplate.templateUser.iconSizeX}
                            on:input={() => handleChange('templateUser.iconSizeX', localTemplate.templateUser.iconSizeX)}
                            on:focus={handleInputFocus}
                            class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                            style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                            min="10"
                            aria-labelledby="avatar-width"
                          />
                        </div>
                      </div>
                      <div>
                        <label for="avatar-height" class="block text-xs mb-1"
                               style="color: {$colorStore.muted}">Height</label>
                        <div class="flex items-center">
                          <input
                            id="avatar-height"
                            type="range"
                            bind:value={localTemplate.templateUser.iconSizeY}
                            on:input={() => handleChange('templateUser.iconSizeY', localTemplate.templateUser.iconSizeY)}
                            min="10"
                            max="200"
                            step="1"
                            class="w-full mr-2"
                          />
                          <input
                            type="number"
                            bind:value={localTemplate.templateUser.iconSizeY}
                            on:input={() => handleChange('templateUser.iconSizeY', localTemplate.templateUser.iconSizeY)}
                            on:focus={handleInputFocus}
                            class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                            style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                            min="10"
                            aria-labelledby="avatar-height"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Progress Bar Tab Content -->
          {:else if editorActiveTab === 'bar'}
            <div class="space-y-6" transition:fade={{ duration: 200 }}>
              <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                <BarChart size={20} style="color: {$colorStore.primary}" />
                Progress Bar Settings
              </h3>

              <div
                class="border rounded-lg p-4 space-y-4"
                style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium" style="color: {$colorStore.text}">XP Progress Bar</h4>
                  <label class="flex items-center gap-2">
                    <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                    <input
                      type="checkbox"
                      class="w-4 h-4 rounded"
                      checked={localTemplate.templateBar.showBar}
                      on:change={() => handleChange('templateBar.showBar', !localTemplate.templateBar.showBar)}
                      aria-label="Show progress bar"
                    />
                  </label>
                </div>

                <div class="space-y-4" class:opacity-50={!localTemplate.templateBar.showBar}>
                  <div>
                    <label for="bar-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Bar
                      Color</label>
                    <div class="flex gap-2">
                      <input
                        id="bar-color"
                        type="text"
                        value={formatColor(localTemplate.templateBar.barColor)}
                        on:input={handleColorInput('templateBar.barColor')}
                        on:focus={handleInputFocus}
                        class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        pattern="^#?[0-9A-Fa-f]{6,8}$"
                        placeholder="#RRGGBB"
                      />
                      <input
                        type="color"
                        value={formatColor(localTemplate.templateBar.barColor)}
                        on:input={handleColorInput('templateBar.barColor')}
                        class="w-10 h-10 rounded-lg border cursor-pointer"
                        style="border-color: {$colorStore.primary}30;"
                        aria-labelledby="bar-color"
                      />
                    </div>
                  </div>

                  <!-- Bar Width with Slider -->
                  <div class="p-3 rounded-lg" style="background: {$colorStore.accent}15;">
                    <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Bar Width</h5>
                    <div class="flex items-center">
                      <input
                        id="bar-width"
                        type="range"
                        bind:value={localTemplate.templateBar.barWidth}
                        on:input={() => handleChange('templateBar.barWidth', localTemplate.templateBar.barWidth)}
                        min="1"
                        max="30"
                        step="1"
                        class="w-full mr-2"
                      />
                      <input
                        type="number"
                        bind:value={localTemplate.templateBar.barWidth}
                        on:input={() => handleChange('templateBar.barWidth', localTemplate.templateBar.barWidth)}
                        on:focus={handleInputFocus}
                        class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.accent}30; color: {$colorStore.text};"
                        min="1"
                        max="30"
                        aria-labelledby="bar-width"
                      />
                    </div>
                    <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                      <span>Thin</span>
                      <span>Thick</span>
                    </div>
                  </div>

                  <div>
                    <label for="bar-transparency" class="block text-sm mb-1" style="color: {$colorStore.muted}">Transparency</label>
                    <input
                      id="bar-transparency"
                      type="range"
                      bind:value={localTemplate.templateBar.barTransparency}
                      on:input={() => handleChange('templateBar.barTransparency', localTemplate.templateBar.barTransparency)}
                      min="0"
                      max="255"
                      step="1"
                      class="w-full"
                    />
                    <div class="flex justify-between text-xs" style="color: {$colorStore.muted}">
                      <span>Transparent</span>
                      <span>Opaque</span>
                    </div>
                  </div>

                  <div>
                    <label for="bar-direction" class="block text-sm mb-1" style="color: {$colorStore.muted}">Bar
                      Direction</label>
                    <DiscordSelector
                      id="bar-direction"
                      options={directions}
                      bind:value={localTemplate.templateBar.barDirection}
                      on:change={(e) => handleChange('templateBar.barDirection', e.detail)}
                      placeholder="Select bar direction..."
                      searchPlaceholder="Search directions..."
                    />
                  </div>

                  <div>
                    <label for="bar-length" class="block text-sm mb-1" style="color: {$colorStore.muted}">Bar
                      Length</label>
                    <input
                      id="bar-length"
                      type="number"
                      bind:value={localTemplate.templateBar.barLength}
                      on:input={() => handleChange('templateBar.barLength', localTemplate.templateBar.barLength)}
                      on:focus={handleInputFocus}
                      class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      min="1"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Start Point</h5>
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label for="bar-start-x" class="block text-xs mb-1"
                                 style="color: {$colorStore.muted}">X</label>
                          <input
                            id="bar-start-x"
                            type="number"
                            bind:value={localTemplate.templateBar.barPointAx}
                            on:input={() => handleChange('templateBar.barPointAx', localTemplate.templateBar.barPointAx)}
                            on:focus={handleInputFocus}
                            class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                            style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                        </div>
                        <div>
                          <label for="bar-start-y" class="block text-xs mb-1"
                                 style="color: {$colorStore.muted}">Y</label>
                          <input
                            id="bar-start-y"
                            type="number"
                            bind:value={localTemplate.templateBar.barPointAy}
                            on:input={() => handleChange('templateBar.barPointAy', localTemplate.templateBar.barPointAy)}
                            on:focus={handleInputFocus}
                            class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                            style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">End Point</h5>
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label for="bar-end-x" class="block text-xs mb-1"
                                 style="color: {$colorStore.muted}">X</label>
                          <input
                            id="bar-end-x"
                            type="number"
                            bind:value={localTemplate.templateBar.barPointBx}
                            on:input={() => handleChange('templateBar.barPointBx', localTemplate.templateBar.barPointBx)}
                            on:focus={handleInputFocus}
                            class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                            style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                        </div>
                        <div>
                          <label for="bar-end-y" class="block text-xs mb-1"
                                 style="color: {$colorStore.muted}">Y</label>
                          <input
                            id="bar-end-y"
                            type="number"
                            bind:value={localTemplate.templateBar.barPointBy}
                            on:input={() => handleChange('templateBar.barPointBy', localTemplate.templateBar.barPointBy)}
                            on:focus={handleInputFocus}
                            class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                            style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Guild Tab Content -->
          {:else if editorActiveTab === 'guild'}
            <div class="space-y-6" transition:fade={{ duration: 200 }}>
              <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                <Users size={20} style="color: {$colorStore.primary}" />
                Guild Information Settings
              </h3>

              <!-- Guild Level Settings -->
              <div
                class="border rounded-lg p-4 space-y-4"
                style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium" style="color: {$colorStore.text}">Guild Level</h4>
                  <label class="flex items-center gap-2">
                    <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                    <input
                      type="checkbox"
                      class="w-4 h-4 rounded"
                      checked={localTemplate.templateGuild.showGuildLevel}
                      on:change={() => handleChange('templateGuild.showGuildLevel', !localTemplate.templateGuild.showGuildLevel)}
                      aria-label="Show guild level"
                    />
                  </label>
                </div>

                <div class="space-y-3" class:opacity-50={!localTemplate.templateGuild.showGuildLevel}>
                  <div>
                    <label for="guild-level-color" class="block text-sm mb-1"
                           style="color: {$colorStore.muted}">Text Color</label>
                    <div class="flex gap-2">
                      <input
                        id="guild-level-color"
                        type="text"
                        value={formatColor(localTemplate.templateGuild.guildLevelColor)}
                        on:input={handleColorInput('templateGuild.guildLevelColor')}
                        on:focus={handleInputFocus}
                        class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        pattern="^#?[0-9A-Fa-f]{6,8}$"
                        placeholder="#RRGGBB"
                      />
                      <input
                        type="color"
                        value={formatColor(localTemplate.templateGuild.guildLevelColor)}
                        on:input={handleColorInput('templateGuild.guildLevelColor')}
                        class="w-10 h-10 rounded-lg border cursor-pointer"
                        style="border-color: {$colorStore.primary}30;"
                        aria-labelledby="guild-level-color"
                      />
                    </div>
                  </div>

                  <!-- Guild Level Font Size with Slider -->
                  <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                    <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                    <div class="flex items-center">
                      <input
                        id="guild-level-font-size"
                        type="range"
                        bind:value={localTemplate.templateGuild.guildLevelFontSize}
                        on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                        min="10"
                        max="100"
                        step="1"
                        class="w-full mr-2"
                      />
                      <input
                        type="number"
                        bind:value={localTemplate.templateGuild.guildLevelFontSize}
                        on:input={() => handleChange('templateGuild.guildLevelFontSize', localTemplate.templateGuild.guildLevelFontSize)}
                        on:focus={handleInputFocus}
                        class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        min="10"
                        max="100"
                        aria-labelledby="guild-level-font-size"
                      />
                    </div>
                    <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="guild-level-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        X</label>
                      <input
                        id="guild-level-x"
                        type="number"
                        bind:value={localTemplate.templateGuild.guildLevelX}
                        on:input={() => handleChange('templateGuild.guildLevelX', localTemplate.templateGuild.guildLevelX)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="guild-level-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        Y</label>
                      <input
                        id="guild-level-y"
                        type="number"
                        bind:value={localTemplate.templateGuild.guildLevelY}
                        on:input={() => handleChange('templateGuild.guildLevelY', localTemplate.templateGuild.guildLevelY)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Guild Rank Settings -->
              <div
                class="border rounded-lg p-4 space-y-4"
                style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}20;"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium" style="color: {$colorStore.text}">Guild Rank</h4>
                  <label class="flex items-center gap-2">
                    <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                    <input
                      type="checkbox"
                      class="w-4 h-4 rounded"
                      checked={localTemplate.templateGuild.showGuildRank}
                      on:change={() => handleChange('templateGuild.showGuildRank', !localTemplate.templateGuild.showGuildRank)}
                      aria-label="Show guild rank"
                    />
                  </label>
                </div>

                <div class="space-y-3" class:opacity-50={!localTemplate.templateGuild.showGuildRank}>
                  <div>
                    <label for="guild-rank-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Text
                      Color</label>
                    <div class="flex gap-2">
                      <input
                        id="guild-rank-color"
                        type="text"
                        value={formatColor(localTemplate.templateGuild.guildRankColor)}
                        on:input={handleColorInput('templateGuild.guildRankColor')}
                        on:focus={handleInputFocus}
                        class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                        pattern="^#?[0-9A-Fa-f]{6,8}$"
                        placeholder="#RRGGBB"
                      />
                      <input
                        type="color"
                        value={formatColor(localTemplate.templateGuild.guildRankColor)}
                        on:input={handleColorInput('templateGuild.guildRankColor')}
                        class="w-10 h-10 rounded-lg border cursor-pointer"
                        style="border-color: {$colorStore.secondary}30;"
                        aria-labelledby="guild-rank-color"
                      />
                    </div>
                  </div>

                  <!-- Guild Rank Font Size with Slider -->
                  <div class="p-3 rounded-lg" style="background: {$colorStore.secondary}15;">
                    <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                    <div class="flex items-center">
                      <input
                        id="guild-rank-font-size"
                        type="range"
                        bind:value={localTemplate.templateGuild.guildRankFontSize}
                        on:input={() => handleChange('templateGuild.guildRankFontSize', localTemplate.templateGuild.guildRankFontSize)}
                        min="10"
                        max="100"
                        step="1"
                        class="w-full mr-2"
                      />
                      <input
                        type="number"
                        bind:value={localTemplate.templateGuild.guildRankFontSize}
                        on:input={() => handleChange('templateGuild.guildRankFontSize', localTemplate.templateGuild.guildRankFontSize)}
                        on:focus={handleInputFocus}
                        class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                        min="10"
                        max="100"
                        aria-labelledby="guild-rank-font-size"
                      />
                    </div>
                    <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="guild-rank-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        X</label>
                      <input
                        id="guild-rank-x"
                        type="number"
                        bind:value={localTemplate.templateGuild.guildRankX}
                        on:input={() => handleChange('templateGuild.guildRankX', localTemplate.templateGuild.guildRankX)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="guild-rank-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        Y</label>
                      <input
                        id="guild-rank-y"
                        type="number"
                        bind:value={localTemplate.templateGuild.guildRankY}
                        on:input={() => handleChange('templateGuild.guildRankY', localTemplate.templateGuild.guildRankY)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Time Tab Content -->
          {:else if editorActiveTab === 'time'}
            <div class="space-y-6" transition:fade={{ duration: 200 }}>
              <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                <Clock size={20} style="color: {$colorStore.primary}" />
                Time On Level Settings
              </h3>

              <!-- Time On Level Settings -->
              <div
                class="border rounded-lg p-4 space-y-4"
                style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium" style="color: {$colorStore.text}">Time On Level</h4>
                  <label class="flex items-center gap-2">
                    <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                    <input
                      type="checkbox"
                      class="w-4 h-4 rounded"
                      checked={localTemplate.showTimeOnLevel}
                      on:change={() => handleChange('showTimeOnLevel', !localTemplate.showTimeOnLevel)}
                      aria-label="Show time on level"
                    />
                  </label>
                </div>

                <div class="space-y-3" class:opacity-50={!localTemplate.showTimeOnLevel}>
                  <div>
                    <label for="time-format" class="block text-sm mb-1" style="color: {$colorStore.muted}">Format</label>
                    <input
                      id="time-format"
                      type="text"
                      bind:value={localTemplate.timeOnLevelFormat}
                      on:input={() => handleChange('timeOnLevelFormat', localTemplate.timeOnLevelFormat)}
                      on:focus={handleInputFocus}
                      class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="{0}d{1}h{2}m"
                    />
                    <p class="text-xs mt-1 px-2 py-1 rounded"
                       style="background: {$colorStore.primary}10; color: {$colorStore.muted};">
                      Format uses {0} for days, {1} for hours, {2} for minutes
                    </p>
                  </div>

                  <div>
                    <label for="time-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Text
                      Color</label>
                    <div class="flex gap-2">
                      <input
                        id="time-color"
                        type="text"
                        value={formatColor(localTemplate.timeOnLevelColor)}
                        on:input={handleColorInput('timeOnLevelColor')}
                        on:focus={handleInputFocus}
                        class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        pattern="^#?[0-9A-Fa-f]{6,8}$"
                        placeholder="#RRGGBB"
                      />
                      <input
                        type="color"
                        value={formatColor(localTemplate.timeOnLevelColor)}
                        on:input={handleColorInput('timeOnLevelColor')}
                        class="w-10 h-10 rounded-lg border cursor-pointer"
                        style="border-color: {$colorStore.primary}30;"
                        aria-labelledby="time-color"
                      />
                    </div>
                  </div>

                  <!-- Time On Level Font Size with Slider -->
                  <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                    <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                    <div class="flex items-center">
                      <input
                        id="time-font-size"
                        type="range"
                        bind:value={localTemplate.timeOnLevelFontSize}
                        on:input={() => handleChange('timeOnLevelFontSize', localTemplate.timeOnLevelFontSize)}
                        min="10"
                        max="100"
                        step="1"
                        class="w-full mr-2"
                      />
                      <input
                        type="number"
                        bind:value={localTemplate.timeOnLevelFontSize}
                        on:input={() => handleChange('timeOnLevelFontSize', localTemplate.timeOnLevelFontSize)}
                        on:focus={handleInputFocus}
                        class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        min="10"
                        max="100"
                        aria-labelledby="time-font-size"
                      />
                    </div>
                    <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="time-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        X</label>
                      <input
                        id="time-x"
                        type="number"
                        bind:value={localTemplate.timeOnLevelX}
                        on:input={() => handleChange('timeOnLevelX', localTemplate.timeOnLevelX)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="time-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        Y</label>
                      <input
                        id="time-y"
                        type="number"
                        bind:value={localTemplate.timeOnLevelY}
                        on:input={() => handleChange('timeOnLevelY', localTemplate.timeOnLevelY)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Club Tag Content -->
          {:else if editorActiveTab === 'club'}
            <div class="space-y-6" transition:fade={{ duration: 200 }}>
              <h3 class="text-lg font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                <Award size={20} style="color: {$colorStore.primary}" />
                Club Settings
              </h3>

              <!-- Club Name Settings -->
              <div
                class="border rounded-lg p-4 space-y-4"
                style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}20;"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                    <Type size={18} style="color: {$colorStore.primary}" />
                    Club Name
                  </h4>
                  <label class="flex items-center gap-2">
                    <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                    <input
                      type="checkbox"
                      class="w-4 h-4 rounded"
                      checked={localTemplate.templateClub.showClubName}
                      on:change={() => handleChange('templateClub.showClubName', !localTemplate.templateClub.showClubName)}
                      aria-label="Show club name"
                    />
                  </label>
                </div>

                <div class="space-y-3" class:opacity-50={!localTemplate.templateClub.showClubName}>
                  <div>
                    <label for="club-name-color" class="block text-sm mb-1" style="color: {$colorStore.muted}">Text
                      Color</label>
                    <div class="flex gap-2">
                      <input
                        id="club-name-color"
                        type="text"
                        value={formatColor(localTemplate.templateClub.clubNameColor)}
                        on:input={handleColorInput('templateClub.clubNameColor')}
                        on:focus={handleInputFocus}
                        class="flex-1 p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        pattern="^#?[0-9A-Fa-f]{6,8}$"
                        placeholder="#RRGGBB"
                      />
                      <input
                        type="color"
                        value={formatColor(localTemplate.templateClub.clubNameColor)}
                        on:input={handleColorInput('templateClub.clubNameColor')}
                        class="w-10 h-10 rounded-lg border cursor-pointer"
                        style="border-color: {$colorStore.primary}30;"
                        aria-labelledby="club-name-color"
                      />
                    </div>
                  </div>

                  <!-- Club Name Font Size with Slider -->
                  <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                    <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Font Size</h5>
                    <div class="flex items-center">
                      <input
                        id="club-name-font-size"
                        type="range"
                        bind:value={localTemplate.templateClub.clubNameFontSize}
                        on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                        min="10"
                        max="100"
                        step="1"
                        class="w-full mr-2"
                      />
                      <input
                        type="number"
                        bind:value={localTemplate.templateClub.clubNameFontSize}
                        on:input={() => handleChange('templateClub.clubNameFontSize', localTemplate.templateClub.clubNameFontSize)}
                        on:focus={handleInputFocus}
                        class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        min="10"
                        max="100"
                        aria-labelledby="club-name-font-size"
                      />
                    </div>
                    <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="club-name-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        X</label>
                      <input
                        id="club-name-x"
                        type="number"
                        bind:value={localTemplate.templateClub.clubNameX}
                        on:input={() => handleChange('templateClub.clubNameX', localTemplate.templateClub.clubNameX)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="club-name-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        Y</label>
                      <input
                        id="club-name-y"
                        type="number"
                        bind:value={localTemplate.templateClub.clubNameY}
                        on:input={() => handleChange('templateClub.clubNameY', localTemplate.templateClub.clubNameY)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Club Icon Settings -->
              <div
                class="border rounded-lg p-4 space-y-4"
                style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}20;"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
                    <Image size={18} style="color: {$colorStore.secondary}" />
                    Club Icon
                  </h4>
                  <label class="flex items-center gap-2">
                    <span class="text-sm" style="color: {$colorStore.muted}">Show</span>
                    <input
                      type="checkbox"
                      class="w-4 h-4 rounded"
                      checked={localTemplate.templateClub.showClubIcon}
                      on:change={() => handleChange('templateClub.showClubIcon', !localTemplate.templateClub.showClubIcon)}
                      aria-label="Show club icon"
                    />
                  </label>
                </div>

                <div class="space-y-3" class:opacity-50={!localTemplate.templateClub.showClubIcon}>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="club-icon-x" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        X</label>
                      <input
                        id="club-icon-x"
                        type="number"
                        bind:value={localTemplate.templateClub.clubIconX}
                        on:input={() => handleChange('templateClub.clubIconX', localTemplate.templateClub.clubIconX)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="club-icon-y" class="block text-sm mb-1" style="color: {$colorStore.muted}">Position
                        Y</label>
                      <input
                        id="club-icon-y"
                        type="number"
                        bind:value={localTemplate.templateClub.clubIconY}
                        on:input={() => handleChange('templateClub.clubIconY', localTemplate.templateClub.clubIconY)}
                        on:focus={handleInputFocus}
                        class="w-full p-2 rounded-lg bg-gray-900/70 border input-field"
                        style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>

                  <!-- Club Icon Size with Sliders -->
                  <div class="p-3 rounded-lg" style="background: {$colorStore.secondary}15;">
                    <h5 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Icon Size</h5>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label for="club-icon-width" class="block text-xs mb-1"
                               style="color: {$colorStore.muted}">Width</label>
                        <div class="flex items-center">
                          <input
                            id="club-icon-width"
                            type="range"
                            bind:value={localTemplate.templateClub.clubIconSizeX}
                            on:input={() => handleChange('templateClub.clubIconSizeX', localTemplate.templateClub.clubIconSizeX)}
                            min="10"
                            max="200"
                            step="1"
                            class="w-full mr-2"
                          />
                          <input
                            type="number"
                            bind:value={localTemplate.templateClub.clubIconSizeX}
                            on:input={() => handleChange('templateClub.clubIconSizeX', localTemplate.templateClub.clubIconSizeX)}
                            on:focus={handleInputFocus}
                            class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                            style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                            min="10"
                            aria-labelledby="club-icon-width"
                          />
                        </div>
                      </div>
                      <div>
                        <label for="club-icon-height" class="block text-xs mb-1"
                               style="color: {$colorStore.muted}">Height</label>
                        <div class="flex items-center">
                          <input
                            id="club-icon-height"
                            type="range"
                            bind:value={localTemplate.templateClub.clubIconSizeY}
                            on:input={() => handleChange('templateClub.clubIconSizeY', localTemplate.templateClub.clubIconSizeY)}
                            min="10"
                            max="200"
                            step="1"
                            class="w-full mr-2"
                          />
                          <input
                            type="number"
                            bind:value={localTemplate.templateClub.clubIconSizeY}
                            on:input={() => handleChange('templateClub.clubIconSizeY', localTemplate.templateClub.clubIconSizeY)}
                            on:focus={handleInputFocus}
                            class="w-16 p-1 text-sm rounded-lg bg-gray-900/70 border input-field"
                            style="border-color: {$colorStore.secondary}30; color: {$colorStore.text};"
                            min="10"
                            aria-labelledby="club-icon-height"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
    {/if}

  </div>
{:else}
  <div class="text-center py-12" style="color: {$colorStore.muted}">
    No template data available
  </div>
{/if}

<style>
  .template-editor-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Mobile Layout (default) */
  .mobile-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .mobile-layout .preview-section {
    width: 100%;
  }

  .mobile-layout .settings-section {
    width: 100%;
  }

  /* Tablet Layout */
  .tablet-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
    align-items: start;
  }

  .tablet-layout .preview-section {
    min-height: 600px;
  }

  .tablet-layout .settings-section {
    position: sticky;
    top: 1rem;
    max-height: calc(100vh - 120px);
  }

  /* Desktop Layout */
  .desktop-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    align-items: start;
  }

  .desktop-layout .preview-section {
    min-height: 700px;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.02) 0%, rgba(var(--color-primary-rgb), 0.05) 100%);
    border-radius: 0.75rem;
    border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  }

  .desktop-layout .settings-section {
    position: sticky;
    top: 1rem;
    height: calc(100vh - 120px);
    overflow: hidden;
  }

  .preview-section {
    transition: all 0.3s ease;
  }

  .settings-section {
    transition: all 0.3s ease;
  }

  /* Preview Container and Toolbar Styling */
  .preview-container {
    position: relative;
    height: 100%;
  }

  .floating-toolbar {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
    z-index: 10;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 0.75rem;
    padding: 0.5rem;
    border: 1px solid rgba(var(--color-primary-rgb), 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideInFromRight 0.3s ease-out;
  }

  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid;
    border-radius: 0.5rem;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toolbar-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
  }

  .toolbar-btn.active {
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.4);
  }

  .zoom-display {
    font-size: 0.75rem;
    font-weight: 500;
    min-width: 2.5rem;
    text-align: center;
    padding: 0 0.25rem;
  }

  .preview-wrapper {
    height: 100%;
    width: 100%;
    overflow: hidden;
    border-radius: 0.75rem;
    position: relative;
    transition: all 0.3s ease;
  }

  .preview-wrapper:hover {
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.3);
  }

  /* Drag and Drop Visual Feedback */
  :global(.dragging-active) {
    cursor: grabbing !important;
  }

  :global(.template-element.dragging) {
    opacity: 0.8;
    z-index: 1000;
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  :global(.template-element.hover) {
    outline: 2px solid rgba(var(--color-primary-rgb), 0.6);
    outline-offset: 2px;
  }

  /* Enhanced preview styling for larger screens */
  @media (min-width: 768px) {
    .preview-section :global(.template-preview-container) {
      padding: 2rem;
      background: radial-gradient(circle at center, rgba(var(--color-primary-rgb), 0.03) 0%, transparent 70%);
      border-radius: 1rem;
      min-height: 400px;
    }

    .preview-wrapper {
      background: linear-gradient(135deg, 
        rgba(var(--color-primary-rgb), 0.02) 0%, 
        rgba(var(--color-primary-rgb), 0.05) 100%);
      border: 1px solid rgba(var(--color-primary-rgb), 0.1);
    }
  }

  @media (min-width: 1024px) {
    .preview-section :global(.template-preview-container) {
      padding: 3rem;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-wrapper {
      min-height: 600px;
    }

    .floating-toolbar {
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(15px);
    }
  }

  /* Accordion Container Styles */
  .desktop-layout .settings-section .accordion-container,
  .tablet-layout .settings-section .accordion-container {
    overflow-y: auto;
    flex: 1;
    padding: 1rem;
    scroll-behavior: smooth;
  }

  .tablet-layout .settings-section {
    position: sticky;
    top: 1rem;
    height: calc(100vh - 120px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .tablet-layout .settings-section > div {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* Mobile settings keep normal flow */
  .mobile-layout .settings-section {
    overflow: visible;
    height: auto;
  }

  .mobile-layout .settings-section .p-4 {
    padding: 1rem;
  }

  /* Custom scrollbar for settings */
  .accordion-container::-webkit-scrollbar {
    width: 6px;
  }

  .accordion-container::-webkit-scrollbar-track {
    background: rgba(var(--color-primary-rgb), 0.1);
    border-radius: 3px;
  }

  .accordion-container::-webkit-scrollbar-thumb {
    background: rgba(var(--color-primary-rgb), 0.3);
    border-radius: 3px;
  }

  .accordion-container::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--color-primary-rgb), 0.5);
  }

  /* Portal Full Page Mode Styles */
  .template-editor-fullpage {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    padding: 1.5rem;
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2rem;
    align-items: start;
    max-width: none;
    max-height: none;
  }

  .preview-section-fullpage {
    background: rgba(var(--color-primary-rgb), 0.05);
    border-radius: 1rem;
    border: 1px solid rgba(var(--color-primary-rgb), 0.2);
    position: relative;
    overflow: hidden;
    height: 100%;
    min-height: calc(100vh - 3rem);
  }

  .settings-section-fullpage {
    background: rgba(var(--color-primary-rgb), 0.02);
    border-radius: 1rem;
    border: 1px solid rgba(var(--color-primary-rgb), 0.1);
    height: calc(100vh - 3rem);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 450px;
  }

  .template-editor-fullpage .floating-toolbar {
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(var(--color-primary-rgb), 0.3);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  }

  .template-editor-fullpage .accordion-container {
    overflow-y: auto;
    flex: 1;
    padding: 1rem;
    scroll-behavior: smooth;
  }

  /* Mobile full-page mode */
  @media (max-width: 767px) {
    .template-editor-fullpage {
      grid-template-columns: 1fr;
      padding: 0.5rem;
    }
  }
</style>