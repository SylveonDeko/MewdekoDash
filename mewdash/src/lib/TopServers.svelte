<script lang="ts">
  import { onMount } from "svelte";

  let guilds = [];
  let fetched = false;

  onMount(async () => {
    const response = await fetch("/api/redis/guilds");
    if (response.ok) {
      guilds = await response.json();
      fetched = true;
    }
  });

  function truncate(str, num) {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  }
</script>

{#if fetched && guilds.length > 0}
  <section class="flex flex-col justify-center items-center bg-mewd-light-grey p-7" title="mewdekos features">
    <div class="mb-2 sm:text-3xl lg:text-5xl xl:text-[40px] text-white font-bold">Top Servers</div>
    <div class="flex justify-center items-center space-x-[-24px] p-7">
      {#each guilds as guild (guild.Name)}
        <div class="relative group transform transition-all duration-200 hover:-translate-y-2">
          <img class="w-16 h-16 rounded-full" src={guild.IconUrl} alt={guild.Name} />
          <div
            class="absolute hidden z-10 group-hover:flex items-center justify-center px-2 py-1 text-lg text-white rounded bg-gray-600 whitespace-nowrap bottom-14 left-1/2 transform -translate-x-1/2">{truncate(guild.Name, 20)}
            - {guild.MemberCount} Members
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}