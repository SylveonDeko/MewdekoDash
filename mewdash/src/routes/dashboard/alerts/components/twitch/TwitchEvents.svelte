<script lang="ts">
  import { m } from "$lib/i18n";
  import { twitchApi, type TwitchRedemptionActionResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import AlertRow from "../AlertRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import type { Named, Notify } from "./twitchModel";
  import type { TwitchConfig } from "./twitchConfig.svelte";

  interface Props {
    guildId: bigint;
    config: TwitchConfig;
    channels: Named[];
    user?: DiscordUser | null;
    notify: Notify;
    onhealth: () => void;
  }

  let { guildId, config, channels, user = null, notify, onhealth }: Props = $props();

  const eventVariables = {
    sub: ["%user%", "%display%", "%channel%", "%tier%"],
    raid: ["%raider%", "%channel%", "%viewers%"],
    redemption: ["%user%", "%display%", "%channel%", "%reward%", "%input%", "%url%"]
  };

  const blank = () => ({ rewardTitle: "", twitchResponse: "", discordChannelId: null as string | null, discordMessage: "" });

  let redemptions: TwitchRedemptionActionResponse[] = $state([]);
  let form = $state<ReturnType<typeof blank> | null>(null);
  let busy = $state(false);
  let testing: "golive" | "sub" | "raid" | null = $state(null);

  const goLivePlaceholders = $derived([
    { category: m.placeholders.categoryStream(), name: "%streamer%", description: m.twitch.golivePlaceholderStreamer() },
    { category: m.placeholders.categoryStream(), name: "%title%", description: m.common.currentStreamTitle() },
    { category: m.placeholders.categoryStream(), name: "%game%", description: m.common.streamGameHint() },
    { category: m.placeholders.categoryStream(), name: "%url%", description: m.common.streamUrlHint() },
    { category: m.placeholders.categoryStream(), name: "%viewers%", description: m.twitch.golivePlaceholderViewers() }
  ]);

  function channelLabel(action: TwitchRedemptionActionResponse): string {
    if (!action.discordChannelId) return m.common.noneLower();
    const id = action.discordChannelId.toString();
    return `#${channels.find(channel => channel.id === id)?.name ?? id}`;
  }

  async function load() {
    redemptions = await twitchApi.getRedemptionActions(guildId).catch(() => []);
  }

  async function test(kind: "golive" | "sub" | "raid") {
    testing = kind;
    try {
      const result = await twitchApi.sendTestEvent(guildId, kind);
      notify(result.message);
    } catch (err) {
      logger.error(`Failed to send test ${kind} event:`, err);
      notify(m.twitch.notifyTestEventFailed({ event: kind }), "error");
    } finally {
      testing = null;
      onhealth();
    }
  }

  function edit(action: TwitchRedemptionActionResponse) {
    form = {
      rewardTitle: action.rewardTitle,
      twitchResponse: action.twitchResponse || "",
      discordChannelId: action.discordChannelId?.toString() ?? null,
      discordMessage: action.discordMessage || ""
    };
  }

  async function save() {
    if (!form || !form.rewardTitle.trim()) return;
    busy = true;
    try {
      await twitchApi.saveRedemptionAction(guildId, {
        rewardTitle: form.rewardTitle.trim(),
        twitchResponse: form.twitchResponse || null,
        discordChannelId: form.discordChannelId ? BigInt(form.discordChannelId) : BigInt(0),
        discordMessage: form.discordMessage || null
      });
      notify(m.twitch.notifyRedemptionSaved());
      form = null;
      await load();
    } catch (err) {
      logger.error("Failed to save Twitch redemption action:", err);
      notify(m.twitch.notifyRedemptionSaveFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(title: string) {
    const confirmed = await requestConfirmation({ message: m.twitch.confirmRemoveRedemption({ title }), confirmText: m.common.remove() });
    if (!confirmed) return;
    try {
      await twitchApi.removeRedemptionAction(guildId, title);
      notify(m.twitch.notifyRedemptionRemoved());
      await load();
    } catch (err) {
      logger.error("Failed to remove Twitch redemption action:", err);
      notify(m.twitch.notifyRedemptionRemoveFailed(), "error");
    }
  }

  void load();
</script>

<PluginCard title={m.twitch.eventsRoutingTitle()} alwaysOpen>
  <div class="space-y-1">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.twitch.eventsGoliveChannel()}</span>
    <DiscordSelector
      type="channel"
      options={channels}
      selected={config.form.goLiveChannelId}
      placeholder={m.common.noChannelSelected()}
      onchange={(detail) => config.set("goLiveChannelId", typeof detail.selected === "string" ? detail.selected : null)}
    />
  </div>
  <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.twitch.eventsGoliveMessage()}</p>
  <MessageField
    value={config.form.goLiveMessage}
    previewTitle={m.twitch.eventsGoliveMessage()}
    icon="fa-signal"
    {user}
    placeholders={goLivePlaceholders}
    onchange={(message) => config.set("goLiveMessage", message)}
  />
  <Button disabled={testing === "golive"} onclick={() => test("golive")}>
    {testing === "golive" ? m.common.sending() : m.twitch.eventsTestGolive()}
  </Button>
</PluginCard>

<PluginCard title={m.twitch.eventsTemplatesTitle()} alwaysOpen>
  <div class="space-y-1">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.twitch.eventsSubChannel()}</span>
    <DiscordSelector
      type="channel"
      options={channels}
      selected={config.form.subNotificationChannelId}
      placeholder={m.common.noChannelSelected()}
      onchange={(detail) => config.set("subNotificationChannelId", typeof detail.selected === "string" ? detail.selected : null)}
    />
  </div>
  <SettingField label={m.twitch.eventsSubMessage()} id="tw-sub-message">
    <Input
      id="tw-sub-message"
      rows={3}
      bind:value={config.form.subNotificationMessage}
      placeholder={m.twitch.eventsSubPlaceholder()}
      oninput={() => config.save("subNotificationMessage")}
      onblur={() => config.flush("subNotificationMessage")}
    />
  </SettingField>
  <p class="text-sm" style="color: {$colorStore.muted}">{m.twitch.eventsVarsSub({ variables: eventVariables.sub.join(", ") })}</p>
  <Button disabled={testing === "sub"} onclick={() => test("sub")}>
    {testing === "sub" ? m.common.sending() : m.twitch.eventsTestSub()}
  </Button>

  <div class="space-y-1 pt-2">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.twitch.eventsRaidChannel()}</span>
    <DiscordSelector
      type="channel"
      options={channels}
      selected={config.form.raidNotificationChannelId}
      placeholder={m.common.noChannelSelected()}
      onchange={(detail) => config.set("raidNotificationChannelId", typeof detail.selected === "string" ? detail.selected : null)}
    />
  </div>
  <SettingField label={m.twitch.eventsRaidMessage()} id="tw-raid-message">
    <Input
      id="tw-raid-message"
      rows={3}
      bind:value={config.form.raidNotificationMessage}
      placeholder={m.twitch.eventsRaidPlaceholder()}
      oninput={() => config.save("raidNotificationMessage")}
      onblur={() => config.flush("raidNotificationMessage")}
    />
  </SettingField>
  <p class="text-sm" style="color: {$colorStore.muted}">{m.twitch.eventsVarsRaid({ variables: eventVariables.raid.join(", ") })}</p>
  <Button disabled={testing === "raid"} onclick={() => test("raid")}>
    {testing === "raid" ? m.common.sending() : m.twitch.eventsTestRaid()}
  </Button>
