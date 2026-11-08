<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    title: string;
    confirmText: string;
    busy: boolean;
    onclose: () => void;
    onconfirm: (reason: string) => void;
  }

  let { title, confirmText, busy, onclose, onconfirm }: Props = $props();

  let reason = $state("");
</script>

<Sheet {title} {onclose}>
  <SettingField label={m.common.reasonOptional()} id="member-design-reason">
    <textarea
      id="member-design-reason"
      rows="3"
      maxlength="300"
      bind:value={reason}
      placeholder={m.designs.memberReasonPlaceholder()}
      class="w-full p-3 rounded-lg border min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    ></textarea>
  </SettingField>

  {#snippet footer()}
    <button type="button" class="px-4 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;" onclick={onclose}>
      {m.common.cancel()}
    </button>
    <button type="button" class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;" disabled={busy} onclick={() => onconfirm(reason.trim())}>
      {confirmText}
    </button>
  {/snippet}
</Sheet>
