<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { verificationApi, type VerificationPermissionChange, type VerificationSettings } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    guildId: bigint;
    channels: Array<{ id: string; name: string }>;
    roles: Array<{ id: string; name: string; color?: number }>;
    autoSave: AutoSave;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, channels, roles, autoSave, onerror, onsuccess }: Props = $props();

  let setting: VerificationSettings | null = $state(null);
  let permissionPlan: VerificationPermissionChange[] | null = $state(null);
  let existingCount: number | null = $state(null);
  let busy = $state(false);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function idOf(value: bigint | null | undefined): string | null {
    return value ? value.toString() : null;
  }

  function payload(value: VerificationSettings): VerificationSettings {
    const big = (id: bigint | null) => (id ? BigInt(id.toString()) : null);
    return {
      ...value,
      channelId: big(value.channelId),
      unverifiedRoleId: big(value.unverifiedRoleId),
      verifiedRoleId: big(value.verifiedRoleId),
      logChannelId: big(value.logChannelId)
    };
  }

  function fail(err: unknown) {
    logger.error("Verification request failed:", err);
    onerror(err instanceof Error ? err.message : m.common.failedToSaveTheSettings());
  }

  async function load() {
    try {
      setting = await verificationApi.get(guildId);
    } catch (err) {
      fail(err);
    }
  }

  function save(change: Partial<VerificationSettings>, key: string) {
    if (!setting) return Promise.resolve();
    const previous = setting;
    const next = { ...setting, ...change };
    setting = next;
    return autoSave.now(`verification:${key}`, async () => {
      try {
        setting = await verificationApi.update(guildId, payload(next));
      } catch (err) {
        setting = previous;
        throw err;
      }
    });
  }

  function saveNumber(key: "maxAttempts" | "timeoutMinutes", raw: string) {
    if (!setting) return;
    const next = { ...setting, [key]: Math.max(1, Math.floor(Number(raw) || 1)) };
    setting = next;
    autoSave.schedule(`verification:${key}`, async () => {
      setting = await verificationApi.update(guildId, payload(next));
    });
  }

  async function run(action: () => Promise<void>) {
    busy = true;
    try {
      await action();
    } catch (err) {
      fail(err);
    } finally {
      busy = false;
    }
  }

  const setup = () =>
    run(async () => {
      setting = await verificationApi.setup(guildId, idOf(setting?.channelId) ? BigInt(idOf(setting?.channelId)!) : null);
      onsuccess(m.multigreets.verifySetupDone());
    });

  const postPanel = () =>
    run(async () => {
      await verificationApi.postPanel(guildId);
      onsuccess(m.multigreets.verifyPanelPosted());
    });

  const previewPermissions = () =>
    run(async () => {
      permissionPlan = await verificationApi.previewPermissions(guildId);
    });

  const applyPermissions = () =>
    run(async () => {
      const result = await verificationApi.applyPermissions(guildId);
      permissionPlan = null;
      onsuccess(m.multigreets.verifyPermissionsDone({ changed: result.changed, failed: result.failed }));
    });

  const restorePermissions = () =>
    run(async () => {
      const result = await verificationApi.restorePermissions(guildId);
      permissionPlan = null;
      onsuccess(m.multigreets.verifyPermissionsDone({ changed: result.changed, failed: result.failed }));
    });

  const countExisting = () =>
    run(async () => {
      existingCount = (await verificationApi.countExisting(guildId)).count;
    });

  const verifyExisting = () =>
    run(async () => {
      const result = await verificationApi.verifyExisting(guildId);
      existingCount = null;
      onsuccess(m.multigreets.verifyExistingDone({ count: result.count }));
    });

  onMount(() => {
    void load();
  });
</script>

