<script lang="ts">
    export let title: string;
    export let description: string;
    export let cta: { href: string, text: string };
</script>

<div class="w-full h-max grid grid-cols-1 justify-center rounded-lg bg-slate-200 mx-8 py-6">
    {#if title}
        <h2 class="pt-2 px-6 text-center text-2xl font-bold">{title}</h2>
    {/if}
    {#if description}
        <p class="pt-2 px-6 text-center text-md font-bold">{@html description}</p>
    {/if}
    {#if $$slots.default}
        <div class="pt-6 px-10 flex justify-center">
            <div class="w-full h-max rounded-xl overflow-hidden">
                <slot/>
            </div>
        </div>
    {/if}
    {#if cta}
        <div class="pt-4 flex justify-center">
            <a class="w-max h-max py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full"
               href="{cta.href}" target="_blank">{cta.text} </a>
        </div>
    {/if}
</div>