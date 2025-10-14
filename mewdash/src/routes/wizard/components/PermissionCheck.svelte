<!--
@component
Permission check component for verifying bot permissions during wizard
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    permission: string;
    hasPermission: boolean;
    importance?: string | number;
    description: string;
    requiredForFeatures?: string[];
  }

  let {
    permission,
    hasPermission,
    importance = 'recommended',
    description,
    requiredForFeatures = []
  }: Props = $props();

  // Convert importance to lowercase string for consistency
  let importanceString = $derived(typeof importance === 'string' 
    ? importance.toLowerCase() 
    : importance === 0 ? 'critical' : importance === 1 ? 'recommended' : 'optional');

  let statusColor = $derived(hasPermission 
    ? $colorStore.accent 
    : importanceString === 'critical' 
      ? '#ef4444' 
      : importanceString === 'recommended' 
        ? '#f59e0b' 
        : $colorStore.muted);

    let statusIcon = $derived(hasPermission ? "fa-check" : "fa-xmark");

  let importanceInfo = $derived({
    "critical": { label: "Critical", color: "#ef4444", icon: "fa-bell" },
    "recommended": { label: "Recommended", color: "#f59e0b", icon: "fa-bell" },
    "optional": { label: "Optional", color: $colorStore.muted, icon: "fa-circle-info" }
  }[importanceString] || { label: "Unknown", color: $colorStore.muted, icon: "fa-circle-info" });
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
            class="flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0"
    style="
      background: {statusColor}15;
      border-color: {statusColor}40;
      color: {statusColor};
    "
  >
      <i class="fa-solid {statusIcon}" style="font-size: 16px;"></i>
  </div>

  <!-- Permission details -->
  <div class="flex-1 min-w-0">
    <div class="flex items-start justify-between gap-4 mb-2">
      <h4 class="font-semibold" style="color: {$colorStore.text};">
        {permission}
      </h4>
      
      <!-- Importance badge -->
        <div class="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium shrink-0"
           style="background: {importanceInfo.color}15; color: {importanceInfo.color};">
          <i class="fa-solid {importanceInfo.icon}" style="font-size: 12px;"></i>
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
        {#each requiredForFeatures as feature (feature)}
          <span class="px-2 py-1 rounded-sm text-xs font-medium"
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
        <i class="fa-solid {statusIcon}" style="font-size: 16px;"></i>
        {hasPermission ? 'Permission granted' : 'Permission missing'}
      </div>
      
      {#if !hasPermission && importance === 'critical'}
        <span class="text-xs px-2 py-1 rounded-sm font-medium"
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