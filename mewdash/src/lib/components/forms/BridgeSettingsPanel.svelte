<script lang="ts">
  /**
   * The collapsible relay rules on a bridge's card. Saves through the page's auto-save, so every
   * change sends all eight settings and the newest draft wins.
   */
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Bridge, BridgeDirection, BridgeSettings } from "$lib/api/index.ts";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";

  interface Props {
    bridge: Bridge;
    roles: Array<{ id: string; name: string; color?: number }>;
    autoSave: AutoSave;
    /** Name of the other platform, used in the name format example */
    examplePlatform: string;
    save: (settings: BridgeSettings) => Promise<Bridge>;
    onupdate: (bridge: Bridge) => void;
    notify: (message: string) => void;
  }

  let { bridge, roles, autoSave, examplePlatform, save, onupdate, notify }: Props = $props();

  const UNITS = [
    { minutes: 1, label: () => m.common.minutes() },
    { minutes: 60, label: () => m.common.hours() },
    { minutes: 1440, label: () => m.common.days() }
  ];

  const directions: Array<{ value: BridgeDirection; label: () => string }> = [
    { value: "Both", label: () => m.bridges.directionBoth() },
    { value: "SendOnly", label: () => m.bridges.directionSendOnly() },
    { value: "ReceiveOnly", label: () => m.bridges.directionReceiveOnly() }
  ];

  const initial = untrack(() => bridge);
  const initialUnit = initial.minMemberAgeMinutes > 0 && initial.minMemberAgeMinutes % 1440 === 0 ? 1440 : initial.minMemberAgeMinutes > 0 && initial.minMemberAgeMinutes % 60 === 0 ? 60 : 1;

  let open = $state(false);
  let direction = $state<BridgeDirection>(initial.direction ?? "Both");
  let allowedRoles = $state<string[]>((initial.allowedRoleIds ?? []).map(String));
  let blockedRoles = $state<string[]>((initial.blockedRoleIds ?? []).map(String));
  let blockedUsers = $state<string[]>((initial.blockedUserIds ?? []).map(String));
  let ageUnit = $state(initialUnit);
  let ageValue = $state<number | null>((initial.minMemberAgeMinutes ?? 0) / initialUnit);
  let blockInvites = $state(initial.blockInvites ?? false);
  let useWordFilter = $state(initial.useWordFilter ?? false);
  let nameFormat = $state(initial.nameFormat ?? "");
  let userInput = $state("");

  const key = untrack(() => `bridge-settings-${bridge.bridgeId}`);
  const id = untrack(() => bridge.bridgeId);

  function snapshot(): BridgeSettings {
    const value = Math.max(0, Math.round(Number(ageValue) || 0));
    return {
      direction,
      allowedRoleIds: allowedRoles.map((r) => BigInt(r)),
      blockedRoleIds: blockedRoles.map((r) => BigInt(r)),
      blockedUserIds: blockedUsers.map((u) => BigInt(u)),
      minMemberAgeMinutes: value * ageUnit,
      blockInvites,
      useWordFilter,
      nameFormat
    };
  }

  let lastSaved = snapshot();

  function restore(s: BridgeSettings) {
    direction = s.direction;
    allowedRoles = s.allowedRoleIds.map(String);
    blockedRoles = s.blockedRoleIds.map(String);
    blockedUsers = s.blockedUserIds.map(String);
    const unit = s.minMemberAgeMinutes > 0 && s.minMemberAgeMinutes % 1440 === 0 ? 1440 : s.minMemberAgeMinutes > 0 && s.minMemberAgeMinutes % 60 === 0 ? 60 : 1;
    ageUnit = unit;
    ageValue = s.minMemberAgeMinutes / unit;
    blockInvites = s.blockInvites;
    useWordFilter = s.useWordFilter;
    nameFormat = s.nameFormat;
  }

  async function persist() {
    const payload = snapshot();
    try {
      const updated = await save(payload);
      lastSaved = payload;
      onupdate(updated);
    } catch (err) {
      restore(lastSaved);
      throw err;
    }
  }

  function saveNow() {
    void autoSave.now(key, persist);
  }

  function saveLater() {
    autoSave.schedule(key, persist);
  }

  function saveOnBlur() {
    void autoSave.flush(key);
  }

  function addUser() {
    const value = userInput.trim();
    if (!/^\d{15,25}$/.test(value)) {
      notify(m.common.invalidUserId());
      return;
    }
    userInput = "";
    if (blockedUsers.includes(value)) return;
    blockedUsers = [...blockedUsers, value];
    saveNow();
  }

  function removeUser(user: string) {
    blockedUsers = blockedUsers.filter((u) => u !== user);
    saveNow();
  }

  function toIds(selected: string | string[] | null) {
    return Array.isArray(selected) ? selected : [];
  }

  const example = $derived(
    (nameFormat || "{name} ({platform})")
      .replaceAll("{name}", "Sylv")
      .replaceAll("{platform}", examplePlatform)
      .replaceAll("{community}", bridge.remoteGuildName)
  );

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text};`);
  const activeStyle = $derived(`background: ${$colorStore.selectedSurface}; border: 1px solid ${$colorStore.selectedBorder}; color: ${$colorStore.text};`);
  const idleStyle = $derived(`background: ${$colorStore.primary}14; color: ${$colorStore.text};`);
  const removeStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text};`);
</script>

