<script lang="ts">
  import { m } from "$lib/i18n";
  import { chatTriggersApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import EditorGroup from "./editor/EditorGroup.svelte";
  import ReferenceRow from "./ReferenceRow.svelte";

  interface Props {
    guildId: bigint;
    onerror: (message: string) => void;
  }

  let { guildId, onerror }: Props = $props();

  let tokens: string[] = $state([]);
  let placeholdersOpen = $state(false);
  let blocksOpen = $state(false);
  let loaded = false;

  const known = $derived<Record<string, string>>({
    "%user%": m.placeholders.user(),
    "%user.mention%": m.placeholders.userMention(),
    "%user.id%": m.placeholders.userId(),
    "%user.avatar%": m.placeholders.userAvatar(),
    "%server%": m.placeholders.server(),
    "%server.members%": m.placeholders.serverMembers(),
    "%target%": m.chatTriggers.placeholderTarget(),
    "%prompt%": m.chatTriggers.placeholderPrompt(),
    "%regex.1%": m.chatTriggers.placeholderRegex(),
    "%role.mention%": m.chatTriggers.placeholderRole()
  });

  const extraPlaceholders = $derived([
    { syntax: "%counter:name%", description: m.chatTriggers.placeholderCounterRead() },
    { syntax: "%counter:name+%", description: m.chatTriggers.placeholderCounterAdd() },
    { syntax: "%regex.1%", description: m.chatTriggers.placeholderRegex() },
    { syntax: "%target%", description: m.chatTriggers.placeholderTarget() },
    { syntax: "%prompt%", description: m.chatTriggers.placeholderPrompt() }
  ]);

  const placeholderRows = $derived.by(() => {
    const rows = [...extraPlaceholders];
    for (const token of tokens) {
      if (!rows.some(row => row.syntax === token)) rows.push({ syntax: token, description: known[token] ?? "" });
    }
    return rows;
  });

  const blocks = $derived([
    { syntax: "{if(a==b):then|else}", description: m.chatTriggers.blockIf() },
    { syntax: "{set(name):value}", description: m.chatTriggers.blockSet() },
    { syntax: "{get(name)}", description: m.chatTriggers.blockGet() },
    { syntax: "{math:(1+2)*3}", description: m.chatTriggers.blockMath() },
    { syntax: "{upper:text}", description: m.chatTriggers.blockUpper() },
    { syntax: "{lower:text}", description: m.chatTriggers.blockLower() },
    { syntax: "{length:text}", description: m.chatTriggers.blockLength() },
    { syntax: "{replace(a,b):text}", description: m.chatTriggers.blockReplace() },
    { syntax: "{choose:a|b|c}", description: m.chatTriggers.blockChoose() },
    { syntax: "{cmd:name args}", description: m.chatTriggers.blockCmd() },
    { syntax: "{require(role,channel):message}", description: m.chatTriggers.blockRequire() },
    { syntax: "{blacklist(role,channel):message}", description: m.chatTriggers.blockBlacklist() },
    { syntax: "{override}", description: m.chatTriggers.blockOverride() }
  ]);

  const operators = $derived([
    { syntax: "==", description: m.chatTriggers.opEqual() },
    { syntax: "!=", description: m.chatTriggers.opNotEqual() },
    { syntax: ">", description: m.chatTriggers.opGreater() },
    { syntax: "<", description: m.chatTriggers.opLess() },
    { syntax: ">=", description: m.chatTriggers.opGreaterEqual() },
    { syntax: "<=", description: m.chatTriggers.opLessEqual() },
    { syntax: "contains", description: m.chatTriggers.opContains() }
  ]);

  const symbols = $derived([
    { syntax: "+", description: m.chatTriggers.mathAdd() },
    { syntax: "-", description: m.chatTriggers.mathSubtract() },
    { syntax: "*", description: m.chatTriggers.mathMultiply() },
    { syntax: "/", description: m.chatTriggers.mathDivide() },
    { syntax: "%", description: m.chatTriggers.mathModulo() }
  ]);

  async function load() {
    if (loaded) return;
    loaded = true;
    try {
      tokens = await chatTriggersApi.getPlaceholders(guildId);
    } catch (err) {
      loaded = false;
      logger.error("Failed to load trigger reference:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.referenceFailed());
    }
  }

  $effect(() => {
    if (placeholdersOpen) void load();
  });
</script>

{#snippet list(rows: Array<{ syntax: string; description: string }>)}
  <div class="divide-y">
    {#each rows as row (row.syntax)}
      <div style="border-color: {$colorStore.primary}15;">
        <ReferenceRow syntax={row.syntax} description={row.description} />
      </div>
    {/each}
  </div>
{/snippet}

<PluginCard title={m.chatTriggers.cardReferenceTitle()}>
  <EditorGroup title={m.chatTriggers.referencePlaceholders()} bind:open={placeholdersOpen}>
    {@render list(placeholderRows)}
  </EditorGroup>
  <EditorGroup title={m.chatTriggers.referenceBlocks()} bind:open={blocksOpen}>
    <p class="text-sm" style="color: {$colorStore.text}">{m.chatTriggers.referenceIntro()}</p>
    {@render list(blocks)}
    <h4 class="text-sm font-medium pt-2" style="color: {$colorStore.text}">{m.chatTriggers.referenceOperators()}</h4>
    {@render list(operators)}
    <h4 class="text-sm font-medium pt-2" style="color: {$colorStore.text}">{m.chatTriggers.referenceMath()}</h4>
    {@render list(symbols)}
  </EditorGroup>
</PluginCard>
