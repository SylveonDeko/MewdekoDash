<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { greetMessagesApi, type GreetMessage, type GreetMessageKind } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";

  interface Props {
    guildId: bigint;
    kind: GreetMessageKind;
    title: string;
    channels: Array<{ id: string; name: string }>;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onerror: (message: string) => void;
  }

  let { guildId, kind, title, channels, autoSave, user = null, onerror }: Props = $props();

  let setting: GreetMessage | null = $state(null);
  let deleteAfter = $state("");

  const hasChannel = $derived(kind !== "dmgreet");
  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function load() {
    try {
      setting = await greetMessagesApi.get(guildId, kind);
      deleteAfter = String(setting.deleteAfter);
    } catch (err) {
      logger.error(`Failed to load ${kind} message:`, err);
      onerror(err instanceof Error ? err.message : m.common.failedToSaveTheSettings());
    }
  }

  function save(change: Partial<GreetMessage>, key: string = kind) {
    if (!setting) return Promise.resolve();
    const previous = setting;
    const next = { ...setting, ...change };
    setting = next;
    return autoSave.now(`${kind}:${key}`, async () => {
      try {
        const saved = await greetMessagesApi.update(guildId, kind, {
          ...next,
          channelId: next.channelId ? BigInt(next.channelId.toString()) : null
        });
        setting = saved;
      } catch (err) {
        setting = previous;
        throw err;
      }
    });
  }

  function queueDeleteAfter() {
    const seconds = Math.min(600, Math.max(0, Math.floor(Number(deleteAfter) || 0)));
    autoSave.schedule(`${kind}:deleteAfter`, async () => {
      if (!setting) return;
      const saved = await greetMessagesApi.update(guildId, kind, {
        ...setting,
        deleteAfter: seconds,
        channelId: setting.channelId ? BigInt(setting.channelId.toString()) : null
      });
      setting = saved;
    });
  }

  onMount(() => {
    void load();
  });
</script>

{#if setting}
  <PluginCard {title} enabled={setting.enabled} onToggle={(on) => save({ enabled: on }, "enabled")}>
    {#if hasChannel}
      <SettingField label={m.common.channel()} id="{kind}-channel">
        <DiscordSelector
          id="{kind}-channel"
          type="channel"
          options={channels}
          selected={setting.channelId?.toString() ?? null}
          placeholder={m.common.selectAChannelPlaceholder()}
          onchange={(detail) => typeof detail.selected === "string" && save({ channelId: BigInt(detail.selected) }, "channel")}
        />
      </SettingField>
    {/if}

    <MessageField
      value={setting.message}
      previewTitle={title}
      {user}
      icon={kind === "dmgreet" ? "fa-envelope" : "fa-comment"}
      card={{ guildId, target: kind, ownerId: 0, autoSave, onerror }}
      onchange={(message) => save({ message }, "message")}
    />

    {#if hasChannel}
      <SettingField label={m.multigreets.deleteAfterSeconds()} id="{kind}-delete-after">
        <input
          id="{kind}-delete-after"
          type="number"
          min="0"
          max="600"
          bind:value={deleteAfter}
          oninput={queueDeleteAfter}
          onblur={() => autoSave.flush(`${kind}:deleteAfter`)}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    {/if}
  </PluginCard>
{/if}
