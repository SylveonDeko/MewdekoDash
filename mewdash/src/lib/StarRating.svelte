<!-- src/lib/components/StarRating.svelte -->
<script lang="ts">
    export let value: number = 0;
    export let readonly: boolean = false;
    export let max: number = 5;

    let hoveredValue: number | null = null;

    function handleClick(star: number) {
        if (!readonly) {
            value = star === value ? star - 1 : star;
        }
    }

    function handleMouseEnter(star: number) {
        if (!readonly) {
            hoveredValue = star;
        }
    }

    function handleMouseLeave() {
        hoveredValue = null;
    }

    $: displayValue = hoveredValue !== null ? hoveredValue : value;
</script>

<div
        class="star-rating"
        on:mouseleave={handleMouseLeave}
        role="slider"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax={max}
        aria-label="Star rating"
>
    {#each Array(max) as _, i}
        <button
                class="star"
                class:filled={i < displayValue}
                disabled={readonly}
                on:click={() => handleClick(i + 1)}
                on:mouseenter={() => handleMouseEnter(i + 1)}
                aria-label={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
            </svg>
        </button>
    {/each}
</div>

<style>
    .star-rating {
        display: inline-flex;
        gap: 0.25rem;
    }

    .star {
        background: none;
        border: none;
        cursor: pointer;
        color: #ccc;
        transition: color 0.2s ease-in-out, transform 0.2s ease-in-out;
        padding: 0;
    }

    .star:hover {
        transform: scale(1.1);
    }

    .star.filled {
        color: #ffd700;
    }

    .star:disabled {
        cursor: default;
        transform: none;
    }

    .star svg {
        width: 1.5rem;
        height: 1.5rem;
    }
</style>