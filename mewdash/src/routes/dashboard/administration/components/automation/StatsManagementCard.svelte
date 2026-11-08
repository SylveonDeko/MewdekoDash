<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, guildApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "autoSave" | "notify">;

  let { guildId, autoSave, notify }: Props = $props();

  let collecting = $state(true);
  let busy = $state(false);

  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  async function load() {
    try {
      const config = await guildApi.getGuildConfig(guildId);
      collecting = !config.statsOptOut;
    } catch (err) {
      logger.error("Failed to load stats setting:", err);
    }
  }

  function toggle(value: boolean) {
    const previous = collecting;
    collecting = value;
    autoSave.now("statsOptOut", async () => {
      try {
        const optedOut = await administrationApi.toggleStatsOptOut(guildId);
        collecting = !optedOut;
      } catch (err) {
        collecting = previous;
        throw err;
      }
    });
  }

  async function deleteData() {
    if (busy) return;
    const confirmed = await requestConfirmation({
      message: m.administration.automationStatsDeleteConfirm(),
      confirmText: m.administration.automationStatsDeleteButton()
    });
    if (!confirmed) return;
    busy = true;
    try {
      await administrationApi.deleteStatsData(guildId);
      notify(m.administration.automationStatsDeleted(), "success");
    } catch (err) {
      logger.error("Failed to delete stats data:", err);
      notify(errorText(err, m.administration.automationStatsDeleteFailed()), "error");
    } finally {
      busy = false;
    }
  }

  void load();
</script>

<PluginCard title={m.administration.automationStatsTitle()} alwaysOpen>
  <ToggleRow checked={collecting} title={m.administration.automationStatsCollection()} colors={$colorStore} onchange={toggle} />
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
    style={quietStyle}
    disabled={busy}
    onclick={deleteData}
  >
    <i class="fa-solid fa-trash" aria-hidden="true"></i>
    {m.administration.automationStatsDeleteButton()}
  </button>
</PluginCard>
