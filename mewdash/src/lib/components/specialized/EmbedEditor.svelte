<!-- EmbedEditor.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import TabNavigation from "$lib/components/specialized/TabNavigation.svelte";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";


  interface Props {
    // Props
    embed: any;
    index?: number;
    placeholders?: any[];
      onupdate?: (detail: { embed: any; index: number }) => void;
      onremove?: (detail: { index: number }) => void;
      onduplicate?: (detail: { index: number }) => void;
  }

    let { embed, index = 0, placeholders = [], onupdate, onremove, onduplicate }: Props = $props();

  // Internal state
  let activeTab = $state('content');
  let fieldIdCounter = Math.max(...(embed.fields?.map((f: any) => f.id) || [0])) + 1;
  let showPlaceholderDropdown = $state('');
  let placeholderSearch = $state('');
  let currentInputElement: HTMLInputElement | HTMLTextAreaElement | null = $state(null);

  // Tabs configuration
  const tabs = [
    { id: 'content', label: 'Content', icon: "fa-text" },
    { id: 'appearance', label: 'Appearance', icon: "fa-layer-group" },
    { id: 'fields', label: 'Fields', icon: "fa-table-cells" },
    { id: 'media', label: 'Media', icon: "fa-image" }
  ];

  // Discord color options
  const discordColors = [
    { id: '#5865F2', name: 'Blurple', icon: '🟦' },
    { id: '#57F287', name: 'Green', icon: '🟩' },
    { id: '#FEE75C', name: 'Yellow', icon: '🟨' },
    { id: '#ED4245', name: 'Red', icon: '🟥' },
    { id: '#EB459E', name: 'Fuchsia', icon: '🟪' },
    { id: '#00D166', name: 'Brand Green', icon: '💚' },
    { id: '#3498DB', name: 'Blue', icon: '🔵' },
    { id: '#9C59B6', name: 'Purple', icon: '🟣' },
    { id: '#E67E22', name: 'Orange', icon: '🟠' },
    { id: '#95A5A6', name: 'Grey', icon: '⚪' },
    { id: '#000000', name: 'Black', icon: '⚫' },
    { id: '#FFFFFF', name: 'White', icon: '⚪' }
  ];

  // Update embed and dispatch
  function updateEmbed(field: string, value: any) {
    const updatedEmbed = { ...embed };
    
    // Handle nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!updatedEmbed[parent]) updatedEmbed[parent] = {};
      updatedEmbed[parent][child] = value;
    } else {
      updatedEmbed[field] = value;
    }
    
    embed = updatedEmbed;
    onupdate?.({ embed: updatedEmbed, index });
  }

  // Field management
  function addField() {
    const newField = {
      name: '',
      value: '',
      inline: false,
      id: fieldIdCounter++
    };

    const updatedEmbed = { ...embed };
    if (!updatedEmbed.fields) updatedEmbed.fields = [];
    updatedEmbed.fields = [...updatedEmbed.fields, newField];

    embed = updatedEmbed;
    onupdate?.({ embed: updatedEmbed, index });
  }

  function removeField(fieldIndex: number) {
    const updatedEmbed = { ...embed };
    updatedEmbed.fields = updatedEmbed.fields.filter((_: any, i: number) => i !== fieldIndex);

    embed = updatedEmbed;
    onupdate?.({ embed: updatedEmbed, index });
  }

  function updateField(fieldIndex: number, field: string, value: any) {
    const updatedEmbed = { ...embed };
    if (!updatedEmbed.fields[fieldIndex]) return;

    updatedEmbed.fields[fieldIndex][field] = value;
    embed = updatedEmbed;
    onupdate?.({ embed: updatedEmbed, index });
  }

  // Input handlers with placeholder support
  function handleInput(event: Event, field: string) {
    const target = event.target;
    if (target && ('value' in target)) {
      updateEmbed(field, target.value);
    }
  }

  function handleFieldInput(event: Event, fieldIndex: number, field: string) {
    const target = event.target;
    if (target && ('value' in target)) {
      updateField(fieldIndex, field, target.value);
    }
  }

    function handleCheckboxChange(event: Event, fieldIndex: number, field: string) {
      const target = event.target;
      if (target && ("checked" in target)) {
        updateField(fieldIndex, field, target.checked);
      }
    }

  // Character count helpers
  function getCharCount(text: string): number {
    return text ? text.length : 0;
  }

  function getCharCountColor(count: number, limit: number): string {
    const percentage = count / limit;
    if (percentage >= 0.9) return '#ED4245'; // Red
    if (percentage >= 0.8) return '#FEE75C'; // Yellow
    return $colorStore.muted;
  }

  // URL validation
  function isValidUrl(url: string): boolean {
    if (!url) return true; // Empty is valid

    // Allow URLs with placeholders (anything containing %...%)
    if (url.includes("%")) return true;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Placeholder handling
  function togglePlaceholderDropdown(fieldId: string) {
    const element = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement;
    if (element) {
      currentInputElement = element;
    }
    showPlaceholderDropdown = showPlaceholderDropdown === fieldId ? '' : fieldId;
    placeholderSearch = '';
  }

  function insertPlaceholder(placeholder: any, fieldId: string) {
    const element = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement;
    if (element) {
      const start = element.selectionStart || 0;
      const end = element.selectionEnd || 0;
      const text = element.value;

      element.value = text.substring(0, start) + placeholder.name + text.substring(end);
      element.selectionStart = element.selectionEnd = start + placeholder.name.length;

      // Trigger input event to update the data
      element.dispatchEvent(new Event('input', { bubbles: true }));

      showPlaceholderDropdown = '';
      element.focus();
    }
  }


</script>

<div class="space-y-6">
  <!-- Header with Actions -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
    <h3 class="text-base sm:text-lg font-semibold" style="color: {$colorStore.text};">
      Embed {index + 1}
    </h3>

    <div class="flex items-center gap-1.5 sm:gap-2">
      <button
        class="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-[1.02]"
        style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
        onclick={() => onduplicate?.({ index })}
        title="Duplicate embed"
        aria-label="Duplicate embed"
      >
        <i class="fa-solid fa-copy" style="font-size: 14px;"></i>
      </button>

      <button
        class="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-[1.02]"
        style="background: #ED424515; color: #ED4245;"
        onclick={() => onremove?.({ index })}
        title="Remove embed"
        aria-label="Remove embed"
      >
        <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
      </button>
    </div>
  </div>

  <!-- Tab Navigation -->
  <TabNavigation
    bind:activeTab
    {tabs}
    ariaLabel="Embed editor sections"
  />

  <!-- Tab Content -->
  <div class="min-h-[400px]">
    {#if activeTab === 'content'}
      <div class="space-y-4" role="tabpanel" aria-labelledby="content-tab">
        <!-- Title -->
        <div>
          <label for="embed-title-{index}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Title
            <span class="text-xs ml-2" style="color: {getCharCountColor(getCharCount(embed.title), 256)};">
              {getCharCount(embed.title)}/256
            </span>
          </label>
          <div class="relative">
            <input
              id="embed-title-{index}"
              type="text"
              class="w-full px-3 py-2 pr-10 rounded-lg border transition-colors duration-200 focus:outline-hidden focus:ring-2"
              style="background: {$colorStore.primary}10; 
                     border-color: {$colorStore.primary}30; 
                     color: {$colorStore.text};"
              placeholder="Enter embed title..."
              value={embed.title}
              maxlength="256"
              oninput={(e) => handleInput(e, 'title')}
            >
            <button
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-sm hover:bg-black/10"
              style="color: {$colorStore.muted};"
              onclick={() => togglePlaceholderDropdown(`embed-title-${index}`)}
              title="Insert placeholder"
            >
              %
            </button>
            
            <!-- Inline Placeholder Picker -->
            <PlaceholderPicker
              visible={showPlaceholderDropdown === `embed-title-${index}`}
              {placeholders}
              searchTerm={placeholderSearch}
              inline={true}
              inputElement={currentInputElement}
              onselect={(detail) => { insertPlaceholder(detail.placeholder, `embed-title-${index}`); }}
              onclose={() => showPlaceholderDropdown = ''}
              onsearch={(detail) => placeholderSearch = detail.term}
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="embed-description-{index}" class="block text-sm font-medium mb-2 z-50" style="color: {$colorStore.text};">
            Description
            <span class="text-xs ml-2" style="color: {getCharCountColor(getCharCount(embed.description), 4096)};">
              {getCharCount(embed.description)}/4096
            </span>
          </label>
          <div class="relative">
            <textarea
              id="embed-description-{index}"
              rows="6"
              class="w-full px-3 py-2 pr-10 rounded-lg border transition-colors duration-200 focus:outline-hidden focus:ring-2 resize-y"
              style="background: {$colorStore.primary}10;
                     border-color: {$colorStore.primary}30;
                     color: {$colorStore.text};"
              placeholder="Enter embed description... (Supports Discord markdown)"
              value={embed.description}
              maxlength="4096"
              oninput={(e) => handleInput(e, 'description')}
            ></textarea>
            <button
                    class="absolute right-2 top-2 p-1 rounded-sm hover:bg-black/10"
              style="color: {$colorStore.muted};"
              onclick={() => togglePlaceholderDropdown(`embed-description-${index}`)}
              title="Insert placeholder"
            >
              %
            </button>
            
            <!-- Inline Placeholder Picker -->
            <PlaceholderPicker
              visible={showPlaceholderDropdown === `embed-description-${index}`}
              {placeholders}
              searchTerm={placeholderSearch}
              inline={true}
              inputElement={currentInputElement}
              onselect={(detail) => { insertPlaceholder(detail.placeholder, `embed-description-${index}`); }}
              onclose={() => showPlaceholderDropdown = ''}
              onsearch={(detail) => placeholderSearch = detail.term}
            />
          </div>
          <p class="text-xs mt-1" style="color: {$colorStore.muted};">
            Supports **bold**, *italic*, __underline__, ~~strikethrough~~, `code`, and more. Click % for placeholders.
          </p>
        </div>

        <!-- URL -->
        <div>
          <label for="embed-url-{index}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            URL (makes title clickable)
          </label>
          <input
            id="embed-url-{index}"
            type="url"
            class="w-full px-3 py-2 rounded-lg border transition-colors duration-200 focus:outline-hidden focus:ring-2"
            style="background: {$colorStore.primary}10; 
                   border-color: {isValidUrl(embed.url) ? $colorStore.primary + '30' : '#ED4245'}; 
                   color: {$colorStore.text};"
            placeholder="https://example.com"
            value={embed.url}
            oninput={(e) => handleInput(e, 'url')}
          >
          {#if embed.url && !isValidUrl(embed.url)}
            <p class="text-xs mt-1 text-red-400">Please enter a valid URL</p>
          {/if}
        </div>
      </div>

    {:else if activeTab === 'appearance'}
      <div class="space-y-6" role="tabpanel" aria-labelledby="appearance-tab">
        <!-- Color -->
        <div>
          <span id="embed-color-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Embed Color
          </span>
          <DiscordSelector
            type="custom"
            options={discordColors}
            selected={embed.color}
            placeholder="Select embed color"
            onchange={(detail) => updateEmbed('color', detail.selected)}
          />
          
          <!-- Custom Color Input -->
          <div class="mt-3">
            <label for="custom-color-{index}" class="block text-xs font-medium mb-1" style="color: {$colorStore.muted};">
              Or enter custom hex color:
            </label>
            <input
              id="custom-color-{index}"
              type="color"
              class="w-16 h-10 rounded-sm border-2"
              style="border-color: {$colorStore.primary}30;"
              value={embed.color}
              oninput={(e) => handleInput(e, 'color')}
            >
          </div>
        </div>

        <!-- Author -->
        <fieldset class="border rounded-lg p-4" style="border-color: {$colorStore.primary}20;">
          <legend class="px-2 text-sm font-medium" style="color: {$colorStore.text};">Author</legend>
          
          <div class="space-y-3">
            <div>
              <label for="author-name-{index}" class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
                Name
                <span class="text-xs ml-2" style="color: {getCharCountColor(getCharCount(embed.author?.name), 256)};">
                  {getCharCount(embed.author?.name)}/256
                </span>
              </label>
              <div class="relative">
                <input
                  id="author-name-{index}"
                  type="text"
                  class="w-full px-3 py-2 pr-10 rounded-lg border"
                  style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  placeholder="Author name"
                  value={embed.author?.name || ''}
                  maxlength="256"
                  oninput={(e) => handleInput(e, 'author.name')}
                >
                <button
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-sm hover:bg-black/10"
                  style="color: {$colorStore.muted};"
                  onclick={() => togglePlaceholderDropdown(`author-name-${index}`)}
                  title="Insert placeholder"
                >
                  %
                </button>
                
                <!-- Inline Placeholder Picker -->
                <PlaceholderPicker
                  visible={showPlaceholderDropdown === `author-name-${index}`}
                  {placeholders}
                  searchTerm={placeholderSearch}
                  inline={true}
                  inputElement={currentInputElement}
                  onselect={(detail) => { insertPlaceholder(detail.placeholder, `author-name-${index}`); }}
                  onclose={() => showPlaceholderDropdown = ''}
                  onsearch={(detail) => placeholderSearch = detail.term}
                />
              </div>
            </div>

            <div>
              <label for="author-url-{index}" class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
                URL (makes author name clickable)
              </label>
              <input
                id="author-url-{index}"
                type="url"
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder="https://example.com"
                value={embed.author?.url || ''}
                oninput={(e) => handleInput(e, 'author.url')}
              >
            </div>

            <div>
              <label for="author-icon-{index}" class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
                Icon URL
              </label>
              <input
                id="author-icon-{index}"
                type="url"
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder="https://example.com/icon.png"
                value={embed.author?.icon_url || ''}
                oninput={(e) => handleInput(e, 'author.icon_url')}
              >
            </div>
          </div>
        </fieldset>

        <!-- Footer -->
        <fieldset class="border rounded-lg p-4" style="border-color: {$colorStore.primary}20;">
          <legend class="px-2 text-sm font-medium" style="color: {$colorStore.text};">Footer</legend>
          
          <div class="space-y-3">
            <div>
              <label for="footer-text-{index}" class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
                Text
                <span class="text-xs ml-2" style="color: {getCharCountColor(getCharCount(embed.footer?.text), 2048)};">
                  {getCharCount(embed.footer?.text)}/2048
                </span>
              </label>
              <div class="relative">
                <input
                  id="footer-text-{index}"
                  type="text"
                  class="w-full px-3 py-2 pr-10 rounded-lg border"
                  style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                  placeholder="Footer text"
                  value={embed.footer?.text || ''}
                  maxlength="2048"
                  oninput={(e) => handleInput(e, 'footer.text')}
                >
                <button
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-sm hover:bg-black/10"
                  style="color: {$colorStore.muted};"
                  onclick={() => togglePlaceholderDropdown(`footer-text-${index}`)}
                  title="Insert placeholder"
                >
                  %
                </button>
                
                <!-- Inline Placeholder Picker -->
                <PlaceholderPicker
                  visible={showPlaceholderDropdown === `footer-text-${index}`}
                  {placeholders}
                  searchTerm={placeholderSearch}
                  inline={true}
                  inputElement={currentInputElement}
                  onselect={(detail) => { insertPlaceholder(detail.placeholder, `footer-text-${index}`); }}
                  onclose={() => showPlaceholderDropdown = ''}
                  onsearch={(detail) => placeholderSearch = detail.term}
                />
              </div>
            </div>

            <div>
              <label for="footer-icon-{index}" class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
                Icon URL
              </label>
              <input
                id="footer-icon-{index}"
                type="url"
                class="w-full px-3 py-2 rounded-lg border"
                style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder="https://example.com/icon.png"
                value={embed.footer?.icon_url || ''}
                oninput={(e) => handleInput(e, 'footer.icon_url')}
              >
            </div>
          </div>
        </fieldset>
      </div>

    {:else if activeTab === 'fields'}
      <div class="space-y-6" role="tabpanel" aria-labelledby="fields-tab">
        <!-- Add Field Button -->
        <div class="flex justify-between items-center">
          <h4 class="text-sm sm:text-md font-medium" style="color: {$colorStore.text};">
            Fields ({embed.fields?.length || 0}/25)
          </h4>
          <button
            class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 text-sm"
            style="background: {$colorStore.primary}; color: {$colorStore.text};"
            disabled={(embed.fields?.length || 0) >= 25}
            onclick={addField}
          >
            <i class="fa-solid fa-plus" style="font-size: 14px;"></i>
            <span class="hidden sm:inline">Add Field</span>
            <span class="sm:hidden">Add</span>
          </button>
        </div>

        <!-- Fields List -->
        <div class="space-y-4">
          {#each (embed.fields || []) as field, fieldIndex}
            <div class="border rounded-lg p-4" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}05;">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm font-medium" style="color: {$colorStore.text};">Field {fieldIndex + 1}</span>
                <button aria-label="Add field"
                        class="p-1 rounded-sm text-red-400 hover:bg-red-400/10 transition-colors"
                  onclick={() => removeField(fieldIndex)}
                  title="Remove field"
                >
                  <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
                </button>
              </div>

              <div class="space-y-3">
                <!-- Field Name -->
                <div>
                  <label for="field-name" class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                    Name
                    <span class="ml-2" style="color: {getCharCountColor(getCharCount(field.name), 256)};">
                      {getCharCount(field.name)}/256
                    </span>
                  </label>
                  <div class="relative">
                    <input
                      id="field-name-{index}-{fieldIndex}"
                      type="text"
                      class="w-full px-3 py-2 pr-10 rounded-sm border text-sm"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Field name"
                      value={field.name}
                      maxlength="256"
                      oninput={(e) => handleFieldInput(e, fieldIndex, 'name')}
                    >
                    <button
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-sm hover:bg-black/10"
                      style="color: {$colorStore.muted};"
                      onclick={() => togglePlaceholderDropdown(`field-name-${index}-${fieldIndex}`)}
                      title="Insert placeholder"
                    >
                      %
                    </button>
                    
                    <!-- Inline Placeholder Picker -->
                    <PlaceholderPicker
                      visible={showPlaceholderDropdown === `field-name-${index}-${fieldIndex}`}
                      {placeholders}
                      searchTerm={placeholderSearch}
                      inline={true}
                      inputElement={currentInputElement}
                      onselect={(detail) => { insertPlaceholder(detail.placeholder, `field-name-${index}-${fieldIndex}`); }}
                      onclose={() => showPlaceholderDropdown = ''}
                      onsearch={(detail) => placeholderSearch = detail.term}
                    />
                  </div>
                </div>

                <!-- Field Value -->
                <div>
                  <label for="field-value" class="block text-xs font-medium mb-1" style="color: {$colorStore.text};">
                    Value
                    <span class="ml-2" style="color: {getCharCountColor(getCharCount(field.value), 1024)};">
                      {getCharCount(field.value)}/1024
                    </span>
                  </label>
                  <div class="relative">
                    <textarea
                      id="field-value-{index}-{fieldIndex}"
                      rows="3"
                      class="w-full px-3 py-2 pr-10 rounded-sm border text-sm resize-y"
                      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="Field value"
                      value={field.value}
                      maxlength="1024"
                      oninput={(e) => handleFieldInput(e, fieldIndex, 'value')}
                    ></textarea>
                    <button
                            class="absolute right-2 top-2 p-1 rounded-sm hover:bg-black/10"
                      style="color: {$colorStore.muted};"
                      onclick={() => togglePlaceholderDropdown(`field-value-${index}-${fieldIndex}`)}
                      title="Insert placeholder"
                    >
                      %
                    </button>
                    
                    <!-- Inline Placeholder Picker -->
                    <PlaceholderPicker
                      visible={showPlaceholderDropdown === `field-value-${index}-${fieldIndex}`}
                      {placeholders}
                      searchTerm={placeholderSearch}
                      inline={true}
                      inputElement={currentInputElement}
                      onselect={(detail) => { insertPlaceholder(detail.placeholder, `field-value-${index}-${fieldIndex}`); }}
                      onclose={() => showPlaceholderDropdown = ''}
                      onsearch={(detail) => placeholderSearch = detail.term}
                    />
                  </div>
                </div>

                <!-- Inline Toggle -->
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inline-{index}-{fieldIndex}"
                    class="rounded-sm"
                    checked={field.inline}
                    onchange={(e) => handleCheckboxChange(e, fieldIndex, 'inline')}
                  >
                  <label for="inline-{index}-{fieldIndex}" class="text-xs" style="color: {$colorStore.text};">
                    Display inline (up to 3 fields per row)
                  </label>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if !embed.fields || embed.fields.length === 0}
          <div class="text-center py-8">
            <p class="text-sm" style="color: {$colorStore.muted};">No fields added yet. Click "Add Field" to get started.</p>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'media'}
      <div class="space-y-6" role="tabpanel" aria-labelledby="media-tab">
        <!-- Thumbnail -->
        <div>
          <label for="thumbnail-{index}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Thumbnail URL
          </label>
          <input
            id="thumbnail-{index}"
            type="url"
            class="w-full px-3 py-2 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="https://example.com/thumbnail.png"
            value={embed.thumbnail?.url || ''}
            oninput={(e) => handleInput(e, 'thumbnail.url')}
          >
          <p class="text-xs mt-1" style="color: {$colorStore.muted};">Small image displayed in the top-right corner</p>
        </div>

        <!-- Image -->
        <div>
          <label for="image-{index}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
            Image URL
          </label>
          <input
            id="image-{index}"
            type="url"
            class="w-full px-3 py-2 rounded-lg border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="https://example.com/image.png"
            value={embed.image?.url || ''}
            oninput={(e) => handleInput(e, 'image.url')}
          >
          <p class="text-xs mt-1" style="color: {$colorStore.muted};">Large image displayed at the bottom of the embed</p>
        </div>

        <!-- Media Tips -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h5 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Media Tips:</h5>
          <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Supported formats: PNG, JPG, GIF, WebP</li>
            <li>• Use direct image URLs (ending in .png, .jpg, etc.)</li>
            <li>• Images should be publicly accessible</li>
            <li>• Recommended thumbnail size: 80x80px</li>
            <li>• Maximum image size: 8MB</li>
          </ul>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  
  fieldset {
    position: relative;
  }
  
  legend {
    background: var(--bg-color, white);
    padding: 0 8px;
  }
</style>