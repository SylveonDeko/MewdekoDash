<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { xpApi } from "$lib/api/index.ts";
  import type { XpCompetition, XpCompetitionStanding } from "$lib/api/xp/models/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import RowActions from "./RowActions.svelte";
  import { CompetitionType, errorText, formatDate, formatNumber, idString, type Channel, type Role } from "./xpModel";

  interface Props {
    guildId: bigint;
    channels: Channel[];
    roles: Role[];
    onerror: (message: string) => void;
  }

  let { guildId, channels, roles, onerror }: Props = $props();

  type RewardDraft = { key: number; position: number; roleId: string; xpAmount: number; currencyAmount: number };

  let competitions: XpCompetition[] = $state([]);
  let sheetOpen = $state(false);
  let saving = $state(false);
  let draft = $state(blankDraft());
  let standingsFor: XpCompetition | null = $state(null);
  let standings: XpCompetitionStanding[] | null = $state(null);
  let ending: XpCompetition | null = $state(null);
  let confirmOpen = $state(false);
  let rewardKey = 0;

  const types = $derived([
    { id: String(CompetitionType.MostGained), name: m.xp.typeMostGained() },
    { id: String(CompetitionType.ReachLevel), name: m.xp.typeReachLevel() },
    { id: String(CompetitionType.HighestTotal), name: m.xp.typeHighestTotal() }
  ]);
  const units = $derived([
    { id: "60", name: m.xp.unitHours() },
    { id: "1440", name: m.xp.unitDays() }
  ]);

  const draftMinutes = $derived(draft.amount * Number(draft.unit));
  const draftValid = $derived(
    draft.name.trim() !== "" &&
      draftMinutes >= 60 &&
      (draft.type !== CompetitionType.ReachLevel || draft.targetLevel > 0)
  );

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function blankDraft() {
    return {
      name: "",
      type: CompetitionType.MostGained as number,
      amount: 7,
      unit: "1440",
      targetLevel: 10,
      channelId: "",
      rewards: [] as RewardDraft[]
    };
  }

  function typeName(type: number): string {
    return types.find((x) => x.id === String(type))?.name ?? "";
  }

  async function load() {
    try {
      const list = await xpApi.getCompetitions(guildId);
      competitions = list.map((x) => ({
        ...x,
        announcementChannelId: x.announcementChannelId ? idString(x.announcementChannelId) : null,
        rewards: x.rewards.map((r) => ({ ...r, roleId: idString(r.roleId) }))
      }));
    } catch (err) {
      logger.error("Failed to load XP competitions:", err);
      onerror(errorText(err, m.xp.errorLoadCompetitions()));
    }
  }

  function openSheet() {
    draft = blankDraft();
    sheetOpen = true;
  }

  function addReward() {
    const next = Math.max(0, ...draft.rewards.map((r) => r.position)) + 1;
    draft.rewards.push({ key: rewardKey++, position: next, roleId: "", xpAmount: 0, currencyAmount: 0 });
  }

  function removeReward(key: number) {
    draft.rewards = draft.rewards.filter((r) => r.key !== key);
  }

  async function create() {
    if (!draftValid || saving) return;
    saving = true;
    try {
      await xpApi.createCompetition(guildId, {
        name: draft.name.trim(),
        type: draft.type,
        durationMinutes: draftMinutes,
        targetLevel: draft.type === CompetitionType.ReachLevel ? draft.targetLevel : 0,
        announcementChannelId: draft.channelId ? BigInt(draft.channelId) : 0n,
        rewards: draft.rewards
          .filter((r) => r.roleId || r.xpAmount > 0 || r.currencyAmount > 0)
          .map((r) => ({
            position: r.position,
            roleId: r.roleId ? BigInt(r.roleId) : 0n,
            xpAmount: r.xpAmount,
            currencyAmount: r.currencyAmount
          }))
      });
      sheetOpen = false;
      await load();
    } catch (err) {
      logger.error("Failed to start an XP competition:", err);
      onerror(errorText(err, m.xp.errorSaveCompetition()));
    } finally {
      saving = false;
    }
  }

  async function showStandings(competition: XpCompetition) {
    standingsFor = competition;
    standings = null;
    try {
      standings = await xpApi.getCompetitionStandings(guildId, competition.id);
    } catch (err) {
      logger.error("Failed to load competition standings:", err);
      onerror(errorText(err, m.xp.errorLoadStandings()));
      standingsFor = null;
    }
  }

  async function end() {
    const competition = ending;
    if (!competition) return;
    try {
      await xpApi.endCompetition(guildId, competition.id);
      await load();
    } catch (err) {
      logger.error("Failed to end an XP competition:", err);
      onerror(errorText(err, m.xp.errorEndCompetition()));
    }
  }

  function summary(competition: XpCompetition): string {
    const parts = [typeName(competition.type)];
    if (competition.type === CompetitionType.ReachLevel) parts.push(m.xp.levelValue({ level: competition.targetLevel }));
    parts.push(
      competition.active
        ? m.xp.boostEnds({ date: formatDate(competition.endTime) })
        : m.xp.boostEnded({ date: formatDate(competition.endTime) })
    );
    parts.push(m.xp.participants({ count: competition.participants }));
    return parts.join(" · ");
  }

  function rewardText(competition: XpCompetition): string {
    return competition.rewards
      .map((r) =>
        [
          m.xp.placeValue({ position: r.position }),
          r.roleName ?? "",
          r.xpAmount > 0 ? `${formatNumber(r.xpAmount)} XP` : "",
          r.currencyAmount > 0 ? formatNumber(r.currencyAmount) : ""
        ]
          .filter(Boolean)
          .join(" ")
      )
      .join(" · ");
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.xp.cardCompetitionsTitle()} alwaysOpen>
  <div class="flex justify-end">
    <button type="button" class="px-4 rounded-xl min-h-[44px] text-sm font-medium"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={openSheet}>
      {m.xp.newCompetition()}
    </button>
  </div>

  {#each competitions as competition (competition.id)}
    <div class="relative flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0"
         class:opacity-60={!competition.active}
         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={() => showStandings(competition)}>
        <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{competition.name}</span>
        <span class="block text-xs truncate" style="color: {$colorStore.muted}">{summary(competition)}</span>
        {#if competition.rewards.length > 0}
          <span class="block text-xs truncate" style="color: {$colorStore.muted}">{rewardText(competition)}</span>
        {/if}
      </button>
      <RowActions
        name={competition.name}
        moreLabel={m.xp.moreActions()}
        actions={[
          { label: m.xp.standings(), icon: "fa-ranking-star", run: () => showStandings(competition) },
          ...(competition.active
            ? [{ label: m.xp.endNow(), icon: "fa-flag-checkered", run: () => { ending = competition; confirmOpen = true; } }]
            : [])
        ]}
      />
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noCompetitions()}</p>
  {/each}
</PluginCard>

{#if sheetOpen}
  <Sheet title={m.xp.newCompetition()} onclose={() => (sheetOpen = false)}>
    <SettingField label={m.common.name()} id="xp-comp-name">
      <input id="xp-comp-name" type="text" bind:value={draft.name}
             class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
             style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
    </SettingField>
    <SettingField label={m.xp.competitionType()} id="xp-comp-type">
      <DiscordSelector id="xp-comp-type" type="custom" options={types} selected={String(draft.type)} searchable={false}
                       clearable={false} customIcon="fa-trophy"
                       onchange={({ selected }) => (draft.type = Number(selected))} />
    </SettingField>
    <div class="grid gap-4 sm:grid-cols-2">
      <NumberField id="xp-comp-amount" label={m.xp.boostLasts()} min={1} value={draft.amount}
                   onchange={(value) => (draft.amount = value ?? 1)} />
      <SettingField label={m.xp.unit()} id="xp-comp-unit">
        <DiscordSelector id="xp-comp-unit" type="custom" options={units} selected={draft.unit} searchable={false}
                         clearable={false} customIcon="fa-clock"
                         onchange={({ selected }) => (draft.unit = selected as string)} />
      </SettingField>
    </div>
    {#if draft.type === CompetitionType.ReachLevel}
      <NumberField id="xp-comp-target" label={m.xp.targetLevel()} min={1} value={draft.targetLevel}
                   onchange={(value) => (draft.targetLevel = value ?? 1)} />
    {/if}
    <SettingField label={m.xp.announceIn()} id="xp-comp-channel">
      <DiscordSelector id="xp-comp-channel" type="channel" options={channels} selected={draft.channelId || null}
                       onchange={({ selected }) => (draft.channelId = (selected as string) ?? "")} />
    </SettingField>

    <div class="space-y-3">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.rewards()}</h4>
      {#each draft.rewards as reward (reward.key)}
        <div class="rounded-xl border p-3 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex items-end gap-3">
            <div class="grow min-w-0">
              <NumberField id="xp-comp-pos-{reward.key}" label={m.xp.placement()} min={1} value={reward.position}
                           onchange={(value) => (reward.position = value ?? 1)} />
            </div>
            <button type="button" class="rounded-lg min-h-[50px] min-w-[50px]" style={iconButton}
                    aria-label={m.xp.removeRewardPlaceAria({ position: reward.position })} onclick={() => removeReward(reward.key)}>
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
          <SettingField label={m.common.role()} id="xp-comp-role-{reward.key}">
            <DiscordSelector id="xp-comp-role-{reward.key}" type="role" options={roles} selected={reward.roleId || null}
                             onchange={({ selected }) => (reward.roleId = (selected as string) ?? "")} />
          </SettingField>
          <div class="grid gap-3 sm:grid-cols-2">
            <NumberField id="xp-comp-xp-{reward.key}" label={m.xp.rewardXp()} value={reward.xpAmount}
                         onchange={(value) => (reward.xpAmount = value ?? 0)} />
            <NumberField id="xp-comp-currency-{reward.key}" label={m.xp.rewardCurrency()} value={reward.currencyAmount}
                         onchange={(value) => (reward.currencyAmount = value ?? 0)} />
          </div>
        </div>
      {/each}
      <button type="button" class="px-4 rounded-xl min-h-[44px] text-sm font-medium" style={iconButton} onclick={addReward}>
        <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.xp.addReward()}
      </button>
    </div>

    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={iconButton}
              onclick={() => (sheetOpen = false)}>{m.common.cancel()}</button>
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!draftValid || saving} onclick={create}>{m.xp.startCompetition()}</button>
    {/snippet}
  </Sheet>
{/if}

{#if standingsFor}
  <Sheet title={standingsFor.name} onclose={() => (standingsFor = null)} size="lg">
    {#if standings === null}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
    {:else if standings.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noStandings()}</p>
    {:else}
      {#each standings as entry (idString(entry.userId))}
        <div class="flex items-center gap-3 rounded-lg p-2 min-w-0" style="background: {$colorStore.primary}08;">
          <span class="w-8 shrink-0 text-center text-sm font-semibold tabular-nums" style="color: {$colorStore.text}">{entry.position}</span>
          <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{entry.username}</span>
          <span class="text-sm shrink-0 tabular-nums" style="color: {$colorStore.muted}">
            {standingsFor?.type === CompetitionType.HighestTotal ? formatNumber(entry.total) : `+${formatNumber(entry.gained)}`} XP
          </span>
        </div>
      {/each}
    {/if}
  </Sheet>
{/if}

<ConfirmationModal
  bind:isOpen={confirmOpen}
  title={m.xp.endNow()}
  message={m.xp.endConfirm({ name: ending?.name ?? "" })}
  confirmText={m.xp.endNow()}
  variant="warning"
  onconfirm={end}
/>
