<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, type TimezoneInfo } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "autoSave" | "notify">;

  let { guildId, autoSave, notify }: Props = $props();

  let zones = $state<TimezoneInfo[]>([]);
  let current = $state<string | null>(null);

  function optionId(timezone: string): string {
    const option = zones.find(
      zone => zone.id === timezone || zone.displayName?.includes(timezone) || zone.id.includes(timezone)
    );
    return option ? option.id : timezone || "UTC";
  }

  async function load() {
    try {
      const [timezone, list] = await Promise.all([
        administrationApi.getGuildTimezone(guildId),
        administrationApi.getTimezones(guildId)
      ]);
      zones = list ?? [];
      const name = (timezone as unknown as { data?: string })?.data ?? timezone ?? "UTC";
      current = optionId(String(name));
    } catch (err) {
      logger.error("Failed to load timezone:", err);
      notify(errorText(err, m.administration.automationLoadFailed()), "error");
    }
  }

  function save(value: string | null) {
    if (!value || value === current) return;
    const previous = current;
    current = value;
    autoSave.now("timezone", async () => {
      try {
        await administrationApi.setGuildTimezone(guildId, { timezoneId: value });
      } catch (err) {
        current = previous;
        throw err;
      }
    });
  }

  void load();
</script>

<PluginCard title={m.administration.automationTimezoneTitle()} alwaysOpen>
  <div class="space-y-1">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.serverTimezone()}</span>
    <DiscordSelector
      type="timezone"
      options={zones.map(zone => ({ id: zone.id, name: zone.displayName, displayName: zone.displayName, offset: zone.offset }))}
      selected={current}
      clearable={false}
      placeholder={m.administration.automationTimezonePlaceholder()}
      onchange={(detail) => save(typeof detail.selected === "string" ? detail.selected : null)}
    />
  </div>
</PluginCard>
