<div class="mb-8 px-4">
    <div class="flex flex-col items-center sm:items-start max-w-[22rem]">
        <p class="p-6 mb-4 rounded-2xl bg-gray-900 text-white">{@html text}</p>
        <div class="flex flex-row">
            {#if user && user.avatar && user.avatar.src && user.avatar.alt}
                <img class="mr-4 rounded-full"
                     src="{user.avatar.src}" alt="{user.avatar.alt}"
                     height="50" width="50">
            {/if}
            <div>
                <a href="{user?.href}" class="underline font-extrabold hover:text-gray-700">{user?.name}</a>
                <p>{platform}</p>
            </div>
        </div>
    </div>
</div>
<script lang="ts">
    export let text: string;
    export let user: { name: string, href: string, avatar: { src: string, alt: string } };
    export let platform: string;
</script>