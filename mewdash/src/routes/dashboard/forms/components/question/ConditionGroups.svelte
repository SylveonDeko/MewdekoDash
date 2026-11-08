<script lang="ts">
  import { m } from "$lib/i18n";
  import { COMMON_PERMISSIONS, CONDITIONAL_OPERATORS, type FormQuestionCondition } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { conditionalOperatorLabel, conditionalTypeLabel, permissionLabel } from "$lib/components/forms/formLabels";
  import NumberField from "../NumberField.svelte";
  import type { Named } from "../formsModel";

  interface Props {
    conditions: FormQuestionCondition[];
    targets: Named[];
    roles: Named[];
    questionId: number;
    onchange: (conditions: FormQuestionCondition[]) => void;
  }

  let { conditions, targets, roles, questionId, onchange }: Props = $props();

  const KINDS = [0, 1, 2, 3, 4];

  const groups = $derived.by(() => {
    const byGroup = new Map<number, FormQuestionCondition[]>();
    for (const condition of conditions) {
      const list = byGroup.get(condition.conditionGroup) ?? [];
      list.push(condition);
      byGroup.set(condition.conditionGroup, list);
    }
    return [...byGroup.entries()].sort((a, b) => a[0] - b[0]).map(([, list]) => list);
  });

  function flatten(next: FormQuestionCondition[][]): FormQuestionCondition[] {
    return next.flatMap((list, index) => list.map((condition) => ({ ...condition, conditionGroup: index })));
  }

  function blank(group: number): FormQuestionCondition {
    return {
      id: 0,
      questionId,
      conditionGroup: group,
      conditionType: 0,
      logicType: "AND",
      createdAt: new Date().toISOString()
    };
  }

  function addGroup() {
    onchange(flatten([...groups, [blank(groups.length)]]));
  }

  function addToGroup(groupIndex: number) {
    onchange(flatten(groups.map((list, index) => (index === groupIndex ? [...list, blank(groupIndex)] : list))));
  }

  function update(groupIndex: number, conditionIndex: number, changes: Partial<FormQuestionCondition>) {
    onchange(
      flatten(
        groups.map((list, index) =>
          index === groupIndex ? list.map((condition, i) => (i === conditionIndex ? { ...condition, ...changes } : condition)) : list
        )
      )
    );
  }

  function changeKind(groupIndex: number, conditionIndex: number, kind: number) {
    update(groupIndex, conditionIndex, {
      conditionType: kind,
      targetQuestionId: undefined,
      targetRoleIds: undefined,
      operator: undefined,
      expectedValue: undefined,
      daysThreshold: undefined,
      requiresBoost: undefined,
      requiresNitro: undefined,
      permissionFlags: undefined
    });
  }

  function remove(groupIndex: number, conditionIndex: number) {
    onchange(
      flatten(
        groups
          .map((list, index) => (index === groupIndex ? list.filter((_, i) => i !== conditionIndex) : list))
          .filter((list) => list.length > 0)
      )
    );
  }

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const buttonStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);
</script>

