<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  export let fallback: string = "An unexpected error occurred";
  export let showDetails: boolean = false;

  let hasError = false;
  let errorDetails: any = null;
  let showErrorDetails = false;

  // Reset error state when component props change
  $: if (!hasError) {
    errorDetails = null;
  }

  onMount(() => {
    if (browser) {
      // Global error handler for unhandled JavaScript errors
      const handleError = (event: ErrorEvent) => {
        console.error("Global error caught:", event.error);

        // Prevent error propagation to avoid page freeze
        event.preventDefault();

        hasError = true;
        errorDetails = {
          message: event.error?.message || event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        };
      };

      // Global handler for unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error("Unhandled promise rejection:", event.reason);

        // Prevent default handling to avoid page freeze
        event.preventDefault();

        hasError = true;
        errorDetails = {
          message: event.reason?.message || "Unhandled promise rejection",
          reason: event.reason,
          stack: event.reason?.stack
        };
      };

      window.addEventListener("error", handleError);
      window.addEventListener("unhandledrejection", handleUnhandledRejection);

      return () => {
        window.removeEventListener("error", handleError);
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      };
    }
  });

  function retry() {
    hasError = false;
    errorDetails = null;
    showErrorDetails = false;
  }

  function reload() {
    window.location.reload();
  }
</script>

{#if hasError}
  <div
    class="min-h-64 flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
    <div class="text-center max-w-md mx-auto">
      <div class="mb-4">
        <div class="text-4xl mb-2">💥</div>
        <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Something went wrong
        </h3>
        <p class="text-red-600 dark:text-red-300 text-sm mb-4">
          {fallback}
        </p>
      </div>

      <div class="space-x-2 mb-4">
        <button
          on:click={retry}
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
        <button
          on:click={reload}
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
        >
          Reload Page
        </button>
      </div>

      {#if showDetails && errorDetails}
        <div class="mt-4">
          <button
            on:click={() => showErrorDetails = !showErrorDetails}
            class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xs transition-colors"
          >
            {showErrorDetails ? 'Hide' : 'Show'} Error Details
          </button>

          {#if showErrorDetails}
            <div class="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded text-left">
              <pre class="text-xs text-red-800 dark:text-red-200 whitespace-pre-wrap break-words">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <slot />
{/if}