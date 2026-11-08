<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { filterApi, type FilterExtras } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ListField from "../discord/ListField.svelte";
  import NumberField from "../NumberField.svelte";
  import { errorText, idString, nameOf, type Named, type Notify } from "../automodModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  type Limit = { channelId: string; maxLinks: number; windowSeconds: number };

  let { guildId, channels, autoSave, notify }: Props = $props();

  let extras: FilterExtras | null = $state(null);
  let limits: Limit[] = $state([]);
  let picked: string | null = $state(null);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function read(value: FilterExtras) {
    extras = value;
    limits = value.linkLimits.map((x) => ({
      channelId: idString(x.channelId),
      maxLinks: x.maxLinks,
      windowSeconds: x.windowSeconds
    }));
  }

  async function load() {
    try {
      read(await filterApi.getFilterExtras(guildId));
    } catch (err) {
      logger.error("Failed to load filter extras:", err);
      notify(errorText(err, m.automod.errorLoad()), "error");
    }
  }

  function change(key: "normalizeWords" | "inviteNoRolesOnly" | "linkNoRolesOnly", value: boolean) {
    if (!extras) return;
    extras = { ...extras, [key]: value };
    void autoSave.now(`filters:extras:${key}`, async () => {
      try {
        await filterApi.updateFilterExtras(guildId, { [key]: value });
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  function changeDomains(key: "allowedDomains" | "blockedDomains", items: string[]) {
    if (!extras) return;
    extras = { ...extras, [key]: items };
    void autoSave.now(`filters:extras:${key}`, async () => {
      try {
        const saved = await filterApi.updateFilterExtras(guildId, { [key]: items });
        if (extras) extras = { ...extras, [key]: saved[key] };
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  function saveLimit(channelId: string, mode: "now" | "typing") {
    const send = async () => {
      const limit = limits.find((x) => x.channelId === channelId);
      if (!limit) return;
      try {
        await filterApi.setLinkLimit(guildId, BigInt(channelId), limit.maxLinks, limit.windowSeconds);
      } catch (err) {
        await load();
        throw err;
      }
    };
    const key = `filters:limit:${channelId}`;
    if (mode === "typing") autoSave.schedule(key, send);
    else void autoSave.now(key, send);
  }

  function editLimit(channelId: string, changes: Partial<Limit>) {
    limits = limits.map((x) => (x.channelId === channelId ? { ...x, ...changes } : x));
    saveLimit(channelId, "typing");
  }

  function addLimit() {
    if (!picked || limits.some((x) => x.channelId === picked)) return;
    const channelId = picked;
    picked = null;
    limits = [...limits, { channelId, maxLinks: 5, windowSeconds: 30 }];
    saveLimit(channelId, "now");
  }

  function removeLimit(channelId: string) {
    limits = limits.filter((x) => x.channelId !== channelId);
    void autoSave.now(`filters:limit:${channelId}`, async () => {
      try {
        await filterApi.setLinkLimit(guildId, BigInt(channelId), 0, 30);
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  onMount(() => {
    void load();
  });
</script>

{#if extras}
  <PluginCard title={m.automod.extrasWords()} alwaysOpen>
    <ToggleRow
      checked={extras.normalizeWords}
      title={m.automod.extrasNormalize()}
      subtitle={m.automod.extrasNormalizeHint()}
      colors={$colorStore}
      onchange={(value) => change("normalizeWords", value)}
    />
  </PluginCard>

  <PluginCard title={m.automod.extrasLinks()} alwaysOpen>
    <div class="grid gap-2 sm:grid-cols-2">
      <ToggleRow
        checked={extras.linkNoRolesOnly}
        title={m.automod.extrasLinkNoRoles()}
        colors={$colorStore}
        onchange={(value) => change("linkNoRolesOnly", value)}
      />
      <ToggleRow
        checked={extras.inviteNoRolesOnly}
        title={m.automod.extrasInviteNoRoles()}
        colors={$colorStore}
        onchange={(value) => change("inviteNoRolesOnly", value)}
      />
    </div>
    <ListField
      id="filter-allowed-domains"
      label={m.automod.extrasAllowed()}
      items={extras.allowedDomains}
      maxLength={253}
      onchange={(items) => changeDomains("allowedDomains", items)}
    />
    <ListField
      id="filter-blocked-domains"
      label={m.automod.extrasBlocked()}
      items={extras.blockedDomains}
      maxLength={253}
      onchange={(items) => changeDomains("blockedDomains", items)}
    />
  </PluginCard>

  <PluginCard title={m.automod.extrasLimits()} alwaysOpen>
    {#each limits as limit (limit.channelId)}
      <div
        class="rounded-xl border p-3 space-y-3 min-w-0"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="grow min-w-0 truncate text-sm font-medium" style="color: {$colorStore.text}">#{nameOf(channels, limit.channelId)}</span>
          <button
            type="button"
            class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
            style={iconButton}
            aria-label={m.automod.removeAria({ name: nameOf(channels, limit.channelId) })}
            onclick={() => removeLimit(limit.channelId)}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="limit-links-{limit.channelId}"
            label={m.automod.extrasMaxLinks()}
            min={1}
            max={100}
            value={limit.maxLinks}
            onchange={(value) => editLimit(limit.channelId, { maxLinks: value })}
          />
          <NumberField
            id="limit-window-{limit.channelId}"
            label={m.automod.windowSeconds()}
            min={1}
            max={3600}
            value={limit.windowSeconds}
            onchange={(value) => editLimit(limit.channelId, { windowSeconds: value })}
          />
        </div>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.automod.extrasNoLimits()}</p>
    {/each}
    <div class="flex gap-3 items-stretch">
      <div class="grow min-w-0">
        <DiscordSelector
          type="channel"
          options={channels.filter((x) => !limits.some((l) => l.channelId === x.id))}
          selected={picked}
          ariaLabel={m.common.channel()}
          placeholder={m.common.addAChannel()}
          onchange={({ selected }) => (picked = (selected as string) ?? null)}
        />
      </div>
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={!picked}
        onclick={addLimit}
      >
        {m.common.add()}
      </button>
    </div>
  </PluginCard>
{/if}
