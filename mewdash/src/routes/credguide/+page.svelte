<!-- routes/credguide/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";

  let mounted = false;
  let currentStep = 0;
  let completedSteps: Set<number> = new Set();
  let showAllSteps = false;
  let selectedOS = "linux"; // 'linux' or 'windows'

  // Step-by-step wizard data
  const steps = [
    {
      id: "overview",
      title: "Overview",
      icon: "📋",
      description: "Understanding credentials setup",
      required: true,
      estimatedTime: "2 min",
      content: {
        intro: "Welcome to the Mewdeko credentials setup guide. This wizard will walk you through setting up your bot's credentials step by step.",
        highlights: [
          "Bot token configuration",
          "Database setup",
          "Owner ID configuration",
          "Optional API keys for enhanced features"
        ],
        note: "The credentials_example.json file is located in the Mewdeko/src/Mewdeko folder. You'll need to rename it to credentials.json and configure it."
      }
    },
    {
      id: "bot-token",
      title: "Bot Token",
      icon: "🤖",
      description: "Get your Discord bot token",
      required: true,
      estimatedTime: "5 min",
      content: {
        intro: "Your bot token is the unique identifier that allows your bot to connect to Discord.",
        steps: [
          "Go to the Discord Developer Portal (https://discord.dev) and log in",
          "Click on 'New Application'",
          "Give your application a name and click 'Create'",
          "Navigate to the 'Bot' tab on the left sidebar",
          "Click 'Add Bot' and confirm by clicking 'Yes, do it!'",
          "Under the TOKEN section, click 'Copy' to get your bot token"
        ],
        warning: "Never share your bot token with anyone. Treat it like a password!",
        example: "\"Token\": \"YOUR_BOT_TOKEN_HERE\""
      }
    },
    {
      id: "database",
      title: "Database Setup",
      icon: "🗄️",
      description: "Configure PostgreSQL database",
      required: true,
      estimatedTime: "15 min",
      content: {
        intro: "Mewdeko uses PostgreSQL to store server configurations and user data.",
        linuxSteps: [
          {
            step: "Update system packages",
            command: "sudo apt update && sudo apt upgrade -y"
          },
          {
            step: "Install PostgreSQL and additional components",
            command: "sudo apt install postgresql postgresql-contrib -y"
          },
          {
            step: "Start and enable PostgreSQL service",
            command: "sudo systemctl start postgresql\nsudo systemctl enable postgresql"
          },
          {
            step: "Switch to postgres user",
            command: "sudo -i -u postgres"
          },
          {
            step: "Create a new database user",
            command: "createuser --interactive --pwprompt mewdeko",
            note: "When prompted, enter 'y' for superuser, and set a strong password"
          },
          {
            step: "Create the database",
            command: "createdb -O mewdeko mewdeko_db"
          },
          {
            step: "Exit postgres user",
            command: "exit"
          },
          {
            step: "Test the connection",
            command: "psql -U mewdeko -d mewdeko_db -h localhost",
            note: "Enter the password you set earlier. Use \\q to exit psql."
          }
        ],
        windowsSteps: [
          {
            step: "Download PostgreSQL installer",
            command: "Visit https://www.postgresql.org/download/windows/ and download the latest version"
          },
          {
            step: "Run the installer",
            command: "Execute the downloaded .exe file",
            note: "During installation, remember the password you set for the 'postgres' user"
          },
          {
            step: "Open Command Prompt as Administrator",
            command: "Press Win+X and select 'Windows Terminal (Admin)'"
          },
          {
            step: "Navigate to PostgreSQL bin directory",
            command: "cd \"C:\\Program Files\\PostgreSQL\\15\\bin\"",
            note: "Replace '15' with your PostgreSQL version number"
          },
          {
            step: "Connect to PostgreSQL",
            command: "psql -U postgres"
          },
          {
            step: "Create a new user",
            command: "CREATE USER mewdeko WITH PASSWORD 'your_secure_password' SUPERUSER;"
          },
          {
            step: "Create the database",
            command: "CREATE DATABASE mewdeko_db OWNER mewdeko;"
          },
          {
            step: "Exit psql",
            command: "\\q"
          },
          {
            step: "Test the connection",
            command: "psql -U mewdeko -d mewdeko_db -h localhost",
            note: "Enter your password when prompted. Use \\q to exit."
          }
        ],
        connectionExamples: {
          linux: "\"PsqlConnectionString\": \"Server=localhost;Database=mewdeko_db;Port=5432;UID=mewdeko;Password=your_secure_password\"",
          windows: "\"PsqlConnectionString\": \"Server=localhost;Database=mewdeko_db;Port=5432;UID=mewdeko;Password=your_secure_password\""
        }
      }
    },
    {
      id: "owner-id",
      title: "Owner ID",
      icon: "👑",
      description: "Configure bot owner permissions",
      required: true,
      estimatedTime: "3 min",
      content: {
        intro: "The owner ID gives you full control over your bot. You can have multiple owners.",
        steps: [
          "Go to your Discord server",
          "Type \\@yourusername (with a backslash before the @)",
          "Send the message - it will show as <@YOUR_USER_ID>",
          "Copy the numbers (YOUR_USER_ID)",
          "Add it to your credentials.json file"
        ],
        singleOwner: "\"OwnerIds\": [\"YOUR_USER_ID\"]",
        multipleOwners: "\"OwnerIds\": [\"USER_ID_1\", \"USER_ID_2\", \"USER_ID_3\"]"
      }
    },
    {
      id: "api-keys",
      title: "API Keys",
      icon: "🔑",
      description: "Optional API keys for enhanced features",
      required: false,
      estimatedTime: "10 min",
      content: {
        intro: "These API keys are optional but enable additional features like music, games, and more.",
        keys: [
          {
            name: "GoogleApiKey",
            purpose: "YouTube search, playlist queuing",
            required: true,
            priority: "high",
            steps: [
              "Go to Google Console (https://console.developers.google.com/)",
              "Create a new project",
              "Go to Library → Enable YouTube Data API",
              "Go to Credentials → Create Credentials → API Key",
              "Copy the key to your credentials.json"
            ]
          },
          {
            name: "TwitchClientId & TwitchClientSecret",
            purpose: "Twitch stream notifications",
            required: false,
            priority: "medium",
            steps: [
              "Go to Twitch Developer Console",
              "Create a new application",
              "Set OAuth redirect URL to http://localhost",
              "Select 'Chat Bot' category",
              "Copy Client ID and Client Secret"
            ]
          },
          {
            name: "MashapeKey",
            purpose: "Hearthstone cards",
            required: false,
            priority: "low",
            steps: [
              "Register at https://rapidapi.com",
              "Go to MyApps → Add New App",
              "Get Application key"
            ]
          }
        ]
      }
    },
    {
      id: "final-config",
      title: "Final Configuration",
      icon: "✅",
      description: "Complete your setup",
      required: true,
      estimatedTime: "5 min",
      content: {
        intro: "Review your final configuration and additional optional settings.",
        additionalSettings: [
          {
            name: "LavalinkUrl",
            purpose: "Music playback",
            example: "\"LavalinkUrl\": \"http://localhost:2333\""
          },
          {
            name: "ConfessionReportChannelId",
            purpose: "Confession reporting",
            example: "\"ConfessionReportChannelId\": \"YOUR_CHANNEL_ID\""
          },
          {
            name: "ChatSavePath",
            purpose: "Chat log storage",
            example: "\"ChatSavePath\": \"/path/to/chatlogs/\""
          }
        ],
        finalExample: `{
  "Token": "YOUR_BOT_TOKEN_HERE",
  "OwnerIds": ["YOUR_USER_ID"],
  "PsqlConnectionString": "Server=localhost;Database=mydatabase;Port=5432;UID=username;Password=password",
  "GoogleApiKey": "YOUR_GOOGLE_API_KEY",
  "LavalinkUrl": "http://localhost:2333"
}`
      }
    }
  ];

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
  $: progress = ((completedSteps.size) / steps.length) * 100;
  $: currentStepData = steps[currentStep];
  $: requiredSteps = steps.filter(step => step.required).length;
  $: completedRequiredSteps = steps.filter((step, index) => step.required && completedSteps.has(index)).length;

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

