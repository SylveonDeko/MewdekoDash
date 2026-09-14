<!-- lib/components/analytics/tabs/MusicTab.svelte -->
<script lang="ts">
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import AnalyticsTile from "../AnalyticsTile.svelte";
  import BreakdownPanel from "../BreakdownPanel.svelte";
  import Card from "../Card.svelte";
</script>

<div class="space-y-4">
  <div class="grid grid-cols-3 gap-3">
    <AnalyticsTile label="Players" metric="music.players" agg="last" format="int" filters={["bot"]} />
    <AnalyticsTile label="Tracks started" metric="music.track_start" agg="sum" format="compact" filters={["bot"]} />
    <AnalyticsTile label="Errors" metric="music.errors" agg="sum" format="int" filters={["bot"]} sparkTone="crit" />
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Card title="Players by node">
      <AnalyticsChart metric="music.players" agg="last" groupBy="node" filters={["bot"]} type="area" unit="players" />
    </Card>
    <Card title="Tracks started" note="per bucket · by source">
      <AnalyticsChart metric="music.track_start" agg="sum" groupBy="source" max={8} filters={["bot"]} type="area" unit="tracks" totalToggle />
    </Card>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Card title="Errors by kind">
      <AnalyticsChart metric="music.errors" agg="sum" groupBy="kind" max={8} filters={["bot"]} type="bar" stack unit="errors" />
    </Card>
    <Card title="Node state" note="1 connected · 0 down">
      <AnalyticsChart metric="music.node_state" agg="last" groupBy="node" filters={["bot"]} noCompare />
    </Card>
    <Card title="Tracks ended by reason">
      <BreakdownPanel metric="music.track_end" label="reason" filters={["bot"]} max={10} />
    </Card>
  </div>
</div>
