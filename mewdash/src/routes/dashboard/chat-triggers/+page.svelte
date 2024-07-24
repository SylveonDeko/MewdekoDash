            <script lang="ts">
                import { onMount } from 'svelte';
                import { api } from '$lib/api';
                import type { PageData } from './$types';
                import { currentGuild } from "$lib/stores/currentGuild.ts";
                import { fade, slide } from 'svelte/transition';
                import MultiSelectDropdown from '$lib/MultiSelectDropdown.svelte';
                import type {ChatTriggers} from "$lib/types/models.ts";

                export let data: PageData;
                let triggers : ChatTriggers[] = [];
                let newTrigger = {
                    guildId: $currentGuild?.id,
                    trigger: '',
                    response: '',
                    grantedRoles: '',
                    removedRoles: '',
                    isRegex: false
                };
                let expandedTrigger: ChatTriggers = null;
                let loading = true;
                let error = null;
                let guildRoles = [];
                let regexTestString = '';
                let regexTestResult = '';

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
                    await loadTriggers();
                    await loadGuildRoles();
                });

                function getDescriptiveLabel(key: string): string {
                    switch (key) {
                        case 'useCount': return 'Usage Count';
                        case 'isRegex': return 'Is Regular Expression';
                        case 'ownerOnly': return 'Owner Only';
                        case 'guildId': return 'Guild ID';
                        case 'response': return 'Response Message';
                        case 'trigger': return 'Trigger Text or Pattern';
                        case 'prefixType': return 'Prefix Requirement';
                        case 'customPrefix': return 'Custom Prefix';
                        case 'autoDeleteTrigger': return 'Auto Delete Trigger Message';
                        case 'reactToTrigger': return 'React to Trigger Message';
                        case 'noRespond': return 'Don\'t Respond to Trigger';
                        case 'dmResponse': return 'Send Response as DM';
                        case 'containsAnywhere': return 'Trigger If Contained Anywhere';
                        case 'allowTarget': return 'Allow Targeting';
                        case 'reactions': return 'Trigger Reactions';
                        case 'grantedRoles': return 'Roles to Grant';
                        case 'removedRoles': return 'Roles to Remove';
                        case 'roleGrantType': return 'Role Grant Target';
                        case 'validTriggerTypes': return 'Valid Trigger Types';
                        case 'applicationCommandId': return 'Application Command ID';
                        case 'applicationCommandName': return 'Application Command Name';
                        case 'applicationCommandDescription': return 'Application Command Description';
                        case 'applicationCommandType': return 'Application Command Type';
                        case 'ephemeralResponse': return 'Ephemeral Response';
                        case 'crosspostingChannelId': return 'Crossposting Channel ID';
                        case 'crosspostingWebhookUrl': return 'Crossposting Webhook URL';
                        default: return key;
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
                    try {
                        if (!$currentGuild?.id) {
                            throw new Error("No guild selected");
                        }
                        const addedTrigger = await api.addChatTrigger($currentGuild.id, newTrigger);
                        triggers = [...triggers, addedTrigger];
                        newTrigger = {
                            guildId: $currentGuild.id,
                            trigger: '',
                            response: '',
                            grantedRoles: '',
                            removedRoles: '',
                            isRegex: false
                        };
                    } catch (error) {
                        alert('Failed to add trigger: ' + error.message);
                    }
                }

                async function updateTrigger(trigger: ChatTriggers) {
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
                        alert('Trigger updated successfully');
                        await loadTriggers();
                    } catch (error) {
                        alert('Failed to update trigger: ' + error.message);
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
                        alert('Trigger deleted successfully');
                        await loadTriggers(); // Reload the triggers to reflect the change
                    } catch (error) {
                        alert('Failed to delete trigger: ' + error.message);
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
                    switch(key) {
                        case 'prefixType': return RequirePrefixType;
                        case 'roleGrantType': return CtRoleGrantType;
                        case 'validTriggerTypes': return ChatTriggerType;
                        case 'applicationCommandType': return CtApplicationCommandType;
                        default: return {};
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

                {#if loading}
                    <p>Loading...</p>
                {:else if error}
                    <p class="text-red-500">{error}</p>
                {:else if triggers.length === 0}
                    <p transition:fade class="text-gray-400 italic">No chat triggers found.</p>
                {:else}
                    <ul class="space-y-4">
                        {#each triggers as trigger (trigger.id)}
                            <li class="bg-gray-800 rounded-lg p-4">
                                <div class="flex justify-between items-center cursor-pointer" on:click={() => toggleExpand(trigger.id)}>
                                    <div>
                                        <p class="font-semibold">Trigger: {trigger.trigger}</p>
                                        <p class="text-sm text-gray-400">Response: {trigger.response}</p>
                                    </div>
                                    <button class="text-blue-500">
                                        {expandedTrigger === trigger.id ? 'Collapse' : 'Expand'}
                                    </button>
                                </div>

                                {#if expandedTrigger === trigger.id}
                                    <div transition:slide class="mt-4 space-y-4">
                                        {#each Object.entries(trigger) as [key, value]}
                                            {#if !['id', 'dateAdded', 'guildId', 'isValidRegex'].includes(key)}
                                                <div class="flex flex-col">
                                                    <label class="text-sm text-gray-400 mb-1">{getDescriptiveLabel(key)}:</label>
                                                    {#if key === 'trigger'}
                                                        <input
                                                                class="bg-gray-700 text-white p-2 rounded"
                                                                class:border-red-500={trigger.isRegex && !trigger.isValidRegex}
                                                                bind:value={trigger[key]}
                                                                on:input={() => handleRegexChange(trigger)}
                                                                on:click|stopPropagation={() => {}}
                                                        />
                                                        {#if trigger.isRegex && !trigger.isValidRegex}
                                                            <p class="text-red-500 text-sm mt-1">Invalid regex syntax</p>
                                                        {/if}
                                                    {:else if isBoolean(value)}
                                                        <select
                                                                class="bg-gray-700 text-white p-2 rounded"
                                                                bind:value={trigger[key]}
                                                                on:change={() => key === 'isRegex' && handleRegexChange(trigger)}
                                                                on:click|stopPropagation={() => {}}
                                                        >
                                                            <option value={true}>Yes</option>
                                                            <option value={false}>No</option>
                                                        </select>
                                                    {:else if isEnum(key)}
                                                        <select
                                                                class="bg-gray-700 text-white p-2 rounded"
                                                                bind:value={trigger[key]}
                                                                on:click|stopPropagation={() =>          {}}
                                                        >
                                                            {#each Object.entries(getEnumOptions(key)) as [optionKey, optionValue]}
                                                                <option value={optionValue}>{optionKey}</option>
                                                            {/each}
                                                        </select>
                                                    {:else if isRoleSelection(key)}
                                                        <MultiSelectDropdown
                                                                options={guildRoles}
                                                                bind:selected={trigger[key]}
                                                                placeholder="Select roles"
                                                                on:change={(e) => {
                                                                 trigger[key] = e.detail;
                                                            }}
                                                        />
                                                    {:else}
                                                        <input
                                                                class="bg-gray-700 text-white p-2 rounded"
                                                                bind:value={trigger[key]}
                                                                on:click|stopPropagation={() => {}}
                                                        />
                                                    {/if}
                                                </div>
                                            {/if}
                                        {/each}
                                        {#if trigger.isRegex && trigger.isValidRegex}
                                            <div class="mt-2">
                                                <input
                                                        class="bg-gray-700 text-white p-2 rounded w-full"
                                                        bind:value={regexTestString}
                                                        placeholder="Test your regex here"
                                                        on:input={() => testRegex(trigger)}
                                                />
                                                {#if regexTestResult}
                                                    <p class="text-sm mt-1" class:text-green-500={regexTestResult !== 'No matches'} class:text-red-500={regexTestResult === 'No matches'}>
                                                        {regexTestResult}
                                                    </p>
                                                    {#if regexHighlightedString}
                                                        <div class="mt-2 p-2 bg-gray-700 rounded">
                                                            {@html regexHighlightedString}
                                                        </div>
                                                    {/if}
                                                {/if}
                                            </div>
                                        {/if}
                                        <div class="flex justify-between mt-2">
                                            <button
                                                    on:click|stopPropagation={() => updateTrigger(trigger)}
                                                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Update Trigger
                                            </button>
                                            <button
                                                    on:click|stopPropagation={() => deleteTrigger(trigger.id)}
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
                        <input
                                class="w-full bg-gray-700 text-white p-2 rounded"
                                bind:value={newTrigger.trigger}
                                placeholder="Trigger Text or Pattern"
                        />
                        <input
                                class="w-full bg-gray-700 text-white p-2 rounded"
                                bind:value={newTrigger.response}
                                placeholder="Response Message"
                        />
                        <select
                                class="w-full bg-gray-700 text-white p-2 rounded"
                                bind:value={newTrigger.isRegex}
                        >
                            <option value={false}>Normal Trigger</option>
                            <option value={true}>Regular Expression Trigger</option>
                        </select>
                        <button
                                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                on:click={addTrigger}
                        >
                            Add Trigger
                        </button>
                    </div>
                </div>
            </div>