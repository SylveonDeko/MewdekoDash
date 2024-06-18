<script>
  import MarkdownResolver from "$lib/MarkdownResolver.svelte";
</script>

<head>
  <meta content="Mewdeko - Setting up Credentials" property="og:title">
  <meta content="Guide to setting up credentials for Mewdeko Discord bot" name="description">
  <meta content="Guide to setting up credentials for Mewdeko Discord bot" property="og:description">
  <meta content="Guide to setting up credentials for Mewdeko Discord bot" name="twitter:description">
</head>

<div class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey">
  <MarkdownResolver content={`
# Setting up Your Credentials

---

## Setting up credentials_example.json file

The \`credentials_example.json\` file is located in the \`Mewdeko/src/Mewdeko\` folder. Rename and configure it to \`credentials.json\`.

---

## Getting the Bot's Token

1. Go to the [Discord Developer Portal](https://discord.dev) and log in.
2. Click on \`New Application\`.
3. Give your application a name and click \`Create\`.
4. Navigate to the \`Bot\` tab on the left sidebar.
5. Click \`Add Bot\` and confirm by clicking \`Yes, do it!\`.
6. Under the \`TOKEN\` section, click \`Copy\` to get your bot token.

   Paste your bot token between the quotation marks on the "Token" line of your \`credentials.json\`.

   It should look like this:
   \`"Token": "YOUR_BOT_TOKEN_HERE"\`

---

## Setting up a PostgreSQL Database

### Installing PostgreSQL on Linux

1. **Install PostgreSQL:**
   \`\`\`bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   \`\`\`

2. **Switch to the postgres user:**
   \`\`\`bash
   sudo -i -u postgres
   \`\`\`

3. **Create a new PostgreSQL role:**
   \`\`\`bash
   createuser --interactive
   \`\`\`

4. **Create a new database:**
   \`\`\`bash
   createdb mydatabase
   \`\`\`

5. **Set a password for the PostgreSQL role:**
   \`\`\`sql
   psql
   ALTER USER yourusername WITH ENCRYPTED PASSWORD 'yourpassword';
   \q
   \`\`\`

6. **Edit the PostgreSQL configuration to allow password authentication:**
   - Open the configuration file:
     \`\`\`bash
     sudo nano /etc/postgresql/12/main/pg_hba.conf
     \`\`\`
   - Find the lines that look like this and change \`peer\` to \`md5\`:
     \`\`\`
     local   all             postgres                                peer
     local   all             all                                     peer
     host    all             all             127.0.0.1/32            md5
     host    all             all             ::1/128                 md5
     \`\`\`
   - Restart PostgreSQL:
     \`\`\`bash
     sudo systemctl restart postgresql
     \`\`\`

7. **Set up the PostgreSQL connection string in \`credentials.json\`:**
   - Format: \`"PsqlConnectionString": "Server=ServerIp;Database=DatabaseName;Port=PsqlPort;UID=PsqlUser;Password=UserPassword"\`

---

## Getting Owner ID(s)

1. Go to your Discord server and attempt to mention yourself, but put a backslash at the start (to make it slightly easier, add the backslash after the mention has been typed).
2. For example, the message \`\\@yourusername#1234\` will appear as \`<@YOUR_USER_ID>\` after you send the message.
3. The message will appear as a mention if done correctly. Copy the numbers from it (YOUR_USER_ID) and replace the big number on the OwnerIds section with your user ID.
4. Save the \`credentials.json\` file.
5. If done correctly, you should now be the bot owner. You can add multiple owners by separating each owner ID with a comma within the square brackets.

   For a single owner, it should look like this:
   \`"OwnerIds": ["YOUR_USER_ID"]\`

   For multiple owners, it should look like this (pay attention to the commas, the last ID should never have a comma next to it):
   \`"OwnerIds": ["USER_ID_1", "USER_ID_2", "USER_ID_3"]\`

---

## Setting up Your API Keys

This part is completely optional; however, it's necessary for music and a few other features to work properly.

1. **GoogleApiKey** (Required for Youtube Song Search, Playlist queuing, and a few more things)
   - Follow these steps on how to set up Google API keys:
     - Go to [Google Console](https://console.developers.google.com/) and log in.
     - Create a new project (name does not matter).
     - Once the project is created, go into Library.
     - Under the YouTube APIs section, enable YouTube Data API.
     - On the left tab, access Credentials.
     - Click the Create Credentials button.
     - Click on API Key.
     - A new window will appear with your Google API key.
     - NOTE: You don't need to click on RESTRICT KEY, just click on CLOSE when you are done.
     - Copy the key.
     - Open up \`credentials.json\` and look for "GoogleApiKey", paste your API key between the quotation marks.
     - It should look like this:
       \`"GoogleApiKey": "YOUR_GOOGLE_API_KEY_HERE"\`

2. **MashapeKey** (Required for Hearthstone cards)
   - Api key obtained on https://rapidapi.com (register -> go to MyApps -> Add New App -> Enter Name -> Application key)
   - Copy the key and paste it into \`credentials.json\`.

3. **OsuApiKey** (Required for Osu commands)
   - You can get this key here [https://osu.ppy.sh/p/api].

4. **CleverbotApiKey** (Required if you want to use Cleverbot. It's currently a paid service)
   - You can get this key here [http://www.cleverbot.com/api/].

5. **TwitchClientId, TwitchClientSecret** (Mandatory for following Twitch streams with .sta)
   - Go to the apps page [https://dev.twitch.tv/console/apps/create] on Twitch and register your application.
   - You need 2FA enabled on Twitch to create an application.
   - You can set http://localhost as the OAuth Redirect URL (and press Add button).
   - Select Chat Bot from the Category dropdown.
   - Once created, clicking on your application will show a new Client ID field. Make sure to grab the Client Secret as well.
   - Copy it to your \`credentials.json\` as shown below (if you're adding it as the last key inside your \`credentials.json\`, remove the trailing comma from the example below):
     \`"TwitchClientId": "YOUR_TWITCH_CLIENT_ID_HERE", "TwitchClientSecret": "YOUR_TWITCH_CLIENT_SECRET_HERE"\`

6. **CoinmarketcapApiKey** (Optional. Used only for the .crypto command)
   - You can use the crypto command without it, but you might get rate-limited from time to time, as all self-hosters share the default API key. https://pro.coinmarketcap.com/

---

## Additional Settings

1. **PsqlConnectionString** (Required for PostgreSQL database connection)
   - Format: \`"PsqlConnectionString": "Server=ServerIp;Database=DatabaseName;Port=PsqlPort;UID=PsqlUser;Password=UserPassword"\`

2. **LavalinkUrl** (Required for music playback)
   - Format: \`"LavalinkUrl": "http://localhost:2333"\`

3. **ConfessionReportChannelId** (Optional. Used for reporting confessions)
   - Format: \`"ConfessionReportChannelId": "YOUR_CHANNEL_ID_HERE"\`

4. **ChatSavePath** (Optional. Path to save chat logs)
   - Format: \`"ChatSavePath": "/path/to/chatlogs/"\`

---

## End Result

This is an example of how the \`credentials.json\` looks like with multiple owners, and all the API keys (also optional):

\`
{
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
}
\`
  `}></MarkdownResolver>
</div>