<!-- routes/terms/+page.svelte -->
<script>
  let date = "12th October 2026";
  let email = "sylveon@mewdeko.tech";
</script>

<div
        class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey p-6 rounded-sm shadow-md flex justify-center items-center text-white"
>
  <div class="space-y-5 text-center">
    <h1 class="text-3xl font-semibold">Terms of Service for Mewdeko</h1>

    <p>
      By using Mewdeko, you are agreeing to be bound by the following terms and
      conditions ("Terms of Service").
    </p>

    <h2 class="text-2xl font-semibold">The Service</h2>

    <p>
      These Terms cover the official Mewdeko Discord bot, this dashboard, and
      the Mewdeko Mobile app for Android and iOS (together, the "Service").
      Copies of Mewdeko run by other people, and dashboards they host, are not
      operated by us and are not covered by these Terms. How we handle your
      data is described in our
      <a class="underline" href="/privacy">Privacy Policy</a>.
    </p>

    <h2 class="text-2xl font-semibold">Acceptable Use</h2>

    <p>You agree not to use the Service to:</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>
          Break Discord's Terms of Service or Community Guidelines, or any law
          that applies to you
        </li>
        <li>
          Harass, threaten or target other people, including through
          confessions, suggestions, AI chat or messages the bot sends for you
        </li>
        <li>Spam, or flood servers or users with messages or commands</li>
        <li>
          Attempt to disrupt, overload, or gain unauthorised access to the
          bot, the dashboard, or the systems they run on
        </li>
        <li>
          Exploit bugs for an unfair advantage, such as in the economy, XP or
          giveaways, instead of reporting them
        </li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">Third-Party Services</h2>

    <p>
      Some features connect to services we do not control, such as the AI
      providers a server chooses for AI chat, music sources, and social feeds.
      Your use of those services is subject to their own terms, and we are not
      responsible for what they provide.
    </p>

    <h2 class="text-2xl font-semibold">Service Termination</h2>

    <p>
      We may terminate or suspend access to our Service immediately, without
      prior notice or liability, for any reason whatsoever, including, without
      limitation, if you breach the Terms. All provisions of the Terms which by
      their nature should survive termination shall survive termination,
      including, without limitation, ownership provisions, warranty disclaimers,
      indemnity and limitations of liability.
    </p>

    <h2 class="text-2xl font-semibold">No Warranty</h2>

    <p>
      The Service is provided free of charge, "as is" and "as available",
      without warranties of any kind. We do not guarantee that it will always
      be available or free of errors, or that data stored by it will never be
      lost, and to the extent permitted by law we are not liable for any loss
      resulting from your use of it.
    </p>

    <h2 class="text-2xl font-semibold">Changes To The Service</h2>

    <p>
      We reserve the right, at our sole discretion, to modify or replace these
      Terms at any time. If a revision is material we will make reasonable
      efforts to provide at least 30 days' notice prior to any new terms taking
      effect. What constitutes a material change will be determined at our sole
      discretion.
    </p>

    <h2 class="text-2xl font-semibold">Arbitration</h2>

    <p>
      In the event of any dispute, claim, question, or disagreement arising from
      or relating to the Terms of Service or the breach thereof, the parties
      hereto shall use their best efforts to settle such disputes, claims,
      questions, or disagreement. To this effect, they shall consult and
      negotiate with each other in good faith and, recognizing their mutual
      interests, attempt to reach a just and equitable solution satisfactory to
      both parties. If they do not reach such solution within a period of 60
      days, then upon notice by either party to the other, disputes, claims,
      questions, or differences shall be finally settled by arbitration
      administered by the International Chamber of Commerce (ICC) in accordance
      with the provisions of its Arbitration Rules.
    </p>

    <h2 class="text-2xl font-semibold">Contact Information</h2>

    <p>
      If you have any questions about these Terms, please contact us at {email}.
    </p>

    <p>This Terms of Service was last updated on {date}.</p>
  </div>
</div>
