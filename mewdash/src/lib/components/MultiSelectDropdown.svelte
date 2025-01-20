!-- lib/MultiSelectDropdown.svelte -->
<script lang="ts">
  export let options: { id: string; name: string }[];
  export let selected: string[];
  export let placeholder: string;

  let isOpen = false;
  let searchTerm = "";
  let dropdownRef: HTMLDivElement;
  let searchInputRef: HTMLInputElement;
  let dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;

  $: filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function toggleOption(optionId: string) {
    const index = selected.indexOf(optionId);
    if (index === -1) {
      selected = [...selected, optionId];
    } else {
      selected = selected.filter((id) => id !== optionId);
    }
  }

  function closeDropdown(event: Event) {
    const target = event.target as Element | null;
    if (target && !dropdownRef.contains(target)) {
      isOpen = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      isOpen = false;
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        isOpen = true;
        return;
      }
      const options = Array.from(
        dropdownRef.querySelectorAll('[role="option"]'),
      );
      const currentIndex = options.findIndex(
        (option) => option === document.activeElement,
      );
      let nextIndex;
      if (event.key === "ArrowDown") {
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      }
      (options[nextIndex] as HTMLElement).focus();
    }
  }

  function handleOptionKeydown(event: KeyboardEvent, optionId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleOption(optionId);
    }
  }

  $: if (isOpen && searchInputRef) {
    setTimeout(() => searchInputRef.focus(), 0);
  }
</script>

<div
  class="dropdown relative"
  bind:this={dropdownRef}
  on:keydown={handleKeydown}
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls={dropdownId}
  tabindex="0"
>
  <button
    type="button"
    class="bg-gray-700 text-white p-2 rounded cursor-pointer w-full text-left"
    on:click={() => (isOpen = !isOpen)}
    aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
  >
    {selected.length ? selected.length + " selected" : placeholder}
  </button>

  {#if isOpen}
    <div
      id={dropdownId}
      class="absolute top-full left-0 w-full bg-gray-800 rounded mt-1 max-h-60 overflow-y-auto"
      role="listbox"
      aria-label="Select roles"
    >
      <div class="sticky top-0 bg-gray-800 p-2">
        <input
          bind:this={searchInputRef}
          class="w-full bg-gray-700 text-white p-2"
          placeholder="Search roles..."
          bind:value={searchTerm}
          aria-label="Search roles"
        />
      </div>
      {#each filteredOptions as option (option.id)}
        <div
          role="option"
          aria-selected={selected.includes(option.id)}
          tabindex="-1"
          class="p-2 hover:bg-gray-700 cursor-pointer"
          class:bg-blue-600={selected.includes(option.id)}
          on:click={() => toggleOption(option.id)}
          on:keydown={(event) => handleOptionKeydown(event, option.id)}
        >
          {option.name}
        </div>
      {/each}
    </div>
  {/if}
</div>

<svelte:window on:click={closeDropdown} />
