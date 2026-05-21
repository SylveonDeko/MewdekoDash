<!-- routes/dashboard/embedbuilder/+page.svelte -->
<script lang="ts">
  import type { PageData } from "./$types";
  import { onDestroy, onMount } from "svelte";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { chatTriggersApi } from "$lib/api/index.ts";
  import type { ChatTrigger } from "$lib/api/chattriggers/models/ChatTrigger";
  import { fade } from "svelte/transition";
  import { logger } from "$lib/logger.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";

  import TemplateGallery from "$lib/components/specialized/TemplateGallery.svelte";
  import EmbedEditor from "$lib/components/specialized/EmbedEditor.svelte";
  import ComponentEditor from "$lib/components/specialized/ComponentEditor.svelte";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import ValidationCard from "$lib/components/specialized/ValidationCard.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  interface Author {
    name: string;
    url: string;
    icon_url: string;
  }

  interface Thumbnail {
    url: string;
  }

  interface Image {
    url: string;
  }

  interface Footer {
    text: string;
    icon_url: string;
  }

  interface Field {
    name: string;
    value: string;
    inline: boolean;
    id: number;
  }

  interface Embed {
    title: string;
    description: string;
    color: string;
    url: string;
    author: Author;
    thumbnail: Thumbnail;
    image: Image;
    footer: Footer;
    fields: Field[];
  }

  interface NewEmbedSelectOption {
    id: string | null;
    name: string;
    emoji: string;
    description: string;
  }

  interface NewEmbedComponent {
    componentKey: string; // Unique identifier for the component
    id: string | null; // Trigger ID
    rowIndex: number; // Which row (0-4) this component belongs to
    displayName: string;
    style: number;
    url: string;
    emoji: string;
    isSelect: boolean;
    maxOptions: number;
    minOptions: number;
    options: NewEmbedSelectOption[];
  }

  interface ComponentRow {
    componentKey: string; // Unique identifier (same as rowKey for consistency)
    rowKey: string;
    components: NewEmbedComponent[];
  }


  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

  // State management
    let embeds: Embed[] = $state([{
    title: "",
    description: "",
    color: "#5865F2",
    url: "",
    author: { name: "", url: "", icon_url: "" },
    thumbnail: { url: "" },
    image: { url: "" },
    footer: { text: "", icon_url: "" },
    fields: []
    }]);

    let content = $state("");
  let componentRows: ComponentRow[] = $state([]);
    let chatTriggers: ChatTrigger[] = $state([]);


  // Main navigation state
    let activeMainTab = $state("templates");

  // UI state
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");
    let jsonCopied = $state(false);

  // Placeholder picker state
    let showPlaceholderPicker = $state(false);
    let placeholderPosition = $state({x: 0, y: 0});
    let placeholderSearchTerm = $state("");
  let currentEditingElement: HTMLInputElement | HTMLTextAreaElement | null = null;
  let currentEditingField: string | null = null;

  // Component editing state
    let editingComponent: NewEmbedComponent | null = $state(null);

  // Custom drag and drop state
  let draggedComponent: NewEmbedComponent | null = $state(null);
  let draggedFromRow: string | null = $state(null);
  let dragOverRow: string | null = $state(null);
  let dragOverIndex: number = $state(-1);
  let isDragging = $state(false);

  // Row dragging state
  let draggedRow: ComponentRow | null = $state(null);
  let dragOverRowIndex: number = $state(-1);
  let isDraggingRow = $state(false);

  // Validation state
    let validationErrors: any[] = $state([]);
    let validationWarnings: any[] = $state([]);

  // Main tab configuration for DashboardPageLayout
  const mainTabs = [
    { id: "templates", label: "Templates", icon: "fa-sparkles" },
    { id: "editor", label: "Editor", icon: "fa-layer-group" },
    { id: "components", label: "Components", icon: "fa-comment" }
  ];


  // Notification helper
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  // Component initialization
  onMount(() => {
    validateEmbeds();
    validateComponents();
  });

  // Clean up any active drag listeners on unmount
  onDestroy(() => {
    // Clean up if dragging when component unmounts
    if (isDragging || isDraggingRow) {
      document.removeEventListener("touchmove", preventScroll);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.webkitUserSelect = "";
      (document.body.style as any).webkitTouchCallout = "";
      document.body.classList.remove("dragging-active");
    }
  });

  // Load chat triggers
  async function loadChatTriggers(guildId: bigint) {
    try {
      chatTriggers = await chatTriggersApi.getChatTriggers(guildId);
    } catch (error) {
      logger.error('Failed to load chat triggers:', error);
    }
  }

  // Template handling
  function handleTemplateSelect(detail: { template: any }) {
    const template = detail.template;

    // Apply template to first embed
    embeds[0] = { ...template.embed };
    embeds = [...embeds];

    // Switch to editor tab
    activeMainTab = "editor";
    showNotificationMessage(`Applied template: ${template.name}`);
  }

  // Embed management
  function addEmbed() {
    const newEmbed: Embed = {
      title: "",
      description: "",
      color: "#5865F2",
      url: "",
      author: { name: "", url: "", icon_url: "" },
      thumbnail: { url: "" },
      image: { url: "" },
      footer: { text: "", icon_url: "" },
      fields: []
    };
    
    embeds = [...embeds, newEmbed];
    showNotificationMessage("New embed added");
  }

  function removeEmbed(index: number) {
    if (embeds.length > 1) {
      embeds = embeds.filter((_, i) => i !== index);
      showNotificationMessage("Embed removed");
    }
  }

  function duplicateEmbed(index: number) {
    const duplicated = JSON.parse(JSON.stringify(embeds[index]));
    embeds.splice(index + 1, 0, duplicated);
    embeds = [...embeds];
    showNotificationMessage("Embed duplicated");
  }

  function handleEmbedUpdate(detail: { embed: any; index: number }) {
    const { embed, index } = detail;
    embeds[index] = embed;
    embeds = [...embeds];
    validateEmbeds();
  }

  // Component Row management
  function addRow() {
    if (getTotalComponentCount() >= 25) return;

    const rowKey = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRow: ComponentRow = {
      componentKey: rowKey, // Keep the same as rowKey for consistency
      rowKey,
      components: []
    };

    componentRows = [...componentRows, newRow];
    showNotificationMessage("New row added");
  }

  function addComponentToRow(rowKey: string, type: "button" | "select") {
    const rowIndex = componentRows.findIndex(r => r.rowKey === rowKey);
    if (rowIndex === -1) return;

    const row = componentRows[rowIndex];

    // Check total component limit
    if (getTotalComponentCount() >= 25) {
      showNotificationMessage("Maximum 25 components allowed", "error");
      return;
    }

    // Check row limits
    if (type === "button" && row.components.length >= 5) {
      showNotificationMessage("Maximum 5 buttons per row", "error");
      return;
    }

    if (type === "select" && row.components.length > 0) {
      showNotificationMessage("Select menus must be alone in a row", "error");
      return;
    }

    if (row.components.some(c => c.isSelect)) {
      showNotificationMessage("Cannot add components to a row with a select menu", "error");
      return;
    }

    const componentKey = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newComponent: NewEmbedComponent = {
      componentKey,
      id: null,
      rowIndex, // Track which row this belongs to
      displayName: type === "button" ? "New Button" : "New Select",
      style: type === "button" ? 1 : 0,
      url: "",
      emoji: "",
      isSelect: type === "select",
      maxOptions: 1,
      minOptions: 1,
      options: type === "select" ? [] : []
    };

    row.components = [...row.components, newComponent];
    componentRows = [...componentRows];
    showNotificationMessage(`${type === "button" ? "Button" : "Select menu"} added`);
  }

  function removeRow(rowKey: string) {
    componentRows = componentRows.filter(r => r.rowKey !== rowKey);

    // Update rowIndex for all components after removal
    componentRows = componentRows.map((r, idx) => ({
      ...r,
      components: r.components.map(c => ({
        ...c,
        rowIndex: idx
      }))
    }));

    showNotificationMessage("Row removed");
  }

  function duplicateRow(rowKey: string) {
    const row = componentRows.find(r => r.rowKey === rowKey);
    if (!row) return;

    if (componentRows.length >= 5) {
      showNotificationMessage("Maximum 5 rows allowed", "error");
      return;
    }

    const timestamp = Date.now();
    const newRowKey = `row-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

    const sourceRowIndex = componentRows.indexOf(row);
    const newRowIndex = sourceRowIndex + 1;

    const duplicatedComponents = row.components.map((comp, idx) => ({
      ...JSON.parse(JSON.stringify(comp)),
      componentKey: `component-${timestamp}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      rowIndex: newRowIndex // Update rowIndex for the new row
    }));

    const newRow: ComponentRow = {
      componentKey: newRowKey, // Keep the same as rowKey for consistency
      rowKey: newRowKey,
      components: duplicatedComponents
    };

    componentRows.splice(newRowIndex, 0, newRow);

    // Update rowIndex for all components in rows that shifted
    componentRows = componentRows.map((r, idx) => ({
      ...r,
      components: r.components.map(c => ({
        ...c,
        rowIndex: idx
      }))
    }));

    showNotificationMessage("Row duplicated");
  }

  function duplicateComponent(componentKey: string) {
    for (let rowIdx = 0; rowIdx < componentRows.length; rowIdx++) {
      const row = componentRows[rowIdx];
      const component = row.components.find(c => c.componentKey === componentKey);
      if (component) {
        // Check if we can add more to this row
        if (component.isSelect) {
          showNotificationMessage("Cannot duplicate select menu in same row", "error");
          return;
        }

        if (row.components.length >= 5) {
          showNotificationMessage("Row is full (max 5 buttons)", "error");
          return;
        }

        const duplicated = {
          ...JSON.parse(JSON.stringify(component)),
          componentKey: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          rowIndex: rowIdx // Ensure correct rowIndex
        };

        const index = row.components.indexOf(component);
        row.components.splice(index + 1, 0, duplicated);
        componentRows = [...componentRows];
        showNotificationMessage("Component duplicated");
        return;
      }
    }
  }

  // Custom drag and drop handlers
  function handleDragStart(e: DragEvent | TouchEvent, component: NewEmbedComponent, fromRow: string) {
    draggedComponent = component;
    draggedFromRow = fromRow;
    isDragging = true;

    // Add dragging class to body
    document.body.classList.add("dragging");

    // Set drag data for desktop
    if (e instanceof DragEvent && e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", component.componentKey);
    }
  }

  function handleDragEnd() {
    draggedComponent = null;
    draggedFromRow = null;
    dragOverRow = null;
    dragOverIndex = -1;
    isDragging = false;

    // Remove dragging class from body
    document.body.classList.remove("dragging");
  }

  function handleDragOver(e: DragEvent | TouchEvent, rowKey: string, index: number) {
    e.preventDefault();

    if (!isDragging) return;

    // For row-level drag over, calculate index based on mouse position
    if (index === -1 && e instanceof DragEvent) {
      const dropZone = e.currentTarget as HTMLElement;
      const components = dropZone.querySelectorAll("[data-component]");
      let calculatedIndex = components.length;

      for (let i = 0; i < components.length; i++) {
        const rect = (components[i] as HTMLElement).getBoundingClientRect();
        if (e.clientX < rect.left + rect.width / 2) {
          calculatedIndex = i;
          break;
        }
      }

      dragOverRow = rowKey;
      dragOverIndex = calculatedIndex;
    } else {
      dragOverRow = rowKey;
      dragOverIndex = index >= 0 ? index : 0;
    }
  }

  function handleDrop(e: DragEvent | TouchEvent, targetRowKey: string) {
    e.preventDefault();

    if (!draggedComponent || !draggedFromRow) return;
    const dragged = draggedComponent;

    const targetRowIndex = componentRows.findIndex(r => r.rowKey === targetRowKey);
    const sourceRowIndex = componentRows.findIndex(r => r.rowKey === draggedFromRow);

    if (targetRowIndex === -1 || sourceRowIndex === -1) return;

    const targetRow = componentRows[targetRowIndex];

    // Validate constraints
    const isSelect = dragged.isSelect;
    const targetHasSelect = targetRow.components.some(c => c.isSelect);
    const targetButtonCount = targetRow.components.filter(c => !c.isSelect).length;

    if (isSelect && targetRow.components.length > 0) {
      showNotificationMessage("Select menus must be alone in a row", "error");
      handleDragEnd();
      return;
    }

    if (targetHasSelect && !isSelect) {
      showNotificationMessage("Cannot add buttons to a row with a select menu", "error");
      handleDragEnd();
      return;
    }

    if (!isSelect && targetButtonCount >= 5 && draggedFromRow !== targetRowKey) {
      showNotificationMessage("Maximum 5 buttons per row", "error");
      handleDragEnd();
      return;
    }

    // Remove from source row
    if (sourceRowIndex !== targetRowIndex) {
      componentRows[sourceRowIndex].components = componentRows[sourceRowIndex].components.filter(
        c => c.componentKey !== dragged.componentKey
      );
    }

    // Add to target row at the correct position
    const insertIndex = dragOverIndex >= 0 ? dragOverIndex : targetRow.components.length;

    // Update component's rowIndex
    const updatedComponent = { ...dragged, rowIndex: targetRowIndex };

    // If same row, remove first then insert
    if (sourceRowIndex === targetRowIndex) {
      targetRow.components = targetRow.components.filter(c => c.componentKey !== dragged.componentKey);
    }

    targetRow.components.splice(insertIndex, 0, updatedComponent);

    // Force reactive update
    componentRows = [...componentRows];

    handleDragEnd();
  }

  // Row drag and drop handlers
  function handleRowDragStart(e: DragEvent | TouchEvent, row: ComponentRow) {
    draggedRow = row;
    isDraggingRow = true;

    // Add dragging class to body
    document.body.classList.add("dragging-row");

    // Set drag data for desktop
    if (e instanceof DragEvent && e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", row.rowKey);
    }
  }

  function handleRowDragEnd() {
    draggedRow = null;
    dragOverRowIndex = -1;
    isDraggingRow = false;

    // Remove dragging class from body
    document.body.classList.remove("dragging-row");
  }

  function handleRowDragOver(e: DragEvent | TouchEvent, targetIndex: number) {
    e.preventDefault();

    if (!isDraggingRow || !draggedRow) return;

    dragOverRowIndex = targetIndex;
  }

  function handleRowDrop(e: DragEvent | TouchEvent, targetIndex: number) {
    e.preventDefault();

    if (!draggedRow || !isDraggingRow) return;

    const sourceIndex = componentRows.findIndex(r => draggedRow !== null && r.rowKey === draggedRow.rowKey);

    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      handleRowDragEnd();
      return;
    }

    // Remove the dragged row from its current position
    const [movedRow] = componentRows.splice(sourceIndex, 1);

    // Insert it at the new position
    componentRows.splice(targetIndex, 0, movedRow);

    // Update rowIndex for all components
    componentRows = componentRows.map((row, idx) => ({
      ...row,
      components: row.components.map(c => ({
        ...c,
        rowIndex: idx
      }))
    }));

    handleRowDragEnd();
  }

  // Touch event handlers for rows
  function handleRowTouchStart(e: TouchEvent, row: ComponentRow) {
    e.preventDefault();
    const touch = e.touches[0];
    const element = e.target as HTMLElement;

    // Store scroll position
    scrollPosition.x = window.pageXOffset;
    scrollPosition.y = window.pageYOffset;

    // Start row drag
    handleRowDragStart(e, row);

    // Visual feedback
    element.style.opacity = "0.5";

    // Prevent scrolling - Safari specific
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.webkitUserSelect = "none";
    (document.body.style as any).webkitTouchCallout = "none";
    document.body.classList.add("dragging-active");

    // Add global touch move listener to prevent scrolling
    document.addEventListener("touchmove", preventScroll, { passive: false });

    // Extra Safari fix - save body position and fix it
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition.y}px`;
    document.body.style.width = "100%";
  }

  function handleRowTouchMove(e: TouchEvent) {
    if (!isDraggingRow || !draggedRow) return;

    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];

    // Find row under touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elementBelow) {
      const rowElement = elementBelow.closest("[aria-label^=\"Row \"]");
      if (rowElement) {
        const allRows = document.querySelectorAll("[aria-label^=\"Row \"]");
        const index = Array.from(allRows).indexOf(rowElement);
        if (index !== -1) {
          dragOverRowIndex = index;
        }
      }
    }
  }

  function handleRowTouchEnd(e: TouchEvent) {
    if (!isDraggingRow) return;

    e.preventDefault();

    // Re-enable scrolling
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    document.body.style.webkitUserSelect = "";
    (document.body.style as any).webkitTouchCallout = "";
    document.body.classList.remove("dragging-active");

    // Restore scroll position
    window.scrollTo(scrollPosition.x, scrollPosition.y);

    // Remove global touch move listener
    document.removeEventListener("touchmove", preventScroll);

    // Reset visual feedback
    const element = e.target as HTMLElement;
    element.style.opacity = "";

    if (dragOverRowIndex >= 0) {
      handleRowDrop(e, dragOverRowIndex);
    } else {
      handleRowDragEnd();
    }
  }

  // Helper function to prevent scrolling
  function preventScroll(e: TouchEvent) {
    e.preventDefault();
    return false;
  }

  // Store scroll position to restore after drag
  let scrollPosition = { x: 0, y: 0 };

  // Touch event handlers for components
  let touchItem: HTMLElement | null = null;
  let touchOffset = { x: 0, y: 0 };

  function handleTouchStart(e: TouchEvent, component: NewEmbedComponent, fromRow: string) {
    e.preventDefault();
    const touch = e.touches[0];
    touchItem = e.target as HTMLElement;

    // Store scroll position
    scrollPosition.x = window.pageXOffset;
    scrollPosition.y = window.pageYOffset;

    const rect = touchItem.getBoundingClientRect();
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;

    handleDragStart(e, component, fromRow);

    // Prevent scrolling while dragging - Safari specific
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.webkitUserSelect = "none";
    (document.body.style as any).webkitTouchCallout = "none";
    document.body.classList.add("dragging-active");

    // Add global touch move listener to prevent scrolling
    document.addEventListener("touchmove", preventScroll, { passive: false });

    // Extra Safari fix - save body position and fix it
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition.y}px`;
    document.body.style.width = "100%";
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || !touchItem) return;

    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];

    // Move a ghost element
    if (touchItem) {
      touchItem.style.position = "fixed";
      touchItem.style.zIndex = "9999";
      touchItem.style.left = `${touch.clientX - touchOffset.x}px`;
      touchItem.style.top = `${touch.clientY - touchOffset.y}px`;
      touchItem.style.opacity = "0.8";
      touchItem.style.pointerEvents = "none";
    }

    // Find element under touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elementBelow) {
      const dropZone = elementBelow.closest("[data-drop-zone]");
      if (dropZone) {
        const rowKey = dropZone.getAttribute("data-row-key");
        if (rowKey) {
          // Calculate index based on position
          const components = dropZone.querySelectorAll("[data-component]");
          let index = components.length;

          for (let i = 0; i < components.length; i++) {
            const rect = components[i].getBoundingClientRect();
            if (touch.clientX < rect.left + rect.width / 2) {
              index = i;
              break;
            }
          }

          dragOverRow = rowKey;
          dragOverIndex = index;
        }
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!isDragging) return;

    e.preventDefault();

    // Re-enable scrolling
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    document.body.style.webkitUserSelect = "";
    (document.body.style as any).webkitTouchCallout = "";
    document.body.classList.remove("dragging-active");

    // Restore scroll position
    window.scrollTo(scrollPosition.x, scrollPosition.y);

    // Remove global touch move listener
    document.removeEventListener("touchmove", preventScroll);

    if (touchItem) {
      touchItem.style.position = "";
      touchItem.style.zIndex = "";
      touchItem.style.left = "";
      touchItem.style.top = "";
      touchItem.style.opacity = "";
      touchItem.style.pointerEvents = "";
    }

    if (dragOverRow) {
      handleDrop(e, dragOverRow);
    } else {
      handleDragEnd();
    }

    touchItem = null;
  }

  function handleComponentUpdate(detail: { component: NewEmbedComponent }) {
    const { component } = detail;

    for (const row of componentRows) {
      const index = row.components.findIndex(c => c.componentKey === component.componentKey);
      if (index !== -1) {
        row.components[index] = component;
        componentRows = [...componentRows];
        validateComponents();
        return;
      }
    }
  }

  function handleComponentRemove(detail: { componentKey: string }) {
    const { componentKey } = detail;

    for (const row of componentRows) {
      const initialLength = row.components.length;
      row.components = row.components.filter(c => c.componentKey !== componentKey);

      if (row.components.length !== initialLength) {
        componentRows = [...componentRows];
        showNotificationMessage("Component removed");
        return;
      }
    }
  }

  function handleComponentEdit(detail: { component: NewEmbedComponent }) {
    const { component } = detail;
    editingComponent = JSON.parse(JSON.stringify(component));
  }

  function getTotalComponentCount(): number {
    return componentRows.reduce((sum, row) => sum + row.components.length, 0);
  }

  // Flatten rows for rendering and export
  let flattenedComponents = $derived(
    componentRows.flatMap(row => row.components)
  );

  // Group components by row for display
  let componentsByRow = $derived(() => {
    const grouped = new Map<string, NewEmbedComponent[]>();
    componentRows.forEach(row => {
      grouped.set(row.rowKey, row.components);
    });
    return grouped;
  });

  // Placeholder handling
  function showPlaceholderFromButton(buttonElement: HTMLButtonElement, field: string) {
    const inputElement = buttonElement.previousElementSibling as HTMLInputElement | HTMLTextAreaElement;
    if (inputElement) {
      currentEditingElement = inputElement;
      currentEditingField = field;

      const rect = inputElement.getBoundingClientRect();
      placeholderPosition = {
        x: rect.left,
        y: rect.bottom + 8
      };

      showPlaceholderPicker = true;
    }
  }

  function handlePlaceholderSelect(detail: { placeholder: Placeholder }) {
    const { placeholder } = detail;
    insertPlaceholder(placeholder);
  }

  function insertPlaceholder(placeholder: Placeholder) {
    if (!currentEditingElement) return;

    const start = currentEditingElement.selectionStart || 0;
    const end = currentEditingElement.selectionEnd || 0;
    const text = currentEditingElement.value;

    currentEditingElement.value = text.substring(0, start) + placeholder.name + text.substring(end);
    currentEditingElement.selectionStart = currentEditingElement.selectionEnd = start + placeholder.name.length;

    // Update the corresponding data
    if (currentEditingField) {
      const changeEvent = new Event('input', { bubbles: true });
      currentEditingElement.dispatchEvent(changeEvent);
    }

    showPlaceholderPicker = false;
  }

  // Validation
  function validateEmbeds() {
    validationErrors = [];
    validationWarnings = [];
    
    embeds.forEach((embed, index) => {
      // Check embed limits
      if (embed.title && embed.title.length > 256) {
        validationErrors.push({
          id: `embed-${index}-title`,
          message: `Embed ${index + 1} title exceeds 256 characters`,
          field: `embeds[${index}].title`
        });
      }
      
      if (embed.description && embed.description.length > 4096) {
        validationErrors.push({
          id: `embed-${index}-description`,
          message: `Embed ${index + 1} description exceeds 4096 characters`,
          field: `embeds[${index}].description`
        });
      }
      
      // Warn about empty embeds
      if (!embed.title && !embed.description && embed.fields.length === 0) {
        validationWarnings.push({
          id: `embed-${index}-empty`,
          message: `Embed ${index + 1} is empty`,
          field: `embeds[${index}]`
        });
      }
    });
  }

  function validateComponents() {
    // Clear any component-related errors before re-validating
    validationErrors = validationErrors.filter(err => !err.id.startsWith("component-"));

    flattenedComponents.forEach((component, index) => {
      if (!component.isSelect && component.style !== 5 && !component.id) {
        validationErrors.push({
          id: `component-${component.componentKey}-trigger`,
          message: `${component.isSelect ? 'Select menu' : 'Button'} "${component.displayName}" needs a trigger`,
          field: `components[${index}]`
        });
      }

      if (component.isSelect) {
        component.options.forEach((option, optIndex) => {
          if (!option.id) {
            validationErrors.push({
              id: `component-${component.componentKey}-option-${optIndex}-trigger`,
              message: `Option "${option.name}" needs a trigger`,
              field: `components[${index}].options[${optIndex}]`
            });
          }
        });
      }
    });
  }

  // Clean up empty embed properties
  function cleanEmbed(embed: Embed) {
    const cleaned: any = {};

    // Only include non-empty string properties
    if (embed.title?.trim()) cleaned.title = embed.title;
    if (embed.description?.trim()) cleaned.description = embed.description;
    if (embed.color) cleaned.color = embed.color;
    if (embed.url?.trim()) cleaned.url = embed.url;

    // Only include author if any field is populated
    if (embed.author?.name?.trim() || embed.author?.url?.trim() || embed.author?.icon_url?.trim()) {
      cleaned.author = {};
      if (embed.author.name?.trim()) cleaned.author.name = embed.author.name;
      if (embed.author.url?.trim()) cleaned.author.url = embed.author.url;
      if (embed.author.icon_url?.trim()) cleaned.author.icon_url = embed.author.icon_url;
    }

    // Only include footer if any field is populated
    if (embed.footer?.text?.trim() || embed.footer?.icon_url?.trim()) {
      cleaned.footer = {};
      if (embed.footer.text?.trim()) cleaned.footer.text = embed.footer.text;
      if (embed.footer.icon_url?.trim()) cleaned.footer.icon_url = embed.footer.icon_url;
    }

    // Only include thumbnail/image if URL is populated
    if (embed.thumbnail?.url?.trim()) {
      cleaned.thumbnail = { url: embed.thumbnail.url };
    }
    if (embed.image?.url?.trim()) {
      cleaned.image = { url: embed.image.url };
    }

    // Only include fields if there are any
    if (embed.fields?.length > 0) {
      cleaned.fields = embed.fields;
    }

    return cleaned;
  }

  // Clean component for export
  function cleanComponent(component: NewEmbedComponent) {
    const cleaned: any = {
      row: component.rowIndex, // Use the component's own rowIndex
      displayName: component.displayName,
      style: component.style,
      isSelect: component.isSelect
    };

    // Add trigger ID if present
    if (component.id) {
      cleaned.id = component.id;
    }

    // Add URL for link buttons
    if (component.style === 5 && component.url?.trim()) {
      cleaned.url = component.url;
    }

    // Add emoji if present
    if (component.emoji?.trim()) {
      cleaned.emoji = component.emoji;
    }

    // Select menu specific fields
    if (component.isSelect) {
      cleaned.minOptions = component.minOptions;
      cleaned.maxOptions = component.maxOptions;

      // Only include options if there are any
      if (component.options?.length > 0) {
        cleaned.options = component.options.map(opt => {
          const cleanedOpt: any = {
            name: opt.name
          };

          if (opt.id) cleanedOpt.id = opt.id;
          if (opt.description?.trim()) cleanedOpt.description = opt.description;
          if (opt.emoji?.trim()) cleanedOpt.emoji = opt.emoji;

          return cleanedOpt;
        });
      }
    }

    return cleaned;
  }

  // JSON export
  async function copyJson() {
    const cleanedEmbeds = embeds
      .filter(embed => embed.title || embed.description || embed.fields.length > 0)
      .map(cleanEmbed);

    const exportData: any = {};

    // Only include content if it's not empty
    if (content.trim()) {
      exportData.content = content.trim();
    }

    // Only include embeds if there are any
    if (cleanedEmbeds.length > 0) {
      exportData.embeds = cleanedEmbeds;
    }

    // Clean and flatten components
    if (componentRows.length > 0) {
      const cleanedComponents: any[] = [];

      componentRows.forEach(row => {
        row.components.forEach(component => {
          cleanedComponents.push(cleanComponent(component));
        });
      });

      if (cleanedComponents.length > 0) {
        exportData.components = cleanedComponents;
      }
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      jsonCopied = true;
      showNotificationMessage("JSON copied to clipboard!");
      setTimeout(() => jsonCopied = false, 2000);
    } catch (error) {
      logger.error('Failed to copy JSON:', error);
      showNotificationMessage("Failed to copy JSON", "error");
    }
  }



  // Complete placeholders data from placeholders page
  const placeholders: Placeholder[] = [
    // AFK placeholders
    { category: "AFK", name: "%afk.message%", description: "The users afk message" },
    { category: "AFK", name: "%afk.user%", description: "The users name and discriminator" },
    { category: "AFK", name: "%afk.user.mention%", description: "The mention of the afk user" },
    { category: "AFK", name: "%afk.user.avatar%", description: "The avatar url of the user" },
    { category: "AFK", name: "%afk.user.id%", description: "The id of the afk user" },
    { category: "AFK", name: "%afk.triggeruser%", description: "The trigger users username and discriminator" },
    { category: "AFK", name: "%afk.triggeruser.avatar%", description: "The trigger users avatar" },
    { category: "AFK", name: "%afk.triggeruser.mention%", description: "The mention of the trigger user" },
    { category: "AFK", name: "%afk.triggeruser.id%", description: "The id of the trigger user" },
    { category: "AFK", name: "%afk.time%", description: "How long the user has been afk" },
    
    // Suggestions placeholders
    { category: "Suggestions", name: "%suggest.user%", description: "The full username of the user who's suggestion got updated" },
    { category: "Suggestions", name: "%suggest.user.id%", description: "The Id of the user who's suggestion got updated" },
    { category: "Suggestions", name: "%suggest.message%", description: "The original suggestion" },
    { category: "Suggestions", name: "%suggest.number%", description: "The suggestion number that was updated" },
    { category: "Suggestions", name: "%suggest.user.name%", description: "The name of the user who's suggestion got updated" },
    { category: "Suggestions", name: "%suggest.user.avatar%", description: "The avatar of the original suggester" },
    { category: "Suggestions", name: "%suggest.mod.user%", description: "The full username of the one who updated the suggestion" },
    { category: "Suggestions", name: "%suggest.mod.avatar%", description: "The pfp of the one who updated the suggestion" },
    { category: "Suggestions", name: "%suggest.mod.name%", description: "The name of the person who updated the suggestion" },
    { category: "Suggestions", name: "%suggest.mod.message%", description: "The reason the suggestion was updated" },
    
    // User placeholders
    { category: "User", name: "%user%", description: "Username of the user" },
    { category: "User", name: "%user.mention%", description: "Mention the user" },
    { category: "User", name: "%user.id%", description: "User ID" },
    { category: "User", name: "%user.avatar%", description: "User's avatar URL" },
    { category: "User", name: "%user.name%", description: "User's display name" },
    { category: "User", name: "%user.nick%", description: "User's nickname in the server" },
    
    // Server placeholders
    { category: "Server", name: "%server%", description: "Server name" },
    { category: "Server", name: "%server.id%", description: "Server ID" },
    { category: "Server", name: "%server.members%", description: "Number of server members" },
    { category: "Server", name: "%server.owner%", description: "Server owner username" },
    { category: "Server", name: "%server.icon%", description: "Server icon URL" },
    
    // Random placeholders
    { category: "Random", name: "%rng%", description: "Random number" },
    { category: "Random", name: "%rng(1,10)%", description: "Random number between 1 and 10" },
    { category: "Random", name: "%choose(a|b|c)%", description: "Choose randomly from options" },
    { category: "Random", name: "%target%", description: "Returns anything the user has written after the trigger" },
    { category: "Random", name: "%img:stuff%", description: "Returns an imgur.com search for 'stuff' (custom reactions only)" }
  ];


  // Tab change handler for DashboardPageLayout
  function handleMainTabChange(detail: { tabId: string }) {
    activeMainTab = detail.tabId;
    
    // Validate when switching tabs
    validateEmbeds();
    validateComponents();
  }


  $effect(() => {
        currentGuild.subscribe((guild) => {
            if (guild) {
              loadChatTriggers(BigInt(guild.id));
            }
        });
    });
    // Can copy validation
    let canCopyJson = $derived(embeds.some(embed =>
        embed.title || embed.description || embed.fields.length > 0
    ) || content.trim().length > 0);
  // Action buttons for DashboardPageLayout
    let actionButtons = $derived([
    {
      label: jsonCopied ? 'Copied!' : 'Copy JSON',
      icon: "fa-copy",
      action: copyJson,
      disabled: !canCopyJson,
      loading: false,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text};`
    }
    ]);
</script>

{#snippet statusMessageContent()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  title="Discord Embed Builder"
  subtitle="Create and customize embeds for your Discord server"
  icon="fa-layer-group"
  guildName="Embed Builder"
  tabs={mainTabs}
  activeTab={activeMainTab}
  {actionButtons}
  ontabChange={handleMainTabChange}
  statusMessages={statusMessageContent}
>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full w-full">
    <!-- Editor Side -->
    <section
      class="rounded-2xl border shadow-2xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="p-6 min-h-[600px]">
        {#if activeMainTab === "templates"}
          <!-- Templates Tab -->
          <div class="space-y-6">
            <div class="text-center mb-6">
              <h2 class="text-xl font-semibold mb-2" style="color: {$colorStore.text};">Choose a Template</h2>
              <p class="text-sm" style="color: {$colorStore.muted};">
                Start with a pre-built template or create from scratch
              </p>
            </div>

            <TemplateGallery
              onselect={handleTemplateSelect}
            />
            
            <div class="text-center pt-6 border-t" style="border-color: {$colorStore.primary}20;">
              <button
                aria-label="Start from scratch"
                class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 mx-auto"
                style="background: {$colorStore.primary}20;
                       color: {$colorStore.primary};
                       border: 1px solid {$colorStore.primary}30;"
                onclick={() => activeMainTab = "editor"}
              >
                <i class="fa-solid fa-layer-group" style="font-size: 16px;"></i>
                Start from Scratch
              </button>
            </div>
          </div>

        {:else if activeMainTab === "editor"}
          <!-- Editor Tab -->
          <div class="space-y-6">
            <!-- Message Content -->
            <div>
              <label for="embed-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                Message Content (optional)
              </label>
              <div class="relative">
                <textarea id="embed-title"
                          rows="3"
                          class="w-full px-3 py-2 pr-10 rounded-lg border resize-y"
                          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          placeholder="Optional message content that appears above the embed..."
                          bind:value={content}
                ></textarea>
                <button
                  class="absolute right-2 top-2 p-1 rounded-sm hover:bg-black/10"
                  style="color: {$colorStore.muted};"
                  onclick={(e) => showPlaceholderFromButton(e.currentTarget, 'content')}
                  title="Insert placeholder"
                >
                  %
                </button>
              </div>
              <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                Click % for placeholders
              </p>
            </div>

            <!-- Embeds List -->
            <div class="space-y-4">
              <div class="flex justify-between items-center z-50">
                <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">
                  Embeds ({embeds.length}/10)
                </h3>
                <button
                  aria-label="Add embed"
                  class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  disabled={embeds.length >= 10}
                  onclick={addEmbed}
                >
                  <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                  Add Embed
                </button>
              </div>

              {#each embeds as embed, index}
                <EmbedEditor
                  {embed}
                  {index}
                  {placeholders}
                  onupdate={handleEmbedUpdate}
                  onremove={(detail) => removeEmbed(detail.index)}
                  onduplicate={(detail) => duplicateEmbed(detail.index)}
                />
              {/each}
            </div>
          </div>

        {:else if activeMainTab === "components"}
          <!-- Components Tab -->
          <div class="space-y-4 sm:space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-base sm:text-lg font-semibold" style="color: {$colorStore.text};">
                  Components <span class="text-xs sm:text-sm font-normal">({getTotalComponentCount()}/25)</span>
                </h3>
                <p class="text-xs sm:text-sm" style="color: {$colorStore.muted};">
                  <span class="hidden sm:inline">Rows: {componentRows.length}/5 • Max 5 buttons per row</span>
                  <span class="sm:hidden">R:{componentRows.length}/5 • B:5/row</span>
                </p>
              </div>

              <button
                aria-label="Add row"
                class="px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-base font-medium transition-all hover:scale-[1.02] flex items-center gap-1 sm:gap-2 disabled:opacity-50"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={componentRows.length >= 5 || getTotalComponentCount() >= 25}
                onclick={addRow}
              >
                <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                <span class="hidden sm:inline">Add Row</span>
                <span class="sm:hidden">Row</span>
              </button>
            </div>

            {#if componentRows.length === 0}
              <div class="text-center py-6 sm:py-12">
                <i class="fa-utility-duo fa-regular fa-comment"
                   style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 36px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
                <h4 class="text-base sm:text-lg font-semibold mb-1 sm:mb-2" style="color: {$colorStore.text};">No rows
                  yet</h4>
                <p class="text-xs sm:text-sm mb-2 sm:mb-4" style="color: {$colorStore.muted};">
                  Click "Add Row" to start adding buttons or select menus
                </p>
              </div>
            {:else}
              <!-- Mobile drag hint -->
              <div class="sm:hidden text-center mb-3">
                <p class="text-[10px] flex items-center justify-center gap-1" style="color: {$colorStore.muted};">
                  <i class="fa-solid fa-grip-vertical" style="font-size: 10px;"></i>
                  Drag the handle to reorder rows
                </p>
              </div>
              <div
                class="space-y-4"
                role="list"
                ondragover={(e) => {
                  if (isDraggingRow) {
                    e.preventDefault();
                    handleRowDragOver(e, componentRows.length);
                  }
                }}
                ondrop={(e) => {
                  if (isDraggingRow && dragOverRowIndex === componentRows.length) {
                    handleRowDrop(e, componentRows.length);
                  }
                }}
              >
                {#each componentRows as row, rowIndex (row.componentKey)}
                  <!-- Row drop indicator -->
                  {#if isDraggingRow && dragOverRowIndex === rowIndex}
                    <div
                      class="h-2 rounded transition-all"
                      style="background: {$colorStore.primary}50;"
                    ></div>
                  {/if}

                  <!-- Row container -->
                  <div
                    class="relative p-2 sm:p-4 border rounded-lg transition-all"
                    class:opacity-50={isDraggingRow && draggedRow?.rowKey === row.rowKey}
                    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
                    role="listitem"
                    aria-label="Row {rowIndex + 1}"
                    ondragover={(e) => handleRowDragOver(e, rowIndex)}
                    ondrop={(e) => handleRowDrop(e, rowIndex)}
                  >
                    <!-- Row Header -->
                    <div class="flex items-center justify-between mb-2 sm:mb-3">
                      <div class="flex items-center gap-1 sm:gap-2">
                        <div
                          class="cursor-grab p-2 sm:p-1 -m-2 sm:-m-1 rounded-md hover:bg-white/5 active:bg-white/10 transition-all hover:scale-110 active:scale-95"
                          style="touch-action: none; background: {$colorStore.primary}10;"
                          role="button"
                          tabindex="0"
                          draggable="true"
                          ondragstart={(e) => handleRowDragStart(e, row)}
                          ondragend={handleRowDragEnd}
                          ontouchstart={(e) => handleRowTouchStart(e, row)}
                          ontouchmove={(e) => handleRowTouchMove(e)}
                          ontouchend={(e) => handleRowTouchEnd(e)}
                          title="Drag to reorder row"
                          aria-label="Drag handle for row {componentRows.indexOf(row) + 1}"
                        >
                          <i
                            class="fa-solid fa-grip-vertical"
                            style="color: {$colorStore.primary}; font-size: 16px; pointer-events: none;"
                          ></i>
                        </div>
                        <span class="text-xs sm:text-sm font-medium" style="color: {$colorStore.text};">
                          Row {componentRows.indexOf(row) + 1}
                          <span class="hidden sm:inline"> ({row.components.length}
                            component{row.components.length !== 1 ? 's' : ''})</span>
                          <span class="sm:hidden"> ({row.components.length})</span>
                        </span>
                      </div>
                      <div class="flex gap-1 sm:gap-2">
                        <button
                          aria-label="Duplicate row"
                          class="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all hover:scale-[1.02] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                          disabled={row.components.length === 0}
                          onclick={(e) => {
                            e.stopPropagation();
                            duplicateRow(row.rowKey);
                          }}
                        >
                          <i class="fa-solid fa-copy" style="font-size: 10px;"></i>
                          <span class="hidden sm:inline">Duplicate</span>
                        </button>
                        <button
                          aria-label="Remove row"
                          class="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all hover:scale-[1.02] font-medium"
                          style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
                          onclick={(e) => {
                            e.stopPropagation();
                            removeRow(row.rowKey);
                          }}
                        >
                          <i class="fa-solid fa-trash" style="font-size: 10px;"></i>
                          <span class="hidden sm:inline">Remove Row</span>
                        </button>
                      </div>
                    </div>

                    <!-- Row Components -->
                    {#if row.components.length === 0}
                      <div class="text-center py-3 sm:py-6">
                        <p class="text-xs sm:text-sm mb-2 sm:mb-3" style="color: {$colorStore.muted};">
                          This row is empty
                        </p>
                        <div class="flex gap-1 sm:gap-2 justify-center">
                          <button
                            aria-label="Add button"
                            class="px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-1 sm:gap-2"
                            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                            onclick={(e) => {
                              e.stopPropagation();
                              addComponentToRow(row.rowKey, 'button');
                            }}
                          >
                            <i class="fa-solid fa-plus" style="font-size: 11px;"></i>
                            Add Button
                          </button>
                          <button
                            aria-label="Add select"
                            class="px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-1 sm:gap-2"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                            onclick={(e) => {
                              e.stopPropagation();
                              addComponentToRow(row.rowKey, 'select');
                            }}
                          >
                            <i class="fa-solid fa-plus" style="font-size: 11px;"></i>
                            Add Select
                          </button>
                        </div>
                      </div>
                    {:else}
                      <!-- Editing Mode (full width when editing) -->
                      {#if editingComponent && row.components.some(c => c.componentKey === editingComponent!.componentKey)}
                        <div class="p-2 sm:p-3 border rounded-lg mb-2 sm:mb-3"
                             style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}30;">
                          <ComponentEditor
                            component={editingComponent}
                            triggers={chatTriggers}
                            isEditing={true}
                            user={data.user}
                            onupdate={(detail) => {
                              editingComponent = detail.component;
                            }}
                            onremove={handleComponentRemove}
                            onedit={handleComponentEdit}
                            onduplicate={(detail) => {
                              duplicateComponent(detail.componentKey);
                              editingComponent = null;
                            }}
                          />

                          <!-- Edit Action Buttons -->
                          <div class="flex justify-end gap-1 sm:gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t"
                               style="border-color: {$colorStore.secondary}20;">
                            <button
                              aria-label="Cancel"
                              class="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base rounded-md sm:rounded-lg font-medium transition-all hover:scale-[1.02]"
                              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                              onclick={(e) => {
                                e.stopPropagation();
                                editingComponent = null;
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              aria-label="Done"
                              class="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base rounded-md sm:rounded-lg font-medium transition-all hover:scale-[1.02]"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                              onclick={(e) => {
                                e.stopPropagation();
                                if (editingComponent) {
                                  handleComponentUpdate({ component: editingComponent });
                                }
                                editingComponent = null;
                              }}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      {/if}

                      <!-- Components in this row -->
                      <div
                        class="flex gap-2 flex-wrap min-h-[50px] relative"
                        data-drop-zone
                        data-row-key={row.rowKey}
                        ondragover={(e) => handleDragOver(e, row.rowKey, -1)}
                        ondrop={(e) => handleDrop(e, row.rowKey)}
                        role="list"
                        aria-label="Components in row {rowIndex + 1}"
                      >
                        {#each row.components as component, idx (component.componentKey)}
                          <!-- Draggable placeholder for visual feedback -->
                          {#if isDragging && dragOverRow === row.rowKey && dragOverIndex === idx}
                            <div
                              class="w-2 h-10 rounded transition-all"
                              style="background: {$colorStore.primary}50;"
                            ></div>
                          {/if}

                          <!-- Clickable component preview with drag -->
                          <div
                            class="transition-all cursor-grab"
                            class:w-full={component.isSelect}
                            class:opacity-50={isDragging && draggedComponent?.componentKey === component.componentKey}
                            style="touch-action: none;"
                            aria-label="{component.isSelect ? 'Select menu' : 'Button'} {component.displayName}"
                            draggable="true"
                            data-component
                            ondragstart={(e) => handleDragStart(e, component, row.rowKey)}
                            ondragend={handleDragEnd}
                            ondragover={(e) => handleDragOver(e, row.rowKey, idx)}
                            ontouchstart={(e) => handleTouchStart(e, component, row.rowKey)}
                            ontouchmove={(e) => handleTouchMove(e)}
                            ontouchend={(e) => handleTouchEnd(e)}
                            onclick={() => !isDragging && handleComponentEdit({ component })}
                            onkeydown={(e) => { if (e.key === 'Enter' && !isDragging) handleComponentEdit({ component }); }}
                            role="button"
                            tabindex="0"
                          >
                            <ComponentEditor
                              {component}
                              triggers={chatTriggers}
                              isEditing={false}
                              user={data.user}
                              onupdate={handleComponentUpdate}
                              onremove={handleComponentRemove}
                              onedit={handleComponentEdit}
                              onduplicate={(detail) => duplicateComponent(detail.componentKey)}
                            />
                          </div>
                        {/each}

                        <!-- Ending placeholder for visual feedback -->
                        {#if isDragging && dragOverRow === row.rowKey && dragOverIndex === row.components.length}
                          <div
                            class="w-2 h-10 rounded transition-all"
                            style="background: {$colorStore.primary}50;"
                          ></div>
                        {/if}
                      </div>

                      <!-- Add Component Buttons (if not full) -->
                      {#if !row.components.some(c => c.isSelect) && row.components.length < 5}
                        <div class="flex gap-1 sm:gap-2 justify-center pt-2 sm:pt-3 border-t mt-2 sm:mt-3"
                             style="border-color: {$colorStore.primary}20;">
                          <button
                            aria-label="Add button to row"
                            class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all hover:scale-[1.02] flex items-center gap-1"
                            style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}25;"
                            onclick={(e) => {
                              e.stopPropagation();
                              addComponentToRow(row.rowKey, 'button');
                            }}
                          >
                            <i class="fa-solid fa-plus" style="font-size: 10px;"></i>
                            Button
                          </button>
                        </div>
                      {/if}
                    {/if}
                  </div>
                {/each}

                <!-- Final row drop indicator -->
                {#if isDraggingRow && dragOverRowIndex === componentRows.length}
                  <div
                    class="h-2 rounded transition-all"
                    style="background: {$colorStore.primary}50;"
                  ></div>
                {/if}
              </div>
            {/if}
          </div>

        {/if}
      </div>
    </section>

    <!-- Preview Side -->
    <section
      class="hidden lg:block rounded-2xl border shadow-2xl sticky top-4 self-start"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Live Preview</h3>

        <!-- Validation Card -->
        {#if validationErrors.length > 0 || validationWarnings.length > 0}
          <div class="mb-4">
            <ValidationCard
              errors={validationErrors}
              warnings={validationWarnings}
              title="Issues"
              collapsible={true}
              compact={true}
            />
          </div>
        {/if}

        <PreviewCard
          {content}
          {embeds}
          {componentRows}
          emptyMessage="Your embed preview will appear here"
        />
      </div>
    </section>
  </div>
</DashboardPageLayout>

<!-- Placeholder Picker -->
<PlaceholderPicker
  visible={showPlaceholderPicker}
  position={placeholderPosition}
  {placeholders}
  searchTerm={placeholderSearchTerm}
  onclose={() => showPlaceholderPicker = false}
  onsearch={(detail) => placeholderSearchTerm = detail.term}
  onselect={handlePlaceholderSelect}
/>

<style>
  /* Focus styles for accessibility */
  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Smooth transitions */
  .transition-all {
    transition: all 0.2s ease;
  }

  /* Custom drag and drop styles */
  .cursor-grab {
      cursor: grab;
  }

  .cursor-grab:active {
      cursor: grabbing;
  }

  /* Row drag handle styles */
  .fa-grip-vertical {
      cursor: grab;
  }

  .fa-grip-vertical:active,
  :global(.dragging-row .fa-grip-vertical) {
      cursor: grabbing;
  }

  [draggable="true"] {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
  }

  /* Prevent text selection while dragging */
  :global(.dragging *) {
      user-select: none !important;
      -webkit-user-select: none !important;
  }

  /* Safari-specific drag prevention styles */
  :global(body.dragging-active) {
      position: fixed !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      touch-action: none !important;
      -webkit-touch-callout: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -webkit-overflow-scrolling: touch !important;
  }

  :global(body.dragging-active *) {
      touch-action: none !important;
      -webkit-touch-callout: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
  }

  /* Prevent Safari bounce and elastic scrolling */
  :global(html) {
      overscroll-behavior: none;
  }

  /* Custom scrollbar for mobile */
  @media (max-width: 768px) {

      /* Prevent scrolling on drag containers */
      [data-drop-zone] {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
      }
  }
</style>