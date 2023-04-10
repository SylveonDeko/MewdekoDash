<script lang="ts">
    import showdown from "showdown";

    const converter = new showdown.Converter();
    export let content: String;
</script>
<div class="pt-16 md:max-w-3xl md:mx-auto lg:max-w-4xl lg:pt-16 lg:pb-28 max-w-none prose prose-invert prose-code:bg-gray-700 before:prose-code:content-[''] after:prose-code:content-[''] prose-code:rounded-sm text-ellipsis text-mewd-white">
    {@html converter.makeHtml(content)}</div>