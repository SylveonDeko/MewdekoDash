<script lang="ts">
  import { m } from "$lib/i18n";
  import {
    COMMON_PERMISSIONS,
    CONDITIONAL_OPERATORS,
    CONDITIONAL_TYPES,
    ROLE_LOGIC_TYPES,
    type FormQuestion,
    type RoleLogicType
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import {
    conditionalOperatorLabel,
    conditionalTypeLabel,
    permissionLabel,
    roleLogicDescription,
    roleLogicLabel
  } from "$lib/components/forms/formLabels";
  import NumberField from "../NumberField.svelte";
  import ConditionGroups from "./ConditionGroups.svelte";
  import type { Named } from "../formsModel";

  interface Props {
    question: FormQuestion;
    targets: Named[];
    roles: Named[];
    hasUnsavedTargets: boolean;
    onupdate: (changes: Partial<FormQuestion>) => void;
  }

  let { question, targets, roles, hasUnsavedTargets, onupdate }: Props = $props();

  const kind = $derived(question.conditionalType || 0);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);

  const operatorOptions = $derived(CONDITIONAL_OPERATORS.map((op) => ({ id: op.value, name: conditionalOperatorLabel(op.value) })));
  const targetOptions = $derived([{ id: "", name: m.forms.conditionalAlwaysShow() }, ...targets]);
  const requiredOptions = $derived([{ id: "", name: m.forms.conditionalNotRequired() }, ...targets]);

  function changeKind(next: number) {
    onupdate({
      conditionalType: next,
      conditionalParentQuestionId: undefined,
      conditionalOperator: undefined,
      conditionalExpectedValue: undefined,
      conditionalRoleIds: undefined,
      conditionalRoleLogic: undefined,
      conditionalDaysInServer: undefined,
      conditionalAccountAgeDays: undefined,
      conditionalRequiresBoost: undefined,
      conditionalRequiresNitro: undefined,
      conditionalPermissionFlags: undefined
    });
  }
</script>

