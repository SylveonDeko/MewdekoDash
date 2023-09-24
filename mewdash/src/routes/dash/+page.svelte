<script>
  import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";

  let selectedTab = 'gambling';
  let adminGuilds;
  userAdminGuilds.subscribe(value => {
    adminGuilds = value;
  });

  let selectedGuild;
  let selectedGuildId;

  $: if (adminGuilds && adminGuilds.length > 0) {
    selectedGuildId = adminGuilds[0].id;
  }

  $: selectedGuild = adminGuilds ? adminGuilds.find(guild => guild.id === selectedGuildId) : null;

  let isSidebarOpen = false;

  function selectTab(tab) {
    selectedTab = tab;
  }

  function selectGuild(guildId) {
    selectedGuildId = guildId;
  }

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }
</script>

<button
  on:click={toggleSidebar}
  class="lg:hidden p-2 bg-gray-700 text-white rounded mt-4 ml-4">
  Toggle Sidebar
</button>

<section class="min-h-screen flex flex-col lg:flex-row justify-center bg-mewd-dark-grey">
  <div
    class={`sidebar flex flex-col lg:w-1/6 w-full p-4 justify-between shadow-lg z-10
      ${isSidebarOpen ? '' : 'hidden'} lg:block`}>

    <div>
      <div
        class={`tab py-2 px-4 cursor-pointer mb-2 ${selectedTab === 'gambling' ? 'text-white bg-mewd-yellow rounded' : 'text-mewd-offwhite hover:bg-mewd-light-grey hover:text-mewd-offwhite'}`}
        on:click={() => selectTab('gambling')}>
        Gambling
      </div>
      <div
        class={`tab py-2 px-4 cursor-pointer ${selectedTab === 'misc' ? 'text-white bg-mewd-yellow rounded' : 'text-mewd-offwhite hover:bg-mewd-light-grey hover:text-mewd-offwhite'}`}
        on:click={() => selectTab('misc')}>
        Misc
      </div>
    </div>
    <div class="guild-selector mt-4 relative">
      <label for="guilds" class="block text-mewd-offwhite mb-2">Select Guild:</label>
      <div class="flex items-center">
        <div class="mr-2">
          {#if selectedGuild && selectedGuild.icon && selectedGuild.icon.startsWith("a_")}
            <img src="https://cdn.discordapp.com/icons/{selectedGuild.id}/{selectedGuild.icon}.gif"
                 alt={selectedGuild.name}
                 class="rounded-full bg-gray-600 h-6 w-6 shadow-md filter glow" />
          {:else if selectedGuild && selectedGuild.icon}
            <img src="https://cdn.discordapp.com/icons/{selectedGuild.id}/{selectedGuild.icon}.png"
                 alt={selectedGuild.name}
                 class="rounded-full bg-gray-600 h-6 w-6 shadow-md filter glow" />
          {/if}
        </div>
        <select id="guilds" on:change={e => { e.preventDefault(); selectGuild(e.target.value); }}
                class="bg-mewd-dark-grey text-white border rounded p-2 w-full appearance-none">
          {#each adminGuilds as guild}
            <option value="{guild.id}">
              {guild.name}
            </option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="main-content flex-1 p-4 text-white">
    {#if selectedTab === 'gambling'}
      <h2 class="text-xl font-bold">Gambling Settings</h2>
    {:else if selectedTab === 'misc'}
      <h2 class="text-xl font-bold">Misc Settings</h2>
    {/if}
    <p class="mt-4">This does nothing! <!-- Placeholder for guild member count --></p>
  </div>
</section>

<style>
    .glow {
        filter: drop-shadow(0 0 0.75rem white);
    }
</style>