<svelte:head>
  <title>Mewdeko - Credentials Setup Wizard</title>
  <meta content="Mewdeko - Interactive Credentials Setup Guide" property="og:title" />
  <meta content="Step-by-step guide to setting up credentials for Mewdeko Discord bot" name="description" />
  <meta content="Step-by-step guide to setting up credentials for Mewdeko Discord bot" property="og:description" />
  <meta content="Step-by-step guide to setting up credentials for Mewdeko Discord bot" name="twitter:description" />
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
              Credentials Setup Wizard
            </h1>
            <p class="text-sm" style="color: {$colorStore.muted};">
              Configure your Mewdeko bot step by step
            </p>
          </div>

          <!-- Progress bar -->
          <div class="flex-shrink-0 lg:max-w-md lg:w-full">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium" style="color: {$colorStore.text};">
                Progress: {completedRequiredSteps}/{requiredSteps} required steps
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
              <select
                class="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:outline-none backdrop-blur-sm"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; --tw-ring-color: {$colorStore.accent};"
                bind:value={currentStep}
              >
                {#each steps as step, index}
                  <option value={index}>
                    {step.icon} {step.title} {step.required ? '*' : ''}
                  </option>
                {/each}
              </select>
            </div>

            <!-- Desktop Step Navigation -->
            <div class="hidden lg:block">
              <h3 class="font-semibold mb-4" style="color: {$colorStore.text};">Setup Steps</h3>
              <nav class="space-y-2">
                {#each steps as step, index}
                  <button
                    class="w-full text-left p-3 rounded-xl transition-all duration-200 border group"
                    style="{index === currentStep 
                      ? `background: linear-gradient(135deg, ${$colorStore.gradientStart}20, ${$colorStore.gradientMid}25); border-color: ${$colorStore.primary}; color: ${$colorStore.text};` 
                      : `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}20; color: ${$colorStore.muted};`}"
                    on:click={() => goToStep(index)}
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <span class="text-xl">{step.icon}</span>
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
                          <svg class="w-3 h-3" style="color: {$colorStore.text};" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      {/if}
                    </div>
                  </button>
                {/each}
              </nav>

              <!-- Quick Actions -->
              <div class="mt-6 p-4 rounded-xl backdrop-blur-sm"
                   style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                <h4 class="font-medium mb-3" style="color: {$colorStore.text};">Quick Actions</h4>
                <div class="space-y-2">
                  <button
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                    on:click={() => showAllSteps = !showAllSteps}
                  >
                    {showAllSteps ? '📋 Show Wizard' : '📜 Show All Steps'}
                  </button>
                  <button
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                    on:click={() => completedSteps = new Set()}
                  >
                    🔄 Reset Progress
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
                <div class="rounded-2xl p-6 backdrop-blur-sm border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}20;">
                  <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold flex items-center gap-3" style="color: {$colorStore.text};">
                      <span class="text-3xl">{step.icon}</span>
                      {step.title}
                      {#if step.required}
                        <span style="color: {$colorStore.accent};">*</span>
                      {/if}
                    </h2>
                    <button
                      class="px-4 py-2 rounded-lg transition-all"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                      on:click={() => { goToStep(index); showAllSteps = false; }}
                    >
                      Enter Wizard
                    </button>
                  </div>

                  <p class="mb-4" style="color: {$colorStore.muted};">{step.description}</p>

                  <!-- Simplified content for overview -->
                  {#if step.id === 'overview'}
                    <ul class="space-y-2">
                      {#each step.content.highlights as highlight}
                        <li class="flex items-center gap-2" style="color: {$colorStore.text};">
                          <span style="color: {$colorStore.secondary};">✓</span>
                          {highlight}
                        </li>
                      {/each}
                    </ul>
                  {:else if step.id === 'bot-token'}
                    <div class="space-y-2">
                      <p style="color: {$colorStore.text};">Get your Discord bot token from the Developer Portal</p>
                      <code class="block p-2 rounded"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text};">{step.content.example}</code>
                    </div>
                  {:else if step.id === 'database'}
                    <div class="space-y-2">
                      <p style="color: {$colorStore.text};">Configure PostgreSQL for data storage</p>
                      <code class="block p-2 rounded"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text};">{step.content.connectionString}</code>
                    </div>
                  {:else if step.id === 'owner-id'}
                    <div class="space-y-2">
                      <p style="color: {$colorStore.text};">Set up bot owner permissions</p>
                      <code class="block p-2 rounded"
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
                      <p style="color: {$colorStore.text};">Review and finalize your configuration</p>
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
              <div class="rounded-2xl p-6 sm:p-8 backdrop-blur-sm border"
                   style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}20;">

                <!-- Step Header -->
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}40);">
                      {currentStepData.icon}
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
                        <span>⏱️ {currentStepData.estimatedTime}</span>
                        <span>📍 Step {currentStep + 1} of {steps.length}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    class="px-4 py-2 rounded-lg transition-all hover:scale-105"
                    style="background: {completedSteps.has(currentStep) ? $colorStore.secondary : $colorStore.primary + '20'}; color: {$colorStore.text};"
                    on:click={() => completedSteps.has(currentStep) ? markStepIncomplete(currentStep) : markStepComplete(currentStep)}
                  >
                    {completedSteps.has(currentStep) ? '✅ Completed' : '⭕ Mark Complete'}
                  </button>
                </div>

                <!-- Step Content -->
                <div class="prose prose-lg max-w-none" style="color: {$colorStore.text};">
                  {#if currentStepData.id === 'overview'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-xl mb-6">{currentStepData.content.intro}</p>

                      <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
                          <h3 class="font-semibold mb-4" style="color: {$colorStore.text};">What you'll configure:</h3>
                          <ul class="space-y-2">
                            {#each currentStepData.content.highlights as highlight}
                              <li class="flex items-center gap-2">
                                <span style="color: {$colorStore.secondary};">✓</span>
                                {highlight}
                              </li>
                            {/each}
                          </ul>
                        </div>

                        <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
                          <h3 class="font-semibold mb-4" style="color: {$colorStore.text};">Important Note:</h3>
                          <p class="text-sm">{currentStepData.content.note}</p>
                        </div>
                      </div>
                    </div>
                  {:else if currentStepData.id === 'bot-token'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-lg mb-8">{currentStepData.content.intro}</p>

                      <div class="mb-8 p-5 rounded-xl" style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}40;">
                        <div class="flex items-start gap-3">
                          <span class="text-xl flex-shrink-0" style="color: {$colorStore.accent};">⚠️</span>
                          <p class="text-lg"><strong>Security Warning:</strong> {currentStepData.content.warning}</p>
                        </div>
                      </div>

                      <div class="space-y-6 mb-10">
                        {#each currentStepData.content.steps as step, index}
                          <div class="flex items-start gap-4">
                            <div
                              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style="color: {$colorStore.text}; background: linear-gradient(135deg, {$colorStore.gradientStart}, {$colorStore.gradientMid})">
                              
                              {index + 1}
                            </div>
                            <p class="text-base pt-1" style="color: {$colorStore.text};">{step}</p>
                          </div>
                        {/each}
                      </div>

                      <div class="p-8 rounded-xl border"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                        <h4 class="text-lg font-semibold mb-6" style="color: {$colorStore.text};">Add to
                          credentials.json:</h4>
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
                        <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text};">Select Your Operating
                          System:</h3>
                        <div class="flex flex-col sm:flex-row gap-4 mb-6">
                          <button
                            class="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                            style="background: {selectedOS === 'linux' ? $colorStore.primary : $colorStore.primary + '20'}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                            on:click={() => selectedOS = 'linux'}
                          >
                            🐧 Linux (Ubuntu/Debian)
                          </button>
                          <button
                            class="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                            style="background: {selectedOS === 'windows' ? $colorStore.primary : $colorStore.primary + '20'}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                            on:click={() => selectedOS = 'windows'}
                          >
                            🪟 Windows
                          </button>
                        </div>
                      </div>

                      {#if selectedOS === 'linux'}
                        <div class="mb-12" in:fly={{ x: -20, duration: 300 }}>
                          <h3 class="text-xl font-semibold mb-8" style="color: {$colorStore.text};">Linux Installation
                            Steps:</h3>
                          <div class="space-y-8">
                            {#each currentStepData.content.linuxSteps as step, index}
                              <div class="relative">
                                <!-- Step Number Badge -->
                                <div class="flex items-center mb-4">
                                  <div
                                    class="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4" style="color: {$colorStore.text}; background: linear-gradient(135deg, {$colorStore.gradientStart}, {$colorStore.gradientMid});">
                                    {index + 1}
                                  </div>
                                  <h4 class="text-lg font-semibold" style="color: {$colorStore.text};">{step.step}</h4>
                                </div>

                                <!-- Command Block -->
                                <div class="ml-14">
                                  <div class="p-4 rounded-xl border"
                                       style="background: {$colorStore.primary}12; border-color: {$colorStore.primary}25;">
                                    <code class="block text-sm overflow-x-auto whitespace-pre-wrap font-mono"
                                          style="color: {$colorStore.text};">
                                      {step.command}
                                    </code>
                                  </div>
                                  {#if step.note}
                                    <div class="mt-4 p-3 rounded-lg"
                                         style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
                                      <p class="text-sm flex items-start gap-2" style="color: {$colorStore.text};">
                                        <span class="flex-shrink-0" style="color: {$colorStore.accent};">💡</span>
                                        <span>{step.note}</span>
                                      </p>
                                    </div>
                                  {/if}
                                </div>
                              </div>
                            {/each}
                          </div>
                        </div>
                      {:else}
                        <div class="mb-12" in:fly={{ x: 20, duration: 300 }}>
                          <h3 class="text-xl font-semibold mb-8" style="color: {$colorStore.text};">Windows Installation
                            Steps:</h3>
                          <div class="space-y-8">
                            {#each currentStepData.content.windowsSteps as step, index}
                              <div class="relative">
                                <!-- Step Number Badge -->
                                <div class="flex items-center mb-4">
                                  <div
                                    class="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4" style="color: {$colorStore.text}; background: linear-gradient(135deg, {$colorStore.gradientStart}, {$colorStore.gradientMid});">
                                    {index + 1}
                                  </div>
                                  <h4 class="text-lg font-semibold" style="color: {$colorStore.text};">{step.step}</h4>
                                </div>

                                <!-- Command Block -->
                                <div class="ml-14">
                                  <div class="p-4 rounded-xl border"
                                       style="background: {$colorStore.primary}12; border-color: {$colorStore.primary}25;">
                                    <code class="block text-sm overflow-x-auto whitespace-pre-wrap font-mono"
                                          style="color: {$colorStore.text};">
                                      {step.command}
                                    </code>
                                  </div>
                                  {#if step.note}
                                    <div class="mt-4 p-3 rounded-lg"
                                         style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
                                      <p class="text-sm flex items-start gap-2" style="color: {$colorStore.text};">
                                        <span class="flex-shrink-0" style="color: {$colorStore.accent};">💡</span>
                                        <span>{step.note}</span>
                                      </p>
                                    </div>
                                  {/if}
                                </div>
                              </div>
                            {/each}
                          </div>
                        </div>
                      {/if}

                      <div class="p-8 rounded-xl border"
                           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                        <h3 class="text-xl font-semibold mb-6" style="color: {$colorStore.text};">Connection String
                          Configuration:</h3>
                        <p class="mb-6 text-lg" style="color: {$colorStore.muted};">Add this to your credentials.json
                          file:</p>
                        <div class="p-5 rounded-xl border"
                             style="background: {$colorStore.primary}15; border-color: {$colorStore.primary}30;">
                          <code class="block text-sm overflow-x-auto font-mono" style="color: {$colorStore.text};">
                            {currentStepData.content.connectionExamples[selectedOS]}
                          </code>
                        </div>
                        <div class="mt-6 p-4 rounded-lg" style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
                          <p class="text-sm flex items-start gap-2" style="color: {$colorStore.text};">
                            <span class="flex-shrink-0" style="color: {$colorStore.accent};">⚠️</span>
                            <span>Replace "your_secure_password" with the actual password you set for the mewdeko user.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  {:else if currentStepData.id === 'owner-id'}
                    <div in:fly={{ y: 20, duration: 300 }}>
                      <p class="text-lg mb-8">{currentStepData.content.intro}</p>

                      <div class="space-y-6 mb-10">
                        {#each currentStepData.content.steps as step, index}
                          <div class="flex items-start gap-4">
                            <div
                              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style="color: {$colorStore.text}; background: linear-gradient(135deg, {$colorStore.gradientStart}, {$colorStore.gradientMid});">
                              {index + 1}
                            </div>
                            <p class="text-base pt-1" style="color: {$colorStore.text};">{step}</p>
                          </div>
                        {/each}
                      </div>

                      <div class="grid md:grid-cols-2 gap-8">
                        <div class="p-6 rounded-xl border"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                          <h4 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Single Owner:</h4>
                          <div class="p-4 rounded-lg border"
                               style="background: {$colorStore.primary}15; border-color: {$colorStore.primary}30;">
                            <code class="block text-sm font-mono" style="color: {$colorStore.text};">
                              {currentStepData.content.singleOwner}
                            </code>
                          </div>
                        </div>

                        <div class="p-6 rounded-xl border"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                          <h4 class="text-lg font-semibold mb-4" style="color: {$colorStore.text};">Multiple
                            Owners:</h4>
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
                                  {key.priority} priority
                                </span>
                                {#if key.required}
                                  <span class="px-2 py-1 rounded-full text-xs"
                                        style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                                    Required
                                  </span>
                                {/if}
                              </div>
                            </div>

                            <p class="mb-4" style="color: {$colorStore.muted};">
                              <strong>Purpose:</strong> {key.purpose}
                            </p>

                            <ol class="space-y-2">
                              {#each key.steps as step, index}
                                <li class="flex gap-3">
                                  <span
                                    class="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style="color: {$colorStore.text}; background: {$colorStore.primary};">
                                    {index + 1}
                                  </span>
                                  <p class="text-sm">{step}</p>
                                </li>
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
                        <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text};">Additional
                          Settings:</h3>
                        <div class="grid gap-4">
                          {#each currentStepData.content.additionalSettings as setting}
                            <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
                              <h4 class="font-semibold mb-2" style="color: {$colorStore.text};">
                                {setting.name}
                              </h4>
                              <p class="text-sm mb-2" style="color: {$colorStore.muted};">
                                {setting.purpose}
                              </p>
                              <code class="block p-2 rounded text-sm"
                                    style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                                {setting.example}
                              </code>
                            </div>
                          {/each}
                        </div>
                      </div>

                      <div class="p-6 rounded-xl" style="background: {$colorStore.primary}10;">
                        <h3 class="text-xl font-semibold mb-4" style="color: {$colorStore.text};">Final Configuration
                          Example:</h3>
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
                    class="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                    disabled={currentStep === 0}
                    on:click={prevStep}
                  >
                    ← Previous
                  </button>

                  <div class="flex items-center gap-2">
                    {#each steps as _, index}
                      <button
                        class="w-3 h-3 rounded-full transition-all duration-200 hover:scale-125"
                        style="background: {index === currentStep ? $colorStore.primary : $colorStore.primary + '30'};"
                        on:click={() => goToStep(index)}
                        aria-label="Go to step {index + 1}"
                      ></button>
                    {/each}
                  </div>

                  <button
                    class="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: {$colorStore.primary}; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                    disabled={currentStep === steps.length - 1}
                    on:click={nextStep}
                  >
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next →'}
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
    :global(code) {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
        font-variant-ligatures: none;
    }

    /* Prose styling for dynamic colors */
    :global(.prose) {
        color: var(--color-text);
    }

    :global(.prose h1),
    :global(.prose h2),
    :global(.prose h3),
    :global(.prose h4) {
        color: var(--color-text);
    }

    :global(.prose p) {
        color: var(--color-text);
    }

    :global(.prose li) {
        color: var(--color-text);
    }

    :global(.prose strong) {
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
        :global(code) {
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