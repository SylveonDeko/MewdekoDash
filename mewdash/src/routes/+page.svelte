<script lang="ts">
    import FluidContainer from "$lib/util/FluidContainer.svelte";
    import Interactable from "$lib/util/InteractableElement.svelte";
    import CommentElement from "$lib/CommentElement.svelte";
    import Carousel from "$lib/carousel/Carousel.svelte";
    import ImageWrapper from "$lib/carousel/ImageWrapper.svelte";
    import type {PageData} from "./$types";
    import MultiButton from "$lib/MultiButton.svelte";
    import TopServers from "$lib/TopServers.svelte";

    export let data: PageData;
</script>
<head>
    <meta content="Mewdeko - The most customizable discord bot." property="og:title">
    <meta content="Come find out what the most customizable free and open source bot you'll find can offer you..."
          name="description">
    <meta content="Come find out what the most customizable free and open source bot you'll find can offer you..."
          property="og:description">
    <meta content="Come find out what the most customizable free and open source bot you'll find can offer you..."
          name="twitter:description">
</head>
<header class="py-12 px-4 sm:px-12 flex flex-col items-center bg-mewd-light-grey">
    <h1
            class="pt-10 text-center font-extrabold text-mewd-white sm:max-w-[40rem] md:max-w-[50rem] xl:max-w-[70rem] text-[28px] sm:text-3xl lg:text-4xl xl:text-[40px]">
        The most&nbsp;customizable free&nbsp;bot you'll&nbsp;find. Open&nbsp;Source&nbsp;too.
    </h1>
    <MultiButton links="{[
          { text: 'Invite', href: 'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303' },
          { text: 'Donate', href: 'https://ko-fi.com/mewdeko' },
          { text: 'Server', href: 'https://discord.gg/mewdeko' },
        ]}"/>

    <TopServers/>
</header>
<section class="flex justify-center bg-mewd-dark-grey" title="mewdekos features">
    <div class="pt-12 pb-24 md:px-6 lg:px-12 max-w-[130rem]">
        <h2 class="pt-9 pb-16 px-3 text-center font-extrabold text-mewd-text text-2xl sm:text-2xl lg:text-[28px] text-white">
            Mewdeko is in {data?.server_count!=null && !isNaN(data?.server_count) ? data?.server_count : "N/A"} servers, may the features below grant it one more.
        </h2>
        <FluidContainer breakpoints='{["md", "xl"]}'>
            <Interactable
                    cta="{{text:'Invite Me',href:'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303' }}"
                    description="With Auto Ban words, antispam, antiraid
                                    and 2 different warning systems (yes two!)
                                    Mewdeko can be as flexible as you want it to be!"
                    slot="element-1"
                    title="Moderation"
            >
                <Carousel items={[
                    {
                        component: ImageWrapper,
                        props:  {
                            alt: 'Auto Ban Words',
                            src: 'https://cdn.mewdeko.tech/AutoBan.png'
                        }
                    },{
                        component: ImageWrapper,
                        props:   {
                            title: 'Commands',
                            src: 'https://cdn.mewdeko.tech/Moderation.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            title: 'Anti Raid',
                            src: 'https://cdn.mewdeko.tech/AntiRaid.png'
                        }
                    }
                ]}/>
            </Interactable>
            <Interactable
                    cta="{{text:'Support Server',href:'https://discord.gg/mewdeko' }}"
                    description="With a team that actually cares about you,
                                    we try to help out in the best way possible!
                                    Also don't be afraid to dm Sylveon for bot support, I don't bite!"
                    slot="element-2"
                    title="Helpful/Friendly Staff"
            >
                <Carousel items={[
                    {
                        component: ImageWrapper,
                        props: {
                            alt: 'Hosting A Bot',
                            src: 'https://cdn.mewdeko.tech/FriendlyStaff1.png'
                        }
                    },{
                        component: ImageWrapper,
                        props:  {
                            alt: 'Help Command',
                            src: 'https://cdn.mewdeko.tech/FriendlyStaff2.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            alt: 'Walking The Dog',
                            src: 'https://cdn.mewdeko.tech/FriendlyStaff3.png'
                        }
                    }
                ]}/>
            </Interactable>
            <Interactable
                    cta="{{text:'Source Code',href:'https://github.com/SylveonDeko/Mewdeko' }}"
                    description="Our bot is completely open source with an agplv3 license (to combat code resellers)!
                                    We have selfhost guides/scripts on the repo as well!"
                    slot="element-3"
                    title="Open Source"
            >
                <img src="img/clipboard-image.png" title="Github Repo" alt="Github Repo"
                     class="w-full overflow-hidden rounded-xl"/>
            </Interactable>
            <Interactable
                    description="Create up to 30 MultiGreets in one server!"
                    slot="element-4"
                    title="Overkill"
            >
                <img src="img/img.png" title="MultiGreets" alt="Github Repo"
                     class="w-full overflow-hidden rounded-xl"/>
            </Interactable>
            <Interactable
                    description="You can create custom text and slash commands using
                                    the embed builder and variables, both are optional!<br><br>
                                    Go to Resources at the top for links to the embed builder and placeholders!"
                    slot="element-5"
                    title="Custom Responses"
            >
                <Carousel items={[
                    {
                        component: ImageWrapper,
                        props:  {
                            alt: 'Creating Custom Response',
                            src: 'https://cdn.mewdeko.tech/ChatTriggers1.png'
                        }
                    },{
                        component: ImageWrapper,
                        props:   {
                            alt: 'Editing Custom Response',
                            src: 'https://cdn.mewdeko.tech/ChatTriggers2.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            alt: 'Custom Command In Action',
                            src: 'https://cdn.mewdeko.tech/ChatTriggers3.png'
                        }
                    }
                ]}/>
            </Interactable>
            <Interactable
                    description="After spending hours on end making sure this works properly,
                                    you can customize many, many aspects of the bot to your liking!
                                    It's overkill sometimes honestly."
                    slot="element-6"
                    title="Customizable"
            >
                <Carousel items={[
                    {
                        component: ImageWrapper,
                        props: {
                            title: 'Suggestion Commands',
                            src: 'https://cdn.mewdeko.tech/Customizeable1.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            title: 'Starboard Commands',
                            src: 'https://cdn.mewdeko.tech/Customizeable2.png'
                        }
                    },{
                        component: ImageWrapper,
                        props: {
                            title: 'Afk Commands',
                            src: 'https://cdn.mewdeko.tech/Customizeable3.png'
                        }
                    }
                ]}/>
            </Interactable>
            <Interactable
                    description="With a little over 20 modules, and me coming up with the most niche stuff to add, you definitely wont get bored! (I hope)"
                    slot="element-7"
                    title="... And much more!"
                    cta={{text: "Check them out!", href: "/commands"}}
            >
                <img src="https://cdn.mewdeko.tech/Modules1.png"
                     title="Modules List" alt="Modules List" class="w-full overflow-hidden rounded-xl"/>
            </Interactable>
        </FluidContainer>
    </div>
