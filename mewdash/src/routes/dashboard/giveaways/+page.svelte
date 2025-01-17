<!-- routes/dashboard/giveaways/+page.svelte -->
<script lang="ts">
 import { onMount, onDestroy } from "svelte";
 import { api } from "$lib/api.ts";
 import { currentGuild } from "$lib/stores/currentGuild.ts";
 import { currentInstance } from "$lib/stores/instanceStore.ts";
 import { fade, slide } from "svelte/transition";
 import type { Giveaways } from "$lib/types";
 import { goto } from "$app/navigation";
 import Notification from "$lib/Notification.svelte";
 import MultiSelectDropdown from "$lib/MultiSelectDropdown.svelte";
 import IntervalPicker from "$lib/IntervalPicker.svelte";
 import { browser } from "$app/environment";
 import ColorThief from 'colorthief';
 import {
   Gift, Users, Hash, MessageCircle,
   X, ChevronDown, Trophy,
   Clock, AlertTriangle,
   Bot, Award, Target
 } from 'lucide-svelte';
 import { logger } from "$lib/logger.ts";

 let giveaways: Giveaways[] = [];
 let expandedGiveaway: number | null = null;
 let loading = true;
 let error: string | null = null;
 let showNotification = false;
 let notificationMessage = "";
 let notificationType: "success" | "error" = "success";
 let guildRoles: Array<{ id: string; name: string }> = [];
 let selectedRoles: string[] = [];
 let entryMethod: "reaction" | "button" | "captcha" = "reaction";
 let isMobile = false;

 // Theme and color management
 let colors = {
   primary: '#3b82f6',
   secondary: '#8b5cf6',
   accent: '#ec4899',
   text: '#ffffff',
   muted: '#9ca3af',
   gradientStart: '#3b82f6',
   gradientMid: '#8b5cf6',
   gradientEnd: '#ec4899'
 };

 let newGiveaway: Partial<Giveaways> = {
   item: "",
   winners: 1,
   channelId: BigInt(0),
   when: new Date(Date.now() + 24 * 60 * 60 * 1000),
   restrictTo: "",
   useButton: false,
   useCaptcha: false,
   messageCountReq: BigInt(0),
   serverId: BigInt(0),
   userId: BigInt(0),
   ended: 0,
   messageId: BigInt(0),
   emote: ""
 };

 $: colorVars = `
   --color-primary: ${colors.primary};
   --color-secondary: ${colors.secondary};
   --color-accent: ${colors.accent};
   --color-text: ${colors.text};
   --color-muted: ${colors.muted};
 `;

 function rgbToHsl(r: number, g: number, b: number) {
   r /= 255;
   g /= 255;
   b /= 255;
   const max = Math.max(r, g, b);
   const min = Math.min(r, g, b);
   let h = 0, s, l = (max + min) / 2;

   if (max === min) {
     h = s = 0;
   } else {
     const d = max - min;
     s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
     switch (max) {
       case r: h = (g - b) / d + (g < b ? 6 : 0); break;
       case g: h = (b - r) / d + 2; break;
       case b: h = (r - g) / d + 4; break;
     }
     h /= 6;
   }

   return [h * 360, s * 100, l * 100];
 }

 function rgbToHex(r: number, g: number, b: number) {
   return '#' + [r, g, b].map(x => {
     const hex = x.toString(16);
     return hex.length === 1 ? '0' + hex : hex;
   }).join('');
 }

 function adjustLightness(rgb: number[], lightness: number) {
   const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
   return `hsl(${hsl[0]}, ${hsl[1]}%, ${lightness}%)`;
 }

 async function extractColors() {
   if (!$currentInstance?.botAvatar) return;
   try {
     const img = new Image();
     img.crossOrigin = "Anonymous";
     img.src = $currentInstance.botAvatar;

     await new Promise((resolve, reject) => {
       img.onload = resolve;
       img.onerror = reject;
     });

     const colorThief = new ColorThief();
     const dominantColor = colorThief.getColor(img);
     const palette = colorThief.getPalette(img);

     const primaryHex = rgbToHex(...dominantColor);
     const secondaryHex = rgbToHex(...palette[1]);
     const accentHex = rgbToHex(...palette[2]);

     colors = {
       primary: primaryHex,
       secondary: secondaryHex,
       accent: accentHex,
       text: adjustLightness(dominantColor, 95),
       muted: adjustLightness(dominantColor, 60),
       gradientStart: primaryHex,
       gradientMid: secondaryHex,
       gradientEnd: accentHex
     };
   } catch (err) {
     logger.error('Failed to extract colors:', err);
   }
 }

 function checkMobile() {
   isMobile = browser && window.innerWidth < 768;
 }

 function validateGiveaway(): string | null {
   if (!newGiveaway.item || newGiveaway.item.trim() === "") {
     return "Please enter a valid giveaway item.";
   }
   if (!newGiveaway.winners || newGiveaway.winners < 1) {
     return "The number of winners must be at least 1.";
   }
   if (!newGiveaway.channelId || newGiveaway.channelId <= BigInt(0)) {
     return "Please enter a valid channel ID.";
   }
   if (!newGiveaway.when || newGiveaway.when <= new Date()) {
     return "The end time must be in the future.";
   }
   if (newGiveaway.messageCountReq < BigInt(0)) {
     return "The required message count cannot be negative.";
   }
   return null;
 }

 function handleEntryMethodChange(method: "reaction" | "button" | "captcha") {
   entryMethod = method;
   newGiveaway.useButton = method === "button";
   newGiveaway.useCaptcha = method === "captcha";
 }

 async function fetchGiveaways() {
   try {
     loading = true;
     error = null;
     if (!$currentGuild?.id) throw new Error("No guild selected");
     giveaways = await api.getGiveaways($currentGuild.id);
   } catch (err) {
     logger.error("Failed to fetch giveaways:", err);
     error = (err as Error).message || "Failed to fetch giveaways";
   } finally {
     loading = false;
   }
 }

 async function loadGuildRoles() {
   try {
     if (!$currentGuild?.id) throw new Error("No guild selected");
     guildRoles = await api.getGuildRoles($currentGuild.id);
   } catch (err) {
     logger.error("Failed to fetch guild roles:", err);
   }
 }

 async function createGiveaway() {
   try {
     const validationError = validateGiveaway();
     if (validationError) {
       showNotificationMessage(validationError, "error");
       return;
     }
     if (!$currentGuild?.id) throw new Error("No guild selected");
     newGiveaway.serverId = BigInt($currentGuild.id);
     await api.createGiveaway($currentGuild.id, newGiveaway);
     showNotificationMessage("Giveaway created successfully", "success");
     await fetchGiveaways();
     resetNewGiveaway();
   } catch (error) {
     const errMsg = (error as Error).message || "Unknown error";
     showNotificationMessage("Failed to create giveaway: " + errMsg, "error");
   }
 }

 async function endGiveaway(giveawayId: number) {
   try {
     if (!$currentGuild?.id) throw new Error("No guild selected");
     await api.endGiveaway($currentGuild.id, giveawayId);
     showNotificationMessage("Giveaway ended successfully", "success");
     await fetchGiveaways();
   } catch (error) {
     const errMsg = (error as Error).message || "Unknown error";
     showNotificationMessage("Failed to end giveaway: " + errMsg, "error");
   }
 }

 function toggleGiveawayExpand(id: number) {
   expandedGiveaway = expandedGiveaway === id ? null : id;
 }

 function resetNewGiveaway() {
   newGiveaway = {
     item: "",
     winners: 1,
     channelId: BigInt(0),
     when: new Date(Date.now() + 24 * 60 * 60 * 1000),
     restrictTo: "",
     useButton: false,
     useCaptcha: false,
     messageCountReq: BigInt(0),
     serverId: BigInt(0),
     userId: BigInt(0),
     ended: 0,
     messageId: BigInt(0),
     emote: ""
   };
   selectedRoles = [];
   entryMethod = "reaction";
 }

 function showNotificationMessage(message: string, type: "success" | "error" = "success") {
   notificationMessage = message;
   notificationType = type;
   showNotification = true;
   setTimeout(() => {
     showNotification = false;
   }, 3000);
 }

 function handleRoleSelection(event: CustomEvent<string[]>) {
   selectedRoles = event.detail;
   newGiveaway.restrictTo = selectedRoles.join(" ");
 }

 function handleDurationChange(event: CustomEvent<Date>) {
   const selectedEndTime = event.detail;
   newGiveaway.when = selectedEndTime;
 }

 function handleWinnersChange(event: Event) {
   const input = event.target as HTMLInputElement;
   const value = parseInt(input.value);
   if (value < 1) {
     input.value = "1";
     newGiveaway.winners = 1;
     showNotificationMessage("The number of winners must be at least 1.", "error");
   } else {
     newGiveaway.winners = value;
   }
 }

 function handleMessageCountChange(event: Event) {
   const input = event.target as HTMLInputElement;
   const value = BigInt(input.value);
   if (value < BigInt(0)) {
     input.value = "0";
     newGiveaway.messageCountReq = BigInt(0);
     showNotificationMessage("The required message count cannot be negative.", "error");
   } else {
     newGiveaway.messageCountReq = value;
   }
 }

 function handleKeyDown(event: KeyboardEvent, giveawayId: number) {
   if (event.key === "Enter" || event.key === " ") {
     toggleGiveawayExpand(giveawayId);
   }
 }

 // Reactive statements
 $: if ($currentGuild) {
   fetchGiveaways();
   loadGuildRoles();
 }

 onMount(async () => {
   if (!$currentGuild) await goto("/dashboard");
   await Promise.all([fetchGiveaways(), loadGuildRoles()]);
   extractColors();
   checkMobile();
   if (browser) window.addEventListener("resize", checkMobile);
 });

 onDestroy(() => {
   if (browser) window.removeEventListener("resize", checkMobile);
 });
