<script lang="ts">
  import ChatSaver from "$lib/components/specialized/ChatSaver.svelte";

  let {data} = $props();
</script>

<ChatSaver {data} />