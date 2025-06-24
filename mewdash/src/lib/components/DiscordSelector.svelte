<script context="module" lang="ts">
  export type SelectorType = "role" | "channel" | "user" | "timezone";
  export type OptionType = {
    id: string;
    name: string;
    color?: number;
    type?: number;
    offset?: string;
    label?: string;
    value?: string;
  };
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { Hash, Crown, Users, MapPin, ChevronDown, Search, X } from "lucide-svelte";

  // Props
  export let type: SelectorType;
  export let options: OptionType[] = [];
  export let selected: string | string[] | null = null;
  export let multiple: boolean = false;
  export let placeholder: string = "Select...";
  export let searchable: boolean = true;
  export let disabled: boolean = false;

  // Internal state
  let isOpen = false;
  let searchTerm = "";
  let dropdownRef: HTMLDivElement;
  let searchInputRef: HTMLInputElement;
  let containerRef: HTMLDivElement;
  let focusedIndex = -1;
  let dropdownId = `dropdown-${Math.random().toString(36).substring(2, 9)}`;

  const dispatch = createEventDispatcher();

  // Computed values
  $: filteredOptions = searchable && searchTerm
    ? options.filter(option => {
      const searchText = getOptionDisplayName(option).toLowerCase();
      return searchText.includes(searchTerm.toLowerCase());
    })
    : options;

  $: selectedArray = multiple
    ? (Array.isArray(selected) ? selected : selected ? [selected] : [])
    : [];

  $: hasSelection = multiple
    ? selectedArray.length > 0
    : selected !== null && selected !== undefined;

  // Get appropriate icon for selector type
  function getTypeIcon() {
    switch (type) {
      case "channel":
        return Hash;
      case "role":
        return Crown;
      case "user":
        return Users;
      case "timezone":
        return MapPin;
      default:
        return Hash;
    }
  }

  // Get display name with appropriate prefix
  function getOptionDisplayName(option: OptionType): string {
    switch (type) {
      case "channel":
        return `#${option.name}`;
      case "role":
        return `@${option.name}`;
      case "timezone":
        return option.label || `${option.name} (${option.offset || ""})`;
      case "user":
      default:
        return option.name;
    }
  }

  // Get role color as hex string
  function getRoleColorHex(color: number): string {
    if (!color || color === 0) return $colorStore.muted;
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  // Handle option selection
  function selectOption(optionId: string) {
    if (multiple) {
      const currentSelected = Array.isArray(selected) ? selected : [];
      const index = currentSelected.indexOf(optionId);

      if (index === -1) {
        selected = [...currentSelected, optionId];
      } else {
        selected = currentSelected.filter(id => id !== optionId);
      }
    } else {
      selected = optionId;
      closeDropdown();
    }

    dispatch("change", { selected });
  }

  // Remove selected option (for multiple mode)
  function removeOption(optionId: string, event: Event) {
    event.stopPropagation();
    if (multiple && Array.isArray(selected)) {
      selected = selected.filter(id => id !== optionId);
      dispatch("change", { selected });
    }
  }

  // Dropdown control
  function toggleDropdown() {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen) {
      focusedIndex = -1;
      searchTerm = "";

      // Calculate position for fixed positioning
      setTimeout(() => {
        if (containerRef && dropdownRef) {
          const rect = containerRef.getBoundingClientRect();
          dropdownRef.style.setProperty("--dropdown-left", `${rect.left}px`);
          dropdownRef.style.setProperty("--dropdown-top", `${rect.bottom + 4}px`);
          dropdownRef.style.setProperty("--dropdown-width", `${rect.width}px`);
        }

        if (searchable && searchInputRef) {
          searchInputRef.focus();
        }
      }, 0);
    }
  }

  function closeDropdown() {
    isOpen = false;
    focusedIndex = -1;
    searchTerm = "";
  }

  // Get selected option names for display
  function getSelectedDisplayText(): string {
    if (!hasSelection) return placeholder;

    if (multiple) {
      const count = selectedArray.length;
      if (count === 0) return placeholder;
      if (count === 1) {
        const option = options.find(opt => opt.id === selectedArray[0]);
        return option ? getOptionDisplayName(option) : `${count} selected`;
      }
      return `${count} selected`;
    } else {
      const option = options.find(opt => opt.id === selected);
      return option ? getOptionDisplayName(option) : placeholder;
    }
  }

  // Keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen) {
          toggleDropdown();
        } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          selectOption(filteredOptions[focusedIndex].id);
        }
        break;

      case "Escape":
        closeDropdown();
        break;

      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          toggleDropdown();
        } else {
          focusedIndex = Math.min(focusedIndex + 1, filteredOptions.length - 1);
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          focusedIndex = Math.max(focusedIndex - 1, -1);
        }
        break;
    }
  }

  // Click outside handler
  function handleClickOutside(event: Event) {
    if (containerRef && !containerRef.contains(event.target as Node)) {
      closeDropdown();
    }
  }

  // Clear all selections
  function clearAll(event: Event) {
    event.stopPropagation();
    selected = multiple ? [] : null;
    dispatch("change", { selected });
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div
  aria-controls={dropdownId}
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  bind:this={containerRef}
  class="relative"
  on:keydown={handleKeydown}
  role="combobox"
  tabindex={disabled ? -1 : 0}
>
  <!-- Main selector button -->
  <button
    class="w-full p-3 rounded-xl border transition-all duration-200 text-left flex items-center justify-between min-h-[50px]"
    class:cursor-not-allowed={disabled}
    class:opacity-50={disabled}
    {disabled}
    on:click={toggleDropdown}
    style="background: {$colorStore.primary}08;
           border-color: {isOpen ? $colorStore.primary : $colorStore.primary + '30'};
           color: {$colorStore.text};"
    type="button"
  >
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <!-- Type icon -->
      <svelte:component
        size={16}
        style="color: {$colorStore.primary}"
        this={getTypeIcon()}
      />

      <!-- Selected content -->
      <div class="flex-1 min-w-0">
        {#if multiple && selectedArray.length > 0}
          <div class="flex flex-wrap gap-1">
            {#each selectedArray.slice(0, 3) as selectedId}
              {@const option = options.find(opt => opt.id === selectedId)}
              {#if option}
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm max-w-[120px]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                >
                  <span class="truncate">{getOptionDisplayName(option)}</span>
                  <button
                    type="button"
                    class="hover:bg-black/20 rounded p-0.5"
                    on:click={(e) => removeOption(selectedId, e)}
                  >
                    <X size={12} />
                  </button>
                </span>
              {/if}
            {/each}
            {#if selectedArray.length > 3}
              <span
                class="px-2 py-1 rounded-lg text-sm"
                style="background: {$colorStore.primary}20; color: {$colorStore.text};"
              >
                +{selectedArray.length - 3} more
              </span>
            {/if}
          </div>
        {:else}
          <span class="truncate" class:opacity-60={!hasSelection}>
            {getSelectedDisplayText()}
          </span>
        {/if}
      </div>
    </div>

    <!-- Right side controls -->
    <div class="flex items-center gap-2 flex-shrink-0">
      {#if hasSelection && !disabled}
        <button
          type="button"
          class="p-1 hover:bg-black/20 rounded"
          on:click={clearAll}
          title="Clear selection"
        >
          <X size={16} style="color: {$colorStore.muted}" />
        </button>
      {/if}

      <div
        class="transition-transform duration-200"
        class:rotate-180={isOpen}
      >
        <ChevronDown
          size={16}
          style="color: {$colorStore.muted}"
        />
      </div>
    </div>
  </button>

  <!-- Dropdown -->
  {#if isOpen}
    <div
      bind:this={dropdownRef}
      id={dropdownId}
      class="absolute top-full left-0 right-0 mt-1 rounded-lg p-4 flex flex-col space-y-4 shadow-2xl max-h-64 z-50 backdrop-blur-lg border overflow-hidden"
      style="background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.8)), linear-gradient(135deg, {$colorStore.gradientStart}25, {$colorStore.gradientMid}30, {$colorStore.gradientEnd}25);
             border-color: {$colorStore.primary}50;
             box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px {$colorStore.primary}20;"
      role="listbox"
      aria-multiselectable={multiple}
    >
      <!-- Search input -->
      {#if searchable}
        <div class="pb-2 border-b border-opacity-30" style="border-color: {$colorStore.primary};">
          <div class="relative">
            <Search size={16} class="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style="color: {$colorStore.muted}" />
            <input
              bind:this={searchInputRef}
              bind:value={searchTerm}
              type="text"
              placeholder="Search..."
              class="w-full pl-10 pr-3 py-2 rounded-lg border transition-all duration-200"
              style="background: {$colorStore.primary}08; 
                     border-color: {$colorStore.primary}30; 
                     color: {$colorStore.text};"
            />
          </div>
        </div>
      {/if}

      <!-- Options list -->
      <div class="max-h-40 overflow-y-auto -mx-4">
        {#if filteredOptions.length === 0}
          <div class="px-4 py-3 text-center" style="color: {$colorStore.muted}">
            {searchTerm ? 'No matches found' : 'No options available'}
          </div>
        {:else}
          {#each filteredOptions as option, index (option.id)}
            {@const isSelected = multiple
              ? selectedArray.includes(option.id)
              : selected === option.id}
            {@const isFocused = focusedIndex === index}

            <button
              type="button"
              class="ripple-effect w-full px-4 py-3 text-left transition-all duration-200 ease-in-out flex items-center gap-3 hover:bg-opacity-30 border border-transparent"
              class:font-medium={isSelected}
              style="color: {$colorStore.text};
                     background: {isFocused 
                       ? `linear-gradient(135deg, ${$colorStore.primary}25, ${$colorStore.secondary}25)` 
                       : isSelected 
                         ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)` 
                         : 'transparent'};
                     border-color: {isSelected ? $colorStore.primary + '50' : 'transparent'};
                     hover:background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);
                     hover:border-color: {$colorStore.primary}40;"
              on:click={() => selectOption(option.id)}
              role="option"
              aria-selected={isSelected}
            >
              <!-- Option content -->
              <div class="flex items-center gap-3 flex-1">
                <!-- Role color indicator -->
                {#if type === 'role' && option.color}
                  <div
                    class="w-3 h-3 rounded-full flex-shrink-0"
                    style="background-color: {getRoleColorHex(option.color)}"
                  ></div>
                {/if}

                <!-- Option name -->
                <span class="flex-1 truncate">
                  {getOptionDisplayName(option)}
                </span>
              </div>

              <!-- Selection indicator -->
              {#if isSelected}
                <div
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  style="background: {$colorStore.primary}"
                ></div>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
    /* Ripple effect styles */
    .ripple-effect {
        position: relative;
        overflow: hidden;
    }

    .ripple-effect::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: width 0.4s ease-out, height 0.4s ease-out, opacity 0.4s ease-out;
        opacity: 0;
        pointer-events: none;
        z-index: 1;
    }

    .ripple-effect:hover::before {
        width: 100%;
        height: 100%;
        opacity: 1;
        animation: ripple-pulse 0.4s ease-out;
    }

    @keyframes ripple-pulse {
        0% {
            width: 0;
            height: 0;
            opacity: 0.6;
        }
        50% {
            opacity: 0.3;
        }
        100% {
            width: 100%;
            height: 100%;
            opacity: 0;
        }
    }

    /* Ensure text stays on top */
    .ripple-effect > * {
        position: relative;
        z-index: 2;
    }
</style>