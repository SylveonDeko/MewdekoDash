<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { afkApi } from "$lib/api/index.ts";
  import type { DiscordUser } from "$lib/types/discord";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import NumberField from "$lib/components/plugin/NumberField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, MAX_LENGTH, MAX_TIMEOUT_SECONDS, type Named } from "./afkModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    notify: (message: string, type?: "success" | "error") => void;
  }

  let { guildId, channels, autoSave, user = null, notify }: Props = $props();

  type Values = {
    deletion: number;
    maxLength: number;
    type: number;
    timeout: number;
    notify: boolean;
    leaveMessages: boolean;
    disabled: string[];
    message: string;
  };

  let values: Values | null = $state(null);
  let saved: Values | null = null;

  const types = $derived([
    { id: "1", name: m.features.wizardAfk1() },
    { id: "2", name: m.features.wizardAfk2() },
    { id: "3", name: m.features.wizardAfk3() },
    { id: "4", name: m.features.wizardAfk4() }
  ]);

  const placeholders = $derived(
    [
      ["%afk.message%", m.afk.placeholderMessage()],
      ["%afk.user%", m.afk.placeholderUser()],
      ["%afk.user.mention%", m.afk.placeholderUserMention()],
      ["%afk.user.avatar%", m.afk.placeholderUserAvatar()],
      ["%afk.user.id%", m.afk.placeholderUserId()],
      ["%afk.triggeruser%", m.afk.placeholderTrigger()],
      ["%afk.triggeruser.mention%", m.afk.placeholderTriggerMention()],
      ["%afk.triggeruser.avatar%", m.afk.placeholderTriggerAvatar()],
      ["%afk.triggeruser.id%", m.afk.placeholderTriggerId()],
      ["%afk.time%", m.afk.placeholderTime()]
    ].map(([name, description]) => ({ category: m.afk.placeholderCategory(), name, description }))
  );

  async function load() {
    try {
      const [deletion, maxLength, type, timeout, notify, leaveMessages, disabled, message] = await Promise.all([
        afkApi.getAfkDel(guildId),
        afkApi.getAfkLength(guildId),
        afkApi.getAfkType(guildId),
        afkApi.getAfkTimeout(guildId),
        afkApi.getAfkNotifyButton(guildId).catch(() => false),
        afkApi.getAfkMessages(guildId).catch(() => false),
        afkApi.getDisabledAfkChannels(guildId),
        afkApi.getCustomAfkMessage(guildId)
      ]);
      const raw = typeof disabled === "string" ? disabled : ((disabled as { data?: string } | null)?.data ?? "");
      const loaded: Values = {
        deletion,
        maxLength,
        type,
        timeout,
        notify: notify === true,
        leaveMessages: leaveMessages === true,
        disabled: raw && raw !== "0" ? raw.split(",").filter(Boolean) : [],
        message: message ?? ""
      };
      values = { ...loaded, disabled: [...loaded.disabled] };
      saved = { ...loaded, disabled: [...loaded.disabled] };
    } catch (err) {
      logger.error("Failed to load AFK settings:", err);
      notify(errorText(err, m.afk.fetchSettingsFailed()), "error");
    }
  }

  /**
   * Shows a change and saves it, putting the field back if the save fails.
   * @param key The setting
   * @param value Its new value
   * @param call The request that stores it
   * @param mode Whether to save now or once typing stops
   */
  function persist<K extends keyof Values>(key: K, value: Values[K], call: () => Promise<unknown>, mode: "now" | "typing") {
    if (!values || !saved) return;
    const current = values;
    const confirmed = saved;
    current[key] = value;
    const save = async () => {
      try {
        await call();
        confirmed[key] = value;
      } catch (err) {
        if (mode === "now" || current[key] === value) current[key] = confirmed[key];
        throw err;
      }
    };
    if (mode === "now") void autoSave.now(key, save);
    else autoSave.schedule(key, save);
  }

  onMount(() => {
    void load();
  });
</script>

<div class="space-y-4 min-w-0" onfocusout={() => autoSave.flush()}>
  {#if values}
    <PluginCard title={m.afk.cardBehavior()} alwaysOpen>
      <div class="grid gap-4 sm:grid-cols-2">
        <SettingField label={m.afk.typeTitle()} hint={m.afk.typeHint()} id="afk-type">
          <DiscordSelector
            id="afk-type"
            type="custom"
            options={types}
            selected={String(values.type)}
            searchable={false}
            clearable={false}
            customIcon="fa-gear"
            onchange={({ selected }) => {
              const type = Number(selected);
              if (type && type !== values?.type) persist("type", type, () => afkApi.afkTypeSet(guildId, type), "now");
            }}
          />
        </SettingField>
        <NumberField
          id="afk-max-length"
          label={m.afk.maxLengthTitle()}
          hint={m.afk.maxLengthHint()}
          min={1}
          max={MAX_LENGTH}
          value={values.maxLength}
          onchange={(value) => {
            const next = value ?? 1;
            persist("maxLength", next, () => afkApi.afkLengthSet(guildId, next), "typing");
          }}
        />
        <NumberField
          id="afk-timeout"
          label={m.afk.timeoutTitle()}
          hint={m.afk.timeoutHint()}
          max={MAX_TIMEOUT_SECONDS}
          value={values.timeout}
          onchange={(value) => {
            const next = value ?? 0;
            persist("timeout", next, () => afkApi.afkTimeoutSet(guildId, `${next}s`), "typing");
          }}
        />
        <NumberField
          id="afk-deletion"
          label={m.afk.deletionTitle()}
          hint={m.afk.deletionHint()}
          value={values.deletion}
          onchange={(value) => {
            const next = value ?? 0;
            persist("deletion", next, () => afkApi.afkDelSet(guildId, next), "typing");
          }}
        />
      </div>
      <ToggleRow
        id="afk-notify"
        class="mt-2"
        title={m.afk.notifyBackTitle()}
        subtitle={m.afk.notifyBackHint()}
        checked={values.notify}
        colors={$colorStore}
        onchange={(next) => persist("notify", next, () => afkApi.afkNotifyButtonSet(guildId, next), "now")}
      />
      <ToggleRow
        id="afk-leave-messages"
        title={m.afk.leaveMessagesTitle()}
        subtitle={m.afk.leaveMessagesHint()}
        checked={values.leaveMessages}
        colors={$colorStore}
        onchange={(next) => persist("leaveMessages", next, () => afkApi.afkMessagesSet(guildId, next), "now")}
      />
    </PluginCard>

    <PluginCard title={m.afk.channelsTitle()} alwaysOpen>
      <SettingField label={m.afk.channelsLabel()} id="afk-channels">
        <DiscordSelector
          id="afk-channels"
          type="channel"
          options={channels}
          multiple
          selected={values.disabled}
          placeholder={m.afk.channelsPlaceholder()}
          onchange={({ selected }) => {
            const next = Array.isArray(selected) ? selected : [];
            persist("disabled", next, () => afkApi.setDisabledAfkChannels(guildId, next.join(",") || "0"), "now");
          }}
        />
      </SettingField>
    </PluginCard>

    <PluginCard title={m.afk.customTitle()} alwaysOpen>
      <MessageField
        value={values.message}
        card={{ guildId, target: "afk", ownerId: 0, autoSave, onerror: (message) => notify(message, "error") }}
        previewTitle={m.afk.customPreviewTitle()}
        icon="fa-moon"
        {user}
        {placeholders}
        placeholder={m.afk.customPlaceholder()}
        onchange={(message) => persist("message", message, () => afkApi.setCustomAfkMessage(guildId, message), "typing")}
      />
    </PluginCard>
  {/if}
</div>
