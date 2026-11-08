<script lang="ts">
  import SharedDuoIcon from "$lib/components/icons/DuoIcon.svelte";

  /**
   * A utility duo Font Awesome icon in the guild palette. The icon must be in fa-utility-duo-icons.json.
   */
  interface Props {
    icon: string;
    color?: string | null;
    secondary?: string | null;
    size?: number | null;
    class?: string;
  }

  let props: Props = $props();
</script>

<SharedDuoIcon {...props} />
