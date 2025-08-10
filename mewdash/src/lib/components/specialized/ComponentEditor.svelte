<!-- ComponentEditor.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { 
    Plus, 
    Trash2, 
    Edit, 
    Copy,
    Square,
    ChevronDown,
    ExternalLink,
    Zap
  } from "lucide-svelte";

  // Props
  export let component: any;
  export let triggers: any[] = [];
  export let isEditing: boolean = false;

  // Events
  const dispatch = createEventDispatcher<{
    update: { component: any };
    remove: { componentKey: string };
    edit: { component: any };
    selectTrigger: { component: any; optionIndex?: number };
  }>();

  // Button style options
  const buttonStyles = [
    { id: "1", name: "Primary", icon: "🟦" },
    { id: "2", name: "Secondary", icon: "⬜" },
    { id: "3", name: "Success", icon: "🟩" },
    { id: "4", name: "Danger", icon: "🟥" },
    { id: "5", name: "Link", icon: "🔗" }
  ];

  // Helper functions
  function generateUniqueId() {
    return "select-" + Math.random().toString(36).substr(2, 9);
  }

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
    dispatch('update', { component: updatedComponent });
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
    dispatch('update', { component: updatedComponent });
  }

  function removeOption(index: number) {
    const updatedComponent = { ...component };
    updatedComponent.options = updatedComponent.options.filter((_: any, i: number) => i !== index);
    
    component = updatedComponent;
    dispatch('update', { component: updatedComponent });
  }

  function updateOption(index: number, field: string, value: any) {
    const updatedComponent = { ...component };
    if (!updatedComponent.options[index]) return;
    
    updatedComponent.options[index][field] = value;
    component = updatedComponent;
    dispatch('update', { component: updatedComponent });
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
  $: isButtonValid = component.isSelect || 
    (component.style === 5 ? isValidUrl(component.url) : component.id !== null);
  
  $: isSelectValid = !component.isSelect || 
    (component.options && component.options.every((opt: any) => opt.id && opt.description?.trim()));

  $: isValid = isButtonValid && isSelectValid;
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
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Display Name
            <span class="text-xs ml-2" style="color: {$colorStore.muted};">
              {component.displayName?.length || 0}/80
            </span>
          </label>
          <input
            type="text"
            class="w-full px-3 py-2 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Button text"
            value={component.displayName || ''}
            maxlength="80"
            on:input={(e) => updateComponent('displayName', e.target?.value)}
          />
        </div>

        <!-- Style -->
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Button Style
          </label>
          <DiscordSelector
            type="custom"
            options={buttonStyles}
            selected={component.style?.toString()}
            placeholder="Select button style"
            searchable={false}
            on:change={(e) => updateComponent('style', parseInt(e.detail.selected))}
          />
        </div>

        <!-- Emoji -->
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Emoji (optional)
          </label>
          <input
            type="text"
            class="w-full px-3 py-2 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="😀"
            value={component.emoji || ''}
            on:input={(e) => updateComponent('emoji', e.target?.value)}
          />
        </div>

        {#if component.style === 5}
          <!-- URL for Link Button -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              URL
            </label>
            <input
              type="url"
              class="w-full px-3 py-2 rounded-lg border"
              style="background: {$colorStore.primary}10; 
                     border-color: {isValidUrl(component.url) ? $colorStore.primary + '30' : '#ED4245'}; 
                     color: {$colorStore.text};"
              placeholder="https://example.com"
              value={component.url || ''}
              on:input={(e) => updateComponent('url', e.target?.value)}
            />
            {#if component.url && !isValidUrl(component.url)}
              <p class="text-xs mt-1 text-red-400">Please enter a valid URL</p>
            {/if}
          </div>
        {:else}
          <!-- Trigger Selection -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
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
                  <button
                    class="ml-2 p-1 rounded hover:bg-black/10"
                    on:click={() => dispatch('selectTrigger', { component })}
                    title="Change trigger"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            {:else}
              <button
                class="w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-dashed"
                style="border-color: {$colorStore.primary}30; color: {$colorStore.primary};"
                on:click={() => dispatch('selectTrigger', { component })}
              >
                <Zap size={16} class="inline mr-2" />
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
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Placeholder Text
            <span class="text-xs ml-2" style="color: {$colorStore.muted};">
              {component.displayName?.length || 0}/150
            </span>
          </label>
          <input
            type="text"
            class="w-full px-3 py-2 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Choose an option..."
            value={component.displayName || ''}
            maxlength="150"
            on:input={(e) => updateComponent('displayName', e.target?.value)}
          />
        </div>

        <!-- Min/Max Options -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              Min Options
            </label>
            <input
              type="number"
              min="1"
              max="25"
              class="w-full px-3 py-2 rounded-lg border"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              value={component.minOptions || 1}
              on:input={(e) => updateComponent('minOptions', parseInt(e.target?.value || '1'))}
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              Max Options
            </label>
            <input
              type="number"
              min="1"
              max="25"
              class="w-full px-3 py-2 rounded-lg border"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              value={component.maxOptions || 1}
              on:input={(e) => updateComponent('maxOptions', parseInt(e.target?.value || '1'))}
            />
          </div>
        </div>

        <!-- Options -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <label class="text-sm font-medium" style="color: {$colorStore.text};">
              Options ({component.options?.length || 0}/25)
            </label>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
              style="background: {$colorStore.primary}; color: {$colorStore.text};"
              disabled={(component.options?.length || 0) >= 25}
              on:click={addOption}
            >
              <Plus size={14} />
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
                  <button
                    class="p-1 rounded text-red-400 hover:bg-red-400/10 transition-colors"
                    on:click={() => removeOption(index)}
                    title="Remove option"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div class="space-y-3">
                  <!-- Option Name -->
                  <div>
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                      Name
                      <span class="ml-2" style="color: {$colorStore.muted};">
                        {option.name?.length || 0}/100
                      </span>
                    </label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 rounded border text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Option name"
                      value={option.name || ''}
                      maxlength="100"
                      on:input={(e) => updateOption(index, 'name', e.target?.value)}
                    />
                  </div>

                  <!-- Option Description -->
                  <div>
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                      Description
                      <span class="ml-2" style="color: {$colorStore.muted};">
                        {option.description?.length || 0}/100
                      </span>
                    </label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 rounded border text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Option description"
                      value={option.description || ''}
                      maxlength="100"
                      on:input={(e) => updateOption(index, 'description', e.target?.value)}
                    />
                  </div>

                  <!-- Option Emoji -->
                  <div>
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                      Emoji (optional)
                    </label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 rounded border text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="😀"
                      value={option.emoji || ''}
                      on:input={(e) => updateOption(index, 'emoji', e.target?.value)}
                    />
                  </div>

                  <!-- Option Trigger -->
                  <div>
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                      Trigger Action
                    </label>
                    
                    {#if option.id}
                      {@const selectedTrigger = getSelectedTrigger(option.id)}
                      <div class="p-2 rounded border text-sm" 
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
                          <button
                            class="ml-1 p-1 rounded hover:bg-black/10"
                            on:click={() => dispatch('selectTrigger', { component, optionIndex: index })}
                            title="Change trigger"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      </div>
                    {:else}
                      <button
                        class="w-full px-3 py-2 rounded border border-dashed text-sm transition-all duration-200"
                        style="border-color: {$colorStore.primary}30; color: {$colorStore.primary};"
                        on:click={() => dispatch('selectTrigger', { component, optionIndex: index })}
                      >
                        <Zap size={14} class="inline mr-1" />
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
        <button
          class="border border-transparent bg-[#2F3136] text-white font-medium rounded cursor-pointer box-border grid grid-cols-[1fr,auto] items-center w-full text-left"
          disabled
        >
          <span class="placeholder px-3 py-2">
            {component.displayName || "Select an option..."}
          </span>
          <div class="icon-container px-2">
            <ChevronDown size={18} />
          </div>
        </button>
      </div>
    {:else}
      <!-- Button Preview -->
      <button
        class="{getButtonColorClass(component.style)} relative discord-button button-content flex justify-center flex-grow-0 items-center box-border border-0 rounded px-4 py-[2px] min-h-[32px] text-sm font-medium leading-[16px] transition-colors duration-200 select-none"
        disabled
        aria-label={component.displayName}
      >
        <div class="flex items-center justify-center">
          <div class="flex items-center gap-2">
            {#if component.emoji}
              <span class="emoji w-[1.2em] h-[1.2em] inline-flex items-center justify-center align-[-0.1em]">
                {component.emoji}
              </span>
            {/if}
            <span class="truncate">{component.displayName}</span>
            {#if component.style === 5}
              <ExternalLink size={12} />
            {/if}
          </div>
        </div>
      </button>
    {/if}

    <!-- Actions Overlay -->
    <div class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
      <button
        class="p-1.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
        style="background: {$colorStore.primary}; color: {$colorStore.text};"
        on:click={() => dispatch('edit', { component })}
        title="Edit component"
        aria-label="Edit component"
      >
        <Edit size={12} />
      </button>
      
      <button
        class="p-1.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
        style="background: #ED4245; color: white;"
        on:click={() => dispatch('remove', { componentKey: component.componentKey })}
        title="Remove component"
        aria-label="Remove component"
      >
        <Trash2 size={12} />
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