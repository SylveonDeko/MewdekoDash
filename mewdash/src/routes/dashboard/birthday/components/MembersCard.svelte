<script lang="ts">
  import { m } from "$lib/i18n";
  import { birthdayApi, type BirthdayUser } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import RowActions from "./RowActions.svelte";
  import { errorText, type Member } from "./birthdayModel";

  interface Props {
    guildId: bigint;
    members: Member[];
    users: BirthdayUser[];
    upcoming: BirthdayUser[];
    today: BirthdayUser[];
    days: number;
    ondays: (days: number) => void;
    onchanged: () => Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, members, users, upcoming, today, days, ondays, onchanged, onerror }: Props = $props();

  const PAGE = 10;

  let shown = $state(PAGE);
  let adding = $state(false);
  let pickedMember: string | null = $state(null);
  let date = $state("");
  let saving = $state(false);

  const periods = $derived([
    { id: "7", name: m.birthday.period7() },
    { id: "14", name: m.birthday.period14() },
    { id: "30", name: m.birthday.period30() }
  ]);

  const sorted = $derived(
    users
      .filter(user => user.birthday)
      .sort((a, b) => (a.username ?? "").localeCompare(b.username ?? ""))
  );

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function formatDate(value: string | null | undefined): string {
    return value ? new Date(value).toLocaleDateString() : m.common.notSet();
  }

  function dayText(user: BirthdayUser): string {
    return user.daysUntil === 0
      ? m.common.today()
      : user.daysUntil === 1
        ? m.birthday.usersTomorrow()
        : m.common.daysCount({ count: user.daysUntil ?? 0 });
  }

  function line(user: BirthdayUser): string {
    return user.birthdayAnnouncementsEnabled ? formatDate(user.birthday) : m.birthday.usersPrivate();
  }

  async function save() {
    if (!pickedMember || !date || saving) return;
    saving = true;
    try {
      await birthdayApi.setUserBirthday(guildId, BigInt(pickedMember), date);
      adding = false;
      pickedMember = null;
      date = "";
      await onchanged();
    } catch (err) {
      logger.error("Failed to set a birthday:", err);
      onerror(errorText(err, m.birthday.errorSetBirthday()));
    } finally {
      saving = false;
    }
  }

  async function remove(user: BirthdayUser) {
    const confirmed = await requestConfirmation({
      message: m.birthday.removeConfirm({ user: user.nickname ?? user.username }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await birthdayApi.removeUserBirthday(guildId, user.userId);
      await onchanged();
    } catch (err) {
      logger.error("Failed to remove a birthday:", err);
      onerror(errorText(err, m.birthday.errorRemoveBirthday()));
    }
  }
</script>

{#snippet addButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (adding = true)}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.birthday.addBirthday()}
  </button>
{/snippet}

<PluginCard title={m.common.users()} actions={addButton} alwaysOpen>
  {#if today.length > 0}
    <p class="text-sm rounded-lg p-3" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
      <i class="fa-solid fa-cake-candles mr-2" aria-hidden="true"></i>
      {today.length === 1 ? m.birthday.alertTodayOne({ count: today.length }) : m.birthday.alertTodayOther({ count: today.length })}
    </p>
  {/if}

  <SettingField label={m.birthday.usersUpcomingTitle()} id="birthday-upcoming-days">
    <DiscordSelector
      id="birthday-upcoming-days"
      type="custom"
      customIcon="fa-calendar"
      options={periods}
      selected={String(days)}
      clearable={false}
      searchable={false}
      onchange={(detail) => {
        const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
        if (value) ondays(parseInt(value));
      }}
    />
  </SettingField>

  {#each upcoming as user (user.userId.toString())}
    <div class="flex items-center gap-3 rounded-xl border p-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <img src={user.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" loading="lazy" />
      <div class="grow min-w-0">
        <p class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{user.nickname ?? user.username}</p>
        <p class="text-xs truncate" style="color: {$colorStore.muted}">{line(user)} · {user.birthdayTimezone || "UTC"}</p>
      </div>
      <span class="shrink-0 text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{dayText(user)}</span>
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.birthday.usersUpcomingEmpty({ days })}</p>
  {/each}

  <h4 class="text-sm font-medium pt-2" style="color: {$colorStore.text}">{m.birthday.usersAllTitle({ count: sorted.length })}</h4>
  {#each sorted.slice(0, shown) as user (user.userId.toString())}
    <div class="relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <img src={user.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" loading="lazy" />
      <div class="grow min-w-0">
        <p class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{user.nickname ?? user.username}</p>
        <p class="text-xs truncate" style="color: {$colorStore.muted}">{line(user)} · {user.birthdayTimezone || "UTC"}</p>
      </div>
      <RowActions name={user.nickname ?? user.username} moreLabel={m.common.moreActions()} actions={[{ label: m.common.remove(), icon: "fa-trash", run: () => remove(user) }]} />
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.birthday.usersNoneTitle()}</p>
  {/each}

  {#if sorted.length > shown}
    <button type="button" class="w-full px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (shown += PAGE)}>{m.common.showMore()}</button>
  {/if}
</PluginCard>

{#if adding}
  <Sheet title={m.birthday.addBirthday()} onclose={() => (adding = false)}>
    <SettingField label={m.common.member()} id="birthday-member">
      <DiscordSelector id="birthday-member" type="custom" options={members} customIcon="fa-user" placeholder={m.common.pickMemberPlaceholder()} bind:selected={pickedMember} />
    </SettingField>
    <SettingField label={m.birthday.dateLabel()} id="birthday-date">
      <input id="birthday-date" type="date" bind:value={date} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
    </SettingField>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (adding = false)}>{m.common.cancel()}</button>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={!pickedMember || !date || saving} onclick={save}>{m.common.save()}</button>
    {/snippet}
  </Sheet>
{/if}
