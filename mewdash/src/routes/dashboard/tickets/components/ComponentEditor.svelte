<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { TicketComponentDetail, TicketPriority, UpdateButtonRequest } from "$lib/api/ticket/models";
  import { ButtonStyle } from "$lib/api/ticket/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import EditorGroup from "./editor/EditorGroup.svelte";
  import NumberField from "./editor/NumberField.svelte";
  import ModalBuilder from "./editor/ModalBuilder.svelte";
  import { HOUR, MINUTE, errorText, idBigints, idOrNull, idStrings, spanInUnits, unitsSpan, type Named } from "../ticketModel";

  interface Props {
    guildId: bigint;
    kind: "button" | "option";
    id: number;
    categories: Named[];
    threadChannels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    priorities: TicketPriority[];
    user?: DiscordUser | null;
    autoSave: AutoSave;
    onsummary: (patch: { label?: string; emoji?: string | null; description?: string | null; style?: number }) => void;
    onerror: (message: string) => void;
  }

  let { guildId, kind, id, categories, threadChannels, roles, emojis, priorities, user = null, autoSave, onsummary, onerror }: Props = $props();

  let detail = $state<TicketComponentDetail | null>(null);
  let failed = $state(false);
  let pending: UpdateButtonRequest = {};

  const saveKey = $derived(`component:${kind}:${id}`);

  const styleOptions = $derived([
    { id: String(ButtonStyle.Primary), name: m.common.primary() },
    { id: String(ButtonStyle.Secondary), name: m.common.secondary() },
    { id: String(ButtonStyle.Success), name: m.common.success() },
    { id: String(ButtonStyle.Danger), name: m.common.danger() }
  ]);

  const priorityOptions = $derived(priorities.map(p => ({ id: p.priorityId, name: `${p.emoji ?? ""} ${p.name}`.trim() })));

  async function load() {
    try {
      detail = kind === "button" ? await ticketApi.getButton(guildId, id) : await ticketApi.getSelectMenuOption(guildId, id);
      failed = false;
    } catch (err) {
      logger.error("Failed to load ticket component:", err);
      failed = true;
      onerror(errorText(err, m.tickets.loadComponentFailed()));
    }
  }

  onMount(() => {
    void load();
    return () => {
      void autoSave.flush(saveKey);
    };
  });

  function toWire(p: Partial<TicketComponentDetail>): UpdateButtonRequest {
    const w: UpdateButtonRequest = {};
    if ("label" in p && p.label?.trim()) w.label = p.label;
    if ("emoji" in p) w.emoji = p.emoji ?? "";
    if ("style" in p && p.style) w.style = p.style as ButtonStyle;
    if ("description" in p) w.description = p.description ?? "";
    if ("channelNameFormat" in p && p.channelNameFormat?.trim()) w.channelFormat = p.channelNameFormat;
    if ("categoryId" in p) w.categoryId = p.categoryId ? BigInt(p.categoryId) : 0n;
    if ("archiveCategoryId" in p) w.archiveCategoryId = p.archiveCategoryId ? BigInt(p.archiveCategoryId) : 0n;
    if ("claimedCategoryId" in p) w.claimedCategoryId = p.claimedCategoryId ? BigInt(p.claimedCategoryId) : 0n;
    if ("threadChannelId" in p) w.threadChannelId = p.threadChannelId ? BigInt(p.threadChannelId) : 0n;
    if ("dmTranscript" in p) w.dmTranscript = p.dmTranscript;
    if ("supportRoles" in p) w.supportRoles = p.supportRoles ?? [];
    if ("viewerRoles" in p) w.viewerRoles = p.viewerRoles ?? [];
    if ("autoCloseTime" in p) w.autoCloseTime = p.autoCloseTime ?? "00:00:00";
    if ("requiredResponseTime" in p) w.requiredResponseTime = p.requiredResponseTime ?? "00:00:00";
    if ("maxActiveTickets" in p && p.maxActiveTickets) w.maxActiveTickets = p.maxActiveTickets;
    if ("allowedPriorities" in p) w.allowedPriorities = p.allowedPriorities ?? [];
    if ("defaultPriority" in p) w.defaultPriority = p.defaultPriority ?? "";
    if ("saveTranscript" in p) w.saveTranscript = p.saveTranscript;
    if ("deleteOnClose" in p) w.deleteOnClose = p.deleteOnClose;
    if ("lockOnClose" in p) w.lockOnClose = p.lockOnClose;
    if ("renameOnClose" in p) w.renameOnClose = p.renameOnClose;
    if ("removeCreatorOnClose" in p) w.removeCreatorOnClose = p.removeCreatorOnClose;
    if ("deleteDelay" in p) w.deleteDelay = p.deleteDelay;
    if ("lockOnArchive" in p) w.lockOnArchive = p.lockOnArchive;
    if ("renameOnArchive" in p) w.renameOnArchive = p.renameOnArchive;
    if ("removeCreatorOnArchive" in p) w.removeCreatorOnArchive = p.removeCreatorOnArchive;
    if ("autoArchiveOnClose" in p) w.autoArchiveOnClose = p.autoArchiveOnClose;
    if ("modalJson" in p) w.modalJson = p.modalJson ?? "";
    if ("openMessageJson" in p) w.openMessageJson = p.openMessageJson ?? "";
    return w;
  }

  function change(patch: Partial<TicketComponentDetail>, typing = false) {
    if (!detail) return;
    detail = { ...detail, ...patch };
    if ("label" in patch || "emoji" in patch || "description" in patch || "style" in patch) {
      onsummary({
        ...("label" in patch ? { label: patch.label } : {}),
        ...("emoji" in patch ? { emoji: patch.emoji } : {}),
        ...("description" in patch ? { description: patch.description } : {}),
        ...("style" in patch ? { style: patch.style } : {})
      });
    }
    const wire = toWire(patch);
    if (Object.keys(wire).length === 0) return;
    pending = { ...pending, ...wire };
    const send = async () => {
      const body = pending;
      pending = {};
      if (Object.keys(body).length === 0) return;
      try {
        if (kind === "button") await ticketApi.updateButton(guildId, id, body);
        else await ticketApi.updateSelectMenuOption(guildId, id, body);
      } catch (err) {
        await load();
        throw err;
      }
    };
    if (typing) autoSave.schedule(saveKey, send);
    else void autoSave.now(saveKey, send);
  }

  function picked(detailValue: { selected: string | string[] | null }): string[] {
    return Array.isArray(detailValue.selected) ? detailValue.selected : [];
  }

  const modalKeys = $derived.by(() => {
    if (!detail?.modalJson) return [] as string[];
    try {
      const parsed = JSON.parse(detail.modalJson);
      return Object.keys(parsed.Fields ?? parsed.fields ?? {});
    } catch {
      return [];
    }
  });

  const openPlaceholders = $derived([
    { category: m.tickets.placeholderGroup(), name: "%ticket.id%", description: m.tickets.phTicketId() },
    { category: m.tickets.placeholderGroup(), name: "%ticket.channel%", description: m.tickets.phTicketChannel() },
    { category: m.tickets.placeholderGroup(), name: "%ticket.user%", description: m.tickets.phTicketUser() },
    { category: m.tickets.placeholderGroup(), name: "%ticket.user.mention%", description: m.tickets.phTicketUserMention() },
    { category: m.tickets.placeholderGroup(), name: "%ticket.user.id%", description: m.tickets.phTicketUserId() },
    { category: m.tickets.placeholderGroup(), name: "%ticket.user.avatar%", description: m.tickets.phTicketUserAvatar() },
    { category: m.tickets.placeholderGroup(), name: "%ticket.created%", description: m.tickets.phTicketCreated() },
    ...modalKeys.map(key => ({ category: m.tickets.sectionForm(), name: `%modal.${key}%`, description: m.tickets.phModalAnswer() })),
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() },
    { category: m.features.categoryServer(), name: "%server.members%", description: m.placeholders.serverMembers() }
  ]);

  const channelCount = $derived(
    detail ? [detail.channelNameFormat && detail.channelNameFormat !== "ticket-{username}-{id}", detail.categoryId, detail.archiveCategoryId, detail.claimedCategoryId, detail.threadChannelId].filter(Boolean).length : 0
  );
  const accessCount = $derived(
    detail ? [detail.supportRoles?.length, detail.viewerRoles?.length, detail.maxActiveTickets > 1, detail.allowedPriorities?.length, detail.defaultPriority].filter(Boolean).length : 0
  );
  const timingCount = $derived(detail ? [spanInUnits(detail.autoCloseTime, HOUR), spanInUnits(detail.requiredResponseTime, MINUTE)].filter(Boolean).length : 0);
  const closingCount = $derived(
    detail
      ? [
          detail.saveTranscript,
          detail.dmTranscript,
          detail.autoArchiveOnClose,
          detail.deleteOnClose,
          !detail.lockOnClose,
          !detail.renameOnClose,
          !detail.removeCreatorOnClose,
          !detail.lockOnArchive,
          !detail.renameOnArchive,
          detail.removeCreatorOnArchive
        ].filter(Boolean).length
      : 0
  );

  let channelOpen = $state(false);
  let accessOpen = $state(false);
  let timingOpen = $state(false);
  let closingOpen = $state(false);
  let messageOpen = $state(false);
  let formOpen = $state(false);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const uid = $derived(`tc-${kind}-${id}`);
