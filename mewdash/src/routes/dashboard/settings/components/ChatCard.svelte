<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { Patch, Settings } from "./settingsModel";

  interface Props {
    settings: Settings;
    onpatch: Patch;
  }

  let { settings, onpatch }: Props = $props();
</script>

<PluginCard title={m.settings.pageChatTitle()} alwaysOpen>
  <div class="space-y-2">
    <ToggleRow
      checked={settings.snipeset}
      title={m.settings.pageSnipeTitle()}
      subtitle={m.settings.pageSnipeHint()}
      colors={$colorStore}
      onchange={(on) => onpatch({ snipeset: on }, "now")}
    />
    <ToggleRow
      checked={settings.previewLinks}
      title={m.settings.pagePreviewsTitle()}
      subtitle={m.settings.pagePreviewsHint()}
      colors={$colorStore}
      onchange={(on) => onpatch({ previewLinks: on }, "now")}
    />
    <ToggleRow
      checked={settings.verboseErrors}
      title={m.settings.verboseTitle()}
      subtitle={m.settings.verboseHint()}
      colors={$colorStore}
      onchange={(on) => onpatch({ verboseErrors: on }, "now")}
    />
  </div>
</PluginCard>
