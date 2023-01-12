<script lang="ts">
    import FluidContainer from "$lib/util/FluidContainer.svelte";
    import Interactable from "$lib/util/InteractableElement.svelte";
    import CommentElement from "$lib/CommentElement.svelte";
</script>
<header class="p-12  flex justify-center bg-slate-200">
    <h1 class="font-extrabold text-center text-3xl ">
        The most free and customizable bot you'll&nbsp;find.<br>Open Source too.
    </h1>
</header>
<section title="medekos features" class="bg-gray-900">
    <div class="pt-12 pb-6 px-3">
        <h2 class="p-9 font-extrabold text-center text-2xl  text-white">Here's what Mewdeko can do for&nbsp;you</h2>
    </div>
    <FluidContainer>
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
</section>
<section title="mewdekos testimonials" class="bg-slate-200">
    <div class="py-12 px-4 mx-20">
        <div class="px-4">
            <div class="mb-12">
                <p class="text-center h-min mb-2 text-emerald-400 font-extrabold">
                    Testimonials
                </p>
                <h2 class="text-center h-min mb-2 text-3xl font-extrabold">
                    What People Say About Mewdeko
                </h2>
                <p class="text-center h-min mb-4 font-medium">
                    We've been around for 2 years, there's bound to be some good reviews.
                </p>
            </div>
            <FluidContainer small="true">
                <CommentElement
                        slot="element-1"
                        user='{{
                        name:"XNekø",
                        href:"https://top.gg/user/212055598057304064",
                        avatar:{
                            src:"https://top.gg/_next/image?url=https%3A%2F%2Fimages.discordapp.net%2Favatars%2F873463733228273684%2F05dae0404286f73cb08f14af05c448c5.png%3Fsize%3D512&w=64&q=75",
                            alt:"TopGG XNeko Avatar"
                        }
                    }}'
                        text="This is the most useful bot that XNekø has used!
                            There is so many<br>different types of things to do it’s amazing!
                            5 star to the bot and them<br>who created the bot! :3"
                        platform="Top.gg"
                />
                <CommentElement
                        slot="element-2"
                        user='{{
                        name:"XNekø",
                        href:"https://top.gg/user/212055598057304064",
                        avatar:{
                            src:"https://top.gg/_next/image?url=https%3A%2F%2Fimages.discordapp.net%2Favatars%2F873463733228273684%2F05dae0404286f73cb08f14af05c448c5.png%3Fsize%3D512&w=64&q=75",
                            alt:"TopGG XNeko Avatar"
                        }
                    }}'
                        text="This is the most useful bot that XNekø has used!
                            There is so many<br>different types of things to do it’s amazing!
                            5 star to the bot and them<br>who created the bot! :3"
                        platform="Top.gg"
                />
                <CommentElement
                        slot="element-3"
                        user='{{
                        name:"XNekø",
                        href:"https://top.gg/user/212055598057304064",
                        avatar:{
                            src:"https://top.gg/_next/image?url=https%3A%2F%2Fimages.discordapp.net%2Favatars%2F873463733228273684%2F05dae0404286f73cb08f14af05c448c5.png%3Fsize%3D512&w=64&q=75",
                            alt:"TopGG XNeko Avatar"
                        }
                    }}'
                        text="This is the most useful bot that XNekø has used!
                            There is so many<br>different types of things to do it’s amazing!
                            5 star to the bot and them<br>who created the bot! :3"
                        platform="Top.gg"
                />
            </FluidContainer>
        </div>
    </div>


</section>