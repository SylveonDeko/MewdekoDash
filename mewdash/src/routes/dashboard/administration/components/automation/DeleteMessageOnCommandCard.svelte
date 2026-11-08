<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import RemovableRow from "../RemovableRow.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "textChannels" | "autoSave" | "notify">;

  let { guildId, textChannels, autoSave, notify }: Props = $props();

  type Override = { channelId: bigint; state: boolean };

  let enabled = $state(false);
  let overrides = $state<Override[]>([]);
  let channel = $state<string | null>(null);
  let choice = $state("enable");
  let busy = $state(false);

  const stateOptions = $derived([
    { id: "enable", name: m.administration.automationDeleteMessageStateEnable() },
    { id: "disable", name: m.administration.automationDeleteMessageStateDisable() },
    { id: "inherit", name: m.administration.automationDeleteMessageStateInherit() }
  ]);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function channelName(id: bigint): string {
    return textChannels.find(item => String(item.id) === String(id))?.name ?? String(id);
  }

  async function load() {
    try {
      const data = (await administrationApi.getDeleteMessageOnCommand(guildId)) as unknown as {
        enabled?: boolean;
        channels?: Override[];
      };
      enabled = !!data?.enabled;
      overrides = data?.channels ?? [];
    } catch (err) {
      logger.error("Failed to load delete message settings:", err);
      notify(errorText(err, m.administration.automationLoadFailed()), "error");
    }
  }

  function toggle(value: boolean) {
    const previous = enabled;
    enabled = value;
    autoSave.now("deleteMessageOnCommand", async () => {
      try {
        await administrationApi.toggleDeleteMessageOnCommand(guildId);
      } catch (err) {
        enabled = previous;
        throw err;
      }
    });
  }

  async function setState(channelId: string, state: string) {
    if (busy) return;
    busy = true;
    try {
      await administrationApi.setDeleteMessageOnCommandChannel(guildId, { channelId: BigInt(channelId), state });
      await load();
      return true;
    } catch (err) {
      logger.error("Failed to set channel state:", err);
      notify(errorText(err, m.administration.automationDeleteMessageSaveFailed()), "error");
      return false;
    } finally {
      busy = false;
    }
  }

  async function add() {
    if (!channel) return;
    if (await setState(channel, choice)) channel = null;
  }

  void load();
</script>

<PluginCard title={m.administration.automationDeleteMessageTitle()} {enabled} onToggle={toggle}>
  <div class="space-y-1">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.channelOverrides()}</span>
    {#if overrides.length === 0}
      <p class="text-sm py-2" style="color: {$colorStore.muted}">{m.administration.automationDeleteMessageNoOverrides()}</p>
    {:else}
      <div class="space-y-2">
        {#each overrides as item (String(item.channelId))}
          <RemovableRow
            title={`#${channelName(item.channelId)}`}
            subtitle={item.state ? m.administration.automationDeleteMessageStateEnable() : m.administration.automationDeleteMessageStateDisable()}
            removeLabel={m.administration.automationDeleteMessageResetAria({ channel: channelName(item.channelId) })}
            onremove={() => setState(String(item.channelId), "inherit")}
          />
        {/each}
      </div>
    {/if}
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start">
    <DiscordSelector
      type="channel"
      options={textChannels}
      selected={channel}
      clearable={false}
      placeholder={m.common.selectChannelPlaceholder()}
      onchange={(detail) => (channel = typeof detail.selected === "string" ? detail.selected : null)}
    />
    <DiscordSelector
      type="custom"
      customIcon="fa-gear"
      options={stateOptions}
      selected={choice}
      searchable={false}
      clearable={false}
      onchange={(detail) => (choice = typeof detail.selected === "string" ? detail.selected : "enable")}
    />
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style={quietStyle}
      disabled={!channel || busy}
      onclick={add}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.common.add()}
    </button>
  </div>
</PluginCard>
