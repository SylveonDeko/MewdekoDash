<script lang="ts">
  import { m } from "$lib/i18n";
  import { xpApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingsGroup from "./SettingsGroup.svelte";
  import { errorText } from "./xpModel";

  interface Props {
    guildId: bigint;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, onerror, onsuccess }: Props = $props();

  let exporting = $state(false);
  let dangerOpen = $state(false);
  let resetBonus = $state(false);
  let confirmOpen = $state(false);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function exportXp() {
    exporting = true;
    try {
      const blob = await xpApi.exportXp(guildId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `xp-${guildId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error("Failed to export XP:", err);
      onerror(errorText(err, m.xp.errorExport()));
    } finally {
      exporting = false;
    }
  }

  async function reset() {
    try {
      const count = await xpApi.resetServerXp(guildId, resetBonus);
      onsuccess(m.xp.resetDone({ count }));
    } catch (err) {
      logger.error("Failed to reset server XP:", err);
      onerror(errorText(err, m.xp.errorReset()));
    }
  }
</script>

<PluginCard title={m.xp.cardDataTitle()} alwaysOpen>
  <div class="grid gap-3 sm:grid-cols-2">
    <a href="/dashboard/import" class="px-4 rounded-xl min-h-[50px] font-medium flex items-center justify-center gap-2" style={buttonStyle}>
      <i class="fa-solid fa-file-import" aria-hidden="true"></i>{m.xp.importFromBot()}
    </a>
    <button type="button" class="px-4 rounded-xl min-h-[50px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            style={buttonStyle} disabled={exporting} onclick={exportXp}>
      <i class="fa-solid {exporting ? 'fa-spinner fa-spin' : 'fa-file-export'}" aria-hidden="true"></i>{m.xp.exportXp()}
    </button>
  </div>

  <SettingsGroup title={m.xp.groupDanger()} bind:open={dangerOpen}>
    <SettingToggle id="xp-reset-all-bonus" label={m.xp.alsoResetBonus()} checked={resetBonus}
                   onchange={(on) => (resetBonus = on)} />
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium"
            style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
            onclick={() => (confirmOpen = true)}>
      {m.xp.resetAll()}
    </button>
  </SettingsGroup>
</PluginCard>

<ConfirmationModal
  bind:isOpen={confirmOpen}
  title={m.xp.resetAll()}
  message={m.xp.resetAllConfirm()}
  confirmText={m.xp.resetAll()}
  variant="danger"
  onconfirm={reset}
/>
