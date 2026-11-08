<script lang="ts">
  import { m } from "$lib/i18n";
  import { formsApi } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    guildId: bigint;
    emojis: GuildEmojiInfo[];
    approveEmote: string | null;
    rejectEmote: string | null;
    autoSave: AutoSave;
  }

  let { guildId, emojis, approveEmote = $bindable(), rejectEmote = $bindable(), autoSave }: Props = $props();

  function pick(selected: unknown): string | null {
    return typeof selected === "string" && selected ? selected : null;
  }

  function save(next: { approve: string | null; reject: string | null }) {
    const previous = { approve: approveEmote, reject: rejectEmote };
    approveEmote = next.approve;
    rejectEmote = next.reject;
    void autoSave.now("reviewEmotes", async () => {
      try {
        await formsApi.setReviewEmotes(guildId, { approveEmote: next.approve, rejectEmote: next.reject });
      } catch (err) {
        logger.error("Failed to save the review emotes:", err);
        approveEmote = previous.approve;
        rejectEmote = previous.reject;
        throw err;
      }
    });
  }
</script>

<PluginCard title={m.forms.settingsGuildReviewButtons()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <SettingField label={m.forms.settingsApproveEmote()} id="default-approve-emote">
      <EmojiPicker
        id="default-approve-emote"
        guildEmojis={emojis}
        selected={approveEmote}
        multiple={false}
        placeholder={m.forms.settingsGuildUseBuiltin()}
        onchange={({ selected }) => save({ approve: pick(selected), reject: rejectEmote })}
      />
    </SettingField>
    <SettingField label={m.forms.settingsRejectEmote()} id="default-reject-emote">
      <EmojiPicker
        id="default-reject-emote"
        guildEmojis={emojis}
        selected={rejectEmote}
        multiple={false}
        placeholder={m.forms.settingsGuildUseBuiltin()}
        onchange={({ selected }) => save({ approve: approveEmote, reject: pick(selected) })}
      />
    </SettingField>
  </div>
  <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.settingsGuildSubtitle()}</p>
</PluginCard>
