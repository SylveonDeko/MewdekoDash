<script lang="ts">
    import FluidContainer from "$lib/util/FluidContainer.svelte";
    import Interactable from "$lib/util/InteractableElement.svelte";
    import CommentElement from "$lib/CommentElement.svelte";
    import Carousel from "$lib/util/Carousel.svelte";
    import type {PageData} from "./$types";
    import MultiButton from "$lib/MultiButton.svelte";

    export let data: PageData;
</script>
<head><meta content="Mewdeko - The most customizable discord bot." property="og:title">
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
          { text: 'Invite', href: 'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303&scope=bot' },
          { text: 'Donate', href: 'https://ko-fi.com/mewdeko' },
          { text: 'Server', href: 'https://discord.gg/mewdeko' },
        ]}"/>
</header>
<section class="flex justify-center bg-mewd-dark-grey" title="mewdekos features">
    <div class="pt-12 pb-24 md:px-6 lg:px-12 max-w-[130rem]">
        {#if !data.server_count}
            <h2 class="text-center text-mewd-white text-2xl font-bold">Here's what Mewdeko can do for you</h2>
        {:else}
            <h2
                    class="pt-9 pb-16 px-3 text-center font-extrabold text-mewd-text text-2xl sm:text-2xl lg:text-[28px] text-white">
                Mewdeko is in {data.server_count} servers, may the features below grant it one more.</h2>
        {/if}
        <FluidContainer breakpoints='{["md", "xl"]}'>
            <Interactable
                    cta="{{text:'Invite Me',href:'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303' }}"
                    description="With Auto Ban words, antispam, antiraid
                                    and 2 different warning systems (yes two!)
                                    Mewdeko can be as flexible as you want it to be!"
                    slot="element-1"
                    title="Moderation"
            >
                <Carousel images="{[
                    {
                        title: 'Auto Ban Words',
                        src: 'https://media.discordapp.net/attachments/1004047472223588398/1059098637302501416/image.png'
                    },
                    {
                        title: 'Commands',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059099724357054474/image.png'
                    },
                    {
                        title: 'Anti Raid',
                        src: 'https://media.discordapp.net/attachments/970494951836254268/1059099875339423765/image.png'
                    }
                ]}"/>
            </Interactable>
            <Interactable
                    cta="{{text:'Support Server',href:'https://discord.gg/mewdeko' }}"
                    description="With a team that actually cares about you,
                                    we try to help out in the best way possible!
                                    Also don't be afraid to dm Sylveon for bot support, I don't bite!"
                    slot="element-2"
                    title="Helpful/Friendly Staff"
            >
                <Carousel images="{[
                    {
                        title: 'Hosting A Bot',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059100950142394439/image.png'
                    },
                    {
                        title: 'Help Command',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059101488833634344/image.png'
                    },
                    {
                        title: 'Walking The Dog',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059102004334567424/image.png'
                    }
                ]}"/>
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
                <Carousel images="{[
                    {
                        title: 'Creating Custom Response',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059150708651343873/image.png'
                    },
                    {
                        title: 'Editing Custom Response',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059151273007517786/image.png'
                    },
                    {
                        title: 'Custom Command In Action',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059151508651900938/image.png'
                    }
                ]}"/>
            </Interactable>
            <Interactable
                    description="After spending hours on end making sure this works properly,
                                    you can customize many, many aspects of the bot to your liking!
                                    It's overkill sometimes honestly."
                    slot="element-6"
                    title="Customizable"
            >
                <Carousel images="{[
                    {
                        title: 'Suggestion Commands',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059181130579980318/image.png?width=666&height=701'
                    },
                    {
                        title: 'Starboard Commands',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059181297857200128/image.png'
                    },
                    {
                        title: 'Afk Commands',
                        src: 'https://media.discordapp.net/attachments/970494924938166352/1059181417793323028/image.png'
                    }
                ]}"/>
            </Interactable>
            <Interactable
                    description="With a little over 20 modules, and me coming up with the most niche shit to add, you definitely wont get bored! (I hope)"
                    slot="element-7"
                    title="... And much more!"
                    cta={{text: "Check them out!", href: "/commands"}}
            >
                <img src="https://media.discordapp.net/attachments/991151715313254520/1064271068266762390/image.png"
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