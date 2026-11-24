<!-- lib/components/wiki/WikiIconSelect.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { wikiIconClass } from "$lib/wiki";
  import iconData from "../../../../fa-utility-duo-icons.json";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  interface Props {
    icon: string;
    label?: string;
    idPrefix: string;
  }

  let { icon = $bindable(), label, idPrefix }: Props = $props();

  const iconOptions = $derived.by(() => {
    const options = (iconData.icons as string[]).map((name) => ({ id: `fa-${name}`, name }));
    if (icon && !options.some((option) => option.id === icon)) {
      options.unshift({ id: icon, name: icon.replace(/^fa-brands /, "").replace(/^fa-/, "") });
    }
    return options;
  });
</script>

<div>
  <span id="{idPrefix}-icon-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{label ?? m.wikiManage.fieldIcon()}</span>
  <div class="flex items-center gap-3">
    <div class="shrink-0 w-[50px] h-[50px] flex items-center justify-center rounded-lg" style="background: {$colorStore.primary}15;">
      <i class="{wikiIconClass(icon)} text-xl"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};" aria-hidden="true"></i>
    </div>
    <div class="min-w-0 grow">
      <DiscordSelector
        type="custom"
        options={iconOptions}
        selected={icon}
        clearable={false}
        ariaLabelledby="{idPrefix}-icon-label"
        onchange={(e) => { icon = typeof e.selected === "string" ? e.selected : icon; }}
      />
    </div>
  </div>
</div>
