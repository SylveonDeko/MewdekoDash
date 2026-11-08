<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import ListRow from "../ListRow.svelte";

  interface Field {
    key: string;
    label: string;
    style: number;
    required: boolean;
    minLength: number;
    maxLength: number;
    placeholder: string;
    value: string;
  }

  interface Props {
    /** The stored modal: JSON with a Title and a Fields object. */
    value: string | null | undefined;
    onchange: (json: string) => void;
    uid: string;
  }

  let { value, onchange, uid }: Props = $props();

  const MAX_FIELDS = 5;

  function read(json: string | null | undefined): { title: string; fields: Field[] } {
    if (!json) return { title: "", fields: [] };
    try {
      const parsed = JSON.parse(json);
      const source = parsed.Fields ?? parsed.fields ?? (parsed.Title === undefined && parsed.title === undefined ? parsed : {});
      const fields = Object.entries(source as Record<string, Record<string, unknown>>).map(([key, raw]) => ({
        key,
        label: String(raw.Label ?? raw.label ?? ""),
        style: Number(raw.Style ?? raw.style ?? 1),
        required: Boolean(raw.Required ?? raw.required ?? false),
        minLength: Number(raw.MinLength ?? raw.minLength ?? 0),
        maxLength: Number(raw.MaxLength ?? raw.maxLength ?? 1000),
        placeholder: String(raw.Placeholder ?? raw.placeholder ?? ""),
        value: String(raw.Value ?? raw.value ?? "")
      }));
      return { title: String(parsed.Title ?? parsed.title ?? ""), fields };
    } catch {
      return { title: "", fields: [] };
    }
  }

  const initial = untrack(() => read(value));
  let title = $state(initial.title);
  let fields = $state<Field[]>(initial.fields);
  let openKey = $state<string | null>(null);

  const styleOptions = $derived([
    { id: "1", name: m.tickets.modalStyleShort() },
    { id: "2", name: m.tickets.modalStyleParagraph() }
  ]);

  function emit() {
    if (fields.length === 0) {
      onchange("");
      return;
    }
    const out: Record<string, Record<string, unknown>> = {};
    for (const field of fields) {
      const entry: Record<string, unknown> = {
        Label: field.label,
        Style: field.style,
        Required: field.required,
        MinLength: field.minLength,
        MaxLength: field.maxLength
      };
      if (field.placeholder.trim()) entry.Placeholder = field.placeholder.trim();
      if (field.value.trim()) entry.Value = field.value.trim();
      out[field.key] = entry;
    }
    onchange(JSON.stringify({ Title: title.trim() || undefined, Fields: out }));
  }

  function patch(key: string, change: Partial<Field>) {
    fields = fields.map(field => (field.key === key ? { ...field, ...change } : field));
    emit();
  }

  function slug(raw: string): string {
    return raw.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  }

  function rename(key: string, raw: string) {
    const next = slug(raw);
    if (!next || fields.some(field => field.key === next && field.key !== key)) return;
    fields = fields.map(field => (field.key === key ? { ...field, key: next } : field));
    if (openKey === key) openKey = next;
    emit();
  }

  function add() {
    if (fields.length >= MAX_FIELDS) return;
    let n = fields.length + 1;
    while (fields.some(field => field.key === `field_${n}`)) n++;
    const key = `field_${n}`;
    fields = [
      ...fields,
      { key, label: m.tickets.modalNewFieldLabel(), style: 1, required: true, minLength: 0, maxLength: 1000, placeholder: "", value: "" }
    ];
    openKey = key;
    emit();
  }

  function remove(key: string) {
    fields = fields.filter(field => field.key !== key);
    if (openKey === key) openKey = null;
    emit();
  }

  function number(event: Event, fallback: number, min: number): number {
    const parsed = Math.floor(Number((event.currentTarget as HTMLInputElement).value));
    return Number.isNaN(parsed) ? fallback : Math.min(4000, Math.max(min, parsed));
  }

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
</script>

