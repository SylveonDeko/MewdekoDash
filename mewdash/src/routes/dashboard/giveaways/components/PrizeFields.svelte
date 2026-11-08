<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import { PrizeType, prizeProblem } from "./giveawayModel";

  interface Props {
    type: number;
    amount: number;
    idPrefix: string;
    onchange: (type: number, amount: number, typing?: boolean) => void;
  }

  let { type, amount, idPrefix, onchange }: Props = $props();

  const typeOptions = $derived([
    { id: String(PrizeType.None), name: m.giveaways.prizeNone() },
    { id: String(PrizeType.Xp), name: m.giveaways.prizeXp() },
    { id: String(PrizeType.Coins), name: m.giveaways.prizeCoins() }
  ]);

  function setAmount(raw: string) {
    const parsed = Math.floor(Number(raw));
    onchange(type, Number.isFinite(parsed) && parsed > 0 ? parsed : 0, true);
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <SettingField label={m.giveaways.prizeLabel()} id="{idPrefix}-prize-type">
    <DiscordSelector
      id="{idPrefix}-prize-type"
      type="custom"
      options={typeOptions}
      selected={String(type)}
      searchable={false}
      clearable={false}
      customIcon="fa-gift"
      onchange={(detail) => {
        if (typeof detail.selected !== "string") return;
        const next = Number(detail.selected);
        onchange(next, next === PrizeType.None ? 0 : amount);
      }}
    />
  </SettingField>
  {#if type !== PrizeType.None}
    <SettingField label={m.giveaways.prizeAmount()} id="{idPrefix}-prize-amount">
      <input
        id="{idPrefix}-prize-amount"
        type="number"
        min="1"
        value={amount || ""}
        oninput={(e) => setAmount(e.currentTarget.value)}
        aria-invalid={prizeProblem(type, amount)}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {prizeProblem(type, amount) ? '#ef4444' : `${$colorStore.primary}30`}; color: {$colorStore.text};"
      >
    </SettingField>
  {/if}
</div>
