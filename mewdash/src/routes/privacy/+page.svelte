<!-- routes/privacy/+page.svelte -->
<script>
  let date = "12th October 2026";
  let email = "sylveon@mewdeko.tech";
</script>

<svelte:head>
  <meta
    content="Mewdeko - The most customizable discord bot."
    property="og:title"
  >
  <meta content="Privacy Policy for Mewdeko" name="description" />
  <meta content="Privacy Policy for Mewdeko" property="og:description" />
  <meta content="Privacy Policy for Mewdeko" name="twitter:description" />
</svelte:head>

<div
        class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey text-white p-6 rounded-sm shadow-md flex justify-center items-center"
>
  <div class="space-y-5 text-center text-left">
    <h1 class="text-3xl font-semibold">Privacy Policy for Mewdeko</h1>

    <p>
      This privacy policy explains how we use the personal data we collect from
      you when you use Mewdeko. It covers the Discord bot, this dashboard, and
      the Mewdeko Mobile app for Android and iOS.
    </p>

    <h2 class="text-2xl font-semibold">What data do we collect?</h2>

    <p>Mewdeko collects the following data:</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>User ID</li>
        <li>Usernames, nicknames and avatars</li>
        <li>Server ID, and the channel and role IDs used in server settings</li>
        <li>
          The content of messages, where a feature needs it (see
          <a class="underline" href="#message-content">Message content</a>
          below)
        </li>
        <li>
          Activity in a server: message counts, voice time, XP, the invite you
          joined with, when you joined or left, and the roles you held when you
          left, so they can be restored if you return
        </li>
        <li>
          Your Discord status and activities, where a feature needs them (see
          <a class="underline" href="#presence">Status and activities</a>
          below)
        </li>
        <li>
          Things you create with the bot, such as suggestions, confessions,
          tickets, reminders, birthdays, AFK messages and highlight words
        </li>
        <li>
          Your Discord avatar, when you sign in to the dashboard or the mobile
          app
        </li>
        <li>
          Sign-in tokens issued to you when you authorise the dashboard or the
          mobile app through Discord
        </li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">How do we collect your data?</h2>

    <p>
      You directly provide Mewdeko with most of the data we collect. We collect
      data and process data when you:
    </p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>Interact with the bot through commands</li>
        <li>
          Send messages, join or leave, or change your roles, nickname or
          status in a server where the bot is present and the relevant feature
          is enabled
        </li>
        <li>Use or view our bot via your browser’s cookies</li>
        <li>
          Sign in to the dashboard or the Mewdeko Mobile app with Discord. We
          receive your user ID, username, and avatar from Discord so we can show
          you the servers you administer
        </li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">How will we use your data?</h2>

    <p>Mewdeko collects your data so that we can:</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>Operate the bot and provide functionality</li>
        <li>
          Show server administrators an audit log of who changed a setting
          through the dashboard, and what they changed
        </li>
        <li>Diagnose errors and faults so they can be fixed</li>
        <li>Make improvements based on user feedback</li>
        <li>
          Measure how the bot and dashboard are used, such as which commands
          are run and which dashboard pages are visited, so we know what to
          improve
        </li>
      </ul>
    </div>

    <p>
      We do not profile you, sell your data, or use it for advertising, and
      Mewdeko contains no advertising or tracking software. We do not use your
      data, including message content, to train machine learning or AI models.
    </p>

    <h2 class="text-2xl font-semibold" id="message-content">Message content</h2>

    <p>
      Mewdeko reads the messages in channels it can see so that its features
      work. Most messages are checked and then forgotten: prefix commands,
      chat triggers, word and link filters, anti-spam, highlights, counting,
      games, AFK and XP all read a message without keeping its text. XP and
      message statistics keep counts, never the text itself.
    </p>

    <p>Some features do keep message text:</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>
          Message logs: when a server enables them, the old and new text of
          edited and deleted messages is posted to that server's log channel
          in Discord. It is not kept in our database.
        </li>
        <li>
          Snipe: when a server turns it on, the most recent deleted and edited
          messages in each channel are kept so members can view them. They are
          deleted after 30 days.
        </li>
        <li>
          Support tickets and Chat Saver: transcripts of ticket channels and
          messages a server's staff choose to save, including attachments.
        </li>
        <li>Starboard: a copy of messages that reach a server's starboard.</li>
        <li>
          Suggestions, confessions, AFK messages and highlight words: the text
          you submit to these features.
        </li>
        <li>
          AI chat: messages sent in a channel a server has set up for AI chat,
          kept as conversation history until you clear it by sending
          "deletesession" in that channel.
        </li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold" id="presence">Status and activities</h2>

    <p>
      Some features read your Discord status and activities, such as the game
      you are playing, whether you are streaming, and your custom status. They
      are used by Status Roles and Stream Roles to give or remove roles, by
      game voice channels to move you to a channel for your game, and to show
      how many members are online. If a server turns on activity tracking in
      Server Stats, the bot also records which activities members spend time
      on so that server's staff can see what is popular. Your custom status
      text is read by Status Roles but never stored.
    </p>

    <h2 class="text-2xl font-semibold">How do we store your data?</h2>

    <p>
      Mewdeko stores your data in a PostgreSQL database and a Redis cache,
      both hosted at Hetzner in Germany. Access to them requires authentication
      and neither is reachable from the public internet. Traffic between you and the dashboard or the mobile
      app is encrypted with HTTPS.
    </p>

    <p>
      Data belonging to a Discord server, such as XP levels, warnings,
      suggestions, starboard entries, and tickets, is kept for as long as the
      bot remains in that server, because the features depend on it. It is
      removed when a server administrator deletes it, when a relevant command is
      used, or when you ask us to remove it. When the bot is removed from a
      server, that server's data is permanently deleted after 7 days, which
      gives an administrator who removed it by mistake time to add it back.
    </p>

    <p>
      Some features keep their own history and expose their own retention
      setting, which server administrators control. Others, such as XP and
      reputation, reduce scores over a period of inactivity rather than deleting
      the record.
    </p>

    <p>
      Usage records, such as which commands were run in which server and
      which dashboard pages were visited, are deleted after 30 days. They do
      not contain your user ID; dashboard visits are recorded with a short
      anonymous hash instead. Daily totals built from them are kept.
    </p>

    <p>
      Sign-in sessions for the dashboard and the mobile app expire after 30 days
      without use, and are destroyed immediately when you sign out or delete
      your data.
    </p>

    <h2 class="text-2xl font-semibold">Who else processes your data</h2>

    <p>
      When the bot or the dashboard encounters an error, a report is sent to
      Sentry, an error tracking service, so the fault can be diagnosed. These
      reports can include your Discord user ID and the action that failed. The
      Mewdeko Mobile app does not send error reports.
    </p>

    <p>
      If a server sets up AI chat, the messages sent in that server's AI chat
      channel, along with recent conversation history, are sent to the AI
      provider that server chose (OpenAI, Groq or Anthropic) using that
      server's own account with the provider. That provider's privacy policy
      applies to what it receives.
    </p>

    <p>
      Discord itself processes your data whenever you use Discord. That
      relationship is governed by Discord's own privacy policy, not this one.
    </p>

    <h2 class="text-2xl font-semibold">The Mewdeko Mobile app</h2>

    <p>
      Mewdeko Mobile signs you in with Discord. It does not create a separate
      account and it never sees or stores your Discord password. When you sign
      in, your Discord user ID, username, and avatar are sent to the dashboard
      so it can show you the servers you administer.
    </p>

    <p>
      The sign-in tokens issued to you are stored on your own device, encrypted
      with a key held in the device keystore. All traffic between the app and
      the dashboard uses HTTPS. The app contains no advertising, analytics, or
      tracking software, and does not collect your location, contacts, photos,
      files, or device identifiers.
    </p>

    <p>
      Mewdeko Mobile can be pointed at a self-hosted Mewdeko dashboard instead
      of the official one. If you do that, your data goes to whoever runs that
      deployment rather than to us, and their own policy applies.
    </p>

    <h2 class="text-2xl font-semibold">Deleting your data</h2>

    <p>
      In Mewdeko Mobile, open the Me tab, scroll to Privacy, and tap Delete my
      data. This revokes your sign-in immediately and removes your tokens,
      cached profile, and saved dashboard from the device.
    </p>

    <p>
      You can also have specific data removed while continuing to use Mewdeko.
      Full instructions, including what is deleted and what is kept, are on our
      <a class="underline" href="/delete-account">data deletion page</a>.
    </p>

    <h2 class="text-2xl font-semibold">
      What are your data protection rights?
    </h2>

    <p>
      We would like to make sure you are fully aware of all of your data
      protection rights. Every user is entitled to the following:
    </p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>
          The right to access: You have the right to request from Mewdeko
          copies of your personal data.
        </li>
        <li>
          The right to rectification: You have the right to request that
          Mewdeko correct any information you believe is inaccurate. You also
          have the right to request Mewdeko to complete the information you
          believe is incomplete.
        </li>
        <li>
          The right to erasure: You have the right to request that Mewdeko
          erase your personal data.
        </li>
        <li>
          The right to restrict processing: You have the right to request that
          Mewdeko restrict the processing of your personal data.
        </li>
      </ul>
    </div>

    <p>
      If you make a request, we have one month to respond to you. If you would
      like to exercise any of these rights, please contact us at our email: {email}
    </p>

    <h2 class="text-2xl font-semibold">Changes to our privacy policy</h2>

    <p>
      Mewdeko keeps its privacy policy under regular review and places any
      updates on this web page. This privacy policy was last updated on {date}.
    </p>

    <h2 class="text-2xl font-semibold">How to contact us</h2>

    <p>
      If you have any questions about Mewdeko's privacy policy, the data we hold
      on you, or you would like to exercise one of your data protection rights,
      please do not hesitate to contact us at our email: {email}
    </p>

    <h2 class="text-2xl font-semibold">
      How to contact the appropriate authority
    </h2>

    <p>
      Should you wish to report a complaint or if you feel that Mewdeko has not
      addressed your concern in a satisfactory manner, you may contact the
      Information Commissioner’s Office (or your local data protection
      authority).
    </p>
  </div>
</div>