<div class="space-y-3">
  <SettingField label={m.tickets.modalTitle()} id="{uid}-modal-title">
    <input
      id="{uid}-modal-title"
      type="text"
      maxlength="45"
      bind:value={title}
      oninput={emit}
      placeholder={m.tickets.modalTitlePlaceholder()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
  </SettingField>

  {#each fields as field (field.key)}
    <div class="space-y-3">
      <ListRow
        title={field.label || field.key}
        subtitle={`%modal.${field.key}%`}
        badges={[field.style === 2 ? m.tickets.modalStyleParagraph() : m.tickets.modalStyleShort(), ...(field.required ? [m.common.required()] : [])]}
        onopen={() => (openKey = openKey === field.key ? null : field.key)}
        menu={[{ label: m.common.remove(), icon: "fa-trash", onclick: () => remove(field.key) }]}
        menuLabel={m.tickets.rowMoreAria({ name: field.label || field.key })}
      />
      {#if openKey === field.key}
        <div class="rounded-xl border p-3 sm:p-4 space-y-3" style="border-color: {$colorStore.primary}20;">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingField label={m.common.label()} id="{uid}-{field.key}-label">
              <input
                id="{uid}-{field.key}-label"
                type="text"
                maxlength="45"
                value={field.label}
                oninput={(e) => patch(field.key, { label: e.currentTarget.value })}
                class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
                style={inputStyle}
              >
            </SettingField>
            <SettingField label={m.tickets.modalPlaceholderName()} id="{uid}-{field.key}-key">
              <input
                id="{uid}-{field.key}-key"
                type="text"
                value={field.key}
                onchange={(e) => {
                  rename(field.key, e.currentTarget.value);
                  e.currentTarget.value = field.key;
                }}
                class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono"
                style={inputStyle}
              >
            </SettingField>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingField label={m.common.style()} id="{uid}-{field.key}-style">
              <DiscordSelector
                id="{uid}-{field.key}-style"
                type="custom"
                options={styleOptions}
                selected={String(field.style)}
                searchable={false}
                clearable={false}
                customIcon="fa-text"
                onchange={(d) => typeof d.selected === "string" && patch(field.key, { style: Number(d.selected) })}
              />
            </SettingField>
            <div class="self-end">
              <ToggleRow colors={$colorStore} checked={field.required} title={m.common.required()} onchange={(on) => patch(field.key, { required: on })} />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <SettingField label={m.common.minLength()} id="{uid}-{field.key}-min">
              <input
                id="{uid}-{field.key}-min"
                type="number"
                min="0"
                max="4000"
                value={field.minLength}
                oninput={(e) => patch(field.key, { minLength: number(e, 0, 0) })}
                class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
                style={inputStyle}
              >
            </SettingField>
            <SettingField label={m.common.maxLength()} id="{uid}-{field.key}-max">
              <input
                id="{uid}-{field.key}-max"
                type="number"
                min="1"
                max="4000"
                value={field.maxLength}
                oninput={(e) => patch(field.key, { maxLength: number(e, 1000, 1) })}
                class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
                style={inputStyle}
              >
            </SettingField>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingField label={m.common.placeholder()} id="{uid}-{field.key}-hint">
              <input
                id="{uid}-{field.key}-hint"
                type="text"
                maxlength="100"
                value={field.placeholder}
                oninput={(e) => patch(field.key, { placeholder: e.currentTarget.value })}
                class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
                style={inputStyle}
              >
            </SettingField>
            <SettingField label={m.tickets.modalDefaultValue()} id="{uid}-{field.key}-value">
              <input
                id="{uid}-{field.key}-value"
                type="text"
                value={field.value}
                oninput={(e) => patch(field.key, { value: e.currentTarget.value })}
                class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
                style={inputStyle}
              >
            </SettingField>
          </div>
        </div>
      {/if}
    </div>
  {/each}

  {#if fields.length < MAX_FIELDS}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto" style={buttonStyle} onclick={add}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.tickets.modalAddField()}
    </button>
  {/if}
</div>
