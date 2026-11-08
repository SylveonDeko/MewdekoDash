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

  let idsText = $state("");
  let reason = $state("");
  let busy = $state(false);

  const ids = $derived([...new Set(idsText.split(/[\s,]+/).filter(token => /^\d{15,22}$/.test(token)))]);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const fieldStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);

  async function ban() {
    if (ids.length === 0 || busy) return;
    const confirmed = await requestConfirmation({
      title: m.administration.advancedMassBanTitle(),
      message: m.administration.advancedMassBanConfirmMessage({ count: ids.length }),
      confirmText: m.administration.advancedMassBanRun({ count: ids.length })
    });
    if (!confirmed) return;
    busy = true;
    try {
      const result = await administrationApi.massBan(guildId, {
        userIds: ids.map(id => BigInt(id)),
        reason: reason.trim() || m.administration.advancedMassBanDefaultReason()
      });
      idsText = "";
      reason = "";
      notify(m.administration.advancedMassBanDone({ succeeded: result.succeeded, failed: result.failed }), result.failed ? "error" : "success");
    } catch (err) {
      logger.error("Failed to mass ban:", err);
      notify(errorText(err, m.administration.advancedMassBanFailed()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.administration.advancedMassBanTitle()} alwaysOpen>
  <SettingField label={m.administration.advancedMassBanUserIds()} id="mass-ban-users">
    <textarea
      id="mass-ban-users"
      bind:value={idsText}
      rows="4"
      spellcheck="false"
      placeholder={m.administration.advancedMassBanUserIdsPlaceholder()}
      class="w-full p-3 rounded-lg border focus:ring-2 resize-y"
      style={fieldStyle}
    ></textarea>
  </SettingField>
  <SettingField label={m.common.banReason()} id="mass-ban-reason">
    <input
      id="mass-ban-reason"
      type="text"
      bind:value={reason}
      placeholder={m.administration.advancedMassBanReasonPlaceholder()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={fieldStyle}
    >
  </SettingField>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
    style={quietStyle}
    disabled={ids.length === 0 || busy}
    onclick={ban}
  >
    <i class="fa-solid fa-gavel" aria-hidden="true"></i>
    {m.administration.advancedMassBanRun({ count: ids.length })}
  </button>
</PluginCard>
