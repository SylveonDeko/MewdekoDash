import { m } from "$lib/i18n";
import { twitchApi, type TwitchConfigUpdateRequest, type TwitchOAuthStatusResponse } from "$lib/api/index.ts";
import type { AutoSave } from "$lib/utils/autoSave.svelte";

const TEXT_FIELDS = new Set(["commandPrefix", "language", "subNotificationMessage", "raidNotificationMessage", "goLiveMessage"]);

export type ConfigForm = {
  commandPrefix: string;
  language: string;
  useEventSub: boolean;
  enabled: boolean;
  goLiveChannelId: string | null;
  goLiveMessage: string;
  subNotificationChannelId: string | null;
  subNotificationMessage: string;
  raidNotificationChannelId: string | null;
  raidNotificationMessage: string;
};

export type ConfigField = keyof ConfigForm;

function emptyForm(): ConfigForm {
  return {
    commandPrefix: "!",
    language: "",
    useEventSub: true,
    enabled: true,
    goLiveChannelId: null,
    goLiveMessage: "",
    subNotificationChannelId: null,
    subNotificationMessage: "",
    raidNotificationChannelId: null,
    raidNotificationMessage: "",
  };
}

/** The bot's Twitch settings for one guild, saved field by field as they change. */
export function createTwitchConfig(getGuildId: () => bigint, getAutoSave: () => AutoSave) {
  const guildId = $derived(getGuildId());
  const autoSave = $derived(getAutoSave());
  let status = $state<TwitchOAuthStatusResponse | null>(null);
  let form = $state<ConfigForm>(emptyForm());
  let saved: ConfigForm = emptyForm();

  function apply(next: TwitchOAuthStatusResponse, enabled: boolean) {
    status = next;
    form = {
      commandPrefix: next.commandPrefix || "!",
      language: next.language || "",
      useEventSub: next.useEventSub ?? true,
      enabled,
      goLiveChannelId: next.goLiveChannelId?.toString() ?? null,
      goLiveMessage: next.goLiveMessage || "",
      subNotificationChannelId: next.subNotificationChannelId?.toString() ?? null,
      subNotificationMessage: next.subNotificationMessage || "",
      raidNotificationChannelId: next.raidNotificationChannelId?.toString() ?? null,
      raidNotificationMessage: next.raidNotificationMessage || "",
    };
    saved = { ...form };
  }

  function request(field: ConfigField): TwitchConfigUpdateRequest {
    const channel = (id: string | null) => (id ? BigInt(id) : 0n);
    switch (field) {
      case "commandPrefix": return { commandPrefix: form.commandPrefix.trim() };
      case "language": return { language: form.language.trim() };
      case "enabled": return { enabled: form.enabled };
      case "useEventSub": return { useEventSub: form.useEventSub };
      case "goLiveChannelId": return { goLiveChannelId: channel(form.goLiveChannelId) };
      case "goLiveMessage": return { goLiveMessage: form.goLiveMessage };
      case "subNotificationChannelId": return { subNotificationChannelId: channel(form.subNotificationChannelId) };
      case "raidNotificationChannelId": return { raidNotificationChannelId: channel(form.raidNotificationChannelId) };
      case "subNotificationMessage": return { subNotificationMessage: form.subNotificationMessage };
      case "raidNotificationMessage": return { raidNotificationMessage: form.raidNotificationMessage };
    }
  }

  function save(field: ConfigField) {
    const value = form[field];
    const body = request(field);
    const typed = TEXT_FIELDS.has(field);
    const send = async () => {
      try {
        await twitchApi.updateConfig(guildId, body);
        Object.assign(saved, { [field]: value });
        if (field === "useEventSub" && status) status = { ...status, useEventSub: value as boolean };
      } catch (err) {
        if (!typed) Object.assign(form, { [field]: saved[field] });
        throw err;
      }
    };
    if (typed) autoSave.schedule(field, send);
    else void autoSave.now(field, send);
  }

  return {
    get status() { return status; },
    get form() { return form; },
    apply,
    save,
    flush(field: ConfigField) {
      void autoSave.flush(field);
    },
    set<K extends ConfigField>(field: K, value: ConfigForm[K]) {
      form[field] = value;
      save(field);
    },
    /** The prefix can't be empty, so an empty field is not sent and is restored on blur. */
    typePrefix() {
      if (!form.commandPrefix.trim()) autoSave.cancel("commandPrefix");
      else save("commandPrefix");
    },
    blurPrefix() {
      if (!form.commandPrefix.trim()) form.commandPrefix = saved.commandPrefix;
      else void autoSave.flush("commandPrefix");
    },
    saveErrorText(key: string): string {
      return TEXT_FIELDS.has(key) ? m.twitch.notifySaveFailed() : m.twitch.notifySaveFailedUndone();
    },
  };
}

export type TwitchConfig = ReturnType<typeof createTwitchConfig>;
