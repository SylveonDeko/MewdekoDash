<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { autoReactionsApi, type AutoReaction, type AutoReactionList } from "$lib/api/channelmessages/channelmessages";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import ListRow from "./ListRow.svelte";
  import ReactionSheet from "./ReactionSheet.svelte";
  import { emojiLabel, errorText, idString, type Shared } from "./model";

  interface Props {
    shared: Shared;
    autoSave: AutoSave;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { shared, autoSave, onerror, onsuccess }: Props = $props();

  let rules: AutoReaction[] = $state([]);
  let limits = $state({ maxEmojis: 10, maxWords: 25, maxWordLength: 50 });
  let managerRole: string | null = $state(null);
  let loading = $state(true);
  let editingId: number | null = $state(null);
  let creating = $state(false);
  let busy = $state(false);
  let problem: string | null = $state(null);

  const sorted = $derived([...rules].sort((a, b) => a.priority - b.priority || a.id - b.id));
  const editing = $derived(rules.find(rule => rule.id === editingId) ?? null);

  const channelOptions = $derived([
    ...shared.channels.map(channel => ({ id: channel.id, name: channel.name })),
    ...shared.forums.map(forum => ({ id: forum.id, name: forum.name, label: m.channelMessages.forumOption({ name: forum.name }) }))
  ]);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function channelName(id: bigint | string): string {
    const key = idString(id);
    return channelOptions.find(channel => channel.id === key)?.name ?? key;
  }

  function apply(list: AutoReactionList) {
    rules = list.rules;
    limits = { maxEmojis: list.maxEmojis, maxWords: list.maxWords, maxWordLength: list.maxWordLength };
    managerRole = list.managerRoleId === null ? null : idString(list.managerRoleId);
  }

  async function load() {
    try {
      apply(await autoReactionsApi.list(shared.guildId));
    } catch (err) {
      logger.error("Failed to load auto reactions:", err);
      onerror(errorText(err, m.channelMessages.errorLoad()));
    } finally {
      loading = false;
    }
  }

  onMount(() => void load());

  function badges(rule: AutoReaction): string[] {
    const list: string[] = [];
    if (rule.messageTypes !== "Any") list.push(rule.messageTypes);
    if (rule.requiredWords.length || rule.skipWords.length) list.push(m.channelMessages.badgeWords());
    if (rule.allowedRoleIds.length || rule.ignoredRoleIds.length || rule.ignoredUserIds.length) list.push(m.channelMessages.badgeFilters());
    return list;
  }

  function close() {
    void autoSave.flush();
    editingId = null;
    creating = false;
    problem = null;
  }

  function save(rule: AutoReaction, typing: boolean) {
    rules = rules.map(x => (x.id === rule.id ? rule : x));
    const send = async () => {
      try {
        await autoReactionsApi.update(shared.guildId, rule);
      } catch (err) {
        await load();
        throw err;
      }
    };
    if (typing) autoSave.schedule(`reaction:${rule.id}`, send);
    else void autoSave.now(`reaction:${rule.id}`, send);
  }

  function toggle(rule: AutoReaction, enabled: boolean) {
    save({ ...rule, enabled }, false);
  }

  async function create(rule: AutoReaction) {
    busy = true;
    problem = null;
    try {
      const { id: _id, priority: _priority, ...body } = rule;
      const created = await autoReactionsApi.create(shared.guildId, body);
      await load();
      creating = false;
      editingId = created.id;
      onsuccess(m.channelMessages.notifyReactionCreated());
    } catch (err) {
      logger.error("Failed to create auto reaction:", err);
      problem = errorText(err, m.channelMessages.errorSave());
    } finally {
      busy = false;
    }
  }

  async function remove(rule: AutoReaction) {
    const confirmed = await requestConfirmation({
      message: m.channelMessages.reactionDeleteConfirm({ channel: channelName(rule.channelId) }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await autoReactionsApi.remove(shared.guildId, rule.id);
      rules = rules.filter(x => x.id !== rule.id);
      if (editingId === rule.id) editingId = null;
      onsuccess(m.channelMessages.notifyDeleted());
    } catch (err) {
      logger.error("Failed to delete auto reaction:", err);
      onerror(errorText(err, m.channelMessages.errorDelete()));
    }
  }

  async function move(rule: AutoReaction, step: number) {
    const ids = sorted.map(x => x.id);
    const from = ids.indexOf(rule.id);
    const to = from + step;
    if (to < 0 || to >= ids.length) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    try {
      rules = await autoReactionsApi.reorder(shared.guildId, ids);
    } catch (err) {
      logger.error("Failed to reorder auto reactions:", err);
      onerror(errorText(err, m.channelMessages.errorSave()));
    }
  }

  function setManager(selected: string | string[] | null) {
    const next = typeof selected === "string" && selected ? selected : null;
    const before = managerRole;
    managerRole = next;
    void autoSave.now("reaction:manager", async () => {
      try {
        await autoReactionsApi.setManagerRole(shared.guildId, next === null ? null : BigInt(next));
      } catch (err) {
        managerRole = before;
        throw err;
      }
    });
  }
</script>

{#snippet newButton()}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style={buttonStyle}
    onclick={() => {
      problem = null;
      creating = true;
    }}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.channelMessages.newReaction()}
  </button>
{/snippet}

<PluginCard title={m.channelMessages.reactionsTitle()} alwaysOpen actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if sorted.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-face-smile" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.channelMessages.reactionsEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each sorted as rule, index (rule.id)}
        <ListRow
          title="#{channelName(rule.channelId)}"
          subtitle={rule.emojis.map(emojiLabel).join(" ")}
          badges={badges(rule)}
          enabled={rule.enabled}
          name={channelName(rule.channelId)}
          onedit={() => (editingId = rule.id)}
          ondelete={() => remove(rule)}
          ontoggle={(enabled) => toggle(rule, enabled)}
          onup={index > 0 ? () => move(rule, -1) : undefined}
          ondown={index < sorted.length - 1 ? () => move(rule, 1) : undefined}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

<PluginCard title={m.channelMessages.managerTitle()} alwaysOpen>
  <SettingField label={m.channelMessages.managerRole()} id="cm-react-manager">
    <DiscordSelector
      id="cm-react-manager"
      type="role"
      options={shared.roles}
      selected={managerRole}
      clearable
      placeholder={m.common.selectRolePlaceholder()}
      onchange={(detail) => setManager(detail.selected)}
    />
  </SettingField>
</PluginCard>

{#if editing}
  {#key editingId}
    <ReactionSheet
      rule={editing}
      {channelOptions}
      roles={shared.roles}
      members={shared.members}
      emojis={shared.emojis}
      {limits}
      {autoSave}
      creating={false}
      problem={null}
      onchange={save}
      oncreate={() => {}}
      onclose={close}
    />
  {/key}
{/if}

{#if creating}
  <ReactionSheet
    rule={null}
    {channelOptions}
    roles={shared.roles}
    members={shared.members}
    emojis={shared.emojis}
    {limits}
    {autoSave}
    creating={busy}
    {problem}
    onchange={() => {}}
    oncreate={create}
    onclose={close}
  />
{/if}
