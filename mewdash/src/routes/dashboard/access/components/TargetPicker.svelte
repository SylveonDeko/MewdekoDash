<script lang="ts">
  import { m } from "$lib/i18n";
  import { DashboardAccessTargetType } from "$lib/api/dashboardaccess/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import type { Named } from "./accessModel";

  interface Props {
    targetType: DashboardAccessTargetType;
    targetId: string | null;
    roles: Named[];
    members: Named[];
    disabled?: boolean;
  }

  let { targetType = $bindable(), targetId = $bindable(), roles, members, disabled = false }: Props = $props();

  const typeOptions = $derived([
    { id: String(DashboardAccessTargetType.User), name: m.common.user() },
    { id: String(DashboardAccessTargetType.Role), name: m.common.role() }
  ]);
  const isRole = $derived(targetType === DashboardAccessTargetType.Role);
</script>

<div class="flex flex-col sm:flex-row gap-3">
  <div class="w-full sm:w-44 shrink-0">
    <DiscordSelector
      type="custom"
      options={typeOptions}
      selected={String(targetType)}
      searchable={false}
      clearable={false}
      customIcon="fa-user"
      {disabled}
      ariaLabel={m.access.targetTypePlaceholder()}
      onchange={({ selected }) => {
        targetType = Number(selected) as DashboardAccessTargetType;
        targetId = null;
      }}
    />
  </div>
  <div class="grow min-w-0">
    <DiscordSelector
      type={isRole ? "role" : "user"}
      options={isRole ? roles : members}
      selected={targetId}
      {disabled}
      placeholder={isRole ? m.common.selectARolePlaceholder() : m.common.selectUserPlaceholder()}
      ariaLabel={isRole ? m.common.role() : m.common.user()}
      onchange={({ selected }) => (targetId = (selected as string | null) ?? null)}
    />
  </div>
</div>
