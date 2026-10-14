<!-- routes/delete-account/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  let email = "sylveon@mewdeko.tech";
  let date = "12th October 2026";
</script>

<svelte:head>
  <title>{m.public.deleteAccountTitle()}</title>
  <meta content={m.common.siteTagline()} property="og:title" />
  <meta content={m.public.deleteAccountDescription()} name="description" />
  <meta content={m.public.deleteAccountDescription()} property="og:description" />
  <meta content={m.public.deleteAccountDescription()} name="twitter:description" />
</svelte:head>

<div
  class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey text-white p-6 rounded-sm shadow-md flex justify-center items-center"
>
  <div class="space-y-5 text-left max-w-3xl">
    <h1 class="text-3xl font-semibold">{m.public.deleteAccountTitle()}</h1>

    <p>
      {m.public.deleteAccountMewdekoMobileSignsYouIn()}
    </p>

    <h2 class="text-2xl font-semibold">{m.public.deleteAccountDeleteFromInsideTheApp()}</h2>

    <div class="flex justify-start">
      <ol class="list-decimal text-left ml-5 space-y-1">
        <li>{m.public.deleteAccountOpenMewdekoMobile()}</li>
        <li>{@html m.public.deleteAccountStepTab()}</li>
        <li>{@html m.public.deleteAccountStepPrivacy()}</li>
        <li>{@html m.public.deleteAccountStepDelete()}</li>
        <li>{m.public.deleteAccountConfirmWhenPrompted()}</li>
      </ol>
    </div>

    <p>
      {m.public.deleteAccountTheDeletionHappensImmediatelyYou()}
    </p>

    <h2 class="text-2xl font-semibold">{m.public.deleteAccountRequestDeletionByEmail()}</h2>

    <p>
      {m.public.deleteAccountEmailRequest({ email })}
    </p>

    <h2 class="text-2xl font-semibold">{m.public.deleteAccountWhatIsDeleted()}</h2>

    <div class="flex justify-start">
      <ul class="list-disc text-left ml-5 space-y-1">
        <li>{m.public.deleteAccountYourDashboardSignInSession()}</li>
        <li>{m.public.deleteAccountYourSignInTokensRemoved()}</li>
        <li>{m.public.deleteAccountTheCachedCopyOfYour()}</li>
        <li>{m.public.deleteAccountTheBotInstanceAndDashboard()}</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">{m.public.deleteAccountWhatIsKept()}</h2>

    <p>
      {m.public.deleteAccountDeletingYourMewdekoMobileData()}
    </p>

    <h2 class="text-2xl font-semibold">
      {m.public.deleteAccountDeleteSomeOfYourData()}
    </h2>

    <p>
      {m.public.deleteAccountPartialRequest({ email })}
    </p>

    <div class="flex justify-start">
      <ul class="list-disc text-left ml-5 space-y-1">
        <li>{m.public.deleteAccountYourXpAndLevelHistory()}</li>
        <li>{m.public.deleteAccountWarningsRecordedAgainstYouIn()}</li>
        <li>{m.public.deleteAccountSuggestionsFormResponsesOrStarboard()}</li>
        <li>{m.public.deleteAccountYourBirthdayAfkStatusOr()}</li>
        <li>{m.public.deleteAccountYourAiChatHistoryIn()}</li>
        <li>{m.public.deleteAccountConfessionsYouSubmittedOrTicket()}</li>
        <li>{m.public.deleteAccountActivityRecordedAboutYouBy()}</li>
      </ul>
    </div>

    <p>
      {m.public.deleteAccountServerAdministratorsCanAlsoRemove()}
    </p>

    <h2 class="text-2xl font-semibold">{m.common.retention()}</h2>

    <p>
      {m.public.deleteAccountSessionsAndSignInTokens()}
    </p>

    <h2 class="text-2xl font-semibold">{m.public.deleteAccountSelfHostedDashboards()}</h2>

    <p>
      {m.public.deleteAccountMewdekoMobileCanBePointed()}
    </p>

    <p>{m.public.deleteAccountLastUpdated({ date })}</p>
  </div>
</div>
