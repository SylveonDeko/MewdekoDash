<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import {
    joinRoleTimeoutApi,
    type JoinRoleTimeoutAction,
    type JoinRoleTimeoutPending,
    type JoinRoleTimeoutSettings
  } from "$lib/api/index.ts";

  let { availableRoles, textChannels, autoSave, notify } = $props();

  type Unit = "minutes" | "hours" | "days";
  const UNIT_MINUTES: Record<Unit, number> = { minutes: 1, hours: 60, days: 1440 };

  interface Form {
    enabled: boolean;
    timeoutValue: number;
    timeoutUnit: Unit;
    requiredRoleIds: string[];
    exemptRoleIds: string[];
    action: JoinRoleTimeoutAction;
    actionRoleId: string | null;
    warnValue: number | null;
    warnUnit: Unit;
    warnMessage: string;
    actionMessage: string;
    logChannelId: string | null;
    includeExistingMembers: boolean;
  }

  const SAVE_KEY = "joinRoleTimeout";

  let form = $state<Form | null>(null);
  let pending = $state<JoinRoleTimeoutPending | null>(null);
  let loadedFor = "";

  const unitOptions = $derived([
    { id: "minutes", name: m.common.minutes(), label: m.common.minutes() },
    { id: "hours", name: m.common.hours(), label: m.common.hours() },
    { id: "days", name: m.common.days(), label: m.common.days() }
  ]);

  const actionOptions = $derived([
    { id: "Kick", name: m.common.actionKick(), label: m.common.actionKick() },
    { id: "Ban", name: m.common.actionBan(), label: m.common.actionBan() },
    { id: "AddRole", name: m.joinRoleTimeout.actionAddRole(), label: m.joinRoleTimeout.actionAddRole() },
    { id: "RemoveRoles", name: m.common.removeAllRoles(), label: m.common.removeAllRoles() },
    { id: "Timeout", name: m.joinRoleTimeout.actionTimeout(), label: m.joinRoleTimeout.actionTimeout() }
  ]);

  const channelOptions = $derived((textChannels ?? []).map((c: any) => ({ id: String(c.id), name: c.name, type: 0 })));

  function splitMinutes(total: number): { value: number; unit: Unit } {
    if (total % 1440 === 0) return { value: total / 1440, unit: "days" };
    if (total % 60 === 0) return { value: total / 60, unit: "hours" };
    return { value: total, unit: "minutes" };
  }

  function toForm(s: JoinRoleTimeoutSettings): Form {
    const timeout = splitMinutes(s.timeoutMinutes);
    const warn = s.warnBeforeMinutes ? splitMinutes(s.warnBeforeMinutes) : null;
    return {
      enabled: s.enabled,
      timeoutValue: timeout.value,
      timeoutUnit: timeout.unit,
      requiredRoleIds: (s.requiredRoleIds ?? []).map(String),
      exemptRoleIds: (s.exemptRoleIds ?? []).map(String),
      action: s.action,
      actionRoleId: s.actionRoleId != null ? String(s.actionRoleId) : null,
      warnValue: warn?.value ?? null,
      warnUnit: warn?.unit ?? "minutes",
      warnMessage: s.warnMessage ?? "",
      actionMessage: s.actionMessage ?? "",
      logChannelId: s.logChannelId != null ? String(s.logChannelId) : null,
      includeExistingMembers: s.includeExistingMembers
    };
  }

  function toBody(f: Form): JoinRoleTimeoutSettings {
    const warn = f.warnValue ? Math.round(f.warnValue * UNIT_MINUTES[f.warnUnit]) : undefined;
    return {
      enabled: f.enabled,
      timeoutMinutes: Math.round((Number(f.timeoutValue) || 0) * UNIT_MINUTES[f.timeoutUnit]),
      requiredRoleIds: f.requiredRoleIds.map((id) => BigInt(id)),
      exemptRoleIds: f.exemptRoleIds.map((id) => BigInt(id)),
      action: f.action,
      actionRoleId: f.action === "AddRole" && f.actionRoleId ? BigInt(f.actionRoleId) : undefined,
      warnBeforeMinutes: warn,
      warnMessage: f.warnMessage.trim() || undefined,
      actionMessage: f.actionMessage.trim() || undefined,
      logChannelId: f.logChannelId ? BigInt(f.logChannelId) : undefined,
      includeExistingMembers: f.includeExistingMembers
    };
  }

  function errorName(err: unknown): string {
    const e = err as any;
    const candidates = [e?.error, e?.body?.error, e?.message];
    for (const c of candidates) {
      if (typeof c === "string") return c;
      if (typeof c?.message === "string") return c.message;
    }
    return "";
  }

  function friendlyError(name: string): string {
    if (name.includes("InvalidTimeout")) return m.joinRoleTimeout.errorInvalidTimeout();
    if (name.includes("InvalidWarn")) return m.joinRoleTimeout.errorInvalidWarn();
    if (name.includes("MissingActionRole")) return m.joinRoleTimeout.errorMissingActionRole();
    if (name.includes("MissingRequiredRoles")) return m.joinRoleTimeout.errorMissingRequiredRoles();
    return m.joinRoleTimeout.errorSave();
  }

  async function loadPending() {
    if (!$currentGuild?.id) return;
    try {
      pending = await joinRoleTimeoutApi.pending($currentGuild.id, 5);
    } catch (err) {
      logger.error("Failed to load pending join role timeouts", err);
    }
  }

  async function load() {
    if (!$currentGuild?.id) return;
    try {
      form = toForm(await joinRoleTimeoutApi.get($currentGuild.id));
      await loadPending();
    } catch (err) {
      logger.error("Failed to load join role timeout", err);
    }
  }

  async function persist() {
    if (!$currentGuild?.id || !form) return;
    try {
      await joinRoleTimeoutApi.update($currentGuild.id, toBody(form));
    } catch (err) {
      const name = errorName(err);
      notify?.(friendlyError(name), "error");
      if (form && name.includes("MissingRequiredRoles")) form.enabled = false;
      throw err;
    }
    void loadPending();
  }

  function saveNow() {
    autoSave.now(SAVE_KEY, persist);
  }

  function pick(key: keyof Form, detail: { selected: string | string[] | null }) {
    if (!form) return;
    (form as any)[key] = detail.selected;
    saveNow();
  }

  function saveSoon() {
    autoSave.schedule(SAVE_KEY, persist);
  }

  function flush() {
    void autoSave.flush(SAVE_KEY);
  }

  function relative(iso: string): string {
    const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const abs = Math.abs(minutes);
    if (abs >= 1440) return rtf.format(Math.round(minutes / 1440), "day");
    if (abs >= 60) return rtf.format(Math.round(minutes / 60), "hour");
    return rtf.format(minutes, "minute");
  }

  onMount(() => {
    const id = String($currentGuild?.id ?? "");
    if (id && loadedFor !== id) {
      loadedFor = id;
      void load();
    }
  });

  $effect(() => {
    const id = String($currentGuild?.id ?? "");
    untrack(() => {
      if (id && loadedFor !== id) {
        loadedFor = id;
        void load();
      }
    });
  });

  const inputClass = "w-full px-3 py-2 rounded-lg border transition-colors";
  const inputStyle = $derived(`background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text}`);