<div class="space-y-3">
  {#each groups as group, groupIndex (groupIndex)}
    {#if groupIndex > 0}
      <div class="text-center text-xs font-semibold" style="color: {$colorStore.muted}">{m.forms.multiConditionOr()}</div>
    {/if}
    <div class="rounded-xl border p-3 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      {#each group as condition, conditionIndex (conditionIndex)}
        {#if conditionIndex > 0}
          <div class="text-xs font-semibold" style="color: {$colorStore.muted}">{m.forms.multiConditionAnd()}</div>
        {/if}
        <div class="space-y-2">
          <div class="flex gap-2 items-stretch">
            <div class="grow min-w-0">
              <DiscordSelector
                type="custom"
                customIcon="fa-filter"
                searchable={false}
                clearable={false}
                ariaLabel={m.forms.multiConditionTypePlaceholder()}
                options={KINDS.map((kind) => ({ id: String(kind), name: conditionalTypeLabel(kind) }))}
                selected={String(condition.conditionType)}
                onchange={({ selected }) => changeKind(groupIndex, conditionIndex, Number(selected))}
              />
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg min-h-[50px] min-w-[50px]"
              style={buttonStyle}
              aria-label={m.forms.multiConditionDeleteCondition()}
              onclick={() => remove(groupIndex, conditionIndex)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>

          {#if condition.conditionType === 0}
            <DiscordSelector
              type="custom"
              customIcon="fa-question-circle"
              searchable={false}
              ariaLabel={m.forms.multiConditionQuestionPlaceholder()}
              placeholder={m.forms.multiConditionQuestionPlaceholder()}
              options={targets}
              selected={condition.targetQuestionId ? String(condition.targetQuestionId) : null}
              onchange={({ selected }) => update(groupIndex, conditionIndex, { targetQuestionId: selected ? Number(selected) : undefined })}
            />
            <div class="flex gap-2 items-stretch">
              <div class="w-44 shrink-0">
                <DiscordSelector
                  type="custom"
                  customIcon="fa-sliders"
                  searchable={false}
                  clearable={false}
                  ariaLabel={m.forms.multiConditionOperator()}
                  options={CONDITIONAL_OPERATORS.map((op) => ({ id: op.value, name: conditionalOperatorLabel(op.value) }))}
                  selected={condition.operator ?? "equals"}
                  onchange={({ selected }) => update(groupIndex, conditionIndex, { operator: selected as FormQuestionCondition["operator"] })}
                />
              </div>
              <input
                type="text"
                value={condition.expectedValue ?? ""}
                oninput={(e) => update(groupIndex, conditionIndex, { expectedValue: e.currentTarget.value })}
                placeholder={m.forms.multiConditionValuePlaceholder()}
                aria-label={m.forms.conditionalExpectedValue()}
                class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
                style={inputStyle}
              />
            </div>
          {:else if condition.conditionType === 1}
            <DiscordSelector
              type="role"
              multiple
              options={roles}
              ariaLabel={m.forms.multiConditionRolesAny()}
              placeholder={m.forms.multiConditionRolesPlaceholder()}
              selected={condition.targetRoleIds?.split(",").filter((x) => x) ?? []}
              onchange={({ selected }) => update(groupIndex, conditionIndex, { targetRoleIds: ((selected as string[]) ?? []).join(",") })}
            />
          {:else if condition.conditionType === 2}
            <NumberField
              id="condition-days-{groupIndex}-{conditionIndex}"
              label={m.forms.multiConditionMinDays()}
              value={condition.daysThreshold}
              onchange={(value) => update(groupIndex, conditionIndex, { daysThreshold: value ?? undefined })}
            />
          {:else if condition.conditionType === 3}
            <ToggleRow
              colors={$colorStore}
              checked={condition.requiresBoost ?? false}
              title={m.forms.multiConditionRequiresBoost()}
              onchange={(on) => update(groupIndex, conditionIndex, { requiresBoost: on })}
            />
            <ToggleRow
              colors={$colorStore}
              checked={condition.requiresNitro ?? false}
              title={m.forms.multiConditionRequiresNitro()}
              onchange={(on) => update(groupIndex, conditionIndex, { requiresNitro: on })}
            />
          {:else if condition.conditionType === 4}
            <DiscordSelector
              type="custom"
              customIcon="fa-lock"
              searchable={false}
              ariaLabel={m.forms.multiConditionPermissionPlaceholder()}
              placeholder={m.forms.multiConditionPermissionPlaceholder()}
              options={COMMON_PERMISSIONS.map((p) => ({ id: String(p.value), name: permissionLabel(p.flag) }))}
              selected={condition.permissionFlags ? String(condition.permissionFlags) : null}
              onchange={({ selected }) => update(groupIndex, conditionIndex, { permissionFlags: selected ? Number(selected) : undefined })}
            />
          {/if}
        </div>
      {/each}
      <button type="button" class="w-full rounded-lg min-h-[44px] text-sm font-medium" style={buttonStyle} onclick={() => addToGroup(groupIndex)}>
        <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{@html m.forms.multiConditionAddAnd()}
      </button>
    </div>
  {/each}

  <button type="button" class="w-full rounded-lg min-h-[50px] font-medium" style={buttonStyle} onclick={addGroup}>
    <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>
    {@html groups.length === 0 ? m.forms.multiConditionAddCondition() : m.forms.multiConditionAddOr()}
  </button>
</div>
