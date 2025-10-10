<!-- lib/components/forms/FormsList.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Form } from "$lib/api/index.ts";
  import { FORM_TYPES, intToFormType } from "$lib/api/index.ts";

  interface Props {
    forms: Form[];
    loading: boolean;
    error: string | null;
    onEdit: (formId: number) => void;
    onViewResponses: (formId: number) => void;
    onPreview: (formId: number) => void;
    onCopyLink: (formId: number) => void;
    onDuplicate: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDelete: (form: Form) => void;
    onPublish: (form: Form) => void;
    onCreateNew: () => void;
    onReview?: (formId: number) => void;
  }

  let {
    forms,
    loading,
    error,
    onEdit,
    onViewResponses,
    onPreview,
    onCopyLink,
    onDuplicate,
    onToggleStatus,
    onDelete,
    onPublish,
    onCreateNew,
    onReview
  }: Props = $props();
</script>

<div class="space-y-6">
  {#if loading}
    <div
      class="backdrop-blur-xs rounded-xl border p-12 transition-all"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <div class="flex flex-col items-center justify-center">
        <div
          class="w-12 h-12 border-4 rounded-full animate-spin mb-4"
          style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
        ></div>
        <p class="text-sm" style="color: {$colorStore.muted};">Loading forms...</p>
      </div>
    </div>
  {:else if error}
    <div
      class="backdrop-blur-xs rounded-xl border p-6 transition-all"
      style="background: #ef444410; border-color: #ef444430;"
    >
      <div class="flex items-center gap-3">
        <i
          class="fa-solid fa-triangle-exclamation"
          style="color: #ef4444; font-size: 20px;"
        ></i>
        <span style="color: #ef4444;">{error}</span>
      </div>
    </div>
  {:else if forms.length === 0}
    <div
      class="backdrop-blur-xs rounded-xl border p-12 transition-all text-center"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <i
        class="fa-solid fa-clipboard-list"
        style="color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"
      ></i>
      <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text};">No forms yet</h3>
      <p class="mb-6" style="color: {$colorStore.muted};">
        Create your first form to start collecting responses from your community
      </p>
      <button
        onclick={onCreateNew}
        class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
        style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}); color: white;"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        Create Your First Form
      </button>
    </div>
  {:else}
    <!-- Forms Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each forms as form, index (form.id)}
        <div
          class="backdrop-blur-xs rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
          in:fly={{ y: 20, duration: 300, delay: index * 50 }}
        >
          <!-- Form Header -->
          <div
            class="p-4 border-b"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-lg truncate mb-1" style="color: {$colorStore.text};">
                  {form.name}
                </h3>
                {#if form.description}
                  <p class="text-sm line-clamp-2" style="color: {$colorStore.muted};">
                    {form.description}
                  </p>
                {/if}
              </div>
              <div class="flex flex-col gap-1">
                {#if form.isDraft}
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style="background: #f59e0b20; color: #f59e0b;"
                  >
                    Draft
                  </span>
                {:else}
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style="background: {form.isActive ? '#10B98120' : '#6B728020'}; color: {form.isActive ? '#10B981' : '#6B7280'};"
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                {/if}
                {#if form.formType !== 0}
                  {@const formTypeStr = intToFormType(form.formType)}
                  {@const formTypeMeta = FORM_TYPES.find(ft => ft.type === formTypeStr)}
                  {#if formTypeMeta}
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style="background: {formTypeStr === 'BanAppeal' ? '#ef444420' : '#3b82f620'}; color: {formTypeStr === 'BanAppeal' ? '#ef4444' : '#3b82f6'};"
                    >
                      <i class="fa-solid {formTypeMeta.icon} mr-1"></i>
                      {formTypeMeta.label}
                    </span>
                  {/if}
                {/if}
                {#if form.pendingCount && form.pendingCount > 0}
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style="background: #f59e0b20; color: #f59e0b;"
                  >
                    <i class="fa-solid fa-clock mr-1"></i>
                    {form.pendingCount} pending
                  </span>
                {/if}
              </div>
            </div>
          </div>

          <!-- Form Stats -->
          <div class="p-4 grid grid-cols-2 gap-4">
            <div class="text-center">
              <div
                class="text-2xl font-bold mb-1"
                style="color: {$colorStore.primary};"
              >
                {form.responseCount || 0}
              </div>
              <div class="text-xs" style="color: {$colorStore.muted};">Responses</div>
            </div>
            <div class="text-center">
              <div
                class="text-2xl font-bold mb-1"
                style="color: {$colorStore.secondary};"
              >
                {form.maxResponses || "∞"}
              </div>
              <div class="text-xs" style="color: {$colorStore.muted};">Max</div>
            </div>
          </div>

          <!-- Form Features -->
          <div class="px-4 pb-4 flex flex-wrap gap-2">
            {#if form.allowAnonymous}
              <span
                class="px-2 py-1 rounded text-xs"
                style="background: #8b5cf620; color: #8b5cf6;"
              >
                <i class="fa-solid fa-user-secret mr-1"></i>
                Anonymous
              </span>
            {/if}
            {#if form.requireCaptcha}
              <span
                class="px-2 py-1 rounded text-xs"
                style="background: {$colorStore.primary}10; color: {$colorStore.text};"
              >
                <i class="fa-solid fa-shield-check mr-1"></i>
                Captcha
              </span>
            {/if}
            {#if form.allowMultipleSubmissions}
              <span
                class="px-2 py-1 rounded text-xs"
                style="background: {$colorStore.primary}10; color: {$colorStore.text};"
              >
                <i class="fa-solid fa-repeat mr-1"></i>
                Multiple
              </span>
            {/if}
            {#if form.submitChannelId}
              <span
                class="px-2 py-1 rounded text-xs"
                style="background: {$colorStore.primary}10; color: {$colorStore.text};"
              >
                <i class="fa-solid fa-bell mr-1"></i>
                Notifications
              </span>
            {/if}
            {#if form.expiresAt}
              {@const timeRemaining = new Date(form.expiresAt).getTime() - Date.now()}
              {@const isExpired = timeRemaining <= 0}
              <span
                class="px-2 py-1 rounded text-xs"
                style="background: {isExpired ? '#ef444420' : '#10B98120'}; color: {isExpired ? '#ef4444' : '#10B981'};"
              >
                <i class="fa-solid fa-clock mr-1"></i>
                {#if isExpired}
                  Expired
                {:else if timeRemaining < 3600000}
                  {Math.floor(timeRemaining / 60000)}m left
                {:else if timeRemaining < 86400000}
                  {Math.floor(timeRemaining / 3600000)}h left
                {:else}
                  {Math.floor(timeRemaining / 86400000)}d left
                {/if}
              </span>
            {/if}
          </div>

          <!-- Actions -->
          <div
            class="p-3 flex gap-2 border-t flex-wrap"
            style="border-color: {$colorStore.primary}15; background: {$colorStore.primary}03;"
          >
            {#if form.isDraft}
              <button
                onclick={() => onPublish(form)}
                class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style="background: #10B98115; color: #10B981;"
                title="Publish form"
              >
                <i class="fa-solid fa-rocket"></i>
              </button>
            {/if}
            {#if form.formType !== 0 && form.pendingCount && form.pendingCount > 0 && onReview}
              <button
                onclick={() => onReview?.(form.id)}
                class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style="background: #f59e0b15; color: #f59e0b;"
                title="Review pending responses"
              >
                <i class="fa-solid fa-clipboard-check"></i>
                <span class="ml-1 text-xs">({form.pendingCount})</span>
              </button>
            {/if}
            <button
              onclick={() => onEdit(form.id)}
              class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}15; color: {$colorStore.text};"
              title="Edit form"
            >
              <i class="fa-solid fa-edit"></i>
            </button>
            <button
              onclick={() => onViewResponses(form.id)}
              class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.secondary}15; color: {$colorStore.text};"
              title="View responses"
            >
              <i class="fa-solid fa-chart-bar"></i>
            </button>
            <button
              onclick={() => onPreview(form.id)}
              class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: #f59e0b15; color: #f59e0b;"
              title="Preview form"
            >
              <i class="fa-solid fa-eye"></i>
            </button>
            <button
              onclick={() => onCopyLink(form.id)}
              class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.accent}15; color: {$colorStore.text};"
              title="Copy link"
            >
              <i class="fa-solid fa-link"></i>
            </button>
            <button
              onclick={() => onDuplicate(form)}
              class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {$colorStore.secondary}15; color: {$colorStore.text};"
              title="Duplicate form"
            >
              <i class="fa-solid fa-copy"></i>
            </button>
            <button
              onclick={() => onToggleStatus(form)}
              class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: {form.isActive ? '#ef444415' : '#10B98115'}; color: {$colorStore.text};"
              title={form.isActive ? "Deactivate" : "Activate"}
            >
              <i class="fa-solid {form.isActive ? 'fa-pause' : 'fa-play'}"></i>
            </button>
            <button
              onclick={() => onDelete(form)}
              class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              style="background: #ef444415; color: #ef4444;"
              title="Delete form"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
