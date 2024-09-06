<script lang="ts">
    import {onMount} from 'svelte';
    import {fade, fly} from 'svelte/transition';
    import FluidContainer from "$lib/util/FluidContainer.svelte";
    import Interactable from "$lib/util/InteractableElement.svelte";
    import CommentElement from "$lib/CommentElement.svelte";
    import Carousel from "$lib/carousel/Carousel.svelte";
    import ImageWrapper from "$lib/carousel/ImageWrapper.svelte";
    import type {PageData} from "./$types";
    import MultiButton from "$lib/MultiButton.svelte";
    import type {RedisGuild} from "$lib/types/redisGuild";

    export let data: PageData;

    let guilds: RedisGuild[] = [];
    let fetched = false;
    const MAX_GUILD_NAME_LENGTH = 20;
    const MAX_GUILDS_TO_SHOW = 10;

    onMount(async () => {
        try {
            const response = await fetch("/api/redis/guilds");
            if (response.ok) {
                guilds = await response.json();
                guilds.sort((a, b) => b.MemberCount - a.MemberCount);
                guilds = guilds.slice(0, MAX_GUILDS_TO_SHOW);
                fetched = true;
            } else {
                throw new Error('Failed to fetch guilds');
            }
        } catch (error) {
            console.error('Error fetching guilds:', error);
        }
    });

    function truncateStringToLength(str: string, num: number): string {
        return str.length <= num ? str : str.slice(0, num) + "...";
    }
</script>

<svelte:head>
    <title>Mewdeko - The Most Customizable Free Open Source Discord Bot</title>
    <meta content="Mewdeko - The Most Customizable Free Open Source Bot for Discord" property="og:title">
    <meta content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!"
          name="description">
    <meta content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!"
          property="og:description">
    <meta content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!"
          name="twitter:description">
    <meta content="Mewdeko, free Discord bot, open source Discord bot, customizable Discord bot, Discord music bot, Discord moderation bot, server management, role management, AFK bot, Discord greets, starboard, custom commands, multi-purpose bot"
          name="keywords">
</svelte:head>

