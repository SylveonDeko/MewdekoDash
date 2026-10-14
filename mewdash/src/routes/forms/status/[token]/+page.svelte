<script lang="ts">
  import { m } from "$lib/i18n";
  import { page } from "$app/stores";
  import ResponseStatusChecker from "$lib/components/forms/ResponseStatusChecker.svelte";

  let token = $derived($page.params.token);
</script>

<svelte:head>
  <title>{m.forms.statusTitle()}</title>
  <meta content={m.forms.statusDescription()} name="description" />
</svelte:head>

<ResponseStatusChecker {token} />
