<!-- lib/components/dashboard/xp/XpTemplateEditor.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade } from "svelte/transition";
  import Portal from "$lib/components/ui/Portal.svelte";

  interface Props {
    localTemplate: any;
    changedSettings: Set<string>;
    currentUserData: any;
    sampleData: any;
    showEditor: boolean;
  }

  let {
    localTemplate = $bindable(),
    changedSettings = $bindable(),
    currentUserData = $bindable(),
    sampleData = $bindable(),
    showEditor = $bindable()
  }: Props = $props();

  // Canvas and viewport state
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let canvasContainer: HTMLDivElement;
  let zoom = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isPanning = $state(false);
  let lastMouseX = 0;
  let lastMouseY = 0;

  // Editor state
  let selectedElement = $state<string | null>(null);
  let hoveredElement = $state<string | null>(null);
  let isDragging = $state(false);
  let dragTarget = $state<string | null>(null);
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartElementX = 0;
  let dragStartElementY = 0;
  let showGrid = $state(true);
  let snapToGrid = $state(true);
  let gridSize = $state(10);
  let showRulers = $state(true);
  let lockProportions = $state(false);
  let backgroundImage = $state<HTMLImageElement | null>(null);
  let backgroundImageLoading = $state(false);
  let defaultBgImage = $state<HTMLImageElement | null>(null);

  // Panel states
  let panels = $state({
    layers: { open: true, pinned: false },
    properties: { open: true, pinned: true },
    user: { open: false, pinned: false },
    bar: { open: false, pinned: false },
    guild: { open: false, pinned: false },
    club: { open: false, pinned: false },
    text: { open: false, pinned: false }
  });

  // Preview mode
  let previewMode = $state<"edit" | "preview">("edit");
  let useRealData = $state(false);

  // Undo/Redo stack
  let undoStack: string[] = $state([]);
  let redoStack: string[] = $state([]);

  // Load default background image once on mount
  let defaultImageLoaded = false;

  onMount(() => {
    if (!defaultImageLoaded) {
      defaultImageLoaded = true;
      const img = new Image();
      img.onload = () => {
        defaultBgImage = img;
        if (canvas && ctx) {
          redrawCanvas();
        }
      };
      img.onerror = () => {
        defaultBgImage = null;
      };
      img.src = "/img/default_xp_background.png";
    }
  });

  // Load custom background image if available
  $effect(() => {
    if (localTemplate?.customXpImageUrl) {
      backgroundImageLoading = true;
      const img = new Image();
      img.onload = () => {
        backgroundImage = img;
        backgroundImageLoading = false;
        redrawCanvas();
      };
      img.onerror = () => {
        backgroundImage = null;
        backgroundImageLoading = false;
        redrawCanvas();
      };
      img.src = localTemplate.customXpImageUrl;
    } else {
      backgroundImage = null;
      redrawCanvas();
    }
  });
  let maxUndoLevels = 50;

  // Element definitions for the layer system
  let elements = $derived([
    {
      id: "user-icon",
      type: "image",
      label: "User Avatar",
      visible: localTemplate?.templateUser?.showIcon,
      locked: false,
      x: localTemplate?.templateUser?.iconX || 0,
      y: localTemplate?.templateUser?.iconY || 0,
      width: localTemplate?.templateUser?.iconSizeX || 100,
      height: localTemplate?.templateUser?.iconSizeY || 100
    },
    {
      id: "user-text",
      type: "text",
      label: "Username",
      visible: localTemplate?.templateUser?.showText,
      locked: false,
      x: localTemplate?.templateUser?.textX || 120,
      y: localTemplate?.templateUser?.textY || 50,
      fontSize: localTemplate?.templateUser?.fontSize || 24,
      color: localTemplate?.templateUser?.textColor || "FFFFFF"
    },
    {
      id: "progress-bar",
      type: "bar",
      label: "XP Progress Bar",
      visible: localTemplate?.templateBar?.showBar,
      locked: false,
      x1: localTemplate?.templateBar?.barPointAx || 319,
      y1: localTemplate?.templateBar?.barPointAy || 119,
      x2: localTemplate?.templateBar?.barPointBx || 284,
      y2: localTemplate?.templateBar?.barPointBy || 250,
      width: localTemplate?.templateBar?.barWidth || 20,
      length: localTemplate?.templateBar?.barLength || 452,
      direction: localTemplate?.templateBar?.barDirection ?? 3,
      transparency: localTemplate?.templateBar?.barTransparency || 255,
      color: localTemplate?.templateBar?.barColor || "FF000000"
    },
    {
      id: "guild-rank",
      type: "text",
      label: "Guild Rank",
      visible: localTemplate?.templateGuild?.showGuildRank,
      locked: false,
      x: localTemplate?.templateGuild?.guildRankX || 50,
      y: localTemplate?.templateGuild?.guildRankY || 150,
      fontSize: localTemplate?.templateGuild?.guildRankFontSize || 18,
      color: localTemplate?.templateGuild?.guildRankColor || "FFFFFF"
    },
    {
      id: "guild-level",
      type: "text",
      label: "Guild Level",
      visible: localTemplate?.templateGuild?.showGuildLevel,
      locked: false,
      x: localTemplate?.templateGuild?.guildLevelX || 350,
      y: localTemplate?.templateGuild?.guildLevelY || 150,
      fontSize: localTemplate?.templateGuild?.guildLevelFontSize || 18,
      color: localTemplate?.templateGuild?.guildLevelColor || "FFFFFF"
    },
    {
      id: "club-icon",
      type: "image",
      label: "Club Icon",
      visible: localTemplate?.templateClub?.showClubIcon,
      locked: false,
      x: localTemplate?.templateClub?.clubIconX || 300,
      y: localTemplate?.templateClub?.clubIconY || 30,
      width: localTemplate?.templateClub?.clubIconSizeX || 50,
      height: localTemplate?.templateClub?.clubIconSizeY || 50
    },
    {
      id: "club-name",
      type: "text",
      label: "Club Name",
      visible: localTemplate?.templateClub?.showClubName,
      locked: false,
      x: localTemplate?.templateClub?.clubNameX || 360,
      y: localTemplate?.templateClub?.clubNameY || 55,
      fontSize: localTemplate?.templateClub?.clubNameFontSize || 16,
      color: localTemplate?.templateClub?.clubNameColor || "FFFFFF"
    },
    {
      id: "time-on-level",
      type: "text",
      label: "Time on Level",
      visible: localTemplate?.showTimeOnLevel,
      locked: false,
      x: localTemplate?.timeOnLevelX || 200,
      y: localTemplate?.timeOnLevelY || 250,
      fontSize: localTemplate?.timeOnLevelFontSize || 14,
      color: localTemplate?.timeOnLevelColor || "AAAAAA"
    },
    {
      id: "awarded",
      type: "text",
      label: "Awarded XP",
      visible: localTemplate?.showAwarded,
      locked: false,
      x: localTemplate?.awardedX || 200,
      y: localTemplate?.awardedY || 280,
      fontSize: localTemplate?.awardedFontSize || 14,
      color: localTemplate?.awardedColor || "FFD700"
    }
  ]);

  // Save current state to undo stack
  function saveUndoState() {
    const currentState = JSON.stringify(localTemplate);
    undoStack.push(currentState);
    if (undoStack.length > maxUndoLevels) {
      undoStack.shift();
    }
    redoStack = [];
  }

  // Undo last action
  function undo() {
    if (undoStack.length > 0) {
      const currentState = JSON.stringify(localTemplate);
      redoStack.push(currentState);
      const previousState = undoStack.pop()!;
      localTemplate = JSON.parse(previousState);
      markAsChanged();
      redrawCanvas();
    }
  }

  // Redo last undone action
  function redo() {
    if (redoStack.length > 0) {
      const currentState = JSON.stringify(localTemplate);
      undoStack.push(currentState);
      const nextState = redoStack.pop()!;
      localTemplate = JSON.parse(nextState);
      markAsChanged();
      redrawCanvas();
    }
  }

  // Mark template as changed
  function markAsChanged() {
    changedSettings = changedSettings.add("template");
  }

  // Update element position
  function updateElementPosition(elementId: string, x: number, y: number) {
    saveUndoState();

    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    switch (elementId) {
      case "user-icon":
        localTemplate.templateUser.iconX = x;
        localTemplate.templateUser.iconY = y;
        break;
      case "user-text":
        localTemplate.templateUser.textX = x;
        localTemplate.templateUser.textY = y;
        break;
      case "guild-rank":
        localTemplate.templateGuild.guildRankX = x;
        localTemplate.templateGuild.guildRankY = y;
        break;
      case "guild-level":
        localTemplate.templateGuild.guildLevelX = x;
        localTemplate.templateGuild.guildLevelY = y;
        break;
      case "club-icon":
        localTemplate.templateClub.clubIconX = x;
        localTemplate.templateClub.clubIconY = y;
        break;
      case "club-name":
        localTemplate.templateClub.clubNameX = x;
        localTemplate.templateClub.clubNameY = y;
        break;
      case "time-on-level":
        localTemplate.timeOnLevelX = x;
        localTemplate.timeOnLevelY = y;
        break;
      case "awarded":
        localTemplate.awardedX = x;
        localTemplate.awardedY = y;
        break;
    }

    if (elementId === "progress-bar") {
      const element = elements.find(e => e.id === elementId);
      if (element && element.type === "bar") {
        const deltaX = x - element.x1;
        const deltaY = y - element.y1;
        localTemplate.templateBar.barPointAx = x;
        localTemplate.templateBar.barPointAy = y;
        localTemplate.templateBar.barPointBx = element.x2 + deltaX;
        localTemplate.templateBar.barPointBy = element.y2 + deltaY;
      }
    }

    markAsChanged();
    redrawCanvas();
  }

  // Toggle element visibility
  function toggleElementVisibility(elementId: string) {
    saveUndoState();

    switch (elementId) {
      case "user-icon":
        localTemplate.templateUser.showIcon = !localTemplate.templateUser.showIcon;
        break;
      case "user-text":
        localTemplate.templateUser.showText = !localTemplate.templateUser.showText;
        break;
      case "progress-bar":
        localTemplate.templateBar.showBar = !localTemplate.templateBar.showBar;
        break;
      case "guild-rank":
        localTemplate.templateGuild.showGuildRank = !localTemplate.templateGuild.showGuildRank;
        break;
      case "guild-level":
        localTemplate.templateGuild.showGuildLevel = !localTemplate.templateGuild.showGuildLevel;
        break;
      case "club-icon":
        localTemplate.templateClub.showClubIcon = !localTemplate.templateClub.showClubIcon;
        break;
      case "club-name":
        localTemplate.templateClub.showClubName = !localTemplate.templateClub.showClubName;
        break;
      case "time-on-level":
        localTemplate.showTimeOnLevel = !localTemplate.showTimeOnLevel;
        break;
      case "awarded":
        localTemplate.showAwarded = !localTemplate.showAwarded;
        break;
    }

    markAsChanged();
    redrawCanvas();
  }

  // Toggle panel visibility
  function togglePanel(panelId: keyof typeof panels) {
    panels[panelId].open = !panels[panelId].open;
  }

  // Pin/unpin panel
  function togglePanelPin(panelId: keyof typeof panels) {
    panels[panelId].pinned = !panels[panelId].pinned;
  }

  // Redraw the canvas
  function redrawCanvas() {
    if (!ctx || !canvas) return;

    const context = ctx;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    context.save();

    // Apply zoom and pan
    context.translate(panX, panY);
    context.scale(zoom, zoom);

    // Draw background
    if (backgroundImage && !backgroundImageLoading) {
      // Custom background image
      context.drawImage(backgroundImage, 0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
    } else if (defaultBgImage) {
      // Default background with gradient (since default is transparent)
      // First draw gradient
      const bgGradient = context.createLinearGradient(0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
      bgGradient.addColorStop(0, `${$colorStore.primary}15`);
      bgGradient.addColorStop(0.5, `${$colorStore.primary}20`);
      bgGradient.addColorStop(1, `${$colorStore.secondary}15`);
      context.fillStyle = bgGradient;
      context.fillRect(0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);

      // Then draw transparent default image on top
      context.drawImage(defaultBgImage, 0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
    }

    // Draw grid if enabled
    if (showGrid && previewMode === "edit") {
      context.strokeStyle = `${$colorStore.primary}20`;
      context.lineWidth = 0.5;
      context.setLineDash([2, 4]);

      for (let x = 0; x <= localTemplate.outputSizeX; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, localTemplate.outputSizeY);
        context.stroke();
      }

      for (let y = 0; y <= localTemplate.outputSizeY; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(localTemplate.outputSizeX, y);
        context.stroke();
      }

      context.setLineDash([]);
    }

    // Draw elements
    elements.forEach(element => {
      if (!element.visible) return;

      const isSelected = selectedElement === element.id;
      const isHovered = hoveredElement === element.id;

      if (element.type === "image") {
        // Draw placeholder image
        context.fillStyle = `${$colorStore.primary}30`;
        context.fillRect(element.x, element.y, element.width, element.height);

        // Draw image border
        context.strokeStyle = isSelected ? $colorStore.accent : isHovered ? $colorStore.primary : `${$colorStore.primary}40`;
        context.lineWidth = isSelected ? 2 : 1;
        context.strokeRect(element.x, element.y, element.width, element.height);

        // Draw label
        context.fillStyle = $colorStore.text;
        context.font = "12px Inter";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(element.label, element.x + element.width / 2, element.y + element.height / 2);
      } else if (element.type === "text") {
        // Draw text
        context.fillStyle = element.color.startsWith("#") ? element.color : `#${element.color}`;
        context.font = `${element.fontSize}px Inter`;
        context.textAlign = "left";
        context.textBaseline = "top";

        const displayText = useRealData && currentUserData
          ? getTextContent(element.id, currentUserData)
          : getTextContent(element.id, sampleData);

        context.fillText(displayText, element.x, element.y);

        // Draw selection box in edit mode
        if (previewMode === "edit" && (isSelected || isHovered)) {
          const metrics = context.measureText(displayText);
          context.strokeStyle = isSelected ? $colorStore.accent : $colorStore.primary;
          context.lineWidth = isSelected ? 2 : 1;
          context.setLineDash(isSelected ? [] : [4, 4]);
          context.strokeRect(
            element.x - 5,
            element.y - 5,
            metrics.width + 10,
            element.fontSize + 10
          );
          context.setLineDash([]);
        }
      } else if (element.type === "bar") {
        // Draw progress bar as a filled polygon (matching C# DrawXpBar method)
        const percent = (useRealData && currentUserData?.progress ? currentUserData.progress : sampleData.progress) / 100;
        const direction = localTemplate?.templateBar?.barDirection ?? 3; // C# enum: 0=Up, 1=Down, 2=Left, 3=Right (default)
        const barLength = localTemplate?.templateBar?.barLength || 452;
        const transparency = localTemplate?.templateBar?.barTransparency || 255;

        // Calculate progress length
        const length = barLength * percent;

        // Calculate the four corners of the progress bar based on C# XpTemplateDirection enum
        // 0=Up, 1=Down, 2=Left, 3=Right
        let x3, x4, y3, y4;
        const x1 = element.x1;
        const y1 = element.y1;
        const x2 = element.x2;
        const y2 = element.y2;

        switch (direction) {
          case 1: // Down
            x3 = x1;
            x4 = x2;
            y3 = y1 + length;
            y4 = y2 + length;
            break;
          case 0: // Up
            x3 = x1;
            x4 = x2;
            y3 = y1 - length;
            y4 = y2 - length;
            break;
          case 2: // Left
            x3 = x1 - length;
            x4 = x2 - length;
            y3 = y1;
            y4 = y2;
            break;
          default: // Right (3)
            x3 = x1 + length;
            x4 = x2 + length;
            y3 = y1;
            y4 = y2;
            break;
        }

        // Draw the progress bar as a filled path
        context.save();

        // Parse color - handle ARGB format from C# (e.g., "FF000000")
        let barColor = element.color;
        if (!barColor.startsWith("#")) {
          // Convert ARGB to RGB (skip first 2 chars if 8 chars long)
          if (barColor.length === 8) {
            barColor = "#" + barColor.slice(2);
          } else {
            barColor = "#" + barColor;
          }
        }

        context.fillStyle = barColor;
        context.globalAlpha = transparency / 255;

        // Draw the path exactly as C# does
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x3, y3);
        context.lineTo(x4, y4);
        context.lineTo(x2, y2);
        context.closePath();
        context.fill();

        context.restore();

        // Draw selection handles in edit mode
        if (previewMode === "edit" && (isSelected || isHovered)) {
          context.fillStyle = isSelected ? $colorStore.accent : $colorStore.primary;
          context.beginPath();
          context.arc(x1, y1, 5, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.arc(x2, y2, 5, 0, Math.PI * 2);
          context.fill();
        }
      }

      // Draw lock indicator
      if (element.locked && previewMode === "edit") {
        context.fillStyle = $colorStore.accent;
        context.font = "10px Inter";
        context.textAlign = "right";
        context.textBaseline = "top";
        context.fillText("🔒", element.x + element.width - 5, element.y + 5);
      }
    });

    // Draw rulers if enabled
    if (showRulers && previewMode === "edit") {
      // Horizontal ruler
      context.fillStyle = `${$colorStore.primary}08`;
      context.fillRect(0, -30, localTemplate.outputSizeX, 30);
      context.strokeStyle = `${$colorStore.primary}40`;
      context.lineWidth = 1;
      context.strokeRect(0, -30, localTemplate.outputSizeX, 30);

      // Draw ruler marks
      context.fillStyle = `#${$colorStore.text}`;
      context.font = "10px Inter";
      context.textAlign = "center";
      context.textBaseline = "middle";
      for (let x = 0; x <= localTemplate.outputSizeX; x += 50) {
        context.beginPath();
        context.moveTo(x, -30);
        context.lineTo(x, -20);
        context.stroke();
        context.fillText(x.toString(), x, -10);
      }

      // Vertical ruler
      context.fillStyle = `${$colorStore.primary}08`;
      context.fillRect(-30, 0, 30, localTemplate.outputSizeY);
      context.strokeStyle = `${$colorStore.primary}40`;
      context.strokeRect(-30, 0, 30, localTemplate.outputSizeY);

      // Draw ruler marks
      context.save();
      context.rotate(-Math.PI / 2);
      for (let y = 0; y <= localTemplate.outputSizeY; y += 50) {
        context.beginPath();
        context.moveTo(-y, -30);
        context.lineTo(-y, -20);
        context.stroke();
        context.fillText(y.toString(), -y, -10);
      }
      context.restore();
    }

    // Restore context state
    context.restore();

    // Draw zoom indicator
    if (zoom !== 1) {
      context.fillStyle = $colorStore.primary;
      context.font = "14px Inter";
      context.textAlign = "right";
      context.textBaseline = "bottom";
      context.fillText(`${Math.round(zoom * 100)}%`, canvas.width - 10, canvas.height - 10);
    }
  }

  // Get text content for display
  function getTextContent(elementId: string, data: any): string {
    switch (elementId) {
      case "user-text":
        return data?.username || "Username";
      case "guild-rank":
        return `Rank #${data?.rank || 1}`;
      case "guild-level":
        return `Level ${data?.level || 1}`;
      case "club-name":
        return data?.clubName || "Club Name";
      case "time-on-level":
        return data?.timeOnLevel || "0d 0h 0m";
      case "awarded":
        return `+${data?.awardedXp || 0} XP`;
      default:
        return "";
    }
  }

  // Handle canvas mouse down
  function handleCanvasMouseDown(event: MouseEvent) {
    if (previewMode === "preview") return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - panX) / zoom;
    const y = (event.clientY - rect.top - panY) / zoom;

    // Check if clicking on an element
    const clickedElement = elements.find(element => {
      if (!element.visible) return false;

      if (element.type === "image") {
        return x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height;
      } else if (element.type === "text") {
        // Approximate text bounds
        return x >= element.x - 5 && x <= element.x + 100 &&
          y >= element.y - 5 && y <= element.y + element.fontSize + 5;
      } else if (element.type === "bar") {
        // Check if near the line
        const dist1 = Math.sqrt((x - element.x1) ** 2 + (y - element.y1) ** 2);
        const dist2 = Math.sqrt((x - element.x2) ** 2 + (y - element.y2) ** 2);
        return dist1 < 10 || dist2 < 10;
      }
      return false;
    });

    if (clickedElement && !clickedElement.locked) {
      selectedElement = clickedElement.id;
      isDragging = true;
      dragTarget = clickedElement.id;
      dragStartX = x;
      dragStartY = y;
      // Store the element's initial position
      if (clickedElement.type === "bar") {
        dragStartElementX = clickedElement.x1;
        dragStartElementY = clickedElement.y1;
      } else {
        dragStartElementX = clickedElement.x;
        dragStartElementY = clickedElement.y;
      }
    } else if (!event.shiftKey) {
      // Start panning
      isPanning = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }

    redrawCanvas();
  }

  // Handle canvas mouse move
  function handleCanvasMouseMove(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - panX) / zoom;
    const y = (event.clientY - rect.top - panY) / zoom;

    if (isDragging && dragTarget) {
      const deltaX = x - dragStartX;
      const deltaY = y - dragStartY;

      const element = elements.find(e => e.id === dragTarget);
      if (element) {
        // Calculate new position based on initial position + total delta
        const newX = dragStartElementX + deltaX;
        const newY = dragStartElementY + deltaY;
        updateElementPosition(dragTarget, newX, newY);
      }
    } else if (isPanning) {
      panX += event.clientX - lastMouseX;
      panY += event.clientY - lastMouseY;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      redrawCanvas();
    } else {
      // Check hover
      const prevHovered = hoveredElement;
      hoveredElement = elements.find(element => {
        if (!element.visible) return false;

        if (element.type === "image") {
          return x >= element.x && x <= element.x + element.width &&
            y >= element.y && y <= element.y + element.height;
        } else if (element.type === "text") {
          return x >= element.x - 5 && x <= element.x + 100 &&
            y >= element.y - 5 && y <= element.y + element.fontSize + 5;
        } else if (element.type === "bar") {
          const dist1 = Math.sqrt((x - element.x1) ** 2 + (y - element.y1) ** 2);
          const dist2 = Math.sqrt((x - element.x2) ** 2 + (y - element.y2) ** 2);
          return dist1 < 10 || dist2 < 10;
        }
        return false;
      })?.id || null;

      if (prevHovered !== hoveredElement) {
        redrawCanvas();
      }
    }

    // Update cursor
    if (hoveredElement && !elements.find(e => e.id === hoveredElement)?.locked) {
      canvas.style.cursor = "move";
    } else if (isPanning) {
      canvas.style.cursor = "grabbing";
    } else {
      canvas.style.cursor = previewMode === "edit" ? "crosshair" : "default";
    }
  }

  // Handle canvas mouse up
  function handleCanvasMouseUp() {
    isDragging = false;
    dragTarget = null;
    isPanning = false;
  }

  // Handle wheel for zoom
  function handleWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      zoom = Math.max(0.1, Math.min(5, zoom * delta));
      redrawCanvas();
    }
  }

  // Keyboard shortcuts
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      showEditor = false;
      event.preventDefault();
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "z":
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          event.preventDefault();
          break;
        case "s":
          event.preventDefault();
          // Trigger save through parent component
          break;
        case "g":
          showGrid = !showGrid;
          redrawCanvas();
          event.preventDefault();
          break;
        case "r":
          showRulers = !showRulers;
          redrawCanvas();
          event.preventDefault();
          break;
      }
    } else if (event.key === "Delete" && selectedElement) {
      toggleElementVisibility(selectedElement);
    } else if (event.key === "Escape") {
      selectedElement = null;
      isDragging = false;
      dragTarget = null;
      isPanning = false;
      redrawCanvas();
    }
  }

  // Initialize canvas
  function initCanvas() {
    if (!canvas || !canvasContainer) return;

    ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const containerRect = canvasContainer.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    // Center the template
    panX = (canvas.width - localTemplate.outputSizeX * zoom) / 2;
    panY = (canvas.height - localTemplate.outputSizeY * zoom) / 2;

    redrawCanvas();
  }

  // Handle resize
  function handleResize() {
    if (canvas && canvasContainer) {
      initCanvas();
    }
  }

  onMount(() => {
    initCanvas();
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("keydown", handleKeyDown);
  });

  // React to template changes
  $effect(() => {
    if (localTemplate && ctx) {
      redrawCanvas();
    }
  });
