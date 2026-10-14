<!-- lib/components/analytics/tabs/MusicTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTile from "../AnalyticsTile.svelte";
  import BreakdownPanel from "../BreakdownPanel.svelte";
  import Card from "../Card.svelte";
</script>

<div class="space-y-4">
  <div class="grid grid-cols-3 gap-3">
    <AnalyticsTile label={m.common.players()} metric="music.players" agg="last" format="int" filters={["bot"]} />
    <AnalyticsTile label={m.analytics.tabMusicTracksStarted()} metric="music.track_start" agg="sum" format="compact" filters={["bot"]} />
    <AnalyticsTile label={m.common.errors()} metric="music.errors" agg="sum" format="int" filters={["bot"]} sparkTone="crit" />
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title={m.analytics.tabMusicPlayersByNode()}>
      <AnalyticsChart metric="music.players" agg="last" groupBy="node" filters={["bot"]} type="area" unit={m.analytics.unitPlayers()} />
    </Card>
    <Card title={m.analytics.tabMusicTracksStarted()} note={m.analytics.tabMusicPerBucketBySource()}>
      <AnalyticsChart metric="music.track_start" agg="sum" groupBy="source" max={8} filters={["bot"]} type="area" unit={m.analytics.unitTracks()} totalToggle />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title={m.analytics.tabMusicErrorsByKind()}>
      <AnalyticsChart metric="music.errors" agg="sum" groupBy="kind" max={8} filters={["bot"]} type="bar" stack unit={m.analytics.unitErrors()} />
    </Card>
    <Card title={m.analytics.tabMusicNodeState()} note={m.analytics.tabMusic1Connected0Down()}>
      <AnalyticsChart metric="music.node_state" agg="last" groupBy="node" filters={["bot"]} noCompare />
    </Card>
    <Card title={m.analytics.tabMusicTracksEndedByReason()}>
      <BreakdownPanel metric="music.track_end" label="reason" filters={["bot"]} max={10} />
    </Card>
  </div>
</div>
