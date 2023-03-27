<script lang="ts">
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    onMount(async () => {
        if (delay == null) {
            await goto(to)
        } else {
            setTimeout(async () => {
                await goto(to)
            }, delay * 1000)
        }
    })
    export let to: string;
    export let delay: number | null;
</script>

<div class="flex flex-col justify-center place-items-center space-y-6 h-screen w-screen text-white px-6">
    <div class="font-bold text-2xl">
        <slot/>
    </div>
    <div>
        <p class="text-center text-lg">You should be automatically redirected to "{to}"
            in {delay ? delay : "a few"} seconds.</p>
        <p class="text-center text-lg">
            Click
            <a class="font-bold text-xl" href="{to}">here</a>
            to go there manually.
        </p>
    </div>
</div>