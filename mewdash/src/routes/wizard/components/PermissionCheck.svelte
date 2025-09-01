<!--
@component
Permission check component for verifying bot permissions during wizard
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { Check, X, AlertCircle, Info, ExternalLink } from "lucide-svelte";

  export let permission: string;
  export let hasPermission: boolean;
  export let importance: string | number = 'recommended';
  export let description: string;
  export let requiredForFeatures: string[] = [];

  // Convert importance to lowercase string for consistency
  $: importanceString = typeof importance === 'string' 
    ? importance.toLowerCase() 
    : importance === 0 ? 'critical' : importance === 1 ? 'recommended' : 'optional';

  $: statusColor = hasPermission 
    ? $colorStore.accent 
    : importanceString === 'critical' 
      ? '#ef4444' 
      : importanceString === 'recommended' 
        ? '#f59e0b' 
        : $colorStore.muted;

  $: statusIcon = hasPermission ? Check : X;

  $: importanceInfo = {
    'critical': { label: 'Critical', color: '#ef4444', icon: AlertCircle },
    'recommended': { label: 'Recommended', color: '#f59e0b', icon: AlertCircle },
    'optional': { label: 'Optional', color: $colorStore.muted, icon: Info }
  }[importanceString] || { label: 'Unknown', color: $colorStore.muted, icon: Info };
</script>

<div 
  class="permission-check flex items-start gap-4 p-4 rounded-lg border transition-all duration-200"
  style="
    background: {hasPermission 
      ? $colorStore.accent + '08' 
      : importance === 'critical' 
        ? '#ef444408' 
        : $colorStore.primary + '05'};
    border-color: {statusColor}30;
  "
>
  <!-- Status icon -->
  <div 
    class="flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0"
    style="
      background: {statusColor}15;
      border-color: {statusColor}40;
      color: {statusColor};
    "
  >
    <svelte:component this={statusIcon} class="w-4 h-4" />
  </div>

  <!-- Permission details -->
  <div class="flex-1 min-w-0">
    <div class="flex items-start justify-between gap-4 mb-2">
      <h4 class="font-semibold" style="color: {$colorStore.text};">
        {permission}
      </h4>
      
      <!-- Importance badge -->
      <div class="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium flex-shrink-0"
           style="background: {importanceInfo.color}15; color: {importanceInfo.color};">
        <svelte:component this={importanceInfo.icon} class="w-3 h-3" />
        {importanceInfo.label}
      </div>
    </div>

    <!-- Description -->
    <p class="text-sm mb-3" style="color: {$colorStore.muted};">
      {description}
    </p>

    <!-- Required for features -->
    {#if requiredForFeatures.length > 0}
      <div class="flex flex-wrap gap-1 mb-3">
        <span class="text-xs font-medium" style="color: {$colorStore.muted};">Required for:</span>
        {#each requiredForFeatures as feature}
          <span class="px-2 py-1 rounded text-xs font-medium"
                style="background: {$colorStore.primary}10; color: {$colorStore.primary};">
            {feature}
          </span>
        {/each}
      </div>
    {/if}

    <!-- Status message -->
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1 text-sm font-medium"
           style="color: {statusColor};">
        <svelte:component this={statusIcon} class="w-4 h-4" />
        {hasPermission ? 'Permission granted' : 'Permission missing'}
      </div>
      
      {#if !hasPermission && importance === 'critical'}
        <span class="text-xs px-2 py-1 rounded font-medium"
              style="background: #ef444415; color: #ef4444;">
          Action required
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  .permission-check {
    user-select: none;
  }
</style>