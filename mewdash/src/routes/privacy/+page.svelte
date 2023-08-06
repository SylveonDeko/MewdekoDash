<script>
  let date = "6th August 2023";
  let email = "sylveon@mewdeko.tech";
</script>

<svelte:head>
  <meta content="Mewdeko - The most customizable discord bot." property="og:title">
  <meta content="Privacy Policy for Mewdeko" name="description">
  <meta content="Privacy Policy for Mewdeko" property="og:description">
  <meta content="Privacy Policy for Mewdeko" name="twitter:description">
</svelte:head>

<div class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey text-white p-6 rounded shadow-md flex justify-center items-center">

  <div class="space-y-5 text-center text-left">
    <h1 class="text-3xl font-semibold">Privacy Policy for Mewdeko</h1>

    <p>This privacy policy will explain how our organization uses the personal data we collect from you when you use Mewdeko, our Discord bot.</p>

    <h2 class="text-2xl font-semibold">What data do we collect?</h2>

    <p>Mewdeko collects the following data:</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>User ID</li>
        <li>Usernames</li>
        <li>Server ID</li>
        <li>Messages sent to the bot in direct messages or mentioned in a server (only while performing a command)</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">How do we collect your data?</h2>

    <p>You directly provide Mewdeko with most of the data we collect. We collect data and process data when you:</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>Interact with the bot through commands</li>
        <li>Use or view our bot via your browser’s cookies</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">How will we use your data?</h2>

    <p>Mewdeko collects your data so that we can:</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>Operate the bot and provide functionality</li>
        <li>Understand how users interact with the bot</li>
        <li>Make improvements based on user feedback and usage</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">How do we store your data?</h2>

    <p>Mewdeko securely stores your data at Hetzner using encrypted sql.</p>
    <p>Mewdeko will keep your data for 30 Days (or more depending on the use). Once this time period has expired, we will delete your data.</p>

    <h2 class="text-2xl font-semibold">What are your data protection rights?</h2>

    <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>The right to access – You have the right to request from Mewdeko copies of your personal data.</li>
        <li>The right to rectification – You have the right to request that Mewdeko correct any information you believe is inaccurate. You also have the right to request Mewdeko to complete the information you believe is incomplete.</li>
        <li>The right to erasure – You have the right to request that Mewdeko erase your personal data.</li>
        <li>The right to restrict processing – You have the right to request that Mewdeko restrict the processing of your personal data.</li>
      </ul>
    </div>

    <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our email: {email}</p>

    <h2 class="text-2xl font-semibold">Changes to our privacy policy</h2>

    <p>Mewdeko keeps its privacy policy under regular review and places any updates on this web page. This privacy policy was last updated on {date}.</p>

    <h2 class="text-2xl font-semibold">How to contact us</h2>

    <p>If you have any questions about Mewdeko's privacy policy, the data we hold on you, or you would like to exercise one of your data protection rights, please do not hesitate to contact us at our email: {email}</p>

    <h2 class="text-2xl font-semibold">How to contact the appropriate authority</h2>

    <p>Should you wish to report a complaint or if you feel that Mewdeko has not addressed your concern in a satisfactory manner, you may contact the Information Commissioner’s Office (or your local data protection authority).</p>
  </div>
</div>
