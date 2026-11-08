<script lang="ts">
  import { m } from "$lib/i18n";
  import { minecraftApi, type MinecraftServer } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type Notify } from "./minecraftModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
    onadded: (server: MinecraftServer) => void;
  }

  let { guildId, notify, onadded }: Props = $props();

  let name = $state("");
  let address = $state("");
  let port = $state(25565);
  let serverType = $state("0");
  let queryPort = $state(0);
  let busy = $state(false);

  const typeOptions = $derived([
    { id: "0", name: m.minecraft.serverTypeJava(), icon: "fa-mug-hot" },
    { id: "1", name: m.minecraft.serverTypeBedrock(), icon: "fa-mobile-screen" },
    { id: "2", name: m.minecraft.serverTypeGeyser(), icon: "fa-shuffle" }
  ]);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const ready = $derived(name.trim() !== "" && address.trim() !== "" && port >= 1 && port <= 65535 && queryPort >= 0 && queryPort <= 65535);

  async function add() {
    if (busy) return;
    if (!ready) {
      notify(m.minecraft.notifyNameAddressRequired(), "error");
      return;
    }
    busy = true;
    try {
      const server = await minecraftApi.addServer(guildId, {
        name: name.trim(),
        address: address.trim(),
        port,
        serverType: Number(serverType),
        queryPort
      });
      notify(m.minecraft.notifyServerAdded({ name: server.name }));
      name = "";
      address = "";
      port = 25565;
      serverType = "0";
      queryPort = 0;
      onadded(server);
    } catch (err) {
      logger.error("Failed to add server:", err);
      notify(errorText(err, m.minecraft.notifyAddFailed()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.minecraft.addServer()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <SettingField label={m.placeholders.serverName()} id="mc-add-name">
      <input id="mc-add-name" type="text" bind:value={name} placeholder={m.minecraft.addNamePlaceholder()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
    </SettingField>
    <SettingField label={m.minecraft.fieldAddress()} id="mc-add-address">
      <input id="mc-add-address" type="text" autocapitalize="none" bind:value={address} placeholder={m.minecraft.addAddressPlaceholder()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
    </SettingField>
    <SettingField label={m.minecraft.fieldPort()} id="mc-add-port">
      <input id="mc-add-port" type="number" inputmode="numeric" min="1" max="65535" bind:value={port} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
    </SettingField>
    <SettingField label={m.minecraft.addFieldType()} id="mc-add-type">
      <DiscordSelector
        id="mc-add-type"
        type="custom"
        customIcon="fa-tag"
        options={typeOptions}
        selected={serverType}
        clearable={false}
        placeholder={m.minecraft.addTypePlaceholder()}
        onchange={(detail) => {
          if (typeof detail.selected === "string") serverType = detail.selected;
        }}
      />
    </SettingField>
    <SettingField label={m.minecraft.fieldQueryPortAdd()} id="mc-add-query">
      <input id="mc-add-query" type="number" inputmode="numeric" min="0" max="65535" bind:value={queryPort} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
    </SettingField>
  </div>

  <button
    type="button"
    class="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    disabled={busy || !ready}
    onclick={add}
  >
    <i class="fa-solid {busy ? 'fa-spinner fa-spin' : 'fa-plus'}" aria-hidden="true"></i>
    {busy ? m.common.adding() : m.minecraft.addServer()}
  </button>
</PluginCard>
