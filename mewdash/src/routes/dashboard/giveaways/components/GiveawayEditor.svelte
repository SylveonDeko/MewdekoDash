<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import ExtraEntriesField from "./ExtraEntriesField.svelte";
  import PrizeFields from "./PrizeFields.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { PrizeType, formProblem, newForm, type DurationUnit, type EntryMethod, type GiveawayForm } from "./giveawayModel";

  type Named = { id: string; name: string; color?: number };

  interface Props {
    channels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    defaultEmote: string | null;
    busy: boolean;
    onstart: (form: GiveawayForm) => void;
    ondraft: (form: GiveawayForm) => void;
    onclose: () => void;
  }

  let { channels, roles, emojis, defaultEmote, busy, onstart, ondraft, onclose }: Props = $props();

  let form: GiveawayForm = $state(untrack(() => newForm(defaultEmote)));
  let attempted = $state(false);
  let requirementsOpen = $state(false);
  let extraOpen = $state(false);
  let prizeOpen = $state(false);

  const problem = $derived(formProblem(form));
  const problemText = $derived.by(() => {
    switch (problem) {
      case "item":
        return m.giveaways.problemItem();
      case "winners":
        return m.giveaways.problemWinners();
      case "channel":
        return m.giveaways.problemChannel();
      case "duration":
        return m.giveaways.problemDuration();
      case "prize":
        return m.giveaways.problemPrize();
      default:
        return null;
    }
  });

  const methodOptions = $derived([
    { id: "reaction", name: m.giveaways.methodReaction() },
    { id: "button", name: m.common.button() },
    { id: "captcha", name: m.common.captcha() }
  ]);

  const unitOptions = $derived([
    { id: "minutes", name: m.common.minutes() },
    { id: "hours", name: m.common.hours() },
    { id: "days", name: m.common.days() }
  ]);

  const requirementsCount = $derived([form.roles.length > 0, form.messageCount > 0].filter(Boolean).length);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const ghostStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function submit(draft: boolean) {
    attempted = true;
    if (problem) return;
    if (draft) ondraft(form);
    else onstart(form);
  }
</script>

{#snippet footer()}
  {#if problemText && attempted}
    <p class="grow basis-full sm:basis-0 text-sm text-red-400" role="alert">{problemText}</p>
  {/if}
  <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={ghostStyle} onclick={onclose}>
    {m.common.cancel()}
  </button>
  <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={ghostStyle} disabled={busy} onclick={() => submit(true)}>
    {m.giveaways.saveDraft()}
  </button>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    disabled={busy}
    onclick={() => submit(false)}
  >
    <i class="fa-solid fa-play" aria-hidden="true"></i>
    {m.giveaways.startNow()}
  </button>
{/snippet}

<Sheet title={m.giveaways.newTitle()} size="lg" {onclose} {footer}>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start [&>*]:min-w-0">
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="sm:col-span-2 min-w-0">
      <SettingField label={m.giveaways.fieldPrize()} id="gw-item" required>
        <input
          id="gw-item"
          type="text"
          bind:value={form.item}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {attempted && problem === 'item' ? '#ef4444' : `${$colorStore.primary}30`}; color: {$colorStore.text};"
          aria-invalid={attempted && problem === "item"}
        >
      </SettingField>
    </div>
    <SettingField label={m.giveaways.fieldWinners()} id="gw-winners" required>
      <input
        id="gw-winners"
        type="number"
        min="1"
        value={form.winners}
        oninput={(e) => (form.winners = Math.floor(Number(e.currentTarget.value)))}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
  </div>

  <SettingField label={m.common.channel()} id="gw-channel" required>
    <DiscordSelector
      id="gw-channel"
      type="channel"
      options={channels}
      selected={form.channelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      onchange={(detail) => (form.channelId = typeof detail.selected === "string" ? detail.selected : null)}
    />
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
    <SettingField label={m.giveaways.fieldDuration()} id="gw-duration" required>
      <div class="flex gap-3">
        <input
          id="gw-duration"
          type="number"
          min="1"
          value={form.duration}
          oninput={(e) => (form.duration = Number(e.currentTarget.value))}
          class="w-24 shrink-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
        <div class="grow min-w-0">
          <DiscordSelector
            type="custom"
            options={unitOptions}
            selected={form.unit}
            searchable={false}
            clearable={false}
            customIcon="fa-clock"
            ariaLabel={m.giveaways.fieldDurationUnit()}
            onchange={(detail) => typeof detail.selected === "string" && (form.unit = detail.selected as DurationUnit)}
          />
        </div>
      </div>
    </SettingField>
    <SettingField label={m.giveaways.fieldEntry()} id="gw-method">
      <DiscordSelector
        id="gw-method"
        type="custom"
        options={methodOptions}
        selected={form.entryMethod}
        searchable={false}
        clearable={false}
        customIcon="fa-mouse-pointer"
        onchange={(detail) => typeof detail.selected === "string" && (form.entryMethod = detail.selected as EntryMethod)}
      />
    </SettingField>
  </div>

  <SettingField label={m.common.emoji()} id="gw-emote">
    <EmojiPicker
      id="gw-emote"
      guildEmojis={emojis}
      selected={form.emote}
      placeholder={m.common.selectEmojiPlaceholder()}
      onchange={(detail) => (form.emote = typeof detail.selected === "string" ? detail.selected : "")}
    />
  </SettingField>

  <EditorGroup title={m.giveaways.groupRequirements()} count={requirementsCount} bind:open={requirementsOpen}>
    <SettingField label={m.common.requiredRoles()} id="gw-roles">
      <DiscordSelector
        id="gw-roles"
        type="role"
        options={roles}
        selected={form.roles}
        multiple
        placeholder={m.giveaways.rolesPlaceholder()}
        onchange={(detail) => (form.roles = Array.isArray(detail.selected) ? detail.selected : [])}
      />
    </SettingField>
    <SettingField label={m.giveaways.fieldMessageCount()} id="gw-messages">
      <input
        id="gw-messages"
        type="number"
        min="0"
        value={form.messageCount || ""}
        oninput={(e) => (form.messageCount = Math.max(0, Math.floor(Number(e.currentTarget.value)) || 0))}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
  </EditorGroup>

  <EditorGroup title={m.giveaways.groupExtraEntries()} count={form.extraEntries.length > 0 ? 1 : 0} bind:open={extraOpen}>
    <ExtraEntriesField entries={form.extraEntries} {roles} idPrefix="gw" onchange={(entries) => (form.extraEntries = entries)} />
  </EditorGroup>

  <EditorGroup title={m.giveaways.groupPrize()} count={form.prizeType !== PrizeType.None ? 1 : 0} bind:open={prizeOpen}>
    <PrizeFields
      type={form.prizeType}
      amount={form.prizeAmount}
      idPrefix="gw"
      onchange={(type, amount) => {
        form.prizeType = type;
        form.prizeAmount = amount;
      }}
    />
  </EditorGroup>
  </div>
</Sheet>
