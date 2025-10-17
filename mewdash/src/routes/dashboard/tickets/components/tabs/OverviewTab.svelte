<!-- components/tabs/OverviewTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    statistics: any;
    ticketActivity: any[];
    staffResponseStats: any[];
    panels: any[];
    priorities: any[];
    tags: any[];
    cases: any[];
    activeTab: string;
  }

  let {
    statistics,
    ticketActivity,
    staffResponseStats,
    panels,
    priorities,
    tags,
    cases,
    activeTab = $bindable()
  }: Props = $props();

  // Helper function to parse TimeSpan string to minutes
  function parseTimeSpanToMinutes(timeSpan: any): number {
    if (!timeSpan) return 0;
    if (typeof timeSpan === "number") return timeSpan;

    // Try parsing as numeric string first (e.g., "0.06966466277777777")
    if (typeof timeSpan === "string") {
      const numericValue = parseFloat(timeSpan);
      if (!isNaN(numericValue)) {
        // If it's a small decimal, it might be hours, convert to minutes
        return numericValue < 24 ? numericValue * 60 : numericValue;
      }

      // Parse TimeSpan format: "00:05:30" (HH:MM:SS) or "1.00:05:30" (D.HH:MM:SS)
      const parts = timeSpan.split(":");
      if (parts.length === 3) {
        const hours = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1]);
        const seconds = parseFloat(parts[2]);
        return hours * 60 + minutes + seconds / 60;
      }
    }

    return 0;
  }

  // Helper function to parse TimeSpan string to hours
  function parseTimeSpanToHours(timeSpan: any): number {
    if (!timeSpan) return 0;
    if (typeof timeSpan === "number") return timeSpan;

    // Try parsing as numeric string first (e.g., "0.06966466277777777")
    if (typeof timeSpan === "string") {
      const numericValue = parseFloat(timeSpan);
      if (!isNaN(numericValue)) {
        // Already in hours format
        return numericValue;
      }

      // Parse TimeSpan format and convert to hours
      const parts = timeSpan.split(":");
      if (parts.length === 3) {
        const hours = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1]);
        const seconds = parseFloat(parts[2]);
        return hours + minutes / 60 + seconds / 3600;
      }
    }

    return 0;
  }

  const statCards = $derived([
    {
      title: "Total Tickets",
      value: statistics?.totalTickets || 0,
      icon: "fa-ticket",
      color: $colorStore.primary
    },
    {
      title: "Open Tickets",
      value: statistics?.openTickets || 0,
      icon: "fa-folder-open",
      color: "#10b981"
    },
    {
      title: "Closed Tickets",
      value: statistics?.closedTickets || 0,
      icon: "fa-folder-closed",
      color: "#6b7280"
    },
    {
      title: "Active Panels",
      value: panels.length || 0,
      icon: "fa-table-cells",
      color: $colorStore.secondary
    }
  ]);

  const quickLinks = [
    {
      title: "Manage Panels",
      description: "Create and configure ticket panels",
      icon: "fa-table-cells",
      tab: "panels"
    },
    {
      title: "Configuration",
      description: "Set up priorities, tags, and channels",
      icon: "fa-sliders",
      tab: "configuration"
    },
    {
      title: "View Cases",
      description: "Manage linked ticket cases",
      icon: "fa-folder-open",
      tab: "cases"
    },
    {
      title: "Advanced Tools",
      description: "Batch operations and blacklist",
      icon: "fa-screwdriver-wrench",
      tab: "advanced"
    }
  ];
</script>

