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

  const placeholder = "{username}";

  let pattern = $state(placeholder);
  let busy = $state(false);

  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  async function rename() {
    const value = pattern.trim();
    if (!value || busy) return;
    const confirmed = await requestConfirmation({
      title: m.administration.advancedMassRenameTitle(),
      message: m.administration.advancedMassRenameConfirm({ pattern: value }),
      confirmText: m.administration.advancedMassRenameExecute()
    });
    if (!confirmed) return;
    busy = true;
    try {
      const result = await administrationApi.massRename(guildId, { pattern: value });
      pattern = placeholder;
      notify(m.administration.advancedMassRenameDone({ count: result.renamed }), "success");
    } catch (err) {
      logger.error("Failed to mass rename:", err);
      notify(errorText(err, m.administration.advancedMassRenameFailed()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.administration.advancedMassRenameTitle()} alwaysOpen>
  <SettingField label={m.administration.advancedMassRenamePattern()} hint={m.administration.advancedMassRenameHint({ placeholder })} id="rename-pattern">
    <input
      id="rename-pattern"
      type="text"
      bind:value={pattern}
      placeholder={placeholder}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
  </SettingField>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
    style={quietStyle}
    disabled={!pattern.trim() || busy}
    onclick={rename}
  >
    <i class="fa-solid fa-pen" aria-hidden="true"></i>
    {m.administration.advancedMassRenameExecute()}
  </button>
</PluginCard>
