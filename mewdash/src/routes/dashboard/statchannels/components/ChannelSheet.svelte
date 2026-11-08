<script lang="ts">
  import { onDestroy } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import {
    statChannelsApi,
    type StatChannel,
    type StatChannelMetadata,
    type StatChannelSettings,
    type StatChannelStyleOptions
  } from "$lib/api/index.ts";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import {
    MECHANISM,
    REQUIREMENT,
    STYLE,
    VALUE_KIND,
    MAX_INTERVAL,
    isValidInterval,
    parseStyleOptions,
    type Named,
    type Notify
  } from "./statModel";

  interface Props {
    guildId: bigint;
    metadata: StatChannelMetadata;
    defaults: StatChannelSettings;
    /** The channel being edited. Leave null to add one. */
    channel: StatChannel | null;
    /** The counter to start from when adding. */
    presetType?: number | null;
    /** Looks the channel up again at save time. */
    resolveChannelId: (id: number) => bigint | null;
    voiceChannels: Named[];
    categories: Named[];
    roles: Named[];
    countingChannels: Named[];
    minecraftServers: Named[];
    autoSave: AutoSave;
    notify: Notify;
    onsaved: () => void;
    onclose: () => void;
  }

  let {
    guildId,
    metadata,
    defaults,
    channel,
    presetType = null,
    resolveChannelId,
    voiceChannels,
    categories,
    roles,
    countingChannels,
    minecraftServers,
    autoSave,
    notify,
    onsaved,
    onclose
  }: Props = $props();

  /** Every edit makes the bot refresh the channel, and Discord only allows two renames per 10 minutes. */
  const SAVE_DELAY = 2000;

  type Form = {
    statType: number;
    template: string;
    displayStyle: number;
    updateMechanism: number;
    updateIntervalMinutes: number;
    roleId: string | null;
    countdownDate: string;
    goalTarget: number;
    targetId: string | null;
    targetName: string;
    style: Required<StatChannelStyleOptions>;
  };

  function initialForm(): Form {
    if (channel) {
      return {
        statType: channel.statType,
        template: channel.template,
        displayStyle: channel.displayStyle,
        updateMechanism: channel.updateMechanism,
        updateIntervalMinutes: channel.updateIntervalMinutes,
        roleId: channel.roleId ? String(channel.roleId) : null,
        countdownDate: channel.countdownDate ? channel.countdownDate.slice(0, 16) : "",
        goalTarget: channel.goalTarget || 1000,
        targetId: channel.targetId ? String(channel.targetId) : null,
        targetName: channel.targetName ?? "",
        style: parseStyleOptions(channel.styleOptions)
      };
    }
    const type = presetType ?? 0;
    const definition = metadata.statTypes.find((t) => t.type === type);
    return {
      statType: type,
      template: definition?.defaultTemplate ?? "",
      displayStyle: definition?.recommendedStyle ?? defaults.defaultDisplayStyle,
      updateMechanism: defaults.defaultMechanism,
      updateIntervalMinutes: definition?.realtime && defaults.defaultMechanism !== MECHANISM.Rename
        ? 1
        : defaults.defaultIntervalMinutes,
      roleId: null,
      countdownDate: "",
      goalTarget: 1000,
      targetId: null,
      targetName: "",
      style: parseStyleOptions(null)
    };
  }

  let form: Form = $state(initialForm());
  let saved: Form = $state.raw(initialForm());
  let createNew = $state(true);
  let channelId: string | null = $state(null);
  let categoryId: string | null = $state(null);
  let adding = $state(false);
  let previewText = $state("");
  let previewPending = $state(false);
  let previewTimer: ReturnType<typeof setTimeout> | undefined;
  let previewSeq = 0;

  const editing = $derived(channel !== null);
  const saveKey = $derived(channel ? `channel:${channel.id}` : "");
  const definition = $derived(metadata.statTypes.find((t) => t.type === form.statType) ?? null);
  const requirement = $derived(definition?.requirement ?? REQUIREMENT.None);

  const typeOptions = $derived(metadata.statTypes.map((t) => ({ id: String(t.type), name: `${t.category} · ${t.name}` })));
  const styleOptions = $derived(metadata.displayStyles.map((s) => ({ id: String(s.style), name: `${s.name}: ${s.example}` })));
  const mechanismLabels = $derived<Record<number, string>>({
    0: m.statchannels.mechanismRenameLabel(),
    1: m.statchannels.mechanismRecreateLabel(),
    2: m.statchannels.mechanismAutoLabel()
  });
  const mechanismOptions = $derived(
    metadata.mechanisms.map((mech) => ({ id: String(mech.mechanism), name: mechanismLabels[mech.mechanism] ?? mech.name }))
  );
  const minInterval = $derived(
    metadata.mechanisms.find((mech) => mech.mechanism === form.updateMechanism)?.minimumIntervalMinutes ?? 1
  );
  const placeholders = $derived([...metadata.commonPlaceholders, ...(definition?.placeholders ?? [])]);
  const mechanismBlurb = $derived(
    form.updateMechanism === MECHANISM.Rename
      ? m.statchannels.mechanismRenameBlurb()
      : form.updateMechanism === MECHANISM.Recreate
        ? m.statchannels.mechanismRecreateBlurb()
        : m.statchannels.mechanismAutoBlurb()
  );
  const mechanismCaution = $derived(
    form.updateMechanism === MECHANISM.Rename
      ? m.statchannels.mechanismRenameCaution()
      : form.updateMechanism === MECHANISM.Recreate
        ? m.statchannels.mechanismRecreateCaution()
        : ""
  );

  const showDecimals = $derived(form.displayStyle === STYLE.Compact || form.displayStyle === STYLE.Percent);
  const showPad = $derived(form.displayStyle === STYLE.Padded);
  const showBar = $derived(form.displayStyle === STYLE.ProgressBar);
  const showBoolean = $derived(definition?.valueKind === VALUE_KIND.Boolean);
  const showStyleOptions = $derived(showDecimals || showPad || showBar || showBoolean);

  const requirementMet = $derived(
    requirement === REQUIREMENT.Role
      ? !!form.roleId
      : requirement === REQUIREMENT.Date
        ? !!form.countdownDate
        : requirement === REQUIREMENT.Goal
          ? form.goalTarget >= 1
          : requirement === REQUIREMENT.CounterName
            ? !!form.targetName.trim()
            : requirement === REQUIREMENT.CountingChannel || requirement === REQUIREMENT.MinecraftServer
              ? !!form.targetId
              : true
  );
  const valid = $derived(
    !!form.template.trim() && isValidInterval(form.updateIntervalMinutes, minInterval) && requirementMet
  );

  function requestBody() {
    return {
      template: form.template,
      displayStyle: form.displayStyle,
      styleOptions: { ...form.style },
      updateMechanism: form.updateMechanism,
      updateIntervalMinutes: form.updateIntervalMinutes,
      roleId: requirement === REQUIREMENT.Role && form.roleId ? BigInt(form.roleId) : undefined,
      countdownDate: requirement === REQUIREMENT.Date && form.countdownDate ? form.countdownDate : undefined,
      goalTarget: requirement === REQUIREMENT.Goal ? form.goalTarget : undefined,
      targetId:
        (requirement === REQUIREMENT.CountingChannel || requirement === REQUIREMENT.MinecraftServer) && form.targetId
          ? BigInt(form.targetId)
          : undefined,
      targetName: requirement === REQUIREMENT.CounterName && form.targetName ? form.targetName : undefined
    };
  }

  function refreshPreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(async () => {
      if (!form.template) {
        previewText = "";
        return;
      }
      const seq = ++previewSeq;
      previewPending = true;
      try {
        const result = await statChannelsApi.preview(guildId, { statType: form.statType, ...requestBody() });
        if (seq === previewSeq) previewText = result.rendered;
      } catch {
        if (seq === previewSeq) previewText = "";
      } finally {
        if (seq === previewSeq) previewPending = false;
      }
    }, 350);
  }

  function save() {
    if (!channel || !valid) return;
    const id = channel.id;
    const request = { statType: form.statType, ...requestBody() };
    const snapshot = $state.snapshot(form) as Form;
    const previous = saved;

    autoSave.schedule(
      saveKey,
      async () => {
        try {
          const target = resolveChannelId(id) ?? channel!.channelId;
          await statChannelsApi.updateStatChannel(guildId, target, request);
          saved = snapshot;
          onsaved();
        } catch (err) {
          form = structuredClone(previous);
          refreshPreview();
          throw err;
        }
      },
      SAVE_DELAY
    );
  }

  function changed() {
    refreshPreview();
    save();
  }

  function pickType(value: number) {
    const next = metadata.statTypes.find((t) => t.type === value);
    if (!next) return;
    form.statType = value;
    form.template = next.defaultTemplate;
    form.displayStyle = next.recommendedStyle;
    form.roleId = null;
    form.targetId = null;
    form.targetName = "";
    if (next.realtime && form.updateMechanism !== MECHANISM.Rename && !editing) form.updateIntervalMinutes = 1;
    changed();
  }

  function pickMechanism(value: number) {
    form.updateMechanism = value;
    const min = metadata.mechanisms.find((mech) => mech.mechanism === value)?.minimumIntervalMinutes ?? 1;
    if (!(form.updateIntervalMinutes >= min)) form.updateIntervalMinutes = min;
    changed();
  }

  function readInt(event: Event, fallback: number) {
    const raw = (event.currentTarget as HTMLInputElement).value;
    const parsed = Math.floor(Number(raw));
    return raw.trim() === "" || Number.isNaN(parsed) ? fallback : parsed;
  }

  function addPlaceholder(value: string) {
    form.template += value;
    changed();
  }

  function addEmoji(value: string | string[] | null) {
    if (typeof value !== "string" || !value) return;
    form.template += value;
    changed();
  }

  async function add() {
    if (!valid || (!createNew && !channelId)) {
      if (!createNew && !channelId) notify(m.statchannels.notifySelectVoice(), "error");
      return;
    }
    adding = true;
    try {
      await statChannelsApi.addStatChannel(guildId, {
        channelId: createNew ? BigInt(0) : BigInt(channelId!),
        categoryId: createNew && categoryId ? BigInt(categoryId) : undefined,
        statType: form.statType,
        ...requestBody()
      });
      notify(m.statchannels.notifyAdded());
      onsaved();
      onclose();
    } catch (err) {
      logger.error("Failed to add stat channel:", err);
      notify(m.statchannels.notifyAddFailed(), "error");
    } finally {
      adding = false;
    }
  }

  function close() {
    if (channel) void autoSave.flush(saveKey);
    onclose();
  }

  refreshPreview();
  onDestroy(() => clearTimeout(previewTimer));

  const inputClass = "w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]";
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

