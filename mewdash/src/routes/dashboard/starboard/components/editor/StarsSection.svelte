<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import { AutoReact, splitIds, type Named, type SectionProps } from "../starboardModel";

  interface Props extends SectionProps {
    roles: Named[];
    setIds: (kind: "allowedRole" | "deniedRole", ids: string[]) => void;
  }

  let { starboard, change, roles, setIds }: Props = $props();

  const autoReactOptions = $derived([
    { id: String(AutoReact.None), name: m.starboard.autoReactNone() },
    { id: String(AutoReact.First), name: m.starboard.autoReactFirst() },
    { id: String(AutoReact.All), name: m.starboard.autoReactAll() }
  ]);

  const count = $derived(
    [
      starboard.allowBots,
      !starboard.allowSelfStar,
      starboard.countMultipleReactions,
      starboard.removeInvalidStars,
      starboard.autoReact !== AutoReact.None,
      !!starboard.allowedRoles,
      !!starboard.deniedRoles
    ].filter(Boolean).length
  );

  let open = $state(false);

  function list(selected: string | string[] | null): string[] {
    return Array.isArray(selected) ? selected : [];
  }
</script>

<EditorGroup title={m.starboard.groupStars()} {count} bind:open>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <ToggleRow colors={$colorStore} checked={starboard.allowBots} title={m.starboard.allowBots()} onchange={(v) => change({ allowBots: v })} />
    <ToggleRow colors={$colorStore} checked={starboard.allowSelfStar} title={m.starboard.allowSelfStar()} onchange={(v) => change({ allowSelfStar: v })} />
    <ToggleRow colors={$colorStore} checked={starboard.countMultipleReactions} title={m.starboard.countMultiple()} onchange={(v) => change({ countMultipleReactions: v })} />
    <ToggleRow colors={$colorStore} checked={starboard.removeInvalidStars} title={m.starboard.removeInvalidStars()} onchange={(v) => change({ removeInvalidStars: v })} />
  </div>

  <SettingField label={m.starboard.autoReact()} id="sb-auto-react">
    <DiscordSelector
      id="sb-auto-react"
      type="custom"
      options={autoReactOptions}
      selected={String(starboard.autoReact)}
      searchable={false}
      clearable={false}
      customIcon="fa-star"
      onchange={(detail) => typeof detail.selected === "string" && change({ autoReact: Number(detail.selected) })}
    />
  </SettingField>

  <SettingField label={m.starboard.allowedRoles()} id="sb-allowed-roles">
    <DiscordSelector
      id="sb-allowed-roles"
      type="role"
      multiple={true}
      options={roles}
      selected={splitIds(starboard.allowedRoles)}
      placeholder={m.starboard.allowedRolesPlaceholder()}
      onchange={(detail) => setIds("allowedRole", list(detail.selected))}
    />
  </SettingField>

  <SettingField label={m.starboard.deniedRoles()} id="sb-denied-roles">
    <DiscordSelector
      id="sb-denied-roles"
      type="role"
      multiple={true}
      options={roles}
      selected={splitIds(starboard.deniedRoles)}
      placeholder={m.starboard.deniedRolesPlaceholder()}
      onchange={(detail) => setIds("deniedRole", list(detail.selected))}
    />
  </SettingField>
</EditorGroup>
