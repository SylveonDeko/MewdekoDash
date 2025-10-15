<!-- ComponentEditor.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import { clientApi } from "$lib/api/client/client";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { DiscordUser } from "$lib/types/discord";


  interface Props {
    // Props
    component: any;
    triggers?: any[];
    isEditing?: boolean;
      user?: DiscordUser;
      onupdate?: (detail: { component: any }) => void;
      onremove?: (detail: { componentKey: string }) => void;
      onedit?: (detail: { component: any }) => void;
      onduplicate?: (detail: { componentKey: string }) => void;
  }

    let {
      component = $bindable(),
      triggers = [],
      isEditing = false,
      user,
      onupdate,
      onremove,
      onedit,
      onduplicate
    }: Props = $props();

    // Guild emojis state
    let guildEmojis = $state<GuildEmojiInfo[]>([]);
    let emojisLoading = $state(false);

    // Load guild emojis when user is available
    $effect(() => {
      if (user?.id && !emojisLoading && guildEmojis.length === 0) {
        emojisLoading = true;
        clientApi.getEmojis(BigInt(user.id), false)
          .then(data => {
            guildEmojis = data;
          })
          .catch(err => {
            console.error("Failed to load guild emojis:", err);
          })
          .finally(() => {
            emojisLoading = false;
          });
      }
    });

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

    function duplicateOption(index: number) {
      if (!component.options) return;
      if (component.options.length >= 25) return;

      const updatedComponent = { ...component };
      const optionToDuplicate = JSON.parse(JSON.stringify(updatedComponent.options[index]));
      updatedComponent.options.splice(index + 1, 0, optionToDuplicate);

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

  function isValidUrl(url: string): boolean {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

    // Parse emoji for rendering
    function parseEmojiForDisplay(emojiString: string): { url: string; name: string } | null {
      if (!emojiString) return null;
      const match = emojiString.match(/<(a?):([^:]+):(\d+)>/);
      if (!match) return null;

      const [, animatedFlag, name, id] = match;
      const animated = animatedFlag === "a";
      const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? "png" : "png"}?size=32&quality=lossless`;

      return { url, name };
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
  <div class="space-y-4 sm:space-y-6"
       style="color: {$colorStore.text};">

    <!-- Header -->
    <div class="flex justify-between items-center">
      <h3 class="text-base sm:text-lg font-semibold" style="color: {$colorStore.text};">
        Edit {component.isSelect ? 'Select Menu' : 'Button'}
      </h3>

      <div class="flex items-center gap-1 sm:gap-2">
        <!-- Validation Status -->
        <div class="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full"
             style="background: {isValid ? '#57F287' : '#ED4245'};"
             title="{isValid ? 'Valid' : 'Has validation errors'}">
        </div>

        <!-- Duplicate Button -->
        <button
          aria-label="Duplicate component"
          class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all hover:scale-[1.02] font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          onclick={() => onduplicate?.({ componentKey: component.componentKey })}
        >
          <i class="fa-solid fa-copy" style="font-size: 10px;"></i>
          <span class="hidden sm:inline">Duplicate</span>
        </button>

        <!-- Delete Button -->
        <button
          aria-label="Delete component"
          class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all hover:scale-[1.02] font-medium"
          style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
          onclick={() => onremove?.({ componentKey: component.componentKey })}
        >
          <i class="fa-solid fa-trash" style="font-size: 10px;"></i>
          <span class="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>

    {#if !component.isSelect}
      <!-- Button Fields -->
      <div class="space-y-3 sm:space-y-4">
        <!-- Display Name -->
        <div>
          <label for="input-6378" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                 style="color: {$colorStore.text};">
            Display Name
            <span class="text-[10px] sm:text-xs ml-1 sm:ml-2" style="color: {$colorStore.muted};">
              {component.displayName?.length || 0}/80
            </span>
          </label>
          <input id="input-6378"
            type="text"
                 class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Button text"
            value={component.displayName || ''}
            maxlength="80"
                 oninput={(e) => handleInput(e, 'displayName')}
          >
        </div>

        <!-- Style -->
        <div>
          <span id="button-style-label" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                style="color: {$colorStore.text};">
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
          <label for="button-emoji-picker" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                 style="color: {$colorStore.text};">
            Emoji <span class="text-[10px] sm:text-xs">(optional)</span>
          </label>
          <EmojiPicker
            {guildEmojis}
            selected={component.emoji || null}
            multiple={false}
            placeholder="Select an emoji..."
            searchable={true}
            groupByGuild={true}
            onchange={(detail) => {
              updateComponent('emoji', detail.selected || '');
            }}
          />
        </div>

        {#if component.style === 5}
          <!-- URL for Link Button -->
          <div>
            <label for="input-4138" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                   style="color: {$colorStore.text};">
              URL
            </label>
            <input id="input-4138"
              type="url"
                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
                   style="background: {$colorStore.primary}10;
                     border-color: {isValidUrl(component.url) ? $colorStore.primary + '30' : '#ED4245'};
                     color: {$colorStore.text};"
              placeholder="https://example.com"
              value={component.url || ''}
                   oninput={(e) => handleInput(e, 'url')}
            >
            {#if component.url && !isValidUrl(component.url)}
              <p class="text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-red-400">Please enter a valid URL</p>
            {/if}
          </div>
        {:else}
          <!-- Trigger Selection -->
          <div>
            <span id="trigger-action-label" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                  style="color: {$colorStore.text};">
              Trigger Action
            </span>
            <div class="min-h-[40px] sm:min-h-[50px]">
              <DiscordSelector
                type="custom"
                customIcon="fa-bolt"
                options={triggers.map(t => ({
                  id: t.id.toString(),
                  name: t.trigger || 'Unnamed trigger',
                  label: t.response || 'No response'
                }))}
                selected={component.id}
                placeholder="Select a trigger"
                onchange={(detail) => {
                  updateComponent('id', detail.selected);
                }}
              />
            </div>
          </div>
        {/if}
      </div>

    {:else}
      <!-- Select Menu Fields -->
      <div class="space-y-3 sm:space-y-4">
        <!-- Placeholder Text -->
        <div>
          <label for="input-9302" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                 style="color: {$colorStore.text};">
            Placeholder Text
            <span class="text-[10px] sm:text-xs ml-1 sm:ml-2" style="color: {$colorStore.muted};">
              {component.displayName?.length || 0}/150
            </span>
          </label>
          <input id="input-9302"
            type="text"
                 class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Choose an option..."
            value={component.displayName || ''}
            maxlength="150"
                 oninput={(e) => handleInput(e, 'displayName')}
          >
        </div>

        <!-- Min/Max Options -->
        <div class="grid grid-cols-2 gap-2 sm:gap-4">
          <div>
            <label for="input-1535" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                   style="color: {$colorStore.text};">
              <span class="hidden sm:inline">Min Options</span>
              <span class="sm:hidden">Min</span>
            </label>
            <input id="input-1535"
              type="number"
              min="1"
              max="25"
                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              value={component.minOptions || 1}
                   oninput={(e) => handleNumberInput(e, 'minOptions', '1')}
            >
          </div>

          <div>
            <label for="input-2620" class="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                   style="color: {$colorStore.text};">
              <span class="hidden sm:inline">Max Options</span>
              <span class="sm:hidden">Max</span>
            </label>
            <input id="input-2620"
              type="number"
              min="1"
              max="25"
                   class="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border text-sm"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              value={component.maxOptions || 1}
                   oninput={(e) => handleNumberInput(e, 'maxOptions', '1')}
            >
          </div>
        </div>

        <!-- Options -->
        <div>
          <div class="flex justify-between items-center mb-3 sm:mb-4">
            <label for="input-9558" class="text-xs sm:text-sm font-medium" style="color: {$colorStore.text};">
              Options ({component.options?.length || 0}/25)
            </label>
            <button
              aria-label="Add option"
              class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-1 disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              disabled={(component.options?.length || 0) >= 25}
              onclick={addOption}
            >
              <i class="fa-solid fa-plus" style="font-size: 11px;"></i>
              <span class="hidden sm:inline">Add Option</span>
              <span class="sm:hidden">Add</span>
            </button>
          </div>

          <div class="space-y-2 sm:space-y-3">
            {#each (component.options || []) as option, index}
              <div class="p-3 sm:p-4 border rounded-md sm:rounded-lg"
                   style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">

                <div class="flex justify-between items-center mb-2 sm:mb-3">
                  <span class="text-xs sm:text-sm font-medium" style="color: {$colorStore.text};">
                    Option {index + 1}
                  </span>
                  <div class="flex gap-1">
                    <button aria-label="Duplicate option"
                            class="p-0.5 sm:p-1 rounded-sm hover:bg-white/10 transition-colors"
                            style="color: {$colorStore.primary};"
                            onclick={() => duplicateOption(index)}
                            title="Duplicate option"
                    >
                      <i class="fa-solid fa-copy" style="font-size: 12px;"></i>
                    </button>
                    <button aria-label="Remove option"
                            class="p-0.5 sm:p-1 rounded-sm text-red-400 hover:bg-red-400/10 transition-colors"
                            onclick={() => removeOption(index)}
                            title="Remove option"
                    >
                      <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                    </button>
                  </div>
                </div>

                <div class="space-y-2 sm:space-y-3">
                  <!-- Option Name -->
                  <div>
                    <label for="input-9558" class="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1"
                           style="color: {$colorStore.text};">
                      Name
                      <span class="ml-1 sm:ml-2 text-[9px] sm:text-[10px]" style="color: {$colorStore.muted};">
                        {option.name?.length || 0}/100
                      </span>
                    </label>
                    <input id="input-9558"
                      type="text"
                           class="w-full px-2 sm:px-3 py-1 sm:py-2 rounded-sm border text-xs sm:text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Option name"
                      value={option.name || ''}
                      maxlength="100"
                           oninput={(e) => handleOptionInput(e, index, 'name')}
                    >
                  </div>

                  <!-- Option Description -->
                  <div>
                    <label for="input-9067" class="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1"
                           style="color: {$colorStore.text};">
                      Description
                      <span class="ml-1 sm:ml-2 text-[9px] sm:text-[10px]" style="color: {$colorStore.muted};">
                        {option.description?.length || 0}/100
                      </span>
                    </label>
                    <input id="input-9067"
                      type="text"
                           class="w-full px-2 sm:px-3 py-1 sm:py-2 rounded-sm border text-xs sm:text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Option description"
                      value={option.description || ''}
                      maxlength="100"
                           oninput={(e) => handleOptionInput(e, index, 'description')}
                    >
                  </div>

                  <!-- Option Emoji -->
                  <div>
                    <label for="option-emoji-picker-{index}"
                           class="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1"
                           style="color: {$colorStore.text};">
                      Emoji <span class="text-[9px] sm:text-[10px]">(optional)</span>
                    </label>
                    <EmojiPicker
                      {guildEmojis}
                      selected={option.emoji || null}
                      multiple={false}
                      placeholder="Select an emoji..."
                      searchable={true}
                      groupByGuild={true}
                      onchange={(detail) => {
                        updateOption(index, 'emoji', detail.selected || '');
                      }}
                    />
                  </div>

                  <!-- Option Trigger -->
                  <div>
                    <span id="option-trigger-label-{index}"
                          class="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1"
                          style="color: {$colorStore.text};">
                      Trigger Action
                    </span>
                    <div class="min-h-[36px] sm:min-h-[44px]">
                      <DiscordSelector
                        type="custom"
                        customIcon="fa-bolt"
                        options={triggers.map(t => ({
                          id: t.id.toString(),
                          name: t.trigger || 'Unnamed trigger',
                          label: t.response || 'No response'
                        }))}
                        selected={option.id}
                        placeholder="Select a trigger"
                        onchange={(detail) => {
                          updateOption(index, 'id', detail.selected);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>

          {#if !component.options || component.options.length === 0}
            <div class="text-center py-6 sm:py-8">
              <p class="text-xs sm:text-sm" style="color: {$colorStore.muted};">
                No options added yet. Click "Add" to get started.
              </p>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Validation Messages -->
    {#if !isValid}
      <div class="p-2 sm:p-3 rounded-md sm:rounded-lg border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20">
        <div class="text-xs sm:text-sm text-red-700 dark:text-red-300">
          <p class="font-medium mb-0.5 sm:mb-1">Validation Errors:</p>
          <ul class="list-disc list-inside space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
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
  {#if component.isSelect}
    <!-- Select Menu Preview (full width) -->
    <button aria-label="Toggle"
            class="border border-transparent bg-[#2F3136] text-white text-xs sm:text-sm font-medium rounded-sm cursor-pointer box-border grid grid-cols-[1fr_auto] items-center w-full text-left pointer-events-none"
            disabled
    >
      <span class="placeholder px-2 sm:px-3 py-1 sm:py-2">
        {component.displayName || "Select an option..."}
      </span>
      <span class="icon-container px-1.5 sm:px-2">
        <i class="fa-solid fa-chevron-down text-xs sm:text-base"></i>
      </span>
    </button>
  {:else}
    <!-- Button Preview -->
    <button
      class="{getButtonColorClass(component.style)} relative discord-button button-content flex justify-center grow-0 items-center box-border border-0 rounded-sm px-2 sm:px-4 py-[1px] sm:py-[2px] min-h-[24px] sm:min-h-[32px] text-[11px] sm:text-sm font-medium leading-[14px] sm:leading-[16px] transition-colors duration-200 select-none gap-1 sm:gap-2 pointer-events-none"
      disabled
      aria-label={component.displayName}
    >
      {#if component.emoji}
        {@const parsedEmoji = parseEmojiForDisplay(component.emoji)}
        {#if parsedEmoji}
          <img src={parsedEmoji.url} alt={parsedEmoji.name}
               class="w-[1em] sm:w-[1.2em] h-[1em] sm:h-[1.2em] inline-flex items-center justify-center align-[-0.1em]" />
        {:else}
          <span
            class="emoji w-[1em] sm:w-[1.2em] h-[1em] sm:h-[1.2em] inline-flex items-center justify-center align-[-0.1em] text-[10px] sm:text-xs">
            {component.emoji}
          </span>
        {/if}
      {/if}
      <span class="truncate">{component.displayName}</span>
      {#if component.style === 5}
        <i class="fa-solid fa-arrow-up-right-from-square text-[9px] sm:text-xs"></i>
      {/if}
    </button>
  {/if}
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