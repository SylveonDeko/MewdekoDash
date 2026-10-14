<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";

  let {
    protectionStatus,
    selfAssignableRoles,
    autoAssignRoles,
    commandCooldowns,
    staffRole,
    memberRole,
    guildTimezone,
    gameVoiceChannel,
    availableRoles,
    guildChannels,
    activeTab = $bindable()
  } = $props();

  function getRoleName(roleId: bigint | null): string {
    if (!roleId) return m.common.none();
    const role = availableRoles.find((r: any) => BigInt(r.id) === roleId);
    return role ? role.name : m.common.roleFallback({ id: roleId.toString() });
  }

  function getChannelName(channelId: bigint | null): string {
    if (!channelId) return m.common.none();
    const channel = guildChannels.find((c: any) => BigInt(c.id) === channelId);
    return channel ? channel.name : m.common.channelFallback({ id: channelId.toString() });
  }

  function getProtectionName(key: string): string {
    switch (key) {
      case "antiRaid": return m.common.antiRaid();
      case "antiSpam": return m.common.antiSpam();
      case "antiAlt": return m.common.antiAlt();
      case "antiMassMention": return m.common.antiMassMention();
      case "antiPattern": return m.administration.overviewAntiPattern();
      case "antiMassPost": return m.administration.overviewAntiMassPost();
      case "antiPostChannel": return m.administration.overviewAntiPostChannel();
      case "antiImageHash": return m.administration.overviewAntiImageHash();
      case "antiExternalApp": return m.administration.overviewAntiExternalApp();
      default: return key;
    }
  }
</script>

