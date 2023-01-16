<!--suppress HtmlWrongAttributeValue -->
<li aria-current="{current?'page':'false'}"
   class="block py-2 pl-3 pr-4 {current?
        'text-white bg-mewd-yellow rounded md:bg-transparent md:p-0 text-mewd-white':
        ' rounded md:border-0 md:p-0 text-mewd-offwhite md:hover:text-mewd-white hover:bg-mewd-light-grey hover:text-mewd-offwhite md:hover:bg-transparent'}" href="{href}">
    {title}
</li>

<script lang="ts">
    export let href: string
    export let title: string
    export let current: boolean
</script>