{#snippet label(id: string, text: string)}
  <label for={id} class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{text}</label>
{/snippet}

<Sheet title={channel ? m.statchannels.editTitle({ name: channel.channelName }) : m.statchannels.newTitle()} onclose={close} size="lg">
  {#snippet footer()}
    {#if editing}
      <button
        type="button"
        class="px-5 rounded-lg min-h-[50px] font-medium"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        onclick={close}
      >
        {m.common.done()}
      </button>
    {:else}
      <button
        type="button"
        class="px-5 rounded-lg min-h-[50px]"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        onclick={close}
      >
        {m.common.cancel()}
      </button>
      <button
        type="button"
        class="px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={adding || !valid}
        onclick={add}
      >
        {adding ? m.common.adding() : m.common.add()}
      </button>
    {/if}
  {/snippet}

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {#if !editing}
      <div class="sm:col-span-2 grid grid-cols-2 gap-2" role="group" aria-label={m.statchannels.channelAria()}>
        {#each [true, false] as option (option)}
          {@const selected = createNew === option}
          <button
            type="button"
            class="min-h-[50px] px-2 rounded-lg border text-sm font-medium"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => (createNew = option)}
          >
            {option ? m.statchannels.addCreateNew() : m.statchannels.addUseExisting()}
          </button>
        {/each}
      </div>

      <div class="sm:col-span-2">
        {#if createNew}
          {@render label("sc-category", m.common.categoryOptional())}
          <DiscordSelector
            id="sc-category"
            type="channel"
            options={categories}
            selected={categoryId}
            placeholder={m.statchannels.addNoCategory()}
            onchange={(d) => (categoryId = typeof d.selected === "string" ? d.selected : null)}
          />
        {:else}
          {@render label("sc-voice", m.common.voiceChannel())}
          <DiscordSelector
            id="sc-voice"
            type="channel"
            options={voiceChannels}
            selected={channelId}
            placeholder={m.statchannels.addSelectVoice()}
            onchange={(d) => (channelId = typeof d.selected === "string" ? d.selected : null)}
          />
        {/if}
      </div>
    {/if}

    <div class="sm:col-span-2">
      {@render label("sc-type", m.statchannels.addCounter())}
      <DiscordSelector
        id="sc-type"
        type="custom"
        customIcon="fa-tag"
        options={typeOptions}
        selected={String(form.statType)}
        clearable={false}
        placeholder={m.statchannels.addSelectCounter()}
        onchange={(d) => d.selected && pickType(parseInt(String(d.selected)))}
      />
      {#if definition}
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
          {definition.description}
          {m.statchannels.addExample()}
          <code style="color: {$colorStore.primary}">{definition.example}</code>
        </p>
      {/if}
    </div>

    {#if requirement === REQUIREMENT.Role}
      <div>
        {@render label("sc-role", m.common.role())}
        <DiscordSelector
          id="sc-role"
          type="role"
          options={roles}
          selected={form.roleId}
          placeholder={m.common.selectRolePlaceholder()}
          onchange={(d) => {
            form.roleId = typeof d.selected === "string" ? d.selected : null;
            changed();
          }}
        />
      </div>
    {:else if requirement === REQUIREMENT.Date}
      <div>
        {@render label("sc-date", m.statchannels.addTargetDate())}
        <input
          id="sc-date"
          type="datetime-local"
          bind:value={form.countdownDate}
          oninput={changed}
          class={inputClass}
          style={inputStyle}
        >
      </div>
    {:else if requirement === REQUIREMENT.Goal}
      <div>
        {@render label("sc-goal", m.statchannels.addGoal())}
        <input
          id="sc-goal"
          type="number"
          min="1"
          inputmode="numeric"
          value={form.goalTarget}
          oninput={(e) => {
            form.goalTarget = readInt(e, 0);
            changed();
          }}
          class={inputClass}
          style={inputStyle}
        >
      </div>
    {:else if requirement === REQUIREMENT.CounterName}
      <div>
        {@render label("sc-counter-name", m.statchannels.addTwitchCounter())}
        <input
          id="sc-counter-name"
          type="text"
          bind:value={form.targetName}
          oninput={changed}
          placeholder={m.statchannels.addTwitchCounterPlaceholder()}
          class={inputClass}
          style={inputStyle}
        >
        <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.statchannels.addTwitchCounterHint()}</p>
      </div>
    {:else if requirement === REQUIREMENT.CountingChannel}
      <div>
        {@render label("sc-counting", m.features.wizardCountingStepChannelTitle())}
        <DiscordSelector
          id="sc-counting"
          type="channel"
          options={countingChannels}
          selected={form.targetId}
          placeholder={m.statchannels.addSelectCounting()}
          onchange={(d) => {
            form.targetId = typeof d.selected === "string" ? d.selected : null;
            changed();
          }}
        />
      </div>
    {:else if requirement === REQUIREMENT.MinecraftServer}
      <div>
        {@render label("sc-mc", m.statchannels.addMinecraftServer())}
        <DiscordSelector
          id="sc-mc"
          type="custom"
          customIcon="fa-server"
          clearable={false}
          options={minecraftServers}
          selected={form.targetId}
          placeholder={m.statchannels.addSelectServer()}
          onchange={(d) => {
            form.targetId = typeof d.selected === "string" ? d.selected : null;
            changed();
          }}
        />
      </div>
    {/if}

    <div class="sm:col-span-2">
      {@render label("sc-template", m.common.template())}
      <div class="flex gap-2 items-stretch">
        <input
          id="sc-template"
          type="text"
          bind:value={form.template}
          oninput={changed}
          onblur={() => editing && autoSave.flush(saveKey)}
          class="{inputClass} min-w-0 grow"
          style={inputStyle}
        >
        <div class="w-16 shrink-0">
          <EmojiPicker
            id="sc-template-emoji"
            guildEmojis={[]}
            selected={null}
            multiple={false}
            onchange={(d) => addEmoji(d.selected)}
          />
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mt-2" role="group" aria-label={m.statchannels.placeholdersTitle()}>
        {#each placeholders as placeholder (placeholder)}
          <button
            type="button"
            class="px-3 min-h-[44px] rounded-lg text-xs font-mono"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            onclick={() => addPlaceholder(placeholder)}
          >
            {placeholder}
          </button>
        {/each}
      </div>
    </div>

    <div class="sm:col-span-2">
      <p class="text-xs mb-1" style="color: {$colorStore.muted}">{m.statchannels.addPreviewHint()}</p>
      <div
        class="rounded-lg border p-3 min-h-[50px] flex items-center gap-3"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
        aria-live="polite"
      >
        <i class="fa-solid fa-volume-high" style="color: {$colorStore.muted}" aria-hidden="true"></i>
        <span class="font-medium truncate" style="color: {$colorStore.text}">
          {previewText || (previewPending ? m.statchannels.addPreviewRendering() : m.statchannels.addPreviewUnavailable())}
        </span>
      </div>
    </div>

    <div>
      {@render label("sc-style", m.statchannels.editStyle())}
      <DiscordSelector
        id="sc-style"
        type="custom"
        customIcon="fa-palette"
        options={styleOptions}
        selected={String(form.displayStyle)}
        clearable={false}
        placeholder={m.statchannels.editStylePlaceholder()}
        onchange={(d) => {
          form.displayStyle = d.selected ? parseInt(String(d.selected)) : 1;
          changed();
        }}
      />
      {#if definition && definition.valueKind !== VALUE_KIND.Number}
        <p class="text-xs mt-1" style="color: {$colorStore.muted}">
          {m.statchannels.addStyleTextHint({ kind: definition.valueKindName.toLowerCase() })}
        </p>
      {/if}
    </div>

    <div>
      {@render label("sc-mechanism", m.statchannels.editMechanism())}
      <DiscordSelector
        id="sc-mechanism"
        type="custom"
        customIcon="fa-gauge"
        options={mechanismOptions}
        selected={String(form.updateMechanism)}
        clearable={false}
        placeholder={m.statchannels.editMechanismPlaceholder()}
        onchange={(d) => pickMechanism(d.selected ? parseInt(String(d.selected)) : MECHANISM.Auto)}
      />
    </div>

    <div class="sm:col-span-2 rounded-lg border p-3 space-y-1" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <p class="text-sm" style="color: {$colorStore.text}">{mechanismBlurb}</p>
      {#if mechanismCaution}
        <p class="text-xs" style="color: {$colorStore.muted}">{mechanismCaution}</p>
      {/if}
    </div>

    <div>
      {@render label("sc-interval", m.statchannels.editInterval())}
      <input
        id="sc-interval"
        type="number"
        min={minInterval}
        max={MAX_INTERVAL}
        inputmode="numeric"
        value={form.updateIntervalMinutes}
        oninput={(e) => {
          form.updateIntervalMinutes = readInt(e, 0);
          save();
        }}
        onblur={() => editing && autoSave.flush(saveKey)}
        class={inputClass}
        style={inputStyle}
      >
      <p class="text-xs mt-1" style="color: {$colorStore.muted}">
        {(minInterval === 1 ? m.statchannels.addMinIntervalOne : m.statchannels.addMinIntervalOther)({ count: minInterval })}
        {#if definition?.realtime}
          {m.statchannels.addRealtimeHint()}
        {/if}
      </p>
    </div>

    {#if showStyleOptions}
      <h4 class="sm:col-span-2 text-sm font-medium" style="color: {$colorStore.text}">{m.statchannels.styleOptionsTitle()}</h4>

      {#if showDecimals}
        <div>
          {@render label("sc-decimals", m.statchannels.decimals())}
          <input
            id="sc-decimals"
            type="number"
            min="0"
            max="3"
            inputmode="numeric"
            value={form.style.decimals}
            oninput={(e) => {
              form.style.decimals = Math.min(3, Math.max(0, readInt(e, 0)));
              changed();
            }}
            class={inputClass}
            style={inputStyle}
          >
        </div>
      {/if}

      {#if showPad}
        <div>
          {@render label("sc-pad", m.statchannels.padWidth())}
          <input
            id="sc-pad"
            type="number"
            min="1"
            max="12"
            inputmode="numeric"
            value={form.style.padWidth}
            oninput={(e) => {
              form.style.padWidth = Math.min(12, Math.max(1, readInt(e, 1)));
              changed();
            }}
            class={inputClass}
            style={inputStyle}
          >
        </div>
      {/if}

      {#if showBar}
        <div>
          {@render label("sc-bar-width", m.statchannels.barWidth())}
          <input
            id="sc-bar-width"
            type="number"
            min="1"
            max="40"
            inputmode="numeric"
            value={form.style.barWidth}
            oninput={(e) => {
              form.style.barWidth = Math.min(40, Math.max(1, readInt(e, 1)));
              changed();
            }}
            class={inputClass}
            style={inputStyle}
          >
        </div>
        <div>
          {@render label("sc-bar-filled", m.statchannels.barFilled())}
          <input
            id="sc-bar-filled"
            type="text"
            maxlength="4"
            bind:value={form.style.barFilled}
            oninput={changed}
            class={inputClass}
            style={inputStyle}
          >
        </div>
        <div>
          {@render label("sc-bar-empty", m.statchannels.barEmpty())}
          <input
            id="sc-bar-empty"
            type="text"
            maxlength="4"
            bind:value={form.style.barEmpty}
            oninput={changed}
            class={inputClass}
            style={inputStyle}
          >
        </div>
      {/if}

      {#if showBoolean}
        <div>
          {@render label("sc-true", m.statchannels.trueText())}
          <input
            id="sc-true"
            type="text"
            maxlength="32"
            bind:value={form.style.trueText}
            oninput={changed}
            class={inputClass}
            style={inputStyle}
          >
        </div>
        <div>
          {@render label("sc-false", m.statchannels.falseText())}
          <input
            id="sc-false"
            type="text"
            maxlength="32"
            bind:value={form.style.falseText}
            oninput={changed}
            class={inputClass}
            style={inputStyle}
          >
        </div>
      {/if}
    {/if}
  </div>

  {#if editing}
    <p class="text-xs" style="color: {$colorStore.muted}">{m.statchannels.editHint()}</p>
  {/if}
</Sheet>
