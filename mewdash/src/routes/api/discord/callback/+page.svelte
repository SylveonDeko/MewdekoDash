<script lang="ts">
    import RedirectPage from "../../../../lib/RedirectPage.svelte";

    export let data;
</script>

{#if !data.loggedIn}
    <RedirectPage to="/" delay="10">
        <h1>Something went wrong. Please try again.</h1>
        <p class="pt-2 text-center text-lg">
            Error: <span class="text-red-400">{data.error}</span>
        </p>
    </RedirectPage>
{:else}
    <RedirectPage to="/dashboard">
        <h1>You have been logged in.</h1>
    </RedirectPage>
{/if}