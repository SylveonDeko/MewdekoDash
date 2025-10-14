<!-- ComponentEditor.svelte -->
<script lang="ts">
    import {colorStore} from "$lib/stores/colorStore";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";


    interface Props {
    // Props
    component: any;
    triggers?: any[];
    isEditing?: boolean;
      onupdate?: (detail: { component: any }) => void;
      onremove?: (detail: { componentKey: string }) => void;
      onedit?: (detail: { component: any }) => void;
      onselectTrigger?: (detail: { component: any; optionIndex?: number }) => void;
  }

    let {
      component = $bindable(),
      triggers = [],
      isEditing = false,
      onupdate,
      onremove,
      onedit,
      onselectTrigger
    }: Props = $props();

  // Button style options
  const buttonStyles = [
    { id: "1", name: "Primary", icon: "🟦" },
    { id: "2", name: "Secondary", icon: "⬜" },
    { id: "3", name: "Success", icon: "🟩" },
    { id: "4", name: "Danger", icon: "🟥" },
    { id: "5", name: "Link", icon: "🔗" }
  ];

  // Helper functions
  function updateComponent(field: string, value: any) {
    const updatedComponent = { ...component };

    // Handle nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!updatedComponent[parent]) updatedComponent[parent] = {};
      updatedComponent[parent][child] = value;
    } else {
      updatedComponent[field] = value;
    }

    component = updatedComponent;
    onupdate?.({ component: updatedComponent });
  }

    // Input handler with type guard
    function handleInput(event: Event, field: string) {
      const target = event.target;
      if (target && ("value" in target)) {
        updateComponent(field, target.value);
      }
    }

    // Number input handler
    function handleNumberInput(event: Event, field: string, fallback: string = "1") {
      const target = event.target;
      if (target && ("value" in target)) {
        updateComponent(field, parseInt((target.value as string) || fallback));
      }
    }

    // Option input handler
    function handleOptionInput(event: Event, index: number, field: string) {
      const target = event.target;
      if (target && ("value" in target)) {
        updateOption(index, field, target.value);
      }
  }

  function addOption() {
    if (!component.options) component.options = [];

    const newOption = {
      id: null,
      name: `Option ${component.options.length + 1}`,
      emoji: "",
      description: ""
    };

    const updatedComponent = { ...component };
    updatedComponent.options = [...updatedComponent.options, newOption];

    component = updatedComponent;
    onupdate?.({ component: updatedComponent });
  }

  function removeOption(index: number) {
    const updatedComponent = { ...component };
    updatedComponent.options = updatedComponent.options.filter((_: any, i: number) => i !== index);

    component = updatedComponent;
    onupdate?.({ component: updatedComponent });
  }

  function updateOption(index: number, field: string, value: any) {
    const updatedComponent = { ...component };
    if (!updatedComponent.options[index]) return;

    updatedComponent.options[index][field] = value;
    component = updatedComponent;
    onupdate?.({ component: updatedComponent });
  }

  function getButtonColorClass(style: number): string {
    switch (style) {
      case 1: return 'bg-[#5865F2] hover:bg-[#4752C4] text-white'; // Primary
      case 2: return 'bg-[#4F545C] hover:bg-[#5D6269] text-white'; // Secondary
      case 3: return 'bg-[#3BA55D] hover:bg-[#2D7D32] text-white'; // Success
      case 4: return 'bg-[#ED4245] hover:bg-[#C62828] text-white'; // Danger
      case 5: return 'bg-transparent hover:bg-[#5865F2]/10 text-[#00AFF4] border-0'; // Link
      default: return 'bg-[#5865F2] hover:bg-[#4752C4] text-white';
    }
  }

  function getSelectedTrigger(triggerId: string | null) {
    if (!triggerId) return null;
    return triggers.find(t => t.id.toString() === triggerId);
  }

  function isValidUrl(url: string): boolean {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validation
  let isButtonValid = $derived(component.isSelect || 
    (component.style === 5 ? isValidUrl(component.url) : component.id !== null));
  
  let isSelectValid = $derived(!component.isSelect || 
    (component.options && component.options.every((opt: any) => opt.id && opt.description?.trim())));

  let isValid = $derived(isButtonValid && isSelectValid);
</script>

{#if isEditing}
  <!-- Edit Mode -->
  <div class="space-y-6 p-6 border rounded-xl" 
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
              border-color: {$colorStore.primary}30;">
    
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">
        Edit {component.isSelect ? 'Select Menu' : 'Button'}
      </h3>
      
      <div class="flex items-center gap-2">
        <!-- Validation Status -->
        <div class="w-3 h-3 rounded-full" 
             style="background: {isValid ? '#57F287' : '#ED4245'};"
             title="{isValid ? 'Valid' : 'Has validation errors'}">
        </div>
      </div>
    </div>

    {#if !component.isSelect}
      <!-- Button Fields -->
      <div class="space-y-4">
        <!-- Display Name -->
        <div>
          <label for="input-6378" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Display Name
            <span class="text-xs ml-2" style="color: {$colorStore.muted};">
              {component.displayName?.length || 0}/80
            </span>
          </label>
          <input id="input-6378"
            type="text"
            class="w-full px-3 py-2 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Button text"
            value={component.displayName || ''}
            maxlength="80"
                 oninput={(e) => handleInput(e, 'displayName')}
          >
        </div>

        <!-- Style -->
        <div>
          <span id="button-style-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Button Style
          </span>
          <DiscordSelector
            type="custom"
            options={buttonStyles}
            selected={component.style?.toString()}
            placeholder="Select button style"
            searchable={false}
            onchange={(detail) => {
              if (detail.selected && typeof detail.selected === 'string') {
                updateComponent('style', parseInt(detail.selected));
              }
            }}
          />
        </div>

        <!-- Emoji -->
        <div>
          <label for="input-8959" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Emoji (optional)
          </label>
          <input id="input-8959"
            type="text"
            class="w-full px-3 py-2 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="😀"
            value={component.emoji || ''}
                 oninput={(e) => handleInput(e, 'emoji')}
          >
        </div>

        {#if component.style === 5}
          <!-- URL for Link Button -->
          <div>
            <label for="input-4138" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              URL
            </label>
            <input id="input-4138"
              type="url"
              class="w-full px-3 py-2 rounded-lg border"
                   style="background: {$colorStore.primary}10;
                     border-color: {isValidUrl(component.url) ? $colorStore.primary + '30' : '#ED4245'};
                     color: {$colorStore.text};"
              placeholder="https://example.com"
              value={component.url || ''}
                   oninput={(e) => handleInput(e, 'url')}
            >
            {#if component.url && !isValidUrl(component.url)}
              <p class="text-xs mt-1 text-red-400">Please enter a valid URL</p>
            {/if}
          </div>
        {:else}
          <!-- Trigger Selection -->
          <div>
            <label for="input-9302" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              Trigger Action
            </label>
            
            {#if component.id}
              {@const selectedTrigger = getSelectedTrigger(component.id)}
              <div class="p-3 rounded-lg border" 
                   style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="font-medium text-sm" style="color: {$colorStore.text};">
                      {selectedTrigger?.trigger || 'Unknown Trigger'}
                    </div>
                    <div class="text-xs truncate" style="color: {$colorStore.muted};">
                      {selectedTrigger?.response || 'No response'}
                    </div>
                  </div>
                  <button aria-label="Change trigger"
                          class="ml-2 p-1 rounded-sm hover:bg-black/10"
                          onclick={() => onselectTrigger?.({ component })}
                    title="Change trigger"
                  >
                    <i class="fa-solid fa-pen" style="font-size: 14px;"></i>
                  </button>
                </div>
              </div>
            {:else}
              <button
                class="w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-dashed"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.primary};"
                onclick={() => onselectTrigger?.({ component })}
              >
                <i class="fa-solid fa-bolt inline mr-2" style="font-size: 16px;"></i>
                Select Trigger
              </button>
            {/if}
          </div>
        {/if}
      </div>

    {:else}
      <!-- Select Menu Fields -->
      <div class="space-y-4">
        <!-- Placeholder Text -->
        <div>
          <label for="input-9302" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Placeholder Text
            <span class="text-xs ml-2" style="color: {$colorStore.muted};">
              {component.displayName?.length || 0}/150
            </span>
          </label>
          <input id="input-9302"
            type="text"
            class="w-full px-3 py-2 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Choose an option..."
            value={component.displayName || ''}
            maxlength="150"
                 oninput={(e) => handleInput(e, 'displayName')}
          >
        </div>

        <!-- Min/Max Options -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="input-1535" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              Min Options
            </label>
            <input id="input-1535"
              type="number"
              min="1"
              max="25"
              class="w-full px-3 py-2 rounded-lg border"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              value={component.minOptions || 1}
                   oninput={(e) => handleNumberInput(e, 'minOptions', '1')}
            >
          </div>
          
          <div>
            <label for="input-2620" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              Max Options
            </label>
            <input id="input-2620"
              type="number"
              min="1"
              max="25"
              class="w-full px-3 py-2 rounded-lg border"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              value={component.maxOptions || 1}
                   oninput={(e) => handleNumberInput(e, 'maxOptions', '1')}
            >
          </div>
        </div>

        <!-- Options -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <label for="input-9558" class="text-sm font-medium" style="color: {$colorStore.text};">
              Options ({component.options?.length || 0}/25)
            </label>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
              style="background: {$colorStore.primary}; color: {$colorStore.text};"
              disabled={(component.options?.length || 0) >= 25}
              onclick={addOption}
            >
              <i class="fa-solid fa-plus" style="font-size: 14px;"></i>
              Add Option
            </button>
          </div>

          <div class="space-y-3">
            {#each (component.options || []) as option, index}
              <div class="p-4 border rounded-lg" 
                   style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                
                <div class="flex justify-between items-center mb-3">
                  <span class="text-sm font-medium" style="color: {$colorStore.text};">
                    Option {index + 1}
                  </span>
                  <button aria-label="Remove option"
                          class="p-1 rounded-sm text-red-400 hover:bg-red-400/10 transition-colors"
                    onclick={() => removeOption(index)}
                    title="Remove option"
                  >
                    <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
                  </button>
                </div>

                <div class="space-y-3">
                  <!-- Option Name -->
                  <div>
                    <label for="input-9558" class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                      Name
                      <span class="ml-2" style="color: {$colorStore.muted};">
                        {option.name?.length || 0}/100
                      </span>
                    </label>
                    <input id="input-9558"
                      type="text"
                      class="w-full px-3 py-2 rounded-sm border text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Option name"
                      value={option.name || ''}
                      maxlength="100"
                           oninput={(e) => handleOptionInput(e, index, 'name')}
                    >
                  </div>

                  <!-- Option Description -->
                  <div>
                    <label for="input-9067" class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                      Description
                      <span class="ml-2" style="color: {$colorStore.muted};">
                        {option.description?.length || 0}/100
                      </span>
                    </label>
                    <input id="input-9067"
                      type="text"
                      class="w-full px-3 py-2 rounded-sm border text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Option description"
                      value={option.description || ''}
                      maxlength="100"
                           oninput={(e) => handleOptionInput(e, index, 'description')}
                    >
                  </div>

                  <!-- Option Emoji -->
                  <div>
                    <label for="input-8959" class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                      Emoji (optional)
                    </label>
                    <input id="input-8959"
                      type="text"
                      class="w-full px-3 py-2 rounded-sm border text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="😀"
                      value={option.emoji || ''}
                           oninput={(e) => handleOptionInput(e, index, 'emoji')}
                    >
                  </div>

                  <!-- Option Trigger -->
                  <div>
                    <label for="option-id" class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                      Trigger Action
                    </label>
                    
                    {#if option.id}
                      {@const selectedTrigger = getSelectedTrigger(option.id)}
                        <div class="p-2 rounded-sm border text-sm"
                           style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;">
                        <div class="flex justify-between items-start">
                          <div class="flex-1">
                            <div class="font-medium" style="color: {$colorStore.text};">
                              {selectedTrigger?.trigger || 'Unknown Trigger'}
                            </div>
                            <div class="text-xs truncate" style="color: {$colorStore.muted};">
                              {selectedTrigger?.response || 'No response'}
                            </div>
                          </div>
                          <button aria-label="Change trigger"
                                  class="ml-1 p-1 rounded-sm hover:bg-black/10"
                                  onclick={() => onselectTrigger?.({ component, optionIndex: index })}
                            title="Change trigger"
                          >
                            <i class="fa-solid fa-pen" style="font-size: 12px;"></i>
                          </button>
                        </div>
                      </div>
                    {:else}
                      <button
                              class="w-full px-3 py-2 rounded-sm border border-dashed text-sm transition-all duration-200"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.primary};"
                              onclick={() => onselectTrigger?.({ component, optionIndex: index })}
                      >
                        <i class="fa-solid fa-bolt inline mr-1" style="font-size: 14px;"></i>
                        Select Trigger
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>

          {#if !component.options || component.options.length === 0}
            <div class="text-center py-8">
              <p class="text-sm" style="color: {$colorStore.muted};">
                No options added yet. Click "Add Option" to get started.
              </p>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Validation Messages -->
    {#if !isValid}
      <div class="p-3 rounded-lg border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20">
        <div class="text-sm text-red-700 dark:text-red-300">
          <p class="font-medium mb-1">Validation Errors:</p>
          <ul class="list-disc list-inside space-y-1">
            {#if !component.isSelect && component.style !== 5 && !component.id}
              <li>Please select a trigger for this button</li>
            {/if}
            {#if component.style === 5 && !isValidUrl(component.url)}
              <li>Please enter a valid URL for link button</li>
            {/if}
            {#if component.isSelect && component.options}
              {#each component.options as option, index}
                {#if !option.id}
                  <li>Option "{option.name || (index + 1)}" needs a trigger</li>
                {/if}
                {#if !option.description?.trim()}
                  <li>Option "{option.name || (index + 1)}" needs a description</li>
                {/if}
              {/each}
            {/if}
          </ul>
        </div>
      </div>
    {/if}
  </div>

{:else}
  <!-- Display Mode -->
  <div class="group relative">
    <!-- Component Preview -->
    {#if component.isSelect}
      <!-- Select Menu Preview -->
      <div class="w-full">
        <button aria-label="Toggle"
                class="border border-transparent bg-[#2F3136] text-white font-medium rounded-sm cursor-pointer box-border grid grid-cols-[1fr_auto] items-center w-full text-left"
          disabled
        >
          <span class="placeholder px-3 py-2">
            {component.displayName || "Select an option..."}
          </span>
          <span class="icon-container px-2">
            <i class="fa-solid fa-chevron-down" style="font-size: 18px;"></i>
          </span>
        </button>
      </div>
    {:else}
      <!-- Button Preview -->
      <button
        class="{getButtonColorClass(component.style)} relative discord-button button-content flex justify-center grow-0 items-center box-border border-0 rounded-sm px-4 py-[2px] min-h-[32px] text-sm font-medium leading-[16px] transition-colors duration-200 select-none gap-2"
        disabled
        aria-label={component.displayName}
      >
        {#if component.emoji}
          <span class="emoji w-[1.2em] h-[1.2em] inline-flex items-center justify-center align-[-0.1em]">
            {component.emoji}
          </span>
        {/if}
        <span class="truncate">{component.displayName}</span>
        {#if component.style === 5}
          <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 12px;"></i>
        {/if}
      </button>
    {/if}

    <!-- Actions Overlay -->
    <div class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
      <button
        class="p-1.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-[1.02]"
        style="background: {$colorStore.primary}; color: {$colorStore.text};"
        onclick={() => onedit?.({ component })}
        title="Edit component"
        aria-label="Edit component"
      >
        <i class="fa-solid fa-pen" style="font-size: 12px;"></i>
      </button>

      <button
        class="p-1.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-[1.02]"
        style="background: #ED4245; color: white;"
        onclick={() => onremove?.({ componentKey: component.componentKey })}
        title="Remove component"
        aria-label="Remove component"
      >
        <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
      </button>
    </div>

    <!-- Validation Indicator -->
    {#if !isValid}
      <div class="absolute -top-1 -left-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white"
           title="Has validation errors">
      </div>
    {/if}
  </div>
{/if}

<style>
  .discord-button {
    transition: transform 0.1s ease;
  }
  
  .discord-button:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  
  .group:hover .opacity-0 {
    opacity: 1;
  }
</style>