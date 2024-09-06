  <script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let mounted = false;

    onMount(() => {
      mounted = true;
    });
  </script>

  <svelte:head>
    <title>Mewdeko - Setting Up Credentials</title>
    <meta content="Mewdeko - Setting up Credentials" property="og:title">
    <meta content="Guide to setting up credentials for Mewdeko Discord bot" name="description">
    <meta content="Guide to setting up credentials for Mewdeko Discord bot" property="og:description">
    <meta content="Guide to setting up credentials for Mewdeko Discord bot" name="twitter:description">
  </svelte:head>

  {#if mounted}
    <div class="container mx-auto px-4 py-8" in:fade>
      <h1 class="text-4xl font-bold mb-8">Setting up Your Credentials</h1>

      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Setting up credentials_example.json file</h2>
        <p>The <code class=" p-1 rounded">credentials_example.json</code> file is located in the <code class=" p-1 rounded">Mewdeko/src/Mewdeko</code> folder. Rename and configure it to <code class=" p-1 rounded">credentials.json</code>.</p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Getting the Bot's Token</h2>
        <ol class="list-decimal pl-6">
          <li>Go to the <a href="https://discord.dev" class="text-blue-600 hover:underline">Discord Developer Portal</a> and log in.</li>
          <li>Click on <code class=" p-1 rounded">New Application</code>.</li>
          <li>Give your application a name and click <code class=" p-1 rounded">Create</code>.</li>
          <li>Navigate to the <code class=" p-1 rounded">Bot</code> tab on the left sidebar.</li>
          <li>Click <code class=" p-1 rounded">Add Bot</code> and confirm by clicking <code class=" p-1 rounded">Yes, do it!</code>.</li>
          <li>Under the <code class=" p-1 rounded">TOKEN</code> section, click <code class=" p-1 rounded">Copy</code> to get your bot token.</li>
        </ol>
        <p class="mt-4">Paste your bot token between the quotation marks on the "Token" line of your <code class=" p-1 rounded">credentials.json</code>.</p>
        <p>It should look like this:</p>
        <pre class=" p-4 rounded-lg overflow-x-auto"><code>"Token": "YOUR_BOT_TOKEN_HERE"</code></pre>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Setting up a PostgreSQL Database</h2>
        <h3 class="text-xl font-semibold mb-2">Installing PostgreSQL on Linux</h3>
        <ol class="list-decimal pl-6">
          <li>
            <p><strong>Install PostgreSQL:</strong></p>
            <pre class=" p-4 rounded-lg overflow-x-auto"><code>sudo apt update
  sudo apt install postgresql postgresql-contrib</code></pre>
          </li>
          <li>
            <p><strong>Switch to the postgres user:</strong></p>
            <pre class=" p-4 rounded-lg overflow-x-auto"><code>sudo -i -u postgres</code></pre>
          </li>
          <li>
            <p><strong>Create a new PostgreSQL role:</strong></p>
            <pre class=" p-4 rounded-lg overflow-x-auto"><code>createuser --interactive</code></pre>
          </li>
          <li>
            <p><strong>Create a new database:</strong></p>
            <pre class=" p-4 rounded-lg overflow-x-auto"><code>createdb mydatabase</code></pre>
          </li>
          <li>
            <p><strong>Set a password for the PostgreSQL role:</strong></p>
            <pre class=" p-4 rounded-lg overflow-x-auto"><code>psql
  ALTER USER yourusername WITH ENCRYPTED PASSWORD 'yourpassword';
  \q</code></pre>
          </li>
          <li>
            <p><strong>Edit the PostgreSQL configuration to allow password authentication:</strong></p>
            <ul class="list-disc pl-6">
              <li>Open the configuration file:</li>
              <pre class=" p-4 rounded-lg overflow-x-auto"><code>sudo nano /etc/postgresql/12/main/pg_hba.conf</code></pre>
              <li>Find the lines that look like this and change <code class=" p-1 rounded">peer</code> to <code class=" p-1 rounded">md5</code>:</li>
              <pre class=" p-4 rounded-lg overflow-x-auto"><code>local   all             postgres                                peer
  local   all             all                                     peer
  host    all             all             127.0.0.1/32            md5
  host    all             all             ::1/128                 md5</code></pre>
              <li>Restart PostgreSQL:</li>
              <pre class=" p-4 rounded-lg overflow-x-auto"><code>sudo systemctl restart postgresql</code></pre>
            </ul>
          </li>
          <li>
            <p><strong>Set up the PostgreSQL connection string in <code class=" p-1 rounded">credentials.json</code>:</strong></p>
            <p>Format: <code class=" p-1 rounded">"PsqlConnectionString": "Server=ServerIp;Database=DatabaseName;Port=PsqlPort;UID=PsqlUser;Password=UserPassword"</code></p>
          </li>
        </ol>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Getting Owner ID(s)</h2>
        <ol class="list-decimal pl-6">
          <li>Go to your Discord server and attempt to mention yourself, but put a backslash at the start (to make it slightly easier, add the backslash after the mention has been typed).</li>
          <li>For example, the message <code class=" p-1 rounded">\@yourusername#1234</code> will appear as <code class=" p-1 rounded">&lt;@YOUR_USER_ID&gt;</code> after you send the message.</li>
          <li>The message will appear as a mention if done correctly. Copy the numbers from it (YOUR_USER_ID) and replace the big number on the OwnerIds section with your user ID.</li>
          <li>Save the <code class=" p-1 rounded">credentials.json</code> file.</li>
          <li>If done correctly, you should now be the bot owner. You can add multiple owners by separating each owner ID with a comma within the square brackets.</li>
        </ol>
        <p class="mt-4">For a single owner, it should look like this:</p>
        <pre class=" p-4 rounded-lg overflow-x-auto"><code>"OwnerIds": ["YOUR_USER_ID"]</code></pre>
        <p class="mt-4">For multiple owners, it should look like this (pay attention to the commas, the last ID should never have a comma next to it):</p>
        <pre class=" p-4 rounded-lg overflow-x-auto"><code>"OwnerIds": ["USER_ID_1", "USER_ID_2", "USER_ID_3"]</code></pre>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Setting up Your API Keys</h2>
        <p>This part is completely optional; however, it's necessary for music and a few other features to work properly.</p>

        <h3 class="text-xl font-semibold mt-4 mb-2">1. GoogleApiKey</h3>
        <p>(Required for Youtube Song Search, Playlist queuing, and a few more things)</p>
        <ol class="list-decimal pl-6">
          <li>Go to <a href="https://console.developers.google.com/" class="text-blue-600 hover:underline">Google Console</a> and log in.</li>
          <li>Create a new project (name does not matter).</li>
          <li>Once the project is created, go into Library.</li>
          <li>Under the YouTube APIs section, enable YouTube Data API.</li>
          <li>On the left tab, access Credentials.</li>
          <li>Click the Create Credentials button.</li>
          <li>Click on API Key.</li>
          <li>A new window will appear with your Google API key.</li>
          <li>NOTE: You don't need to click on RESTRICT KEY, just click on CLOSE when you are done.</li>
          <li>Copy the key.</li>
          <li>Open up <code class=" p-1 rounded">credentials.json</code> and look for "GoogleApiKey", paste your API key between the quotation marks.</li>
        </ol>
        <p>It should look like this:</p>
        <pre class=" p-4 rounded-lg overflow-x-auto"><code>"GoogleApiKey": "YOUR_GOOGLE_API_KEY_HERE"</code></pre>

        <h3 class="text-xl font-semibold mt-4 mb-2">2. MashapeKey</h3>
        <p>(Required for Hearthstone cards)</p>
        <p>Api key obtained on <a href="https://rapidapi.com" class="text-blue-600 hover:underline">https://rapidapi.com</a> (register -> go to MyApps -> Add New App -> Enter Name -> Application key)</p>
        <p>Copy the key and paste it into <code class=" p-1 rounded">credentials.json</code>.</p>

        <h3 class="text-xl font-semibold mt-4 mb-2">3. OsuApiKey</h3>
        <p>(Required for Osu commands)</p>
        <p>You can get this key here <a href="https://osu.ppy.sh/p/api" class="text-blue-600 hover:underline">https://osu.ppy.sh/p/api</a>.</p>

        <h3 class="text-xl font-semibold mt-4 mb-2">4. CleverbotApiKey</h3>
        <p>(Required if you want to use Cleverbot. It's currently a paid service)</p>
        <p>You can get this key here <a href="http://www.cleverbot.com/api/" class="text-blue-600 hover:underline">http://www.cleverbot.com/api/</a>.</p>

        <h3 class="text-xl font-semibold mt-4 mb-2">5. TwitchClientId, TwitchClientSecret</h3>
        <p>(Mandatory for following Twitch streams with .sta)</p>
        <ol class="list-decimal pl-6">
          <li>Go to the apps page <a href="https://dev.twitch.tv/console/apps/create" class="text-blue-600 hover:underline">https://dev.twitch.tv/console/apps/create</a> on Twitch and register your application.</li>
          <li>You need 2FA enabled on Twitch to create an application.</li>
          <li>You can set http://localhost as the OAuth Redirect URL (and press Add button).</li>
          <li>Select Chat Bot from the Category dropdown.</li>
          <li>Once created, clicking on your application will show a new Client ID field. Make sure to grab the Client Secret as well.</li>
          <li>Copy it to your <code class=" p-1 rounded">credentials.json</code> as shown below (if you're adding it as the last key inside your <code class=" p-1 rounded">credentials.json</code>, remove the trailing comma from the example below):</li>
        </ol>
        <pre class=" p-4 rounded-lg overflow-x-auto"><code>"TwitchClientId": "YOUR_TWITCH_CLIENT_ID_HERE", "TwitchClientSecret": "YOUR_TWITCH_CLIENT_SECRET_HERE"</code></pre>

        <h3 class="text-xl font-semibold mt-4 mb-2">6. CoinmarketcapApiKey</h3>
        <p>(Optional. Used only for the .crypto command)</p>
        <p>You can use the crypto command without it, but you might get rate-limited from time to time, as all self-hosters share the default API key. <a href="https://pro.coinmarketcap.com/" class="text-blue-600 hover:underline">https://pro.coinmarketcap.com/</a></p>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Additional Settings</h2>
        <ol class="list-decimal pl-6">
          <li>
            <p><strong>PsqlConnectionString</strong> (Required for PostgreSQL database connection)</p>
            <p>Format: <code class=" p-1 rounded">"PsqlConnectionString": "Server=ServerIp;Database=DatabaseName;Port=PsqlPort;UID=PsqlUser;Password=UserPassword"</code></p>
          </li>
          <li>
            <p><strong>LavalinkUrl</strong> (Required for music playback)</p>
            <p>Format: <code class=" p-1 rounded">"LavalinkUrl": "http://localhost:2333"</code></p>
          </li>
          <li>
            <p><strong>ConfessionReportChannelId</strong> (Optional. Used for reporting confessions)</p>
            <p>Format: <code class=" p-1 rounded">"ConfessionReportChannelId": "YOUR_CHANNEL_ID_HERE"</code></p>
          </li>
          <li>
            <p><strong>ChatSavePath</strong> (Optional. Path to save chat logs)</p>
            <p>Format: <code class=" p-1 rounded">"ChatSavePath": "/path/to/chatlogs/"</code></p>
          </li>
        </ol>
      </section>

      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">End Result</h2>
        <p>This is an example of how the <code class=" p-1 rounded">credentials.json</code> looks like with multiple owners, and all the API keys (also optional):</p>
        <pre class=" p-4 rounded-lg overflow-x-auto"><code>{JSON.stringify({
          "Token": "YOUR_BOT_TOKEN_HERE",
          "OwnerIds": [
            "USER_ID_1",
            "USER_ID_2"
          ],
          "UseGlobalCurrency": false,
          "SoundCloudClientId": "",
          "RestartCommand": null,
          "CarbonKey": "",
          "RedisConnections": "127.0.0.1:6379",
          "ShardRunCommand": "",
          "ShardRunArguments": "",
          "BotListToken": null,
          "VotesUrl": null,
          "PsqlConnectionString": "Server=ServerIp;Database=DatabaseName;Port=PsqlPort;UID=PsqlUser;Password=UserPassword",
          "CoinmarketcapApiKey": null,
          "DebugGuildId": "843489716674494475",
          "GuildJoinsChannelId": "892789588739891250",
          "GlobalBanReportChannelId": "905109141620682782",
          "PronounAbuseReportChannelId": "970086914826858547",
          "MigrateToPsql": false,
          "LastFmApiKey": null,
          "LastFmApiSecret": null,
          "GeniusKey": null,
          "CfClearance": null,
          "UserAgent": null,
          "CsrfToken": null,
          "LavalinkUrl": "http://localhost:2333",
          "SpotifyClientId": "",
          "SpotifyClientSecret": "",
          "StatcordKey": "",
          "ShardRunPort": "3444",
          "GoogleApiKey": "",
          "MashapeKey": "",
          "OsuApiKey": "",
          "TrovoClientId": "",
          "TwitchClientId": "",
          "CleverbotApiKey": "",
          "TotalShards": 1,
          "TwitchClientSecret": null,
          "VotesToken": null,
          "RedisOptions": null,
          "LocationIqApiKey": null,
          "TimezoneDbApiKey": null,
          "ConfessionReportChannelId": "942825117820530709",
          "ChatSavePath": "/usr/share/nginx/cdn/chatlogs/"
        }, null, 2)}</code></pre>
      </section>
    </div>
  {/if}

  <style>
    :global(pre) {
      background-color: #1f2937; /* dark gray background */
      color: #e5e7eb; /* light gray text */
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    :global(pre code) {
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    :global(code:not(pre code)) {
      background-color: #374151; /* slightly lighter gray for inline code */
      color: #e5e7eb;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      font-size: 0.875em;
    }
  </style>