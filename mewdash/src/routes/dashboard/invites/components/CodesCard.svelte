<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { inviteTrackingApi, type GuildInviteCode, type InviteLabel } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { formatNumber } from "$lib/components/stats/format";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import RowActions from "./RowActions.svelte";
  import { errorText, idString, type Member, type Named, type Role } from "./inviteModel";

  interface Props {
    guildId: bigint;
    members: Member[];
    roles: Role[];
    channels: Named[];
    autoSave: AutoSave;
    onerror: (message: string) => void;
  }

  let { guildId, members, roles, channels, autoSave, onerror }: Props = $props();

  let codes: GuildInviteCode[] = $state([]);
  let labels: InviteLabel[] = $state([]);
  let loaded = $state(false);
  let editingCode: string | null = $state(null);
  let draftLabel = $state("");
  let draftRole: string | null = $state(null);
  let saved = { label: "", roleId: null as string | null };

  const editing = $derived(codes.find(code => code.code === editingCode) ?? null);
  const stale = $derived(labels.filter(label => !codes.some(code => code.code === label.inviteCode)));
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function memberName(id: bigint | string): string {
    const key = id.toString();
    return members.find(member => member.id === key)?.name ?? key;
  }

  function channelName(id: bigint): string {
    return channels.find(channel => channel.id === id.toString())?.name ?? id.toString();
  }

  function usage(code: GuildInviteCode): string {
    const uses = code.maxUses
      ? code.uses === 1
        ? m.invites.codesUsesOfOne({ count: formatNumber(code.uses), max: code.maxUses })
        : m.invites.codesUsesOfOther({ count: formatNumber(code.uses), max: code.maxUses })
      : code.uses === 1
        ? m.invites.codesUsesOne({ count: formatNumber(code.uses) })
        : m.invites.codesUsesOther({ count: formatNumber(code.uses) });
    const parts = [uses];
    if (code.maxAge) parts.push(m.invites.codesFlagExpires());
    if (code.isTemporary) parts.push(m.invites.codesFlagTemporary());
    return parts.join(" · ");
  }

  async function load() {
    try {
      const [codeList, labelList] = await Promise.all([inviteTrackingApi.getCodes(guildId), inviteTrackingApi.getLabels(guildId)]);
      codes = codeList;
      labels = labelList;
    } catch (err) {
      logger.error("Failed to load invite codes:", err);
      onerror(errorText(err, m.invites.errorLoadCodes()));
    } finally {
      loaded = true;
    }
  }

  function open(code: GuildInviteCode) {
    editingCode = code.code;
    draftLabel = code.label ?? "";
    draftRole = code.labelRoleId ? idString(code.labelRoleId) : null;
    saved = { label: draftLabel, roleId: draftRole };
  }

  function close() {
    void autoSave.flush(`label:${editingCode}`);
    editingCode = null;
  }

  function saveLabel(code: string) {
    const label = draftLabel.trim();
    const roleId = label ? draftRole : null;
    if (label === saved.label && roleId === (saved.label ? saved.roleId : null)) return null;
    const previous = saved;
    return async () => {
      try {
        if (!label) await inviteTrackingApi.removeLabel(guildId, code);
        else await inviteTrackingApi.setLabel(guildId, { code, label, roleId: roleId ? BigInt(roleId) : null });
        saved = { label, roleId };
        codes = codes.map(x => (x.code === code ? { ...x, label: label || null, labelRoleId: roleId ? BigInt(roleId) : null } : x));
      } catch (err) {
        if (editingCode === code) {
          draftLabel = previous.label;
          draftRole = previous.roleId;
        }
        throw err;
      }
    };
  }

  function typeLabel() {
    if (!editingCode) return;
    const key = `label:${editingCode}`;
    if (!draftLabel.trim()) {
      autoSave.cancel(key);
      return;
    }
    const save = saveLabel(editingCode);
    if (save) autoSave.schedule(key, save);
    else autoSave.cancel(key);
  }

  function leaveLabel() {
    if (!editingCode) return;
    const key = `label:${editingCode}`;
    if (!draftLabel.trim()) {
      const save = saveLabel(editingCode);
      if (save) void autoSave.now(key, save);
      return;
    }
    void autoSave.flush(key);
  }

  function pickRole() {
    if (!editingCode) return;
    const save = saveLabel(editingCode);
    if (save) void autoSave.now(`label:${editingCode}`, save);
  }

  async function remove(code: GuildInviteCode) {
    const confirmed = await requestConfirmation({
      title: m.invites.confirmDeleteCodeTitle(),
      message: m.invites.confirmDeleteCodeMessage({ code: code.code }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await inviteTrackingApi.deleteCode(guildId, code.code);
      if (editingCode === code.code) editingCode = null;
      await load();
    } catch (err) {
      logger.error("Failed to delete an invite code:", err);
      onerror(errorText(err, m.invites.errorDeleteCode()));
    }
  }

  async function removeStale(label: InviteLabel) {
    try {
      await inviteTrackingApi.removeLabel(guildId, label.inviteCode);
      await load();
    } catch (err) {
      logger.error("Failed to remove a label:", err);
      onerror(errorText(err, m.invites.errorRemoveLabel()));
    }
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.invites.codesTitle()} alwaysOpen>
  {#each codes as code (code.code)}
    <div class="relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={() => open(code)}>
        <span class="block font-mono text-sm font-semibold truncate" style="color: {$colorStore.text}">{code.code}</span>
        <span class="block text-xs truncate" style="color: {$colorStore.muted}">
          {code.label ? `${code.label} · ` : ""}{code.inviterName ?? (code.ownerUserId ? memberName(code.ownerUserId) : m.common.unknownLower())} · #{channelName(code.channelId)} · {usage(code)}
        </span>
      </button>
      <RowActions
        name={code.code}
        moreLabel={m.common.moreActions()}
        actions={[
          { label: m.common.edit(), icon: "fa-pen", run: () => open(code) },
          { label: m.common.delete(), icon: "fa-trash", run: () => remove(code) }
        ]}
      />
    </div>
  {:else}
    {#if loaded}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.codesEmpty()}</p>
    {/if}
  {/each}

  {#if stale.length > 0}
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.invites.codesStaleTitle()}</h4>
    {#each stale as label (label.id)}
      <div class="flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}"><span class="font-mono">{label.inviteCode}</span> · {label.label}</span>
        <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px]" style={buttonStyle} aria-label="{m.common.remove()}: {label.inviteCode}" onclick={() => removeStale(label)}>
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {/each}
  {/if}
</PluginCard>

{#if editing}
  <Sheet title={editing.code} onclose={close}>
    <SettingField label={m.common.label()} id="invites-code-label">
      <input
        id="invites-code-label"
        type="text"
        maxlength="64"
        bind:value={draftLabel}
        oninput={typeLabel}
        onblur={leaveLabel}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </SettingField>
    <SettingField label={m.invites.codesRole()} id="invites-code-role">
      <DiscordSelector
        id="invites-code-role"
        type="role"
        options={roles}
        bind:selected={draftRole}
        disabled={!draftLabel.trim()}
        placeholder={draftLabel.trim() ? m.common.noRole() : m.invites.codesRoleNeedsLabel()}
        onchange={pickRole}
      />
    </SettingField>
  </Sheet>
{/if}
