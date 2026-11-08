<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { inviteTrackingApi, type InviteBreakdown, type InviterInfo } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import { formatNumber } from "$lib/components/stats/format";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import { errorText } from "./inviteModel";

  interface Props {
    guildId: bigint;
    userId: string;
    name: string;
    onchanged: () => void;
    onclose: () => void;
    onerror: (message: string) => void;
  }

  let { guildId, userId, name, onchanged, onclose, onerror }: Props = $props();

  let detail: InviteBreakdown | null = $state(null);
  let inviter: InviterInfo | null = $state(null);
  let regular = $state(0);
  let bonus = $state(0);
  let fake = $state(0);
  let busy = $state(false);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const dirty = $derived(regular !== 0 || bonus !== 0 || fake !== 0);

  async function load() {
    try {
      const id = BigInt(userId);
      const [breakdown, source] = await Promise.all([
        inviteTrackingApi.getBreakdown(guildId, id),
        inviteTrackingApi.getInviter(guildId, id).catch(() => null)
      ]);
      detail = breakdown;
      inviter = source;
    } catch (err) {
      logger.error("Failed to load a member's invites:", err);
      onerror(errorText(err, m.invites.errorLoadMember()));
      onclose();
    }
  }

  async function apply() {
    if (!dirty || busy) return;
    busy = true;
    try {
      detail = await inviteTrackingApi.adjust(guildId, BigInt(userId), { regular, bonus, fake });
      regular = 0;
      bonus = 0;
      fake = 0;
      onchanged();
    } catch (err) {
      logger.error("Failed to adjust a member's invites:", err);
      onerror(errorText(err, m.invites.errorAdjust()));
    } finally {
      busy = false;
    }
  }

  async function reset() {
    const confirmed = await requestConfirmation({
      title: m.invites.confirmResetMemberTitle(),
      message: m.invites.confirmResetMemberMessage({ user: name }),
      confirmText: m.common.reset()
    });
    if (!confirmed) return;
    busy = true;
    try {
      await inviteTrackingApi.resetUser(guildId, BigInt(userId));
      onchanged();
      await load();
    } catch (err) {
      logger.error("Failed to reset a member's invites:", err);
      onerror(errorText(err, m.invites.errorReset()));
    } finally {
      busy = false;
    }
  }

  onMount(() => {
    void load();
  });
</script>

<Sheet title={name} {onclose} size="lg">
  {#if detail}
    <div class="grid grid-cols-2 gap-2">
      <StatTile label={m.common.total()} value={formatNumber(detail.total)} sub={detail.rank ? m.common.rankNumber({ rank: detail.rank }) : m.invites.detailUnranked()} />
      <StatTile label={m.invites.detailRegular()} value={formatNumber(detail.regular)} />
      <StatTile label={m.common.departed()} value={formatNumber(detail.left)} />
      <StatTile label={m.invites.detailFake()} value={formatNumber(detail.fake)} tone={detail.fake > 0 ? "warn" : null} />
      <StatTile label={m.invites.detailBonus()} value={formatNumber(detail.bonus)} />
      <StatTile
        label={m.invites.detailInvitedBy()}
        value={inviter?.inviter?.username ?? (inviter ? inviter.joinType : m.common.unknown())}
        sub={inviter?.inviteCode ? m.invites.detailCode({ code: inviter.inviteCode }) : undefined}
      />
    </div>

    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.invites.detailAdjust()}</h4>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <NumberField id="invites-adjust-regular" label={m.invites.detailRegular()} min={-100000} value={regular} onchange={(value) => (regular = value ?? 0)} />
      <NumberField id="invites-adjust-bonus" label={m.invites.detailBonus()} min={-100000} value={bonus} onchange={(value) => (bonus = value ?? 0)} />
      <NumberField id="invites-adjust-fake" label={m.invites.detailFake()} min={-100000} value={fake} onchange={(value) => (fake = value ?? 0)} />
    </div>
  {:else}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {/if}

  {#snippet footer()}
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy || !detail} onclick={reset}>{m.common.reset()}</button>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !dirty}
      onclick={apply}
    >
      {m.common.apply()}
    </button>
  {/snippet}
</Sheet>
