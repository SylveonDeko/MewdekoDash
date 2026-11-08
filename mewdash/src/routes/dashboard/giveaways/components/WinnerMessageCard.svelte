<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GiveawaySettings } from "$lib/api/index.ts";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";

  interface Props {
    settings: GiveawaySettings;
    user?: DiscordUser | null;
    onchange: (patch: Partial<GiveawaySettings>, typing?: boolean) => void;
  }

  let { settings, user = null, onchange }: Props = $props();

  const placeholders = $derived([
    { category: m.giveaways.placeholderGroup(), name: "%giveawayitem%", description: m.giveaways.placeholderItem() },
    { category: m.giveaways.placeholderGroup(), name: "%giveawaywinners%", description: m.giveaways.placeholderWinners() },
    { category: m.giveaways.placeholderGroup(), name: "%messagelink%", description: m.giveaways.placeholderLink() },
    { category: m.common.members(), name: "%user%", description: m.placeholders.user() },
    { category: m.common.members(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() }
  ]);
</script>

<PluginCard title={m.giveaways.cardWinnerMessage()} enabled={settings.dmOnWin} alwaysOpen onToggle={(dmOnWin) => onchange({ dmOnWin })}>
  <MessageField
    value={settings.endMessage}
    previewTitle={m.giveaways.cardWinnerMessage()}
    icon="fa-gift"
    {user}
    {placeholders}
    onchange={(endMessage) => onchange({ endMessage }, true)}
  />
</PluginCard>
