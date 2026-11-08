<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { TabProps } from "../toolsModel";
  import AutoBanRolesCard from "../roles/AutoBanRolesCard.svelte";
  import ReactionRolesCard from "../roles/ReactionRolesCard.svelte";
  import SelfAssignableRolesCard from "../roles/SelfAssignableRolesCard.svelte";
  import VoiceChannelRolesCard from "../roles/VoiceChannelRolesCard.svelte";

  let { guildId, textChannels, voiceChannels, roles, autoSave, notify, user }: TabProps = $props();
</script>

<a
  href="/dashboard/multigreets"
  class="flex items-center justify-between gap-3 px-4 rounded-xl min-h-[44px]"
  style="background: {$colorStore.primary}08; color: {$colorStore.text};"
>
  <span class="truncate">{m.administration.rolesJoinRolesMoved()}</span>
  <i class="fa-solid fa-arrow-right shrink-0" style="color: {$colorStore.primary}" aria-hidden="true"></i>
</a>

<SelfAssignableRolesCard {guildId} {roles} {autoSave} {notify} />
<ReactionRolesCard {guildId} {roles} {textChannels} {notify} {user} />
<VoiceChannelRolesCard {guildId} {roles} {voiceChannels} {notify} />
<AutoBanRolesCard {guildId} {roles} {notify} />
