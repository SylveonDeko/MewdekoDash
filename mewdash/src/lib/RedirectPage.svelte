<script lang="ts">
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";

    onMount(async () => {
        //await invalidateAll();
        if (delay == null) {
            clearInterval(interval);
            await goto(to, {invalidateAll: true})
        } else {
            setTimeout(async () => {
                clearInterval(interval);
                await goto(to, {invalidateAll: true})
            }, delay * 1000)
        }
    })

    export let to: string;
    export let delay: number | null;
    //Countdown timer
    let now = Date.now();
    let end = delay ? now + delay * 1000 + 200 : now; //200ms buffer so we never show users 0 seconds left
    function updateTimer() {
        if (now >= end) {
            clearInterval(interval);
        }
        now = Date.now();
    }

    let interval = setInterval(updateTimer, 1000);

    //Countdown text
    $: count = delay ? Math.round((end - now) / 1000) : null;
</script>

<div class="flex flex-col justify-center place-items-center space-y-6 h-screen w-screen bg-mewd-dark-grey px-6 text-mewd-white">
    <div class="font-bold text-2xl">
        <slot/>
    </div>
    <div>
        <p class="text-center text-lg">You should be automatically redirected to "{to}" in {count ?? "a few"}
            seconds.</p>
        <p class="text-center text-lg">
            Click
            <a class="font-bold text-xl" href="{to}">here</a>
            to go there manually.
        </p>
    </div>
</div>