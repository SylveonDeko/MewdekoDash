<!-- lib/Notification.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  export let message: string;
  export let type: "success" | "error" = "success";
</script>

<div
  class="fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50"
  class:bg-green-500={type === "success"}
  class:bg-red-500={type === "error"}
  transition:fade={{ duration: 300 }}
>
  <p class="text-white font-semibold">{message}</p>
</div>