<header class="py-16 px-4 sm:px-12 flex flex-col items-center" in:fade={{ duration: 300 }}>
    <h1 class="text-center font-extrabold text-mewd-white max-w-4xl mx-auto text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight mb-8">
        Mewdeko
    </h1>
    <h1 class="text-center font-extrabold text-mewd-white max-w-4x1">The Most Customizable Open Source Bot for Discord!</h1>
    <MultiButton links={[
            { text: 'Invite', href: 'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303' },
            { text: 'Donate', href: 'https://ko-fi.com/mewdeko' },
            { text: 'Server', href: 'https://discord.gg/invite/4stkEfZ6As' },
        ]}/>

    {#if fetched}
        <section class="mt-12 flex flex-col justify-center items-center"
                 title="Mewdeko's Top Servers"
                 in:fade={{ duration: 300, delay: 300 }}>
            <h2 class="mb-6 text-2xl lg:text-3xl text-mewd-white font-bold">Our Top Servers</h2>
            {#if guilds.length > 0}
                <div class="flex flex-wrap justify-center items-center gap-4 p-4">
                    {#each guilds as guild, index (guild.Name)}
                        <div class="relative group"
                             in:fly={{ y: 20, duration: 300, delay: index * 100 }}>
                            <img class="w-12 h-12 rounded-full transition-transform duration-200 transform group-hover:scale-110"
                                 src={guild.IconUrl}
                                 alt={guild.Name}
                                 loading="lazy"/>
                            <div class="absolute hidden group-hover:block z-10 px-3 py-2 text-xs bg-mewd-dark-grey text-mewd-white rounded-md shadow-lg whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                                <p class="font-semibold">{truncateStringToLength(guild.Name, MAX_GUILD_NAME_LENGTH)}</p>
                                <p class="text-mewd-offwhite">{guild.MemberCount.toLocaleString()} Members</p>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <p class="text-mewd-offwhite">No top servers available at the moment.</p>
            {/if}
        </section>
    {/if}
</header>

<section aria-label="Mewdeko's features" class="bg-mewd-dark-grey py-24">
    <div class="container mx-auto px-4 max-w-7xl">
        <h2 class="text-3xl font-bold text-mewd-white mb-12 text-center">Key Features</h2>
        <FluidContainer breakpoints={['md', 'xl']}>
            <Interactable
                    cta={{text:'Invite Me', href:'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303'}}
                    description="With Auto Ban words, Anti Spam, Anti Raid, and two different warning systems, Mewdeko can be as flexible as you want!"
                    slot="element-1"
                    title="Moderation"
            >
                <Carousel items={[
                        { component: ImageWrapper, props: { alt: 'Auto Ban Words', src: 'img/AutoBan.png' }},
                        { component: ImageWrapper, props: { alt: 'Moderation Commands', src: 'img/Moderation.png' }},
                        { component: ImageWrapper, props: { alt: 'Anti Raid Protection', src: 'img/AntiRaid.png' }}
                    ]}/>
            </Interactable>

            <Interactable
                    cta={{text:'Support Server', href:'https://discord.gg/the-deko-tree-843489716674494475'}}
                    description="With a team that cares about you, we try to help out in the best way possible!"
                    slot="element-2"
                    title="Helpful and Friendly Staff"
            >
                <Carousel items={[
                        { component: ImageWrapper, props: { alt: 'Hosting A Bot', src: 'img/FriendlyStaff1.png' }},
                        { component: ImageWrapper, props: { alt: 'Help Command', src: 'img/FriendlyStaff2.png' }},
                        { component: ImageWrapper, props: { alt: 'Walking The Dog', src: 'img/FriendlyStaff3.png' }}
                    ]}/>
            </Interactable>

            <Interactable
                    cta={{text:'Source Code', href:'https://github.com/SylveonDeko/Mewdeko'}}
                    description="Our bot is completely open source with an AGPLv3 license (to combat code resellers)! We have self-host guides/scripts on the repo as well!"
                    slot="element-3"
                    title="Open Source"
            >
                <img alt="Github Repo" class="w-full overflow-hidden rounded-xl" src="img/clipboard-image.png"
                     title="Github Repo"/>
            </Interactable>

            <Interactable
                    description="Create up to 30 MultiGreets in one server!"
                    slot="element-4"
                    title="MultiGreets"
            >
                <img alt="MultiGreets" class="w-full overflow-hidden rounded-xl" src="img/img.png"
                     title="MultiGreets"/>
            </Interactable>

            <Interactable
                    description="You can create custom text and slash commands using the embed builder and variables, both are optional!<br><br>Go to Resources at the top for links to the embed builder and placeholders!"
                    slot="element-5"
                    title="Custom Responses"
            >
                <Carousel items={[
                        { component: ImageWrapper, props: { alt: 'Creating Custom Response', src: 'img/ChatTriggers1.png' }},
                        { component: ImageWrapper, props: { alt: 'Editing Custom Response', src: 'img/ChatTriggers2.png' }},
                        { component: ImageWrapper, props: { alt: 'Custom Command In Action', src: 'img/ChatTriggers3.png' }}
                    ]}/>
            </Interactable>

            <Interactable
                    description="After spending hours on end making sure this works properly, you can customize many, many aspects of the bot to your liking! It's overkill sometimes honestly."
                    slot="element-6"
                    title="Customizable"
            >
                <Carousel items={[
                        { component: ImageWrapper, props: { alt: 'Suggestion Commands', src: 'img/Customizeable1.png' }},
                        { component: ImageWrapper, props: { alt: 'Starboard Commands', src: 'img/Customizeable2.png' }},
                        { component: ImageWrapper, props: { alt: 'AFK Commands', src: 'img/Customizeable3.png' }}
                    ]}/>
            </Interactable>

            <Interactable
                    cta={{ text: "Check them out!", href: "/commands" }}
                    description="With a little over 20 modules, and me coming up with the most niche stuff to add, you definitely won't get bored! (I hope)"
                    slot="element-7"
                    title="... And Much More!"
            >
                <img alt="Modules List" class="w-full overflow-hidden rounded-xl" src="img/Modules1.png"
                     title="Modules List"/>
            </Interactable>
        </FluidContainer>
    </div>
</section>

<section aria-label="Mewdeko testimonials" class="bg-mewd-light-grey py-24">
    <div class="container mx-auto px-4 max-w-7xl">
        <div class="text-center mb-16">
            <p class="text-mewd-offwhite font-extrabold mb-2">Testimonials</p>
            <h2 class="text-mewd-white text-3xl md:text-4xl font-black mb-4">What People Say About Mewdeko</h2>
            <p class="text-mewd-offwhite">We've been around for over three years, there's bound to be some good reviews.</p>
        </div>
        <FluidContainer breakpoints={['sm', 'lg']}>
            <CommentElement
                    platform="Top.gg"
                    slot="element-1"
                    text="This is the most useful bot that XNekø has used! There is so many different types of things to do it's amazing! 5 stars to the bot and them who created the bot! :3"
                    user={{
                        name: "XNekø",
                        href: "https://top.gg/user/212055598057304064",
                        avatar: "img/xneko-pfp.gif"
                    }}
            />
            <CommentElement
                    platform="Top.gg"
                    slot="element-2"
                    text="Out of all bots to exist, I understand this one the most lmao - so yeah!<br>I love the bot and hope nothing but the best for future reference"
                    user={{
                        name: "[Heath] Her Strawberry BobaTea™",
                        href: "https://top.gg/user/2363846306423308288",
                        avatar: "img/DiscordDefault.png"
                    }}
            />
            <CommentElement
                    platform="Top.gg"
                    slot="element-3"
                    text="这个 Discord Bot 很棒 +100 Social Credit"
                    user={{
                        name: "aknatn",
                        avatar: "img/DiscordDefault.png"
                    }}
            />
        </FluidContainer>
    </div>
</section>

<style>
    :global(body) {
        @apply bg-mewd-light-grey text-mewd-white;
    }

    .group:hover {
        z-index: 10;
    }
</style>