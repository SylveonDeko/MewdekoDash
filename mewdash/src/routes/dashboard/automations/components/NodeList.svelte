<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { m } from "$lib/i18n";
  import type { AutomationNode, AutomationNodeSpec } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import NodeFields from "./NodeFields.svelte";
  import { availableFor, defaultNode, label, type EditorContext } from "./automationsModel";

  interface Props {
    kind: "condition" | "action";
    specs: AutomationNodeSpec[];
    trigger: string;
    nodes: AutomationNode[];
    ctx: EditorContext;
    user?: DiscordUser | null;
    onchange: () => void;
  }

  let { kind, specs, trigger, nodes, ctx, user = null, onchange }: Props = $props();

  const closed = new SvelteSet<AutomationNode>();
  let pickerKey = $state(0);

  const options = $derived(
    availableFor(specs, trigger).map((x) => ({ id: x.type, name: label(`${kind}${x.type}`, x.name) }))
  );
  const quietStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function nameOf(node: AutomationNode): string {
    const spec = specs.find((x) => x.type === node.type);
    return label(`${kind}${node.type}`, spec?.name ?? node.type);
  }

  function add(detail: { selected: string | string[] | null }) {
    const spec = specs.find((x) => x.type === detail.selected);
    pickerKey++;
    if (!spec) return;
    nodes.push(defaultNode(spec));
    onchange();
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= nodes.length) return;
    const [node] = nodes.splice(index, 1);
    nodes.splice(target, 0, node);
    onchange();
  }

  function remove(index: number) {
    nodes.splice(index, 1);
    onchange();
  }

  function toggle(node: AutomationNode) {
    if (closed.has(node)) closed.delete(node);
    else closed.add(node);
  }
</script>

<div class="space-y-3 min-w-0">
  {#each nodes as node, index (node)}
    {@const spec = specs.find((x) => x.type === node.type)}
    {@const isOpen = !closed.has(node)}
    <div class="rounded-xl border min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <div class="flex items-center gap-1 p-2">
        <button
          type="button"
          class="grow min-w-0 flex items-center gap-3 text-left min-h-[44px] px-2"
          aria-expanded={isOpen}
          onclick={() => toggle(node)}
        >
          <span class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                style="background: {$colorStore.primary}20; color: {$colorStore.text};">{index + 1}</span>
          <span class="grow min-w-0 text-sm font-semibold truncate" style="color: {$colorStore.text}">{nameOf(node)}</span>
          <i class="fa-solid {isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs" style="color: {$colorStore.muted}" aria-hidden="true"></i>
        </button>
        {#if kind === "action"}
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40"
            style={quietStyle}
            aria-label={m.common.moveUp()}
            disabled={index === 0}
            onclick={() => move(index, -1)}
          >
            <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40"
            style={quietStyle}
            aria-label={m.common.moveDown()}
            disabled={index === nodes.length - 1}
            onclick={() => move(index, 1)}
          >
            <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
          </button>
        {/if}
        <button
          type="button"
          class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
          style={quietStyle}
          aria-label={m.automations.removeNodeAria({ name: nameOf(node) })}
          onclick={() => remove(index)}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
      {#if isOpen && spec}
        <div class="px-3 pb-3 space-y-3 min-w-0">
          <p class="text-xs" style="color: {$colorStore.muted}">{spec.description}</p>
          <NodeFields {spec} {node} {ctx} {user} {onchange} />
        </div>
      {/if}
    </div>
  {/each}

  {#key pickerKey}
    <DiscordSelector
      type="custom"
      customIcon="fa-plus-circle"
      {options}
      selected={null}
      clearable={false}
      placeholder={kind === "condition" ? m.automations.addCondition() : m.automations.addAction()}
      ariaLabel={kind === "condition" ? m.automations.addCondition() : m.automations.addAction()}
      onchange={add}
    />
  {/key}
</div>
