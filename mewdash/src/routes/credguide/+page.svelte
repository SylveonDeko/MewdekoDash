<!-- routes/credguide/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
    import {onDestroy, onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import {colorStore} from "$lib/stores/colorStore";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import ComponentEmbed from "$lib/components/layout/ComponentEmbed.svelte";
    import { buttons, container, header, linkButton, SITE_ORIGIN, separator } from "$lib/componentEmbed";

    let mounted = $state(false);

    const previewEmbed = $derived(
      container(
        header(`## ${m.public.credguideEmbedTitle()}\n${m.public.credguideEmbedSummary()}`, `${SITE_ORIGIN}/img/Mewdeko.png`),
        separator(),
        buttons(linkButton(m.public.credguideEmbedButton(), `${SITE_ORIGIN}/credguide`))
      )
    );
  let currentStep = $state(0);
  let completedSteps: Set<number> = $state(new Set());
  let showAllSteps = $state(false);
  let selectedOS: "linux" | "windows" = $state("linux");

  type StepBase = { title: string; icon: string; description: string; required: boolean; estimatedTime: string };
  type Step =
    | (StepBase & { id: "overview"; content: { intro: string; highlights: string[]; note: string } })
    | (StepBase & { id: "bot-token"; content: { intro: string; steps: string[]; warning: string; example: string } })
    | (StepBase & {
        id: "database";
        content: {
          intro: string;
          linuxSteps: { step: string; command: string; note?: string }[];
          windowsSteps: { step: string; command: string; note?: string }[];
          connectionExamples: { linux: string; windows: string };
        };
      })
    | (StepBase & {
        id: "owner-id";
        content: { intro: string; steps: string[]; singleOwner: string; multipleOwners: string };
      })
    | (StepBase & {
        id: "api-keys";
        content: {
          intro: string;
          keys: { name: string; purpose: string; required: boolean; priority: string; steps: string[] }[];
        };
      })
    | (StepBase & {
        id: "final-config";
        content: {
          intro: string;
          additionalSettings: { name: string; purpose: string; example: string }[];
          finalExample: string;
        };
      });

  const steps: Step[] = $derived([
    {
      id: "overview",
      title: m.common.overview(),
      icon: "fa-clipboard-list",
      description: m.public.credguideUnderstandingCredentialsSetup(),
      required: true,
      estimatedTime: m.features.setupTimeSingle({ minutes: 2 }),
      content: {
        intro: m.public.credguideWelcomeToTheMewdekoCredentials(),
        highlights: [
          m.public.credguideBotTokenConfiguration(),
          m.public.credguideDatabaseSetup(),
          m.public.credguideOwnerIdConfiguration(),
          m.public.credguideOptionalApiKeysForEnhanced()
        ],
        note: m.public.credguideTheCredentialsExampleJsonFile()
      }
    },
    {
      id: "bot-token",
      title: m.common.botToken(),
      icon: "fa-robot",
      description: m.public.credguideGetYourDiscordBotToken2(),
      required: true,
      estimatedTime: m.features.setupTimeSingle({ minutes: 5 }),
      content: {
        intro: m.public.credguideYourBotTokenIsThe(),
        steps: [
          m.public.credguideGoToTheDiscordDeveloper(),
          m.public.credguideClickOnNewApplication(),
          m.public.credguideGiveYourApplicationAName(),
          m.public.credguideNavigateToTheBotTab(),
          m.public.credguideClickAddBotAndConfirm(),
          m.public.credguideUnderTheTokenSectionClick()
        ],
        warning: m.public.credguideNeverShareYourBotToken(),
        example: "\"Token\": \"YOUR_BOT_TOKEN_HERE\""
      }
    },
    {
      id: "database",
      title: m.public.credguideDatabaseSetup(),
      icon: "fa-database",
      description: m.public.credguideConfigurePostgresqlDatabase(),
      required: true,
      estimatedTime: m.features.setupTimeSingle({ minutes: 15 }),
      content: {
        intro: m.public.credguideMewdekoUsesPostgresqlToStore(),
        linuxSteps: [
          {
            step: m.public.credguideUpdateSystemPackages(),
            command: "sudo apt update && sudo apt upgrade -y"
          },
          {
            step: m.public.credguideInstallPostgresqlAndAdditionalComponents(),
            command: "sudo apt install postgresql postgresql-contrib -y"
          },
          {
            step: m.public.credguideStartAndEnablePostgresqlService(),
            command: "sudo systemctl start postgresql\nsudo systemctl enable postgresql"
          },
          {
            step: m.public.credguideSwitchToPostgresUser(),
            command: "sudo -i -u postgres"
          },
          {
            step: m.public.credguideCreateANewDatabaseUser(),
            command: "createuser --interactive --pwprompt mewdeko",
            note: m.public.credguideWhenPromptedEnterYFor()
          },
          {
            step: m.public.credguideCreateTheDatabase(),
            command: "createdb -O mewdeko mewdeko"
          },
          {
            step: m.public.credguideExitPostgresUser(),
            command: "exit"
          },
          {
            step: m.public.credguideTestTheConnection(),
            command: "psql -U mewdeko -d mewdeko -h localhost",
            note: m.public.credguideEnterThePasswordYouSet()
          }
        ],
        windowsSteps: [
          {
            step: m.public.credguideDownloadPostgresqlInstaller(),
            command: m.public.credguideVisitHttpsWwwPostgresqlOrg()
          },
          {
            step: m.public.credguideRunTheInstaller(),
            command: m.public.credguideExecuteTheDownloadedExeFile(),
            note: m.public.credguideDuringInstallationRememberThePassword()
          },
          {
            step: m.public.credguideOpenCommandPromptAsAdministrator(),
            command: m.public.credguidePressWinXAndSelect()
          },
          {
            step: m.public.credguideNavigateToPostgresqlBinDirectory(),
            command: "cd \"C:\\Program Files\\PostgreSQL\\15\\bin\"",
            note: m.public.credguideReplace15WithYourPostgresql()
          },
          {
            step: m.public.credguideConnectToPostgresql(),
            command: "psql -U postgres"
          },
          {
            step: m.public.credguideCreateANewUser(),
            command: "CREATE USER mewdeko WITH PASSWORD 'your_secure_password' SUPERUSER;"
          },
          {
            step: m.public.credguideCreateTheDatabase(),
            command: "CREATE DATABASE mewdeko OWNER mewdeko;"
          },
          {
            step: m.public.credguideExitPsql(),
            command: "\\q"
          },
          {
            step: m.public.credguideTestTheConnection(),
            command: "psql -U mewdeko -d mewdeko -h localhost",
            note: m.public.credguideEnterYourPasswordWhenPrompted()
          }
        ],
        connectionExamples: {
          linux: "\"PsqlConnectionString\": \"Server=localhost;Database=mewdeko;Port=5432;UID=mewdeko;Password=your_secure_password\"",
          windows: "\"PsqlConnectionString\": \"Server=localhost;Database=mewdeko;Port=5432;UID=mewdeko;Password=your_secure_password\""
        }
      }
    },
    {
      id: "owner-id",
      title: m.public.credguideOwnerId(),
      icon: "fa-crown",
      description: m.public.credguideConfigureBotOwnerPermissions(),
      required: true,
      estimatedTime: m.features.setupTimeSingle({ minutes: 3 }),
      content: {
        intro: m.public.credguideTheOwnerIdGivesYou(),
        steps: [
          m.public.credguideGoToYourDiscordServer(),
          m.public.credguideTypeYourusernameWithABackslash(),
          m.public.credguideSendTheMessageItWill(),
          m.public.credguideCopyTheNumbersYourUser(),
          m.public.credguideAddItToYourCredentials()
        ],
        singleOwner: "\"OwnerIds\": [123456789012345678]",
        multipleOwners: "\"OwnerIds\": [123456789012345678, 987654321098765432]"
      }
    },
    {
      id: "api-keys",
      title: m.public.credguideApiKeys(),
      icon: "fa-key",
      description: m.public.credguideOptionalApiKeysForEnhanced(),
      required: false,
      estimatedTime: m.features.setupTimeSingle({ minutes: 10 }),
      content: {
        intro: m.public.credguideTheseApiKeysAreOptional(),
        keys: [
          {
            name: "GoogleApiKey",
            purpose: m.public.credguideYoutubeSearchAndPlaylistQueuing(),
            required: false,
            priority: "high",
            steps: [
              m.public.credguideGoToHttpsConsoleDevelopers(),
              m.public.credguideCreateANewProject(),
              m.public.credguideGoToLibraryAndEnable(),
              m.public.credguideGoToCredentialsCreateCredentials(),
              m.public.credguideCopyTheKeyToYour()
            ]
          },
          {
            name: "SpotifyClientId & SpotifyClientSecret",
            purpose: m.public.credguideSpotifyTrackAndPlaylistSupport(),
            required: false,
            priority: "high",
            steps: [
              m.public.credguideGoToHttpsDeveloperSpotify(),
              m.public.credguideClickCreateApp(),
              m.public.credguideFillInANameAnd(),
              m.public.credguideCopyTheClientIdAnd()
            ]
          },
          {
            name: "TwitchClientId & TwitchClientSecret",
            purpose: m.public.credguideTwitchStreamNotifications(),
            required: false,
            priority: "medium",
            steps: [
              m.public.credguideGoToHttpsDevTwitch(),
              m.public.credguideClickRegisterYourApplication(),
              m.public.credguideSetOauthRedirectUrlTo(),
              m.public.credguideSelectChatBotCategory(),
              m.public.credguideCopyClientIdAndClient()
            ]
          },
          {
            name: "LastFmApiKey",
            purpose: m.public.credguideLastFmNowPlayingAnd(),
            required: false,
            priority: "low",
            steps: [
              m.public.credguideGoToHttpsWwwLast(),
              m.public.credguideFillInTheApplicationName(),
              m.public.credguideCopyTheApiKeyTo()
            ]
          },
          {
            name: "OsuApiKey",
            purpose: m.public.credguideOsuPlayerStatsLookup(),
            required: false,
            priority: "low",
            steps: [
              m.public.credguideGoToHttpsOsuPpy(),
              m.public.credguideClickNewLegacyApiKey(),
              m.public.credguideCopyTheKeyToYour()
            ]
          }
        ]
      }
    },
    {
      id: "final-config",
      title: m.public.credguideFinalConfiguration(),
      icon: "fa-circle-check",
      description: m.public.credguideCompleteYourSetup(),
      required: true,
      estimatedTime: m.features.setupTimeSingle({ minutes: 5 }),
      content: {
        intro: m.public.credguideReviewYourFinalConfigurationAnd(),
        additionalSettings: [
          {
            name: "LavalinkUrl",
            purpose: m.public.credguideMusicPlaybackServerAddress(),
            example: "\"LavalinkUrl\": \"http://localhost:2334\""
          },
          {
            name: "RedisConnections",
            purpose: m.public.credguideRedisConnectionStringForCaching(),
            example: "\"RedisConnections\": \"127.0.0.1:6379\""
          },
          {
            name: "IsApiEnabled / ApiPort / ApiKey",
            purpose: m.public.credguideEnableTheBotsHttpApi(),
            example: "\"IsApiEnabled\": true, \"ApiPort\": 5001, \"ApiKey\": \"your-secure-key\""
          },
          {
            name: "JwtSecret",
            purpose: m.public.credguideSignsDashboardUserTokensMust(),
            example: "\"JwtSecret\": \"your-secret-here\""
          }
        ],
        finalExample: `{
  "Token": "YOUR_BOT_TOKEN_HERE",
  "OwnerIds": [123456789012345678],
  "PsqlConnectionString": "Server=localhost;Database=mewdeko;Port=5432;UID=mewdeko;Password=your_password",
  "RedisConnections": "127.0.0.1:6379",
  "GoogleApiKey": "YOUR_GOOGLE_API_KEY",
  "SpotifyClientId": "YOUR_SPOTIFY_CLIENT_ID",
  "SpotifyClientSecret": "YOUR_SPOTIFY_CLIENT_SECRET",
  "LavalinkUrl": "http://localhost:2334",
  "IsApiEnabled": true,
  "ApiPort": 5001,
  "ApiKey": "YOUR_API_KEY",
  "JwtSecret": "YOUR_JWT_SECRET"
}`
      }
    }
  ]);

  // Navigation functions
  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }

  function goToStep(stepIndex: number) {
    currentStep = stepIndex;
  }

  function markStepComplete(stepIndex: number) {
    completedSteps.add(stepIndex);
    completedSteps = completedSteps; // Trigger reactivity
  }

  function markStepIncomplete(stepIndex: number) {
    completedSteps.delete(stepIndex);
    completedSteps = completedSteps; // Trigger reactivity
  }

  // Keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowRight" && currentStep < steps.length - 1) {
      nextStep();
    } else if (event.key === "ArrowLeft" && currentStep > 0) {
      prevStep();
    }
  }

  // Progress calculation
  let progress = $derived(((completedSteps.size) / steps.length) * 100);
  let currentStepData = $derived(steps[currentStep]);
  let requiredSteps = $derived(steps.filter(step => step.required).length);
  let completedRequiredSteps = $derived(steps.filter((step, index) => step.required && completedSteps.has(index)).length);

  onMount(() => {
    mounted = true;
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
  });
