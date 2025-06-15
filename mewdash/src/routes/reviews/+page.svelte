<!-- routes/reviews/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import type { BotReviews } from "$lib/types/models";
  import type { PageData } from "./$types";
  import StarRating from "$lib/components/StarRating.svelte";
  import { marked } from "marked";
  import DOMPurify from "dompurify";
  import type { DiscordUser } from "$lib/types/discord.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { fade, fly } from "svelte/transition";

  export let data: PageData;

  let reviews: BotReviews[] = [];
  let newReview: Partial<BotReviews> = { stars: 0, review: "" };
  let loading = true;
  let error: string | null = null;
  let previewContent = "";
  let reviewsWithParsedContent: (BotReviews & { parsedReview?: string })[] = [];

  $: user = data.user as DiscordUser | undefined;
  $: userHasReviewed = false;

  onMount(async () => {
    await fetchReviews();
    setupMarkedOptions();
  });

  function setupMarkedOptions() {
    marked.setOptions({
      gfm: true,
      breaks: true,
      pedantic: false,
    });
  }

  async function parseMarkdown(text: string): Promise<string> {
    let parsedText = await marked.parse(text);
    parsedText = parseEmojis(parsedText);
    parsedText = parseMentions(parsedText);
    return DOMPurify.sanitize(parsedText);
  }

  async function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    newReview.review = target.value;
    previewContent = await parseMarkdown(newReview.review);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "Enter") {
      submitReview();
    }
  }

  async function fetchReviews() {
    try {
      loading = true;
      reviews = await api.getBotReviews();
      // Parse markdown for all reviews
      reviewsWithParsedContent = await Promise.all(
        reviews.map(async (review) => ({
          ...review,
          parsedReview: review.review ? await parseMarkdown(review.review) : ""
        }))
      );
      if (user) {
        let review = reviews.find((review) => review.userId === user.id);
        if (review) userHasReviewed = true;
      }
    } catch (err: unknown) {
      logger.error("Failed to fetch reviews:", err);
      error = "Failed to load reviews. Please try again later.";
    } finally {
      loading = false;
    }
  }

  async function submitReview() {
    if (!user) {
      error = "You must be logged in to submit a review.";
      return;
    }

    if (userHasReviewed) {
      error = "You have already submitted a review.";
      return;
    }

    try {
      const submittedReview = await api.submitBotReview({
        ...newReview,
        userId: BigInt(user.id),
        stars: newReview.stars || 0,
        username: user.username,
      });
      reviews = [submittedReview, ...reviews];
      newReview = { stars: 0, review: "" };
      userHasReviewed = true;
      error = null;
    } catch (err: unknown) {
      logger.error("Failed to submit review:", err);
      error = "Failed to submit review. Please try again later.";
    }
  }

  function parseEmojis(text: string): string {
    // Parse custom emojis
    const customEmojiPattern = /<:(.*?):(\\d+)>/g;
    text = text.replace(
      customEmojiPattern,
      (match, name, id) =>
        `<img class="inline-emoji" src="https://cdn.discordapp.com/emojis/${id}.png" alt="${name}" title="${name}">`,
    );

    // Parse Unicode emojis
    const unicodeEmojiPattern =
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    text = text.replace(
      unicodeEmojiPattern,
      (match) => `<span class="emoji">${match}</span>`,
    );

    return text;
  }

  function parseMentions(text: string): string {
    const userMentionPattern = /<@!?(\d+)>/g;
    const channelMentionPattern = /<#(\d+)>/g;
    const roleMentionPattern = /<@&(\d+)>/g;

    // Replace user mentions
    text = text.replace(
      userMentionPattern,
      '<span class="mention user-mention">@User</span>',
    );
    // Replace channel mentions
    text = text.replace(
      channelMentionPattern,
      '<span class="mention channel-mention">#channel</span>',
    );
    // Replace role mentions
    text = text.replace(
      roleMentionPattern,
      '<span class="mention role-mention">@Role</span>',
    );

    return text;
  }
</script>