{#if setting}
  <PluginCard
    title={m.multigreets.cardVerificationTitle()}
    enabled={setting.enabled}
    alwaysOpen
    onToggle={(on) => save({ enabled: on }, "enabled")}
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingField label={m.multigreets.verifyChannel()} id="verify-channel">
        <DiscordSelector
          id="verify-channel"
          type="channel"
          options={channels}
          selected={idOf(setting.channelId)}
          placeholder={m.common.selectAChannelPlaceholder()}
          onchange={(detail) => save({ channelId: typeof detail.selected === "string" ? BigInt(detail.selected) : null }, "channel")}
        />
      </SettingField>
      <SettingField label={m.common.logChannel()} id="verify-log-channel">
        <DiscordSelector
          id="verify-log-channel"
          type="channel"
          options={channels}
          selected={idOf(setting.logChannelId)}
          placeholder={m.common.noLogChannel()}
          onchange={(detail) => save({ logChannelId: typeof detail.selected === "string" ? BigInt(detail.selected) : null }, "logChannel")}
        />
      </SettingField>
      <SettingField label={m.multigreets.verifyUnverifiedRole()} id="verify-unverified-role">
        <DiscordSelector
          id="verify-unverified-role"
          type="role"
          options={roles}
          selected={idOf(setting.unverifiedRoleId)}
          onchange={(detail) => save({ unverifiedRoleId: typeof detail.selected === "string" ? BigInt(detail.selected) : null }, "unverifiedRole")}
        />
      </SettingField>
      <SettingField label={m.multigreets.verifyVerifiedRole()} id="verify-verified-role">
        <DiscordSelector
          id="verify-verified-role"
          type="role"
          options={roles}
          selected={idOf(setting.verifiedRoleId)}
          onchange={(detail) => save({ verifiedRoleId: typeof detail.selected === "string" ? BigInt(detail.selected) : null }, "verifiedRole")}
        />
      </SettingField>
      <SettingField label={m.multigreets.verifyMaxAttempts()} id="verify-max-attempts">
        <input
          id="verify-max-attempts"
          type="number"
          min="1"
          value={setting.maxAttempts}
          oninput={(e) => saveNumber("maxAttempts", e.currentTarget.value)}
          onblur={() => autoSave.flush("verification:maxAttempts")}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
      <SettingField label={m.multigreets.verifyTimeoutMinutes()} id="verify-timeout">
        <input
          id="verify-timeout"
          type="number"
          min="1"
          value={setting.timeoutMinutes}
          oninput={(e) => saveNumber("timeoutMinutes", e.currentTarget.value)}
          onblur={() => autoSave.flush("verification:timeoutMinutes")}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    </div>

    <SettingToggle
      id="verify-kick-on-fail"
      label={m.multigreets.verifyKickOnFail()}
      checked={setting.kickOnFail}
      onchange={(on) => save({ kickOnFail: on }, "kickOnFail")}
    />

    <div class="flex flex-wrap gap-3">
      <button
        class="flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        disabled={busy}
        onclick={setup}
      >
        <i class="fa-solid fa-shield-check" style="font-size: 16px;" aria-hidden="true"></i>
        {m.multigreets.verifySetup()}
      </button>
      <button class="px-6 rounded-xl min-h-[50px]" style={buttonStyle} disabled={busy || !setting.channelId} onclick={postPanel}>
        {m.multigreets.verifyPostPanel()}
      </button>
      <button class="px-6 rounded-xl min-h-[50px]" style={buttonStyle} disabled={busy} onclick={previewPermissions}>
        {m.multigreets.verifyPreviewPermissions()}
      </button>
      <button class="px-6 rounded-xl min-h-[50px]" style={buttonStyle} disabled={busy} onclick={restorePermissions}>
        {m.multigreets.verifyRestorePermissions()}
      </button>
      <button class="px-6 rounded-xl min-h-[50px]" style={buttonStyle} disabled={busy} onclick={countExisting}>
        {m.multigreets.verifyExisting()}
      </button>
    </div>

    {#if permissionPlan}
      <div class="p-3 rounded-lg space-y-2" style="background: {$colorStore.primary}08;">
        {#if permissionPlan.length === 0}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.multigreets.verifyNothingToChange()}</p>
        {:else}
          <p class="text-sm font-medium" style="color: {$colorStore.text}">
            {m.multigreets.verifyPermissionsPlan({ count: permissionPlan.length })}
          </p>
          <ul class="text-sm space-y-1" style="color: {$colorStore.muted}">
            {#each permissionPlan as change (change.channelId.toString())}
              <li>#{change.channelName}</li>
            {/each}
          </ul>
          <button
            class="flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            disabled={busy}
            onclick={applyPermissions}
          >
            {m.common.apply()}
          </button>
        {/if}
      </div>
    {/if}

    {#if existingCount !== null}
      <div class="flex flex-wrap items-center gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}08;">
        <p class="text-sm" style="color: {$colorStore.text}">{m.multigreets.verifyExistingCount({ count: existingCount })}</p>
        {#if existingCount > 0}
          <button
            class="flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            disabled={busy}
            onclick={verifyExisting}
          >
            {m.multigreets.verifyExistingRun()}
          </button>
        {/if}
      </div>
    {/if}
  </PluginCard>
{/if}
