<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "notify">;

  let { guildId, notify }: Props = $props();

  let days = $state(7);
  let busy = $state(false);

  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  async function prune() {
    if (days < 1 || busy) return;
    const confirmed = await requestConfirmation({
      title: m.administration.advancedMassPruneConfirmTitle(),
      message: m.administration.advancedMassPruneConfirmMessage({ days }),
      confirmText: m.administration.advancedMassPruneExecute()
    });
    if (!confirmed) return;
    busy = true;
    try {
      const result = await administrationApi.pruneUsers(guildId, { days });
      notify(m.administration.advancedMassPruneDone({ count: result.pruned }), "success");
    } catch (err) {
      logger.error("Failed to prune members:", err);
      notify(errorText(err, m.administration.advancedMassPruneFailed()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.administration.advancedMassPruneTitle()} alwaysOpen>
  <SettingField label={m.administration.advancedMassPruneDays()} id="prune-days">
    <input
      id="prune-days"
      type="number"
      min="1"
      max="30"
      inputmode="numeric"
      value={days}
      oninput={(e) => (days = Math.min(30, Math.max(1, Math.floor(Number(e.currentTarget.value)) || 1)))}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
  </SettingField>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
    style={quietStyle}
    disabled={busy}
    onclick={prune}
  >
    <i class="fa-solid fa-user-slash" aria-hidden="true"></i>
    {m.administration.advancedMassPruneExecute()}
  </button>
</PluginCard>
