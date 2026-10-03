<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

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

  let { icon, color = null, secondary = null, size = null, class: extra = "" }: Props = $props();
</script>

<i class="fa-utility-duo fa-regular {icon} {extra}"
   style="--fa-primary-color: {color ?? $colorStore.primary}; --fa-secondary-color: {secondary ?? color ?? $colorStore.secondary};{size ? ` font-size: ${size}px;` : ''}"
   aria-hidden="true"></i>
