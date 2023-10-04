<script>
  import MarkdownResolver from "$lib/MarkdownResolver.svelte";
</script>

<head>
  <meta content="Mewdeko - Placeholders for commands with embeds!" property="og:title">
  <meta content="Placeholders for commands with embeds!"
        name="description">
  <meta content="Placeholders for commands with embeds!"
        property="og:description">
  <meta content="Placeholders for commands with embeds!"
        name="twitter:description">
</head>

<div class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey">
  <MarkdownResolver content={`
Setting up your Credentials
This document aims to guide you through the process of setting up the
credentials necessary for the bot installed on your computer to be able to log
into that account.

--------------------------------------------------------------------------------

Setting up credentials.json file
 * The credentials.json file is located in the Mewdeko/src/Mewdekoh folder.

--------------------------------------------------------------------------------

Getting the Bot's Token:
 * On the Bot tab of your [applications page][DiscordApp], copy your Token. *
      Note: Your bot Token is not the Client Secret! We won't need the Client
      Secret for anything.

 * Paste your bot token between the quotation marks on the "Token" line of your
   credentials.json.

It should look like this:

"Token": "MTc5MzcyXXX2MDI1ODY3MjY0.ChKs4g.I8J_R9XX0t-QY-0PzXXXiN0-7vo",

Getting Owner ID*(s)*:
 * Go to your Discord server and attempt to mention yourself, but put a
   backslash at the start
   (to make it slightly easier, add the backslash after the mention has been
   typed).
 * For example, the message \@fearnlj01#3535 will appear as
   <@145521851676884992> after you send the message.
 * The message will appear as a mention if done correctly. Copy the numbers from
   it 145521851676884992 and replace the big number on the OwnerIds section with
   your user ID.
 * Save the credentials.json file.
 * If done correctly, you should now be the bot owner. You can add multiple
   owners by seperating each owner ID with a comma within the square brackets.

For a single owner, it should look like this:

    "OwnerIds": [
        105635576866156544
    ],

For multiple owners, it should look like this (pay attention to the commas, the
last ID should never have a comma next to it):

    "OwnerIds": [
        105635123466156544,
        145521851676884992,
        341420590009417729
    ],

--------------------------------------------------------------------------------

Setting up your API keys
This part is completely optional, however it's necessary for music and a few
other features to work properly.

 * GoogleAPIKey * Required for Youtube Song Search, Playlist queuing, and a few
      more things.
    * Follow these steps on how to setup Google API keys: * Go to [Google
         Console][Google Console] and log in.
       * Create a new project
         (name does not matter).
       * Once the project is
         created, go into Library
       * Under the YouTube APIs section, enable YouTube Data API
       * On the left tab,
         access Credentials, * Click Create Credentials button,
          * Click on API Key
          * A new window will appear with your Google API key
            NOTE: You don't really need to click on RESTRICT KEY, just click on
            CLOSE when you are done.
          * Copy the key.

       * Open up credentials.json and look for "GoogleAPIKey", paste your API
         key inbetween the quotation marks.
       * It should look like
         this:

      "GoogleApiKey": "AIzaSyDSci1sdlWQOWNVj1vlXxxxxxbk0oWMEzM",

 * MashapeKey * Required for Hearthstone cards.
    * Api key obtained on https://rapidapi.com (register -> go to MyApps -> Add
      New App -> Enter Name -> Application key)
    * Copy the key and paste it into credentials.json

 * OsuApiKey * Required for Osu commands
    * You can get this key here [https://osu.ppy.sh/p/api].

 * CleverbotApiKey * Required if you want to use Cleverbot. It's currently a
      paid service.
    * You can get this key here [http://www.cleverbot.com/api/].

 * PatreonAccessToken * For Patreon creators only.

 * PatreonCampaignId * For Patreon creators only. Id of your campaign.

 * TwitchClientId, TwitchClientSecret * Mandatory for following twitch streams
      with .twitch (or .stadd with twitch link)
    * Go to apps page [https://dev.twitch.tv/console/apps/create] on twitch and
      register your application.
    * You need 2FA enabled on twitch in order
      to create an application
    * You can set http://localhost as the OAuth Redirect URL (and press Add
      button)
    * Select Chat Bot from the Category dropdown
    * Once created, clicking on your
      application will show a new Client ID field, Make sure to grab the Client
      Secret as well
    * Copy it to your credentials.json as
      shown below
    * (if you're adding it as the last key
      inside your credentials.json, remove the trailling comma from the example
      below)

       "TwitchClientId": "516tr61tr1qweqwe86trg3g",
       "TwitchClientSecret":"8b983gb9732r",

 * LocationIqApiKey * Optional. Used only for the .time command. https://locationiq.com api key
      (register and you will receive the token in the email).


 * TimezoneDbApiKey * Optional. Used only for the .time command. https://timezonedb.com api key
      (register and you will receive the token in the email YOU HAVE TO
      ACTIVEATE IT AFTER YOU GET IT).


 * CoinmarketcapApiKey * Optional. Used only for the .crypto command. You can use crypto command
      without it, but you might get ratelimited from time to time, as all
      self-hosters share the default api key. https://pro.coinmarketcap.com/

Additional Settings
 * TotalShards * Required if the bot will be connected to more than 2500
      servers.
    * Most likely unnecessary to change until your bot is added to
      more than 2500 servers.


 * RedisOptions * Required if the Redis instance is not on localhost or on
      non-default port.
    * You can find all available options here
      [https://stackexchange.github.io/StackExchange.Redis/Configuration.html].


 * RestartCommand * Only use this if you aren't using auto-restart



For restarts to work properly add this to your credentials.json

"RestartCommand": {
    "Cmd": "dotnet",
    "Args": "run -c Release"
},

--------------------------------------------------------------------------------

End Result
This is an example of how the credentials.json looks like with multiple owners,
the restart command (optional) and all the API keys (also optional):

\`{
  "Token": "MTc5MzcyXXX2MDI1ODY3MjY0.ChKs4g.I8J_R9XX0t-QY-0PzXXXiN0-7vo",
  "OwnerIds": [
        105635123466156544,
        145521851676884992,
        341420590009417729
  ],
  "OfficialMods": [
        105635123466156544,
        105635123466156544
  ],
  "GoogleApiKey": "AIzaSyDSci1sdlWQOWNVj1vlXxxxxxbk0oWMEzM",
  "MashapeKey": "4UrKpcWXc2mshS8RKi00000y8Kf5p1Q8kI6jsn32bmd8oVWiY7",
  "OsuApiKey": "4c8c8fdff8e1234581725db27fd140a7d93320d6",
  "CleverbotApiKey": "",
  "Db": null,
  "TotalShards": 1,
  "PatreonAccessToken": "",
  "PatreonCampaignId": "334038",
 "RestartCommand": {
    "Cmd": "dotnet",
    "Args": "run -c Release"
  },
  "ShardRunCommand": "",
  "ShardRunArguments": "",
  "ShardRunPort": null,
  "TwitchClientId": null,
  "TwitchClientSecret":null,
  "RedisOptions": null
}\`
`

}></MarkdownResolver>
</div>