</section>
<section class="flex justify-center min-h-screen bg-mewd-light-grey" title="mewdekos testimonials">
    <div class="pt-32 pb-12 lg:mx-14 max-w-[45rem] lg:max-w-[82rem] px-3">
        <div class="mb-16 px-2">
            <p class=" h-min mb-2 text-center font-extrabold text-mewd-green">
                Testimonials
            </p>
            <h2 class="h-min mb-2 text-center font-black text-mewd-white text-[26px] md:text-[30px] lg:text-[32px]">
                What People Say About Mewdeko
            </h2>
            <p class="h-min text-center font-medium text-mewd-offwhite text-md ">
                We've been around for 2 years, there's bound to be some good reviews.
            </p>
        </div>
        <FluidContainer breakpoints='{["sm", "lg"]}'>
            <CommentElement
                    slot="element-1"
                    platform="Top.gg"
                    text="This is the most useful bot that XNekø has used!
                            There is so many different types of things to do it’s amazing!
                            5&nbsp;star to the bot and them who created the bot!&nbsp;:3"
                    user='{{
                        name:"XNekø",
                        href:"https://top.gg/user/212055598057304064",
                        avatar:"https://top.gg/_next/image?url=https%3A%2F%2Fimages.discordapp.net%2Favatars%2F873463733228273684%2F05dae0404286f73cb08f14af05c448c5.png%3Fsize%3D512&w=64&q=75"
                    }}'
            />
            <CommentElement
                    slot="element-2"
                    platform="Top.gg"
                    text="Out of all bots to exist, I&nbsp;understand this one the most lmao&nbsp;-&nbsp;so yeah!<br>
                            I love the bot and hope nothing but the best for future reference"
                    user='{{
                        name:"[Heath] Her Strawberry BobaTea™",
                        href:"https://top.gg/user/2363846306423308288",
                        avatar:"https://cdn.mewdeko.tech/DiscordDefault.png"
                    }}'
            />
            <CommentElement
                    slot="element-3"
                    platform="Top.gg"
                    text="这个&nbsp;Discord&nbsp;Bot&nbsp;很棒 +100&nbsp;Social&nbsp;Credit"
                    user='{{
                        name:"aknatn",
                        avatar:"https://cdn.mewdeko.tech/DiscordDefault.png"
                    }}'
            />
        </FluidContainer>
    </div>
</section>