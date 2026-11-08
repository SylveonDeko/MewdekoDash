<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import type { GuildQuote } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import { userStore } from "$lib/stores/userStore";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    quote: GuildQuote | null;
    onclose: () => void;
    onsave: (keyword: string, text: string) => Promise<boolean>;
  }

  let { quote, onclose, onsave }: Props = $props();

  let keyword = $state(untrack(() => quote?.keyword ?? ""));
  let text = $state(untrack(() => quote?.text ?? ""));
  let saving = $state(false);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function save() {
    saving = true;
    const saved = await onsave(keyword.trim(), text.trim());
    saving = false;
    if (saved) onclose();
  }
</script>

<Sheet title={quote ? m.utility.quotesEditAria() : m.utility.quotesAdd()} {onclose}>
  <SettingField label={m.utility.quotesKeywordAria()} id="quote-keyword">
    <input
      id="quote-keyword"
      type="text"
      maxlength="50"
      bind:value={keyword}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
  </SettingField>
  <SettingField label={m.common.quoteText()} id="quote-text">
    <MessageField
      value={text}
      previewTitle={m.common.quoteText()}
      user={$userStore}
      onchange={(next) => (text = next)}
    />
  </SettingField>

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={onclose}
    >
      {m.common.cancel()}
    </button>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={saving || !keyword.trim() || !text.trim()}
      onclick={save}
    >
      {saving ? m.common.saving() : m.common.save()}
    </button>
  {/snippet}
</Sheet>
