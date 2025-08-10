<!-- ValidationCard.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { colorStore } from "$lib/stores/colorStore";
  import { 
    AlertTriangle, 
    AlertCircle, 
    Info, 
    CheckCircle, 
    X, 
    Lightbulb,
    ExternalLink,
    ArrowRight
  } from "lucide-svelte";

  // Props
  export let errors: ValidationError[] = [];
  export let warnings: ValidationWarning[] = [];
  export let suggestions: ValidationSuggestion[] = [];
  export let dismissible: boolean = true;
  export let collapsible: boolean = false;
  export let title: string = "";
  export let compact: boolean = false;

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

  // Events
  const dispatch = createEventDispatcher<{
    dismiss: { type: 'error' | 'warning' | 'suggestion'; id: string };
    action: { type: 'error' | 'warning' | 'suggestion'; id: string };
  }>();

  // Internal state
  let collapsed = false;
  let localErrors = [...errors];
  let localWarnings = [...warnings];
  let localSuggestions = [...suggestions];

  // Update local arrays when props change
  $: localErrors = [...errors];
  $: localWarnings = [...warnings];
  $: localSuggestions = [...suggestions];

  // Computed values
  $: totalIssues = localErrors.length + localWarnings.length + localSuggestions.length;
  $: hasContent = totalIssues > 0;
  $: errorCount = localErrors.length;
  $: warningCount = localWarnings.length;
  $: suggestionCount = localSuggestions.length;

  // Get the most severe issue type for overall styling
  $: severityLevel = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'info';

  // Dismiss an individual issue
  function dismissIssue(type: 'error' | 'warning' | 'suggestion', id: string) {
    if (type === 'error') {
      localErrors = localErrors.filter(e => e.id !== id);
    } else if (type === 'warning') {
      localWarnings = localWarnings.filter(w => w.id !== id);
    } else {
      localSuggestions = localSuggestions.filter(s => s.id !== id);
    }
    
    dispatch('dismiss', { type, id });
  }

  // Execute an action
  function executeAction(type: 'error' | 'warning' | 'suggestion', id: string, action: () => void) {
    action();
    dispatch('action', { type, id });
  }

  // Get icon for issue type
  function getIcon(type: 'error' | 'warning' | 'suggestion') {
    switch (type) {
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'suggestion':
        return Lightbulb;
      default:
        return Info;
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
        class="flex items-center justify-between p-3 border-b cursor-pointer"
        class:cursor-pointer={collapsible}
        style="border-color: {getColors(severityLevel).border}30;"
        on:click={toggleCollapsed}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && collapsible && toggleCollapsed()}
        role={collapsible ? 'button' : undefined}
        tabindex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
      >
        <div class="flex items-center gap-2">
          <svelte:component 
            this={getIcon(severityLevel)} 
            size={16} 
            style="color: {getColors(severityLevel).icon};" 
          />
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
            <ArrowRight size={16} style="color: {getColors(severityLevel).text};" />
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
                <AlertCircle size={12} />
                Errors ({localErrors.length})
              </h4>
            {/if}
            
            {#each localErrors as error}
              <div class="flex items-start gap-3 p-3 rounded-lg border-l-4"
                   style="background: {getColors('error').bgDark}; 
                          border-color: {getColors('error').text};">
                <svelte:component 
                  this={AlertCircle} 
                  size={16} 
                  class="flex-shrink-0 mt-0.5"
                  style="color: {getColors('error').icon};" 
                />
                
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
                      class="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-black/10"
                      style="color: {getColors('error').text}; border: 1px solid {getColors('error').text}30;"
                      on:click={() => executeAction('error', error.id, error.action.handler)}
                    >
                      {error.action.label}
                      <ExternalLink size={10} />
                    </button>
                  {/if}
                </div>

                {#if dismissible}
                  <button
                    class="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                    on:click={() => dismissIssue('error', error.id)}
                    title="Dismiss error"
                    aria-label="Dismiss error"
                  >
                    <X size={14} style="color: {getColors('error').text};" />
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
                <AlertTriangle size={12} />
                Warnings ({localWarnings.length})
              </h4>
            {/if}
            
            {#each localWarnings as warning}
              <div class="flex items-start gap-3 p-3 rounded-lg border-l-4"
                   style="background: {getColors('warning').bgDark}; 
                          border-color: {getColors('warning').text};">
                <svelte:component 
                  this={AlertTriangle} 
                  size={16} 
                  class="flex-shrink-0 mt-0.5"
                  style="color: {getColors('warning').icon};" 
                />
                
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
                      class="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-black/10"
                      style="color: {getColors('warning').text}; border: 1px solid {getColors('warning').text}30;"
                      on:click={() => executeAction('warning', warning.id, warning.action.handler)}
                    >
                      {warning.action.label}
                      <ExternalLink size={10} />
                    </button>
                  {/if}
                </div>

                {#if dismissible}
                  <button
                    class="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                    on:click={() => dismissIssue('warning', warning.id)}
                    title="Dismiss warning"
                    aria-label="Dismiss warning"
                  >
                    <X size={14} style="color: {getColors('warning').text};" />
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
                <Lightbulb size={12} />
                Suggestions ({localSuggestions.length})
              </h4>
            {/if}
            
            {#each localSuggestions as suggestion}
              <div class="flex items-start gap-3 p-3 rounded-lg border-l-4"
                   style="background: {getColors('suggestion').bgDark}; 
                          border-color: {getColors('suggestion').text};">
                <svelte:component 
                  this={Lightbulb} 
                  size={16} 
                  class="flex-shrink-0 mt-0.5"
                  style="color: {getColors('suggestion').icon};" 
                />
                
                <div class="flex-1 min-w-0">
                  <p class="text-sm" style="color: {getColors('suggestion').text};">
                    {suggestion.message}
                  </p>
                  
                  {#if suggestion.action}
                    <button
                      class="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-black/10"
                      style="color: {getColors('suggestion').text}; border: 1px solid {getColors('suggestion').text}30;"
                      on:click={() => executeAction('suggestion', suggestion.id, suggestion.action.handler)}
                    >
                      {suggestion.action.label}
                      <ExternalLink size={10} />
                    </button>
                  {/if}
                </div>

                {#if dismissible}
                  <button
                    class="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                    on:click={() => dismissIssue('suggestion', suggestion.id)}
                    title="Dismiss suggestion"
                    aria-label="Dismiss suggestion"
                  >
                    <X size={14} style="color: {getColors('suggestion').text};" />
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