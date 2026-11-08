<script lang="ts">
  import { m } from "$lib/i18n";
  import {
    AccessExpiryBehavior,
    AccessGrantMode,
    type ChannelAccessGate,
    type ChannelAccessQuestion
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import GateQuestions from "./GateQuestions.svelte";
  import GatePanel from "./GatePanel.svelte";
  import { channelName, type GatePatch, type Named } from "./channelAccessModel";

  interface Props {
    guildId: bigint;
    gate: ChannelAccessGate;
    channels: Named[];
    roles: Named[];
    onpatch: GatePatch;
    onflush: () => void;
    onquestions: (questions: ChannelAccessQuestion[]) => void;
    onreload: () => void;
    ondelete: () => void;
    onclose: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, gate, channels, roles, onpatch, onflush, onquestions, onreload, ondelete, onclose, onerror, onsuccess }: Props = $props();

  let pendingRoleMode = $state(false);
  const roleMode = $derived(pendingRoleMode || gate.grantMode === AccessGrantMode.Role);

  const grantOptions = $derived([
    { id: String(AccessGrantMode.Role), name: m.channelAccess.grantRole() },
    { id: String(AccessGrantMode.ChannelPermission), name: m.channelAccess.grantChannel() }
  ]);
  const expiryOptions = $derived([
    { id: String(AccessExpiryBehavior.Deny), name: m.channelAccess.expiryDeny() },
    { id: String(AccessExpiryBehavior.Majority), name: m.channelAccess.expiryMajority() },
    { id: String(AccessExpiryBehavior.StayOpen), name: m.channelAccess.expiryStayOpen() }
  ]);

  type IdKey = "accessRoleId" | "reviewChannelId" | "logChannelId" | "voterRoleId" | "pingRoleId";
  type NumberKey = "requiredApprovals" | "requiredDenials" | "voteDurationHours" | "minAccountAgeDays" | "minServerAgeDays" | "reapplyCooldownHours";
  type FlagKey = "enabled" | "allowAbstain" | "anonymousApplicant" | "anonymousVotes" | "dmOnDecision";

  function setId(key: IdKey, selected: string | string[] | null) {
    const id = typeof selected === "string" && selected ? BigInt(selected) : null;
    if (key === "accessRoleId" && id === null) return;
    if (key === "accessRoleId") pendingRoleMode = false;
    onpatch(gate.id, { [key]: id }, { [key]: id ?? 0n }, "now");
  }

  function setNumber(key: NumberKey, value: number) {
    onpatch(gate.id, { [key]: value }, { [key]: value }, "typing");
  }

  function setFlag(key: FlagKey, value: boolean) {
    onpatch(gate.id, { [key]: value }, { [key]: value }, "now");
  }

  function pickMode(selected: string | string[] | null) {
    if (typeof selected !== "string") return;
    if (Number(selected) === AccessGrantMode.ChannelPermission) {
      pendingRoleMode = false;
      onpatch(gate.id, { accessRoleId: null, grantMode: AccessGrantMode.ChannelPermission }, { accessRoleId: 0n }, "now");
    } else {
      pendingRoleMode = true;
    }
  }

  const flags = $derived<Array<{ key: FlagKey; title: string }>>([
    { key: "allowAbstain", title: m.channelAccess.gateAbstain() },
    { key: "anonymousApplicant", title: m.channelAccess.gateAnonymousApplicant() },
    { key: "anonymousVotes", title: m.channelAccess.gateAnonymousVotes() },
    { key: "dmOnDecision", title: m.channelAccess.gateDmDecision() }
  ]);

  const numbers = $derived<Array<{ key: NumberKey; label: string }>>([
    { key: "requiredApprovals", label: m.channelAccess.gateApprovalsNeeded() },
    { key: "requiredDenials", label: m.channelAccess.gateDenialsNeeded() },
    { key: "voteDurationHours", label: m.channelAccess.gateVotingWindow() },
    { key: "minAccountAgeDays", label: m.common.minAccountAgeDays() },
    { key: "minServerAgeDays", label: m.channelAccess.gateMinServerAge() },
    { key: "reapplyCooldownHours", label: m.channelAccess.gateReapplyCooldown() }
  ]);
</script>

{#snippet picker(key: IdKey, type: "role" | "channel", options: Named[], label: string, placeholder: string)}
  <SettingField {label} id="gate-{key}">
    <DiscordSelector
      {type}
      {options}
      selected={gate[key]?.toString() || null}
      {placeholder}
      id="gate-{key}"
      ariaLabel={label}
      onchange={({ selected }) => setId(key, selected)}
    />
  </SettingField>
{/snippet}

<Sheet title={`#${channelName(channels, gate.channelId)}`} {onclose} size="lg">
  <div class="space-y-6 min-w-0" onfocusout={onflush}>
    <ToggleRow
      checked={gate.enabled}
      title={m.channelAccess.gateAccepting()}
      colors={$colorStore}
      onchange={(value) => setFlag("enabled", value)}
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SettingField label={m.channelAccess.createHowIn()} id="gate-mode">
        <DiscordSelector
          type="custom"
          options={grantOptions}
          customIcon="fa-key"
          selected={roleMode ? String(AccessGrantMode.Role) : String(AccessGrantMode.ChannelPermission)}
          searchable={false}
          clearable={false}
          id="gate-mode"
          ariaLabel={m.channelAccess.createHowIn()}
          onchange={({ selected }) => pickMode(selected)}
        />
      </SettingField>
      {#if roleMode}
        {@render picker("accessRoleId", "role", roles, m.channelAccess.gateAccessRole(), m.channelAccess.gateAccessRolePlaceholder())}
      {/if}
      {@render picker("reviewChannelId", "channel", channels, m.channelAccess.gateReviewChannel(), m.channelAccess.gateReviewChannelPlaceholder())}
      {@render picker("logChannelId", "channel", channels, m.common.logChannel(), m.channelAccess.gateLogChannelPlaceholder())}
      {@render picker("voterRoleId", "role", roles, m.channelAccess.gateVoterRole(), m.channelAccess.gateVoterRolePlaceholder())}
      {@render picker("pingRoleId", "role", roles, m.channelAccess.gatePingRole(), m.channelAccess.gatePingPlaceholder())}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each numbers as field (field.key)}
        <NumberField
          id="gate-{field.key}"
          label={field.label}
          value={gate[field.key]}
          onchange={(value) => setNumber(field.key, value)}
        />
      {/each}
      <SettingField label={m.channelAccess.gateWhenCloses()} id="gate-expiry">
        <DiscordSelector
          type="custom"
          options={expiryOptions}
          customIcon="fa-hourglass"
          selected={String(gate.onExpiry)}
          searchable={false}
          clearable={false}
          id="gate-expiry"
          ariaLabel={m.channelAccess.gateWhenCloses()}
          onchange={({ selected }) => {
            if (typeof selected !== "string") return;
            const value = Number(selected);
            onpatch(gate.id, { onExpiry: value }, { onExpiry: value }, "now");
          }}
        />
      </SettingField>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {#each flags as flag (flag.key)}
        <ToggleRow
          checked={gate[flag.key]}
          title={flag.title}
          colors={$colorStore}
          onchange={(value) => setFlag(flag.key, value)}
        />
      {/each}
    </div>

    <GateQuestions {guildId} {gate} {onquestions} {onerror} />
    <GatePanel {guildId} {gate} {channels} onposted={onreload} {onerror} {onsuccess} />
  </div>

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium"
      style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
      onclick={ondelete}
    >
      {m.common.delete()}
    </button>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      onclick={onclose}
    >
      {m.common.close()}
    </button>
  {/snippet}
</Sheet>
