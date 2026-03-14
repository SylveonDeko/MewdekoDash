<!-- ValidationCard.svelte -->
<script lang="ts">


  import { colorStore } from "$lib/stores/colorStore";


  interface Props {
    // Props
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
    suggestions?: ValidationSuggestion[];
    dismissible?: boolean;
    collapsible?: boolean;
    title?: string;
    compact?: boolean;
    ondismiss?: (detail: { type: "error" | "warning" | "suggestion"; id: string }) => void;
    onaction?: (detail: { type: "error" | "warning" | "suggestion"; id: string }) => void;
  }

  let {
    errors = [],
    warnings = [],
    suggestions = [],
    dismissible = true,
    collapsible = false,
    title = "",
    compact = false,
    ondismiss,
    onaction
  }: Props = $props();

  // Types
  interface ValidationError {
    id: string;
    message: string;
    field?: string;
    action?: { label: string; handler: () => void };
  }

  interface ValidationWarning {
    id: string;
    message: string;
    field?: string;
    action?: { label: string; handler: () => void };
  }

  interface ValidationSuggestion {
    id: string;
    message: string;
    action?: { label: string; handler: () => void };
  }

  // Internal state
  let collapsed = $state(false);
  let localErrors = $state([...errors]);
  let localWarnings = $state([...warnings]);
  let localSuggestions = $state([...suggestions]);

  // Update local arrays when props change
  $effect(() => {
    localErrors = [...errors];
  });
  $effect(() => {
    localWarnings = [...warnings];
  });
  $effect(() => {
    localSuggestions = [...suggestions];
  });

  // Computed values
  let totalIssues = $derived(localErrors.length + localWarnings.length + localSuggestions.length);
  let hasContent = $derived(totalIssues > 0);
  let errorCount = $derived(localErrors.length);
  let warningCount = $derived(localWarnings.length);
  let suggestionCount = $derived(localSuggestions.length);

  // Get the most severe issue type for overall styling
  let severityLevel = $derived<'error' | 'warning' | 'suggestion'>(errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'suggestion');

  // Dismiss an individual issue
  function dismissIssue(type: 'error' | 'warning' | 'suggestion', id: string) {
    if (type === 'error') {
      localErrors = localErrors.filter(e => e.id !== id);
    } else if (type === 'warning') {
      localWarnings = localWarnings.filter(w => w.id !== id);
    } else {
      localSuggestions = localSuggestions.filter(s => s.id !== id);
    }

    ondismiss?.({ type, id });
  }

  // Execute an action
  function executeAction(type: 'error' | 'warning' | 'suggestion', id: string, action: () => void) {
    action();
    onaction?.({ type, id });
  }

  // Get icon for issue type
  function getIcon(type: 'error' | 'warning' | 'suggestion') {
    switch (type) {
      case 'error':
        return "fa-circle-exclamation";
      case 'warning':
        return "fa-triangle-exclamation";
      case 'suggestion':
        return "fa-lightbulb";
      default:
        return "fa-circle-info";
    }
  }

  // Get colors for issue type
  function getColors(type: 'error' | 'warning' | 'suggestion') {
    switch (type) {
      case 'error':
        return {
          bg: '#FEF2F2',
          bgDark: '#7F1D1D20',
          border: '#FCA5A5',
          text: '#DC2626',
          icon: '#DC2626'
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          bgDark: '#92400E20',
          border: '#FCD34D',
          text: '#D97706',
          icon: '#D97706'
        };
      case 'suggestion':
        return {
          bg: '#EFF6FF',
          bgDark: '#1E3A8A20',
          border: '#93C5FD',
          text: '#2563EB',
          icon: '#2563EB'
        };
      default:
        return {
          bg: '#F0F9FF',
          bgDark: '#0C4A6E20',
          border: '#7DD3FC',
          text: '#0284C7',
          icon: '#0284C7'
        };
    }
  }

  // Toggle collapsed state
  function toggleCollapsed() {
    if (collapsible) {
      collapsed = !collapsed;
    }
  }
</script>

