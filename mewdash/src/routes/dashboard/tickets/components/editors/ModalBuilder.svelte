<!-- components/editors/ModalBuilder.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  interface Props {
    modalJson: string | null;
  }

  let { modalJson = $bindable(null) }: Props = $props();

  const fieldStyleOptions = [
    { id: "1", name: "Short", label: "Short (single line)" },
    { id: "2", name: "Paragraph", label: "Paragraph (multi-line)" }
  ];

  // Parse modal configuration
  let modalConfig = $state<any>({
    title: "Create Ticket",
    fields: {}
  });

  let expandedFieldId = $state<string | null>(null);

  // Parse on mount
  $effect(() => {
    if (modalJson) {
      try {
        const parsed = JSON.parse(modalJson);
        modalConfig = {
          title: parsed.Title || parsed.title || "Create Ticket",
          fields: parsed.Fields || parsed.fields || {}
        };
      } catch {
        modalConfig = { title: "Create Ticket", fields: {} };
      }
    }
  });

  // Update JSON when config changes
  function updateJson() {
    // Sanitize fields by removing empty/null Placeholder and Value
    const sanitizedFields: any = {};

    for (const [fieldId, field] of Object.entries(modalConfig.fields) as [string, any][]) {
      const sanitizedField: any = {
        Label: field.Label,
        Style: field.Style,
        Required: field.Required,
        MinLength: field.MinLength,
        MaxLength: field.MaxLength
      };

      // Only include Placeholder if it's not empty or null
      if (field.Placeholder && field.Placeholder.trim()) {
        sanitizedField.Placeholder = field.Placeholder.trim();
      }

      // Only include Value if it's not empty or null
      if (field.Value && field.Value.trim()) {
        sanitizedField.Value = field.Value.trim();
      }

      sanitizedFields[fieldId] = sanitizedField;
    }

    const config = {
      Title: modalConfig.title,
      Fields: sanitizedFields
    };
    modalJson = Object.keys(sanitizedFields).length > 0 ? JSON.stringify(config) : null;
  }

  function addField() {
    const fieldCount = Object.keys(modalConfig.fields).length;
    if (fieldCount >= 5) return;

    const fieldId = `field_${Date.now()}`;
    modalConfig.fields[fieldId] = {
      Label: "New Field",
      Style: 1, // Short
      Required: true,
      MinLength: 1,
      MaxLength: 1000,
      Placeholder: "",
      Value: ""
    };
    modalConfig = { ...modalConfig };
    expandedFieldId = fieldId; // Auto-expand new field
    updateJson();
  }

  function removeField(fieldId: string) {
    if (expandedFieldId === fieldId) expandedFieldId = null;
    delete modalConfig.fields[fieldId];
    modalConfig = { ...modalConfig };
    updateJson();
  }

  function updateField(fieldId: string, property: string, value: any) {
    if (!modalConfig.fields[fieldId]) return;
    modalConfig.fields[fieldId][property] = value;
    modalConfig = { ...modalConfig };
    updateJson();
  }

  function toggleField(fieldId: string) {
    expandedFieldId = expandedFieldId === fieldId ? null : fieldId;
  }

  let fieldEntries = $derived(Object.entries(modalConfig.fields) as [string, any][]);
</script>