<div>
  <button
    type="button"
    class="flex items-center gap-2 min-h-[44px] text-sm font-medium"
    style="color: {$colorStore.text};"
    aria-expanded={open}
    aria-controls="bridge-settings-{id}"
    onclick={() => (open = !open)}
  >
    {m.common.settings()}
    <i class="fa-solid fa-chevron-down text-xs transition-transform {open ? 'rotate-180' : ''}" style="color: {$colorStore.muted};" aria-hidden="true"></i>
  </button>

  {#if open}
    <div id="bridge-settings-{id}" class="space-y-4 mt-2">
      <div>
        <span class="block text-sm mb-2" id="bridge-direction-{id}" style="color: {$colorStore.muted}">{m.common.direction()}</span>
        <div class="flex flex-wrap gap-2" role="group" aria-labelledby="bridge-direction-{id}">
          {#each directions as option (option.value)}
            <button
              type="button"
              class="px-4 min-h-[44px] rounded-lg text-sm font-medium"
              style={direction === option.value ? activeStyle : idleStyle}
              aria-pressed={direction === option.value}
              onclick={() => {
                direction = option.value;
                saveNow();
              }}>{option.label()}</button>
          {/each}
        </div>
      </div>

      <div>
        <span class="block text-sm mb-2" id="bridge-allowed-{id}" style="color: {$colorStore.muted}">{m.bridges.allowedRolesLabel()}</span>
        <DiscordSelector
          type="role"
          multiple
          options={roles}
          selected={allowedRoles}
          ariaLabelledby="bridge-allowed-{id}"
          placeholder={m.common.everyone()}
          onchange={(detail) => {
            allowedRoles = toIds(detail.selected);
            saveNow();
          }} />
      </div>

      <div>
        <span class="block text-sm mb-2" id="bridge-blocked-roles-{id}" style="color: {$colorStore.muted}">{m.bridges.blockedRolesLabel()}</span>
        <DiscordSelector
          type="role"
          multiple
          options={roles}
          selected={blockedRoles}
          ariaLabelledby="bridge-blocked-roles-{id}"
          placeholder={m.common.none()}
          onchange={(detail) => {
            blockedRoles = toIds(detail.selected);
            saveNow();
          }} />
      </div>

      <div>
        <label class="block text-sm mb-2" for="bridge-user-{id}" style="color: {$colorStore.muted}">{m.common.blockedUsers()}</label>
        {#if blockedUsers.length > 0}
          <ul class="space-y-2 mb-2">
            {#each blockedUsers as user (user)}
              <li class="flex items-center justify-between gap-3 rounded-lg p-2 pl-3" style="background: {$colorStore.primary}08;">
                <span class="font-mono text-sm truncate" style="color: {$colorStore.text}">{user}</span>
                <button type="button" class="px-3 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap" style={removeStyle} onclick={() => removeUser(user)}>{m.common.remove()}</button>
              </li>
            {/each}
          </ul>
        {/if}
        <div class="flex gap-2">
          <input
            id="bridge-user-{id}"
            type="text"
            inputmode="numeric"
            bind:value={userInput}
            placeholder={m.common.userId()}
            autocomplete="off"
            class="w-full min-w-0 rounded-lg p-2 min-h-[44px] font-mono"
            style={inputStyle}
            onkeydown={(e) => e.key === "Enter" && addUser()} />
          <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50" style={idleStyle} disabled={!userInput.trim()} onclick={addUser}>{m.common.add()}</button>
        </div>
      </div>

      <div>
        <label class="block text-sm mb-2" for="bridge-age-{id}" style="color: {$colorStore.muted}">{m.bridges.minAgeLabel()}</label>
        <div class="flex flex-wrap items-center gap-2">
          <input
            id="bridge-age-{id}"
            type="number"
            min="0"
            step="1"
            bind:value={ageValue}
            oninput={saveLater}
            onblur={saveOnBlur}
            class="w-28 rounded-lg p-2 min-h-[44px]"
            style={inputStyle} />
          <div class="flex flex-wrap gap-2" role="group" aria-label={m.bridges.minAgeLabel()}>
            {#each UNITS as unit (unit.minutes)}
              <button
                type="button"
                class="px-4 min-h-[44px] rounded-lg text-sm font-medium"
                style={ageUnit === unit.minutes ? activeStyle : idleStyle}
                aria-pressed={ageUnit === unit.minutes}
                onclick={() => {
                  ageUnit = unit.minutes;
                  saveNow();
                }}>{unit.label()}</button>
            {/each}
          </div>
        </div>
      </div>

      <SettingToggle
        id="bridge-invites-{id}"
        label={m.bridges.blockInvitesLabel()}
        checked={blockInvites}
        onchange={(v) => {
          blockInvites = v;
          saveNow();
        }} />
      <SettingToggle
        id="bridge-filter-{id}"
        label={m.bridges.wordFilterLabel()}
        checked={useWordFilter}
        onchange={(v) => {
          useWordFilter = v;
          saveNow();
        }} />

      <div>
        <label class="block text-sm mb-2" for="bridge-format-{id}" style="color: {$colorStore.muted}">{m.bridges.nameFormatLabel()}</label>
        <input
          id="bridge-format-{id}"
          type="text"
          maxlength="80"
          bind:value={nameFormat}
          oninput={saveLater}
          onblur={saveOnBlur}
          placeholder="{'{name}'} ({'{platform}'})"
          autocomplete="off"
          aria-describedby="bridge-format-hint-{id}"
          class="w-full rounded-lg p-2 min-h-[44px]"
          style={inputStyle} />
        <p id="bridge-format-hint-{id}" class="text-xs mt-1" style="color: {$colorStore.muted}">
          {m.bridges.nameFormatHint({ name: "{name}", platform: "{platform}", community: "{community}" })}
        </p>
        <p class="text-sm mt-1 break-words" style="color: {$colorStore.text}">{example}</p>
      </div>
    </div>
  {/if}
</div>