{#if hasContent}
  <div 
    class="rounded-lg border transition-all duration-200"
    class:compact
    style="background: {getColors(severityLevel).bgDark}; 
           border-color: {getColors(severityLevel).border}50;"
    role="alert"
    aria-live="polite"
  >
    <!-- Header -->
    {#if title || collapsible}
      <div
        class="flex items-center justify-between p-3 border-b"
        class:cursor-pointer={collapsible}
        style="border-color: {getColors(severityLevel).border}30;"
        onclick={collapsible ? toggleCollapsed : undefined}
        onkeydown={collapsible ? (e) => (e.key === 'Enter' || e.key === ' ') && toggleCollapsed() : undefined}
        role={collapsible ? 'button' : undefined}
        {...(collapsible ? { tabindex: 0 } : {})}
        aria-expanded={collapsible ? !collapsed : undefined}
      >
        <div class="flex items-center gap-2">
          <i class="fa-solid {getIcon(severityLevel)}" style="color: {getColors(severityLevel).icon}; font-size: 16px;"></i>
          <h3 class="text-sm font-medium" style="color: {getColors(severityLevel).text};">
            {title || 'Validation Issues'}
          </h3>
          <div class="flex items-center gap-1 text-xs" style="color: {getColors(severityLevel).text}70;">
            {#if errorCount > 0}
              <span class="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            {/if}
            {#if warningCount > 0}
              <span class="px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            {/if}
            {#if suggestionCount > 0}
              <span class="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {suggestionCount} tip{suggestionCount !== 1 ? 's' : ''}
              </span>
            {/if}
          </div>
        </div>

        {#if collapsible}
          <div class="transform transition-transform duration-200" class:rotate-180={collapsed}>
            <i class="fa-solid fa-arrow-right" style="color: {getColors(severityLevel).text}; font-size: 16px;"></i>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Content -->
    {#if !collapsed}
      <div class="space-y-3 p-3" class:pt-0={title || collapsible}>
        
        <!-- Errors -->
        {#if localErrors.length > 0}
          <div class="space-y-2">
            {#if localWarnings.length > 0 || localSuggestions.length > 0}
              <h4 class="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                  style="color: {getColors('error').text};">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 12px;"></i>
                Errors ({localErrors.length})
              </h4>
            {/if}
            
            {#each localErrors as error}
              <div class="flex items-start gap-3 p-3 rounded-lg border-l-4"
                   style="background: {getColors('error').bgDark}; 
                          border-color: {getColors('error').text};">
                <i class="fa-solid fa-circle-exclamation shrink-0 mt-0.5"
                   style="color: {getColors('error').icon}; font-size: 16px;"
                ></i>
                
                <div class="flex-1 min-w-0">
                  <p class="text-sm" style="color: {getColors('error').text};">
                    {error.message}
                  </p>
                  {#if error.field}
                    <p class="text-xs mt-1 opacity-75" style="color: {getColors('error').text};">
                      Field: {error.field}
                    </p>
                  {/if}
                  
                  {#if error.action}
                    <button
                            class="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-sm text-xs font-medium transition-colors hover:bg-black/10"
                      style="color: {getColors('error').text}; border: 1px solid {getColors('error').text}30;"
                      onclick={() => executeAction('error', error.id, error.action.handler)}
                    >
                      {error.action.label}
                      <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px;"></i>
                    </button>
                  {/if}
                </div>

                {#if dismissible}
                  <button
                          class="shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                    onclick={() => dismissIssue('error', error.id)}
                    title="Dismiss error"
                    aria-label="Dismiss error"
                  >
                    <i class="fa-solid fa-xmark" style="color: {getColors('error').text}; font-size: 14px;"></i>
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

        <!-- Warnings -->
        {#if localWarnings.length > 0}
          <div class="space-y-2">
            {#if (localErrors.length > 0 || localSuggestions.length > 0)}
              <h4 class="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                  style="color: {getColors('warning').text};">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 12px;"></i>
                Warnings ({localWarnings.length})
              </h4>
            {/if}
            
            {#each localWarnings as warning}
              <div class="flex items-start gap-3 p-3 rounded-lg border-l-4"
                   style="background: {getColors('warning').bgDark}; 
                          border-color: {getColors('warning').text};">
                <i class="fa-solid fa-triangle-exclamation shrink-0 mt-0.5"
                   style="color: {getColors('warning').icon}; font-size: 16px;"
                ></i>
                
                <div class="flex-1 min-w-0">
                  <p class="text-sm" style="color: {getColors('warning').text};">
                    {warning.message}
                  </p>
                  {#if warning.field}
                    <p class="text-xs mt-1 opacity-75" style="color: {getColors('warning').text};">
                      Field: {warning.field}
                    </p>
                  {/if}
                  
                  {#if warning.action}
                    <button
                            class="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-sm text-xs font-medium transition-colors hover:bg-black/10"
                      style="color: {getColors('warning').text}; border: 1px solid {getColors('warning').text}30;"
                      onclick={() => executeAction('warning', warning.id, warning.action.handler)}
                    >
                      {warning.action.label}
                      <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px;"></i>
                    </button>
                  {/if}
                </div>

                {#if dismissible}
                  <button
                          class="shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                    onclick={() => dismissIssue('warning', warning.id)}
                    title="Dismiss warning"
                    aria-label="Dismiss warning"
                  >
                    <i class="fa-solid fa-xmark" style="color: {getColors('warning').text}; font-size: 14px;"></i>
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}

        <!-- Suggestions -->
        {#if localSuggestions.length > 0}
          <div class="space-y-2">
            {#if (localErrors.length > 0 || localWarnings.length > 0)}
              <h4 class="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                  style="color: {getColors('suggestion').text};">
                <i class="fa-solid fa-lightbulb" style="font-size: 12px;"></i>
                Suggestions ({localSuggestions.length})
              </h4>
            {/if}
            
            {#each localSuggestions as suggestion}
              <div class="flex items-start gap-3 p-3 rounded-lg border-l-4"
                   style="background: {getColors('suggestion').bgDark}; 
                          border-color: {getColors('suggestion').text};">
                <i class="fa-solid fa-lightbulb shrink-0 mt-0.5"
                   style="color: {getColors('suggestion').icon}; font-size: 16px;"
                ></i>
                
                <div class="flex-1 min-w-0">
                  <p class="text-sm" style="color: {getColors('suggestion').text};">
                    {suggestion.message}
                  </p>
                  
                  {#if suggestion.action}
                    <button
                            class="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-sm text-xs font-medium transition-colors hover:bg-black/10"
                      style="color: {getColors('suggestion').text}; border: 1px solid {getColors('suggestion').text}30;"
                      onclick={() => executeAction('suggestion', suggestion.id, suggestion.action.handler)}
                    >
                      {suggestion.action.label}
                      <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px;"></i>
                    </button>
                  {/if}
                </div>

                {#if dismissible}
                  <button
                          class="shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                    onclick={() => dismissIssue('suggestion', suggestion.id)}
                    title="Dismiss suggestion"
                    aria-label="Dismiss suggestion"
                  >
                    <i class="fa-solid fa-xmark" style="color: {getColors('suggestion').text}; font-size: 14px;"></i>
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .compact {
    font-size: 0.875rem;
  }
  
  .compact .space-y-2 > * + * {
    margin-top: 0.5rem;
  }
  
  .compact .space-y-3 > * + * {
    margin-top: 0.75rem;
  }

  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .rotate-180 {
    transform: rotate(180deg);
  }
</style>