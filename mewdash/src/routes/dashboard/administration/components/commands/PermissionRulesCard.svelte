<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, clientApi, type Module } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, type Named, type TabProps } from "../toolsModel";

  interface Props extends Pick<TabProps, "guildId" | "textChannels" | "roles" | "notify"> {
    modules: Module[];
  }

  let { guildId, textChannels, roles, notify, modules }: Props = $props();

  interface Rule {
    id: number;
    primaryTarget: number;
    primaryTargetId: bigint;
    secondaryTarget: number;
    secondaryTargetName: string | null;
    isCustomCommand: boolean;
    state: boolean;
    index: number;
  }

  const PRIMARY = { User: 0, Channel: 1, Role: 2, Server: 3, Category: 4 } as const;
  const SECONDARY = { Module: 0, Command: 1, AllModules: 2 } as const;

  const blank = () => ({ primary: "3", targetId: "", secondary: "2", name: "", state: "deny" });

  let rules = $state<Rule[]>([]);
  let loading = $state(true);
  let busy = $state(false);
  let draft = $state<ReturnType<typeof blank> | null>(null);
  let formError = $state("");
  let categories = $state<Named[]>([]);

  const primaryOptions = $derived([
    { id: "3", name: m.administration.automationPermissionsManagementPrimaryServer() },
    { id: "2", name: m.administration.automationPermissionsManagementPrimaryRole() },
    { id: "1", name: m.administration.automationPermissionsManagementPrimaryChannel() },
    { id: "4", name: m.administration.automationPermissionsManagementPrimaryCategory() },
    { id: "0", name: m.administration.automationPermissionsManagementPrimaryUser() }
  ]);
  const secondaryOptions = $derived([
    { id: "2", name: m.common.allModules() },
    { id: "0", name: m.administration.automationPermissionsManagementSecondaryModule() },
    { id: "1", name: m.administration.automationPermissionsManagementSecondaryCommand() }
  ]);
  const stateOptions = $derived([
    { id: "allow", name: m.administration.automationPermissionsManagementStateAllow() },
    { id: "deny", name: m.common.deny() }
  ]);
  const moduleOptions = $derived(modules.map(mod => ({ id: mod.name, name: mod.name })));
  const commandOptions = $derived(
    modules.flatMap(mod => mod.commands.map(c => ({ id: c.commandName, name: c.commandName, label: `${c.commandName} (${mod.name})` })))
  );
  const sorted = $derived(rules.slice().sort((a, b) => a.index - b.index));

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const iconStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);

  function summary(rule: Rule): string {
    const id = String(rule.primaryTargetId);
    let scope = m.common.everyone();
    switch (rule.primaryTarget) {
      case PRIMARY.User:
        scope = m.common.userFallback({ id });
        break;
      case PRIMARY.Channel:
        scope = `#${textChannels.find(c => String(c.id) === id)?.name ?? id}`;
        break;
      case PRIMARY.Role:
        scope = `@${roles.find(r => String(r.id) === id)?.name ?? id}`;
        break;
      case PRIMARY.Category:
        scope = m.administration.automationPermissionsManagementScopeCategory({ name: categories.find(c => String(c.id) === id)?.name ?? id });
        break;
      case PRIMARY.Server:
        scope = m.administration.commandsScopeServer();
        break;
    }
    let target = m.administration.automationPermissionsManagementTargetAll();
    if (rule.secondaryTarget === SECONDARY.Module) {
      target = m.administration.automationPermissionsManagementTargetModule({ name: rule.secondaryTargetName ?? "" });
    } else if (rule.secondaryTarget === SECONDARY.Command) {
      target = m.administration.automationPermissionsManagementTargetCommand({ name: rule.secondaryTargetName ?? "" });
    }
    return m.administration.automationPermissionsManagementRuleSummary({ target, scope });
  }

  async function loadCategories() {
    if (categories.length > 0) return;
    try {
      const list = await clientApi.getCategories(guildId);
      categories = (list as unknown as Array<{ id: bigint | string; name: string }>).map(c => ({ id: String(c.id), name: c.name }));
    } catch (err) {
      logger.error("Failed to load categories:", err);
    }
  }

  async function load() {
    try {
      const data = await administrationApi.getPermissions(guildId);
      rules = data?.permissions ?? [];
      void loadCategories();
    } catch (err) {
      logger.error("Failed to load permissions:", err);
      notify(errorText(err, m.administration.automationPermissionsManagementLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function run(action: () => Promise<unknown>, failed: string) {
    try {
      await action();
      await load();
    } catch (err) {
      logger.error("Permission change failed:", err);
      notify(errorText(err, failed), "error");
    }
  }

  async function move(rule: Rule, to: number) {
    if (to < 1 || to >= sorted.length) return;
    await run(() => administrationApi.movePermission(guildId, { from: rule.index, to }), m.administration.commandsSaveFailed());
  }

  async function remove(rule: Rule) {
    const text = summary(rule);
    const confirmed = await requestConfirmation({
      message: rule.state
        ? m.administration.automationPermissionsManagementRemoveConfirmAllow({ index: rule.index, summary: text })
        : m.administration.automationPermissionsManagementRemoveConfirmDeny({ index: rule.index, summary: text }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    await run(() => administrationApi.removePermission(guildId, rule.index), m.administration.commandsSaveFailed());
  }

  async function reset() {
    const confirmed = await requestConfirmation({
      message: m.administration.automationPermissionsManagementResetCount({ count: sorted.length - 1 }),
      confirmText: m.common.resetAll()
    });
    if (!confirmed) return;
    await run(() => administrationApi.resetPermissions(guildId), m.administration.commandsSaveFailed());
  }

  function startNew() {
    draft = blank();
    formError = "";
    void loadCategories();
  }

  async function save() {
    if (!draft || busy) return;
    const primary = Number(draft.primary);
    const secondary = Number(draft.secondary);
    const targetId = draft.targetId.trim();
    const name = draft.name.trim();
    if (primary !== PRIMARY.Server && !targetId) {
      formError = m.administration.automationPermissionsManagementErrorPickTarget();
      return;
    }
    if (primary === PRIMARY.User && !/^\d{15,22}$/.test(targetId)) {
      formError = m.common.invalidUserId();
      return;
    }
    if (secondary !== SECONDARY.AllModules && !name) {
      formError =
        secondary === SECONDARY.Module
          ? m.administration.automationPermissionsManagementErrorPickModule()
          : m.administration.automationPermissionsManagementErrorPickCommand();
      return;
    }
    busy = true;
    try {
      await administrationApi.addPermission(guildId, {
        primaryTarget: primary,
        primaryTargetId: primary === PRIMARY.Server ? "0" : targetId,
        secondaryTarget: secondary,
        secondaryTargetName: secondary === SECONDARY.AllModules ? "*" : name.toLowerCase(),
        isCustomCommand: false,
        state: draft.state === "allow",
        index: 0
      });
      draft = null;
      notify(m.administration.commandsRuleSaved(), "success");
      await load();
    } catch (err) {
      logger.error("Failed to add permission:", err);
      formError = errorText(err, m.administration.automationPermissionsManagementErrorAddFailed());
    } finally {
      busy = false;
    }
  }

  void load();
</script>

{#snippet headerActions()}
  {#if sorted.length > 1}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={quietStyle} onclick={reset}>
      {m.common.resetAll()}
    </button>
  {/if}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={quietStyle} onclick={startNew}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.administration.automationPermissionsManagementAddRule()}
  </button>
{/snippet}

<PluginCard title={m.administration.automationPermissionsManagementTitle()} actions={headerActions} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else}
    {#if sorted.length <= 1}
      <p class="py-2" style="color: {$colorStore.muted}">{m.administration.automationPermissionsManagementEmptyRules()}</p>
    {/if}
    <div class="space-y-2">
      {#each sorted as rule, position (rule.id)}
        <div class="flex flex-wrap items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex items-center gap-2 shrink-0 pl-1">
            <span class="text-xs font-mono px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">#{rule.index}</span>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background: {rule.state ? $colorStore.secondary : $colorStore.accent}25; color: {$colorStore.text};">
              {rule.state ? m.administration.automationPermissionsManagementStateAllow() : m.common.deny()}
            </span>
          </div>
          <span class="grow min-w-[10rem] basis-40 px-1 text-sm break-words" style="color: {$colorStore.text}">
            {rule.index === 0 ? m.administration.commandsDefaultRule() : summary(rule)}
          </span>
          {#if rule.index !== 0}
            <div class="flex items-center gap-1 shrink-0 ml-auto">
              <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40" style={iconStyle} disabled={rule.index <= 1} aria-label={m.administration.automationPermissionsManagementMoveUp()} onclick={() => move(rule, rule.index - 1)}>
                <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
              </button>
              <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40" style={iconStyle} disabled={position >= sorted.length - 1} aria-label={m.administration.automationPermissionsManagementMoveDown()} onclick={() => move(rule, rule.index + 1)}>
                <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
              </button>
              <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={iconStyle} aria-label={m.administration.commandsRuleRemoveAria({ index: rule.index })} onclick={() => remove(rule)}>
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if draft}
  {@const form = draft}
  <Sheet title={m.administration.automationPermissionsManagementAddRule()} onclose={() => (draft = null)} size="lg">
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.action()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-sliders"
        ariaLabel={m.common.action()}
        options={stateOptions}
        selected={form.state}
        searchable={false}
        clearable={false}
        onchange={(detail) => { if (typeof detail.selected === "string") form.state = detail.selected; }}
      />
    </div>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.administration.automationPermissionsManagementLabelWhat()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-layer-group"
        ariaLabel={m.administration.automationPermissionsManagementLabelWhat()}
        options={secondaryOptions}
        selected={form.secondary}
        searchable={false}
        clearable={false}
        onchange={(detail) => { if (typeof detail.selected === "string") { form.secondary = detail.selected; form.name = ""; } }}
      />
    </div>
    {#if form.secondary === "0"}
      <div class="space-y-1">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.module()}</span>
        <DiscordSelector
          type="custom"
          customIcon="fa-layer-group"
          ariaLabel={m.common.module()}
          options={moduleOptions}
          selected={form.name || null}
          clearable={false}
          placeholder={m.administration.automationPermissionsManagementSelectModule()}
          onchange={(detail) => { if (typeof detail.selected === "string") form.name = detail.selected; }}
        />
      </div>
    {:else if form.secondary === "1"}
      <div class="space-y-1">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.command()}</span>
        <DiscordSelector
          type="custom"
          customIcon="fa-bolt"
          ariaLabel={m.common.command()}
          options={commandOptions}
          selected={form.name || null}
          clearable={false}
          placeholder={m.administration.automationPermissionsManagementSearchCommands()}
          onchange={(detail) => { if (typeof detail.selected === "string") form.name = detail.selected; }}
        />
      </div>
    {/if}
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.for()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-users"
        ariaLabel={m.common.for()}
        options={primaryOptions}
        selected={form.primary}
        searchable={false}
        clearable={false}
        onchange={(detail) => { if (typeof detail.selected === "string") { form.primary = detail.selected; form.targetId = ""; } }}
      />
    </div>
    {#if form.primary === "2"}
      <div class="space-y-1">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.role()}</span>
        <DiscordSelector
          type="role"
          options={roles}
          selected={form.targetId || null}
          clearable={false}
          placeholder={m.common.selectRolePlaceholder()}
          onchange={(detail) => { if (typeof detail.selected === "string") form.targetId = detail.selected; }}
        />
      </div>
    {:else if form.primary === "1"}
      <div class="space-y-1">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.channel()}</span>
        <DiscordSelector
          type="channel"
          options={textChannels}
          selected={form.targetId || null}
          clearable={false}
          placeholder={m.common.selectChannelPlaceholder()}
          onchange={(detail) => { if (typeof detail.selected === "string") form.targetId = detail.selected; }}
        />
      </div>
    {:else if form.primary === "4"}
      <div class="space-y-1">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.category()}</span>
        <DiscordSelector
          type="custom"
          customIcon="fa-folder"
          ariaLabel={m.common.category()}
          options={categories}
          selected={form.targetId || null}
          clearable={false}
          placeholder={m.administration.automationPermissionsManagementSelectCategory()}
          onchange={(detail) => { if (typeof detail.selected === "string") form.targetId = detail.selected; }}
        />
      </div>
    {:else if form.primary === "0"}
      <SettingField label={m.common.userId()} id="perm-user-id">
        <input
          id="perm-user-id"
          type="text"
          inputmode="numeric"
          bind:value={form.targetId}
          placeholder={m.administration.automationPermissionsManagementUserIdPlaceholder()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
      </SettingField>
    {/if}
    {#if formError}
      <p class="text-sm" role="alert" style="color: {$colorStore.text}">
        <i class="fa-solid fa-circle-exclamation mr-1" style="color: {$colorStore.accent}" aria-hidden="true"></i>{formError}
      </p>
    {/if}
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={quietStyle} onclick={() => (draft = null)}>
        {m.common.cancel()}
      </button>
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={save}>
        {m.administration.automationPermissionsManagementAddRule()}
      </button>
    {/snippet}
  </Sheet>
{/if}
