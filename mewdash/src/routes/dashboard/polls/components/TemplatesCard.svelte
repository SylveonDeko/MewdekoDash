<script lang="ts">
  import { m } from "$lib/i18n";
  import { pollApi, type PollTemplateResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import RowActions from "./RowActions.svelte";
  import { errorText } from "./pollModel";

  interface Props {
    guildId: bigint;
    userId: bigint | null;
    templates: PollTemplateResponse[];
    onuse: (template: PollTemplateResponse) => void;
    onchanged: () => Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, userId, templates, onuse, onchanged, onerror }: Props = $props();

  async function remove(template: PollTemplateResponse) {
    if (!userId) return;
    const confirmed = await requestConfirmation({
      message: m.polls.templateDeleteConfirm({ name: template.name }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await pollApi.deleteTemplate(guildId, template.id, userId);
      await onchanged();
    } catch (err) {
      logger.error("Failed to delete template:", err);
      onerror(errorText(err, m.polls.notifyTemplateDeleteFailed()));
    }
  }
</script>

<PluginCard title={m.common.templates()} alwaysOpen>
  {#each templates as template (template.id)}
    <div class="relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={() => onuse(template)}>
        <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{template.name}</span>
        <span class="block text-xs truncate" style="color: {$colorStore.muted}">{template.question}</span>
      </button>
      <RowActions
        name={template.name}
        moreLabel={m.common.moreActions()}
        actions={[
          { label: m.common.use(), icon: "fa-wand-magic-sparkles", run: () => onuse(template) },
          { label: m.common.delete(), icon: "fa-trash", run: () => remove(template) }
        ]}
      />
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.polls.templatesEmpty()}</p>
  {/each}
</PluginCard>