<!-- Statistics Cards -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {#each statCards as card}
    <div class="p-6 rounded-xl transition-all hover:scale-[1.02]"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium" style="color: {$colorStore.muted}">{card.title}</p>
          <p class="text-3xl font-bold mt-2" style="color: {$colorStore.text}">{card.value}</p>
        </div>
        <div class="p-3 rounded-lg" style="background: {card.color}20;">
          <i class="fa-solid {card.icon}" style="color: {card.color}; font-size: 24px;"></i>
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- Performance Metrics -->
{#if statistics}
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <!-- Response Times -->
    <div class="p-6 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-clock" style="color: {$colorStore.primary};"></i>
        Response Times
      </h3>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span style="color: {$colorStore.muted}">Average Response</span>
          <span class="font-semibold" style="color: {$colorStore.text}">
            {parseTimeSpanToMinutes(statistics.averageResponseTime).toFixed(1)} min
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span style="color: {$colorStore.muted}">Average Resolution</span>
          <span class="font-semibold" style="color: {$colorStore.text}">
            {parseTimeSpanToHours(statistics.averageResolutionTime).toFixed(1)} hrs
          </span>
        </div>
      </div>
    </div>

    <!-- Tickets by Priority -->
    <div class="p-6 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-solid fa-flag" style="color: {$colorStore.primary};"></i>
        Tickets by Priority
      </h3>
      {#if statistics.ticketsByPriority && Object.keys(statistics.ticketsByPriority).length > 0}
        <div class="space-y-2">
          {#each Object.entries(statistics.ticketsByPriority) as [priority, count]}
            <div class="flex justify-between items-center">
              <span style="color: {$colorStore.muted}">{priority || "None"}</span>
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                {count}
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-sm" style="color: {$colorStore.muted}">No priority data available</p>
      {/if}
    </div>
  </div>
{/if}

<!-- Staff Response Stats -->
{#if staffResponseStats.length > 0}
  <div class="p-6 rounded-xl mb-6"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
      <i class="fa-solid fa-user-headset" style="color: {$colorStore.primary};"></i>
      Staff Performance
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each staffResponseStats as staff}
        <div class="p-4 rounded-lg"
             style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
          <p class="font-medium" style="color: {$colorStore.text}">{staff.staffName}</p>
          <p class="text-sm mt-1" style="color: {$colorStore.muted}">
            Avg Response: {parseTimeSpanToMinutes(staff.averageResponseTimeMinutes).toFixed(1)} min
          </p>
        </div>
      {/each}
    </div>
  </div>
{/if}

<!-- System Summary -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div class="p-6 rounded-xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
    <div class="flex items-center gap-3 mb-2">
      <i class="fa-solid fa-table-cells" style="color: {$colorStore.primary}; font-size: 20px;"></i>
      <span class="font-semibold" style="color: {$colorStore.text}">Panels</span>
    </div>
    <p class="text-2xl font-bold" style="color: {$colorStore.text}">{panels.length}</p>
    <p class="text-sm mt-1" style="color: {$colorStore.muted}">Active ticket panels</p>
  </div>

  <div class="p-6 rounded-xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
    <div class="flex items-center gap-3 mb-2">
      <i class="fa-solid fa-flag" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
      <span class="font-semibold" style="color: {$colorStore.text}">Priorities</span>
    </div>
    <p class="text-2xl font-bold" style="color: {$colorStore.text}">{priorities.length}</p>
    <p class="text-sm mt-1" style="color: {$colorStore.muted}">Priority levels configured</p>
  </div>

  <div class="p-6 rounded-xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
    <div class="flex items-center gap-3 mb-2">
      <i class="fa-solid fa-tags" style="color: {$colorStore.accent}; font-size: 20px;"></i>
      <span class="font-semibold" style="color: {$colorStore.text}">Tags</span>
    </div>
    <p class="text-2xl font-bold" style="color: {$colorStore.text}">{tags.length}</p>
    <p class="text-sm mt-1" style="color: {$colorStore.muted}">Available tags</p>
  </div>

  <div class="p-6 rounded-xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
    <div class="flex items-center gap-3 mb-2">
      <i class="fa-solid fa-folder-open" style="color: {$colorStore.primary}; font-size: 20px;"></i>
      <span class="font-semibold" style="color: {$colorStore.text}">Cases</span>
    </div>
    <p class="text-2xl font-bold" style="color: {$colorStore.text}">{cases.length}</p>
    <p class="text-sm mt-1" style="color: {$colorStore.muted}">Ticket cases</p>
  </div>
</div>

<!-- Quick Links -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  {#each quickLinks as link}
    <button
      class="p-6 rounded-xl text-left transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20; focus:ring-color: {$colorStore.primary};"
      onclick={() => activeTab = link.tab}
    >
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-lg shrink-0" style="background: {$colorStore.primary}20;">
          <i class="fa-solid {link.icon}" style="color: {$colorStore.primary}; font-size: 24px;"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-lg mb-1" style="color: {$colorStore.text}">{link.title}</h4>
          <p class="text-sm" style="color: {$colorStore.muted}">{link.description}</p>
        </div>
        <i class="fa-solid fa-chevron-right shrink-0 mt-2" style="color: {$colorStore.muted};"></i>
      </div>
    </button>
  {/each}
</div>
