<!-- routes/dashboard/performance/+page.svelte -->
<script lang="ts">
  import PerformanceMonitor from "$lib/components/PerformanceMonitor.svelte";
  import SystemInfoMonitor from "$lib/components/SystemInfoMonitor.svelte";
  import { api } from "$lib/api.ts";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  export let data;

  onMount(async () => {
    try {
      let isOwner = await api.isOwner(BigInt(data.user.id));

      console.log(isOwner);


      if (!isOwner) {
        goto("/dashboard");
      }


    } catch (error) {
      console.error("Error checking owner status:", error);
      goto("/dashboard");
    }
  });
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-white mb-6">Bot Performance</h1>
  <p class="text-gray-300 mb-6">Monitor CPU usage, memory, and method execution times for your bot instance.</p>

  <SystemInfoMonitor {data} />

  <div class="my-8"></div>

  <PerformanceMonitor {data} />
</div>