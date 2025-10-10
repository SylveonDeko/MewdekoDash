<script lang="ts">
  import { page } from "$app/stores";
  import ResponseStatusChecker from "$lib/components/forms/ResponseStatusChecker.svelte";

  let token = $derived($page.params.token);
</script>

<svelte:head>
  <title>Response Status - Mewdeko</title>
  <meta content="Check your form submission status" name="description" />
</svelte:head>

<ResponseStatusChecker {token} />
