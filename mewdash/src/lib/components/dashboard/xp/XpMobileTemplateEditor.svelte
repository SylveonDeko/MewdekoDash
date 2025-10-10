<!-- lib/components/dashboard/xp/XpMobileTemplateEditor.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { fly, fade, slide } from "svelte/transition";
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
  let lastTouchX = 0;
  let lastTouchY = 0;
  let lastTouchDistance = 0;

  // Editor state
  let selectedElement = $state<string | null>(null);
  let hoveredElement = $state<string | null>(null);
  let isDragging = $state(false);
  let dragTarget = $state<string | null>(null);
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartElementX = 0;
  let dragStartElementY = 0;
  let showGrid = $state(false);
  let snapToGrid = $state(true);
  let gridSize = $state(10);
  let showRulers = $state(false);
  let lockProportions = $state(false);
  let backgroundImage = $state<HTMLImageElement | null>(null);
  let backgroundImageLoading = $state(false);
  let defaultBgImage = $state<HTMLImageElement | null>(null);

  // Mobile UI state
  let bottomSheetOpen = $state(false);
  let bottomSheetTab = $state<"layers" | "properties" | "tools">("layers");
  let toolbarExpanded = $state(false);
  let showQuickActions = $state(true);

  // Preview mode
  let previewMode = $state<"edit" | "preview">("edit");
  let useRealData = $state(false);

  // Undo/Redo stack
  let undoStack: string[] = $state([]);
  let redoStack: string[] = $state([]);
  let maxUndoLevels = 30;

  // Load default background image
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

  // Load custom background image
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

  // Element definitions
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

  // Save undo state
  function saveUndoState() {
    const currentState = JSON.stringify(localTemplate);
    undoStack.push(currentState);
    if (undoStack.length > maxUndoLevels) {
      undoStack.shift();
    }
    redoStack = [];
  }

  // Undo action
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

  // Redo action
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

  // Mark as changed
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

  // Redraw canvas
  function redrawCanvas() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply zoom and pan
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // Draw background
    if (backgroundImage && !backgroundImageLoading) {
      ctx.drawImage(backgroundImage, 0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
    } else if (defaultBgImage) {
      // Draw gradient
      const bgGradient = ctx.createLinearGradient(0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
      bgGradient.addColorStop(0, `${$colorStore.primary}15`);
      bgGradient.addColorStop(0.5, `${$colorStore.primary}20`);
      bgGradient.addColorStop(1, `${$colorStore.secondary}15`);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
      ctx.drawImage(defaultBgImage, 0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
    }

    // Draw grid if enabled
    if (showGrid && previewMode === "edit") {
      ctx.strokeStyle = `${$colorStore.primary}20`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 4]);

      for (let x = 0; x <= localTemplate.outputSizeX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, localTemplate.outputSizeY);
        ctx.stroke();
      }

      for (let y = 0; y <= localTemplate.outputSizeY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(localTemplate.outputSizeX, y);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // Draw elements
    elements.forEach(element => {
      if (!element.visible) return;

      const isSelected = selectedElement === element.id;
      const isHovered = hoveredElement === element.id;

      if (element.type === "image") {
        ctx.fillStyle = `${$colorStore.primary}30`;
        ctx.fillRect(element.x, element.y, element.width, element.height);

        ctx.strokeStyle = isSelected ? $colorStore.accent : isHovered ? $colorStore.primary : `${$colorStore.primary}40`;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(element.x, element.y, element.width, element.height);

        ctx.fillStyle = $colorStore.text;
        ctx.font = "12px Inter";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(element.label, element.x + element.width / 2, element.y + element.height / 2);
      } else if (element.type === "text") {
        ctx.fillStyle = element.color.startsWith("#") ? element.color : `#${element.color}`;
        ctx.font = `${element.fontSize}px Inter`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const displayText = useRealData && currentUserData
          ? getTextContent(element.id, currentUserData)
          : getTextContent(element.id, sampleData);

        ctx.fillText(displayText, element.x, element.y);

        if (previewMode === "edit" && (isSelected || isHovered)) {
          const metrics = ctx.measureText(displayText);
          ctx.strokeStyle = isSelected ? $colorStore.accent : $colorStore.primary;
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.setLineDash(isSelected ? [] : [4, 4]);
          ctx.strokeRect(
            element.x - 5,
            element.y - 5,
            metrics.width + 10,
            element.fontSize + 10
          );
          ctx.setLineDash([]);
        }
      } else if (element.type === "bar") {
        const percent = (useRealData && currentUserData?.progress ? currentUserData.progress : sampleData.progress) / 100;
        const direction = localTemplate?.templateBar?.barDirection ?? 3;
        const barLength = localTemplate?.templateBar?.barLength || 452;
        const transparency = localTemplate?.templateBar?.barTransparency || 255;

        const length = barLength * percent;

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
          default: // Right
            x3 = x1 + length;
            x4 = x2 + length;
            y3 = y1;
            y4 = y2;
            break;
        }

        ctx.save();

        let barColor = element.color;
        if (!barColor.startsWith("#")) {
          if (barColor.length === 8) {
            barColor = "#" + barColor.slice(2);
          } else {
            barColor = "#" + barColor;
          }
        }

        ctx.fillStyle = barColor;
        ctx.globalAlpha = transparency / 255;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        if (previewMode === "edit" && (isSelected || isHovered)) {
          ctx.fillStyle = isSelected ? $colorStore.accent : $colorStore.primary;
          ctx.beginPath();
          ctx.arc(x1, y1, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x2, y2, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (element.locked && previewMode === "edit") {
        ctx.fillStyle = $colorStore.accent;
        ctx.font = "10px Inter";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText("🔒", element.x + element.width - 5, element.y + 5);
      }
    });

    // Draw rulers if enabled
    if (showRulers && previewMode === "edit") {
      ctx.fillStyle = `${$colorStore.primary}08`;
      ctx.fillRect(0, -30, localTemplate.outputSizeX, 30);
      ctx.strokeStyle = `${$colorStore.primary}40`;
      ctx.lineWidth = 1;
      ctx.strokeRect(0, -30, localTemplate.outputSizeX, 30);

      ctx.fillStyle = `#${$colorStore.text}`;
      ctx.font = "10px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let x = 0; x <= localTemplate.outputSizeX; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, -30);
        ctx.lineTo(x, -20);
        ctx.stroke();
        ctx.fillText(x.toString(), x, -10);
      }

      ctx.fillStyle = `${$colorStore.primary}08`;
      ctx.fillRect(-30, 0, 30, localTemplate.outputSizeY);
      ctx.strokeStyle = `${$colorStore.primary}40`;
      ctx.strokeRect(-30, 0, 30, localTemplate.outputSizeY);

      ctx.save();
      ctx.rotate(-Math.PI / 2);
      for (let y = 0; y <= localTemplate.outputSizeY; y += 50) {
        ctx.beginPath();
        ctx.moveTo(-y, -30);
        ctx.lineTo(-y, -20);
        ctx.stroke();
        ctx.fillText(y.toString(), -y, -10);
      }
      ctx.restore();
    }

    ctx.restore();

    // Draw zoom indicator
    if (zoom !== 1) {
      ctx.fillStyle = $colorStore.primary;
      ctx.font = "12px Inter";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${Math.round(zoom * 100)}%`, canvas.width - 10, canvas.height - 10);
    }
  }

  // Get text content
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

  // Handle touch start
  function handleTouchStart(event: TouchEvent) {
    if (previewMode === "preview") return;

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left - panX) / zoom;
    const y = (touch.clientY - rect.top - panY) / zoom;

    // Check if touching an element
    const touchedElement = elements.find(element => {
      if (!element.visible) return false;

      if (element.type === "image") {
        return x >= element.x && x <= element.x + element.width &&
          y >= element.y && y <= element.y + element.height;
      } else if (element.type === "text") {
        return x >= element.x - 10 && x <= element.x + 120 &&
          y >= element.y - 10 && y <= element.y + element.fontSize + 10;
      } else if (element.type === "bar") {
        const dist1 = Math.sqrt((x - element.x1) ** 2 + (y - element.y1) ** 2);
        const dist2 = Math.sqrt((x - element.x2) ** 2 + (y - element.y2) ** 2);
        return dist1 < 15 || dist2 < 15;
      }
      return false;
    });

    if (touchedElement && !touchedElement.locked) {
      selectedElement = touchedElement.id;
      isDragging = true;
      dragTarget = touchedElement.id;
      dragStartX = x;
      dragStartY = y;
      if (touchedElement.type === "bar") {
        dragStartElementX = touchedElement.x1;
        dragStartElementY = touchedElement.y1;
      } else {
        dragStartElementX = touchedElement.x;
        dragStartElementY = touchedElement.y;
      }
      bottomSheetOpen = true;
      bottomSheetTab = "properties";
    } else if (event.touches.length === 1) {
      isPanning = true;
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    } else if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
    }

    redrawCanvas();
  }

  // Handle touch move
  function handleTouchMove(event: TouchEvent) {
    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left - panX) / zoom;
      const y = (touch.clientY - rect.top - panY) / zoom;

      if (isDragging && dragTarget) {
        const deltaX = x - dragStartX;
        const deltaY = y - dragStartY;

        const element = elements.find(e => e.id === dragTarget);
        if (element) {
          const newX = dragStartElementX + deltaX;
          const newY = dragStartElementY + deltaY;
          updateElementPosition(dragTarget, newX, newY);
        }
      } else if (isPanning) {
        panX += touch.clientX - lastTouchX;
        panY += touch.clientY - lastTouchY;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        redrawCanvas();
      }
    } else if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance;
        zoom = Math.max(0.5, Math.min(3, zoom * scale));
        redrawCanvas();
      }

      lastTouchDistance = distance;
    }
  }

  // Handle touch end
  function handleTouchEnd() {
    isDragging = false;
    dragTarget = null;
    isPanning = false;
    lastTouchDistance = 0;
  }

  // Initialize canvas
  function initCanvas() {
    if (!canvas || !canvasContainer) return;

    ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerRect = canvasContainer.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    // Center template
    panX = (canvas.width - localTemplate.outputSizeX * zoom) / 2;
    panY = (canvas.height - localTemplate.outputSizeY * zoom) / 2;

    // Add non-passive touch event listeners
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    redrawCanvas();
  }

  // Handle resize
  function handleResize() {
    if (canvas && canvasContainer) {
      initCanvas();
    }
  }

  // Update element property
  function updateElementProperty(elementId: string, property: string, value: any) {
    saveUndoState();

    const element = elements.find(e => e.id === elementId);
    if (!element) return;

    switch (property) {
      case "fontSize":
        switch (elementId) {
          case "user-text":
            localTemplate.templateUser.fontSize = value;
            break;
          case "guild-rank":
            localTemplate.templateGuild.guildRankFontSize = value;
            break;
          case "guild-level":
            localTemplate.templateGuild.guildLevelFontSize = value;
            break;
          case "club-name":
            localTemplate.templateClub.clubNameFontSize = value;
            break;
          case "time-on-level":
            localTemplate.timeOnLevelFontSize = value;
            break;
          case "awarded":
            localTemplate.awardedFontSize = value;
            break;
        }
        break;
      case "color":
        const color = value.replace("#", "");
        switch (elementId) {
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
          case "progress-bar":
            localTemplate.templateBar.barColor = color;
            break;
        }
        break;
      case "width":
        if (elementId === "user-icon") {
          localTemplate.templateUser.iconSizeX = value;
          if (lockProportions) {
            localTemplate.templateUser.iconSizeY = value;
          }
        } else if (elementId === "club-icon") {
          localTemplate.templateClub.clubIconSizeX = value;
          if (lockProportions) {
            localTemplate.templateClub.clubIconSizeY = value;
          }
        } else if (elementId === "progress-bar") {
          localTemplate.templateBar.barWidth = value;
        }
        break;
      case "height":
        if (elementId === "user-icon") {
          localTemplate.templateUser.iconSizeY = value;
          if (lockProportions) {
            localTemplate.templateUser.iconSizeX = value;
          }
        } else if (elementId === "club-icon") {
          localTemplate.templateClub.clubIconSizeY = value;
          if (lockProportions) {
            localTemplate.templateClub.clubIconSizeX = value;
          }
        }
        break;
      case "transparency":
        if (elementId === "progress-bar") {
          localTemplate.templateBar.barTransparency = value;
        }
        break;
      case "direction":
        if (elementId === "progress-bar") {
          localTemplate.templateBar.barDirection = value;
        }
        break;
      case "length":
        if (elementId === "progress-bar") {
          localTemplate.templateBar.barLength = value;
        }
        break;
    }

    markAsChanged();
    redrawCanvas();
  }

  onMount(() => {
    initCanvas();
    window.addEventListener("resize", handleResize);
  });

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
    if (canvas) {
      canvas.removeEventListener("touchmove", handleTouchMove);
    }
  });

  $effect(() => {
    if (localTemplate && ctx) {
      redrawCanvas();
    }
  });
</script>

<Portal target="body">
  <div class="fixed inset-0 z-[9999] flex flex-col" transition:fade={{ duration: 300 }}>
    <!-- Background -->
    <div class="absolute inset-0" style="background: {$colorStore.background || '#0a0a0a'};"></div>
    <div class="absolute inset-0"
         style="background: radial-gradient(circle at center,
              {$colorStore.gradientStart}20 0%,
              {$colorStore.gradientEnd}15 50%,
              {$colorStore.gradientEnd}10 100%);"></div>

    <!-- Top Toolbar -->
    <div class="relative z-10">
      <div
        class="flex items-center justify-between px-3 py-2 border-b backdrop-blur-xs"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
             border-color: {$colorStore.primary}30;"
      >
        <!-- Left section -->
        <div class="flex items-center gap-2">
          <button aria-label="Close editor"
                  class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                  onclick={() => { showEditor = false; }}
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
          >
            <i class="fa-solid fa-arrow-left" style="font-size: 20px;"></i>
          </button>

          <div class="w-px h-6" style="background: {$colorStore.primary}20;"></div>

          <!-- Mode toggle -->
          <div class="flex rounded-lg p-0.5" style="background: {$colorStore.primary}10;">
            <button
              class="px-2 py-1 rounded-md text-xs font-medium transition-all"
              onclick={() => { previewMode = 'edit'; redrawCanvas(); }}
              style="background: {previewMode === 'edit' ? $colorStore.primary + '30' : 'transparent'};
                   color: {previewMode === 'edit' ? $colorStore.primary : $colorStore.muted};"
            >
              Edit
            </button>
            <button
              class="px-2 py-1 rounded-md text-xs font-medium transition-all"
              onclick={() => { previewMode = 'preview'; redrawCanvas(); }}
              style="background: {previewMode === 'preview' ? $colorStore.primary + '30' : 'transparent'};
                   color: {previewMode === 'preview' ? $colorStore.primary : $colorStore.muted};"
            >
              Preview
            </button>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center gap-2">
          <!-- Toolbar toggle -->
          <button
            class="p-1.5 rounded-lg transition-all hover:scale-[1.02]"
            onclick={() => { toolbarExpanded = !toolbarExpanded; }}
            style="background: {toolbarExpanded ? $colorStore.primary + '20' : $colorStore.primary + '10'}; color: {$colorStore.primary};"
          >
            {#if toolbarExpanded}
              <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
            {:else}
              <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
            {/if}
          </button>

          <!-- Zoom controls -->
          <button aria-label="Undo"
                  class="p-1.5 rounded-lg transition-all hover:scale-[1.02]"
                  onclick={() => { zoom = Math.max(0.5, zoom - 0.1); redrawCanvas(); }}
                  style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
          >
            <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 16px;"></i>
          </button>
          <span class="text-xs min-w-[40px] text-center" style="color: {$colorStore.text}">
          {Math.round(zoom * 100)}%
        </span>
          <button aria-label="Redo"
                  class="p-1.5 rounded-lg transition-all hover:scale-[1.02]"
                  onclick={() => { zoom = Math.min(3, zoom + 0.1); redrawCanvas(); }}
                  style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
          >
            <i class="fa-solid fa-magnifying-glass-plus" style="font-size: 16px;"></i>
          </button>
        </div>
      </div>

      <!-- Expanded toolbar -->
      {#if toolbarExpanded}
        <div
          class="px-3 py-2 border-b backdrop-blur-xs"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
          transition:slide={{ duration: 200 }}
        >
          <div class="flex items-center gap-2 overflow-x-auto">
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style="background: {useRealData ? $colorStore.secondary + '20' : $colorStore.primary + '10'};
                   color: {useRealData ? $colorStore.secondary : $colorStore.muted};"
              onclick={() => { useRealData = !useRealData; redrawCanvas(); }}
            >
              {useRealData ? "Real Data" : "Sample Data"}
            </button>

            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style="background: {showGrid ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                   color: {showGrid ? $colorStore.primary : $colorStore.muted};"
              onclick={() => { showGrid = !showGrid; redrawCanvas(); }}
            >
              <i class="fa-solid fa-border-all" style="font-size: 12px;"></i>
              Grid
            </button>

            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style="background: {snapToGrid ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                   color: {snapToGrid ? $colorStore.primary : $colorStore.muted};"
              onclick={() => { snapToGrid = !snapToGrid; }}
            >
              <i class="fa-solid fa-crosshairs" style="font-size: 12px;"></i>
              Snap
            </button>

            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style="background: {showRulers ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                   color: {showRulers ? $colorStore.primary : $colorStore.muted};"
              onclick={() => { showRulers = !showRulers; redrawCanvas(); }}
            >
              <i class="fa-solid fa-ruler" style="font-size: 12px;"></i>
              Rulers
            </button>
          </div>
        </div>
      {/if}

    </div>

    <!-- Canvas Area -->
    <div class="flex-1 relative overflow-hidden">
      <div
        bind:this={canvasContainer}
        class="w-full h-full"
        style="background: radial-gradient(circle at center, {$colorStore.primary}12, transparent);"
      >
        <canvas
          bind:this={canvas}
          class="w-full h-full touch-none"
          ontouchend={handleTouchEnd}
          ontouchstart={handleTouchStart}
        ></canvas>
      </div>

      <!-- Quick Action Buttons -->
      {#if showQuickActions && previewMode === "edit"}
        <div class="absolute right-3 top-3 flex flex-col gap-2">
          <button aria-label="Zoom out"
                  class="p-3 rounded-xl border shadow-lg transition-all hover:scale-[1.02] backdrop-blur-md"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
                  onclick={() => { bottomSheetOpen = true; bottomSheetTab = "layers"; }}
          >
            <i class="fa-solid fa-layer-group" style="font-size: 20px;"></i>
          </button>

          <button aria-label="Zoom in"
                  class="p-3 rounded-xl border shadow-lg transition-all hover:scale-[1.02] backdrop-blur-md"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border-color: {$colorStore.primary}30;"
                  onclick={() => { bottomSheetOpen = true; bottomSheetTab = "tools"; }}
          >
            <i class="fa-solid fa-sliders" style="font-size: 20px;"></i>
          </button>

          {#if undoStack.length > 0}
            <button aria-label="Button action"
                    class="p-3 rounded-xl border shadow-lg transition-all hover:scale-[1.02] backdrop-blur-md"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border-color: {$colorStore.secondary}30;"
                    onclick={undo}
            >
              <i class="fa-solid fa-rotate-left" style="font-size: 20px;"></i>
            </button>
          {/if}

          {#if redoStack.length > 0}
            <button aria-label="Navigate"
                    class="p-3 rounded-xl border shadow-lg transition-all hover:scale-[1.02] backdrop-blur-md"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border-color: {$colorStore.secondary}30;"
                    onclick={redo}
            >
              <i class="fa-solid fa-arrows-rotate" style="font-size: 20px;"></i>
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Bottom Sheet -->
    {#if bottomSheetOpen}
      <div
        class="fixed inset-x-0 bottom-0 z-20 rounded-t-3xl border-t shadow-2xl transition-all backdrop-blur-md"
        style="background: {$colorStore.background}E6; border-color: {$colorStore.primary}30;
             max-height: 70vh;"
        transition:fly={{ y: 100, duration: 300 }}
      >
        <!-- Sheet Handle -->
        <div class="flex justify-center py-2">
          <div
            class="w-12 h-1.5 rounded-full"
            style="background: {$colorStore.primary}30;"
          ></div>
        </div>

        <!-- Sheet Tabs -->
        <div class="flex items-center justify-between px-4 pb-2">
          <div class="flex gap-2">
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style="background: {bottomSheetTab === 'layers' ? $colorStore.primary + '20' : 'transparent'};
                   color: {bottomSheetTab === 'layers' ? $colorStore.primary : $colorStore.muted};"
              onclick={() => { bottomSheetTab = 'layers'; }}
            >
              Layers
            </button>
            {#if selectedElement}
              <button
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style="background: {bottomSheetTab === 'properties' ? $colorStore.primary + '20' : 'transparent'};
                     color: {bottomSheetTab === 'properties' ? $colorStore.primary : $colorStore.muted};"
                onclick={() => { bottomSheetTab = 'properties'; }}
              >
                Properties
              </button>
            {/if}
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style="background: {bottomSheetTab === 'tools' ? $colorStore.primary + '20' : 'transparent'};
                   color: {bottomSheetTab === 'tools' ? $colorStore.primary : $colorStore.muted};"
              onclick={() => { bottomSheetTab = 'tools'; }}
            >
              Tools
            </button>
          </div>

          <button aria-label="Close sheet"
                  class="p-2 rounded-lg transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                  onclick={() => { bottomSheetOpen = false; }}
          >
            <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
          </button>
        </div>

        <!-- Sheet Content -->
        <div class="px-4 pb-4 overflow-y-auto" style="max-height: calc(70vh - 80px);">
          {#if bottomSheetTab === "layers"}
            <div class="space-y-2">
              {#each elements as element (element.id)}
                <div
                  class="p-3 rounded-xl transition-all"
                  class:opacity-50={!element.visible}
                  style="background: {selectedElement === element.id ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                       border: 1px solid {selectedElement === element.id ? $colorStore.primary + '40' : 'transparent'};"
                  onclick={() => { selectedElement = element.id; bottomSheetTab = "properties"; redrawCanvas(); }}
                  onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectedElement = element.id; bottomSheetTab = "properties"; redrawCanvas(); } }}
                  role="button"
                  tabindex="0"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <button
                        class="p-2 rounded-lg transition-all hover:scale-110"
                        style="background: {element.visible ? $colorStore.primary + '20' : 'transparent'};"
                        onclick={(e) => { e.stopPropagation(); toggleElementVisibility(element.id); }}
                      >
                        {#if element.visible}
                          <i class="fa-solid fa-eye" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                        {:else}
                          <i class="fa-solid fa-eye-slash" style="color: {$colorStore.muted}; font-size: 16px;"></i>
                        {/if}
                      </button>
                      <div>
                        <div class="text-sm font-medium"
                             style="color: {$colorStore.text}">{element.label}</div>
                        <div class="text-xs" style="color: {$colorStore.muted}">
                          {#if element.type === "image"}
                            {element.width} × {element.height}px
                          {:else if element.type === "text"}
                            {element.fontSize}px
                          {:else if element.type === "bar"}
                            Progress Bar
                          {/if}
                        </div>
                      </div>
                    </div>
                    {#if element.locked}
                      <i class="fa-solid fa-lock" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {:else if bottomSheetTab === "properties" && selectedElement}
            {@const element = elements.find(e => e.id === selectedElement)}
            {#if element}
              <div class="space-y-4">
                <h3 class="text-sm font-semibold flex items-center gap-2"
                    style="color: {$colorStore.text}">
                  <i class="fa-solid fa-layer-group" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                  {element.label}
                </h3>

                <!-- Position -->
                <div>
                  <label for="input-8739" class="text-xs" style="color: {$colorStore.muted}">Position</label>
                  <div class="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <input
                        type="number"
                        class="w-full px-3 py-2 rounded-lg border text-sm"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        placeholder="X"
                        value={element.type === "bar" ? element.x1 : element.x}
                        onchange={(e) => updateElementPosition(element.id, Number(e.currentTarget.value), element.type === "bar" ? element.y1 : element.y)}
                      >
                    </div>
                    <div>
                      <input
                        type="number"
                        class="w-full px-3 py-2 rounded-lg border text-sm"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        placeholder="Y"
                        value={element.type === "bar" ? element.y1 : element.y}
                        onchange={(e) => updateElementPosition(element.id, element.type === "bar" ? element.x1 : element.x, Number(e.currentTarget.value))}
                      >
                    </div>
                  </div>
                </div>

                {#if element.type === "image"}
                  <!-- Size -->
                  <div>
                    <label for="input-8739" class="text-xs" style="color: {$colorStore.muted}">Size</label>
                    <div class="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <input
                          type="number"
                          class="w-full px-3 py-2 rounded-lg border text-sm"
                          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          placeholder="Width"
                          value={element.width}
                          onchange={(e) => updateElementProperty(element.id, "width", Number(e.currentTarget.value))}
                        >
                      </div>
                      <div>
                        <input
                          type="number"
                          class="w-full px-3 py-2 rounded-lg border text-sm"
                          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          placeholder="Height"
                          value={element.height}
                          onchange={(e) => updateElementProperty(element.id, "height", Number(e.currentTarget.value))}
                        >
                      </div>
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                      <button
                        class="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2"
                        style="background: {lockProportions ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                             color: {lockProportions ? $colorStore.primary : $colorStore.muted};"
                        onclick={() => { lockProportions = !lockProportions; }}
                      >
                        {#if lockProportions}
                          <i class="fa-solid fa-lock" style="font-size: 12px;"></i>
                        {:else}
                          <i class="fa-solid fa-lock-open" style="font-size: 12px;"></i>
                        {/if}
                        Proportions
                      </button>
                    </div>
                  </div>
                {:else if element.type === "text"}
                  <!-- Font Size -->
                  <div>
                    <label for="input-8739" class="text-xs" style="color: {$colorStore.muted}">Font Size</label>
                    <input id="input-8739"
                           type="number"
                           class="w-full px-3 py-2 rounded-lg border text-sm mt-1"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                           value={element.fontSize}
                           onchange={(e) => updateElementProperty(element.id, "fontSize", Number(e.currentTarget.value))}
                    >
                  </div>

                  <!-- Color -->
                  <div>
                    <label for="input-6443" class="text-xs" style="color: {$colorStore.muted}">Color</label>
                    <div class="flex gap-2 mt-1">
                      <input
                        type="color"
                        class="w-12 h-10 rounded-lg border cursor-pointer"
                        style="border-color: {$colorStore.primary}30;"
                        value={element.color.startsWith('#') ? element.color : `#${element.color}`}
                        onchange={(e) => updateElementProperty(element.id, "color", e.currentTarget.value)}
                      >
                      <input
                        type="text"
                        class="flex-1 px-3 py-2 rounded-lg border text-sm uppercase"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        value={element.color}
                        onchange={(e) => updateElementProperty(element.id, "color", e.currentTarget.value)}
                      >
                    </div>
                  </div>
                {:else if element.type === "bar"}
                  <!-- Bar Settings -->
                  <div>
                    <label for="input-6443" class="text-xs" style="color: {$colorStore.muted}">Bar Thickness</label>
                    <input id="input-6443"
                           type="number"
                           class="w-full px-3 py-2 rounded-lg border text-sm mt-1"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                           value={element.width}
                           onchange={(e) => updateElementProperty(element.id, "width", Number(e.currentTarget.value))}
                    >
                  </div>

                  <div>
                    <label for="input-77" class="text-xs" style="color: {$colorStore.muted}">Bar Length</label>
                    <input id="input-77"
                           type="number"
                           class="w-full px-3 py-2 rounded-lg border text-sm mt-1"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                           value={element.length}
                           onchange={(e) => updateElementProperty(element.id, "length", Number(e.currentTarget.value))}
                    >
                  </div>

                  <div>
                    <label for="input-1363" class="text-xs" style="color: {$colorStore.muted}">Direction</label>
                    <div class="grid grid-cols-2 gap-2 mt-1">
                      {#each [{ id: 3, label: "Right" }, { id: 2, label: "Left" }, {
                        id: 1,
                        label: "Down"
                      }, { id: 0, label: "Up" }] as dir (dir.id)}
                        <button
                          class="py-2 px-3 rounded-lg text-xs font-medium transition-all"
                          style="background: {element.direction === dir.id ? $colorStore.primary + '20' : $colorStore.primary + '10'};
                               color: {element.direction === dir.id ? $colorStore.primary : $colorStore.muted};"
                          onclick={() => updateElementProperty(element.id, "direction", dir.id)}
                        >
                          {dir.label}
                        </button>
                      {/each}
                    </div>
                  </div>

                  <div>
                    <label for="input-1363" class="text-xs" style="color: {$colorStore.muted}">Color</label>
                    <div class="flex gap-2 mt-1">
                      <input
                        type="color"
                        class="w-12 h-10 rounded-lg border cursor-pointer"
                        style="border-color: {$colorStore.primary}30;"
                        value={element.color.startsWith('#') ? element.color : `#${element.color}`}
                        onchange={(e) => updateElementProperty(element.id, "color", e.currentTarget.value)}
                      >
                      <input
                        type="text"
                        class="flex-1 px-3 py-2 rounded-lg border text-sm uppercase"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                        value={element.color}
                        onchange={(e) => updateElementProperty(element.id, "color", e.currentTarget.value)}
                      >
                    </div>
                  </div>

                  <div>
                    <label for="input-1363" class="text-xs" style="color: {$colorStore.muted}">
                      Opacity: {element.transparency}%
                    </label>
                    <input id="input-1363"
                           type="range"
                           min="0"
                           max="100"
                           class="w-full mt-1"
                           value={element.transparency}
                           oninput={(e) => updateElementProperty(element.id, "transparency", Number(e.currentTarget.value))}
                    >
                  </div>
                {/if}
              </div>
            {/if}
          {:else if bottomSheetTab === "tools"}
            <div class="space-y-4">
              <!-- Canvas Settings -->
              <div>
                <h3 class="text-sm font-semibold flex items-center gap-2 mb-3"
                    style="color: {$colorStore.text}">
                  <i class="fa-solid fa-image" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                  Canvas Size
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label for="input-7763" class="text-xs" style="color: {$colorStore.muted}">Width</label>
                    <input id="input-7763"
                           type="number"
                           class="w-full px-3 py-2 rounded-lg border text-sm"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                           bind:value={localTemplate.outputSizeX}
                           onchange={() => { markAsChanged(); initCanvas(); }}
                    >
                  </div>
                  <div>
                    <label for="input-148" class="text-xs" style="color: {$colorStore.muted}">Height</label>
                    <input id="input-148"
                           type="number"
                           class="w-full px-3 py-2 rounded-lg border text-sm"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                           bind:value={localTemplate.outputSizeY}
                           onchange={() => { markAsChanged(); initCanvas(); }}
                    >
                  </div>
                </div>
              </div>

              <!-- Background -->
              <div>
                <h3 class="text-sm font-semibold flex items-center gap-2 mb-3"
                    style="color: {$colorStore.text}">
                  <i class="fa-solid fa-paint-brush" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                  Background
                </h3>
                <div class="space-y-2">
                  <input
                    type="url"
                    class="w-full px-3 py-2 rounded-lg border text-sm"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    placeholder="Custom background URL..."
                    value={localTemplate.customXpImageUrl || ""}
                    onchange={(e) => {
                    saveUndoState();
                    localTemplate.customXpImageUrl = e.currentTarget.value;
                    markAsChanged();
                  }}
                  >
                  <div class="flex gap-2">
                    <button
                      class="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2"
                      style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                    >
                      <i class="fa-solid fa-upload" style="font-size: 16px;"></i>
                      Upload
                    </button>
                    <button
                      class="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2"
                      style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                    >
                      <i class="fa-solid fa-download" style="font-size: 16px;"></i>
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <!-- Grid Settings -->
              <div>
                <h3 class="text-sm font-semibold flex items-center gap-2 mb-3"
                    style="color: {$colorStore.text}">
                  <i class="fa-solid fa-border-all" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                  Grid Size
                </h3>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  class="w-full"
                  bind:value={gridSize}
                  oninput={() => redrawCanvas()}
                >
                <div class="flex justify-between text-xs mt-1" style="color: {$colorStore.muted}">
                  <span>5px</span>
                  <span>{gridSize}px</span>
                  <span>50px</span>
                </div>
              </div>

              <!-- Reset -->
              <button
                class="w-full py-3 px-4 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                onclick={() => {
                zoom = 1;
                panX = (canvas.width - localTemplate.outputSizeX) / 2;
                panY = (canvas.height - localTemplate.outputSizeY) / 2;
                redrawCanvas();
              }}
              >
                <i class="fa-solid fa-expand" style="font-size: 16px;"></i>
                Reset View
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</Portal>