<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, type TimezoneInfo } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import NumberField from "./NumberField.svelte";
  import type { Change, Form } from "./birthdayModel";

  interface Props {
    guildId: bigint;
    form: Form;
    autoSave: AutoSave;
    onchange: Change;
  }

  let { guildId, form, autoSave, onchange }: Props = $props();

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
    }
  }

  function save(value: string | null) {
    if (!value || value === current) return;
    const previous = current;
    current = value;
    void autoSave.now("timezone", async () => {
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

<PluginCard title={m.birthday.timeTitle()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.common.serverTimezone()} id="birthday-timezone">
      <DiscordSelector
        id="birthday-timezone"
        type="timezone"
        options={zones.map(zone => ({ id: zone.id, name: zone.displayName, displayName: zone.displayName, offset: zone.offset }))}
        selected={current}
        clearable={false}
        placeholder={m.common.selectTimezonePlaceholder()}
        onchange={(detail) => save(typeof detail.selected === "string" ? detail.selected : null)}
      />
    </SettingField>
    <NumberField id="birthday-hour" label={m.birthday.announcementHour()} min={0} max={23} value={form.hour} onchange={(value) => onchange("hour", value ?? 0, "typing")} />
  </div>
</PluginCard>
