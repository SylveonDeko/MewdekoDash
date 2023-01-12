<script lang="ts">
    import Elem from "$lib/util/FluidElement.svelte"

    export let breakpoints = ["md", "lg", "xl"]
    const maxBreaks = Object.keys($$slots).length;
</script>
<div class="flex flex-wrap justify-center">
    {#if $$slots["element-1"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-1"/>
        </Elem>
    {/if}
    {#if $$slots["element-2"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-2"/>
        </Elem>
    {/if}
    {#if $$slots["element-3"] }
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-3"/>
        </Elem>
    {/if}
    {#if $$slots["element-4"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-4"/>
        </Elem>
    {/if}
    {#if $$slots["element-5"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-5"/>
        </Elem>
    {/if}
    {#if $$slots["element-6"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-6"/>
        </Elem>
    {/if}
    {#if $$slots["element-7"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-7"/>
        </Elem>
    {/if}
    {#if $$slots["element-8"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-8"/>
        </Elem>
    {/if}
    {#if $$slots["element-9"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-9"/>
        </Elem>
    {/if}
    {#if $$slots["element-10"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-10"/>
        </Elem>
    {/if}
    {#if $$slots["element-11"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-11"/>
        </Elem>
    {/if}
    {#if $$slots["element-12"]}
        <Elem breakpoints="{breakpoints}" maxBreaks="{maxBreaks}">
            <slot name="element-12"/>
        </Elem>
    {/if}
</div>