</script>

<ComponentEmbed embed={previewEmbed} />

<svelte:head>
  <title>{m.public.credguideTitle()}</title>
  <meta content={m.public.credguideOgTitle()} property="og:title" />
  <meta content={m.public.credguideDescription()} name="description" />
  <meta content={m.public.credguideDescription()} property="og:description" />
  <meta content={m.public.credguideDescription()} name="twitter:description" />
</svelte:head>

{#if mounted}
  <main
    class="min-h-screen"
    style="--color-primary: {$colorStore.primary};
           --color-secondary: {$colorStore.secondary};
           --color-accent: {$colorStore.accent};
           --color-text: {$colorStore.text};
           --color-muted: {$colorStore.muted};
           background: radial-gradient(circle at center,
             {$colorStore.gradientStart}15 0%,
             {$colorStore.gradientEnd}10 50%,
             {$colorStore.gradientEnd}05 100%
           );"
    in:fade
  >
    <!-- Header -->
    <div class="py-4 backdrop-blur-lg border-b shadow-lg"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15 0%, {$colorStore.gradientEnd}10 100%); border-color: {$colorStore.primary}30;">
      <div class="container mx-auto px-3 sm:px-4 lg:px-4 py-2 sm:py-3">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-lg lg:text-xl font-bold mb-1" style="color: {$colorStore.text};">
              {m.public.credguideCredentialsSetupWizard()}
            </h1>
            <p class="text-sm" style="color: {$colorStore.muted};">
              {m.public.credguideConfigureYourMewdekoBotStep()}
            </p>
          </div>

          <!-- Progress bar -->
          <div class="shrink-0 lg:max-w-md lg:w-full">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium" style="color: {$colorStore.text};">
                {m.public.credguideProgress({ completed: completedRequiredSteps, required: requiredSteps })}
              </span>
              <span class="text-sm" style="color: {$colorStore.muted};">
                {Math.round(progress)}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                 style="background: {$colorStore.primary}20;">
              <div
                class="h-2 rounded-full transition-all duration-500 ease-out"
                style="width: {progress}%; background: linear-gradient(90deg, {$colorStore.gradientStart}, {$colorStore.gradientMid});"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 sm:px-8 lg:px-4 py-8 max-w-7xl">
      <div class="grid lg:grid-cols-4 gap-6 lg:gap-8">
        <!-- Step Navigation Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-32">
            <!-- Mobile Step Selector -->
            <div class="lg:hidden mb-6">
              <DiscordSelector
                type="custom"
                options={steps.map((step, index) => ({
                  id: index.toString(),
                  name: step.required ? m.public.credguideRequiredStepOption({ title: step.title }) : step.title
                }))}
                selected={currentStep.toString()}
                searchable={false}
                ariaLabel="Setup step"
                onchange={(e) => { if (typeof e.selected === "string") currentStep = parseInt(e.selected); }}
              />
            </div>

            <!-- Desktop Step Navigation -->
            <div class="hidden lg:block">
              <h3 class="font-semibold mb-4" style="color: {$colorStore.text};">{m.public.credguideSetupSteps()}</h3>
              <nav class="space-y-2">
                {#each steps as step, index}
                  <button
                    class="w-full text-left p-3 rounded-xl transition-all duration-200 border group"
                    style="{index === currentStep 
                      ? `background: linear-gradient(135deg, ${$colorStore.gradientStart}20, ${$colorStore.gradientMid}25); border-color: ${$colorStore.primary}; color: ${$colorStore.text};` 
                      : `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}20; color: ${$colorStore.muted};`}"
                    onclick={() => goToStep(index)}
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <i class="fa-solid {step.icon} text-xl" style="color: {index === currentStep ? $colorStore.primary : $colorStore.muted};"></i>
                        <div>
                          <div class="font-medium text-sm">
                            {step.title}
                            {#if step.required}
                              <span class="ml-1" style="color: {$colorStore.accent};">*</span>
                            {/if}
                          </div>
                          <div class="text-xs opacity-70">{step.estimatedTime}</div>
                        </div>
                      </div>
                      {#if completedSteps.has(index)}
                        <div class="w-5 h-5 rounded-full flex items-center justify-center" style="background: {$colorStore.secondary};">
                          <i class="fa-solid fa-check" style="color: {$colorStore.text}; font-size: 12px;"></i>
                        </div>
                      {/if}
                    </div>
                  </button>
                {/each}
              </nav>

              <!-- Quick Actions -->
              <div class="mt-6 p-4 rounded-xl "
                   style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                <h4 class="font-medium mb-3" style="color: {$colorStore.text};">{m.common.quickActions()}</h4>
                <div class="space-y-2">
                  <button
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02] flex items-center gap-2"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                    onclick={() => showAllSteps = !showAllSteps}
                  >
                    <i class="fa-solid {showAllSteps ? 'fa-clipboard-list' : 'fa-scroll'}"></i>
                    {showAllSteps ? m.public.credguideShowWizard() : m.public.credguideShowAllSteps()}
                  </button>
                  <button
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02] flex items-center gap-2"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                    onclick={() => completedSteps = new Set()}
                  >
                    <i class="fa-solid fa-rotate-right"></i>
                    {m.public.credguideResetProgress()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          {#if showAllSteps}
            <!-- All Steps View -->
            <div class="space-y-8" in:fade={{ duration: 300 }}>
              {#each steps as step, index}
                <div class="rounded-2xl p-6  border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}20;">
                  <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold flex items-center gap-3" style="color: {$colorStore.text};">
                      <i class="fa-solid {step.icon} text-3xl" style="color: {$colorStore.primary};"></i>
                      {step.title}
                      {#if step.required}
                        <span style="color: {$colorStore.accent};">*</span>
                      {/if}
                    </h2>
                    <button
                      class="px-4 py-2 rounded-lg transition-all"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                      onclick={() => { goToStep(index); showAllSteps = false; }}
                    >
                      {m.public.credguideEnterWizard()}
                    </button>
                  </div>

                  <p class="mb-4" style="color: {$colorStore.muted};">{step.description}</p>

                  <!-- Simplified content for overview -->
                  {#if step.id === 'overview'}
                    <ul class="space-y-2 list-disc list-inside">
                      {#each step.content.highlights as highlight}
                        <li style="color: {$colorStore.text};">{highlight}</li>
                      {/each}
                    </ul>
                  {:else if step.id === 'bot-token'}
                    <div class="space-y-2">
                      <p style="color: {$colorStore.text};">{m.public.credguideGetYourDiscordBotToken()}</p>
                      <code class="block p-2 rounded-sm"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text};">{step.content.example}</code>
                    </div>
                  {:else if step.id === 'database'}
                    <div class="space-y-2">
                      <p style="color: {$colorStore.text};">{m.public.credguideConfigurePostgresqlForDataStorage()}</p>
                      <code class="block p-2 rounded-sm"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text};">{step.content.connectionExamples.linux}</code>
                    </div>
                  {:else if step.id === 'owner-id'}
                    <div class="space-y-2">
                      <p style="color: {$colorStore.text};">{m.public.credguideSetUpBotOwnerPermissions()}</p>
                      <code class="block p-2 rounded-sm"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text};">{step.content.singleOwner}</code>
                    </div>
                  {:else if step.id === 'api-keys'}
                    <div class="grid md:grid-cols-2 gap-4">
                      {#each step.content.keys as key}
                        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}10;">
                          <h4 class="font-medium" style="color: {$colorStore.text};">{key.name}</h4>
                          <p class="text-sm" style="color: {$colorStore.muted};">{key.purpose}</p>
                        </div>
                      {/each}
                    </div>
                  {:else if step.id === 'final-config'}
                    <div class="space-y-2">
                      <p style="color: {$colorStore.text};">{m.public.credguideReviewAndFinalizeYourConfiguration()}</p>
                      <pre class="p-3 rounded-lg text-sm overflow-x-auto"
                           style="background: {$colorStore.primary}15; color: {$colorStore.text};">{step.content.finalExample}</pre>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <!-- Wizard Step View -->
            <div class="wizard-content" in:fade={{ duration: 300 }}>
              <div class="rounded-2xl p-6 sm:p-8  border"
                   style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}20;">

                <!-- Step Header -->
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}40);">
                      <i class="fa-solid {currentStepData.icon} text-3xl" style="color: {$colorStore.text};"></i>
                    </div>
                    <div>
                      <h2 class="text-3xl font-bold" style="color: {$colorStore.text};">
                        {currentStepData.title}
                        {#if currentStepData.required}
                          <span class="ml-2" style="color: {$colorStore.accent};">*</span>
                        {/if}
                      </h2>
                      <p class="text-lg" style="color: {$colorStore.muted};">
                        {currentStepData.description}
                      </p>
                      <div class="flex items-center gap-4 mt-2 text-sm" style="color: {$colorStore.muted};">
                        <span class="flex items-center gap-1">
                          <i class="fa-solid fa-clock"></i>
                          {currentStepData.estimatedTime}
                        </span>
                        <span class="flex items-center gap-1">
                          <i class="fa-solid fa-location-dot"></i>
                          {m.common.stepCurrentOfTotal({ current: currentStep + 1, total: steps.length })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    class="px-4 py-2 rounded-lg transition-all hover:scale-[1.02] flex items-center gap-2"
                    style="background: {completedSteps.has(currentStep) ? $colorStore.secondary : $colorStore.primary + '20'}; color: {$colorStore.text};"
                    onclick={() => completedSteps.has(currentStep) ? markStepIncomplete(currentStep) : markStepComplete(currentStep)}
                  >
                    <i class="fa-solid {completedSteps.has(currentStep) ? 'fa-circle-check' : 'fa-circle'}"></i>
                    {completedSteps.has(currentStep) ? m.public.credguideCompleted() : m.public.credguideMarkComplete()}
                  </button>
                </div>

                <!-- Step Content -->
                <div class="prose prose-lg max-w-none" style="color: {$colorStore.text};">
                  {#if currentStepData.id === 'overview'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-xl mb-6">{currentStepData.content.intro}</p>

                      <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
                          <h3 class="font-semibold mb-4" style="color: {$colorStore.text};">{m.public.credguideWhatYoullConfigure()}</h3>
                          <ul class="space-y-2 list-disc list-inside">
                            {#each currentStepData.content.highlights as highlight}
                              <li style="color: {$colorStore.text};">{highlight}</li>
                            {/each}
                          </ul>
                        </div>

                        <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
                          <h3 class="font-semibold mb-4" style="color: {$colorStore.text};">{m.public.credguideImportantNote()}</h3>
                          <p class="text-sm">{currentStepData.content.note}</p>
                        </div>
                      </div>
                    </div>
                  {:else if currentStepData.id === 'bot-token'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-lg mb-8">{currentStepData.content.intro}</p>

                      <div class="mb-8 p-5 rounded-xl" style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}40;">
                        <div class="flex items-start gap-3">
                          <i class="fa-solid fa-triangle-exclamation text-xl shrink-0" style="color: {$colorStore.accent};"></i>
                          <p class="text-lg"><strong>{m.public.credguideSecurityWarning()}</strong> {currentStepData.content.warning}</p>
                        </div>
                      </div>

                      <ol class="space-y-3 mb-10 list-decimal list-inside">
                        {#each currentStepData.content.steps as step}
                          <li class="text-base" style="color: {$colorStore.text};">{step}</li>
                        {/each}
                      </ol>

                      <div class="p-8 rounded-xl border"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                        <h4 class="text-lg font-semibold mb-6" style="color: {$colorStore.text};">{m.public.credguideAddToCredentialsJson()}</h4>
                        <div class="p-5 rounded-xl border"
                             style="background: {$colorStore.primary}15; border-color: {$colorStore.primary}30;">
                          <code class="block text-sm font-mono" style="color: {$colorStore.text};">
                            {currentStepData.content.example}
                          </code>
                        </div>
                      </div>
                    </div>
                  {:else if currentStepData.id === 'database'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-lg mb-6">{currentStepData.content.intro}</p>

                      <!-- OS Selector -->
                      <div class="mb-8">
                        <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text};">{m.public.credguideSelectYourOperatingSystem()}</h3>
                        <div class="flex flex-col sm:flex-row gap-4 mb-6">
                          <button
                            class="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                            style="background: {selectedOS === 'linux' ? $colorStore.primary : $colorStore.primary + '20'}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                            onclick={() => selectedOS = 'linux'}
                          >
                            <i class="fa-brands fa-linux"></i>
                            {m.public.credguideLinuxUbuntuDebian()}
                          </button>
                          <button
                            class="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                            style="background: {selectedOS === 'windows' ? $colorStore.primary : $colorStore.primary + '20'}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                            onclick={() => selectedOS = 'windows'}
                          >
                            <i class="fa-brands fa-windows"></i>
                            {m.public.credguideWindows()}
                          </button>
                        </div>
                      </div>

                      {#if selectedOS === 'linux'}
                        <div class="mb-12" in:fly={{ x: -20, duration: 300 }}>
                          <h3 class="text-xl font-semibold mb-8" style="color: {$colorStore.text};">{m.public.credguideLinuxInstallationSteps()}</h3>
                          <ol class="space-y-6 list-decimal list-inside">
                            {#each currentStepData.content.linuxSteps as step}
                              <li class="list-item">
                                <h4 class="inline text-base font-semibold" style="color: {$colorStore.text};">{step.step}</h4>

                                <div class="mt-3">
                                  <div class="p-4 rounded-xl border"
                                       style="background: {$colorStore.primary}12; border-color: {$colorStore.primary}25;">
                                    <code class="block text-sm overflow-x-auto whitespace-pre-wrap font-mono"
                                          style="color: {$colorStore.text};">
                                      {step.command}
                                    </code>
                                  </div>
                                  {#if step.note}
                                    <div class="mt-3 p-3 rounded-lg"
                                         style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
                                      <p class="text-sm flex items-start gap-2" style="color: {$colorStore.text};">
                                        <i class="fa-solid fa-lightbulb shrink-0" style="color: {$colorStore.accent};"></i>
                                        <span>{step.note}</span>
                                      </p>
                                    </div>
                                  {/if}
                                </div>
                              </li>
                            {/each}
                          </ol>
                        </div>
                      {:else}
                        <div class="mb-12" in:fly={{ x: 20, duration: 300 }}>
                          <h3 class="text-xl font-semibold mb-8" style="color: {$colorStore.text};">{m.public.credguideWindowsInstallationSteps()}</h3>
                          <ol class="space-y-6 list-decimal list-inside">
                            {#each currentStepData.content.windowsSteps as step}
                              <li class="list-item">
                                <h4 class="inline text-base font-semibold" style="color: {$colorStore.text};">{step.step}</h4>

                                <div class="mt-3">
                                  <div class="p-4 rounded-xl border"
                                       style="background: {$colorStore.primary}12; border-color: {$colorStore.primary}25;">
                                    <code class="block text-sm overflow-x-auto whitespace-pre-wrap font-mono"
                                          style="color: {$colorStore.text};">
                                      {step.command}
                                    </code>
                                  </div>
                                  {#if step.note}
                                    <div class="mt-3 p-3 rounded-lg"
                                         style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
                                      <p class="text-sm flex items-start gap-2" style="color: {$colorStore.text};">
                                        <i class="fa-solid fa-lightbulb shrink-0" style="color: {$colorStore.accent};"></i>
                                        <span>{step.note}</span>
                                      </p>
                                    </div>
                                  {/if}
                                </div>
                              </li>
                            {/each}
                          </ol>
                        </div>
                      {/if}

                      <div class="p-8 rounded-xl border"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                        <h3 class="text-xl font-semibold mb-6" style="color: {$colorStore.text};">{m.public.credguideConnectionStringConfiguration()}</h3>
                        <p class="mb-6 text-lg" style="color: {$colorStore.muted};">{m.public.credguideAddThisToYourCredentials()}</p>
                        <div class="p-5 rounded-xl border"
                             style="background: {$colorStore.primary}15; border-color: {$colorStore.primary}30;">
                          <code class="block text-sm overflow-x-auto font-mono" style="color: {$colorStore.text};">
                            {currentStepData.content.connectionExamples[selectedOS]}
                          </code>
                        </div>
                        <div class="mt-6 p-4 rounded-lg" style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
                          <p class="text-sm flex items-start gap-2" style="color: {$colorStore.text};">
                            <i class="fa-solid fa-triangle-exclamation shrink-0" style="color: {$colorStore.accent};"></i>
                            <span>{m.public.credguideReplaceYourSecurePasswordWith()}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  {:else if currentStepData.id === 'owner-id'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-lg mb-8">{currentStepData.content.intro}</p>

                      <ol class="space-y-3 mb-10 list-decimal list-inside">
                        {#each currentStepData.content.steps as step}
                          <li class="text-base" style="color: {$colorStore.text};">{step}</li>
                        {/each}
                      </ol>

                      <div class="grid md:grid-cols-2 gap-8">
                        <div class="p-6 rounded-xl border"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                          <h4 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">{m.public.credguideSingleOwner()}</h4>
                          <div class="p-4 rounded-lg border"
                               style="background: {$colorStore.primary}15; border-color: {$colorStore.primary}30;">
                            <code class="block text-sm font-mono" style="color: {$colorStore.text};">
                              {currentStepData.content.singleOwner}
                            </code>
                          </div>
                        </div>

                        <div class="p-6 rounded-xl border"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                          <h4 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">{m.public.credguideMultipleOwners()}</h4>
                          <div class="p-4 rounded-lg border"
                               style="background: {$colorStore.primary}15; border-color: {$colorStore.primary}30;">
                            <code class="block text-sm font-mono" style="color: {$colorStore.text};">
                              {currentStepData.content.multipleOwners}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  {:else if currentStepData.id === 'api-keys'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-lg mb-6">{currentStepData.content.intro}</p>

                      <div class="space-y-6">
                        {#each currentStepData.content.keys as key}
                          <div class="p-6 rounded-xl border"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                            <div class="flex items-center justify-between mb-4">
                              <h3 class="text-xl font-semibold" style="color: {$colorStore.text};">
                                {key.name}
                              </h3>
                              <div class="flex items-center gap-2">
                                <span class="px-2 py-1 rounded-full text-xs"
                                      style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                                  {key.priority === "high" ? m.public.credguidePriorityHigh() : key.priority === "medium" ? m.public.credguidePriorityMedium() : m.public.credguidePriorityLow()}
                                </span>
                                {#if key.required}
                                  <span class="px-2 py-1 rounded-full text-xs"
                                        style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                                    {m.common.required()}
                                  </span>
                                {/if}
                              </div>
                            </div>

                            <p class="mb-4" style="color: {$colorStore.muted};">
                              <strong>{m.public.credguidePurpose()}</strong> {key.purpose}
                            </p>

                            <ol class="space-y-2 list-decimal list-inside">
                              {#each key.steps as step}
                                <li class="text-sm" style="color: {$colorStore.text};">{step}</li>
                              {/each}
                            </ol>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {:else if currentStepData.id === 'final-config'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-lg mb-6">{currentStepData.content.intro}</p>

                      <div class="mb-8">
                        <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text};">{m.public.credguideAdditionalSettings()}</h3>
                        <div class="grid gap-4">
                          {#each currentStepData.content.additionalSettings as setting}
                            <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
                              <h4 class="font-semibold mb-2" style="color: {$colorStore.text};">
                                {setting.name}
                              </h4>
                              <p class="text-sm mb-2" style="color: {$colorStore.muted};">
                                {setting.purpose}
                              </p>
                              <code class="block p-2 rounded-sm text-sm"
                                    style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                                {setting.example}
                              </code>
                            </div>
                          {/each}
                        </div>
                      </div>

                      <div class="p-6 rounded-xl" style="background: {$colorStore.primary}10;">
                        <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text};">{m.public.credguideFinalConfigurationExample()}</h3>
                        <pre class="p-4 rounded-lg text-sm overflow-x-auto"
                             style="background: {$colorStore.primary}15; color: {$colorStore.text};">{currentStepData.content.finalExample}</pre>
                      </div>
                    </div>
                  {/if}
                </div>

                <!-- Navigation -->
                <div class="flex items-center justify-between mt-8 pt-6 border-t"
                     style="border-color: {$colorStore.primary}20;">
                  <button
                    class="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                    disabled={currentStep === 0}
                    onclick={prevStep}
                  >
                    {m.public.credguidePrevious()}
                  </button>

                  <div class="flex items-center gap-2">
                    {#each steps as _, index}
                      <button
                        class="w-3 h-3 rounded-full transition-all duration-200 hover:scale-125"
                        style="background: {index === currentStep ? $colorStore.primary : $colorStore.primary + '30'};"
                        onclick={() => goToStep(index)}
                        aria-label={m.public.credguideGoToStep({ number: index + 1 })}
                      ></button>
                    {/each}
                  </div>

                  <button
                    class="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: {$colorStore.primary}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                    disabled={currentStep === steps.length - 1}
                    onclick={nextStep}
                  >
                    {currentStep === steps.length - 1 ? m.common.complete() : m.public.credguideNext()}
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </main>
{/if}

<style>
    /* Custom styling for the wizard */
    .wizard-content {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Code styling */
    :global code {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
        font-variant-ligatures: none;
    }

    /* Prose styling for dynamic colors */
    :global(.prose) {
        color: var(--color-text);
    }

    :global(.prose) h1,
    :global(.prose) h2,
    :global(.prose) h3,
    :global(.prose) h4 {
        color: var(--color-text);
    }

    :global(.prose) p {
        color: var(--color-text);
    }

    :global(.prose) li {
        color: var(--color-text);
    }

    :global(.prose) strong {
        color: var(--color-text);
    }

    /* Responsive improvements */
    @media (max-width: 768px) {
        .wizard-content {
            margin: 0 -1rem;
        }

        .wizard-content .rounded-2xl {
            padding: 1.5rem !important;
            margin: 0.5rem;
        }

        /* Better mobile code blocks */
        :global code {
            font-size: 0.875rem;
            word-break: break-all;
        }

        /* Improved mobile spacing for step content */
        .space-y-6 > * + * {
            margin-top: 1.5rem !important;
        }

        .space-y-8 > * + * {
            margin-top: 2rem !important;
        }

        /* Mobile step layout adjustments */
        .ml-14 {
            margin-left: 0 !important;
            margin-top: 1rem;
        }

        /* Better mobile padding for containers */
        .p-6 {
            padding: 1rem !important;
        }

        .p-8 {
            padding: 1.5rem !important;
        }

        /* Mobile grid improvements */

        /* OS selector buttons on mobile */

    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* High contrast mode */
    @media (prefers-contrast: more) {
        .wizard-content {
            border-width: 2px;
        }
  }
</style>