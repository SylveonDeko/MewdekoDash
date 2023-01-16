<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<div class="bg-mewd-light-grey h-screen">
    <h1 class="text-center"><br><br>Auth Code Receiver</h1>
    {#if data.code}
        <h3 class="text-center text-mewd-white text-2xl">Your Discord Auth Code is&nbsp;<code
          style="color: rgb(147,128,24);">{data.code}</code>.
            Run the command&nbsp;<code style="color: rgb(147,128,24);">.auth</code>&nbsp;in any server to finish
            authorizing.</h3>
    {:else}
        <h3 class="text-center text-mewd-white text-2xl">You have discovered a cool feature! Run <code style="color: rgb(147,128,24);">.dragon</code> to get some beta commands!</h3>
    {/if}
  <h4 class="fw-bold text-center"><br><br><br>Do NOT, and I repeat, do NOT, give this code to anyone else. As
    depending on how the bot is setup, it can be used to impersonate you.</h4>
</div>