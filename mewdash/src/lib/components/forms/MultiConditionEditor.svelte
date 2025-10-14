<script lang="ts">
  import {
    CONDITIONAL_TYPES,
    CONDITIONAL_OPERATORS,
    ROLE_LOGIC_TYPES,
    COMMON_PERMISSIONS,
    type FormQuestion,
    type FormQuestionCondition,
    formsApi
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { slide, fade } from "svelte/transition";
  import DiscordSelector from "./DiscordSelector.svelte";
  import Portal from "$lib/components/ui/Portal.svelte";

  interface Props {
    questionId: number;
    questionIndex: number;
    allQuestions: Partial<FormQuestion>[];
    roles: Array<{ id: string; name: string }>;
    existingConditions?: FormQuestionCondition[];
    onConditionsChange: () => void;
  }

  let { questionId, questionIndex, allQuestions, roles, existingConditions = [], onConditionsChange }: Props = $props();

  // Group conditions by condition_group
  let conditionGroups = $state<FormQuestionCondition[][]>([]);
  let isLoading = $state(false);
  let isMobile = $state(false);
  let showMobileModal = $state(false);

  // Detect mobile viewport
  function checkMobile() {
    isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  }

  $effect(() => {
    checkMobile();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
      return () => {
        window.removeEventListener("resize", checkMobile);
      };
    }
    return () => {
    }; // No-op cleanup for SSR
  });

  // Initialize from existing conditions
  $effect(() => {
    if (existingConditions && existingConditions.length > 0) {
      const groups: { [key: number]: FormQuestionCondition[] } = {};
      existingConditions.forEach(cond => {
        if (!groups[cond.conditionGroup]) {
          groups[cond.conditionGroup] = [];
        }
        groups[cond.conditionGroup].push(cond);
      });
      conditionGroups = Object.values(groups);
    } else {
      conditionGroups = [];
    }
  });

  function addConditionGroup() {
    const newGroup: FormQuestionCondition[] = [createNewCondition(conditionGroups.length)];
    conditionGroups = [...conditionGroups, newGroup];
  }

  function addConditionToGroup(groupIndex: number) {
    const group = conditionGroups[groupIndex];
    const newCondition = createNewCondition(groupIndex);
    conditionGroups[groupIndex] = [...group, newCondition];
    conditionGroups = [...conditionGroups];
  }

  function createNewCondition(groupIndex: number): FormQuestionCondition {
    return {
      id: -(Date.now() + Math.random()), // Temporary negative ID
      questionId: questionId,
      conditionGroup: groupIndex,
      conditionType: 0, // Default to QuestionBased
      logicType: "AND",
      createdAt: new Date().toISOString()
    };
  }

  function deleteCondition(groupIndex: number, conditionIndex: number) {
    const condition = conditionGroups[groupIndex][conditionIndex];

    // If it has a real ID (from database), delete via API
    if (condition.id > 0 && questionId > 0) {
      isLoading = true;
      formsApi.deleteCondition(condition.id)
        .then(() => {
          removeConditionLocally(groupIndex, conditionIndex);
          onConditionsChange();
        })
        .catch((err) => {
          console.error("Failed to delete condition:", err);
          alert("Failed to delete condition");
        })
        .finally(() => {
          isLoading = false;
        });
    } else {
      // Just remove locally (not yet saved)
      removeConditionLocally(groupIndex, conditionIndex);
    }
  }

  function removeConditionLocally(groupIndex: number, conditionIndex: number) {
    conditionGroups[groupIndex] = conditionGroups[groupIndex].filter((_, i) => i !== conditionIndex);

    // If group is now empty, remove the group
    if (conditionGroups[groupIndex].length === 0) {
      conditionGroups = conditionGroups.filter((_, i) => i !== groupIndex);
      // Re-index condition groups
      conditionGroups.forEach((group, newIndex) => {
        group.forEach(cond => {
          cond.conditionGroup = newIndex;
        });
      });
    }

    conditionGroups = [...conditionGroups];
  }

  function updateCondition(groupIndex: number, conditionIndex: number, updates: Partial<FormQuestionCondition>) {
    conditionGroups[groupIndex][conditionIndex] = {
      ...conditionGroups[groupIndex][conditionIndex],
      ...updates
    };
    conditionGroups = [...conditionGroups];
  }

  async function saveConditions() {
    if (questionId <= 0) return []; // Question not created yet

    const allConditions: FormQuestionCondition[] = [];

    for (const group of conditionGroups) {
      for (const condition of group) {
        // Only save new conditions (negative or zero ID)
        if (condition.id <= 0) {
          try {
            const created = await formsApi.addQuestionCondition(questionId, {
              conditionGroup: condition.conditionGroup,
              conditionType: condition.conditionType,
              targetQuestionId: condition.targetQuestionId,
              targetRoleIds: condition.targetRoleIds,
              operator: condition.operator,
              expectedValue: condition.expectedValue,
              daysThreshold: condition.daysThreshold,
              requiresBoost: condition.requiresBoost,
              requiresNitro: condition.requiresNitro,
              permissionFlags: condition.permissionFlags,
              logicType: condition.logicType
            });
            allConditions.push(created);
          } catch (err) {
            console.error("Failed to save condition:", err);
            throw err;
          }
        } else {
          allConditions.push(condition);
        }
      }
    }

    return allConditions;
  }

  // Expose save method for parent component
  export { saveConditions };

  function getConditionTypeLabel(type: number): string {
    return CONDITIONAL_TYPES.find(t => t.value === type)?.label || "Unknown";
  }
