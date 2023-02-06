<script lang="ts">
    export let links: { href: string, text: string }[];
</script>

<div class="flex flex-row mt-12 overflow-hidden rounded-full font-bold text-2xl text-mewd-white">
    {#each links as link}
        <a href={link.href} class="px-4 py-2 hover:bg-mewd-dark-yellow bg-mewd-yellow" target="_blank" rel="noreferrer">
            {link.text}
        </a>
    {/each}
</div>