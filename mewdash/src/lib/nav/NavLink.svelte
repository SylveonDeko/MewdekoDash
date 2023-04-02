<script lang="ts">
    type Item = {
        title: string,
        wrapped: boolean,
        href?: string,
        children?: { title: string, href: string }[]
    }
    export let item: Item
    export let current: string
    let openOverride: boolean = false
</script>
<!-- Desktop - hidden md:block -->
{#if item.wrapped}
    <div on:mouseleave={()=>{openOverride=false}}>
        <details class="group hidden md:block py-1 px-2" bind:open={openOverride}>
            <summary
                    class="cursor-pointer flex list-none rounded text-mewd-offwhite hover:text-mewd-white stroke-mewd-offwhite hover:stroke-mewd-white">
                {item.title}
                <svg viewBox="5 7 14 9" stroke-width="2" fill="none" stroke-linecap="round"
                     class="ml-1 w-4 group-open:rotate-180">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </summary>
            <div class="absolute -translate-y-2 pb-6 pr-7 text-transparent">
                {item.title}
            </div>
            <div class="flex flex-col mt-2 -translate-x-2 absolute bg-mewd-light-grey rounded overflow-hidden">
                {#each item.children as child}
                    <!--a aria-current="{child.href===current?'page':'false'}" href="{child.href}"
                       class="block text-mewd-white pl-4 pr-8  py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{child.title}</a-->
                    <a aria-current="{child.href===current?'page':'false'}"
                       class="py-1 pl-2 pr-4 hover:text-mewd-white  {child.href===current?
        'text-white bg-mewd-yellow rounded text-mewd-white':
        'rounded text-mewd-offwhite hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
                       href="{child.href}">
                        {child.title}
                    </a>
                {/each}
            </div>
        </details>
    </div>
{:else}
    <a aria-current="{item.href===current?'page':'false'}"
       class="hidden md:flex py-1 px-2 hover:text-mewd-white{item.href===current?
        'text-white bg-mewd-yellow rounded text-mewd-white':
        ' rounded text-mewd-offwhite hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
       href="{item.href}">
        {item.title}
    </a>
{/if}
<!-- Mobile - md:hidden -->
{#if item.wrapped}
    {#each item.children as child}
        <a aria-current="{child.href===current?'page':'false'}"
           class="md:hidden py-2 pl-3 pr-4 {child.href===current?
        'text-white bg-mewd-yellow rounded md:bg-transparent md:p-0 text-mewd-white':
        ' rounded md:border-0 md:p-0 text-mewd-offwhite md:hover:text-mewd-white hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
           href="{child.href}">
            {child.title}
        </a>
    {/each}
{:else}
    <a aria-current="{item.href===current?'page':'false'}"
       class="md:hidden py-2 pl-3 pr-4 {item.href===current?
        'text-white bg-mewd-yellow rounded md:bg-transparent md:p-0 text-mewd-white':
        ' rounded md:border-0 md:p-0 text-mewd-offwhite md:hover:text-mewd-white hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
       href="{item.href}">
        {item.title}
    </a>
{/if}