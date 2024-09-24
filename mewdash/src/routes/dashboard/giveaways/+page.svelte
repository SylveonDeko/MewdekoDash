<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api.ts';
    import { currentGuild } from '$lib/stores/currentGuild.ts';
    import { fade, slide } from 'svelte/transition';
    import type { Giveaways } from '$lib/types/models.ts';
    import { goto } from '$app/navigation';
    import Notification from '$lib/Notification.svelte';
    import MultiSelectDropdown from '$lib/MultiSelectDropdown.svelte';
    import IntervalPicker from '$lib/IntervalPicker.svelte';

    let giveaways: Giveaways[] = [];
    let expandedGiveaway: number | null = null;
    let loading = true;
    let error: string | null = null;
    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' = 'success';
    let guildRoles: Array<{ id: string; name: string }> = [];
    let selectedRoles: string[] = [];
    let entryMethod: 'reaction' | 'button' | 'captcha' = 'reaction';

    let newGiveaway: Partial<Giveaways> = {
        item: '',
        winners: 1,
        channelId: BigInt(0),
        when: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
        restrictTo: '',
        useButton: false,
        useCaptcha: false,
        messageCountReq: BigInt(0),
        serverId: BigInt(0),
        userId: BigInt(0),
        ended: 0,
        messageId: BigInt(0),
        emote: '',
    };

    // Reactive assignment for serverId
    $: if ($currentGuild) {
        newGiveaway.serverId = BigInt($currentGuild.id);
    }

    onMount(async () => {
        if (!$currentGuild) await goto('/dashboard');
        await fetchGiveaways();
        await loadGuildRoles();
    });

    function validateGiveaway(): string | null {
        if (!newGiveaway.item || newGiveaway.item.trim() === '') {
            return 'Please enter a valid giveaway item.';
        }
        if (!newGiveaway.winners || newGiveaway.winners < 1) {
            return 'The number of winners must be at least 1.';
        }
        if (!newGiveaway.channelId || newGiveaway.channelId <= BigInt(0)) {
            return 'Please enter a valid channel ID.';
        }
        if (!newGiveaway.when || newGiveaway.when <= new Date()) {
            return 'The end time must be in the future.';
        }
        if (newGiveaway.messageCountReq < BigInt(0)) {
            return 'The required message count cannot be negative.';
        }
        return null;
    }

    function handleEntryMethodChange(method: 'reaction' | 'button' | 'captcha') {
        entryMethod = method;
        newGiveaway.useButton = method === 'button';
        newGiveaway.useCaptcha = method === 'captcha';
    }

    async function fetchGiveaways() {
        try {
            loading = true;
            error = null;
            if (!$currentGuild?.id) throw new Error('No guild selected');
            giveaways = await api.getGiveaways($currentGuild.id);
        } catch (err) {
            console.error('Failed to fetch giveaways:', err);
            error = (err as Error).message || 'Failed to fetch giveaways';
        } finally {
            loading = false;
        }
    }

    async function loadGuildRoles() {
        try {
            if (!$currentGuild?.id) throw new Error('No guild selected');
            guildRoles = await api.getGuildRoles($currentGuild.id);
        } catch (err) {
            console.error('Failed to fetch guild roles:', err);
        }
    }

    async function createGiveaway() {
        try {
            const validationError = validateGiveaway();
            if (validationError) {
                showNotificationMessage(validationError, 'error');
                return;
            }
            if (!$currentGuild?.id) throw new Error('No guild selected');
            newGiveaway.serverId = BigInt($currentGuild.id);
            await api.createGiveaway($currentGuild.id, newGiveaway);
            showNotificationMessage('Giveaway created successfully', 'success');
            await fetchGiveaways();
            resetNewGiveaway();
        } catch (error) {
            const errMsg = (error as Error).message || 'Unknown error';
            showNotificationMessage('Failed to create giveaway: ' + errMsg, 'error');
        }
    }

    async function endGiveaway(giveawayId: number) {
        try {
            if (!$currentGuild?.id) throw new Error('No guild selected');
            await api.endGiveaway($currentGuild.id, giveawayId);
            showNotificationMessage('Giveaway ended successfully', 'success');
            await fetchGiveaways();
        } catch (error) {
            const errMsg = (error as Error).message || 'Unknown error';
            showNotificationMessage('Failed to end giveaway: ' + errMsg, 'error');
        }
    }

    function toggleGiveawayExpand(id: number) {
        expandedGiveaway = expandedGiveaway === id ? null : id;
    }

    function resetNewGiveaway() {
        newGiveaway = {
            item: '',
            winners: 1,
            channelId: BigInt(0),
            when: new Date(Date.now() + 24 * 60 * 60 * 1000),
            restrictTo: '',
            useButton: false,
            useCaptcha: false,
            messageCountReq: BigInt(0),
            serverId: BigInt(0),
            userId: BigInt(0),
            ended: 0,
            messageId: BigInt(0),
            emote: '',
        };
        selectedRoles = [];
        entryMethod = 'reaction';
    }

    function showNotificationMessage(
        message: string,
        type: 'success' | 'error' = 'success'
    ) {
        notificationMessage = message;
        notificationType = type;
        showNotification = true;
        setTimeout(() => {
            showNotification = false;
        }, 3000);
    }

    function handleRoleSelection(event: CustomEvent<string[]>) {
        selectedRoles = event.detail;
        newGiveaway.restrictTo = selectedRoles.join(' ');
    }

    function handleDurationChange(event: CustomEvent<Date>) {
        const selectedEndTime = event.detail;
        newGiveaway.when = selectedEndTime;
    }

    function handleWinnersChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = parseInt(input.value);
        if (value < 1) {
            input.value = '1';
            newGiveaway.winners = 1;
            showNotificationMessage('The number of winners must be at least 1.', 'error');
        } else {
            newGiveaway.winners = value;
        }
    }

    function handleMessageCountChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = BigInt(input.value);
        if (value < BigInt(0)) {
            input.value = '0';
            newGiveaway.messageCountReq = BigInt(0);
            showNotificationMessage('The required message count cannot be negative.', 'error');
        } else {
            newGiveaway.messageCountReq = value;
        }
    }

    function handleKeyDown(event: KeyboardEvent, giveawayId: number) {
        if (event.key === 'Enter' || event.key === ' ') {
            toggleGiveawayExpand(giveawayId);
        }
    }