</script>

{#if failed}
  <div class="flex flex-col items-center gap-3 py-8 text-center">
    <p style="color: {$colorStore.muted}">{m.tickets.loadComponentFailed()}</p>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
      onclick={load}
    >
      {m.common.retry()}
    </button>
  </div>
{:else if !detail}
  <div class="flex justify-center py-8">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <SettingField label={m.common.label()} id="{uid}-label">
      <input
        id="{uid}-label"
        type="text"
        maxlength={kind === "button" ? 80 : 100}
        value={detail.label}
        oninput={(e) => change({ label: e.currentTarget.value }, true)}
        onblur={() => autoSave.flush(saveKey)}
        placeholder={m.tickets.labelPlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    <SettingField label={m.common.emoji()} id="{uid}-emoji">
      <EmojiPicker
        id="{uid}-emoji"
        guildEmojis={emojis}
        selected={detail.emoji || null}
        multiple={false}
        placeholder={m.common.selectEmojiPlaceholder()}
        onchange={(d) => change({ emoji: typeof d.selected === "string" ? d.selected : null })}
      />
    </SettingField>
    {#if kind === "button"}
      <SettingField label={m.common.style()} id="{uid}-style">
        <DiscordSelector
          id="{uid}-style"
          type="custom"
          options={styleOptions}
          selected={String(detail.style ?? ButtonStyle.Primary)}
          searchable={false}
          clearable={false}
          customIcon="fa-palette"
          onchange={(d) => typeof d.selected === "string" && change({ style: Number(d.selected) })}
        />
      </SettingField>
    {:else}
      <SettingField label={m.common.description()} id="{uid}-description">
        <input
          id="{uid}-description"
          type="text"
          maxlength="100"
          value={detail.description ?? ""}
          oninput={(e) => change({ description: e.currentTarget.value }, true)}
          onblur={() => autoSave.flush(saveKey)}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    {/if}
  </div>

  <EditorGroup title={m.common.channels()} count={channelCount} bind:open={channelOpen}>
    <SettingField label={m.common.channelNameFormat()} hint={m.tickets.channelFormatHint({ username: "{username}", id: "{id}" })} id="{uid}-format">
      <input
        id="{uid}-format"
        type="text"
        maxlength="90"
        value={detail.channelNameFormat ?? ""}
        oninput={(e) => change({ channelNameFormat: e.currentTarget.value }, true)}
        onblur={() => autoSave.flush(saveKey)}
        placeholder="ticket-{'{username}'}-{'{id}'}"
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono"
        style={inputStyle}
      >
    </SettingField>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SettingField label={m.common.ticketCategory()} id="{uid}-category">
        <DiscordSelector
          id="{uid}-category"
          type="channel"
          options={categories}
          selected={detail.categoryId ? String(detail.categoryId) : null}
          placeholder={m.common.selectCategoryPlaceholder()}
          onchange={(d) => change({ categoryId: idOrNull(d.selected) ? BigInt(idOrNull(d.selected)!) : null })}
        />
      </SettingField>
      <SettingField label={m.tickets.archiveCategory()} id="{uid}-archive">
        <DiscordSelector
          id="{uid}-archive"
          type="channel"
          options={categories}
          selected={detail.archiveCategoryId ? String(detail.archiveCategoryId) : null}
          placeholder={m.common.selectCategoryPlaceholder()}
          onchange={(d) => change({ archiveCategoryId: idOrNull(d.selected) ? BigInt(idOrNull(d.selected)!) : null })}
        />
      </SettingField>
      <SettingField label={m.tickets.claimedCategory()} id="{uid}-claimed">
        <DiscordSelector
          id="{uid}-claimed"
          type="channel"
          options={categories}
          selected={detail.claimedCategoryId ? String(detail.claimedCategoryId) : null}
          placeholder={m.common.selectCategoryPlaceholder()}
          onchange={(d) => change({ claimedCategoryId: idOrNull(d.selected) ? BigInt(idOrNull(d.selected)!) : null })}
        />
      </SettingField>
      <SettingField label={m.tickets.threadChannel()} hint={m.tickets.threadChannelHint()} id="{uid}-thread">
        <DiscordSelector
          id="{uid}-thread"
          type="channel"
          options={threadChannels}
          selected={detail.threadChannelId ? String(detail.threadChannelId) : null}
          placeholder={m.common.pickChannelPlaceholder()}
          onchange={(d) => change({ threadChannelId: idOrNull(d.selected) ? BigInt(idOrNull(d.selected)!) : null })}
        />
      </SettingField>
    </div>
  </EditorGroup>

  <EditorGroup title={m.tickets.sectionAccess()} count={accessCount} bind:open={accessOpen}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SettingField label={m.common.supportRoles()} id="{uid}-support">
        <DiscordSelector
          id="{uid}-support"
          type="role"
          multiple={true}
          options={roles}
          selected={idStrings(detail.supportRoles)}
          placeholder={m.common.selectRolesPlaceholder()}
          onchange={(d) => change({ supportRoles: idBigints(picked(d)) })}
        />
      </SettingField>
      <SettingField label={m.tickets.viewerRoles()} id="{uid}-viewer">
        <DiscordSelector
          id="{uid}-viewer"
          type="role"
          multiple={true}
          options={roles}
          selected={idStrings(detail.viewerRoles)}
          placeholder={m.common.selectRolesPlaceholder()}
          onchange={(d) => change({ viewerRoles: idBigints(picked(d)) })}
        />
      </SettingField>
    </div>
    <NumberField
      id="{uid}-max"
      label={m.tickets.maxActiveTickets()}
      value={detail.maxActiveTickets}
      min={1}
      max={100}
      onchange={(v) => change({ maxActiveTickets: v ?? 1 }, true)}
    />
    {#if priorityOptions.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SettingField label={m.tickets.allowedPriorities()} id="{uid}-allowed">
          <DiscordSelector
            id="{uid}-allowed"
            type="custom"
            multiple={true}
            options={priorityOptions}
            selected={detail.allowedPriorities ?? []}
            customIcon="fa-flag"
            placeholder={m.tickets.anyPriority()}
            onchange={(d) => change({ allowedPriorities: picked(d) })}
          />
        </SettingField>
        <SettingField label={m.tickets.defaultPriority()} id="{uid}-default">
          <DiscordSelector
            id="{uid}-default"
            type="custom"
            options={priorityOptions}
            selected={detail.defaultPriority || null}
            customIcon="fa-flag"
            placeholder={m.common.none()}
            onchange={(d) => change({ defaultPriority: idOrNull(d.selected) })}
          />
        </SettingField>
      </div>
    {/if}
  </EditorGroup>

  <EditorGroup title={m.tickets.sectionTiming()} count={timingCount} bind:open={timingOpen}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <NumberField
        id="{uid}-autoclose"
        label={m.tickets.autoCloseHours()}
        value={spanInUnits(detail.autoCloseTime, HOUR)}
        nullable
        min={0}
        max={8760}
        onchange={(v) => change({ autoCloseTime: unitsSpan(v, HOUR) }, true)}
      />
      <NumberField
        id="{uid}-response"
        label={m.tickets.responseMinutes()}
        value={spanInUnits(detail.requiredResponseTime, MINUTE)}
        nullable
        min={0}
        max={10080}
        onchange={(v) => change({ requiredResponseTime: unitsSpan(v, MINUTE) }, true)}
      />
    </div>
  </EditorGroup>

  <EditorGroup title={m.tickets.sectionClosing()} count={closingCount} bind:open={closingOpen}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ToggleRow colors={$colorStore} checked={Boolean(detail.saveTranscript)} title={m.tickets.optSaveTranscript()} onchange={(v) => change({ saveTranscript: v })} />
      <ToggleRow colors={$colorStore} checked={detail.dmTranscript} title={m.tickets.optDmTranscript()} onchange={(v) => change({ dmTranscript: v })} />
      <ToggleRow colors={$colorStore} checked={detail.autoArchiveOnClose} title={m.tickets.optAutoArchive()} onchange={(v) => change({ autoArchiveOnClose: v })} />
      <ToggleRow colors={$colorStore} checked={detail.deleteOnClose} title={m.tickets.optDeleteOnClose()} onchange={(v) => change({ deleteOnClose: v })} />
    </div>
    <NumberField
      id="{uid}-delay"
      label={m.tickets.deleteDelayMinutes()}
      value={spanInUnits(detail.deleteDelay, MINUTE) ?? 0}
      min={0}
      max={10080}
      onchange={(v) => change({ deleteDelay: unitsSpan(v, MINUTE) }, true)}
    />
    <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.onClose()}</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ToggleRow colors={$colorStore} checked={detail.lockOnClose} title={m.tickets.optLock()} onchange={(v) => change({ lockOnClose: v })} />
      <ToggleRow colors={$colorStore} checked={detail.renameOnClose} title={m.tickets.optRename()} onchange={(v) => change({ renameOnClose: v })} />
      <ToggleRow colors={$colorStore} checked={detail.removeCreatorOnClose} title={m.tickets.optRemoveCreator()} onchange={(v) => change({ removeCreatorOnClose: v })} />
    </div>
    <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.onArchive()}</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ToggleRow colors={$colorStore} checked={detail.lockOnArchive} title={m.tickets.optLock()} onchange={(v) => change({ lockOnArchive: v })} />
      <ToggleRow colors={$colorStore} checked={detail.renameOnArchive} title={m.tickets.optRename()} onchange={(v) => change({ renameOnArchive: v })} />
      <ToggleRow colors={$colorStore} checked={detail.removeCreatorOnArchive} title={m.tickets.optRemoveCreator()} onchange={(v) => change({ removeCreatorOnArchive: v })} />
    </div>
  </EditorGroup>

  <EditorGroup title={m.tickets.sectionOpenMessage()} count={detail.openMessageJson ? 1 : 0} bind:open={messageOpen}>
    {#if messageOpen}
      <MessageField
        value={detail.openMessageJson}
        previewTitle={m.tickets.openMessageTitle()}
        icon="fa-ticket"
        {user}
        placeholder={m.tickets.openMessagePlaceholder()}
        placeholders={openPlaceholders}
        onchange={(message) => change({ openMessageJson: message }, true)}
      />
    {/if}
  </EditorGroup>

  <EditorGroup title={m.tickets.sectionForm()} count={detail.modalJson ? 1 : 0} bind:open={formOpen}>
    {#if formOpen}
      <ModalBuilder {uid} value={detail.modalJson} onchange={(json) => change({ modalJson: json }, true)} />
    {/if}
  </EditorGroup>
{/if}
