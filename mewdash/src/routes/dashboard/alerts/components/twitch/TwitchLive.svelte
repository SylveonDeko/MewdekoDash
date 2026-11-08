<script lang="ts">
  import { m } from "$lib/i18n";
  import { twitchApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import type { Notify } from "./twitchModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
    onhealth: () => void;
  }

  type Action = "chat" | "marker" | "clip" | "poll" | "timeout" | "ban" | "unban" | "delete";

  let { guildId, notify, onhealth }: Props = $props();

  let running: Action | null = $state(null);
  let chatMessage = $state("");
  let markerDescription = $state("");
  let pollTitle = $state("");
  let pollChoices = $state(`${m.common.yes()}\n${m.common.no()}`);
  let pollDurationSeconds = $state(60);
  let username = $state("");
  let durationSeconds = $state(600);
  let reason = $state("");
  let messageId = $state("");

  async function run(action: Action) {
    running = action;
    try {
      let result;
      if (action === "chat") result = await twitchApi.sendChatMessage(guildId, { message: chatMessage });
      else if (action === "marker") result = await twitchApi.createMarker(guildId, { description: markerDescription || null });
      else if (action === "clip") result = await twitchApi.createClip(guildId);
      else if (action === "poll") {
        result = await twitchApi.createPoll(guildId, {
          title: pollTitle,
          choices: pollChoices.split("\n").map(choice => choice.trim()).filter(Boolean),
          durationSeconds: Number(pollDurationSeconds) || 60
        });
      } else if (action === "unban") result = await twitchApi.unmoderateUser(guildId, { username });
      else if (action === "delete") result = await twitchApi.deleteChatMessage(guildId, { messageId });
      else {
        result = await twitchApi.moderateUser(guildId, {
          username,
          durationSeconds: action === "timeout" ? Number(durationSeconds) || 600 : null,
          reason: reason || null
        });
      }
      notify(result.url ? `${result.message} ${result.url}` : result.message, result.success ? "success" : "error");
    } catch (err) {
      logger.error(`Failed to run Twitch action ${action}:`, err);
      notify(m.twitch.notifyActionFailed(), "error");
    } finally {
      running = null;
      onhealth();
    }
  }
</script>

<PluginCard title={m.twitch.liveSendChat()} alwaysOpen>
  <Input rows={3} bind:value={chatMessage} label={m.twitch.liveSendChat()} placeholder={m.twitch.liveChatPlaceholder()} />
  <Button variant="primary" disabled={running === "chat" || !chatMessage.trim()} onclick={() => run("chat")}>
    {running === "chat" ? m.common.sending() : m.twitch.liveSendChat()}
  </Button>
</PluginCard>

<PluginCard title={m.twitch.liveMarkerClip()} alwaysOpen>
  <Input bind:value={markerDescription} label={m.twitch.liveMarkerClip()} placeholder={m.twitch.liveMarkerPlaceholder()} />
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Button disabled={running === "marker"} onclick={() => run("marker")}>
      {running === "marker" ? m.twitch.liveMarking() : m.twitch.liveCreateMarker()}
    </Button>
    <Button disabled={running === "clip"} onclick={() => run("clip")}>
      {running === "clip" ? m.twitch.liveClipping() : m.twitch.liveCreateClip()}
    </Button>
  </div>
</PluginCard>

<PluginCard title={m.common.poll()} alwaysOpen>
  <Input bind:value={pollTitle} label={m.common.poll()} placeholder={m.twitch.livePollTitlePlaceholder()} />
  <Input rows={4} bind:value={pollChoices} label={m.twitch.livePollChoicesPlaceholder()} placeholder={m.twitch.livePollChoicesPlaceholder()} />
  <Input type="number" min={15} max={1800} bind:value={pollDurationSeconds} label={m.twitch.livePollChoicesPlaceholder()} />
  <Button variant="primary" disabled={running === "poll" || !pollTitle.trim()} onclick={() => run("poll")}>
    {running === "poll" ? m.common.creating() : m.twitch.liveCreatePoll()}
  </Button>
</PluginCard>

<PluginCard title={m.features.categoryModeration()} alwaysOpen>
  <Input bind:value={username} label={m.twitch.linksTwitchUsername()} placeholder={m.twitch.linksTwitchUsername()} />
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Input type="number" min={1} max={1209600} bind:value={durationSeconds} label={m.common.timeout()} />
    <Input bind:value={reason} label={m.common.reason()} placeholder={m.common.reason()} />
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <Button disabled={running === "timeout" || !username.trim()} onclick={() => run("timeout")}>{m.common.timeout()}</Button>
    <Button variant="danger" disabled={running === "ban" || !username.trim()} onclick={() => run("ban")}>{m.common.actionBan()}</Button>
    <Button disabled={running === "unban" || !username.trim()} onclick={() => run("unban")}>{m.common.unban()}</Button>
  </div>
  <Input bind:value={messageId} label={m.twitch.liveMessageIdPlaceholder()} placeholder={m.twitch.liveMessageIdPlaceholder()} />
  <Button variant="danger" disabled={running === "delete" || !messageId.trim()} onclick={() => run("delete")}>
    {m.twitch.liveDeleteMessage()}
  </Button>
</PluginCard>
