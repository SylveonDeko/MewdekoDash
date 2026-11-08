<script lang="ts">
  import { m } from "$lib/i18n";
  import { customVoiceApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { colorStore } from "$lib/stores/colorStore";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import { errorText, type Named } from "./model";

  interface Props {
    guildId: bigint;
    members: Named[];
    autoSave: AutoSave;
    notify: (message: string, type?: "success" | "error") => void;
  }

  let { guildId, members, autoSave, notify }: Props = $props();

  let userId: string | null = $state(null);
  let loading = $state(false);
  let form: { name: string; limit: number | null; bitrate: number | null } | null = $state(null);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function pick(selected: string | string[] | null) {
    await autoSave.flush("prefs");
    userId = typeof selected === "string" ? selected : null;
    form = null;
    if (!userId) return;
    const id = userId;
    loading = true;
    try {
      const prefs = await customVoiceApi.getCustomVoiceUserPreferences(guildId, BigInt(id));
      if (userId !== id) return;
      form = {
        name: prefs?.defaultName ?? "",
        limit: prefs?.defaultUserLimit ?? null,
        bitrate: prefs?.defaultBitrate ?? null
      };
    } catch (err) {
      logger.error("Failed to load user preferences:", err);
      notify(errorText(err, m.customvoice.prefErrorNotFound()), "error");
    } finally {
      loading = false;
    }
  }

  function save() {
    if (!form || !userId) return;
    const id = BigInt(userId);
    const payload = {
      defaultName: form.name.trim() || null,
      defaultUserLimit: form.limit,
      defaultBitrate: form.bitrate
    };
    autoSave.schedule("prefs", () => customVoiceApi.updateCustomVoiceUserPreferences(guildId, id, payload));
  }

  function reset() {
    if (!form) return;
    form = { name: "", limit: null, bitrate: null };
    save();
    void autoSave.flush("prefs");
  }
</script>

<PluginCard title={m.customvoice.prefsTitle()} alwaysOpen>
  <div>
    <span id="cv-pref-member" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.member()}</span>
    <DiscordSelector type="user" options={members} selected={userId} ariaLabelledby="cv-pref-member"
                     onchange={({ selected }) => pick(selected)} />
  </div>

  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {:else if form}
    <div onfocusout={() => autoSave.flush("prefs")} class="space-y-4 min-w-0">
      <SettingField label={m.customvoice.prefsName()} id="cv-pref-name">
        <input id="cv-pref-name" type="text" value={form.name} maxlength="100"
               placeholder={m.common.useServerDefault()}
               oninput={(e) => { if (form) { form.name = e.currentTarget.value; save(); } }}
               class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
      </SettingField>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberField id="cv-pref-limit" label={m.common.defaultUserLimit()} value={form.limit} min={0} max={99} nullable
                     placeholder={m.common.serverDefault()}
                     onchange={(v) => { if (form) { form.limit = v; save(); } }} />
        <NumberField id="cv-pref-bitrate" label={m.customvoice.prefsBitrate()} value={form.bitrate} min={8} max={384} nullable
                     placeholder={m.common.serverDefault()}
                     onchange={(v) => { if (form) { form.bitrate = v; save(); } }} />
      </div>
      <button type="button" class="px-5 rounded-xl min-h-[50px]"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              onclick={reset}>{m.customvoice.prefsReset()}</button>
    </div>
  {/if}
</PluginCard>
