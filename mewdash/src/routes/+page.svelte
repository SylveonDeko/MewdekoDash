<script lang="ts">
    import FluidContainer from "$lib/util/FluidContainer.svelte";
    import Interactable from "$lib/util/InteractableElement.svelte";
    import CommentElement from "$lib/CommentElement.svelte";
    import Carousel from "$lib/carousel/Carousel.svelte";
    import ImageWrapper from "$lib/carousel/ImageWrapper.svelte";
    import type { PageData } from "./$types";
    import MultiButton from "$lib/MultiButton.svelte";
    import TopServers from "$lib/TopServers.svelte";

    export let data: PageData;
</script>

<head>
    <meta content="Mewdeko - The Most Customizable Free Open Source Bot for Discord" property="og:title">
    <meta content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!" name="description">
    <meta content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!" property="og:description">
    <meta content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!" name="twitter:description">
    <meta name="keywords" content="Mewdeko, free Discord bot, open source Discord bot, customizable Discord bot, Discord music bot, Discord moderation bot, server management, role management, AFK bot, Discord greets, starboard, custom commands, multi-purpose bot">
</head>

<header class="py-12 px-4 sm:px-12 flex flex-col items-center bg-mewd-light-grey">
    <h1 class="pt-10 text-center font-extrabold text-mewd-white sm:max-w-[40rem] md:max-w-[50rem] xl:max-w-[70rem] text-[28px] sm:text-3xl lg:text-4xl xl:text-[40px]">
        Mewdeko - The Most Customizable Free and Open Source Discord Bot
    </h1>
    <MultiButton links="{[
        { text: 'Invite', href: 'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303' },
        { text: 'Donate', href: 'https://ko-fi.com/mewdeko' },
        { text: 'Server', href: 'https://discord.gg/deko' },
    ]}" />
    <TopServers />
</header>

<section class="flex justify-center bg-mewd-dark-grey" title="mewdekos features">
    <div class="pt-12 pb-24 md:px-6 lg:px-12 max-w-[130rem]">
        <FluidContainer breakpoints='{["md", "xl"]}'>
            <Interactable
                    cta="{{text:'Invite Me',href:'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303' }}"
                    description="With Auto Ban words, antispam, antiraid, and 2 different warning systems, Mewdeko can be as flexible as you want it to be!"
                    slot="element-1"
                    title="Moderation"
            >
                <Carousel items={[
                    {
                        component: ImageWrapper,
                        props:  {
                            alt: 'Auto Ban Words',
                            src: 'img/AutoBan.png'
                        }
                    },{
                        component: ImageWrapper,
                        props:   {
                            alt: 'Moderation Commands',
                            src: 'img/Moderation.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            alt: 'Anti Raid Protection',
                            src: 'img/AntiRaid.png'
                        }
                    }
                ]}/>
            </Interactable>
            <Interactable
                    cta="{{text:'Support Server',href:'https://discord.gg/mewdeko' }}"
                    description="With a team that actually cares about you, we try to help out in the best way possible! Don't be afraid to DM Sylveon for bot support, I don't bite!"
                    slot="element-2"
                    title="Helpful/Friendly Staff"
            >
                <Carousel items={[
                    {
                        component: ImageWrapper,
                        props: {
                            alt: 'Hosting A Bot',
                            src: 'img/FriendlyStaff1.png'
                        }
                    },{
                        component: ImageWrapper,
                        props:  {
                            alt: 'Help Command',
                            src: 'img/FriendlyStaff2.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            alt: 'Walking The Dog',
                            src: 'img/FriendlyStaff3.png'
                        }
                    }
                ]}/>
            </Interactable>
            <Interactable
                    cta="{{text:'Source Code',href:'https://github.com/SylveonDeko/Mewdeko' }}"
                    description="Our bot is completely open source with an AGPLv3 license (to combat code resellers)! We have self-host guides/scripts on the repo as well!"
                    slot="element-3"
                    title="Open Source"
            >
                <img src="img/clipboard-image.png" title="Github Repo" alt="Github Repo"
                     class="w-full overflow-hidden rounded-xl"/>
            </Interactable>
            <Interactable
                    description="Create up to 30 MultiGreets in one server!"
                    slot="element-4"
                    title="MultiGreets"
            >
                <img src="img/img.png" title="MultiGreets" alt="MultiGreets"
                     class="w-full overflow-hidden rounded-xl"/>
            </Interactable>
            <Interactable
                    description="You can create custom text and slash commands using the embed builder and variables, both are optional!<br><br>
                Go to Resources at the top for links to the embed builder and placeholders!"
                    slot="element-5"
                    title="Custom Responses"
            >
                <Carousel items={[
                    {
                        component: ImageWrapper,
                        props:  {
                            alt: 'Creating Custom Response',
                            src: 'img/ChatTriggers1.png'
                        }
                    },{
                        component: ImageWrapper,
                        props:   {
                            alt: 'Editing Custom Response',
                            src: 'img/ChatTriggers2.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            alt: 'Custom Command In Action',
                            src: 'img/ChatTriggers3.png'
                        }
                    }
                ]}/>
            </Interactable>
            <Interactable
                    description="After spending hours on end making sure this works properly, you can customize many, many aspects of the bot to your liking! It's overkill sometimes honestly."
                    slot="element-6"
                    title="Customizable"
            >
                <Carousel items={[
                    {
                        component: ImageWrapper,
                        props: {
                            alt: 'Suggestion Commands',
                            src: 'img/Customizeable1.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            alt: 'Starboard Commands',
                            src: 'img/Customizeable2.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            alt: 'AFK Commands',
                            src: 'img/Customizeable3.png'
                        }
                    }
                ]}/>
            </Interactable>
            <Interactable
                    description="With a little over 20 modules, and me coming up with the most niche stuff to add, you definitely won't get bored! (I hope)"
                    slot="element-7"
                    title="... And Much More!"
                    cta={{ text: "Check them out!", href: "/commands" }}
            >
                <img src="img/Modules1.png" title="Modules List" alt="Modules List" class="w-full overflow-hidden rounded-xl"/>
            </Interactable>
        </FluidContainer>
    </div>
