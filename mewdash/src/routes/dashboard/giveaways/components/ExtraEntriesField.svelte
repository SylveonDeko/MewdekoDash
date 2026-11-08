<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import type { ExtraEntry } from "./giveawayModel";

  interface Props {
    entries: ExtraEntry[];
    roles: Array<{ id: string; name: string; color?: number }>;
    idPrefix: string;
    onchange: (entries: ExtraEntry[], typing?: boolean) => void;
  }

  let { entries, roles, idPrefix, onchange }: Props = $props();

  const available = $derived(roles.filter(role => !entries.some(entry => entry.roleId === role.id)));

  function nameOf(roleId: string): string {
    return roles.find(role => role.id === roleId)?.name ?? roleId;
  }

  function add(roleId: string) {
    onchange([...entries, { roleId, extra: 1 }]);
  }

  function setExtra(roleId: string, raw: string) {
    const extra = Math.floor(Number(raw));
    if (!Number.isFinite(extra) || extra < 1) return;
    onchange(entries.map(entry => (entry.roleId === roleId ? { ...entry, extra } : entry)), true);
  }

  function remove(roleId: string) {
    onchange(entries.filter(entry => entry.roleId !== roleId));
  }
</script>

<div class="space-y-3">
  <SettingField label={m.giveaways.extraEntriesLabel()} id="{idPrefix}-extra-role">
    {#key entries.length}
      <DiscordSelector
        id="{idPrefix}-extra-role"
        type="role"
        options={available}
        selected={null}
        placeholder={m.giveaways.extraEntriesPlaceholder()}
        onchange={(detail) => typeof detail.selected === "string" && add(detail.selected)}
      />
    {/key}
  </SettingField>

  {#each entries as entry (entry.roleId)}
    <div class="flex items-center gap-2 rounded-xl border p-2" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <span class="grow min-w-0 truncate text-sm px-2" style="color: {$colorStore.text}">{nameOf(entry.roleId)}</span>
      <label class="flex items-center gap-2 shrink-0 text-sm" style="color: {$colorStore.muted}">
        +
        <input
          type="number"
          min="1"
          value={entry.extra}
          aria-label={m.giveaways.extraEntriesAria({ name: nameOf(entry.roleId) })}
          oninput={(e) => setExtra(entry.roleId, e.currentTarget.value)}
          class="w-20 p-2 rounded-lg border focus:ring-2 min-h-[44px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
      </label>
      <button
        type="button"
        class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        aria-label={m.common.ariaRemoveNamed({ name: nameOf(entry.roleId) })}
        onclick={() => remove(entry.roleId)}
      >
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </div>
  {/each}
</div>
