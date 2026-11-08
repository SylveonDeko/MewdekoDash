<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import {
    automationsApi,
    type Automation,
    type AutomationError,
    type AutomationRequest
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import NumberField from "$lib/components/plugin/NumberField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import NodeList from "./NodeList.svelte";
  import RunsPanel from "./RunsPanel.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import {
    availableFor,
    emptyRequest,
    errorText,
    label,
    toRequest,
    validationErrors,
    type EditorContext,
    type Notify
  } from "./automationsModel";

  interface Props {
    guildId: bigint;
    automation: Automation | null;
    ctx: EditorContext;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    notify: Notify;
    onsaved: (automation: Automation) => void;
    onclose: () => void;
  }

  let { guildId, automation, ctx, autoSave, user = null, notify, onsaved, onclose }: Props = $props();

  const uid = $props.id();
  const existing = untrack(() => automation);
  const saveKey = `automation:${existing?.id ?? "new"}`;

  let draft: AutomationRequest = $state(
    existing ? toRequest(existing) : emptyRequest(untrack(() => ctx.schema.triggers[0]?.type) ?? "MessageSent")
  );
  let errors: AutomationError[] = $state([]);
  let creating = $state(false);

  const triggerOptions = $derived(
    ctx.schema.triggers.map((x) => ({ id: x.type, name: label(`trigger${x.type}`, x.name) }))
  );
  const trigger = $derived(ctx.schema.triggers.find((x) => x.type === draft.trigger));
  const scopeOptions = $derived(ctx.schema.cooldownScopes.map((x) => ({ id: x, name: label(`option${x}`, x) })));

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  function snapshot(): AutomationRequest {
    return JSON.parse(JSON.stringify($state.snapshot(draft))) as AutomationRequest;
  }

  async function save() {
    if (!existing) return;
    const id = existing.id;
    const payload = snapshot();
    try {
      const result = await automationsApi.updateAutomation(guildId, id, payload);
      errors = [];
      onsaved(result);
    } catch (err) {
      const found = validationErrors(err);
      if (found.length) errors = found;
      throw err;
    }
  }

  function changed() {
    if (existing) autoSave.schedule(saveKey, save);
  }

  async function create() {
    if (existing || creating) return;
    creating = true;
    try {
      const result = await automationsApi.createAutomation(guildId, {
        ...snapshot(),
        ...(user?.id ? { userId: BigInt(user.id) } : {})
      });
      errors = [];
      notify(m.automations.created());
      onsaved(result);
      onclose();
    } catch (err) {
      const found = validationErrors(err);
      if (found.length) errors = found;
      else notify(errorText(err, m.automations.errorCreate()), "error");
      logger.error("Failed to create automation:", err);
    } finally {
      creating = false;
    }
  }

  function chooseTrigger(next: string) {
    if (next === draft.trigger) return;
    draft.trigger = next;
    const keepConditions = availableFor(ctx.schema.conditions, next).map((x) => x.type);
    const keepActions = availableFor(ctx.schema.actions, next).map((x) => x.type);
    const before = draft.conditions.length + draft.actions.length;
    draft.conditions = draft.conditions.filter((x) => keepConditions.includes(x.type));
    draft.actions = draft.actions.filter((x) => keepActions.includes(x.type));
    const dropped = before - draft.conditions.length - draft.actions.length;
    if (dropped > 0) notify(m.automations.droppedNodes({ count: dropped }));
    changed();
  }

  function close() {
    if (existing) void autoSave.flush(saveKey);
    onclose();
  }
</script>