</section>

<section class="flex justify-center min-h-screen bg-mewd-light-grey" title="mewdekos testimonials">
    <div class="pt-32 pb-12 lg:mx-14 max-w-[45rem] lg:max-w-[82rem] px-3">
        <div class="mb-16 px-2">
            <p class="h-min mb-2 text-center font-extrabold text-mewd-green">
                Testimonials
            </p>
            <h2 class="h-min mb-2 text-center font-black text-mewd-white text-[26px] md:text-[30px] lg

:text-[32px]">
                What People Say About Mewdeko
            </h2>
            <p class="h-min text-center font-medium text-mewd-offwhite text-md">
                We've been around for 2 years, there's bound to be some good reviews.
            </p>
        </div>
        <FluidContainer breakpoints='{["sm", "lg"]}'>
            <CommentElement
                    slot="element-1"
                    platform="Top.gg"
                    text="This is the most useful bot that XNekø has used! There is so many different types of things to do it’s amazing! 5 stars to the bot and them who created the bot! :3"
                    user='{{
                    name: "XNekø",
                    href: "https://top.gg/user/212055598057304064",
                    avatar: "img/xneko-pfp.gif"
                }}'
            />
            <CommentElement
                    slot="element-2"
                    platform="Top.gg"
                    text="Out of all bots to exist, I understand this one the most lmao - so yeah!<br>I love the bot and hope nothing but the best for future reference"
                    user='{{
                    name: "[Heath] Her Strawberry BobaTea™",
                    href: "https://top.gg/user/2363846306423308288",
                    avatar: "img/DiscordDefault.png"
                }}'
            />
            <CommentElement
                    slot="element-3"
                    platform="Top.gg"
                    text="这个 Discord Bot 很棒 +100 Social Credit"
                    user='{{
                    name: "aknatn",
                    avatar: "img/DiscordDefault.png"
                }}'
            />
        </FluidContainer>
    </div>
</section>