<!-- routes/terms/+page.svelte -->
<script>
  import { m } from "$lib/i18n";
  let date = "12th October 2026";
  let email = "sylveon@mewdeko.tech";
</script>

<div
        class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey p-6 rounded-sm shadow-md flex justify-center items-center text-white"
>
  <div class="space-y-5 text-center">
    <h1 class="text-3xl font-semibold">{m.legal.termsTermsOfServiceForMewdeko()}</h1>

    <p>{m.legal.termsByUsingMewdekoYouAre()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.termsTheService()}</h2>

    <p>{@html m.legal.termsTheseTermsCoverTheOfficial()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.termsAcceptableUse()}</h2>

    <p>{m.legal.termsYouAgreeNotToUse()}</p>
    <div class="flex justify-center">
      <ul class="list-disc text-left">
        <li>{m.legal.termsBreakDiscordsTermsOfService()}</li>
        <li>{m.legal.termsHarassThreatenOrTargetOther()}</li>
        <li>{m.legal.termsSpamOrFloodServersOr()}</li>
        <li>{m.legal.termsAttemptToDisruptOverloadOr()}</li>
        <li>{m.legal.termsExploitBugsForAnUnfair()}</li>
      </ul>
    </div>

    <h2 class="text-2xl font-semibold">{m.legal.termsThirdPartyServices()}</h2>

    <p>{m.legal.termsSomeFeaturesConnectToServices()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.termsServiceTermination()}</h2>

    <p>{m.legal.termsWeMayTerminateOrSuspend()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.termsNoWarranty()}</h2>

    <p>{m.legal.termsTheServiceIsProvidedFree()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.termsChangesToTheService()}</h2>

    <p>{m.legal.termsWeReserveTheRightAt()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.termsArbitration()}</h2>

    <p>{m.legal.termsInTheEventOfAny()}</p>

    <h2 class="text-2xl font-semibold">{m.legal.termsContactInformation()}</h2>

    <p>{m.legal.termsIfYouHaveAnyQuestions({ email })}</p>

    <p>{m.legal.termsThisTermsOfServiceWas({ date })}</p>
  </div>
</div>
