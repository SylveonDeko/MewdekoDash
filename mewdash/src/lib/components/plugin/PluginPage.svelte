<script lang="ts">
  /**
   * The page shell every feature page uses: icon, plain title, one short line and, when the
   * feature has a real on/off setting, a master switch on the right of the header.
   */
  import type { Snippet } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    title: string;
    subtitle: string;
    icon: string;
    guildName?: string;
    /** The feature's enable setting. Leave undefined for features without one and no switch is shown. */
    enabled?: boolean;
    /** Called with the new value when the master switch is flipped. */
    onToggle?: (enabled: boolean) => void;
    autoSave?: AutoSave;
    actionButtons?: Array<{
      label: string;
      icon: string;
      action: () => void;
      loading?: boolean;
      style?: string;
      disabled?: boolean;
    }>;
    statusMessages?: Snippet;
    children: Snippet;
  }

  let {
    title,
    subtitle,
    icon,
    guildName,
    enabled,
    onToggle,
    autoSave,
    actionButtons = [],
    statusMessages,
    children
  }: Props = $props();
</script>

{#snippet masterSwitch()}
  {#if enabled !== undefined}
    <label class="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer">
      <input
        type="checkbox"
        class="sr-only peer"
        checked={enabled}
        aria-label={enabled ? m.common.enabled() : m.common.disabled()}
        onchange={(e) => onToggle?.(e.currentTarget.checked)}
      >
      <span
        class="w-12 h-7 rounded-full relative block peer-focus-visible:ring-2
               after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full
               after:h-[22px] after:w-[22px] after:transition-transform peer-checked:after:translate-x-5"
        style="background: {enabled ? $colorStore.primary : `${$colorStore.primary}30`};"
      ></span>
    </label>
  {/if}
{/snippet}

<DashboardPageLayout
  {title}
  {subtitle}
  {icon}
  {guildName}
  {autoSave}
  {actionButtons}
  {statusMessages}
  titleAction={enabled !== undefined ? masterSwitch : undefined}
>
  {@render children()}
</DashboardPageLayout>