<Sheet title={existing ? existing.name : m.automations.newTitle()} size="xl" onclose={close}>
  {#snippet actions()}
    {#if existing}
      <SaveStatus {autoSave} />
    {/if}
  {/snippet}

  {#if errors.length}
    <div class="rounded-xl border p-3 space-y-1" style="background: #ef444415; border-color: #ef444440;" role="alert">
      <p class="text-sm font-semibold" style="color: {$colorStore.text}">{m.automations.errorsTitle()}</p>
      <ul class="space-y-1">
        {#each errors as error (`${error.path}:${error.message}`)}
          <li class="text-sm break-words" style="color: {$colorStore.text}">
            {#if error.path}<span class="font-mono text-xs">{error.path}</span>: {/if}{error.message}
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <div class="space-y-4 min-w-0">
    <SettingField label={m.common.name()} id="{uid}-name" required>
      <input
        id="{uid}-name"
        type="text"
        value={draft.name}
        maxlength={ctx.schema.limits.maxNameLength ?? 100}
        class="w-full min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
        oninput={(e) => {
          draft.name = e.currentTarget.value;
          changed();
        }}
      >
    </SettingField>

    <ToggleRow
      checked={draft.enabled}
      title={m.common.enabled()}
      colors={$colorStore}
      onchange={(value) => {
        draft.enabled = value;
        changed();
      }}
    />
  </div>

  <div class="min-w-0">
  <PluginCard title={m.automations.triggerTitle()} alwaysOpen>
    <SettingField label={m.automations.triggerLabel()} id="{uid}-trigger">
      <DiscordSelector
        id="{uid}-trigger"
        type="custom"
        customIcon="fa-bolt"
        options={triggerOptions}
        selected={draft.trigger}
        clearable={false}
        searchable={false}
        onchange={(detail) => typeof detail.selected === "string" && chooseTrigger(detail.selected)}
      />
    </SettingField>
    {#if trigger}
      <p class="text-xs" style="color: {$colorStore.muted}">{trigger.description}</p>
    {/if}
  </PluginCard>
  </div>

  <div class="min-w-0 lg:col-span-2">
  <PluginCard title={m.automations.conditionsTitle()} alwaysOpen>
    <NodeList
      kind="condition"
      specs={ctx.schema.conditions}
      trigger={draft.trigger}
      nodes={draft.conditions}
      {ctx}
      {user}
      onchange={changed}
    />
  </PluginCard>
  </div>

  <div class="min-w-0 lg:col-span-2">
  <PluginCard title={m.automations.actionsTitle()} alwaysOpen>
    <NodeList
      kind="action"
      specs={ctx.schema.actions}
      trigger={draft.trigger}
      nodes={draft.actions}
      {ctx}
      {user}
      onchange={changed}
    />
  </PluginCard>
  </div>

  <div class="min-w-0">
  <PluginCard title={m.automations.settingsTitle()} alwaysOpen>
    <NumberField
      id="{uid}-cooldown"
      label={m.automations.cooldownLabel()}
      value={draft.cooldownSeconds}
      min={0}
      max={ctx.schema.limits.maxCooldownSeconds ?? 86400}
      onchange={(value) => {
        draft.cooldownSeconds = value ?? 0;
        changed();
      }}
    />
    {#if draft.cooldownSeconds > 0}
      <SettingField label={m.automations.cooldownScopeLabel()} id="{uid}-scope">
        <DiscordSelector
          id="{uid}-scope"
          type="custom"
          customIcon="fa-users"
          options={scopeOptions}
          selected={draft.cooldownScope}
          clearable={false}
          searchable={false}
          onchange={(detail) => {
            if (typeof detail.selected !== "string") return;
            draft.cooldownScope = detail.selected;
            changed();
          }}
        />
      </SettingField>
    {/if}
    <ToggleRow
      checked={draft.ignoreBots}
      title={m.automations.ignoreBots()}
      colors={$colorStore}
      onchange={(value) => {
        draft.ignoreBots = value;
        changed();
      }}
    />
    <ToggleRow
      checked={draft.retryOnFailure}
      title={m.automations.retryOnFailure()}
      colors={$colorStore}
      onchange={(value) => {
        draft.retryOnFailure = value;
        changed();
      }}
    />
    <ToggleRow
      checked={draft.allowMassMentions}
      title={m.automations.allowMassMentions()}
      colors={$colorStore}
      onchange={(value) => {
        draft.allowMassMentions = value;
        changed();
      }}
    />
  </PluginCard>
  </div>

  {#if existing}
    <div class="min-w-0">
      <PluginCard title={m.automations.testTitle()} alwaysOpen>
        <RunsPanel
          {guildId}
          automationId={existing.id}
          channels={ctx.channels}
          members={ctx.members}
          userId={user?.id ? String(user.id) : undefined}
          {notify}
        />
      </PluginCard>
    </div>
  {/if}
  </div>

  {#snippet footer()}
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style={buttonStyle}
      disabled={existing ? false : creating || !draft.name.trim()}
      onclick={existing ? close : create}
    >
      <i class="fa-solid {existing ? 'fa-check' : 'fa-plus'}" aria-hidden="true"></i>
      {existing ? m.common.done() : m.automations.createButton()}
    </button>
  {/snippet}
</Sheet>
