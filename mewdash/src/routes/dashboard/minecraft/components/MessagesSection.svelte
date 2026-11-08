<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { minecraftApi, type MinecraftServer } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import { eventPlaceholders, parseTemplates, serverPlaceholders, type Placeholder } from "./minecraftModel";

  interface Props {
    guildId: bigint;
    server: MinecraftServer;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onupdate: (server: MinecraftServer) => void;
  }

  let { guildId, server, autoSave, user = null, onupdate }: Props = $props();

  type TemplateKey = "joinDiscord" | "leaveDiscord" | "chatDiscord" | "chatIngame" | "deathDiscord" | "advancementDiscord";

  const initial = untrack(() => server);
  let watchEmbed = $state(initial.customEmbedTemplate ?? "");
  let onlineMessage = $state(initial.customOnlineMessage ?? "");
  let offlineMessage = $state(initial.customOfflineMessage ?? "");
  let templates: Record<string, string> = $state(parseTemplates(initial.eventTemplates));

  const base = $derived(serverPlaceholders());
  const chatExtra = $derived<Placeholder[]>([
    { category: m.minecraft.placeholderCategoryChat(), name: "%mc.player%", description: m.placeholders.mcPlayer() },
    { category: m.minecraft.placeholderCategoryChat(), name: "%mc.avatar%", description: m.placeholders.mcAvatar() },
    { category: m.minecraft.placeholderCategoryChat(), name: "%mc.uuid%", description: m.placeholders.mcUuid() },
    { category: m.minecraft.placeholderCategoryChat(), name: "%mc.message%", description: m.placeholders.mcMessage() }
  ]);
  const playerExtra = $derived<Placeholder[]>(chatExtra.filter(item => item.name !== "%mc.message%"));
  const deathExtra = $derived<Placeholder[]>([
    ...playerExtra,
    { category: m.minecraft.placeholderCategoryDeath(), name: "%mc.death.message%", description: m.placeholders.mcDeathMessage() }
  ]);
  const advancementExtra = $derived<Placeholder[]>([
    ...playerExtra,
    { category: m.minecraft.previewAdvancementTitle(), name: "%mc.advancement%", description: m.placeholders.mcAdvancement() }
  ]);

  const key = (part: string) => `${server.name}:${part}`;

  function saveSingle(part: string, apply: () => Promise<MinecraftServer>, restore: () => void) {
    autoSave.schedule(key(part), async () => {
      try {
        onupdate(await apply());
      } catch (err) {
        restore();
        throw err;
      }
    });
  }

  function changeWatch(value: string) {
    watchEmbed = value;
    saveSingle("embed", () => minecraftApi.setCustomEmbed(guildId, server.name, { template: value.trim() || null }), () => (watchEmbed = server.customEmbedTemplate ?? ""));
  }

  function changeOnline(value: string) {
    onlineMessage = value;
    saveSingle("online", () => minecraftApi.setOnlineMessage(guildId, server.name, value.trim() || null), () => (onlineMessage = server.customOnlineMessage ?? ""));
  }

  function changeOffline(value: string) {
    offlineMessage = value;
    saveSingle("offline", () => minecraftApi.setOfflineMessage(guildId, server.name, value.trim() || null), () => (offlineMessage = server.customOfflineMessage ?? ""));
  }

  function changeTemplate(part: TemplateKey, value: string) {
    templates = { ...templates, [part]: value };
    saveSingle(
      "templates",
      () => {
        const filled = Object.fromEntries(Object.entries(templates).filter(([, text]) => text && text.trim()));
        return minecraftApi.setEventTemplates(guildId, server.name, Object.keys(filled).length ? JSON.stringify(filled) : null);
      },
      () => (templates = parseTemplates(server.eventTemplates))
    );
  }

  const events = $derived<Array<{ part: TemplateKey; label: string; title: string; icon: string; placeholder: string; extra: Placeholder[] }>>([
    { part: "joinDiscord", label: m.minecraft.templateJoin(), title: m.minecraft.previewJoinTitle(), icon: "fa-right-to-bracket", placeholder: m.minecraft.placeholderTemplateJoin(), extra: playerExtra },
    { part: "leaveDiscord", label: m.minecraft.templateLeave(), title: m.minecraft.previewLeaveTitle(), icon: "fa-right-from-bracket", placeholder: m.minecraft.placeholderTemplateLeave(), extra: playerExtra },
    { part: "chatDiscord", label: m.minecraft.templateChatDiscord(), title: m.minecraft.previewChatTitle(), icon: "fa-comment", placeholder: m.minecraft.placeholderTemplateChat(), extra: chatExtra },
    { part: "deathDiscord", label: m.minecraft.templateDeath(), title: m.minecraft.previewDeathTitle(), icon: "fa-skull", placeholder: m.minecraft.placeholderTemplateDeath(), extra: deathExtra },
    { part: "advancementDiscord", label: m.minecraft.templateAdvancement(), title: m.minecraft.previewAdvancementTitle(), icon: "fa-trophy", placeholder: m.minecraft.placeholderTemplateAdvancement(), extra: advancementExtra }
  ]);
</script>

<PluginCard title={m.minecraft.sectionStatusMessages()} alwaysOpen>
  <SettingField label={m.minecraft.fieldWatchEmbed()} id="mc-watch-embed">
    <MessageField value={watchEmbed} previewTitle={m.minecraft.previewStatusTitle()} icon="fa-server" {user} placeholder={m.minecraft.placeholderWatchEmbed()} placeholders={base} onchange={changeWatch} />
  </SettingField>
  <SettingField label={m.minecraft.fieldOnlineAlert()} id="mc-online-message">
    <MessageField value={onlineMessage} previewTitle={m.minecraft.previewOnlineTitle()} icon="fa-circle-check" {user} placeholder={m.minecraft.placeholderOnlineAlert()} placeholders={base} onchange={changeOnline} />
  </SettingField>
  <SettingField label={m.minecraft.fieldOfflineAlert()} id="mc-offline-message">
    <MessageField value={offlineMessage} previewTitle={m.minecraft.previewOfflineTitle()} icon="fa-circle-exclamation" {user} placeholder={m.minecraft.placeholderOfflineAlert()} placeholders={base} onchange={changeOffline} />
  </SettingField>
</PluginCard>

<PluginCard title={m.minecraft.templatesTitle()} alwaysOpen>
  {#each events as event (event.part)}
    <SettingField label={event.label} id="mc-template-{event.part}">
      <MessageField
        value={templates[event.part]}
        previewTitle={event.title}
        icon={event.icon}
        {user}
        placeholder={event.placeholder}
        placeholders={eventPlaceholders(event.extra)}
        onchange={(value) => changeTemplate(event.part, value)}
      />
    </SettingField>
  {/each}
  <SettingField label={m.minecraft.templateChatIngame()} id="mc-template-ingame">
    <input
      id="mc-template-ingame"
      type="text"
      value={templates.chatIngame ?? ""}
      placeholder={m.minecraft.placeholderTemplateIngame()}
      oninput={(e) => changeTemplate("chatIngame", e.currentTarget.value)}
      onblur={() => autoSave.flush(key("templates"))}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
    <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.minecraft.placeholdersLabel()} %user%, %message%, %channel%</p>
  </SettingField>
</PluginCard>