</script>

<style>
  /* Hide the spin buttons on number inputs */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>

<svelte:head>
  <title>Giveaways - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-6">
  <h1 class="text-3xl font-bold mb-8 text-center text-white">Giveaways</h1>
  {#if showNotification}
    <Notification message={notificationMessage} type={notificationType} />
  {/if}
  {#if loading}
    <p class="text-center text-gray-300">Loading...</p>
  {:else if error}
    <p class="text-red-500 text-center">{error}</p>
  {:else}
    <div class="mb-12 bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold mb-6 text-white text-center">Create New Giveaway</h2>
      <form
        on:submit|preventDefault={createGiveaway}
        class="grid grid-cols-1 gap-8"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex flex-col">
            <label
              for="giveaway-item"
              class="mb-2 font-medium text-gray-300"
            >
              Giveaway Item
            </label>
            <input
              id="giveaway-item"
              bind:value={newGiveaway.item}
              placeholder="Enter the item to be given away"
              class="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
            />
          </div>
          <div class="flex flex-col">
            <label
              for="winners-count"
              class="mb-2 font-medium text-gray-300"
            >
              Number of Winners
            </label>
            <input
              id="winners-count"
              bind:value={newGiveaway.winners}
              type="number"
              min="1"
              placeholder="Enter number of winners"
              class="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              on:change={handleWinnersChange}
              required
              aria-required="true"
            />
          </div>
          <div class="flex flex-col md:col-span-2">
            <label
              for="channel-id"
              class="mb-2 font-medium text-gray-300"
            >
              Channel ID
            </label>
            <input
              id="channel-id"
              bind:value={newGiveaway.channelId}
              placeholder="Enter the channel ID for the giveaway"
              class="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
              inputmode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div class="flex flex-col md:col-span-2">
            <label
              for="giveaway-duration"
              class="mb-2 font-medium text-gray-300"
            >
              Giveaway Duration
            </label>
            <IntervalPicker on:change={handleDurationChange} />
          </div>
          <div class="flex flex-col md:col-span-2">
            <label
              for="required-roles"
              class="mb-2 font-medium text-gray-300"
            >
              Required Roles
            </label>
            <MultiSelectDropdown
              id="required-roles"
              options={guildRoles}
              bind:selected={selectedRoles}
              on:change={handleRoleSelection}
              placeholder="Select required roles"
              aria-label="Required Roles"
            />
          </div>
          <div class="flex flex-col md:col-span-2">
            <label
              for="message-count"
              class="mb-2 font-medium text-gray-300"
            >
              Required Message Count
            </label>
            <input
              id="message-count"
              bind:value={newGiveaway.messageCountReq}
              type="number"
              min="0"
              placeholder="Enter required message count"
              class="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              on:change={handleMessageCountChange}
              inputmode="numeric"
              pattern="[0-9]*"
            />
          </div>
        </div>

        <div class="flex flex-col items-center mt-8">
          <fieldset class="w-full">
            <legend class="mb-4 font-medium text-gray-300 text-center">
              Entry Method
            </legend>
            <div
              class="flex flex-col md:flex-row md:justify-center md:space-x-4 space-y-4 md:space-y-0"
              role="group"
              aria-label="Entry Method"
            >
              <button
                type="button"
                class="w-full md:w-auto px-6 py-2 text-sm font-medium rounded-md {entryMethod === 'reaction' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                on:click={() => handleEntryMethodChange('reaction')}
                aria-pressed={entryMethod === 'reaction'}
              >
                Reaction
              </button>
              <button
                type="button"
                class="w-full md:w-auto px-6 py-2 text-sm font-medium rounded-md {entryMethod === 'button' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                on:click={() => handleEntryMethodChange('button')}
                aria-pressed={entryMethod === 'button'}
              >
                Button
              </button>
              <button
                type="button"
                class="w-full md:w-auto px-6 py-2 text-sm font-medium rounded-md {entryMethod === 'captcha' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                on:click={() => handleEntryMethodChange('captcha')}
                aria-pressed={entryMethod === 'captcha'}
              >
                Captcha
              </button>
            </div>
          </fieldset>
        </div>

        <div class="mt-8">
          <button
            type="submit"
            class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create Giveaway
          </button>
        </div>
      </form>
    </div>

    <h2 class="text-2xl font-semibold mb-6 text-white text-center">Current Giveaways</h2>
    {#if giveaways.length === 0}
      <p transition:fade class="text-gray-400 italic text-center">
        No giveaways found for this guild.
      </p>
    {:else}
      <ul class="space-y-6">
        {#each giveaways as giveaway (giveaway.id)}
          <li class="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div
              role="button"
              tabindex="0"
              class="flex justify-between items-center cursor-pointer focus:outline-none"
              on:click={() => toggleGiveawayExpand(giveaway.id)}
              on:keydown={(event) => handleKeyDown(event, giveaway.id)}
              aria-expanded={expandedGiveaway === giveaway.id}
            >
              <div>
                <p class="font-semibold text-white">{giveaway.item}</p>
                <p class="text-sm text-gray-400">
                  Ends: {new Date(giveaway.when).toLocaleString()}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-blue-500 transform {expandedGiveaway === giveaway.id ? 'rotate-180' : ''} transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {#if expandedGiveaway === giveaway.id}
              <div transition:slide class="mt-6 space-y-4 text-gray-300">
                <p><span class="font-medium">Winners:</span> {giveaway.winners}</p>
                <p><span class="font-medium">Channel:</span> {giveaway.channelId.toString()}</p>
                {#if giveaway.restrictTo}
                  <p><span class="font-medium">Required Roles:</span> {giveaway.restrictTo}</p>
                {/if}
                <p><span class="font-medium">Message Count Requirement:</span> {giveaway.messageCountReq.toString()}</p>
                <p>
                  <span class="font-medium">Entry Method:</span>
                  {giveaway.useButton
                    ? 'Button'
                    : giveaway.useCaptcha
                    ? 'Captcha'
                    : 'Reaction'}
                </p>
                {#if !giveaway.ended}
                  <button
                    type="button"
                    on:click={() => endGiveaway(giveaway.id)}
                    class="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  >
                    End Giveaway
                  </button>
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>