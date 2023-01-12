<div class="mb-8 px-3">
    <div class="flex flex-col items-center sm:items-start max-w-[26rem]">
        <p class="p-6 mb-4 rounded-2xl bg-gray-900 text-white">{@html text}</p>
        <div class="flex flex-row">
            <div>
                <img class="mr-4 rounded-full"
                     src="{user?.avatar}" alt="{platform.trim()} {user?.name.trim().split(' ')[0]} Avatar"
                     height="50" width="50">
            </div>
            <div>
                <a class="underline font-extrabold hover:text-gray-700" href="{user?.href}">{user?.name}</a>
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