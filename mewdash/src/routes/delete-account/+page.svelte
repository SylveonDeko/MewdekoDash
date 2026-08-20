<!-- routes/delete-account/+page.svelte -->
<script>
  let email = "sylveon@mewdeko.tech";
  let date = "20th August 2026";
</script>

<svelte:head>
  <title>Delete your Mewdeko Mobile account and data</title>
  <meta content="Mewdeko - The most customizable discord bot." property="og:title" />
  <meta content="How to delete your Mewdeko Mobile account and data" name="description" />
  <meta content="How to delete your Mewdeko Mobile account and data" property="og:description" />
  <meta content="How to delete your Mewdeko Mobile account and data" name="twitter:description" />
</svelte:head>

<div
  class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey text-white p-6 rounded-sm shadow-md flex justify-center items-center"
>
  <div class="space-y-5 text-left max-w-3xl">
    <h1 class="text-3xl font-semibold">Delete your Mewdeko Mobile account and data</h1>

    <p>
      Mewdeko Mobile signs you in with your Discord account. It does not create a
      separate account, so deleting your data here removes the link between your
      Discord account and Mewdeko, along with everything stored about that link.
      Your Discord account itself is not affected and is only ever deleted by
      Discord.
    </p>

    <h2 class="text-2xl font-semibold">Delete from inside the app</h2>

    <div class="flex justify-start">
      <ol class="list-decimal text-left ml-5 space-y-1">
        <li>Open Mewdeko Mobile.</li>
        <li>Tap the <strong>Me</strong> tab at the bottom of the screen.</li>
        <li>Scroll to the <strong>Privacy</strong> section.</li>
        <li>Tap <strong>Delete my data</strong>.</li>
        <li>Confirm when prompted.</li>
      </ol>
    </div>

    <p>
      The deletion happens immediately. You are returned to the first screen of
      the app and signed out everywhere that session was active.
    </p>

    <h2 class="text-2xl font-semibold">Request deletion by email</h2>

    <p>
      If you can no longer sign in to the app, email {email} from any address and
      include your Discord user ID. Requests are answered within one month.
    </p>

    <h2 class="text-2xl font-semibold">What is deleted</h2>

    <div class="flex justify-start">
      <ul class="list-disc text-left ml-5 space-y-1">
        <li>Your dashboard sign-in session, revoked immediately.</li>
        <li>Your sign-in tokens, removed from the device.</li>
        <li>The cached copy of your Discord user ID, username, and avatar.</li>
        <li>The bot instance and dashboard address saved on the device.</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">What is kept</h2>

    <p>
      Deleting your Mewdeko Mobile data does not remove data the Mewdeko bot
      holds for the Discord servers you are in, because that data belongs to
      those servers rather than to your app sign-in. Examples include XP levels,
      warnings, suggestions, and starboard entries.
    </p>

    <h2 class="text-2xl font-semibold">
      Delete some of your data without signing out
    </h2>

    <p>
      You can have specific data removed while keeping your sign-in and
      continuing to use Mewdeko Mobile. Email {email} with your Discord user ID
      and say what you want removed, for example:
    </p>

    <div class="flex justify-start">
      <ul class="list-disc text-left ml-5 space-y-1">
        <li>Your XP and level history in a named server.</li>
        <li>Warnings recorded against you in a named server.</li>
        <li>Suggestions, form responses, or starboard entries you authored.</li>
        <li>Your birthday, AFK status, or highlight words.</li>
      </ul>
    </div>

    <p>
      Server administrators can also remove most of this directly from the
      dashboard or with bot commands, which is usually faster. Requests sent by
      email are answered within one month.
    </p>

    <h2 class="text-2xl font-semibold">Retention</h2>

    <p>
      Sessions and sign-in tokens are destroyed at the moment of deletion and are
      not retained. Data belonging to a Discord server is kept for as long as the
      bot remains in that server, and is covered by the section above.
    </p>

    <h2 class="text-2xl font-semibold">Self-hosted dashboards</h2>

    <p>
      Mewdeko Mobile can be pointed at a self-hosted Mewdeko dashboard. If you
      signed in to one, your data is held by whoever runs that deployment, and
      the deletion request should go to them. The in-app steps above still revoke
      your session and clear the device.
    </p>

    <p>This page was last updated on {date}.</p>
  </div>
</div>
