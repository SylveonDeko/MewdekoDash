<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "roles" | "autoSave" | "notify">;

  let { guildId, roles, autoSave, notify }: Props = $props();

  let staff = $state<string | null>(null);
  let member = $state<string | null>(null);

  function idOf(value: bigint | null | undefined): string | null {
    return value && value !== 0n ? String(value) : null;
  }

  async function load() {
    try {
      const [staffRole, memberRole] = await Promise.all([
        administrationApi.getStaffRole(guildId),
        administrationApi.getMemberRole(guildId)
      ]);
      staff = idOf(staffRole);
      member = idOf(memberRole);
    } catch (err) {
      logger.error("Failed to load server roles:", err);
      notify(errorText(err, m.administration.automationLoadFailed()), "error");
    }
  }

  function saveStaff(value: string | null) {
    if (!value || value === staff) return;
    const previous = staff;
    staff = value;
    autoSave.now("staffRole", async () => {
      try {
        await administrationApi.setStaffRole(guildId, BigInt(value));
      } catch (err) {
        staff = previous;
        throw err;
      }
    });
  }

  function saveMember(value: string | null) {
    if (!value || value === member) return;
    const previous = member;
    member = value;
    autoSave.now("memberRole", async () => {
      try {
        await administrationApi.setMemberRole(guildId, BigInt(value));
      } catch (err) {
        member = previous;
        throw err;
      }
    });
  }

  void load();
</script>

<PluginCard title={m.administration.automationServerRolesTitle()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="space-y-1 min-w-0">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.staffRole()}</span>
      <DiscordSelector
        type="role"
        options={roles}
        selected={staff}
        clearable={false}
        placeholder={m.administration.automationServerRolesStaffPlaceholder()}
        onchange={(detail) => saveStaff(typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <div class="space-y-1 min-w-0">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.administration.automationServerRolesMember()}</span>
      <DiscordSelector
        type="role"
        options={roles}
        selected={member}
        clearable={false}
        placeholder={m.administration.automationServerRolesMemberPlaceholder()}
        onchange={(detail) => saveMember(typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
  </div>
</PluginCard>
