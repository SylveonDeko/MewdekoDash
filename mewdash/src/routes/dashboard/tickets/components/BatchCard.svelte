<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { clientApi, ticketApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import EditorGroup from "./editor/EditorGroup.svelte";
  import NumberField from "./editor/NumberField.svelte";
  import { errorText, idOrNull, type Named } from "../ticketModel";

  interface Props {
    guildId: bigint;
    categories: Named[];
    roles: Named[];
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, categories, roles, onreload, onerror, onsuccess }: Props = $props();

  let busy = $state(false);
  let inactiveOpen = $state(false);
  let moveOpen = $state(false);
  let roleOpen = $state(false);
  let transferOpen = $state(false);
  let hours = $state(48);
  let sourceCategory = $state<string | null>(null);
  let targetCategory = $state<string | null>(null);
  let role = $state<string | null>(null);
  let viewOnly = $state(false);
  let fromStaff = $state<string | null>(null);
  let toStaff = $state<string | null>(null);
  let members = $state<Named[]>([]);
  let claimers = $state<Named[]>([]);
  let staffLoaded = false;

  async function run(action: () => Promise<{ done: number; failed: number }>, failure: string) {
    if (busy) return;
    busy = true;
    try {
      const result = await action();
      await onreload();
      if (result.failed > 0) onerror(m.tickets.batchPartial({ done: result.done, failed: result.failed }));
      else onsuccess(m.tickets.batchDone({ count: result.done }));
    } catch (err) {
      logger.error(failure, err);
      onerror(errorText(err, failure));
    } finally {
      busy = false;
    }
  }

  async function closeInactive() {
    const ok = await requestConfirmation({ message: m.tickets.closeInactiveConfirm({ hours }), confirmText: m.common.close(), variant: "warning" });
    if (!ok) return;
    await run(async () => {
      const r = await ticketApi.closeInactiveTickets(guildId, hours);
      return { done: r.closed, failed: r.failed };
    }, m.tickets.batchFailed());
  }

  async function moveAll() {
    if (!sourceCategory || !targetCategory) return;
    const source = BigInt(sourceCategory);
    const target = BigInt(targetCategory);
    const ok = await requestConfirmation({ message: m.tickets.moveAllConfirm(), confirmText: m.tickets.move(), variant: "warning" });
    if (!ok) return;
    await run(async () => {
      const r = await ticketApi.moveTicketsBatch(guildId, { sourceCategoryId: source, targetCategoryId: target });
      return { done: r.moved, failed: r.failed };
    }, m.tickets.batchFailed());
  }

  async function addRole() {
    if (!role) return;
    const id = BigInt(role);
    const ok = await requestConfirmation({ message: m.tickets.addRoleConfirm(), confirmText: m.common.add(), variant: "warning" });
    if (!ok) return;
    await run(async () => {
      const r = await ticketApi.addRoleBatch(guildId, { roleId: id, viewOnly });
      return { done: r.updated, failed: r.failed };
    }, m.tickets.batchFailed());
  }

  async function loadStaff() {
    if (staffLoaded) return;
    staffLoaded = true;
    try {
      const [list, open] = await Promise.all([clientApi.getMembers(guildId), ticketApi.getGuildTickets(guildId, false, false)]);
      members = list.map(member => ({ id: String(member.id), name: member.displayName || member.username }));
      const counts = new Map<string, { name: string; count: number }>();
      for (const ticket of open) {
        if (!ticket.claimedBy) continue;
        const id = String(ticket.claimedBy);
        const entry = counts.get(id) ?? { name: members.find(x => x.id === id)?.name ?? ticket.claimedByName ?? id, count: 0 };
        entry.count++;
        counts.set(id, entry);
      }
      claimers = [...counts].map(([id, { name, count }]) => ({ id, name: `${name} (${count})` }));
    } catch (err) {
      staffLoaded = false;
      logger.error("Failed to load ticket staff:", err);
      onerror(errorText(err, m.tickets.batchFailed()));
    }
  }

  $effect(() => {
    if (transferOpen) void loadStaff();
  });

  async function transfer() {
    if (!fromStaff || !toStaff) return;
    const from = BigInt(fromStaff);
    const to = BigInt(toStaff);
    const ok = await requestConfirmation({ message: m.tickets.transferConfirm(), confirmText: m.tickets.transfer(), variant: "warning" });
    if (!ok) return;
    await run(async () => {
      const r = await ticketApi.transferTicketsBatch(guildId, { fromStaffId: from, toStaffId: to });
      return { done: r.transferred, failed: r.failed };
    }, m.tickets.batchFailed());
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
</script>

<PluginCard title={m.tickets.cardBatchTitle()}>
  <EditorGroup title={m.tickets.closeInactiveTitle()} bind:open={inactiveOpen}>
    <NumberField id="batch-hours" label={m.tickets.inactiveHours()} value={hours} min={1} max={8760} onchange={(v) => (hours = v ?? 48)} />
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto" style={buttonStyle} disabled={busy} onclick={closeInactive}>{m.tickets.closeInactive()}</button>
  </EditorGroup>

  <EditorGroup title={m.tickets.moveAllTitle()} bind:open={moveOpen}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SettingField label={m.tickets.moveFrom()} id="batch-from-category">
        <DiscordSelector id="batch-from-category" type="channel" options={categories} selected={sourceCategory} placeholder={m.common.selectCategoryPlaceholder()} onchange={(d) => (sourceCategory = idOrNull(d.selected))} />
      </SettingField>
      <SettingField label={m.tickets.moveToCategory()} id="batch-to-category">
        <DiscordSelector id="batch-to-category" type="channel" options={categories} selected={targetCategory} placeholder={m.common.selectCategoryPlaceholder()} onchange={(d) => (targetCategory = idOrNull(d.selected))} />
      </SettingField>
    </div>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto" style={buttonStyle} disabled={busy || !sourceCategory || !targetCategory} onclick={moveAll}>{m.tickets.move()}</button>
  </EditorGroup>

  <EditorGroup title={m.tickets.addRoleTitle()} bind:open={roleOpen}>
    <SettingField label={m.common.role()} id="batch-role">
      <DiscordSelector id="batch-role" type="role" options={roles} selected={role} placeholder={m.common.selectRolePlaceholder()} onchange={(d) => (role = idOrNull(d.selected))} />
    </SettingField>
    <ToggleRow colors={$colorStore} checked={viewOnly} title={m.tickets.viewOnly()} onchange={(on) => (viewOnly = on)} />
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto" style={buttonStyle} disabled={busy || !role} onclick={addRole}>{m.common.add()}</button>
  </EditorGroup>

  <EditorGroup title={m.tickets.transferTitle()} bind:open={transferOpen}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SettingField label={m.tickets.transferFrom()} id="batch-from-staff">
        <DiscordSelector id="batch-from-staff" type="user" options={claimers} bind:selected={fromStaff} placeholder={m.common.selectUserPlaceholder()} />
      </SettingField>
      <SettingField label={m.tickets.transferTo()} id="batch-to-staff">
        <DiscordSelector id="batch-to-staff" type="user" options={members.filter(x => x.id !== fromStaff)} bind:selected={toStaff} placeholder={m.common.selectUserPlaceholder()} />
      </SettingField>
    </div>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto" style={buttonStyle} disabled={busy || !fromStaff || !toStaff} onclick={transfer}>{m.tickets.transfer()}</button>
  </EditorGroup>
</PluginCard>