</script>

<div class="rounded-2xl border p-6 transition-all"
     in:fly={{ y: 20, duration: 300, delay: 100 }}
     style="background: {$colorStore.primary}0c;
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl" style="background: {$colorStore.primary}20;">
      <i class="fa-utility-duo fa-regular fa-clock"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.joinRoleTimeout.title()}</h2>
    </div>
  </div>

  {#if form}
    <div class="space-y-6">
      <SettingToggle
        id="jrt-enabled"
        label={m.joinRoleTimeout.title()}
        hint={m.joinRoleTimeout.enabledHint()}
        checked={form.enabled}
        onchange={(v) => { if (form) { form.enabled = v; saveNow(); } }}
      />

      {#if pending}
        <div class="p-4 rounded-xl text-sm" style="background: {$colorStore.primary}05; color: {$colorStore.muted};">
          <div class="font-medium" style="color: {$colorStore.text}">
            {pending.count > 0 ? m.joinRoleTimeout.pendingCount({ count: pending.count }) : m.joinRoleTimeout.pendingNone()}
          </div>
          {#if pending.next.length > 0}
            <div class="mt-1">
              {m.joinRoleTimeout.pendingNext()}:
              {#each pending.next as member, i (String(member.userId))}
                <span style="color: {$colorStore.text}">{relative(member.dueAt)}</span>{i < pending.next.length - 1 ? ", " : ""}
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="jrt-timeout" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.joinRoleTimeout.timeoutLabel()}</label>
          <div class="flex gap-2">
            <input id="jrt-timeout"
                   type="number"
                   min="1"
                   bind:value={form.timeoutValue}
                   oninput={saveSoon}
                   onblur={flush}
                   class={inputClass}
                   style={inputStyle}>
            <div class="w-40 shrink-0">
              <DiscordSelector
                type="custom"
                options={unitOptions}
                bind:selected={form.timeoutUnit}
                multiple={false}
                searchable={false}
                ariaLabel={m.joinRoleTimeout.timeoutLabel()}
                onchange={(d) => pick("timeoutUnit", d)}
              />
            </div>
          </div>
        </div>

        <div>
          <label for="jrt-warn" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.joinRoleTimeout.warnBeforeLabel()}</label>
          <div class="flex gap-2">
            <input id="jrt-warn"
                   type="number"
                   min="1"
                   bind:value={form.warnValue}
                   oninput={saveSoon}
                   onblur={flush}
                   class={inputClass}
                   style={inputStyle}>
            <div class="w-40 shrink-0">
              <DiscordSelector
                type="custom"
                options={unitOptions}
                bind:selected={form.warnUnit}
                multiple={false}
                searchable={false}
                ariaLabel={m.joinRoleTimeout.warnBeforeLabel()}
                onchange={(d) => pick("warnUnit", d)}
              />
            </div>
          </div>
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.joinRoleTimeout.warnBeforeHint()}</p>
        </div>

        <div>
          <span id="jrt-required-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.joinRoleTimeout.requiredRolesLabel()}</span>
          <DiscordSelector
            type="role"
            options={availableRoles}
            bind:selected={form.requiredRoleIds}
            multiple={true}
            placeholder={m.joinRoleTimeout.rolesPlaceholder()}
            ariaLabelledby="jrt-required-label"
            onchange={(d) => pick("requiredRoleIds", d)}
          />
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.joinRoleTimeout.requiredRolesHint()}</p>
        </div>

        <div>
          <span id="jrt-exempt-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.joinRoleTimeout.exemptRolesLabel()}</span>
          <DiscordSelector
            type="role"
            options={availableRoles}
            bind:selected={form.exemptRoleIds}
            multiple={true}
            placeholder={m.joinRoleTimeout.rolesPlaceholder()}
            ariaLabelledby="jrt-exempt-label"
            onchange={(d) => pick("exemptRoleIds", d)}
          />
        </div>

        <div>
          <span id="jrt-action-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.action()}</span>
          <DiscordSelector
            type="custom"
            options={actionOptions}
            bind:selected={form.action}
            multiple={false}
            searchable={false}
            ariaLabelledby="jrt-action-label"
            onchange={(d) => pick("action", d)}
          />
        </div>

        {#if form.action === "AddRole"}
          <div>
            <span id="jrt-action-role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.joinRoleTimeout.actionRoleLabel()}</span>
            <DiscordSelector
              type="role"
              options={availableRoles}
              bind:selected={form.actionRoleId}
              multiple={false}
              placeholder={m.common.selectARolePlaceholder()}
              ariaLabelledby="jrt-action-role-label"
              onchange={(d) => pick("actionRoleId", d)}
            />
          </div>
        {/if}

        <div>
          <span id="jrt-log-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.logChannel()}</span>
          <DiscordSelector
            type="channel"
            options={channelOptions}
            bind:selected={form.logChannelId}
            multiple={false}
            placeholder={m.common.selectAChannelPlaceholder()}
            ariaLabelledby="jrt-log-label"
            onchange={(d) => pick("logChannelId", d)}
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="jrt-warn-message" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.joinRoleTimeout.warnMessageLabel()}</label>
          <textarea id="jrt-warn-message"
                    rows="3"
                    bind:value={form.warnMessage}
                    oninput={saveSoon}
                    onblur={flush}
                    placeholder={m.joinRoleTimeout.warnMessagePlaceholder()}
                    class={inputClass}
                    style={inputStyle}></textarea>
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.joinRoleTimeout.warnMessageHint()}</p>
        </div>
        <div>
          <label for="jrt-action-message" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.joinRoleTimeout.actionMessageLabel()}</label>
          <textarea id="jrt-action-message"
                    rows="3"
                    bind:value={form.actionMessage}
                    oninput={saveSoon}
                    onblur={flush}
                    placeholder={m.joinRoleTimeout.actionMessagePlaceholder()}
                    class={inputClass}
                    style={inputStyle}></textarea>
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.joinRoleTimeout.actionMessageHint()}</p>
        </div>
      </div>

      <SettingToggle
        id="jrt-include-existing"
        label={m.joinRoleTimeout.includeExistingLabel()}
        hint={m.joinRoleTimeout.includeExistingHint()}
        checked={form.includeExistingMembers}
        onchange={(v) => { if (form) { form.includeExistingMembers = v; saveNow(); } }}
      />
    </div>
  {/if}
</div>
