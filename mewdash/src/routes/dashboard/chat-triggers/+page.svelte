<script lang="ts">
    import {onMount} from 'svelte';
    import {api} from '$lib/api';
    import type {PageData} from './$types';
    import {currentGuild} from "$lib/stores/currentGuild.ts";
    import {fade, slide} from 'svelte/transition';
    import MultiSelectDropdown from '$lib/MultiSelectDropdown.svelte';
    import type {ChatTriggers} from "$lib/types/models.ts";
    import {goto} from "$app/navigation";
    import Notification from "$lib/Notification.svelte";


    let showNotification = false;
    let notificationMessage = '';
    let notificationType: 'success' | 'error' = 'success';

    let triggers: ChatTriggers[] = [];
    let newTrigger = {
        guildId: $currentGuild?.id,
        trigger: '',
        response: '',
        grantedRoles: '',
        removedRoles: '',
        isRegex: false,
        isValidRegex: true
    };
    let newTriggerRegexTestString = '';
    let newTriggerRegexTestResult = '';
    let newTriggerRegexHighlightedString = '';
    let expandedTrigger: ChatTriggers = null;
    let loading = true;
    let error = null;
    let guildRoles = [];
    let regexTestString = '';
    let regexTestResult = '';
    let dropdownRef: HTMLDivElement;
    let activeDropdown: string | null = null;

    const RequirePrefixType = {
        None: 0,
        Global: 1,
        GuildOrGlobal: 2,
        GuildOrNone: 3,
        Custom: 4
    };

    const CtRoleGrantType = {
        Sender: 0,
        Mentioned: 1,
        Both: 2
    };

    const ChatTriggerType = {
        Message: 1,
        Interaction: 2,
        Button: 4
    };

    const CtApplicationCommandType = {
        None: 0,
        Slash: 1,
        Message: 2,
        User: 3
    };

    let regexHighlightedString = '';

    onMount(async () => {
        if (!$currentGuild)
            await goto("/dashboard");
        await loadTriggers();
        await loadGuildRoles();
    });

    function handleDropdownKeydown(event: KeyboardEvent, key: string) {
        if (event.key === 'Escape') {
            closeDropdown();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const options = Array.from(dropdownRef.querySelectorAll(`[data-dropdown="${key}"] [role="option"]`));
            const currentIndex = options.findIndex(option => option === document.activeElement);
            let nextIndex;
            if (event.key === 'ArrowDown') {
                nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
            }
            (options[nextIndex] as HTMLElement).focus();
        }
    }

    function getEnumDisplayValue(enumObj: object, value: any): string {
        const entry = Object.entries(enumObj).find(([key, val]) => val === value);
        return entry ? entry[0] : 'Unknown';
    }

    function handleOptionKeydown(event: KeyboardEvent, option: string, key: string, trigger: ChatTriggers) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleOption(option, key, trigger);
        }
    }

    function toggleOption(option: string, key: string, trigger: ChatTriggers) {
        if (isEnum(key)) {
            trigger[key] = getEnumOptions(key)[option];
        } else if (isRoleSelection(key)) {
            const index = trigger[key].indexOf(option);
            if (index === -1) {
                trigger[key] = [...trigger[key], option];
            } else {
                trigger[key] = trigger[key].filter((role: string) => role !== option);
            }
        }
    }

    function toggleDropdown(key: string) {
        activeDropdown = activeDropdown === key ? null : key;
    }

    function closeDropdown() {
        activeDropdown = null;
    }

    function showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
        notificationMessage = message;
        notificationType = type;
        showNotification = true;
        setTimeout(() => {
            showNotification = false;
        }, 3000);
    }

    function getDescriptiveLabel(key: string): string {
        switch (key) {
            case 'useCount':
                return 'Usage Count';
            case 'isRegex':
                return 'Is Regular Expression';
            case 'ownerOnly':
                return 'Owner Only';
            case 'guildId':
                return 'Guild ID';
            case 'response':
                return 'Response Message';
            case 'trigger':
                return 'Trigger Text or Pattern';
            case 'prefixType':
                return 'Prefix Requirement';
            case 'customPrefix':
                return 'Custom Prefix';
            case 'autoDeleteTrigger':
                return 'Auto Delete Trigger Message';
            case 'reactToTrigger':
                return 'React to Trigger Message';
            case 'noRespond':
                return 'Don\'t Respond to Trigger';
            case 'dmResponse':
                return 'Send Response as DM';
            case 'containsAnywhere':
                return 'Trigger If Contained Anywhere';
            case 'allowTarget':
                return 'Allow Targeting';
            case 'reactions':
                return 'Trigger Reactions';
            case 'grantedRoles':
                return 'Roles to Grant';
            case 'removedRoles':
                return 'Roles to Remove';
            case 'roleGrantType':
                return 'Role Grant Target';
            case 'validTriggerTypes':
                return 'Valid Trigger Types';
            case 'applicationCommandId':
                return 'Application Command ID';
            case 'applicationCommandName':
                return 'Application Command Name';
            case 'applicationCommandDescription':
                return 'Application Command Description';
            case 'applicationCommandType':
                return 'Application Command Type';
            case 'ephemeralResponse':
                return 'Ephemeral Response';
            case 'crosspostingChannelId':
                return 'Crossposting Channel ID';
            case 'crosspostingWebhookUrl':
                return 'Crossposting Webhook URL';
            default:
                return key;
        }
    }

    function handleNewTriggerRegexChange() {
        if (newTrigger.isRegex) {
            newTrigger.isValidRegex = validateRegex(newTrigger.trigger);
            testNewTriggerRegex();
        } else {
            newTrigger.isValidRegex = true;
            newTriggerRegexTestResult = '';
            newTriggerRegexHighlightedString = '';
        }
    }

    function testNewTriggerRegex() {
        if (newTrigger.isRegex && newTrigger.isValidRegex) {
            try {
                const regex = new RegExp(newTrigger.trigger, 'g');
                const matches = newTriggerRegexTestString.match(regex);
                if (matches) {
                    newTriggerRegexTestResult = `${matches.length} match${matches.length > 1 ? 'es' : ''}`;
                    newTriggerRegexHighlightedString = highlightMatches(newTriggerRegexTestString, regex);
                } else {
                    newTriggerRegexTestResult = 'No matches';
                    newTriggerRegexHighlightedString = newTriggerRegexTestString;
                }
            } catch (e) {
                newTriggerRegexTestResult = 'Error testing regex';
                newTriggerRegexHighlightedString = newTriggerRegexTestString;
            }
        } else {
            newTriggerRegexTestResult = '';
            newTriggerRegexHighlightedString = '';
        }
    }

    async function loadTriggers() {
        try {
            loading = true;
            error = null;
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            triggers = await api.getChatTriggers($currentGuild.id);
            triggers = triggers.map(trigger => ({
                ...trigger,
                grantedRoles: roleStringToArray(trigger.grantedRoles),
                removedRoles: roleStringToArray(trigger.removedRoles),
                isRegex: trigger.isRegex || false,
                isValidRegex: trigger.isRegex ? validateRegex(trigger.trigger) : true
            }));
        } catch (err) {
            console.error('Failed to fetch chat triggers:', err);
            error = err.message || "Failed to fetch chat triggers";
        } finally {
            loading = false;
        }
    }

    async function loadGuildRoles() {
        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            guildRoles = await api.getGuildRoles($currentGuild.id);
        } catch (err) {
            console.error('Failed to fetch guild roles:', err);
        }
    }

    async function addTrigger() {
        if (!newTrigger.trigger.trim() || !newTrigger.response.trim()) {
            showNotificationMessage('Trigger and Response are required', 'error');
            return;
        }

        if (newTrigger.isRegex && !newTrigger.isValidRegex) {
            showNotificationMessage('Invalid regex pattern', 'error');
            return;
        }

        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            const addedTrigger = await api.addChatTrigger($currentGuild.id, newTrigger);
            triggers = [...triggers, addedTrigger];
            showNotificationMessage('Trigger added successfully', 'success');
            newTrigger = {
                guildId: $currentGuild.id,
                trigger: '',
                response: '',
                grantedRoles: '',
                removedRoles: '',
                isRegex: false,
                isValidRegex: true
            };
            newTriggerRegexTestString = '';
            newTriggerRegexTestResult = '';
            newTriggerRegexHighlightedString = '';
        } catch (error) {
            showNotificationMessage('Failed to add trigger: ' + error.message, 'error');
        }
    }

    async function updateTrigger(trigger: ChatTriggers) {
        if (!trigger.trigger.trim() || !trigger.response.trim()) {
            showNotificationMessage('Trigger and Response are required', 'error');
            return;
        }

        if (trigger.isRegex && !trigger.isValidRegex) {
            showNotificationMessage('Invalid regex pattern', 'error');
            return;
        }

        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            const updatedTrigger = {
                ...trigger,
                grantedRoles: roleArrayToString(trigger.grantedRoles),
                removedRoles: roleArrayToString(trigger.removedRoles),
                guildId: $currentGuild.id,
            };
            await api.updateChatTrigger($currentGuild.id, updatedTrigger);
            showNotificationMessage('Trigger updated successfully', 'success');
            await loadTriggers();
        } catch (error) {
            showNotificationMessage('Failed to update trigger: ' + error.message, 'error');
        }
    }

    async function deleteTrigger(triggerId) {
        if (!confirm('Are you sure you want to delete this trigger?')) {
            return;
        }

        try {
            if (!$currentGuild?.id) {
                throw new Error("No guild selected");
            }
            await api.deleteChatTrigger($currentGuild.id, triggerId);
            showNotificationMessage('Trigger deleted successfully', 'success');
            await loadTriggers();
        } catch (error) {
            showNotificationMessage('Failed to delete trigger: ' + error.message, 'error');
        }
    }

    function toggleExpand(triggerId) {
        expandedTrigger = expandedTrigger === triggerId ? null : triggerId;
    }

    function isBoolean(value) {
        return typeof value === 'boolean';
    }

    function isEnum(key) {
        return ['prefixType', 'roleGrantType', 'validTriggerTypes', 'applicationCommandType'].includes(key);
    }

    function isRoleSelection(key) {
        return ['grantedRoles', 'removedRoles'].includes(key);
    }

    function getEnumOptions(key) {
        switch (key) {
            case 'prefixType':
                return RequirePrefixType;
            case 'roleGrantType':
                return CtRoleGrantType;
            case 'validTriggerTypes':
                return ChatTriggerType;
            case 'applicationCommandType':
                return CtApplicationCommandType;
            default:
                return {};
        }
    }

    function roleArrayToString(roleArray) {
        if (Array.isArray(roleArray)) {
            return roleArray.join('@@@');
        } else if (typeof roleArray === 'string') {
            return roleArray; // It's already a string, just return it
        } else {
            return ''; // Return an empty string for any other type
        }
    }

    function roleStringToArray(roleString) {
        if (typeof roleString === 'string') {
            return roleString.split('@@@').filter(role => role.trim() !== '');
        } else if (Array.isArray(roleString)) {
            return roleString;
        } else {
            return [];
        }
    }

    function validateRegex(regex: string): boolean {
        try {
            new RegExp(regex);
            return true;
        } catch (e) {
            return false;
        }
    }

    function handleRegexChange(trigger) {
        if (trigger.isRegex) {
            trigger.isValidRegex = validateRegex(trigger.trigger);
        }
    }

    function highlightMatches(text: string, regex: RegExp): string {
        return text.replace(regex, match => `<span class="bg-yellow-300 text-black">${match}</span>`);
    }

    function testRegex(trigger) {
        if (trigger.isRegex && trigger.isValidRegex) {
            try {
                const regex = new RegExp(trigger.trigger, 'g');
                const matches = regexTestString.match(regex);
                if (matches) {
                    regexTestResult = `${matches.length} match${matches.length > 1 ? 'es' : ''}`;
                    regexHighlightedString = highlightMatches(regexTestString, regex);
                } else {
                    regexTestResult = 'No matches';
                    regexHighlightedString = regexTestString;
                }
            } catch (e) {
                regexTestResult = 'Error testing regex';
                regexHighlightedString = regexTestString;
            }
        } else {
            regexTestResult = '';
            regexHighlightedString = '';
        }
    }
