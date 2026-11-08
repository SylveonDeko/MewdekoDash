<script lang="ts">
  import { m } from "$lib/i18n";
  import { automationsApi, type AutomationTemplate } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, label, type EditorContext, type Notify } from "./automationsModel";

  interface Props {
    guildId: bigint;
    templates: AutomationTemplate[];
    ctx: EditorContext;
    userId?: string;
    notify: Notify;
    oncreated: () => void;
  }

  let { guildId, templates, ctx, userId, notify, oncreated }: Props = $props();

  const uid = $props.id();

  let chosen = $state<AutomationTemplate | null>(null);
  let values = $state<Record<string, string>>({});
  let busy = $state(false);

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const ready = $derived(
    chosen !== null && chosen.parameters.every((x) => !x.required || Boolean(values[x.name]))
  );

  function key(id: string): string {
    return id.split("-").map((x) => x[0].toUpperCase() + x.slice(1)).join("");
  }

  function open(template: AutomationTemplate) {
    values = {};
    chosen = template;
  }

  function pick(name: string, detail: { selected: string | string[] | null }) {
    values[name] = typeof detail.selected === "string" ? detail.selected : "";
  }

  async function create() {
    if (!chosen || busy || !ready) return;
    busy = true;
    try {
      const result = await automationsApi.createFromTemplate(guildId, chosen.id, {
        ...(userId ? { creatorId: BigInt(userId) } : {}),
        ...(values.channel ? { channelId: BigInt(values.channel) } : {}),
        ...(values.role ? { roleId: BigInt(values.role) } : {}),
        ...(values.user ? { userId: BigInt(values.user) } : {})
      });
      chosen = null;
      notify(m.automations.templateCreated());
      if (result.setupError) notify(result.setupError, "error");
      oncreated();
    } catch (err) {
      logger.error("Failed to create from template:", err);
      notify(errorText(err, m.automations.errorTemplate()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.automations.templatesTitle()} alwaysOpen>
  <div class="grid gap-2 sm:grid-cols-2">
    {#each templates as template (template.id)}
      <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="grow min-w-0 px-2 py-1">
          <span class="block text-sm font-semibold" style="color: {$colorStore.text}">
            {label(`template${key(template.id)}Name`, template.name)}
          </span>
          <span class="block text-sm" style="color: {$colorStore.muted}">
            {label(`template${key(template.id)}Description`, template.description)}
          </span>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
          style={quietStyle}
          aria-label={m.automations.useTemplateAria({ name: label(`template${key(template.id)}Name`, template.name) })}
          onclick={() => open(template)}
        >
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
      </div>
    {/each}
  </div>
</PluginCard>

{#if chosen}
  {@const template = chosen}
  <Sheet title={label(`template${key(template.id)}Name`, template.name)} onclose={() => (chosen = null)}>
    {#each template.parameters as parameter (parameter.name)}
      {@const id = `${uid}-${parameter.name}`}
      <SettingField label={label(`param${parameter.name[0].toUpperCase()}${parameter.name.slice(1)}`, parameter.name)} {id} required={parameter.required}>
        {#if parameter.kind === "Channel"}
          <DiscordSelector
            {id}
            type="channel"
            options={ctx.channels}
            selected={values[parameter.name] || null}
            placeholder={m.common.selectAChannelPlaceholder()}
            onchange={(detail) => pick(parameter.name, detail)}
          />
        {:else if parameter.kind === "Role"}
          <DiscordSelector
            {id}
            type="role"
            options={ctx.roles}
            selected={values[parameter.name] || null}
            placeholder={m.common.selectARolePlaceholder()}
            onchange={(detail) => pick(parameter.name, detail)}
          />
        {:else}
          <DiscordSelector
            {id}
            type="user"
            options={ctx.members}
            selected={values[parameter.name] || null}
            placeholder={m.automations.selectMember()}
            onchange={(detail) => pick(parameter.name, detail)}
          />
        {/if}
      </SettingField>
    {/each}
    {#snippet footer()}
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style={buttonStyle}
        disabled={busy || !ready}
        onclick={create}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.automations.createButton()}
      </button>
    {/snippet}
  </Sheet>
{/if}
