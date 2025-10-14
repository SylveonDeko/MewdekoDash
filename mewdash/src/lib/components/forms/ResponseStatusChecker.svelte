<!-- lib/components/forms/ResponseStatusChecker.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { formsApi, RESPONSE_STATUS_LABELS, type ResponseStatusResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { fade, fly, slide } from "svelte/transition";

  interface Props {
    token: string;
  }

  let { token }: Props = $props();

  let status = $state<ResponseStatusResponse | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let autoRefreshEnabled = $state(false);
  let refreshInterval: number | null = null;

  async function loadStatus() {
    return await loadingStore.wrap("load-status", async () => {
      try {
        loading = true;
        error = null;
        status = await formsApi.getResponseStatus(token);
      } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load response status";
      } finally {
        loading = false;
      }
    }, "api", "Loading status...");
  }

  function copyInviteToClipboard() {
    if (!status?.inviteCode) return;
    const inviteUrl = `https://discord.gg/${status.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      alert("Invite link copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy to clipboard. Link: " + inviteUrl);
    });
  }

  function openInvite() {
    if (!status?.inviteCode) return;
    window.open(`https://discord.gg/${status.inviteCode}`, "_blank");
  }

  function formatDate(dateString: string | undefined): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  function toggleAutoRefresh() {
    autoRefreshEnabled = !autoRefreshEnabled;

    if (autoRefreshEnabled) {
      // Refresh every 30 seconds
      refreshInterval = window.setInterval(() => {
        loadStatus();
      }, 30000);
    } else {
      if (refreshInterval !== null) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }
  }

  onMount(async () => {
    await loadStatus();

    // Cleanup on unmount
    return () => {
      if (refreshInterval !== null) {
        clearInterval(refreshInterval);
      }
    };
  });
</script>

