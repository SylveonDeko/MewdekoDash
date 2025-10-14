<script module lang="ts">
  export type SelectorType = "role" | "channel" | "user" | "timezone" | "custom";
  export type OptionType = {
    id: string;
    name: string;
    color?: number;
    type?: number;
    offset?: string;
    label?: string;
    value?: string;
    icon?: string; // For custom types
    emoji?: string; // For custom types with emoji
  };
</script>

<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { fly, scale } from "svelte/transition";

  interface Props {
    // Props
    type: SelectorType;
    options?: OptionType[];
    selected?: string | string[] | null;
    multiple?: boolean;
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    customIcon?: any; // Custom icon component for custom type
    onchange?: (detail: { selected: string | string[] | null }) => void;
  }

  let {
    type,
    options = [],
    selected = $bindable(null),
    multiple = false,
    placeholder = "Select...",
    searchable = true,
    disabled = false,
    customIcon = null,
    onchange
  }: Props = $props();

  // Internal state
  let isOpen = $state(false);
  let searchTerm = $state("");
  let dropdownRef: HTMLDivElement = $state();
  let searchInputRef: HTMLInputElement = $state();
  let containerRef: HTMLDivElement = $state();
  let focusedIndex = $state(-1);
  let dropdownId = `dropdown-${Math.random().toString(36).substring(2, 9)}`;
  let buttonMousePositions = $state<{ [key: string]: { x: number, y: number } }>({});

  function handleButtonMouseMove(e: MouseEvent, buttonId: string) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    buttonMousePositions[buttonId] = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handleButtonMouseLeave(buttonId: string) {
    delete buttonMousePositions[buttonId];
  }




  // Get appropriate icon for selector type
  function getTypeIcon() {
    switch (type) {
      case "channel":
        return "fa-hashtag";
      case "role":
        return "fa-crown";
      case "user":
        return "fa-users";
      case "timezone":
        return "fa-location-dot";
      case "custom":
        return customIcon || "fa-hashtag";
      default:
        return "fa-hashtag";
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
      case "custom":
        return option.label || option.name;
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

    onchange?.({ selected });
  }

  // Remove selected option (for multiple mode)
  function removeOption(optionId: string, event: Event) {
    event.stopPropagation();
    if (multiple && Array.isArray(selected)) {
      selected = selected.filter(id => id !== optionId);
      onchange?.({ selected });
    }
  }

  // Dropdown control
  function toggleDropdown() {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen) {
      focusedIndex = -1;
      searchTerm = "";

      setTimeout(() => {
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
  function handleClickOutside(event: MouseEvent) {
    if (!isOpen) return;

    const target = event.target as Node;

    // Check if click is outside container (dropdown is inside container now)
    if (containerRef && !containerRef.contains(target)) {
      closeDropdown();
    }
  }

  // Setup click outside listener
  $effect(() => {
    if (isOpen) {
      // Small delay to prevent immediate close on open
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {
    };
  });

  // Clear all selections
  function clearAll(event: Event) {
    event.stopPropagation();
    selected = multiple ? [] : null;
    onchange?.({ selected });
  }
  // Computed values
  let filteredOptions = $derived(searchable && searchTerm
    ? options.filter(option => {
      const searchText = getOptionDisplayName(option).toLowerCase();
      return searchText.includes(searchTerm.toLowerCase());
    })
    : options);
  let selectedArray = $derived(multiple
    ? (Array.isArray(selected) ? selected : selected ? [selected] : [])
    : []);
  let hasSelection = $derived(multiple
    ? selectedArray.length > 0
    : selected !== null && selected !== undefined);
  // Get selected option names for display (reactive)
  let selectedDisplayText = $derived((() => {
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
  })());
  // Get selected option for icon display (reactive)
  let selectedOption = $derived((() => {
    if (!hasSelection || multiple) return null;
    return options.find(opt => opt.id === selected) || null;
  })());
</script>

<div
  aria-controls={dropdownId}
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  bind:this={containerRef}
  class="relative"
  onkeydown={handleKeydown}
  role="combobox"
  tabindex={disabled ? -1 : 0}
>
  <!-- Main selector button -->
  <button aria-label="Button action"
          class="group w-full p-2.5 rounded-xl border transition-all duration-200 text-left flex items-center backdrop-blur-md relative overflow-hidden"
          onmouseleave={() => handleButtonMouseLeave('selector-main')}
          onmousemove={(e) => handleButtonMouseMove(e, 'selector-main')}
    class:cursor-not-allowed={disabled}
    class:opacity-50={disabled}
    {disabled}
    onclick={toggleDropdown}
    style="background: {$colorStore.primary}08;
           border-color: {isOpen ? $colorStore.primary : $colorStore.primary + '30'};
           color: {$colorStore.text};
           min-height: 50px;"
    type="button"
  >
    <!-- Mouse spotlight -->
    {#if buttonMousePositions['selector-main']}
      <div
        class="pointer-events-none absolute w-32 h-32 rounded-full opacity-30 transition-all duration-100 ease-out"
        style="background: radial-gradient(circle at center, {$colorStore.primary}60, transparent 70%);
               left: {buttonMousePositions['selector-main'].x}px;
               top: {buttonMousePositions['selector-main'].y}px;
               transform: translate(-50%, -50%);
               filter: blur(20px);"
      ></div>
    {/if}

    <!-- Hover gradient overlay -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
         style="background: {$colorStore.primary}12;"></div>

    <div class="flex items-center gap-3 flex-1 min-w-0 overflow-hidden relative z-10">
      <!-- Type icon or selected emoji -->
      {#if type === 'custom' && selectedOption?.emoji}
        <span class="text-lg shrink-0">{selectedOption.emoji}</span>
      {:else}
        {@const iconValue = getTypeIcon()}
          <i class="fa-utility-duo fa-regular {iconValue}" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
      {/if}

      <!-- Selected content -->
      <div class="flex-1 min-w-0 pr-2 flex items-center h-[28px]">
        {#if multiple && selectedArray.length > 0}
          <div class="flex flex-nowrap gap-1 overflow-x-auto scrollbar-hide w-full">
            {#each selectedArray.slice(0, 3) as selectedId}
              {@const option = options.find(opt => opt.id === selectedId)}
              {#if option}
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-sm max-w-[120px] flex-shrink-0"
                  style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                >
                  <span class="truncate">{getOptionDisplayName(option)}</span>
                  <span
                    class="hover:bg-black/20 rounded-sm p-0.5 cursor-pointer"
                    onclick={(e) => removeOption(selectedId, e)}
                    onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); removeOption(selectedId, e); } }}
                    role="button"
                    tabindex="0"
                    aria-label="Remove {getOptionDisplayName(option)}"
                  >
                    <i class="fa-solid fa-xmark" style="font-size: 12px;"></i>
                  </span>
                </span>
              {/if}
            {/each}
            {#if selectedArray.length > 3}
              <span
                class="px-2 py-0.5 rounded-lg text-sm flex-shrink-0"
                style="background: {$colorStore.primary}20; color: {$colorStore.text};"
              >
                +{selectedArray.length - 3}
              </span>
            {/if}
          </div>
        {:else}
          <span class="truncate flex items-center h-full" class:opacity-60={!hasSelection}>
            {selectedDisplayText}
          </span>
        {/if}
      </div>
    </div>

    <!-- Right side controls -->
    <div class="flex items-center gap-1 shrink-0 ml-2 relative z-10">
      {#if hasSelection && !disabled}
        <span
          class="p-1 hover:bg-black/20 rounded-sm shrink-0 cursor-pointer"
          onclick={clearAll}
          onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clearAll(e); } }}
          role="button"
          tabindex="0"
          aria-label="Clear selection"
        >
          <i class="fa-solid fa-xmark" style="color: {$colorStore.muted}; font-size: 14px;"></i>
        </span>
      {/if}

      <div
              class="transition-transform duration-200 shrink-0"
        class:rotate-180={isOpen}
      >
        <i class="fa-solid fa-chevron-down" style="color: {$colorStore.muted}; font-size: 14px;"></i>
      </div>
    </div>
  </button>

  <!-- Dropdown -->
  {#if isOpen}
    <div
      bind:this={dropdownRef}
      id={dropdownId}
      class="absolute left-0 right-0 mt-1 rounded-lg flex flex-col shadow-2xl border backdrop-blur-md z-[9999] overflow-hidden"
      style="background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.8)), linear-gradient(135deg, {$colorStore.gradientStart}25, {$colorStore.gradientMid}30, {$colorStore.gradientEnd}25);
             border-color: {$colorStore.primary}50;
             box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px {$colorStore.primary}20;
             max-height: min(16rem, 60vh);
             transform-origin: top;"
      role="listbox"
      aria-multiselectable={multiple}
      transition:fly={{ y: -8, duration: 200 }}
    >
      <!-- Search input -->
      {#if searchable}
        <div class="p-4 pb-2 border-b border-opacity-30" style="border-color: {$colorStore.primary};">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2"
               style="color: {$colorStore.muted}; font-size: 16px;"></i>
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
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
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
              onmousemove={(e) => handleButtonMouseMove(e, `option-${option.id}`)}
              onmouseleave={() => handleButtonMouseLeave(`option-${option.id}`)}
              class="option-item w-full px-4 py-3 text-left transition-all duration-200 ease-in-out flex items-center gap-3 border border-transparent rounded-md relative group"
              class:font-medium={isSelected}
              style="color: {$colorStore.text};
                     background: {isFocused
                       ? `linear-gradient(135deg, ${$colorStore.primary}25, ${$colorStore.secondary}25)`
                       : isSelected
                         ? `linear-gradient(135deg, ${$colorStore.primary}40, ${$colorStore.secondary}40)`
                         : 'transparent'};
                     border-color: {isSelected ? $colorStore.primary + '50' : 'transparent'};"
              onclick={() => selectOption(option.id)}
              role="option"
              aria-selected={isSelected}
            >
              <!-- Mouse spotlight -->
              {#if buttonMousePositions[`option-${option.id}`]}
                <div
                  class="pointer-events-none absolute w-24 h-24 rounded-full opacity-25 transition-all duration-100 ease-out"
                  style="background: radial-gradient(circle at center, {$colorStore.primary}50, transparent 70%);
                         left: {buttonMousePositions[`option-${option.id}`].x}px;
                         top: {buttonMousePositions[`option-${option.id}`].y}px;
                         transform: translate(-50%, -50%);
                         filter: blur(15px);"
                ></div>
              {/if}

              <!-- Hover gradient overlay -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style="background: {$colorStore.primary}12;"></div>

              <!-- Option content -->
              <div class="flex items-center gap-3 flex-1 relative z-10">
                <!-- Role color indicator -->
                {#if type === 'role' && option.color}
                  <div
                          class="w-3 h-3 rounded-full shrink-0"
                    style="background-color: {getRoleColorHex(option.color)}"
                  ></div>
                {/if}

                <!-- Custom emoji indicator -->
                {#if type === 'custom' && option.emoji}
                  <span class="text-lg shrink-0">{option.emoji}</span>
                {/if}

                <!-- Option name -->
                <span class="flex-1 truncate">
                  {getOptionDisplayName(option)}
                </span>
              </div>

              <!-- Selection indicator -->
              {#if isSelected}
                <div
                  class="w-2 h-2 rounded-full shrink-0 relative z-10"
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
    /* Hide scrollbar but keep functionality */
    .scrollbar-hide {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }

    /* Discord-style option hover effect */
    .option-item {
        position: relative;
    }

    /* Subtle highlight bar on the left like Discord */
    .option-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 3px;
        height: 0;
        background: currentColor;
        transform: translateY(-50%);
        transition: height 0.15s ease-out;
        border-radius: 0 3px 3px 0;
        opacity: 0;
    }

    .option-item:hover::before {
        height: 70%;
        opacity: 0.8;
    }

    /* Smooth focus outline */
    .option-item:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: -2px;
    }
</style>