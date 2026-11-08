import { wordOfTheDayApi, type WordOfTheDayConfig, type WordOfTheDayConfigRequest } from "$lib/api/index.ts";
import type { AutoSave } from "$lib/utils/autoSave.svelte";

export type ConfigForm = {
  channelId: string | null;
  enabled: boolean;
  postHour: number;
  timezone: string;
  pingRoleId: string | null;
  messageTemplate: string;
  topic: string;
  partOfSpeech: number;
  difficulty: number;
  sourceMode: number;
  createThread: boolean;
  threadName: string;
  threadAutoArchiveMinutes: number;
};

function emptyForm(): ConfigForm {
  return {
    channelId: null,
    enabled: false,
    postHour: 9,
    timezone: "UTC",
    pingRoleId: null,
    messageTemplate: "",
    topic: "",
    partOfSpeech: 0,
    difficulty: 0,
    sourceMode: 0,
    createThread: false,
    threadName: "",
    threadAutoArchiveMinutes: 1440
  };
}

type SaveOptions = { key?: string; debounce?: boolean; rollback?: boolean };

/** The bot's word of the day settings for one guild, saved field by field as they change. */
export function createWotdConfig(getGuildId: () => bigint, getAutoSave: () => AutoSave) {
  let form = $state<ConfigForm>(emptyForm());
  let saved: ConfigForm = emptyForm();
  let lastPostedDate = $state<string | null>(null);

  function apply(cfg: WordOfTheDayConfig) {
    form = {
      channelId: cfg.channelId?.toString() ?? null,
      enabled: cfg.enabled,
      postHour: cfg.postHour,
      timezone: cfg.timezone || "UTC",
      pingRoleId: cfg.pingRoleId?.toString() ?? null,
      messageTemplate: cfg.messageTemplate ?? "",
      topic: cfg.topic ?? "",
      partOfSpeech: cfg.partOfSpeech,
      difficulty: cfg.difficulty,
      sourceMode: cfg.sourceMode,
      createThread: cfg.createThread,
      threadName: cfg.threadName ?? "",
      threadAutoArchiveMinutes: cfg.threadAutoArchiveMinutes || 1440
    };
    saved = { ...form };
    lastPostedDate = cfg.lastPostedDate;
  }

  async function load() {
    await getAutoSave().flush();
    apply(await wordOfTheDayApi.getConfig(getGuildId()));
  }

  /**
   * Shows `patch` at once and sends `request`.
   */
  function save(patch: Partial<ConfigForm>, request: WordOfTheDayConfigRequest, options: SaveOptions = {}) {
    const { key = Object.keys(patch)[0], debounce = false, rollback = true } = options;
    const guildId = getGuildId();
    const fields = Object.keys(patch) as (keyof ConfigForm)[];
    Object.assign(form, patch);
    const run = async () => {
      try {
        await wordOfTheDayApi.updateConfig(guildId, request);
        if (getGuildId() !== guildId) return;
        saved = { ...saved, ...patch };
      } catch (err) {
        if (rollback && getGuildId() === guildId) {
          Object.assign(form, Object.fromEntries(fields.map((f) => [f, saved[f]])));
        }
        throw err;
      }
    };
    const autoSave = getAutoSave();
    if (debounce) autoSave.schedule(key, run);
    else autoSave.now(key, run);
  }

  const id = (value: string | null) => (value ? BigInt(value) : 0n);

  return {
    get form() {
      return form;
    },
    get lastPostedDate() {
      return lastPostedDate;
    },
    set lastPostedDate(value: string | null) {
      lastPostedDate = value;
    },
    apply,
    load,
    /** Shares a key with the toggle so their writes land in order. */
    setChannel(channelId: string | null) {
      const patch: Partial<ConfigForm> = { channelId };
      const request: WordOfTheDayConfigRequest = { channelId: id(channelId) };
      if (!channelId) {
        patch.enabled = false;
        request.enabled = false;
      }
      save(patch, request, { key: "posting" });
    },
    setEnabled: (enabled: boolean) => save({ enabled }, { enabled }, { key: "posting" }),
    setPostHour: (postHour: number) => save({ postHour }, { postHour }),
    setTimezone: (timezone: string) => save({ timezone }, { timezone }),
    setPingRole: (pingRoleId: string | null) => save({ pingRoleId }, { pingRoleId: id(pingRoleId) }),
    setSourceMode: (sourceMode: number) => save({ sourceMode }, { sourceMode }),
    setPartOfSpeech: (partOfSpeech: number) => save({ partOfSpeech }, { partOfSpeech }),
    setDifficulty: (difficulty: number) => save({ difficulty }, { difficulty }),
    setCreateThread: (createThread: boolean) => save({ createThread }, { createThread }),
    setThreadArchive: (threadAutoArchiveMinutes: number) =>
      save({ threadAutoArchiveMinutes }, { threadAutoArchiveMinutes }),
    setTopic(topic: string) {
      save({ topic }, { topic: topic.trim() }, { debounce: true, rollback: false });
    },
    setThreadName(threadName: string) {
      save({ threadName }, { threadName: threadName.trim() }, { debounce: true, rollback: false });
    },
    setTemplate: (messageTemplate: string) => save({ messageTemplate }, { messageTemplate })
  };
}

export type WotdConfig = ReturnType<typeof createWotdConfig>;