<div class="space-y-4">
  <SettingField label={m.forms.conditionalTitle()} id="question-condition-kind">
    <DiscordSelector
      id="question-condition-kind"
      type="custom"
      customIcon="fa-filter"
      searchable={false}
      clearable={false}
      options={CONDITIONAL_TYPES.map((t) => ({ id: String(t.value), name: conditionalTypeLabel(t.value) }))}
      selected={String(kind)}
      onchange={({ selected }) => changeKind(Number(selected))}
    />
  </SettingField>

  {#if hasUnsavedTargets && (kind === 0 || kind === 5)}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.conditionSaveFirst()}</p>
  {/if}

  {#if kind === 0}
    <div class="space-y-3">
      <DiscordSelector
        type="custom"
        customIcon="fa-question-circle"
        searchable={false}
        ariaLabel={m.forms.conditionalShowWhen()}
        placeholder={m.forms.conditionalSelectParent()}
        options={targetOptions}
        selected={question.conditionalParentQuestionId ? String(question.conditionalParentQuestionId) : ""}
        onchange={({ selected }) => onupdate({ conditionalParentQuestionId: selected ? Number(selected) : undefined })}
      />
      {#if question.conditionalParentQuestionId}
        <div class="flex gap-2 items-stretch">
          <div class="w-44 shrink-0">
            <DiscordSelector
              type="custom"
              customIcon="fa-sliders"
              searchable={false}
              clearable={false}
              ariaLabel={m.forms.conditionalOperator()}
              options={operatorOptions}
              selected={question.conditionalOperator ?? "equals"}
              onchange={({ selected }) => onupdate({ conditionalOperator: selected as FormQuestion["conditionalOperator"] })}
            />
          </div>
          <input
            type="text"
            value={question.conditionalExpectedValue ?? ""}
            oninput={(e) => onupdate({ conditionalExpectedValue: e.currentTarget.value })}
            placeholder={m.forms.conditionalExpectedValuePlaceholder()}
            aria-label={m.forms.conditionalExpectedValue()}
            class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
            style={inputStyle}
          />
        </div>
      {/if}
    </div>
  {:else if kind === 1}
    <div class="space-y-3">
      <DiscordSelector
        type="custom"
        customIcon="fa-users"
        searchable={false}
        clearable={false}
        ariaLabel={m.forms.conditionalUserMustHave()}
        options={ROLE_LOGIC_TYPES.map((t) => ({ id: t.value, name: `${roleLogicLabel(t.value)}: ${roleLogicDescription(t.value)}` }))}
        selected={question.conditionalRoleLogic ?? "any"}
        onchange={({ selected }) => onupdate({ conditionalRoleLogic: selected as RoleLogicType })}
      />
      <DiscordSelector
        type="role"
        multiple
        options={roles}
        ariaLabel={m.forms.conditionalRoles()}
        placeholder={m.common.selectRolesPlaceholder()}
        selected={question.conditionalRoleIds?.split(",").filter((x) => x) ?? []}
        onchange={({ selected }) => onupdate({ conditionalRoleIds: ((selected as string[]) ?? []).join(",") })}
      />
    </div>
  {:else if kind === 2}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <NumberField
        id="question-days-in-server"
        label={m.forms.conditionalMinDays()}
        value={question.conditionalDaysInServer}
        onchange={(value) => onupdate({ conditionalDaysInServer: value ?? undefined })}
      />
      <NumberField
        id="question-account-age"
        label={m.forms.conditionalMinAccountAge()}
        value={question.conditionalAccountAgeDays}
        onchange={(value) => onupdate({ conditionalAccountAgeDays: value ?? undefined })}
      />
    </div>
  {:else if kind === 3}
    <ToggleRow colors={$colorStore} checked={question.conditionalRequiresBoost ?? false} title={m.forms.conditionalMustBoost()} onchange={(on) => onupdate({ conditionalRequiresBoost: on })} />
    <ToggleRow colors={$colorStore} checked={question.conditionalRequiresNitro ?? false} title={m.forms.conditionalMustNitro()} onchange={(on) => onupdate({ conditionalRequiresNitro: on })} />
  {:else if kind === 4}
    <DiscordSelector
      type="custom"
      customIcon="fa-lock"
      searchable={false}
      ariaLabel={m.forms.conditionalMustPermission()}
      placeholder={m.common.selectRequiredPermissionPlaceholder()}
      options={COMMON_PERMISSIONS.map((p) => ({ id: String(p.value), name: permissionLabel(p.flag) }))}
      selected={question.conditionalPermissionFlags ? String(question.conditionalPermissionFlags) : null}
      onchange={({ selected }) => onupdate({ conditionalPermissionFlags: selected ? Number(selected) : undefined })}
    />
  {:else if kind === 5}
    <ConditionGroups
      conditions={question.conditions ?? []}
      {targets}
      {roles}
      questionId={question.id}
      onchange={(conditions) => onupdate({ conditions })}
    />
  {/if}

  <div class="space-y-3 pt-2 border-t" style="border-color: {$colorStore.primary}20;">
    <SettingField label={m.forms.conditionalRequiredTitle()} id="question-required-when">
      <DiscordSelector
        id="question-required-when"
        type="custom"
        customIcon="fa-question-circle"
        searchable={false}
        placeholder={m.forms.conditionalSelectQuestion()}
        options={requiredOptions}
        selected={question.requiredWhenParentQuestionId ? String(question.requiredWhenParentQuestionId) : ""}
        onchange={({ selected }) => onupdate({ requiredWhenParentQuestionId: selected ? Number(selected) : undefined })}
      />
    </SettingField>
    {#if question.requiredWhenParentQuestionId}
      <div class="flex gap-2 items-stretch">
        <div class="w-44 shrink-0">
          <DiscordSelector
            type="custom"
            customIcon="fa-sliders"
            searchable={false}
            clearable={false}
            ariaLabel={m.forms.conditionalOperator()}
            options={operatorOptions}
            selected={question.requiredWhenOperator ?? "equals"}
            onchange={({ selected }) => onupdate({ requiredWhenOperator: selected as FormQuestion["requiredWhenOperator"] })}
          />
        </div>
        <input
          type="text"
          value={question.requiredWhenValue ?? ""}
          oninput={(e) => onupdate({ requiredWhenValue: e.currentTarget.value })}
          placeholder={m.forms.conditionalExpectedValuePlaceholder()}
          aria-label={m.forms.conditionalExpectedValue()}
          class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
          style={inputStyle}
        />
      </div>
    {/if}
  </div>

  <ToggleRow
    colors={$colorStore}
    checked={question.enableAnswerPiping}
    title={m.forms.conditionalPipingTitle()}
    subtitle={m.forms.conditionalPipingHint({ first: "{{Q1}}", second: "{{Q2}}" })}
    onchange={(on) => onupdate({ enableAnswerPiping: on })}
  />
</div>
