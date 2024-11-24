<!-- lib/CommentElement.svelte -->
<script lang="ts">
  export let text: string;
  export let user: {
    name: string;
    href?: string | null;
    avatar: { src: string; alt: string };
  };
  export let platform: string;
</script>

<div class="mb-8 px-3">
  <div class="flex flex-col sm:items-start max-w-[26rem]">
    <p class="p-6 mb-4 rounded-2xl bg-mewd-dark-grey text-mewd-white">
      {@html text}
    </p>
    <div class="flex flex-row">
      <div>
        <img
          class="mr-4 rounded-full"
          src={user?.avatar.src}
          alt="{platform.trim()} {user?.name.trim().split(' ')[0]} Avatar"
          height="50"
          width="50"
        />
      </div>
      <div>
        {#if user?.href == null}
          <p class="font-extrabold text-mewd-offwhite">
            {user?.name}
          </p>
        {:else}
          <a
            class="font-extrabold text-mewd-offwhite underline hover:text-mewd-white"
            href={user.href}
          >
            {user?.name}
          </a>
        {/if}
        <p class="text-mewd-offwhite">{platform}</p>
      </div>
    </div>
  </div>
</div>
