<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api';
    import type { BotReviews } from '$lib/types/models';
    import type { PageData} from './$types';
    import StarRating from '$lib/StarRating.svelte';
    import { marked } from 'marked';
    import DOMPurify from 'dompurify';
    import type {DiscordUser} from "$lib/types/discord.ts";

    export let data: PageData;

    let reviews: BotReviews[] = [];
    let newReview: Partial<BotReviews> = { stars: 0, review: '' };
    let loading = true;
    let error: string | null = null;

    $: user = data.user as DiscordUser | undefined;
    $: userReview = user ? reviews.find(review => review.userId === BigInt(user.id)) : undefined;
    $: userHasReviewed = !!userReview;

    onMount(async () => {
        await fetchReviews();
    });

    async function deleteReview(reviewId: number) {
        if (!user) {
            error = 'You must be logged in to delete a review.';
            return;
        }

        if (!confirm('Are you sure you want to delete your review?')) {
            return;
        }

        try {
            await api.deleteBotReview(reviewId);
            await fetchReviews()
            userHasReviewed = false;
            error = null;
        } catch (err) {
            console.error('Failed to delete review:', err);
            error = 'Failed to delete review. Please try again later.';
        }
    }

    async function fetchReviews() {
        try {
            loading = true;
            reviews = await api.getBotReviews();
            if (user) {
                let userReview = reviews.find(x => x.userId === user.id);
                if (userReview)
                    userHasReviewed = true;
            }

            console.log(reviews)
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            error = 'Failed to load reviews. Please try again later.';
        } finally {
            loading = false;
        }
    }

    async function submitReview() {
        if (!user) {
            error = 'You must be logged in to submit a review.';
            return;
        }

        if (userHasReviewed) {
            error = 'You have already submitted a review.';
            return;
        }

        try {
            const submittedReview = await api.submitBotReview({
                ...newReview,
                userId: BigInt(user.id),
                stars: newReview.stars || 0,
                username: user.username
            });
            reviews = [submittedReview, ...reviews];
            newReview = { stars: 0, review: '' };
            userHasReviewed = true;
        } catch (err) {
            console.error('Failed to submit review:', err);
            error = 'Failed to submit review. Please try again later.';
        }
    }

    function parseMarkdown(text: string): string {
        let parsedText = marked(text);
        parsedText = parseEmojis(parsedText);
        parsedText = parseMentions(parsedText);
        return DOMPurify.sanitize(parsedText);
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function parseEmojis(text: string): string {
        // Parse custom emojis
        const customEmojiPattern = /<:(.*?):(\\d+)>/g;
        text = text.replace(customEmojiPattern, (match, name, id) =>
            `<img class="inline-emoji" src="https://cdn.discordapp.com/emojis/${id}.png" alt="${name}" title="${name}">`
        );

        // Parse Unicode emojis
        const unicodeEmojiPattern = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        text = text.replace(unicodeEmojiPattern, (match) =>
            `<span class="emoji">${match}</span>`
        );

        return text;
    }

    function parseMentions(text: string): string {
        const userMentionPattern = /<@!?(\d+)>/g;
        const channelMentionPattern = /<#(\d+)>/g;
        const roleMentionPattern = /<@&(\d+)>/g;

        // Replace user mentions
        text = text.replace(userMentionPattern, '<span class="mention user-mention">@User</span>');
        // Replace channel mentions
        text = text.replace(channelMentionPattern, '<span class="mention channel-mention">#channel</span>');
        // Replace role mentions
        text = text.replace(roleMentionPattern, '<span class="mention role-mention">@Role</span>');

        return text;
    }
</script>

<svelte:head>
    <title>Mewdeko - Reviews</title>
    <meta content="What users think of Mewdeko."
          name="description">
    <meta content="What users think of Mewdeko."
          property="og:description">
    <meta content="What users think of Mewdeko."
          name="twitter:description">
</svelte:head>

<div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6 text-center text-blue-400">Bot Reviews</h1>

    {#if user && !userHasReviewed}
        <div class="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
            <h2 class="text-2xl font-semibold mb-4 text-blue-300">Submit Your Review</h2>
            <div class="flex items-center mb-4">
                <StarRating bind:value={newReview.stars} />
                <span class="ml-2 text-gray-400">{newReview.stars} out of 5 stars</span>
            </div>
            <textarea
                    bind:value={newReview.review}
                    placeholder="Write your review here (optional, supports Markdown)"
                    class="w-full p-3 mt-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows="4"
            ></textarea>
            <button
                    on:click={submitReview}
                    class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
                Submit Review
            </button>
        </div>
    {:else if !user}
        <div class="bg-yellow-800 text-yellow-200 p-4 rounded-lg mb-6 text-center">
            Please log in to submit a review.
        </div>
    {:else}
        <div class="bg-green-800 text-green-200 p-4 rounded-lg mb-6 text-center">
            Thank you for your review!
        </div>
    {/if}

    {#if error}
        <div class="bg-red-800 text-red-200 p-4 rounded-lg mb-6 text-center">
            {error}
        </div>
    {/if}

    {#if loading}
        <div class="text-center text-gray-400">
            <svg class="animate-spin h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2">Loading reviews...</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 gap-6">
            {#each reviews as review}
                <div class="bg-gray-800 rounded-lg p-6 shadow-lg transition duration-300 ease-in-out transform hover:scale-102 hover:shadow-xl relative">
                    <div class="flex items-center mb-4">
                        <img src={review.avatarUrl} alt="User Avatar" class="w-12 h-12 rounded-full mr-4 border-2 border-blue-400">
                        <div>
                            <span class="font-semibold text-lg text-blue-300">{review.username}</span>
                            <div class="text-gray-400 text-sm">{formatDate(review.dateAdded)}</div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <StarRating value={review.stars} readonly />
                        <span class="ml-2 text-gray-400">{review.stars} out of 5 stars</span>
                    </div>
                    {#if review.review}
                        <div class="mt-4 review-content prose prose-sm max-w-none prose-invert">
                            {@html parseMarkdown(review.review)}
                        </div>
                    {/if}
                    {#if user && user.id === review.userId}
                        <button
                                on:click={() => deleteReview(review.id)}
                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full text-sm transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Delete
                        </button>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }

    .review-content :global(.inline-emoji) {
        display: inline-block;
        width: 1.375em;
        height: 1.375em;
        vertical-align: bottom;
    }

    .review-content :global(.emoji) {
        display: inline-block;
        font-size: 1.375em;
        line-height: 1;
    }

    .review-content :global(.mention) {
        background-color: rgba(88, 101, 242, 0.3);
        color: #dee0fc;
        border-radius: 3px;
        padding: 0 2px;
        font-weight: 500;
    }

    .review-content :global(.user-mention), .review-content :global(.role-mention) {
        color: #dee0fc;
    }

    .review-content :global(.channel-mention) {
        color: #7289da;
    }

    .review-content :global(h1) {
        font-size: 1.5em;
        font-weight: bold;
        margin-top: 0.67em;
        margin-bottom: 0.67em;
    }

    .review-content :global(h2) {
        font-size: 1.3em;
        font-weight: bold;
        margin-top: 0.83em;
        margin-bottom: 0.83em;
    }

    .review-content :global(h3) {
        font-size: 1.1em;
        font-weight: bold;
        margin-top: 1em;
        margin-bottom: 1em;
    }

    .review-content :global(strong) {
        font-weight: bold;
    }

    .review-content :global(em) {
        font-style: italic;
    }

    .review-content :global(u) {
        text-decoration: underline;
    }

    .review-content :global(s) {
        text-decoration: line-through;
    }

    .review-content :global(ul) {
        list-style-type: disc;
        padding-left: 1.5em;
    }

    .review-content :global(ol) {
        list-style-type: decimal;
        padding-left: 1.5em;
    }

    .review-content :global(blockquote) {
        border-left: 4px solid #4f545c;
        margin: 0;
        padding-left: 1em;
    }

    .review-content :global(code) {
        background-color: #2f3136;
        border-radius: 3px;
        padding: 0.2em 0.4em;
        font-family: monospace;
    }

    .review-content :global(pre) {
        background-color: #2f3136;
        border-radius: 3px;
        padding: 0.5em;
        overflow-x: auto;
    }

    .review-content :global(pre code) {
        background-color: transparent;
        padding: 0;
    }

    .review-content :global(a) {
        color: #00b0f4;
        text-decoration: none;
    }

    .review-content :global(a:hover) {
        text-decoration: underline;
    }

    :global(.prose) {
        color: #e2e8f0;
    }

    :global(.prose a) {
        color: #60a5fa;
    }

    :global(.prose strong) {
        color: #f8fafc;
    }

    :global(.prose code) {
        color: #e2e8f0;
        background-color: #374151;
        padding: 0.2em 0.4em;
        border-radius: 0.25em;
    }

    :global(.prose pre) {
        background-color: #1f2937;
        border-radius: 0.375em;
    }

    :global(.prose blockquote) {
        border-left-color: #4b5563;
        color: #9ca3af;
    }
</style>