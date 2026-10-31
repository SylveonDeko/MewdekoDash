<!-- routes/privacy/+page.svelte -->
<script>
  import { m } from "$lib/i18n";
  let date = "31st October 2026";
  let email = "sylveon@mewdeko.tech";
</script>

<svelte:head>
  <meta
    content={m.common.siteTagline()}
    property="og:title"
  >
  <meta content={m.legal.privacyDescription()} name="description" />
  <meta content={m.legal.privacyDescription()} property="og:description" />
  <meta content={m.legal.privacyDescription()} name="twitter:description" />
</svelte:head>

<div
        class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey text-white p-6 rounded-sm shadow-md flex justify-center items-center"
>
  <div class="space-y-5 text-center text-left">
    <h1 class="text-3xl font-semibold">{m.legal.privacyDescription()}</h1>

    <p>{m.legal.privacyThisPrivacyPolicyExplainsHow()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyWhatDataDoWeCollect()}</h2>

    <p>{m.legal.privacyMewdekoCollectsTheFollowingData()}</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>{m.common.userId()}</li>
        <li>{m.legal.privacyUsernamesNicknamesAndAvatars()}</li>
        <li>{m.legal.privacyServerIdAndTheChannel()}</li>
        <li>{@html m.legal.privacyTheContentOfMessagesWhere()}</li>
        <li>{m.legal.privacyActivityInAServerMessage()}</li>
        <li>{@html m.legal.privacyYourDiscordStatusAndActivities()}</li>
        <li>{m.legal.privacyThingsYouCreateWithThe()}</li>
        <li>{m.legal.privacyYourDiscordAvatarWhenYou()}</li>
        <li>{m.legal.privacySignInTokensIssuedTo()}</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">{m.legal.privacyHowDoWeCollectYour()}</h2>

    <p>{m.legal.privacyYouDirectlyProvideMewdekoWith()}</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>{m.legal.privacyInteractWithTheBotThrough()}</li>
        <li>{m.legal.privacySendMessagesJoinOrLeave()}</li>
        <li>{m.legal.privacyUseOrViewOurBot()}</li>
        <li>{m.legal.privacySignInToTheDashboard()}</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">{m.legal.privacyHowWillWeUseYour()}</h2>

    <p>{m.legal.privacyMewdekoCollectsYourDataSo()}</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>{m.legal.privacyOperateTheBotAndProvide()}</li>
        <li>{m.legal.privacyShowServerAdministratorsAnAudit()}</li>
        <li>{m.legal.privacyDiagnoseErrorsAndFaultsSo()}</li>
        <li>{m.legal.privacyMakeImprovementsBasedOnUser()}</li>
        <li>{m.legal.privacyMeasureHowTheBotAnd()}</li>
      </ul>
    </div>

    <p>{m.legal.privacyWeDoNotProfileYou()}</p>

    <h2 class="text-2xl font-semibold" id="message-content">{m.common.messageContent()}</h2>

    <p>{m.legal.privacyMewdekoReadsTheMessagesIn()}</p>

    <p>{m.legal.privacySomeFeaturesDoKeepMessage()}</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>{m.legal.privacyMessageLogsWhenAServer()}</li>
        <li>{m.legal.privacySnipeWhenAServerTurns()}</li>
        <li>{m.legal.privacySupportTicketsAndChatSaver()}</li>
        <li>{m.legal.privacyStarboardACopyOfMessages()}</li>
        <li>{m.legal.privacySuggestionsConfessionsAfkMessagesAnd()}</li>
        <li>{m.legal.privacyAiChatMessagesSentIn()}</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold" id="presence">{m.legal.privacyStatusAndActivities()}</h2>

    <p>{m.legal.privacySomeFeaturesReadYourDiscord()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyHowDoWeStoreYour()}</h2>

    <p>{m.legal.privacyMewdekoStoresYourDataIn()}</p>

    <p>{m.legal.privacyDataBelongingToADiscord()}</p>

    <p>{m.legal.privacySomeFeaturesKeepTheirOwn()}</p>

    <p>{m.legal.privacyUsageRecordsSuchAsWhich()}</p>

    <p>{m.legal.privacySignInSessionsForThe()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyWhoElseProcessesYourData()}</h2>

    <p>{m.legal.privacyWhenTheBotOrThe()}</p>

    <p>{m.legal.privacyIfAServerSetsUp()}</p>

    <p>{m.legal.privacyDiscordItselfProcessesYourData()}</p>

    <p>{m.legal.privacyOnFluxerTheBot()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyTheMewdekoMobileApp()}</h2>

    <p>{m.legal.privacyMewdekoMobileSignsYouIn()}</p>

    <p>{m.legal.privacyTheSignInTokensIssued()}</p>

    <p>{m.legal.privacyMewdekoMobileCanBePointed()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyDeletingYourData()}</h2>

    <p>{m.legal.privacyInMewdekoMobileOpenThe()}</p>

    <p>{@html m.legal.privacyYouCanAlsoHaveSpecific()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyWhatAreYourDataProtection()}</h2>

    <p>{m.legal.privacyWeWouldLikeToMake()}</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>{m.legal.privacyTheRightToAccessYou()}</li>
        <li>{m.legal.privacyTheRightToRectificationYou()}</li>
        <li>{m.legal.privacyTheRightToErasureYou()}</li>
        <li>{m.legal.privacyTheRightToRestrictProcessing()}</li>
      </ul>
    </div>

    <p>{m.legal.privacyIfYouMakeARequest({ email })}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyChangesToOurPrivacyPolicy()}</h2>

    <p>{m.legal.privacyMewdekoKeepsItsPrivacyPolicy({ date })}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyHowToContactUs()}</h2>

    <p>{m.legal.privacyIfYouHaveAnyQuestions({ email })}</p>

    <h2 class="text-2xl font-semibold">{m.legal.privacyHowToContactTheAppropriate()}</h2>

    <p>{m.legal.privacyShouldYouWishToReport()}</p>
  </div>
</div>
