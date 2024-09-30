<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { fade, fly } from 'svelte/transition';
	import type { BotStatusModel } from '$lib/types/models.ts';
	import type { PageData } from '../../../.svelte-kit/types/src/routes/dashboard/afk/$types';
	import { goto } from '$app/navigation';
	import reducedMotion from '$lib/reducedMotion';

	let botStatus: BotStatusModel | null = null;
	let loading = true;
	let error: string | null = null;
	export let data: PageData;

	onMount(async () => {
		if (!data || !data.user) await goto('/api/discord/login');
		try {
			botStatus = await api.getBotStatus();
		} catch (err) {
			error = 'Failed to fetch bot status';
			console.error(error, err);
		} finally {
			loading = false;
		}
	});

	function getStatusColor(status: string): string {
		switch (status.toLowerCase()) {
			case 'online':
				return 'bg-green-500';
			case 'idle':
				return 'bg-yellow-500';
			case 'dnd':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	}
</script>

<svelte:head>
	<title>Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
	<h1 class="text-4xl font-bold mb-8 text-center">Mewdeko Dashboard</h1>

	{#if loading}
		<!-- Added aria-live for announcing loading status -->
		<div class="flex justify-center items-center h-64" aria-live="polite">
			<!-- Added role and aria-label to the spinner -->
			<div
				class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"
				role="status"
				aria-label="Loading"
			></div>
		</div>
	{:else if error}
		<!-- role="alert" is appropriate for error messages -->
		<div
			class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
			role="alert"
		>
			<strong class="font-bold">Error!</strong>
			<span class="block sm:inline">{error}</span>
		</div>
	{:else if botStatus}
		<div
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
			in:fade="{{ duration: $reducedMotion ? 0 : 300 }}"
		>
			<!-- Bot Profile Card -->
			<div
				class="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-800 rounded-lg shadow-lg overflow-hidden"
			>
				<div class="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
					{#if botStatus.botBanner}
						<!-- Improved alt text for the banner image -->
						<img
							src={botStatus.botBanner}
							alt="Banner image for {botStatus.botName}"
							class="w-full h-full object-cover"
						/>
					{/if}
					<div
						class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4"
					>
						<div class="flex items-center">
							<!-- alt text is appropriate here -->
							<img
								src={botStatus.botAvatar}
								alt="{botStatus.botName} Avatar"
								class="w-24 h-24 rounded-full border-4 border-white mr-4"
							/>
							<div>
								<h2 class="text-3xl font-bold">{botStatus.botName}</h2>
								<p class="text-lg">Version: {botStatus.botVersion}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Status Card -->
			<div
				class="bg-gray-800 rounded-lg shadow-lg p-6"
				in:fly="{{
					y: 50,
					duration: $reducedMotion ? 0 : 300,
					delay: $reducedMotion ? 0 : 150
				}}"
			>
				<!-- Changed heading level from h3 to h2 for proper hierarchy -->
				<h2 class="text-xl font-semibold mb-4">Bot Status</h2>
				<div class="flex items-center mb-2">
					<!-- Added aria-hidden to decorative element -->
					<div
						class={`w-3 h-3 rounded-full mr-2 ${getStatusColor(
							botStatus.botStatus
						)}`}
						aria-hidden="true"
					></div>
					<span class="capitalize">{botStatus.botStatus}</span>
				</div>
				<p>Latency: {botStatus.botLatency}ms</p>
			</div>

			<!-- Stats Card -->
			<div
				class="bg-gray-800 rounded-lg shadow-lg p-6"
				in:fly="{{
					y: 50,
					duration: $reducedMotion ? 0 : 300,
					delay: $reducedMotion ? 0 : 300
				}}"
			>
				<!-- Changed heading level from h3 to h2 -->
				<h2 class="text-xl font-semibold mb-4">Bot Stats</h2>
				<p>Commands: {botStatus.commandsCount}</p>
				<p>Modules: {botStatus.modulesCount}</p>
				<p>Users: {botStatus.userCount}</p>
			</div>

			<!-- Technical Info Card -->
			<div
				class="bg-gray-800 rounded-lg shadow-lg p-6"
				in:fly="{{
					y: 50,
					duration: $reducedMotion ? 0 : 300,
					delay: $reducedMotion ? 0 : 450
				}}"
			>
				<!-- Changed heading level from h3 to h2 -->
				<h2 class="text-xl font-semibold mb-4">Technical Info</h2>
				<p>Discord.NET: {botStatus.dNetVersion}</p>
				<p>Commit Hash: {botStatus.commitHash}</p>
			</div>
		</div>
	{/if}
</div>
