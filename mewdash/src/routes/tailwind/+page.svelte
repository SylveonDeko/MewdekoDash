<script lang="ts">
    import FluidContainer from "$lib/util/FluidContainer.svelte";
    import Interactable from "$lib/util/InteractableElement.svelte";
    import CommentElement from "$lib/CommentElement.svelte";
</script>

<header class="py-12 px-4 sm:px-12 flex justify-center bg-slate-200">
    <h1 class="max-w-[70rem] font-extrabold text-center text-[28px] sm:text-3xl lg:text-4xl xl:text-[40px]">
        The most&nbsp;customizable free&nbsp;bot you'll&nbsp;find. Open&nbsp;Source&nbsp;too.
    </h1>
</header>
<section class="bg-gray-900 flex justify-center" title="medekos features">
    <div class="pt-12 pb-24 max-w-[110rem]">
        <h2 class="pt-9 pb-16 px-3 font-extrabold text-center text-2xl sm:text-2xl lg:text-[28px] text-white">Here's what Mewdeko can do for&nbsp;you</h2>
        <FluidContainer breakpoints='{["md", "xl"]}'>
            <Interactable
                    cta="{{text:'Invite Me',href:'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303&scope=bot' }}"
                    description="With Auto Ban words, antispam, antiraid
                                    and 2 different warning systems (yes two!)
                                    Mewdeko can be as flexible as you want it to be!"
                    slot="element-1"
                    title="Moderation"
            >
                <div class="h-[22rem] bg-rose-100 w-full text-center">Image 1</div>
            </Interactable>
            <Interactable
                    cta="{{text:'Support Server',href:'https://discord.gg/mewdeko' }}"
                    description="With a team that actually cares about you,
                                    we try to help out in the best way possible!
                                    Also don't be afraid to dm Sylveon for bot support, I don't bite!"
                    slot="element-2"
                    title="Helpful/Friendly Staff"
            >
                <div class="h-[30rem] bg-rose-300 w-full text-center">Image 2</div>
            </Interactable>
            <Interactable
                    cta="{{text:'Source Code',href:'https://github.com/SylveonDeko/Mewdeko' }}"
                    description="Our bot is completely open source with an agplv3 license (to combat code resellers)!
                                    We have selfhost guides/scripts on the repo as well!"
                    slot="element-3"
                    title="Open Source"
            >
                <div class="h-[22rem] bg-rose-500 w-full text-center">Image 3</div>
            </Interactable>
            <Interactable
                    description="You can create custom text and slash commands using
                                    the embed builder and variables, both are optional!<br><br>
                                    Go to Resources at the top for links to the embed builder and placeholders!"
                    slot="element-4"
                    title="Custom Responses"
            >
                <div class="h-[29rem] bg-rose-700 w-full text-center">Image 4</div>
            </Interactable>
            <Interactable
                    description="After spending hours on end making sure this works properly,
                                    you can customize many, many aspects of the bot to your liking!
                                    It's overkill sometimes honestly."
                    slot="element-5"
                    title="Customizable"
            >
                <div class="h-[37rem] bg-rose-900 w-full text-center">Image 5</div>
            </Interactable>
            <Interactable
                    description="With a little over 20 modules, and me coming up with the most niche shit to add, you definitely wont get bored! (I hope)"
                    slot="element-6"
                    title="... And much more!"
            />
        </FluidContainer>
    </div>
</section>
<section class="bg-slate-200 flex justify-center" title="mewdekos testimonials">
    <div class="pt-32 pb-12 lg:mx-14 max-w-[82rem] px-3">
        <div class="mb-16 px-2">
            <p class="text-center h-min mb-2 text-emerald-400 font-extrabold">
                Testimonials
            </p>
            <h2 class="text-center h-min mb-2 text-[26px] md:text-[30px] lg:text-[32px] font-black">
                What People Say About Mewdeko
            </h2>
            <p class="text-center text-md h-min font-medium">
                We've been around for 2 years, there's bound to be some good reviews.
            </p>
        </div>
        <FluidContainer breakpoints='{["sm", "lg", "xl"]}'>
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
                    text="Out of all bots to exist, I understand this one the most lmao&nbsp;-&nbsp;so yeah!<br>
                            I love the bot and hope nothing but the best for future reference"
                    user='{{
                        name:"[Heath] Her Strawberry BobaTea™",
                        href:"https://top.gg/user/212055598057304064",
                        avatar:"img/cdn/DiscordDefault.png"
                    }}'
            />
            <CommentElement
                    slot="element-3"
                    platform="Top.gg"
                    text="这个&nbsp;Discord&nbsp;Bot&nbsp;很棒 +100&nbsp;Social&nbsp;Credit"
                    user='{{
                        name:"aknatn",
                        href:"https://top.gg/user/212055598057304064",
                        avatar:"img/cdn/DiscordDefault.png"
                    }}'
            />
        </FluidContainer>
    </div>
</section>