<script lang="ts">
  import { m } from "$lib/i18n";
  import { designsApi } from "$lib/api/index.ts";
  import { MemberDesignWho } from "$lib/api/designs/models";
  import type { MemberDesignSettings, MemberDesignSettingsRequest } from "$lib/api/designs/models";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import NumberField from "./NumberField.svelte";
  import type { Named, Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    roles: Named[];
    autoSave: AutoSave;
    notify: Notify;
    /** Changes whenever the moderation list does */
    version: number;
  }

  let { guildId, roles, autoSave, notify, version }: Props = $props();

  let settings = $state<MemberDesignSettings | null>(null);
  let saved: MemberDesignSettings | null = null;

  const customRoles = $derived(roles.filter((r) => r.id !== $currentGuild?.id?.toString()));
  const whoOptions = $derived([
    { id: MemberDesignWho.Everyone.toString(), name: m.common.everyone() },
    { id: MemberDesignWho.Roles.toString(), name: m.designs.memberWhoRoles() },
    { id: MemberDesignWho.Level.toString(), name: m.designs.memberWhoLevel() }
  ]);
  const backgroundOptions = $derived([
    { id: "presets", name: m.designs.memberBackgroundsPresets() },
    { id: "uploads", name: m.designs.memberBackgroundsUploads() }
  ]);

  async function load() {
    try {
      const loaded = await designsApi.getMemberSettings(guildId);
      saved = loaded;
      if (settings) {
        settings.uploadsUsed = loaded.uploadsUsed;
        settings.uploadsMax = loaded.uploadsMax;
        settings.pending = loaded.pending;
      } else {
        settings = { ...loaded };
      }
    } catch (err) {
      logger.error("Failed to load the member design settings", err);
      notify(m.designs.notifyLoadFailed(), "error");
    }
  }

  function change(key: string, request: MemberDesignSettingsRequest, delayed = false) {
    if (!settings) return;
    Object.assign(settings, request);
    const save = async () => {
      try {
        const updated = await designsApi.updateMemberSettings(guildId, request);
        saved = updated;
        if (settings) {
          settings.uploadsUsed = updated.uploadsUsed;
          settings.uploadsMax = updated.uploadsMax;
          settings.pending = updated.pending;
        }
      } catch (err) {
        if (settings && saved) {
          const restore = Object.fromEntries(Object.keys(request).map((k) => [k, saved![k as keyof MemberDesignSettings]]));
          Object.assign(settings, restore);
        }
        throw err;
      }
    };
    if (delayed) autoSave.schedule(key, save);
    else void autoSave.now(key, save);
  }

  $effect(() => {
    void version;
    void load();
  });
</script>

{#if settings}
  <PluginCard
    title={m.designs.linkTitle()}
    enabled={settings.enabled}
    onToggle={(value) => change("memberEnabled", { enabled: value })}
  >
    <div class="space-y-4 min-w-0" onfocusout={() => void autoSave.flush()}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SettingField label={m.designs.memberWho()} id="member-design-who">
          <DiscordSelector
            id="member-design-who"
            type="custom"
            options={whoOptions}
            selected={settings.who.toString()}
            searchable={false}
            clearable={false}
            customIcon="fa-user-check"
            ariaLabel={m.designs.memberWho()}
            onchange={({ selected }) => change("memberWho", { who: Number(selected) as MemberDesignWho })}
          />
        </SettingField>

        <SettingField label={m.xp.backgrounds()} id="member-design-backgrounds">
          <DiscordSelector
            id="member-design-backgrounds"
            type="custom"
            options={backgroundOptions}
            selected={settings.uploads ? "uploads" : "presets"}
            searchable={false}
            clearable={false}
            customIcon="fa-image"
            ariaLabel={m.xp.backgrounds()}
            onchange={({ selected }) => change("memberUploads", { uploads: selected === "uploads" })}
          />
        </SettingField>
      </div>

      {#if settings.who === MemberDesignWho.Roles}
        <SettingField label={m.common.roles()} id="member-design-roles">
          <DiscordSelector
            id="member-design-roles"
            type="role"
            options={customRoles}
            multiple
            selected={settings.roleIds.map((id) => id.toString())}
            placeholder={m.common.pickRolePlaceholder()}
            ariaLabel={m.common.roles()}
            onchange={({ selected }) =>
              change("memberRoles", { roleIds: (Array.isArray(selected) ? selected : []).map((id) => BigInt(id)) })}
          />
        </SettingField>
      {:else if settings.who === MemberDesignWho.Level}
        <NumberField
          id="member-design-level"
          label={m.designs.memberMinLevel()}
          value={settings.minLevel}
          min={1}
          max={1000}
          onchange={(value) => change("memberLevel", { minLevel: value ?? 1 }, true)}
        />
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <NumberField
          id="member-design-cost"
          label={m.designs.memberCost()}
          hint={m.designs.memberCostHint()}
          value={settings.cost}
          min={0}
          max={1000000000}
          onchange={(value) => change("memberCost", { cost: value ?? 0 }, true)}
        />
        {#if settings.uploads}
          <ToggleRow
            checked={settings.review}
            title={m.designs.memberReview()}
            colors={$colorStore}
            class="min-h-[50px]"
            onchange={(value) => change("memberReview", { review: value })}
          />
        {/if}
      </div>

      <p class="text-sm tabular-nums" style="color: {$colorStore.muted}">
        {m.designs.memberUploadsUsed({ used: settings.uploadsUsed, max: settings.uploadsMax })}
      </p>
    </div>
  </PluginCard>
{/if}