</script>

<svelte:head>
    <title>Chat Triggers - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Chat Triggers</h1>
    {#if showNotification}
        <Notification message={notificationMessage} type={notificationType} />
    {/if}
    {#if loading}
        <p role="status">Loading...</p>
    {:else if error}
        <p class="text-red-500" role="alert">{error}</p>
    {:else if triggers.length === 0}
        <p transition:fade class="text-gray-400 italic">No chat triggers found.</p>
    {:else}
        <ul class="space-y-4" aria-label="Chat triggers list">
            {#each triggers as trigger (trigger.id)}
                <li class="bg-gray-800 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">Trigger: {trigger.trigger}</p>
                            <p class="text-sm text-gray-400">Response: {trigger.response}</p>
                        </div>
                        <button
                                class="text-blue-500"
                                on:click={() => toggleExpand(trigger.id)}
                                aria-expanded={expandedTrigger === trigger.id}
                                aria-controls={`trigger-details-${trigger.id}`}
                        >
                            {expandedTrigger === trigger.id ? 'Collapse' : 'Expand'}
                        </button>
                    </div>

                    {#if expandedTrigger === trigger.id}
                        <div
                                transition:slide
                                class="mt-4 space-y-4"
                                id={`trigger-details-${trigger.id}`}
                        >
                            {#each Object.entries(trigger) as [key, value]}
                                {#if !['id', 'dateAdded', 'guildId', 'isValidRegex', 'useCount', 'applicationCommandId'].includes(key)}
                                    <div class="flex flex-col">
                                        <label for={`${trigger.id}-${key}`} class="text-sm text-gray-400 mb-1">{getDescriptiveLabel(key)}:</label>
                                        {#if key === 'trigger'}
                                            <input
                                                    id={`${trigger.id}-${key}`}
                                                    class="bg-gray-700 text-white p-2 rounded"
                                                    class:border-red-500={trigger.isRegex && !trigger.isValidRegex}
                                                    bind:value={trigger[key]}
                                                    on:input={() => handleRegexChange(trigger)}
                                                    aria-invalid={trigger.isRegex && !trigger.isValidRegex}
                                            />
                                            {#if trigger.isRegex && !trigger.isValidRegex}
                                                <p class="text-red-500 text-sm mt-1" role="alert">Invalid regex syntax</p>
                                            {/if}
                                        {:else if isBoolean(value)}
                                            <select
                                                    id={`${trigger.id}-${key}`}
                                                    class="bg-gray-700 text-white p-2 rounded"
                                                    bind:value={trigger[key]}
                                                    on:change={() => key === 'isRegex' && handleRegexChange(trigger)}
                                            >
                                                <option value={true}>Yes</option>
                                                <option value={false}>No</option>
                                            </select>
                                        {:else if isEnum(key)}
                                            <div class="relative">
                                                <button
                                                        id={`${trigger.id}-${key}`}
                                                        class="bg-gray-700 text-white p-2 rounded w-full text-left"
                                                        on:click={() => toggleDropdown(`${trigger.id}-${key}`)}
                                                        aria-haspopup="listbox"
                                                        aria-expanded={activeDropdown === `${trigger.id}-${key}`}
                                                >
                                                    {getEnumDisplayValue(getEnumOptions(key), trigger[key])}
                                                </button>
                                                {#if activeDropdown === `${trigger.id}-${key}`}
                                                    <div
                                                            class="absolute z-10 w-full mt-1 bg-gray-700 rounded shadow-lg"
                                                            role="listbox"
                                                            tabindex="-1"
                                                            aria-labelledby={`${trigger.id}-${key}`}
                                                            data-dropdown={`${trigger.id}-${key}`}
                                                            bind:this={dropdownRef}
                                                            on:keydown={(event) => handleDropdownKeydown(event, `${trigger.id}-${key}`)}
                                                    >
                                                        {#each Object.entries(getEnumOptions(key)) as [optionKey, optionValue]}
                                                            <button
                                                                    role="option"
                                                                    aria-selected={trigger[key] === optionValue}
                                                                    class="block w-full text-left px-4 py-2 hover:bg-gray-600"
                                                                    on:click={() => toggleOption(optionKey, key, trigger)}
                                                                    on:keydown={(event) => handleOptionKeydown(event, optionKey, key, trigger)}
                                                            >
                                                                {optionKey}
                                                            </button>
                                                        {/each}
                                                    </div>
                                                {/if}
                                            </div>
                                        {:else if isRoleSelection(key)}
                                            <MultiSelectDropdown
                                                    id={`${trigger.id}-${key}`}
                                                    options={guildRoles}
                                                    bind:selected={trigger[key]}
                                                    placeholder="Select roles"
                                                    on:change={(e) => {
                                                    trigger[key] = e.detail;
                                                }}
                                            />
                                        {:else}
                                            <input
                                                    id={`${trigger.id}-${key}`}
                                                    class="bg-gray-700 text-white p-2 rounded"
                                                    bind:value={trigger[key]}
                                            />
                                        {/if}
                                    </div>
                                {/if}
                            {/each}
                            {#if trigger.isRegex && trigger.isValidRegex}
                                <div class="mt-2">
                                    <label for={`${trigger.id}-regex-test`} class="sr-only">Test regex</label>
                                    <input
                                            id={`${trigger.id}-regex-test`}
                                            class="bg-gray-700 text-white p-2 rounded w-full"
                                            bind:value={regexTestString}
                                            placeholder="Test your regex here"
                                            on:input={() => testRegex(trigger)}
                                    />
                                    {#if regexTestResult}
                                        <p class="text-sm mt-1" class:text-green-500={regexTestResult !== 'No matches'}
                                           class:text-red-500={regexTestResult === 'No matches'} aria-live="polite">
                                            {regexTestResult}
                                        </p>
                                        {#if regexHighlightedString}
                                            <div class="mt-2 p-2 bg-gray-700 rounded" aria-live="polite">
                                                {@html regexHighlightedString}
                                            </div>
                                        {/if}
                                    {/if}
                                </div>
                            {/if}
                            <div class="flex justify-between mt-2">
                                <button
                                        on:click={() => updateTrigger(trigger)}
                                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Update Trigger
                                </button>
                                <button
                                        on:click={() => deleteTrigger(trigger.id)}
                                        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Delete Trigger
                                </button>
                            </div>
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}

    <div class="mt-8 bg-gray-800 rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-4">Add New Trigger</h2>
        <div class="space-y-4">
            <label for="new-trigger" class="sr-only">Trigger Text or Pattern</label>
            <input
                    id="new-trigger"
                    bind:value={newTrigger.trigger}
                    class="w-full bg-gray-700 text-white p-2 rounded"
                    class:border-red-500={newTrigger.isRegex && !newTrigger.isValidRegex}
                    placeholder="Trigger Text or Pattern"
                    on:input={handleNewTriggerRegexChange}
                    required
                    aria-invalid={newTrigger.isRegex && !newTrigger.isValidRegex}
            />
            {#if newTrigger.isRegex && !newTrigger.isValidRegex}
                <p class="text-red-500 text-sm mt-1" role="alert">Invalid regex syntax</p>
            {/if}
            <label for="new-response" class="sr-only">Response Message</label>
            <input
                    id="new-response"
                    bind:value={newTrigger.response}
                    class="w-full bg-gray-700 text-white p-2 rounded"
                    placeholder="Response Message"
                    required
            />
            <label for="new-trigger-type" class="sr-only">Trigger Type</label>
            <select
                    id="new-trigger-type"
                    bind:value={newTrigger.isRegex}
                    class="w-full bg-gray-700 text-white p-2 rounded"
                    on:change={handleNewTriggerRegexChange}
            >
                <option value={false}>Normal Trigger</option>
                <option value={true}>Regular Expression Trigger</option>
            </select>
            {#if newTrigger.isRegex && newTrigger.isValidRegex}
                <div class="mt-2">
                    <label for="new-regex-test" class="sr-only">Test regex</label>
                    <input
                            id="new-regex-test"
                            class="bg-gray-700 text-white p-2 rounded w-full"
                            bind:value={newTriggerRegexTestString}
                            placeholder="Test your regex here"
                            on:input={testNewTriggerRegex}
                    />
                    {#if newTriggerRegexTestResult}
                        <p class="text-sm mt-1" class:text-green-500={newTriggerRegexTestResult !== 'No matches'}
                           class:text-red-500={newTriggerRegexTestResult === 'No matches'} aria-live="polite">
                            {newTriggerRegexTestResult}
                        </p>
                        {#if newTriggerRegexHighlightedString}
                            <div class="mt-2 p-2 bg-gray-700 rounded" aria-live="polite">
                                {@html newTriggerRegexHighlightedString}
                            </div>
                        {/if}
                    {/if}
                </div>
            {/if}
            <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    on:click={addTrigger}
            >
                Add Trigger
            </button>
        </div>
    </div>
</div>