<div class="space-y-4">
  <!-- Modal Title -->
  <div>
    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
      Modal Title
    </label>
    <input
      bind:value={modalConfig.title}
      class="w-full px-3 py-2 rounded-lg border transition-colors"
      maxlength="45"
      oninput={updateJson}
      placeholder="Create Ticket"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      type="text"
    />
  </div>

  <!-- Fields -->
  <div>
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-semibold text-sm" style="color: {$colorStore.text}">
        Fields ({fieldEntries.length}/5)
      </h4>
      <button
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        disabled={fieldEntries.length >= 5}
        onclick={addField}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-plus"></i>
        Add Field
      </button>
    </div>

    {#if fieldEntries.length === 0}
      <div class="text-center py-6 rounded-lg"
           style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
        <i class="fa-solid fa-window-maximize" style="color: {$colorStore.muted}; font-size: 36px; opacity: 0.3;"></i>
        <p class="mt-3 text-sm" style="color: {$colorStore.muted}">No modal fields configured</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each fieldEntries as [fieldId, field], index}
          {@const isExpanded = expandedFieldId === fieldId}
          <div class="rounded-lg border overflow-hidden"
               style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20;">
            <!-- Collapsed Header -->
            <div class="w-full px-4 py-3 flex items-center justify-between">
              <button
                class="flex items-center gap-3 hover:brightness-110 transition-all flex-1"
                onclick={() => toggleField(fieldId)}
              >
                <i class="fa-solid fa-chevron-{isExpanded ? 'down' : 'right'}"
                   style="color: {$colorStore.primary};"></i>
                <span class="font-semibold text-sm" style="color: {$colorStore.text}">
                  Field {index + 1}: {field.Label}
                </span>
                <span class="text-xs px-2 py-0.5 rounded"
                      style="background: {$colorStore.primary}20; color: {$colorStore.muted}">
                  {field.Style === 1 ? 'Short' : 'Paragraph'}
                </span>
                {#if field.Required}
                  <span class="text-xs px-2 py-0.5 rounded" style="background: #ef444420; color: #ef4444;">
                    Required
                  </span>
                {/if}
              </button>
              <button
                class="px-2 py-1 rounded transition-all hover:opacity-80 text-sm"
                style="background: #ef444420; color: #ef4444;"
                onclick={() => removeField(fieldId)}
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

            <!-- Expanded Content -->
            {#if isExpanded}
              <div class="px-4 pb-4 pt-2 space-y-3 border-t" style="border-color: {$colorStore.primary}20;">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <!-- Label -->
                  <div>
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text}">
                      Label <span style="color: #ef4444;">*</span>
                    </label>
                    <input
                      type="text"
                      value={field.Label}
                      oninput={(e) => updateField(fieldId, 'Label', e.currentTarget.value)}
                      class="w-full px-2 py-1.5 rounded border text-sm"
                      placeholder="Field label"
                      maxlength="45"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                  </div>

                  <!-- Style -->
                  <div>
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text}">
                      Style
                    </label>
                    <DiscordSelector
                      type="custom"
                      options={fieldStyleOptions}
                      selected={field.Style.toString()}
                      placeholder="Select style..."
                      multiple={false}
                      searchable={false}
                      onchange={(detail) => {
                        if (detail.selected && typeof detail.selected === 'string') {
                          updateField(fieldId, 'Style', parseInt(detail.selected));
                        }
                      }}
                    />
                  </div>

                  <!-- Placeholder -->
                  <div class="md:col-span-2">
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text}">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.Placeholder || ''}
                      oninput={(e) => updateField(fieldId, 'Placeholder', e.currentTarget.value)}
                      class="w-full px-2 py-1.5 rounded border text-sm"
                      placeholder="Enter text here..."
                      maxlength="100"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                  </div>

                  <!-- Min Length -->
                  <div>
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text}">
                      Min Length
                    </label>
                    <input
                      type="number"
                      value={field.MinLength || 0}
                      oninput={(e) => updateField(fieldId, 'MinLength', parseInt(e.currentTarget.value) || 0)}
                      min="0"
                      max="4000"
                      class="w-full px-2 py-1.5 rounded border text-sm"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                  </div>

                  <!-- Max Length -->
                  <div>
                    <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text}">
                      Max Length
                    </label>
                    <input
                      type="number"
                      value={field.MaxLength || 1000}
                      oninput={(e) => updateField(fieldId, 'MaxLength', parseInt(e.currentTarget.value) || 1000)}
                      min="1"
                      max="4000"
                      class="w-full px-2 py-1.5 rounded border text-sm"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                  </div>

                  <!-- Required -->
                  <div class="md:col-span-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.Required}
                        onchange={(e) => updateField(fieldId, 'Required', e.currentTarget.checked)}
                        class="rounded"
                      />
                      <span class="text-sm font-medium" style="color: {$colorStore.text}">
                        Required field
                      </span>
                    </label>
                  </div>
                </div>

                <div class="p-2 rounded text-xs" style="background: {$colorStore.accent}10; color: {$colorStore.muted}">
                  <i class="fa-solid fa-info-circle" style="color: {$colorStore.accent};"></i>
                  Use <code class="px-1 py-0.5 rounded" style="background: {$colorStore.primary}15;">%modal.{fieldId}
                  %</code> in open message
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if fieldEntries.length > 0}
    <div class="p-3 rounded-lg text-xs"
         style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
      <div class="font-semibold mb-1" style="color: {$colorStore.text}">
        <i class="fa-solid fa-lightbulb" style="color: {$colorStore.accent};"></i>
        Available Placeholders
      </div>
      <div class="flex flex-wrap gap-1.5">
        {#each fieldEntries as [fieldId]}
          <code class="px-1.5 py-0.5 rounded" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
            %modal.{fieldId}%
          </code>
        {/each}
      </div>
    </div>
  {/if}
</div>
