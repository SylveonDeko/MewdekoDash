<script lang="ts">
  import { m } from "$lib/i18n";
  import { currencyApi } from "$lib/api/index.ts";
  import type { EconomyConfig } from "$lib/api/currency/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import { PRESETS, type PresetId } from "./presets";
  import type { Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    current: PresetId | null;
    confirm?: boolean;
    notify: Notify;
    onapplied: (config: EconomyConfig, id: PresetId) => void;
  }

  let { guildId, current, confirm = false, notify, onapplied }: Props = $props();

  let applying = $state<PresetId | null>(null);

  const text = $derived<Record<PresetId, { name: string; description: string }>>({
    casual: { name: m.currency.presetCasual(), description: m.currency.presetCasualDescription() },
    balanced: { name: m.currency.presetBalanced(), description: m.currency.presetBalancedDescription() },
    competitive: { name: m.currency.presetCompetitive(), description: m.currency.presetCompetitiveDescription() }
  });

  async function apply(id: PresetId) {
    if (applying || id === current) return;
    if (confirm) {
      const confirmed = await requestConfirmation({
        message: m.currency.presetConfirm({ name: text[id].name }),
        confirmText: m.common.apply()
      });
      if (!confirmed) return;
    }
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    applying = id;
    try {
      onapplied(await currencyApi.updateConfig(guildId, preset.values), id);
      notify(m.currency.presetApplied({ name: text[id].name }));
    } catch (err: any) {
      logger.error("Failed to apply a preset", err);
      notify(err?.message ?? m.currency.presetFailed(), "error");
    } finally {
      applying = null;
    }
  }
</script>

<div class="grid grid-cols-1 gap-2" role="group" aria-label={m.currency.presetTitle()}>
  {#each PRESETS as preset (preset.id)}
    {@const selected = current === preset.id}
    <button
      type="button"
      class="text-left rounded-xl border p-3 min-h-[44px] flex items-start gap-3 disabled:opacity-60"
      style="background: {selected ? $colorStore.selectedSurface : 'transparent'}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
      aria-pressed={selected}
      disabled={applying !== null}
      onclick={() => apply(preset.id)}
    >
      <i class="fa-solid {applying === preset.id ? 'fa-spinner fa-spin' : preset.icon} w-5 mt-0.5 text-center shrink-0" aria-hidden="true"></i>
      <span class="min-w-0 space-y-0.5">
        <span class="block font-semibold">{text[preset.id].name}</span>
        <span class="block text-sm" style="color: {$colorStore.muted}">{text[preset.id].description}</span>
      </span>
    </button>
  {/each}
</div>