</PluginCard>

{#snippet newButton()}
  <Button onclick={() => (form = blank())}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.common.add()}
  </Button>
{/snippet}

<PluginCard title={m.twitch.redemptionTitle()} actions={newButton} alwaysOpen>
  {#if redemptions.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.twitch.redemptionEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each redemptions as action (action.id)}
        <AlertRow
          title={action.rewardTitle}
          subtitle={m.twitch.redemptionSummary({ channel: channelLabel(action), reply: action.twitchResponse ? m.twitch.redemptionYes() : m.twitch.redemptionNo() })}
          removeLabel={m.common.remove()}
          onopen={() => edit(action)}
          onremove={() => remove(action.rewardTitle)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if form}
  {@const draft = form}
  <Sheet title={m.twitch.redemptionTitle()} onclose={() => (form = null)}>
    <SettingField label={m.twitch.redemptionRewardTitle()} id="tw-redeem-title">
      <Input id="tw-redeem-title" bind:value={draft.rewardTitle} placeholder={m.twitch.redemptionRewardPlaceholder()} />
    </SettingField>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.twitch.redemptionDiscordChannel()}</span>
      <DiscordSelector
        type="channel"
        options={channels}
        selected={draft.discordChannelId}
        placeholder={m.twitch.redemptionNoDiscordPost()}
        onchange={(detail) => (draft.discordChannelId = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <SettingField label={m.twitch.redemptionTwitchReply()} id="tw-redeem-reply">
      <Input id="tw-redeem-reply" rows={3} bind:value={draft.twitchResponse} placeholder={m.twitch.redemptionTwitchReplyPlaceholder()} />
    </SettingField>
    <SettingField label={m.twitch.redemptionDiscordMessage()} id="tw-redeem-message">
      <Input id="tw-redeem-message" rows={3} bind:value={draft.discordMessage} placeholder={m.twitch.redemptionDiscordPlaceholder()} />
    </SettingField>
    <p class="text-sm" style="color: {$colorStore.muted}">{m.twitch.eventsVarsRedemption({ variables: eventVariables.redemption.join(", ") })}</p>
    {#snippet footer()}
      <Button compact onclick={() => (form = null)}>{m.common.cancel()}</Button>
      <Button compact variant="primary" disabled={busy || !draft.rewardTitle.trim()} onclick={save}>
        {busy ? m.common.saving() : m.twitch.redemptionSave()}
      </Button>
    {/snippet}
  </Sheet>
{/if}
