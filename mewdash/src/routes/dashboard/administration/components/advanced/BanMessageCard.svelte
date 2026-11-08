<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "autoSave" | "notify" | "user">;

  let { guildId, autoSave, notify, user }: Props = $props();

  let message = $state("");
  let saved = "";
  let loaded = $state(false);

  async function load() {
    try {
      const data = await administrationApi.getBanMessage(guildId);
      const text = typeof data === "string" ? data : ((data as unknown as { message?: string })?.message ?? "");
      message = text;
      saved = text;
    } catch (err) {
      logger.error("Failed to load ban message:", err);
      notify(errorText(err, m.administration.advancedLoadFailed()), "error");
    } finally {
      loaded = true;
    }
  }

  function change(next: string) {
    message = next;
    autoSave.schedule("banMessage", async () => {
      try {
        await administrationApi.setBanMessage(guildId, { message: next });
        saved = next;
      } catch (err) {
        message = saved;
        throw err;
      }
    });
  }

  void load();
</script>

<PluginCard title={m.administration.advancedBanMessageTitle()} alwaysOpen>
  {#if loaded}
    <MessageField
      value={message}
      previewTitle={m.administration.advancedBanMessageTitle()}
      icon="fa-comment"
      {user}
      placeholder={m.administration.advancedBanMessagePlaceholder()}
      onchange={change}
    />
  {/if}
</PluginCard>
