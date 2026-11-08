<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import {
    clientApi,
    countingApi,
    type CountingBanResponse,
    type SavePointResponse
  } from "$lib/api/index.ts";
  import type { DiscordUser } from "$lib/types/discord";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import ViolationsCard from "./ViolationsCard.svelte";
  import { formatNumber, idString, timeAgo, type Notify } from "./countingModel";

  interface Props {
    guildId: bigint;
    channelId: bigint;
    user: DiscordUser;
    notify: Notify;
    onchanged: () => Promise<void>;
  }

  let { guildId, channelId, user, notify, onchanged }: Props = $props();

  let savePoints = $state<SavePointResponse[]>([]);
  let bans = $state<CountingBanResponse[]>([]);
  let members = $state<Array<{ id: string; name: string }>>([]);
  let busy = $state(false);

  let saveReason = $state("");
  let resetNumber = $state(1);
  let resetReason = $state("");
  let banMember = $state<string | null>(null);
  let banMinutes = $state<number | null>(null);
  let banReason = $state("");
  let purgeReason = $state("");

  const userId = $derived(BigInt(user.id));
  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  async function run(action: () => Promise<unknown>, failed: string) {
    busy = true;
    try {
      await action();
      return true;
    } catch (err) {
      logger.error(failed, err);
      notify(failed, "error");
      return false;
    } finally {
      busy = false;
    }
  }

  async function loadSavePoints() {
    savePoints = (await countingApi.getSavePoints(guildId, channelId).catch(() => [])) ?? [];
  }

  async function loadBans() {
    bans = (await countingApi.getBannedUsers(guildId, channelId).catch(() => [])) ?? [];
  }

  async function createSavePoint() {
    const ok = await run(
      () => countingApi.createSavePoint(guildId, channelId, { userId, reason: saveReason.trim() || undefined }),
      m.counting.notifySavePointFailed()
    );
    if (!ok) return;
    saveReason = "";
    notify(m.counting.notifySavePointCreated());
    await loadSavePoints();
  }

  async function restore(point: SavePointResponse) {
    const confirmed = await requestConfirmation({
      title: m.common.restore(),
      message: m.counting.confirmRestore({ number: formatNumber(point.savedNumber) }),
      confirmText: m.common.restore()
    });
    if (!confirmed) return;
    const ok = await run(
      () => countingApi.restoreSavePoint(guildId, channelId, { saveId: point.id, userId }),
      m.counting.notifyRestoreFailed()
    );
    if (!ok) return;
    notify(m.counting.notifySavePointRestored());
    await onchanged();
  }

  async function removeSavePoint(point: SavePointResponse) {
    const confirmed = await requestConfirmation({
      title: m.common.delete(),
      message: m.counting.confirmDeleteSavePoint(),
      confirmText: m.common.delete(),
      variant: "danger"
    });
    if (!confirmed) return;
    const ok = await run(
      () => countingApi.deleteSavePoint(guildId, channelId, point.id, userId),
      m.counting.notifyDeleteSavePointFailed()
    );
    if (ok) savePoints = savePoints.filter((x) => x.id !== point.id);
  }

  async function reset() {
    const confirmed = await requestConfirmation({
      title: m.counting.resetTitle(),
      message: m.counting.confirmResetMessage({ number: formatNumber(resetNumber) }),
      confirmText: m.common.reset(),
      variant: "danger"
    });
    if (!confirmed) return;
    const ok = await run(
      () => countingApi.resetCountingChannel(guildId, channelId, { newNumber: resetNumber, userId, reason: resetReason.trim() || undefined }),
      m.counting.notifyResetFailed()
    );
    if (!ok) return;
    notify(m.counting.notifyChannelReset({ number: resetNumber }));
    resetNumber = 1;
    resetReason = "";
    await onchanged();
  }

  async function ban() {
    if (!banMember) return;
    const target = banMember;
    const ok = await run(
      () =>
        countingApi.banUser(guildId, channelId, BigInt(target), {
          bannedBy: userId,
          durationMinutes: banMinutes || null,
          reason: banReason.trim() || null
        }),
      m.counting.notifyBanFailed()
    );
    if (!ok) return;
    banMember = null;
    banMinutes = null;
    banReason = "";
    await loadBans();
  }

  async function unban(entry: CountingBanResponse) {
    const ok = await run(
      () => countingApi.unbanUser(guildId, channelId, entry.userId, { unbannedBy: userId }),
      m.counting.notifyUnbanFailed()
    );
    if (ok) await loadBans();
  }

  async function purge() {
    const confirmed = await requestConfirmation({
      title: m.counting.confirmPurgeTitle(),
      message: m.counting.confirmPurgeMessage(),
      confirmText: m.counting.purgeButton(),
      variant: "danger"
    });
    if (!confirmed) return;
    const ok = await run(
      () => countingApi.purgeCountingChannel(guildId, channelId, { userId, reason: purgeReason.trim() || null }),
      m.counting.notifyPurgeFailed()
    );
    if (!ok) return;
    purgeReason = "";
    notify(m.counting.notifyPurged());
    await Promise.all([onchanged(), loadSavePoints(), loadBans()]);
  }

  onMount(() => {
    void loadSavePoints();
    void loadBans();
    clientApi
      .getMembers(guildId)
      .then((list) => {
        members = list
          .map((x) => ({ id: idString(x.id), name: x.username ?? idString(x.id) }))
          .sort((a, b) => a.name.localeCompare(b.name));
      })
      .catch((err) => logger.error("Failed to load members:", err));
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.counting.savePointsTitle()} alwaysOpen>
    <div class="flex gap-3 items-stretch">
      <input
        type="text"
        class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
        style={field}
        placeholder={m.counting.savePointReasonPlaceholder()}
        aria-label={m.common.reasonOptional()}
        bind:value={saveReason}
      />
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy} onclick={createSavePoint}>
        {m.counting.savePointCreate()}
      </button>
    </div>
    {#each savePoints as point (point.id)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="grow min-w-0">
          <div class="text-sm font-medium" style="color: {$colorStore.text}">{m.counting.savePointNumber({ number: formatNumber(point.savedNumber) })}</div>
          <div class="text-xs truncate" style="color: {$colorStore.muted}">
            {timeAgo(point.savedAt)}{point.savedByUsername ? ` · ${m.common.byName({ name: point.savedByUsername })}` : ""}{point.reason ? ` · ${point.reason}` : ""}
          </div>
        </div>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50" style={iconButton} disabled={busy} aria-label={m.counting.savePointRestoreAria()} onclick={() => restore(point)}>
          <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
        </button>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50" style={iconButton} disabled={busy} aria-label={m.counting.savePointDeleteAria()} onclick={() => removeSavePoint(point)}>
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.savePointsEmpty()}</p>
    {/each}
  </PluginCard>

  <PluginCard title={m.counting.resetTitle()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
      <NumberField id="counting-reset-number" label={m.counting.resetToNumber()} value={resetNumber} min={0} onchange={(value) => (resetNumber = value ?? 0)} />
      <input
        type="text"
        class="w-full p-3 rounded-lg border min-h-[50px]"
        style={field}
        placeholder={m.counting.resetReasonPlaceholder()}
        aria-label={m.common.reasonOptional()}
        bind:value={resetReason}
      />
    </div>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy} onclick={reset}>
      {m.common.reset()}
    </button>
  </PluginCard>

  <PluginCard title={m.counting.bansTitle()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
      <div class="sm:col-span-2">
        <DiscordSelector
          type="user"
          options={members.filter((x) => !bans.some((b) => idString(b.userId) === x.id))}
          selected={banMember}
          ariaLabel={m.common.member()}
          onchange={({ selected }) => (banMember = (selected as string) ?? null)}
        />
      </div>
      <NumberField id="counting-ban-minutes" label={m.common.minutes()} value={banMinutes} min={1} nullable onchange={(value) => (banMinutes = value)} />
    </div>
    <div class="flex gap-3 items-stretch">
      <input
        type="text"
        class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
        style={field}
        placeholder={m.common.reasonOptional()}
        aria-label={m.common.reasonOptional()}
        bind:value={banReason}
      />
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy || !banMember} onclick={ban}>
        {m.common.actionBan()}
      </button>
    </div>
    {#each bans as entry (entry.id)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="grow min-w-0">
          <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">{entry.username ?? m.common.userFallback({ id: idString(entry.userId) })}</div>
          <div class="text-xs truncate" style="color: {$colorStore.muted}">
            {entry.expiresAt ? m.counting.banUntil({ date: new Date(entry.expiresAt.endsWith("Z") ? entry.expiresAt : `${entry.expiresAt}Z`).toLocaleString() }) : m.common.permanentLower()}{entry.reason ? ` · ${entry.reason}` : ""}
          </div>
        </div>
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm shrink-0 disabled:opacity-50" style={iconButton} disabled={busy} onclick={() => unban(entry)}>
          {m.common.unban()}
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.bansEmpty()}</p>
    {/each}
  </PluginCard>

  <ViolationsCard {guildId} {channelId} moderatorId={userId} {members} {notify} />

  <PluginCard title={m.counting.purgeTitle()} alwaysOpen>
    <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.purgeHint()}</p>
    <div class="flex gap-3 items-stretch">
      <input
        type="text"
        class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
        style={field}
        placeholder={m.common.reasonOptional()}
        aria-label={m.counting.purgeReasonAria()}
        bind:value={purgeReason}
      />
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
        disabled={busy}
        onclick={purge}
      >
        {m.counting.purgeButton()}
      </button>
    </div>
  </PluginCard>
</div>
