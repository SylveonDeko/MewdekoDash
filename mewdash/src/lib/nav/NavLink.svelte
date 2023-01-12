<!--suppress HtmlWrongAttributeValue -->
<a aria-current="{current?'page':'false'}"
   class="block py-2 pl-3 pr-4 {current?
        'text-white bg-mewd-yellow rounded md:bg-transparent md:p-0 text-mewd-text':
        ' rounded md:border-0 md:p-0 text-mewd-text-grey md:hover:text-mewd-text hover:bg-mewd-light-grey hover:text-mewd-text-grey md:hover:bg-transparent'}" href="{href}">
    {title}
</a>

<script lang="ts">
    export let href: string
    export let title: string
    export let current: boolean
</script>