<div class="w-full space-y-6" in:fly={{ y: 20, duration: 300 }}>

  <!-- Quick Stats Cards -->
  <div class="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
    <!-- Protection Status -->
    <div
      class=" rounded-2xl border p-4 sm:p-6 shadow-2xl transition-all hover:scale-[1.02] cursor-pointer"
      onclick={() => activeTab = 'protection'}
      onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activeTab = 'protection'; } }}
      role="button"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.primary}30;"
      tabindex="0">
      <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div class="p-1.5 sm:p-2 rounded-lg" style="background: {$colorStore.primary}20;">
          <i class="fa-utility-duo fa-regular fa-shield"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        </div>
        <h3 class="font-semibold text-sm sm:text-base" style="color: {$colorStore.text}">{m.common.protection()}</h3>
      </div>
      <div class="space-y-2">
        <div class="text-2xl font-bold" style="color: {$colorStore.primary}">
          {Object.values(protectionStatus).filter((p: any) => p?.enabled).length}/7
        </div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.overviewSystemsActive()}</div>
      </div>
    </div>

    <!-- Role Management -->
    <div class=" rounded-2xl border p-6 shadow-2xl transition-all hover:scale-[1.02]"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.secondary}30;">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 rounded-lg" style="background: {$colorStore.secondary}20;">
          <i class="fa-utility-duo fa-regular fa-users"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        </div>
        <h3 class="font-semibold" style="color: {$colorStore.text}">{m.common.roles()}</h3>
      </div>
      <div class="space-y-2">
        <div class="text-2xl font-bold" style="color: {$colorStore.secondary}">
          {selfAssignableRoles?.roles?.length || 0}
        </div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.overviewSelfAssignable()}</div>
      </div>
    </div>

    <!-- Auto-Assign Roles -->
    <div class=" rounded-2xl border p-6 shadow-2xl transition-all hover:scale-[1.02]"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.accent}30;">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 rounded-lg" style="background: {$colorStore.accent}20;">
          <i class="fa-utility-duo fa-regular fa-users"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        </div>
        <h3 class="font-semibold" style="color: {$colorStore.text}">{m.common.autoAssign()}</h3>
      </div>
      <div class="space-y-2">
        <div class="text-2xl font-bold" style="color: {$colorStore.accent}">
          {(autoAssignRoles.normalRoles?.length || 0) + (autoAssignRoles.botRoles?.length || 0)}
        </div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.overviewActiveRules()}</div>
      </div>
    </div>

    <!-- Command Cooldowns -->
    <div class=" rounded-2xl border p-6 shadow-2xl transition-all hover:scale-[1.02]"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.primary}30;">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 rounded-lg" style="background: {$colorStore.primary}20;">
          <i class="fa-utility-duo fa-regular fa-clock"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
        </div>
        <h3 class="font-semibold" style="color: {$colorStore.text}">{m.administration.overviewCooldowns()}</h3>
      </div>
      <div class="space-y-2">
        <div class="text-2xl font-bold" style="color: {$colorStore.primary}">
          {commandCooldowns.length}
        </div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.common.commands()}</div>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="rounded-2xl border p-6 shadow-2xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
              border-color: {$colorStore.primary}30;">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-bolt"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.quickActions()}</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        class="p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] focus:scale-105"
        onclick={() => activeTab = 'protection'}
        style="border-color: {$colorStore.primary}30; background: linear-gradient(135deg, {$colorStore.primary}10, {$colorStore.secondary}10);"
      >
        <div class="flex items-center gap-3 mb-2">
          <i class="fa-utility-duo fa-regular fa-shield"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <span class="font-medium" style="color: {$colorStore.text}">{m.administration.overviewConfigureProtection()}</span>
        </div>
        <p class="text-sm" style="color: {$colorStore.muted}">
          {m.administration.overviewConfigureProtectionHint()}
        </p>
      </button>

      <button
        class="p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] focus:scale-105"
        onclick={() => activeTab = 'roles'}
        style="border-color: {$colorStore.secondary}30; background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10);"
      >
        <div class="flex items-center gap-3 mb-2">
          <i class="fa-utility-duo fa-regular fa-users"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <span class="font-medium" style="color: {$colorStore.text}">{m.common.permManageRoles()}</span>
        </div>
        <p class="text-sm" style="color: {$colorStore.muted}">
          {m.administration.overviewManageRolesHint()}
        </p>
      </button>

      <button
        class="p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] focus:scale-105"
        onclick={() => activeTab = 'automation'}
        style="border-color: {$colorStore.accent}30; background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.secondary}10);"
      >
        <div class="flex items-center gap-3 mb-2">
          <i class="fa-utility-duo fa-regular fa-gear"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <span class="font-medium" style="color: {$colorStore.text}">{m.common.serverSettings()}</span>
        </div>
        <p class="text-sm" style="color: {$colorStore.muted}">
          {m.administration.overviewServerSettingsHint()}
        </p>
      </button>
    </div>
  </div>

  <!-- Server Health Overview -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Current Configuration -->
    <div class="rounded-2xl border p-6 shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.primary}30;">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-globe"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        </div>
        <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.overviewServerConfiguration()}</h3>
      </div>

      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span style="color: {$colorStore.muted}">{m.administration.overviewStaffRole()}</span>
          <span style="color: {$colorStore.text}">{getRoleName(staffRole)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span style="color: {$colorStore.muted}">{m.administration.overviewMemberRole()}</span>
          <span style="color: {$colorStore.text}">{getRoleName(memberRole)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span style="color: {$colorStore.muted}">{m.common.timezoneLabel()}</span>
          <span style="color: {$colorStore.text}">{guildTimezone}</span>
        </div>
        <div class="flex justify-between items-center">
          <span style="color: {$colorStore.muted}">{m.administration.overviewGameVoiceChannel()}</span>
          <span style="color: {$colorStore.text}">{getChannelName(gameVoiceChannel)}</span>
        </div>
      </div>
    </div>

    <!-- Protection Summary -->
    <div class="rounded-2xl border p-6 shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.primary}30;">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <i class="fa-utility-duo fa-regular fa-shield"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        </div>
        <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.overviewProtectionStatus()}</h3>
      </div>

      <div class="space-y-3">
        {#each Object.entries(protectionStatus) as [key, status] (key)}
          {@const s = status as any}
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">
              {m.administration.overviewStatusLabel({ name: getProtectionName(key) })}
            </span>
            <span class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full"
                   style="background: {s?.enabled ? $colorStore.primary : $colorStore.muted}40;"></div>
              <span style="color: {s?.enabled ? $colorStore.primary : $colorStore.muted}">
                {s?.enabled ? m.common.active() : m.common.disabled()}
              </span>
            </span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
