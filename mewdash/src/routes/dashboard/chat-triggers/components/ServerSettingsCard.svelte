<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { chatTriggersApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    guildId: bigint;
    autoSave: AutoSave;
    onerror: (message: string) => void;
  }

  let { guildId, autoSave, onerror }: Props = $props();

  let memberCreate: boolean | null = $state(null);

  async function load() {
    try {
      memberCreate = await chatTriggersApi.getMemberCreate(guildId);
    } catch (err) {
      logger.error("Failed to load member trigger setting:", err);
      onerror(err instanceof Error && err.message ? err.message : m.common.failedToSaveTheSettings());
    }
  }

  function save(enabled: boolean) {
    const previous = memberCreate;
    memberCreate = enabled;
    return autoSave.now("memberCreate", async () => {
      try {
        await chatTriggersApi.setMemberCreate(guildId, enabled);
      } catch (err) {
        memberCreate = previous;
        throw err;
      }
    });
  }

  onMount(() => {
    void load();
  });
</script>

{#if memberCreate !== null}
  <PluginCard title={m.chatTriggers.cardServerTitle()}>
    <SettingToggle id="ct-member-create" label={m.chatTriggers.memberCreate()} checked={memberCreate} onchange={save} />
  </PluginCard>
{/if}
