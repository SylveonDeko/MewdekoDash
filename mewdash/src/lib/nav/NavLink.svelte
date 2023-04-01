<!--suppress HtmlWrongAttributeValue -->
<!--a aria-current="{current?'page':'false'}"
   class="block py-2 pl-3 pr-4 {current?
        'text-white bg-mewd-yellow rounded md:bg-transparent md:p-0 text-mewd-white':
        ' rounded md:border-0 md:p-0 text-mewd-offwhite md:hover:text-mewd-white hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
   href="{href}">
    {title}
</a-->
{#if item.wrapped}
    <details class="py-2 pl-3 pr-4">
        <summary class="rounded md:border-0 md:p-0 text-mewd-offwhite md:hover:text-mewd-white hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent">{item.title}</summary>
        <div class="flex flex-col mt-2 -translate-x-2 absolute bg-mewd-light-grey rounded-lg overflow-hidden">
            {#each item.children as child}
                <!--a aria-current="{child.href===current?'page':'false'}" href="{child.href}"
                   class="block text-mewd-white pl-4 pr-8  py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{child.title}</a-->
                <a aria-current="{child.href===current?'page':'false'}"
                   class="pl-4 pr-8  py-2  {child.href===current?
        'text-white bg-mewd-yellow rounded text-mewd-white':
        'rounded text-mewd-offwhite hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
                   href="{child.href}">
                    {child.title}
                </a>
            {/each}
        </div>
    </details>
{:else}
    <a aria-current="{item.href===current?'page':'false'}"
       class="hidden md:flex py-2 pl-3 pr-4 {item.href===current?
        'text-white bg-mewd-yellow rounded text-mewd-white':
        ' rounded text-mewd-offwhite hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}"
       href="{item.href}">
        {item.title}
    </a>
{/if}
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

<script lang="ts">
    type Item = {
        title: string,
        wrapped: boolean,
        href?: string,
        children?: { title: string, href: string }[]
    }
    export let item: Item
    export let current: string
</script>
