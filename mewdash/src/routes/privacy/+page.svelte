<!-- routes/privacy/+page.svelte -->
<script>
  let date = "20th August 2026";
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
        <li>Usernames</li>
        <li>Server ID</li>
        <li>
          Messages sent to the bot in direct messages or mentioned in a server
          (only while performing a command)
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
      </ul>

    <p>
      We do not profile you, sell your data, or use it for advertising, and
      Mewdeko contains no advertising or tracking software.
    </p>
    </div>

    <h2 class="text-2xl font-semibold">How do we store your data?</h2>

    <p>
      Mewdeko stores your data in a PostgreSQL database hosted at Hetzner in
      Germany. Access to it requires authentication and it is not reachable from
      the public internet. Traffic between you and the dashboard or the mobile
      app is encrypted with HTTPS.
    </p>

    <p>
      Data belonging to a Discord server, such as XP levels, warnings,
      suggestions, starboard entries, and tickets, is kept for as long as the
      bot remains in that server, because the features depend on it. It is
      removed when a server administrator deletes it, when a relevant command is
      used, when the bot is removed from the server, or when you ask us to
      remove it.
    </p>

    <p>
      Some features keep their own history and expose their own retention
      setting, which server administrators control. Others, such as XP and
      reputation, reduce scores over a period of inactivity rather than deleting
      the record.
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
