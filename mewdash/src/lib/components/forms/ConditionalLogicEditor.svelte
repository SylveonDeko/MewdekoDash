<script lang="ts">
  import {
    CONDITIONAL_TYPES,
    CONDITIONAL_OPERATORS,
    ROLE_LOGIC_TYPES,
    COMMON_PERMISSIONS,
    type FormQuestion,
    type ConditionalType,
    type RoleLogicType,
    type FormQuestionCondition
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { slide } from "svelte/transition";
  import DiscordSelector from "./DiscordSelector.svelte";
  import MultiConditionEditor from "./MultiConditionEditor.svelte";

  interface Props {
    question: Partial<FormQuestion>;
    questionIndex: number;
    allQuestions: Partial<FormQuestion>[];
    roles: Array<{ id: string; name: string }>;
    onUpdate: (updates: Partial<FormQuestion>) => void;
  }

  let { question, questionIndex, allQuestions, roles, onUpdate }: Props = $props();

  let conditionalType = $state(question.conditionalType || 0);
  let multiConditionEditorRef: any = $state(null);

  // Expose method for parent to call when saving
  export async function saveMultiConditions() {
    if (multiConditionEditorRef && conditionalType === 5) {
      return await multiConditionEditorRef.saveConditions();
    }
    return [];
  }

  // Helper to get conditional type metadata
  function getConditionalTypeData(value: number) {
    return CONDITIONAL_TYPES.find(t => t.value === value);
  }

  // Update question when conditional type changes
  function handleConditionalTypeChange(newType: number) {
    conditionalType = newType;

    // Clear incompatible settings when switching types
    const updates: Partial<FormQuestion> = {
      conditionalType: newType
    };

    // Clear all conditional fields
    if (newType === 0) {
      // QuestionBased - keep legacy fields
    } else {
      // Clear legacy fields when using new types
      updates.conditionalParentQuestionId = undefined;
      updates.conditionalOperator = undefined;
      updates.conditionalExpectedValue = undefined;
    }

    if (newType !== 1) {
      // Not DiscordRole
      updates.conditionalRoleIds = undefined;
      updates.conditionalRoleLogic = undefined;
    }

    if (newType !== 2) {
      // Not ServerTenure
      updates.conditionalDaysInServer = undefined;
      updates.conditionalAccountAgeDays = undefined;
    }

    if (newType !== 3) {
      // Not BoostStatus
      updates.conditionalRequiresBoost = undefined;
      updates.conditionalRequiresNitro = undefined;
    }

    if (newType !== 4) {
      // Not Permission
      updates.conditionalPermissionFlags = undefined;
    }

    onUpdate(updates);
  }
</script>

<div class="space-y-4">
  <!-- Conditional Type Selector -->
  <div>
    <span class="block text-sm mb-2 font-medium" style="color: {$colorStore.muted};">
      <i class="fa-solid fa-code-branch mr-1"></i>
      Conditional Logic (Optional)
    </span>
    <p class="text-xs mb-3" style="color: {$colorStore.muted};">
      Control when this question appears to users
    </p>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
      {#each CONDITIONAL_TYPES as condType}
        <button
          type="button"
          onclick={() => handleConditionalTypeChange(condType.value)}
          class="p-3 rounded-lg border transition-all text-left"
          style="background: {conditionalType === condType.value ? `linear-gradient(135deg, ${$colorStore.primary}20, ${$colorStore.secondary}15)` : $colorStore.primary + '08'};
                 border-color: {conditionalType === condType.value ? $colorStore.primary : $colorStore.primary + '20'};"
        >
          <div class="flex items-start gap-2">
            <i class="fa-solid {condType.icon} flex-shrink-0 mt-0.5"
               style="color: {conditionalType === condType.value ? $colorStore.primary : $colorStore.muted}; font-size: 16px;"></i>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm mb-0.5" style="color: {$colorStore.text};">
                {condType.label}
              </div>
              <div class="text-xs" style="color: {$colorStore.muted};">
                {condType.description}
              </div>
            </div>
            {#if conditionalType === condType.value}
              <i class="fa-solid fa-check-circle flex-shrink-0" style="color: {$colorStore.primary};"></i>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Question-Based Conditional -->
  {#if conditionalType === 0}
    <div class="p-4 rounded-lg border space-y-3"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
         transition:slide>
      <!-- Parent Question -->
      <div>
        <span class="block text-xs mb-1" style="color: {$colorStore.muted};">
          Show when question:
        </span>
        <DiscordSelector
          type="custom"
          options={[
            { id: "", name: "Always show (no condition)" },
            ...allQuestions.slice(0, questionIndex)
              .filter(q => q.questionText)
              .map((q, i) => ({
                id: String(q.id),
                name: `Q${i + 1}: ${q.questionText?.slice(0, 50)}`
              }))
          ]}
          selected={question.conditionalParentQuestionId ? String(question.conditionalParentQuestionId) : ""}
          placeholder="Select parent question"
          onchange={(e) => onUpdate({
            conditionalParentQuestionId: e.selected ? parseInt(e.selected as string) : undefined
          })}
          searchable={false}
        />
      </div>

      {#if question.conditionalParentQuestionId}
        <!-- Operator -->
        <div>
          <span class="block text-xs mb-1" style="color: {$colorStore.muted};">Operator:</span>
          <DiscordSelector
            type="custom"
            options={CONDITIONAL_OPERATORS.map(op => ({ id: op.value, name: op.label }))}
            selected={question.conditionalOperator || "equals"}
            placeholder="Select operator"
            onchange={(e) => onUpdate({ conditionalOperator: e.selected as any })}
            searchable={false}
          />
        </div>

        <!-- Expected Value -->
        <div>
          <span class="block text-xs mb-1" style="color: {$colorStore.muted};">Expected value:</span>
          <input
            type="text"
            value={question.conditionalExpectedValue || ""}
            oninput={(e) => onUpdate({ conditionalExpectedValue: e.currentTarget.value })}
            placeholder="Enter expected value..."
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
          />
        </div>
      {/if}
    </div>
  {/if}

  <!-- Discord Role-Based Conditional -->
  {#if conditionalType === 1}
    <div class="p-4 rounded-lg border space-y-3"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
         transition:slide>
      <!-- Role Logic Type -->
      <div>
        <span class="block text-xs mb-1" style="color: {$colorStore.muted};">User must have:</span>
        <DiscordSelector
          type="custom"
          options={ROLE_LOGIC_TYPES.map(t => ({ id: t.value, name: `${t.label} - ${t.description}` }))}
          selected={question.conditionalRoleLogic || "any"}
          placeholder="Select logic type"
          onchange={(e) => onUpdate({ conditionalRoleLogic: e.selected as RoleLogicType })}
          searchable={false}
        />
      </div>

      <!-- Roles -->
      <div>
        <span class="block text-xs mb-1" style="color: {$colorStore.muted};">Roles:</span>
        <DiscordSelector
          type="role"
          options={roles}
          selected={question.conditionalRoleIds?.split(",").filter(x => x) || []}
          placeholder="Select roles..."
          multiple
          onchange={(e) => onUpdate({ conditionalRoleIds: (e.selected as string[]).join(",") })}
        />
      </div>
    </div>
  {/if}

  <!-- Server Tenure Conditional -->
  {#if conditionalType === 2}
    <div class="p-4 rounded-lg border space-y-3"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
         transition:slide>
      <div class="grid grid-cols-2 gap-3">
        <!-- Days in Server -->
        <div>
          <span class="block text-xs mb-1" style="color: {$colorStore.muted};">
            <i class="fa-solid fa-calendar mr-1"></i>
            Min days in server:
          </span>
          <input
            type="number"
            value={question.conditionalDaysInServer ?? ""}
            oninput={(e) => onUpdate({ conditionalDaysInServer: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
            min="0"
            placeholder="e.g., 30"
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
          />
        </div>

        <!-- Account Age -->
        <div>
          <span class="block text-xs mb-1" style="color: {$colorStore.muted};">
            <i class="fa-solid fa-user-clock mr-1"></i>
            Min account age (days):
          </span>
          <input
            type="number"
            value={question.conditionalAccountAgeDays ?? ""}
            oninput={(e) => onUpdate({ conditionalAccountAgeDays: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
            min="0"
            placeholder="e.g., 180"
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
          />
        </div>
      </div>
    </div>
  {/if}

  <!-- Boost/Nitro Status Conditional -->
  {#if conditionalType === 3}
    <div class="p-4 rounded-lg border space-y-3"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
         transition:slide>
      <!-- Requires Boost -->
      <div class="flex items-center justify-between p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
        <div class="text-sm" style="color: {$colorStore.text};">
          <i class="fa-solid fa-arrow-up mr-1.5" style="color: #f47fff;"></i>
          User must be boosting server
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            class="sr-only peer"
            checked={question.conditionalRequiresBoost || false}
            onchange={(e) => onUpdate({ conditionalRequiresBoost: e.currentTarget.checked })}
          />
          <span
            class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block"
            style:background-color={question.conditionalRequiresBoost ? "#f47fff" : "#4b5563"}
          ></span>
        </label>
      </div>

      <!-- Requires Nitro -->
      <div class="flex items-center justify-between p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
        <div class="text-sm" style="color: {$colorStore.text};">
          <i class="fa-brands fa-discord mr-1.5" style="color: #5865f2;"></i>
          User must have Discord Nitro
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            class="sr-only peer"
            checked={question.conditionalRequiresNitro || false}
            onchange={(e) => onUpdate({ conditionalRequiresNitro: e.currentTarget.checked })}
          />
          <span
            class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block"
            style:background-color={question.conditionalRequiresNitro ? "#5865f2" : "#4b5563"}
          ></span>
        </label>
      </div>
    </div>
  {/if}

  <!-- Permission-Based Conditional -->
  {#if conditionalType === 4}
    <div class="p-4 rounded-lg border space-y-3"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
         transition:slide>
      <span class="block text-xs mb-1" style="color: {$colorStore.muted};">
        User must have permission:
      </span>
      <DiscordSelector
        type="custom"
        options={COMMON_PERMISSIONS.map(p => ({ id: String(p.value), name: p.label }))}
        selected={question.conditionalPermissionFlags ? String(question.conditionalPermissionFlags) : ""}
        placeholder="Select required permission..."
        onchange={(e) => onUpdate({ conditionalPermissionFlags: e.selected ? parseInt(e.selected as string) : undefined })}
        searchable={false}
      />
      <p class="text-xs" style="color: {$colorStore.muted};">
        Question will only show to users with this permission
      </p>
    </div>
  {/if}

  <!-- Multiple Conditions Editor -->
  {#if conditionalType === 5}
    {#if question.id && question.id > 0}
      <!-- Real question ID - show full editor -->
      <div class="p-4 rounded-lg border space-y-3"
           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
           transition:slide>
        <div class="flex items-center gap-2 mb-2">
          <i class="fa-solid fa-code-branch" style="color: {$colorStore.accent}; font-size: 16px;"></i>
          <span class="font-semibold text-sm" style="color: {$colorStore.text};">
            Advanced: Multiple Conditions with AND/OR Logic
          </span>
        </div>

        <MultiConditionEditor
          bind:this={multiConditionEditorRef}
          questionId={question.id}
          questionIndex={questionIndex}
          allQuestions={allQuestions}
          roles={roles}
          existingConditions={question.conditions || []}
          onConditionsChange={() => {
            // Conditions are saved automatically by the editor
          }}
        />
      </div>
    {:else}
      <!-- New question (no ID yet) - show notice -->
      <div class="p-4 rounded-lg border"
           style="background: #f59e0b10; border-color: #f59e0b30;"
           transition:slide>
        <div class="flex items-start gap-2">
          <i class="fa-solid fa-info-circle flex-shrink-0 mt-0.5" style="color: #f59e0b;"></i>
          <div class="text-sm" style="color: {$colorStore.text};">
            <strong>Multiple Conditions:</strong> This advanced feature is only available when editing existing forms.
            Save the form first, then edit the question to add multiple conditions with AND/OR logic.
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <!-- Conditional Required Section -->
  <div class="border-t pt-4" style="border-color: {$colorStore.primary}20;">
    <div class="flex items-center gap-2 mb-3">
      <i class="fa-solid fa-asterisk" style="color: #ef4444; font-size: 10px;"></i>
      <span class="text-sm font-medium" style="color: {$colorStore.text};">
        Conditional Required
      </span>
    </div>
    <p class="text-xs mb-3" style="color: {$colorStore.muted};">
      Make this question required only when a condition is met
    </p>

    <!-- Required When Parent Question -->
    <div class="space-y-3">
      <div>
        <span class="block text-xs mb-1" style="color: {$colorStore.muted};">
          Required when question:
        </span>
        <DiscordSelector
          onchange={(e) => onUpdate({
            requiredWhenParentQuestionId: e.selected ? parseInt(e.selected as string) : undefined
          })}
          options={[
            { id: "", name: "Not conditionally required" },
            ...allQuestions.slice(0, questionIndex)
              .filter(q => q.questionText)
              .map((q, i) => ({
                id: String(q.id),
                name: `Q${i + 1}: ${q.questionText?.slice(0, 50)}`
              }))
          ]}
          placeholder="Select question"
          searchable={false}
          selected={question.requiredWhenParentQuestionId ? String(question.requiredWhenParentQuestionId) : ""}
          type="custom"
        />
      </div>

      {#if question.requiredWhenParentQuestionId}
        <!-- Operator -->
        <div>
          <span class="block text-xs mb-1" style="color: {$colorStore.muted};">Operator:</span>
          <DiscordSelector
            type="custom"
            options={CONDITIONAL_OPERATORS.map(op => ({ id: op.value, name: op.label }))}
            selected={question.requiredWhenOperator || "equals"}
            placeholder="Select operator"
            onchange={(e) => onUpdate({ requiredWhenOperator: e.selected as any })}
            searchable={false}
          />
        </div>

        <!-- Expected Value -->
        <div>
          <span class="block text-xs mb-1" style="color: {$colorStore.muted};">Expected value:</span>
          <input
            type="text"
            value={question.requiredWhenValue || ""}
            oninput={(e) => onUpdate({ requiredWhenValue: e.currentTarget.value })}
            placeholder="Enter expected value..."
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
          />
        </div>
      {/if}
    </div>
  </div>

  <!-- Answer Piping Toggle -->
  <div class="border-t pt-4" style="border-color: {$colorStore.primary}20;">
    <div class="flex items-center justify-between p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
      <div>
        <div class="text-sm font-medium mb-0.5" style="color: {$colorStore.text};">
          <i class="fa-solid fa-arrows-left-right mr-1.5" style="color: {$colorStore.accent};"></i>
          Answer Piping
        </div>
        <div class="text-xs" style="color: {$colorStore.muted};">
          Use &#123;&#123;Q1&#125;&#125;, &#123;&#123;Q2&#125;&#125;, etc. in question text to insert previous answers
        </div>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          checked={question.enableAnswerPiping || false}
          class="sr-only peer"
          onchange={(e) => onUpdate({ enableAnswerPiping: e.currentTarget.checked })}
          type="checkbox"
        />
        <span
          class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block"
          style:background-color={question.enableAnswerPiping ? $colorStore.accent : "#4b5563"}
        ></span>
      </label>
    </div>

    {#if question.enableAnswerPiping}
      <div class="mt-2 p-2 rounded text-xs" style="background: {$colorStore.accent}10; color: {$colorStore.muted};">
        <strong>Example:</strong> "Thanks &#123;&#123;Q1&#125;&#125;, what's your &#123;&#123;Q2&#125;&#125; experience
        level?"
      </div>
    {/if}
  </div>
</div>