</script>

{#if isMobile}
  <!-- Mobile: Compact button that opens full-screen modal -->
  <button
    type="button"
    onclick={() => showMobileModal = true}
    class="w-full py-3 px-4 rounded-lg font-medium transition-all hover:scale-[1.02] border flex items-center justify-between"
    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
  >
    <div class="flex items-center gap-2">
      <i class="fa-solid fa-code-branch" style="color: {$colorStore.primary};"></i>
      <span>
        {conditionGroups.length === 0 ? "Add Conditions" : `Conditions (${conditionGroups.flat().length})`}
      </span>
    </div>
    <i class="fa-solid fa-arrow-up-right-from-square" style="color: {$colorStore.muted}; font-size: 14px;"></i>
  </button>

  {#if showMobileModal}
    <Portal>
      <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-0"
        onclick={() => showMobileModal = false}
        onkeydown={(e) => { if (e.key === 'Escape') showMobileModal = false; }}
        role="presentation"
        transition:fade={{ duration: 200 }}
      >
        <div
          class="w-full h-full flex flex-col"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}98); max-width: 100vw;"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between p-4 border-b sticky top-0 z-10"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
          >
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-code-branch" style="color: {$colorStore.primary}; font-size: 18px;"></i>
              <h3 id="modal-title" class="font-bold text-lg" style="color: {$colorStore.text};">Multiple Conditions</h3>
            </div>
            <button
              type="button"
              onclick={() => showMobileModal = false}
              class="p-2 rounded-lg transition-all hover:scale-110"
              style="background: {$colorStore.primary}20; color: {$colorStore.text};"
              aria-label="Close modal"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Modal Content (scrollable) -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="space-y-3">
              {#if conditionGroups.length === 0}
                <button
                  type="button"
                  onclick={addConditionGroup}
                  class="w-full py-3 rounded-lg font-medium transition-all hover:scale-[1.02] border-2 border-dashed"
                  style="background: {$colorStore.primary}05; color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
                >
                  <i class="fa-solid fa-plus mr-2"></i>
                  Add Condition
                </button>
              {:else}
                {#snippet conditionsContent()}
                  <!-- Flattened Conditions List -->
                  {#each conditionGroups as group, groupIndex (groupIndex)}
                    {#each group as condition, conditionIndex (condition.id)}
                      <!-- OR Divider (between groups) -->
                      {#if conditionIndex === 0 && groupIndex > 0}
                        <div class="flex items-center gap-2 my-1">
                          <div class="flex-shrink-0 px-3 py-1.5 rounded-full font-bold text-xs"
                               style="background: {$colorStore.accent}; color: white;">
                            OR
                          </div>
                          <div class="flex-1 h-0.5" style="background: {$colorStore.accent};"></div>
                        </div>
                      {/if}

                      <!-- Condition Row -->
                      <div class="flex flex-col gap-2" transition:slide>
                        <!-- Logic Badge -->
                        <div class="flex items-start gap-2">
                          {#if conditionIndex === 0 && groupIndex === 0}
                            <div class="px-2 py-1 rounded font-bold text-xs shrink-0"
                                 style="background: {$colorStore.primary}; color: white;">
                              IF
                            </div>
                          {:else if conditionIndex > 0}
                            <div class="px-2 py-1 rounded font-bold text-xs shrink-0"
                                 style="background: {$colorStore.primary}40; color: {$colorStore.primary};">
                              AND
                            </div>
                          {:else}
                            <div class="w-10 shrink-0"></div>
                          {/if}

                          <!-- Delete Button (moved to top right) -->
                          <button
                            type="button"
                            onclick={() => deleteCondition(groupIndex, conditionIndex)}
                            class="ml-auto p-2 rounded-lg transition-all hover:scale-110 shrink-0"
                            style="background: #ef444420; color: #ef4444;"
                            disabled={isLoading}
                            aria-label="Delete condition"
                          >
                            <i class="fa-solid fa-xmark text-lg"></i>
                          </button>
                        </div>

                        <!-- Condition Content -->
                        <div class="flex-1 p-3 rounded-lg border"
                             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
                          <div class="space-y-3">
                            <!-- Type Selector -->
                            <div>
                              <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Type</label>
                              <DiscordSelector
                                type="custom"
                                options={CONDITIONAL_TYPES.filter(t => t.value !== 5).map(t => ({ id: String(t.value), name: t.label }))}
                                selected={String(condition.conditionType)}
                                placeholder="Type..."
                                onchange={(e) => updateCondition(groupIndex, conditionIndex, {
                                  conditionType: parseInt(e.selected as string),
                                  targetQuestionId: undefined,
                                  targetRoleIds: undefined,
                                  operator: undefined,
                                  expectedValue: undefined,
                                  daysThreshold: undefined,
                                  requiresBoost: undefined,
                                  requiresNitro: undefined,
                                  permissionFlags: undefined
                                })}
                                searchable={false}
                              />
                            </div>

                            <!-- Type-Specific Config -->
                            <!-- Question: Answer-based -->
                            {#if condition.conditionType === 0}
                              <div>
                                <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Question</label>
                                <DiscordSelector
                                  type="custom"
                                  options={allQuestions.slice(0, questionIndex).filter(q => q.questionText).map((q, i) => ({ id: String(q.id), name: `Q${i + 1}` }))}
                                  selected={condition.targetQuestionId ? String(condition.targetQuestionId) : ""}
                                  placeholder="Question..."
                                  onchange={(e) => updateCondition(groupIndex, conditionIndex, { targetQuestionId: e.selected ? parseInt(e.selected as string) : undefined })}
                                  searchable={false}
                                />
                              </div>

                              {#if condition.targetQuestionId}
                                <div>
                                  <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Operator</label>
                                  <DiscordSelector
                                    type="custom"
                                    options={CONDITIONAL_OPERATORS.map(op => ({ id: op.value, name: op.label }))}
                                    selected={condition.operator || "equals"}
                                    placeholder="="
                                    onchange={(e) => updateCondition(groupIndex, conditionIndex, { operator: e.selected as any })}
                                    searchable={false}
                                  />
                                </div>

                                <div>
                                  <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Value</label>
                                  <input
                                    type="text"
                                    value={condition.expectedValue || ""}
                                    oninput={(e) => updateCondition(groupIndex, conditionIndex, { expectedValue: e.currentTarget.value })}
                                    placeholder="value..."
                                    class="w-full p-2.5 rounded-lg text-sm"
                                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                                  />
                                </div>
                              {/if}
                            {/if}

                            <!-- Role: User roles -->
                            {#if condition.conditionType === 1}
                              <div>
                                <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Roles
                                  (any)</label>
                                <DiscordSelector
                                  type="role"
                                  options={roles}
                                  selected={condition.targetRoleIds?.split(",").filter(x => x) || []}
                                  placeholder="Roles..."
                                  multiple
                                  onchange={(e) => updateCondition(groupIndex, conditionIndex, { targetRoleIds: (e.selected as string[]).join(",") })}
                                />
                              </div>
                            {/if}

                            <!-- Tenure: Days threshold -->
                            {#if condition.conditionType === 2}
                              <div>
                                <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Min days</label>
                                <input
                                  type="number"
                                  value={condition.daysThreshold || ""}
                                  oninput={(e) => updateCondition(groupIndex, conditionIndex, { daysThreshold: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                                  min="0"
                                  placeholder="30"
                                  class="w-full p-2.5 rounded-lg text-sm"
                                  style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                                />
                              </div>
                            {/if}

                            <!-- Boost: Checkboxes -->
                            {#if condition.conditionType === 3}
                              <div class="flex flex-col gap-2">
                                <label class="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={condition.requiresBoost || false}
                                    onchange={(e) => updateCondition(groupIndex, conditionIndex, { requiresBoost: e.currentTarget.checked })}
                                    class="w-5 h-5"
                                    style="accent-color: #f47fff;"
                                  />
                                  <span style="color: {$colorStore.text};">Requires Boost</span>
                                </label>
                                <label class="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={condition.requiresNitro || false}
                                    onchange={(e) => updateCondition(groupIndex, conditionIndex, { requiresNitro: e.currentTarget.checked })}
                                    class="w-5 h-5"
                                    style="accent-color: #5865f2;"
                                  />
                                  <span style="color: {$colorStore.text};">Requires Nitro</span>
                                </label>
                              </div>
                            {/if}

                            <!-- Permission: Dropdown -->
                            {#if condition.conditionType === 4}
                              <div>
                                <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Permission</label>
                                <DiscordSelector
                                  type="custom"
                                  options={COMMON_PERMISSIONS.map(p => ({ id: String(p.value), name: p.label }))}
                                  selected={condition.permissionFlags ? String(condition.permissionFlags) : ""}
                                  placeholder="Permission..."
                                  onchange={(e) => updateCondition(groupIndex, conditionIndex, { permissionFlags: e.selected ? parseInt(e.selected as string) : undefined })}
                                  searchable={false}
                                />
                              </div>
                            {/if}
                          </div>
                        </div>
                      </div>
                    {/each}
                  {/each}
                {/snippet}

                {@render conditionsContent()}

                <!-- Add Buttons -->
                <div class="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onclick={() => addConditionToGroup(conditionGroups.length - 1)}
                    class="w-full py-2.5 rounded-lg text-sm font-medium border transition-all"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
                  >
                    <i class="fa-solid fa-plus mr-2"></i>
                    <strong>AND</strong> condition
                  </button>
                  <button
                    type="button"
                    onclick={addConditionGroup}
                    class="w-full py-2.5 rounded-lg text-sm font-medium border transition-all"
                    style="background: {$colorStore.accent}15; color: {$colorStore.text}; border-color: {$colorStore.accent}50;"
                  >
                    <i class="fa-solid fa-code-merge mr-2"></i>
                    <strong>OR</strong> group
                  </button>
                </div>
              {/if}

              <!-- Compact Help -->
              {#if conditionGroups.length > 0}
                <div class="p-3 rounded text-xs" style="background: #3b82f610; color: {$colorStore.muted};">
                  <i class="fa-solid fa-lightbulb mr-1" style="color: #3b82f6;"></i>
                  <strong>AND</strong> = all in group, <strong>OR</strong> = any group
                </div>
              {/if}
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            class="p-4 border-t sticky bottom-0"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
          >
            <button
              type="button"
              onclick={() => showMobileModal = false}
              class="w-full py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
              style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; box-shadow: 0 4px 20px {$colorStore.primary}10;"
            >
              <i class="fa-solid fa-check mr-2"></i>
              Done
            </button>
          </div>
        </div>
      </div>
    </Portal>
  {/if}
{:else}
  <!-- Desktop: Inline editor (existing layout) -->
  <div class="space-y-3">
    {#if conditionGroups.length === 0}
      <button
        type="button"
        onclick={addConditionGroup}
        class="w-full py-3 rounded-lg font-medium transition-all hover:scale-[1.02] border-2 border-dashed"
        style="background: {$colorStore.primary}05; color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        Add Condition
      </button>
    {:else}
      <!-- Flattened Conditions List -->
      {#each conditionGroups as group, groupIndex (groupIndex)}
        {#each group as condition, conditionIndex (condition.id)}
          <!-- OR Divider (between groups) -->
          {#if conditionIndex === 0 && groupIndex > 0}
            <div class="flex items-center gap-2 my-1">
              <div class="flex-shrink-0 px-3 py-1.5 rounded-full font-bold text-xs"
                   style="background: {$colorStore.accent}; color: white;">
                OR
              </div>
              <div class="flex-1 h-0.5" style="background: {$colorStore.accent};"></div>
            </div>
          {/if}

          <!-- Condition Row -->
          <div class="flex items-start gap-2" transition:slide>
            <!-- Logic Badge -->
            <div class="flex-shrink-0 pt-2">
              {#if conditionIndex === 0 && groupIndex === 0}
                <div class="px-2 py-1 rounded font-bold text-xs"
                     style="background: {$colorStore.primary}; color: white;">
                  IF
                </div>
              {:else if conditionIndex > 0}
                <div class="px-2 py-1 rounded font-bold text-xs"
                     style="background: {$colorStore.primary}40; color: {$colorStore.primary};">
                  AND
                </div>
              {:else}
                <div class="w-10"></div>
              {/if}
            </div>

            <!-- Condition Content -->
            <div class="flex-1 min-w-0 p-3 rounded-lg border"
                 style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
              <div class="space-y-2">
                <!-- Type + Config in compact layout -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <!-- Type Selector -->
                  <div class="md:col-span-1">
                    <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Type</label>
                    <DiscordSelector
                      type="custom"
                      options={CONDITIONAL_TYPES.filter(t => t.value !== 5).map(t => ({ id: String(t.value), name: t.label }))}
                      selected={String(condition.conditionType)}
                      placeholder="Type..."
                      onchange={(e) => updateCondition(groupIndex, conditionIndex, {
                      conditionType: parseInt(e.selected as string),
                      targetQuestionId: undefined,
                      targetRoleIds: undefined,
                      operator: undefined,
                      expectedValue: undefined,
                      daysThreshold: undefined,
                      requiresBoost: undefined,
                      requiresNitro: undefined,
                      permissionFlags: undefined
                    })}
                      searchable={false}
                    />
                  </div>

                  <!-- Type-Specific Config (takes remaining columns) -->
                  <div class="md:col-span-2">

                    <!-- Question: Answer-based -->
                    {#if condition.conditionType === 0}
                      <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Question</label>
                      <DiscordSelector
                        type="custom"
                        options={allQuestions.slice(0, questionIndex).filter(q => q.questionText).map((q, i) => ({ id: String(q.id), name: `Q${i + 1}` }))}
                        selected={condition.targetQuestionId ? String(condition.targetQuestionId) : ""}
                        placeholder="Question..."
                        onchange={(e) => updateCondition(groupIndex, conditionIndex, { targetQuestionId: e.selected ? parseInt(e.selected as string) : undefined })}
                        searchable={false}
                      />
                    {/if}

                    <!-- Role: User roles -->
                    {#if condition.conditionType === 1}
                      <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Roles (any)</label>
                      <DiscordSelector
                        type="role"
                        options={roles}
                        selected={condition.targetRoleIds?.split(",").filter(x => x) || []}
                        placeholder="Roles..."
                        multiple
                        onchange={(e) => updateCondition(groupIndex, conditionIndex, { targetRoleIds: (e.selected as string[]).join(",") })}
                      />
                    {/if}

                    <!-- Tenure: Days threshold -->
                    {#if condition.conditionType === 2}
                      <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Min days</label>
                      <input
                        type="number"
                        value={condition.daysThreshold || ""}
                        oninput={(e) => updateCondition(groupIndex, conditionIndex, { daysThreshold: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                        min="0"
                        placeholder="30"
                        class="w-full p-2.5 rounded-lg text-sm"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                      />
                    {/if}

                    <!-- Boost: Checkboxes inline -->
                    {#if condition.conditionType === 3}
                      <div class="flex gap-3 pt-1">
                        <label class="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={condition.requiresBoost || false}
                            onchange={(e) => updateCondition(groupIndex, conditionIndex, { requiresBoost: e.currentTarget.checked })}
                            class="w-4 h-4"
                            style="accent-color: #f47fff;"
                          />
                          <span style="color: {$colorStore.text};">Boost</span>
                        </label>
                        <label class="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={condition.requiresNitro || false}
                            onchange={(e) => updateCondition(groupIndex, conditionIndex, { requiresNitro: e.currentTarget.checked })}
                            class="w-4 h-4"
                            style="accent-color: #5865f2;"
                          />
                          <span style="color: {$colorStore.text};">Nitro</span>
                        </label>
                      </div>
                    {/if}

                    <!-- Permission: Dropdown -->
                    {#if condition.conditionType === 4}
                      <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Permission</label>
                      <DiscordSelector
                        type="custom"
                        options={COMMON_PERMISSIONS.map(p => ({ id: String(p.value), name: p.label }))}
                        selected={condition.permissionFlags ? String(condition.permissionFlags) : ""}
                        placeholder="Permission..."
                        onchange={(e) => updateCondition(groupIndex, conditionIndex, { permissionFlags: e.selected ? parseInt(e.selected as string) : undefined })}
                        searchable={false}
                      />
                    {/if}
                  </div>
                </div>

                <!-- Question-based: Operator + Value (second row) -->
                {#if condition.conditionType === 0 && condition.targetQuestionId}
                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Operator</label>
                      <DiscordSelector
                        type="custom"
                        options={CONDITIONAL_OPERATORS.map(op => ({ id: op.value, name: op.label }))}
                        selected={condition.operator || "equals"}
                        placeholder="="
                        onchange={(e) => updateCondition(groupIndex, conditionIndex, { operator: e.selected as any })}
                        searchable={false}
                      />
                    </div>
                    <div>
                      <label class="block text-xs mb-1" style="color: {$colorStore.muted};">Value</label>
                      <input
                        type="text"
                        value={condition.expectedValue || ""}
                        oninput={(e) => updateCondition(groupIndex, conditionIndex, { expectedValue: e.currentTarget.value })}
                        placeholder="value..."
                        class="w-full p-2.5 rounded-lg text-sm"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                      />
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Delete Button -->
            <button
              type="button"
              onclick={() => deleteCondition(groupIndex, conditionIndex)}
              class="flex-shrink-0 p-2.5 rounded-lg transition-all hover:scale-110"
              style="background: #ef444420; color: #ef4444;"
              disabled={isLoading}
              aria-label="Delete condition"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        {/each}
      {/each}

      <!-- Add Buttons -->
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onclick={() => addConditionToGroup(conditionGroups.length - 1)}
          class="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all hover:scale-[1.01]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border-color: {$colorStore.primary}40;"
        >
          <i class="fa-solid fa-plus mr-2"></i>
          <strong>AND</strong> condition
        </button>
        <button
          type="button"
          onclick={addConditionGroup}
          class="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all hover:scale-[1.01]"
          style="background: {$colorStore.accent}15; color: {$colorStore.text}; border-color: {$colorStore.accent}50;"
        >
          <i class="fa-solid fa-code-merge mr-2"></i>
          <strong>OR</strong> group
        </button>
      </div>
    {/if}

    <!-- Compact Help -->
    {#if conditionGroups.length > 0}
      <div class="p-2 rounded text-xs" style="background: #3b82f610; color: {$colorStore.muted};">
        <i class="fa-solid fa-lightbulb mr-1" style="color: #3b82f6;"></i>
        <strong>AND</strong> = all in group, <strong>OR</strong> = any group
      </div>
    {/if}
  </div>
{/if}

<style>
    /* Mobile-friendly touch targets */
    @media (max-width: 768px) {
        button {
            min-height: 44px; /* Apple's recommended touch target */
        }
    }
</style>