<div class="min-h-screen py-8 px-4"
     style="background: linear-gradient(135deg, {$colorStore.primary}08 0%, {$colorStore.secondary}05 100%);">
  <div class="container mx-auto max-w-2xl">
    {#if loading && !status}
      <div
        class=" rounded-xl border p-12 text-center"
        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        in:fade
      >
        <div
          class="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
          style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
        ></div>
        <p style="color: {$colorStore.muted};">Loading your submission status...</p>
      </div>
    {:else if error}
      <div
        class=" rounded-xl border p-8 text-center"
        style="background: #ef444410; border-color: #ef444430;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <i class="fa-solid fa-triangle-exclamation mb-4" style="color: #ef4444; font-size: 48px; display: block;"></i>
        <h2 class="text-2xl font-bold mb-4" style="color: #ef4444;">Error</h2>
        <p class="text-lg" style="color: {$colorStore.text};">{error}</p>
      </div>
    {:else if status}
      <div class="space-y-6">
        <!-- Header -->
        <div
          class=" rounded-xl border p-8 text-center"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
          in:fade
        >
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style="background: linear-gradient(135deg, {$colorStore.primary}30, {$colorStore.secondary}40);"
          >
            <i class="fa-solid fa-clipboard-check" style="color: {$colorStore.primary}; font-size: 32px;"></i>
          </div>
          <h1 class="text-3xl font-bold mb-3" style="color: {$colorStore.text};">
            Submission Status
          </h1>
          <p class="text-xs font-mono" style="color: {$colorStore.muted};">
            {token}
          </p>
        </div>

        <!-- Status Card -->
        <div
          class=" rounded-xl border p-6"
          style="background: {RESPONSE_STATUS_LABELS[status.status].color}10; border-color: {RESPONSE_STATUS_LABELS[status.status].color}30;"
          in:slide
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
              style="background: {RESPONSE_STATUS_LABELS[status.status].color}20;"
            >
              <i
                class="fa-solid {RESPONSE_STATUS_LABELS[status.status].icon}"
                style="color: {RESPONSE_STATUS_LABELS[status.status].color}; font-size: 32px;"
              ></i>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold mb-2" style="color: {RESPONSE_STATUS_LABELS[status.status].color};">
                {RESPONSE_STATUS_LABELS[status.status].label}
              </h2>
              <div class="space-y-2 text-sm" style="color: {$colorStore.text};">
                {#if status.status === "Pending"}
                  <p>Your submission is awaiting review by the moderation team. You'll be notified once a decision is
                    made.</p>
                  <p class="text-xs" style="color: {$colorStore.muted};">
                    💡 Tip: You can refresh this page or enable auto-refresh to check for updates.
                  </p>
                {:else if status.status === "UnderReview"}
                  <p>Your submission is currently being reviewed by a moderator. A decision will be made soon.</p>
                {:else if status.status === "Approved"}
                  <p>Congratulations! Your submission has been approved.</p>
                  {#if status.reviewedAt}
                    <p class="text-xs" style="color: {$colorStore.muted};">
                      <i class="fa-solid fa-clock mr-1"></i>
                      Reviewed on {formatDate(status.reviewedAt)}
                    </p>
                  {/if}
                  {#if status.reviewNotes}
                    <div class="mt-2 p-3 rounded-lg" style="background: {$colorStore.primary}10;">
                      <div class="font-semibold mb-1" style="color: {$colorStore.text};">Moderator Notes:</div>
                      <p class="whitespace-pre-wrap">{status.reviewNotes}</p>
                    </div>
                  {/if}
                {:else if status.status === "Rejected"}
                  <p>Unfortunately, your submission has been rejected.</p>
                  {#if status.reviewedAt}
                    <p class="text-xs" style="color: {$colorStore.muted};">
                      <i class="fa-solid fa-clock mr-1"></i>
                      Reviewed on {formatDate(status.reviewedAt)}
                    </p>
                  {/if}
                  {#if status.reviewNotes}
                    <div class="mt-2 p-3 rounded-lg" style="background: #ef444410; border: 1px solid #ef444430;">
                      <div class="font-semibold mb-1" style="color: #ef4444;">Rejection Reason:</div>
                      <p class="whitespace-pre-wrap">{status.reviewNotes}</p>
                    </div>
                  {/if}
                {/if}
              </div>
            </div>
          </div>
        </div>

        <!-- Invite Link (for approved join applications) -->
        {#if status.status === "Approved" && status.inviteCode}
          <div
            class=" rounded-xl border p-6"
            style="background: #10B98110; border-color: #10B98130;"
            in:slide
          >
            <h3 class="text-xl font-bold mb-4 flex items-center gap-2" style="color: #10B981;">
              <i class="fa-solid fa-ticket"></i>
              Your Server Invite
            </h3>

            <p class="mb-4 text-sm" style="color: {$colorStore.text};">
              Use this invite link to join the server. Your assigned roles will be automatically applied when you join!
            </p>

            <div class="mb-4">
              <input
                type="text"
                readonly
                value="https://discord.gg/{status.inviteCode}"
                onclick={(e) => e.currentTarget.select()}
                class="w-full p-3 rounded-lg font-mono text-sm"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              />
            </div>

            {#if status.inviteExpiresAt}
              {@const timeRemaining = new Date(status.inviteExpiresAt).getTime() - Date.now()}
              {@const isExpired = timeRemaining <= 0}
              <div
                class="mb-4 p-3 rounded-lg text-sm"
                style="background: {isExpired ? '#ef444410' : $colorStore.primary + '10'}; border: 1px solid {isExpired ? '#ef444430' : $colorStore.primary + '30'};"
              >
                <i class="fa-solid fa-clock mr-1" style="color: {isExpired ? '#ef4444' : $colorStore.primary};"></i>
                {#if isExpired}
                  <span
                    style="color: #ef4444;">This invite has expired. Please contact the server administrators.</span>
                {:else if timeRemaining < 3600000}
                  <span style="color: {$colorStore.text};">Expires in {Math.floor(timeRemaining / 60000)} minutes</span>
                {:else if timeRemaining < 86400000}
                  <span style="color: {$colorStore.text};">Expires in {Math.floor(timeRemaining / 3600000)} hours</span>
                {:else}
                  <span style="color: {$colorStore.text};">Expires on {formatDate(status.inviteExpiresAt)}</span>
                {/if}
              </div>
            {/if}

            <div class="flex gap-3">
              <button
                onclick={copyInviteToClipboard}
                class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              >
                <i class="fa-solid fa-copy mr-2"></i>
                Copy Link
              </button>
              <button
                onclick={openInvite}
                class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] border"
                style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.accent}10); color: {$colorStore.text}; border-color: {$colorStore.secondary}30; box-shadow: 0 4px 20px {$colorStore.secondary}10;"
              >
                <i class="fa-brands fa-discord mr-2"></i>
                Join Server
              </button>
            </div>
          </div>
        {/if}

        <!-- Action Taken (for ban appeals) -->
        {#if status.status === "Approved" && status.actionTaken.includes("Unbanned")}
          <div
            class=" rounded-xl border p-6"
            style="background: #10B98110; border-color: #10B98130;"
            in:slide
          >
            <div class="flex items-start gap-3">
              <i class="fa-solid fa-gavel flex-shrink-0 mt-1" style="color: #10B981; font-size: 24px;"></i>
              <div>
                <h3 class="text-lg font-bold mb-2" style="color: #10B981;">
                  You Have Been Unbanned
                </h3>
                <p class="text-sm mb-3" style="color: {$colorStore.text};">
                  Your ban appeal has been approved and you have been unbanned from the server.
                  You can now rejoin using a server invite link.
                </p>
                <p class="text-xs" style="color: {$colorStore.muted};">
                  If you need help finding an invite link, please contact the server administrators or check the
                  server's public channels.
                </p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Auto-Refresh Toggle -->
        <div
          class=" rounded-xl border p-4"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
          in:slide
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold" style="color: {$colorStore.text};">
                <i class="fa-solid fa-rotate mr-2" style="color: {$colorStore.primary};"></i>
                Auto-Refresh
              </div>
              <p class="text-xs" style="color: {$colorStore.muted};">
                Automatically check for status updates every 30 seconds
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" checked={autoRefreshEnabled} onchange={toggleAutoRefresh} />
              <span
                class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all block"
                style:background-color={autoRefreshEnabled ? $colorStore.primary : "#4b5563"}
              ></span>
            </label>
          </div>
        </div>

        <!-- Manual Refresh Button -->
        <div class="text-center">
          <button
            onclick={loadStatus}
            class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
          >
            <i class="fa-solid fa-sync mr-2"></i>
            Refresh Status
          </button>
        </div>

        <!-- Informational Footer -->
        <div
          class=" rounded-xl border p-4 text-center"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        >
          <p class="text-xs" style="color: {$colorStore.muted};">
            💡 Bookmark this page to check your submission status at any time
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>
