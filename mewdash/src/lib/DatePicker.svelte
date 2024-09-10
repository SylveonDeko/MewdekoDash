<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    export let value: Date;
    export let id: string;

    const dispatch = createEventDispatcher();

    let date: string;
    let hours: number;
    let minutes: number;
    let ampm: 'AM' | 'PM';
    let showTimePicker = false;

    $: {
        if (value) {
            date = value.toISOString().split('T')[0];
            hours = value.getHours() % 12 || 12;
            minutes = value.getMinutes();
            ampm = value.getHours() >= 12 ? 'PM' : 'AM';
        }
    }

    function updateDateTime() {
        const [year, month, day] = date.split('-').map(Number);
        let hour = hours % 12;
        if (ampm === 'PM') hour += 12;
        const newDate = new Date(year, month - 1, day, hour, minutes);
        dispatch('change', newDate);
    }

    function handleDateChange(event: Event) {
        date = (event.target as HTMLInputElement).value;
        updateDateTime();
    }

    function setHours(newHours: number) {
        hours = newHours;
        updateDateTime();
    }

    function setMinutes(newMinutes: number) {
        minutes = newMinutes;
        updateDateTime();
    }

    function toggleAmPm() {
        ampm = ampm === 'AM' ? 'PM' : 'AM';
        updateDateTime();
    }

    function toggleTimePicker() {
        showTimePicker = !showTimePicker;
    }

    function applyTime() {
        updateDateTime();
        showTimePicker = false;
    }

    onMount(() => {
        if (!value) {
            value = new Date();
            date = value.toISOString().split('T')[0];
            hours = value.getHours() % 12 || 12;
            minutes = value.getMinutes();
            ampm = value.getHours() >= 12 ? 'PM' : 'AM';
        }
    });
</script>

<div class="w-full bg-gray-800 p-4 rounded-lg shadow-lg">
    <div class="flex flex-col space-y-4">
        <div>
            <label for={`${id}-date-input`} class="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input
                    id={`${id}-date-input`}
                    type="date"
                    bind:value={date}
                    on:change={handleDateChange}
                    class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
            />
        </div>
        <div>
            <label for={`${id}-time-input`} class="block text-sm font-medium text-gray-300 mb-1">Time</label>
            <button
                    id={`${id}-time-input`}
                    on:click={toggleTimePicker}
                    aria-expanded={showTimePicker}
                    aria-controls={`${id}-time-picker`}
                    class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 text-left flex justify-between items-center"
            >
                <span>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')} {ampm}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>

    {#if showTimePicker}
        <div
                id={`${id}-time-picker`}
                class="mt-4 bg-gray-700 p-4 rounded-lg"
                transition:fly="{{ y: 20, duration: 300 }}"
                role="dialog"
                aria-label="Time picker"
        >
            <div class="flex justify-between items-center mb-4">
                <button
                        on:click={() => setHours(hours === 12 ? 1 : hours + 1)}
                        class="text-2xl text-white bg-blue-500 w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                        aria-label="Increase hours"
                >
                    +
                </button>
                <span class="text-2xl font-bold text-white" aria-label="Current hours">{hours.toString().padStart(2, '0')}</span>
                <button
                        on:click={() => setHours(hours === 1 ? 12 : hours - 1)}
                        class="text-2xl text-white bg-blue-500 w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                        aria-label="Decrease hours"
                >
                    -
                </button>
            </div>
            <div class="flex justify-between items-center mb-4">
                <button
                        on:click={() => setMinutes((minutes + 1) % 60)}
                        class="text-2xl text-white bg-blue-500 w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                        aria-label="Increase minutes"
                >
                    +
                </button>
                <span class="text-2xl font-bold text-white" aria-label="Current minutes">{minutes.toString().padStart(2, '0')}</span>
                <button
                        on:click={() => setMinutes((minutes - 1 + 60) % 60)}
                        class="text-2xl text-white bg-blue-500 w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
                        aria-label="Decrease minutes"
                >
                    -
                </button>
            </div>
            <button
                    on:click={toggleAmPm}
                    class="w-full p-2 bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 mb-4"
                    aria-label="Toggle AM/PM"
            >
                {ampm}
            </button>
            <button
                    on:click={applyTime}
                    class="w-full p-2 bg-green-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
            >
                Apply
            </button>
        </div>
    {/if}
</div>