</script>

<div
 class="min-h-screen p-4 md:p-6"
 style="{colorVars} background: radial-gradient(circle at top,
   {colors.gradientStart}15 0%,
   {colors.gradientMid}10 50%,
   {colors.gradientEnd}05 100%);"
>
 <div class="max-w-7xl mx-auto space-y-8">
   <h1 class="text-3xl font-bold mb-8" style="color: {colors.text}">
     <div class="flex items-center gap-3 justify-center">
       <Gift class="w-8 h-8" style="color: {colors.primary}" />
       Giveaways
     </div>
   </h1>

   {#if showNotification}
     <div class="fixed top-4 right-4 z-50" transition:fade>
       <Notification message={notificationMessage} type={notificationType} />
     </div>
   {/if}

   {#if loading}
     <div class="flex justify-center items-center min-h-[400px]">
       <div class="relative">
         <div
           class="w-16 h-16 border-4 rounded-full animate-spin"
           style="border-color: {colors.primary}20; border-top-color: {colors.primary}"
         ></div>
         <span class="mt-4 block text-center" style="color: {colors.muted}">Loading giveaways...</span>
       </div>
     </div>
   {:else if error}
     <div
       class="p-6 rounded-xl mb-6"
       style="background: {colors.accent}10; border: 1px solid {colors.accent}40;"
       role="alert"
     >
       <div class="flex items-center gap-3">
         <AlertTriangle class="w-6 h-6" style="color: {colors.accent}" />
         <div style="color: {colors.accent}">
           <div class="font-semibold text-lg">Error Occurred</div>
           <div class="text-sm mt-1" style="color: {colors.accent}90">{error}</div>
         </div>
       </div>
     </div>
   {:else}
     <!-- Create New Giveaway Section -->
     <section
       class="backdrop-blur-sm rounded-xl border p-6 mb-8"
       style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
              border-color: {colors.primary}30;"
       transition:fade
     >
       <h2 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: {colors.text}">
         <Trophy class="h-6 w-6" style="color: {colors.primary}" />
         Create New Giveaway
       </h2>

       <form on:submit|preventDefault={createGiveaway} class="space-y-6">
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <!-- Giveaway Item -->
           <div class="space-y-2">
             <label class="flex items-center gap-2 text-sm font-medium" style="color: {colors.text}">
               <Gift class="w-4 h-4" style="color: {colors.primary}" />
               Giveaway Item
             </label>
             <input
               bind:value={newGiveaway.item}
               placeholder="Enter the item to be given away"
               class="w-full p-3 rounded-lg border focus:ring-2"
               style="background: {colors.primary}10;
                      border-color: {colors.primary}30;
                      color: {colors.text}"
               required
             />
           </div>

           <!-- Winners Count -->
           <div class="space-y-2">
             <label class="flex items-center gap-2 text-sm font-medium" style="color: {colors.text}">
               <Award class="w-4 h-4" style="color: {colors.primary}" />
               Number of Winners
             </label>
             <input
               type="number"
               bind:value={newGiveaway.winners}
               min="1"
               on:change={handleWinnersChange}
               class="w-full p-3 rounded-lg border focus:ring-2"
               style="background: {colors.primary}10;
                      border-color: {colors.primary}30;
                      color: {colors.text}"
               required
             />
           </div>

           <!-- Channel ID -->
           <div class="space-y-2 md:col-span-2">
             <label class="flex items-center gap-2 text-sm font-medium" style="color: {colors.text}">
               <Hash class="w-4 h-4" style="color: {colors.primary}" />
               Channel
             </label>
             <input
               bind:value={newGiveaway.channelId}
               placeholder="Enter channel ID"
               class="w-full p-3 rounded-lg border focus:ring-2"
               style="background: {colors.primary}10;
                      border-color: {colors.primary}30;
                      color: {colors.text}"
               required
               inputmode="numeric"
               pattern="[0-9]*"
             />
           </div>

           <!-- Duration -->
           <div class="space-y-2 md:col-span-2">
             <label class="flex items-center gap-2 text-sm font-medium" style="color: {colors.text}">
               <Clock class="w-4 h-4" style="color: {colors.primary}" />
               Duration
             </label>
             <IntervalPicker on:change={handleDurationChange} />
           </div>

           <!-- Required Roles -->
           <div class="space-y-2 md:col-span-2">
             <label class="flex items-center gap-2 text-sm font-medium" style="color: {colors.text}">
               <Users class="w-4 h-4" style="color: {colors.primary}" />
               Required Roles
             </label>
             <MultiSelectDropdown
               options={guildRoles}
               bind:selected={selectedRoles}
               on:change={handleRoleSelection}
               placeholder="Select required roles"
             />
           </div>

           <!-- Message Count Requirement -->
           <div class="space-y-2 md:col-span-2">
             <label class="flex items-center gap-2 text-sm font-medium" style="color: {colors.text}">
               <MessageCircle class="w-4 h-4" style="color: {colors.primary}" />
               Required Message Count
             </label>
             <input
               type="number"
               bind:value={newGiveaway.messageCountReq}
               min="0"
               on:change={handleMessageCountChange}
               class="w-full p-3 rounded-lg border focus:ring-2"
               style="background: {colors.primary}10;
                      border-color: {colors.primary}30;
                      color: {colors.text}"
               inputmode="numeric"
               pattern="[0-9]*"
             />
           </div>
         </div>

         <!-- Entry Method -->
         <div class="space-y-4 pt-4 border-t" style="border-color: {colors.primary}20">
           <label class="block text-sm font-medium" style="color: {colors.text}">
             <div class="flex items-center gap-2 mb-4">
               <Target class="w-4 h-4" style="color: {colors.primary}" />
               Entry Method
             </div>
           </label>
           <div class="flex flex-wrap gap-3">
             {#each [
               { id: 'reaction', label: 'Reaction', icon: Gift },
               { id: 'button', label: 'Button', icon: Target },
               { id: 'captcha', label: 'Captcha', icon: Bot }
             ] as method}
               <button
                 type="button"
                 class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                 style="background: {entryMethod === method.id ? colors.primary : `${colors.primary}20`};
                        color: {entryMethod === method.id ? colors.text : colors.muted}"
                 on:click={() => handleEntryMethodChange(method.id === 'reaction' ? 'reaction' : method.id === 'button' ? 'button' : 'captcha')}
               >
                 <svelte:component this={method.icon} class="w-4 h-4" />
                 {method.label}
               </button>
             {/each}
           </div>
         </div>

         <button
           type="submit"
           class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                  flex items-center justify-center gap-2"
           style="background: {colors.primary};
                  color: {colors.text}"
         >
           <Trophy class="w-5 h-5" />
           Create Giveaway
         </button>
       </form>
     </section>

     <!-- Active Giveaways -->
     <section
       class="backdrop-blur-sm rounded-xl border p-6"
       style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
              border-color: {colors.primary}30;"
     >
       <h2 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: {colors.text}">
         <Gift class="h-6 w-6" style="color: {colors.primary}" />
         Active Giveaways
       </h2>

       {#if giveaways.length === 0}
         <div class="text-center py-12" style="color: {colors.muted}">
           <Gift class="w-12 h-12 mx-auto mb-4 opacity-50" />
           <p class="text-lg">No active giveaways</p>
           <p class="text-sm mt-2">Create your first giveaway using the form above</p>
         </div>
       {:else}
         <div class="space-y-4">
           {#each giveaways as giveaway (giveaway.id)}
             <div
               class="rounded-lg border transition-all duration-200"
               style="background: {colors.primary}10;
                      border-color: {colors.primary}30;"
             >
               <div
                 class="p-4 flex justify-between items-center cursor-pointer"
                 on:click={() => toggleGiveawayExpand(giveaway.id)}
                 on:keydown={(e) => handleKeyDown(e, giveaway.id)}
                 role="button"
                 tabindex="0"
               >
                 <div class="flex items-center gap-4">
                   <Gift class="w-5 h-5" style="color: {colors.primary}" />
                   <div>
                     <h3 class="font-medium" style="color: {colors.text}">{giveaway.item}</h3>
                     <p class="text-sm" style="color: {colors.muted}">
                       Ends {new Date(giveaway.when).toLocaleString()}
                     </p>
                   </div>
                 </div>
                 <ChevronDown
                   class="w-5 h-5 transform transition-transform duration-200 rotate-180={expandedGiveaway === giveaway.id}"
                   style="color: {colors.muted}"
                 />
               </div>

               {#if expandedGiveaway === giveaway.id}
                 <div class="px-4 pb-4 pt-2 border-t"
                      style="border-color: {colors.primary}20"
                      transition:slide>
                   <div class="grid gap-4 md:grid-cols-2">
                     <div class="space-y-2">
                       <p class="flex items-center gap-2 text-sm">
                         <Award class="w-4 h-4" style="color: {colors.secondary}" />
                         <span style="color: {colors.muted}">Winners:</span>
                         <span style="color: {colors.text}">{giveaway.winners}</span>
                       </p>
                       <p class="flex items-center gap-2 text-sm">
                         <Hash class="w-4 h-4" style="color: {colors.secondary}" />
                         <span style="color: {colors.muted}">Channel:</span>
                         <span style="color: {colors.text}">{giveaway.channelId.toString()}</span>
                       </p>
                       {#if giveaway.restrictTo}
                         <p class="flex items-center gap-2 text-sm">
                           <Users class="w-4 h-4" style="color: {colors.secondary}" />
                           <span style="color: {colors.muted}">Required Roles:</span>
                           <span style="color: {colors.text}">{giveaway.restrictTo}</span>
                         </p>
                       {/if}
                     </div>
                     <div class="space-y-2">
                       <p class="flex items-center gap-2 text-sm">
                         <MessageCircle class="w-4 h-4" style="color: {colors.secondary}" />
                         <span style="color: {colors.muted}">Message Requirement:</span>
                         <span style="color: {colors.text}">{giveaway.messageCountReq.toString()}</span>
                       </p>
                       <p class="flex items-center gap-2 text-sm">
                         <Target class="w-4 h-4" style="color: {colors.secondary}" />
                         <span style="color: {colors.muted}">Entry Method:</span>
                         <span style="color: {colors.text}">
                           {giveaway.useButton ? "Button" : giveaway.useCaptcha ? "Captcha" : "Reaction"}
                         </span>
                       </p>
                     </div>
                   </div>

                   {#if !giveaway.ended}
                     <button
                       class="mt-6 w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
                              flex items-center justify-center gap-2"
                       style="background: {colors.accent}20;
                              color: {colors.accent}"
                       on:click={() => endGiveaway(giveaway.id)}
                     >
                       <X class="w-4 h-4" />
                       End Giveaway
                     </button>
                   {/if}
                 </div>
               {/if}
             </div>
           {/each}
         </div>
       {/if}
     </section>
   {/if}
 </div>
</div>

<style>
 /* Hide number input spinners */
 input[type="number"]::-webkit-inner-spin-button,
 input[type="number"]::-webkit-outer-spin-button {
   -webkit-appearance: none;
   margin: 0;
 }

 input[type="number"] {
   -moz-appearance: textfield;
 }

 /* Add smooth transitions */
 [style*="background"],
 [style*="color"] {
   @apply transition-colors duration-300;
 }

 /* Custom scrollbar styling */
 :global(*::-webkit-scrollbar) {
   @apply w-2;
 }

 :global(*::-webkit-scrollbar-track) {
   background: var(--color-primary)10;
   @apply rounded-full;
 }

 :global(*::-webkit-scrollbar-thumb) {
   background: var(--color-primary)30;
   @apply rounded-full;
 }

 :global(*::-webkit-scrollbar-thumb:hover) {
   background: var(--color-primary)50;
 }
</style>