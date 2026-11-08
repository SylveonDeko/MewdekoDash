<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { maxTimeAmount, type Named, type Notify, type TimeUnit } from "./chatModel";

  interface Props {
    channels: Named[];
    loading: boolean;
    notify: Notify;
    onload: (channelId: string, amount: number, unit: TimeUnit) => void;
  }

  let { channels, loading, notify, onload }: Props = $props();

  let channelId: string | null = $state(null);
  let amount = $state(1);
  let unit: TimeUnit = $state("hours");

  const unitOptions = $derived([
    { id: "minutes", name: m.common.minutes() },
    { id: "hours", name: m.common.hours() },
    { id: "days", name: m.common.days() }
  ]);

  function submit() {
    if (loading) return;
    if (!channelId) {
      notify(m.common.notifySelectChannel(), "error");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      notify(m.chatsaver.saverNotifyTimePositive(), "error");
      return;
    }
    const max = maxTimeAmount(unit);
    if (amount > max) {
      const label = unitOptions.find(option => option.id === unit)?.name.toLowerCase() ?? unit;
      notify(m.chatsaver.saverNotifyTimeMax({ max, unit: label }), "error");
      return;
    }
    onload(channelId, Math.floor(amount), unit);
  }
</script>

<PluginCard title={m.chatsaver.saverChatOptions()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <SettingField label={m.common.channel()} id="cs-channel">
      <DiscordSelector
        id="cs-channel"
        type="channel"
        options={channels}
        selected={channelId}
        placeholder={m.common.selectAChannelPlaceholder()}
        onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </SettingField>
    <SettingField label={m.chatsaver.saverTimeAmount()} id="cs-amount">
      <input
        id="cs-amount"
        type="number"
        inputmode="numeric"
        min="1"
        max={maxTimeAmount(unit)}
        bind:value={amount}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        onkeydown={(event) => event.key === "Enter" && submit()}
      >
    </SettingField>
    <SettingField label={m.chatsaver.saverTimeUnit()} id="cs-unit">
      <DiscordSelector
        id="cs-unit"
        type="custom"
        options={unitOptions}
        customIcon="fa-calendar"
        selected={unit}
        placeholder={m.chatsaver.saverSelectTimeUnit()}
        onchange={(detail) => {
          if (typeof detail.selected === "string") unit = detail.selected as TimeUnit;
        }}
      />
    </SettingField>
  </div>

  <button
    type="button"
    class="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    disabled={loading}
    onclick={submit}
  >
    <i class="fa-solid {loading ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'}" aria-hidden="true"></i>
    {loading ? m.common.loading() : m.chatsaver.saverLoadMessages()}
  </button>
</PluginCard>