<svelte:head>
  <title>Mewdeko - Reviews</title>
  <meta content="What users think of Mewdeko." name="description" />
  <meta content="What users think of Mewdeko." property="og:description" />
  <meta content="What users think of Mewdeko." name="twitter:description" />
</svelte:head>

<main
  class="min-h-screen"
  style="--color-primary: {$colorStore.primary};
         --color-secondary: {$colorStore.secondary};
         --color-accent: {$colorStore.accent};
         --color-text: {$colorStore.text};
         --color-muted: {$colorStore.muted};
         background: linear-gradient(135deg, {$colorStore.primary}10 0%, {$colorStore.secondary}05 100%);"
>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-4xl font-bold mb-8 text-center" in:fade={{ duration: 300 }} style="color: {$colorStore.text}">Bot
      Reviews</h1>

  {#if user && !userHasReviewed && !loading}
    <div class="rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20); border: 1px solid {$colorStore.primary}30;"
         in:fly={{ y: 20, duration: 300, delay: 100 }}>
      <h2 class="text-2xl font-semibold mb-6" style="color: {$colorStore.text}">
        Submit Your Review
      </h2>
      <div class="flex items-center mb-6">
        <StarRating bind:value={newReview.stars} />
        <span class="ml-4" style="color: {$colorStore.muted}" aria-live="polite"
          >{newReview.stars} out of 5 stars</span
        >
      </div>
      <div class="mb-6">
        <label
          for="review-input"
          class="block text-sm font-medium mb-2"
          style="color: {$colorStore.muted}"
          >Write your review (supports Markdown)</label
        >
        <textarea
          id="review-input"
          bind:value={newReview.review}
          on:input={handleInput}
          on:keydown={handleKeydown}
          placeholder="Write your review here..."
          class="w-full p-4 rounded-xl focus:ring-2 focus:outline-none min-h-[200px] resize-y transition-all duration-300 backdrop-blur-sm"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text}; --tw-ring-color: {$colorStore.accent};"
          rows="8"
        ></textarea>
      </div>
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-2" style="color: {$colorStore.muted}">Preview</h3>
        <div
          class="p-4 rounded-xl prose prose-sm max-w-none backdrop-blur-sm transition-all duration-300"
          style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
        >
          {@html previewContent ||
          `<p style="color: ${$colorStore.muted}">Preview will appear here as you type...</p>`}
        </div>
      </div>
      <button
        on:click={submitReview}
        class="w-full sm:w-auto mt-4 font-bold py-3 px-8 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 active:scale-95 backdrop-blur-sm"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}80, {$colorStore.gradientMid}90); color: white; border: 1px solid {$colorStore.primary}50; --tw-ring-color: {$colorStore.accent};"
      >
        Submit Review
      </button>
    </div>
  {:else if !user}
    <div
      class="p-6 rounded-xl mb-8 text-center shadow-xl backdrop-blur-sm transition-all duration-300"
      style="background: linear-gradient(135deg, #F59E0B20, #D9770630); border: 1px solid #F59E0B40; color: {$colorStore.text};"
      role="alert"
      in:fly={{ y: 20, duration: 300 }}
    >
      <p class="text-xl font-semibold">Please log in to submit a review.</p>
    </div>
  {:else if userHasReviewed}
    <div
      class="p-6 rounded-xl mb-8 text-center shadow-xl backdrop-blur-sm transition-all duration-300"
      style="background: linear-gradient(135deg, #10B98120, #059669t30); border: 1px solid #10B98140; color: {$colorStore.text};"
      role="status"
      in:fly={{ y: 20, duration: 300 }}
    >
      <p class="text-xl font-semibold">Thank you for your review!</p>
    </div>
  {/if}

  {#if error}
    <div
      class="p-6 rounded-xl mb-8 text-center shadow-xl backdrop-blur-sm transition-all duration-300"
      style="background: linear-gradient(135deg, #DC262620, #B9131930); border: 1px solid #DC262640; color: {$colorStore.text};"
      role="alert"
      in:fly={{ y: 20, duration: 300 }}
    >
      <p class="text-xl font-semibold">{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="text-center p-8" style="color: {$colorStore.muted}" aria-live="polite" in:fade={{ duration: 300 }}>
      <svg
        class="animate-spin h-12 w-12 mx-auto mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style="color: {$colorStore.primary}"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-xl">Loading reviews...</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-8">
      {#each reviewsWithParsedContent as review, index}
        <div
          class="rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20); border: 1px solid {$colorStore.primary}30;"
          in:fly={{ y: 20, duration: 300, delay: index * 100 }}
        >
          <div class="flex items-center mb-4">
            <img
              src={review.avatarUrl}
              alt=""
              class="w-12 h-12 rounded-full mr-4 border-2 border-blue-400"
            />
            <div>
              <h3 class="font-semibold text-xl text-blue-300">
                {review.username}
              </h3>
              <p class="text-gray-400 text-sm">
                {new Date(review.dateAdded).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div class="mb-4">
            <StarRating value={review.stars} readonly />
            <span class="ml-2" style="color: {$colorStore.muted}">{review.stars} out of 5 stars</span
            >
          </div>
          {#if review.review}
            <div class="mt-4 prose prose-sm max-w-none" style="color: {$colorStore.text}">
              {@html review.parsedReview || ""}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
  </div>
</main>

<style>
    /* Custom prose styling for dynamic colors */
    :global(.prose) {
        color: var(--color-text) !important;
    }

    :global(.prose h1),
    :global(.prose h2),
    :global(.prose h3),
    :global(.prose h4),
    :global(.prose h5),
    :global(.prose h6) {
        color: var(--color-text) !important;
  }

    :global(.prose p) {
        color: var(--color-text) !important;
    }

    :global(.prose a) {
        color: var(--color-primary) !important;
    }
  
  :global(.prose) {
    color: #d1d5db;
  }
  :global(.prose a) {
    color: #60a5fa;
  }
  :global(.prose a:hover) {
    color: #93c5fd;
  }
  :global(.prose strong) {
    color: #f3f4f6;
  }
  :global(.prose ul, .prose ol) {
    padding-left: 1.5rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  :global(.prose li) {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  :global(.prose ul) {
    list-style-type: none;
  }
  :global(.prose ul li::before) {
    content: "•";
    color: #60a5fa;
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
    font-size: 1.25em;
  }
  :global(.prose ul ul, .prose ol ul) {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  :global(.prose ul ul li::before) {
    content: "◦";
    color: #9ca3af;
  }
  :global(.prose ul ul ul li::before) {
    content: "▪";
    color: #6b7280;
    font-size: 1em;
  }
  :global(.prose ol) {
    list-style-type: decimal;
  }
  :global(.prose ol ol) {
    list-style-type: lower-alpha;
  }
  :global(.prose ol ol ol) {
    list-style-type: lower-roman;
  }
  :global(.prose blockquote) {
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
    font-style: italic;
    color: #9ca3af;
  }
  :global(.prose code) {
    background-color: #374151;
    color: #93c5fd;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
  }
  :global(.prose pre) {
    background-color: #374151;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
  }
  :global(.prose img) {
    border-radius: 0.5rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  :global(.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6) {
    color: #93c5fd;
    font-weight: 600;
  }
  :global(.prose table) {
    width: 100%;
    border-collapse: collapse;
  }
  :global(.prose th, .prose td) {
    border: 1px solid #4b5563;
    padding: 0.5rem 1rem;
  }
  :global(.prose th) {
    background-color: #374151;
    font-weight: 600;
  }
  :global(.inline-emoji) {
    display: inline-block;
    width: 1.25rem;
    height: 1.25rem;
    vertical-align: text-bottom;
  }
  :global(.emoji) {
    display: inline-block;
    font-size: 1.25em;
  }
  :global(.mention) {
    background-color: rgba(59, 130, 246, 0.3);
    color: #93c5fd;
    border-radius: 0.25rem;
    padding: 0.125rem 0.25rem;
    font-weight: 500;
  }
</style>
