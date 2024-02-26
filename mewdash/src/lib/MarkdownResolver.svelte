<script lang="ts">
    import showdown from "showdown";

    const converter = new showdown.Converter();

    function convertToHtml(content: string): string {
        return converter.makeHtml(content);
    }

    export let content: String;
    let classlist = "pt-16 md:max-w-3xl md:mx-auto lg:max-w-4xl lg:pt-16 lg:pb-28 max-w-none prose prose-invert prose-code:bg-gray-700 before:prose-code:content-[''] after:prose-code:content-[''] prose-code:rounded-sm text-ellipsis text-mewd-white";
</script>
<div class={classlist}>
    {@html convertToHtml(content)}
</div>