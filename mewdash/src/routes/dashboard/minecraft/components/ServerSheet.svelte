<script lang="ts">
  import { m } from "$lib/i18n";
  import type { MinecraftServer, MinecraftStatus } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import SubTabs from "$lib/components/ui/SubTabs.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import StatusSection from "./StatusSection.svelte";
  import SettingsSection from "./SettingsSection.svelte";
  import MessagesSection from "./MessagesSection.svelte";
  import RconSection from "./RconSection.svelte";
  import PluginSection from "./PluginSection.svelte";
  import type { Named, Notify } from "./minecraftModel";

  interface Props {
    guildId: bigint;
    server: MinecraftServer;
    status: MinecraftStatus | undefined;
    channels: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    refreshing: boolean;
    notify: Notify;
    onupdate: (server: MinecraftServer) => void;
    onrefresh: () => void;
    onsetdefault: () => void;
    onremove: () => void;
    onclose: () => void;
  }

  let { guildId, server, status, channels, autoSave, user = null, refreshing, notify, onupdate, onrefresh, onsetdefault, onremove, onclose }: Props = $props();

  type Section = "status" | "settings" | "messages" | "integrations";

  let section: Section = $state("status");

  const sections = $derived<Array<{ id: Section; label: string; icon: string }>>([
    { id: "status", label: m.common.status(), icon: "fa-signal" },
    { id: "settings", label: m.minecraft.sheetTabSettings(), icon: "fa-sliders" },
    { id: "messages", label: m.minecraft.sheetTabMessages(), icon: "fa-message" },
    { id: "integrations", label: m.minecraft.sheetTabIntegrations(), icon: "fa-plug" }
  ]);

  const headerButton = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);
</script>

<Sheet title={server.name} size="lg" {onclose}>
  {#snippet actions()}
    <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-50" style={headerButton} aria-label={m.common.refresh()} disabled={refreshing} onclick={onrefresh}>
      <i class="fa-solid fa-satellite-dish" aria-hidden="true"></i>
    </button>
    {#if !server.isDefault}
      <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={headerButton} aria-label={m.minecraft.setDefault()} onclick={onsetdefault}>
        <i class="fa-solid fa-star" aria-hidden="true"></i>
      </button>
    {/if}
    <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={headerButton} aria-label={m.common.remove()} onclick={onremove}>
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
    </button>
  {/snippet}

  <SubTabs tabs={sections} active={section} ariaLabel={server.name} onselect={(id) => (section = id as Section)} />

  {#if section === "status"}
    <StatusSection {status} {refreshing} />
  {:else if section === "settings"}
    <SettingsSection {guildId} {server} {channels} {autoSave} {onupdate} />
  {:else if section === "messages"}
    <MessagesSection {guildId} {server} {autoSave} {user} {onupdate} />
  {:else}
    <RconSection {guildId} {server} onlinePlayers={status?.playerList ?? []} {autoSave} {notify} {onupdate} />
    <PluginSection {guildId} {server} {notify} {onupdate} />
  {/if}
</Sheet>