</script>

<Portal target="body">
  <div class="fixed inset-0 z-[9999] flex flex-col" transition:fade={{ duration: 300 }}>
    <!-- Dark base with gradient overlay -->
    <div class="absolute inset-0" style="background: #0a0a0a"></div>
    <div class="absolute inset-0"
         style="background: radial-gradient(circle at center,
              {$colorStore.gradientStart}20 0%,
              {$colorStore.gradientEnd}15 50%,
              {$colorStore.gradientEnd}10 100%);"></div>
    <!-- Main Editor Container -->
    <div class="flex-1 flex h-full w-full relative z-10">
      <!-- Left Sidebar - Layers & Tools -->
      <div
        class="w-64 border-r flex flex-col transition-all duration-300 "
        class:w-12={!panels.layers.open}
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}12, {$colorStore.gradientMid}18);
           border-color: {$colorStore.primary}30;"
      >
        <!-- Layers Panel -->
        <div class="flex-1 flex flex-col">
          <div
            class="flex items-center justify-between p-3 border-b cursor-pointer"
            onclick={() => togglePanel("layers")}
            onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePanel("layers"); } }}
            role="button"
            style="border-color: {$colorStore.primary}20;"
            tabindex="0"
          >
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-layer-group" style="color: {$colorStore.primary}; font-size: 16px;"></i>
              {#if panels.layers.open}
                <span class="text-sm font-semibold" style="color: {$colorStore.text}">Layers</span>
              {/if}
            </div>
            {#if panels.layers.open}
              <button
                class="p-1 rounded-lg transition-all hover:scale-110"
                style="background: {$colorStore.primary}10;"
                onclick={(e) => { e.stopPropagation(); togglePanelPin("layers"); }}
              >
                {#if panels.layers.pinned}
                  <i class="fa-solid fa-lock" style="color: {$colorStore.primary}; font-size: 12px;"></i>
                {:else}
                  <i class="fa-solid fa-lock-open" style="color: {$colorStore.muted}; font-size: 12px;"></i>
                {/if}
              </button>
            {/if}
          </div>

          {#if panels.layers.open}
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
              {#each elements as element (element.id)}
                <div
                  class="p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.01]"
                  class:opacity-50={!element.visible}
                  style="background: {selectedElement === element.id ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                     border: 1px solid {selectedElement === element.id ? $colorStore.primary + '40' : 'transparent'};"
                  onclick={() => { selectedElement = element.id; redrawCanvas(); }}
                  onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectedElement = element.id; redrawCanvas(); } }}
                  role="button"
                  tabindex="0"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <button
                        class="p-1 rounded transition-all hover:scale-110"
                        style="background: {element.visible ? $colorStore.primary + '20' : 'transparent'};"
                        onclick={(e) => { e.stopPropagation(); toggleElementVisibility(element.id); }}
                      >
                        {#if element.visible}
                          <i class="fa-solid fa-eye" style="color: {$colorStore.primary}; font-size: 12px;"></i>
                        {:else}
                          <i class="fa-solid fa-eye-slash" style="color: {$colorStore.muted}; font-size: 12px;"></i>
                        {/if}
                      </button>
                      <span class="text-xs"
                            style="color: {$colorStore.text}">{element.label}</span>
                    </div>
                    {#if element.locked}
                      <i class="fa-solid fa-lock" style="color: {$colorStore.accent}; font-size: 12px;"></i>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Tools Section -->
        <div class="border-t p-3 space-y-2" style="border-color: {$colorStore.primary}20;">
          {#if panels.layers.open}
            <div class="grid grid-cols-2 gap-2">
              <button
                class="p-2 rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-1"
                style="background: {showGrid ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                   color: {showGrid ? $colorStore.primary : $colorStore.muted};"
                onclick={() => { showGrid = !showGrid; redrawCanvas(); }}
              >
                <i class="fa-solid fa-border-all" style="font-size: 16px;"></i>
                <span class="text-xs">Grid</span>
              </button>
              <button
                class="p-2 rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-1"
                style="background: {snapToGrid ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                   color: {snapToGrid ? $colorStore.primary : $colorStore.muted};"
                onclick={() => { snapToGrid = !snapToGrid; }}
              >
                <i class="fa-solid fa-crosshairs" style="font-size: 16px;"></i>
                <span class="text-xs">Snap</span>
              </button>
              <button
                class="p-2 rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-1"
                style="background: {showRulers ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                   color: {showRulers ? $colorStore.primary : $colorStore.muted};"
                onclick={() => { showRulers = !showRulers; redrawCanvas(); }}
              >
                <i class="fa-solid fa-ruler" style="font-size: 16px;"></i>
                <span class="text-xs">Rulers</span>
              </button>
              <button
                class="p-2 rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-1"
                style="background: {lockProportions ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                   color: {lockProportions ? $colorStore.primary : $colorStore.muted};"
                onclick={() => { lockProportions = !lockProportions; }}
              >
                {#if lockProportions}
                  <i class="fa-solid fa-lock" style="font-size: 16px;"></i>
                {:else}
                  <i class="fa-solid fa-lock-open" style="font-size: 16px;"></i>
                {/if}
                <span class="text-xs">Ratio</span>
              </button>
            </div>

            <div class="flex gap-2">
              <button aria-label="Undo"
                      class="flex-1 p-2 rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center"
                      style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                      onclick={undo}
                      disabled={undoStack.length === 0}
              >
                <i class="fa-solid fa-rotate-left" style="font-size: 16px;"></i>
              </button>
              <button aria-label="Redo"
                      class="flex-1 p-2 rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center"
                      style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                      onclick={redo}
                      disabled={redoStack.length === 0}
              >
                <i class="fa-solid fa-arrows-rotate" style="font-size: 16px;"></i>
              </button>
            </div>
          {:else}
            <div class="flex flex-col gap-2">
              <button
                class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                style="background: {showGrid ? $colorStore.primary + '20' : $colorStore.primary + '10'};"
                onclick={() => { showGrid = !showGrid; redrawCanvas(); }}
                aria-label={showGrid ? "Hide grid" : "Show grid"}
              >
                <i class="fa-solid fa-border-all"
                   style="color: {showGrid ? $colorStore.primary : $colorStore.muted}; font-size: 16px;"></i>
              </button>
              <button
                class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                style="background: {showRulers ? $colorStore.primary + '20' : $colorStore.primary + '10'};"
                onclick={() => { showRulers = !showRulers; redrawCanvas(); }}
                aria-label={showRulers ? "Hide rulers" : "Show rulers"}
              >
                <i class="fa-solid fa-ruler"
                   style="color: {showRulers ? $colorStore.primary : $colorStore.muted}; font-size: 16px;"></i>
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Main Canvas Area -->
      <div class="flex-1 flex flex-col relative">
        <!-- Top Toolbar -->
        <div
          class="h-14 border-b flex items-center justify-between px-4 "
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
             border-color: {$colorStore.primary}30;"
        >
          <div class="flex items-center gap-2">
            <!-- Mode Toggle -->
            <div
              class="flex rounded-lg p-1"
              style="background: {$colorStore.primary}10;"
            >
              <button
                class="px-3 py-1 rounded-md text-sm font-medium transition-all"
                onclick={() => { previewMode = 'edit'; redrawCanvas(); }}
                style="background: {previewMode === 'edit' ? $colorStore.primary + '30' : 'transparent'};
                   color: {previewMode === 'edit' ? $colorStore.primary : $colorStore.muted};"
              >
                Edit
              </button>
              <button
                class="px-3 py-1 rounded-md text-sm font-medium transition-all"
                onclick={() => { previewMode = 'preview'; redrawCanvas(); }}
                style="background: {previewMode === 'preview' ? $colorStore.primary + '30' : 'transparent'};
                   color: {previewMode === 'preview' ? $colorStore.primary : $colorStore.muted};"
              >
                Preview
              </button>
            </div>

            <div class="w-px h-8" style="background: {$colorStore.primary}20;"></div>

            <!-- Zoom Controls -->
            <div class="flex items-center gap-1">
              <button
                aria-label="Zoom out"
                class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                onclick={() => { zoom = Math.max(0.1, zoom - 0.1); redrawCanvas(); }}
                style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
              >
                <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 16px;"></i>
              </button>
              <button
                aria-label="Reset zoom"
                class="px-3 py-1 rounded-lg text-sm font-medium min-w-[60px]"
                onclick={() => { zoom = 1; panX = (canvas.width - localTemplate.outputSizeX) / 2; panY = (canvas.height - localTemplate.outputSizeY) / 2; redrawCanvas(); }}
                style="background: {$colorStore.primary}10; color: {$colorStore.text};"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                aria-label="Zoom in"
                class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                onclick={() => { zoom = Math.min(5, zoom + 0.1); redrawCanvas(); }}
                style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
              >
                <i class="fa-solid fa-magnifying-glass-plus" style="font-size: 16px;"></i>
              </button>
            </div>

            <div class="w-px h-8" style="background: {$colorStore.primary}20;"></div>

            <!-- Data Toggle -->
            <button
              class="px-3 py-1 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              onclick={() => { useRealData = !useRealData; redrawCanvas(); }}
              style="background: {useRealData ? $colorStore.secondary + '20' : $colorStore.primary + '10'};
                 color: {useRealData ? $colorStore.secondary : $colorStore.muted};"
            >
              {useRealData ? "Real Data" : "Sample Data"}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <!-- Canvas Size -->
            <div class="flex items-center gap-2 text-sm" style="color: {$colorStore.muted}">
              <span>{localTemplate.outputSizeX} × {localTemplate.outputSizeY}px</span>
            </div>

            <div class="w-px h-8" style="background: {$colorStore.primary}20;"></div>

            <!-- Action Buttons -->
            <button aria-label="Download"
                    class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
            >
              <i class="fa-solid fa-download" style="font-size: 16px;"></i>
            </button>
            <button aria-label="Upload"
                    class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
            >
              <i class="fa-solid fa-upload" style="font-size: 16px;"></i>
            </button>

            <div class="w-px h-8" style="background: {$colorStore.primary}20;"></div>

            <!-- Close Button -->
            <button aria-label="Close editor"
                    class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                    onclick={() => { showEditor = false; }}
                    style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                    title="Close Editor (Esc)"
            >
              <i class="fa-solid fa-xmark" style="font-size: 20px;"></i>
            </button>
          </div>
        </div>

        <!-- Canvas Container -->
        <div
          bind:this={canvasContainer}
          class="flex-1 relative overflow-hidden"
          style="background: radial-gradient(circle at center, {$colorStore.primary}12, transparent);"
        >
          <canvas
            bind:this={canvas}
            class="absolute inset-0"
            onmousedown={handleCanvasMouseDown}
            onmouseleave={handleCanvasMouseUp}
            onmousemove={handleCanvasMouseMove}
            onmouseup={handleCanvasMouseUp}
            onwheel={handleWheel}
          ></canvas>
        </div>
      </div>

      <!-- Right Sidebar - Properties -->
      <div
        class="w-80 border-l flex flex-col transition-all duration-300 "
        class:w-12={!panels.properties.open}
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}12, {$colorStore.gradientMid}18);
           border-color: {$colorStore.primary}30;"
      >
        <div
          class="flex items-center justify-between p-3 border-b cursor-pointer"
          onclick={() => togglePanel("properties")}
          onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePanel("properties"); } }}
          role="button"
          style="border-color: {$colorStore.primary}20;"
          tabindex="0"
        >
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-gear" style="color: {$colorStore.primary}; font-size: 16px;"></i>
            {#if panels.properties.open}
              <span class="text-sm font-semibold" style="color: {$colorStore.text}">Properties</span>
            {/if}
          </div>
          {#if panels.properties.open}
            <button
              class="p-1 rounded-lg transition-all hover:scale-110"
              style="background: {$colorStore.primary}10;"
              onclick={(e) => { e.stopPropagation(); togglePanelPin("properties"); }}
            >
              {#if panels.properties.pinned}
                <i class="fa-solid fa-lock" style="color: {$colorStore.primary}; font-size: 12px;"></i>
              {:else}
                <i class="fa-solid fa-lock-open" style="color: {$colorStore.muted}; font-size: 12px;"></i>
              {/if}
            </button>
          {/if}
        </div>

        {#if panels.properties.open}
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Canvas Settings -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-solid fa-image" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                Canvas
              </h3>
              <div class="space-y-2">
                <div>
                  <label for="input-7763" class="text-xs" style="color: {$colorStore.muted}">Width</label>
                  <input id="input-7763"
                         type="number"
                         class="w-full px-3 py-1.5 rounded-lg border text-sm"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                         bind:value={localTemplate.outputSizeX}
                         onchange={() => { markAsChanged(); initCanvas(); }}
                  >
                </div>
                <div>
                  <label for="input-148" class="text-xs" style="color: {$colorStore.muted}">Height</label>
                  <input id="input-148"
                         type="number"
                         class="w-full px-3 py-1.5 rounded-lg border text-sm"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                         bind:value={localTemplate.outputSizeY}
                         onchange={() => { markAsChanged(); initCanvas(); }}
                  >
                </div>
              </div>
            </div>

            {#if selectedElement}
              {@const element = elements.find(e => e.id === selectedElement)}
              {#if element}
                <div class="space-y-3">
                  <h3 class="text-sm font-semibold flex items-center gap-2"
                      style="color: {$colorStore.text}">
                    <i class="fa-solid fa-layer-group" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                    {element.label}
                  </h3>

                  {#if element.type === "image"}
                    <div class="space-y-2">
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label for="input-933" class="text-xs" style="color: {$colorStore.muted}">X Position</label>
                          <input id="input-933"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.x}
                                 onchange={(e) => updateElementPosition(element.id, Number(e.currentTarget.value), element.y)}
                          >
                        </div>
                        <div>
                          <label for="input-4981" class="text-xs" style="color: {$colorStore.muted}">Y Position</label>
                          <input id="input-4981"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.y}
                                 onchange={(e) => updateElementPosition(element.id, element.x, Number(e.currentTarget.value))}
                          >
                        </div>
                        <div>
                          <label for="input-7763" class="text-xs"
                                 style="color: {$colorStore.muted}">Width</label>
                          <input id="input-7763"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.width}
                                 onchange={(e) => {
                          saveUndoState();
                          if (element.id === "user-icon") {
                            localTemplate.templateUser.iconSizeX = Number(e.currentTarget.value);
                            if (lockProportions) {
                              localTemplate.templateUser.iconSizeY = Number(e.currentTarget.value);
                            }
                          } else if (element.id === "club-icon") {
                            localTemplate.templateClub.clubIconSizeX = Number(e.currentTarget.value);
                            if (lockProportions) {
                              localTemplate.templateClub.clubIconSizeY = Number(e.currentTarget.value);
                            }
                          }
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                        </div>
                        <div>
                          <label for="input-148" class="text-xs"
                                 style="color: {$colorStore.muted}">Height</label>
                          <input id="input-148"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.height}
                                 onchange={(e) => {
                          saveUndoState();
                          if (element.id === "user-icon") {
                            localTemplate.templateUser.iconSizeY = Number(e.currentTarget.value);
                            if (lockProportions) {
                              localTemplate.templateUser.iconSizeX = Number(e.currentTarget.value);
                            }
                          } else if (element.id === "club-icon") {
                            localTemplate.templateClub.clubIconSizeY = Number(e.currentTarget.value);
                            if (lockProportions) {
                              localTemplate.templateClub.clubIconSizeX = Number(e.currentTarget.value);
                            }
                          }
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                        </div>
                      </div>
                    </div>
                  {:else if element.type === "text"}
                    <div class="space-y-2">
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label for="input-933" class="text-xs" style="color: {$colorStore.muted}">X
                            Position</label>
                          <input id="input-933"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.x}
                                 onchange={(e) => updateElementPosition(element.id, Number(e.currentTarget.value), element.y)}
                          >
                        </div>
                        <div>
                          <label for="input-4981" class="text-xs" style="color: {$colorStore.muted}">Y
                            Position</label>
                          <input id="input-4981"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.y}
                                 onchange={(e) => updateElementPosition(element.id, element.x, Number(e.currentTarget.value))}
                          >
                        </div>
                      </div>
                      <div>
                        <label for="input-2922" class="text-xs" style="color: {$colorStore.muted}">Font
                          Size</label>
                        <input id="input-2922"
                               type="number"
                               class="w-full px-3 py-1.5 rounded-lg border text-sm"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                               value={element.fontSize}
                               onchange={(e) => {
                        saveUndoState();
                        switch (element.id) {
                          case "user-text":
                            localTemplate.templateUser.fontSize = Number(e.currentTarget.value);
                            break;
                          case "guild-rank":
                            localTemplate.templateGuild.guildRankFontSize = Number(e.currentTarget.value);
                            break;
                          case "guild-level":
                            localTemplate.templateGuild.guildLevelFontSize = Number(e.currentTarget.value);
                            break;
                          case "club-name":
                            localTemplate.templateClub.clubNameFontSize = Number(e.currentTarget.value);
                            break;
                          case "time-on-level":
                            localTemplate.timeOnLevelFontSize = Number(e.currentTarget.value);
                            break;
                          case "awarded":
                            localTemplate.awardedFontSize = Number(e.currentTarget.value);
                            break;
                        }
                        markAsChanged();
                        redrawCanvas();
                      }}
                        >
                      </div>
                      <div>
                        <label for="input-5019" class="text-xs" style="color: {$colorStore.muted}">Color</label>
                        <div class="flex gap-2">
                          <input
                            type="color"
                            class="w-12 h-9 rounded-lg border cursor-pointer"
                            style="border-color: {$colorStore.primary}30;"
                            value={element.color.startsWith('#') ? element.color : `#${element.color}`}
                            onchange={(e) => {
                          saveUndoState();
                          const color = e.currentTarget.value.substring(1);
                          switch (element.id) {
                            case "user-text":
                              localTemplate.templateUser.textColor = color;
                              break;
                            case "guild-rank":
                              localTemplate.templateGuild.guildRankColor = color;
                              break;
                            case "guild-level":
                              localTemplate.templateGuild.guildLevelColor = color;
                              break;
                            case "club-name":
                              localTemplate.templateClub.clubNameColor = color;
                              break;
                            case "time-on-level":
                              localTemplate.timeOnLevelColor = color;
                              break;
                            case "awarded":
                              localTemplate.awardedColor = color;
                              break;
                          }
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                          <input
                            type="text"
                            class="flex-1 px-3 py-1.5 rounded-lg border text-sm uppercase"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            value={element.color}
                            onchange={(e) => {
                          saveUndoState();
                          const color = e.currentTarget.value.replace("#", "");
                          switch (element.id) {
                            case "user-text":
                              localTemplate.templateUser.textColor = color;
                              break;
                            case "guild-rank":
                              localTemplate.templateGuild.guildRankColor = color;
                              break;
                            case "guild-level":
                              localTemplate.templateGuild.guildLevelColor = color;
                              break;
                            case "club-name":
                              localTemplate.templateClub.clubNameColor = color;
                              break;
                            case "time-on-level":
                              localTemplate.timeOnLevelColor = color;
                              break;
                            case "awarded":
                              localTemplate.awardedColor = color;
                              break;
                          }
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                        </div>
                      </div>
                    </div>
                  {:else if element.type === "bar"}
                    <div class="space-y-2">
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label for="input-5019" class="text-xs" style="color: {$colorStore.muted}">Start
                            X</label>
                          <input id="input-5019"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.x1}
                                 onchange={(e) => {
                          saveUndoState();
                          localTemplate.templateBar.barPointAx = Number(e.currentTarget.value);
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                        </div>
                        <div>
                          <label for="input-2380" class="text-xs" style="color: {$colorStore.muted}">Start Y</label>
                          <input id="input-2380"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.y1}
                                 onchange={(e) => {
                          saveUndoState();
                          localTemplate.templateBar.barPointAy = Number(e.currentTarget.value);
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                        </div>
                        <div>
                          <label for="input-4538" class="text-xs" style="color: {$colorStore.muted}">End
                            X</label>
                          <input id="input-4538"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.x2}
                                 onchange={(e) => {
                          saveUndoState();
                          localTemplate.templateBar.barPointBx = Number(e.currentTarget.value);
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                        </div>
                        <div>
                          <label for="input-3931" class="text-xs" style="color: {$colorStore.muted}">End
                            Y</label>
                          <input id="input-3931"
                                 type="number"
                                 class="w-full px-3 py-1.5 rounded-lg border text-sm"
                                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                 value={element.y2}
                                 onchange={(e) => {
                          saveUndoState();
                          localTemplate.templateBar.barPointBy = Number(e.currentTarget.value);
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                        </div>
                      </div>
                      <div>
                        <label for="input-5936" class="text-xs"
                               style="color: {$colorStore.muted}">Thickness</label>
                        <input id="input-5936"
                               type="number"
                               class="w-full px-3 py-1.5 rounded-lg border text-sm"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                               value={element.width}
                               onchange={(e) => {
                        saveUndoState();
                        localTemplate.templateBar.barWidth = Number(e.currentTarget.value);
                        markAsChanged();
                        redrawCanvas();
                      }}
                        >
                      </div>
                      <div>
                        <label for="input-1217" class="text-xs" style="color: {$colorStore.muted}">Color</label>
                        <div class="flex gap-2">
                          <input
                            type="color"
                            class="w-12 h-9 rounded-lg border cursor-pointer"
                            style="border-color: {$colorStore.primary}30;"
                            value={element.color.startsWith('#') ? element.color : `#${element.color}`}
                            onchange={(e) => {
                          saveUndoState();
                          localTemplate.templateBar.barColor = e.currentTarget.value.substring(1);
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                          <input
                            type="text"
                            class="flex-1 px-3 py-1.5 rounded-lg border text-sm uppercase"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            value={element.color}
                            onchange={(e) => {
                          saveUndoState();
                          localTemplate.templateBar.barColor = e.currentTarget.value.replace("#", "");
                          markAsChanged();
                          redrawCanvas();
                        }}
                          >
                        </div>
                      </div>
                      <div>
                        <label for="input-1217" class="text-xs"
                               style="color: {$colorStore.muted}">Opacity</label>
                        <input id="input-1217"
                               type="range"
                               min="0"
                               max="100"
                               class="w-full"
                               value={localTemplate.templateBar.barTransparency}
                               oninput={(e) => {
                        saveUndoState();
                        localTemplate.templateBar.barTransparency = Number(e.currentTarget.value);
                        markAsChanged();
                        redrawCanvas();
                      }}
                        >
                        <div class="flex justify-between text-xs"
                             style="color: {$colorStore.muted}">
                          <span>Transparent</span>
                          <span>{localTemplate.templateBar.barTransparency}%</span>
                          <span>Opaque</span>
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</Portal>