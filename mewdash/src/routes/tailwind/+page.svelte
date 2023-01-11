<script lang="ts">
    import Navbar from "$lib/nav/Navbar.svelte";
    import FluidContainer from "$lib/util/FluidContainer.svelte";
    import Interactable from "$lib/util/InteractableElement.svelte";

    const navbarItems: { title: string, href: string }[] = [
        {href: "/tailwind", title: "Home"},
        {href: "/contacts", title: "Contact Us"},
        {href: "/staff", title: "Staff"},
        {href: "/resources", title: "Resources"}
    ]
</script>
<Navbar items="{navbarItems}"/>
<header class="p-12  flex justify-center bg-slate-200">
    <h1 class="font-bold text-center text-3xl ">
        The most free and customizable bot you'll&nbsp;find.<br>Open Source too.
    </h1>
</header>
<section class="bg-gray-900">
    <div class="pt-12 px-3">
        <h2 class="p-9 font-bold text-center text-2xl  text-white">Here's what Mewdeko can do for&nbsp;you</h2>
    </div>
    <FluidContainer>
        <Interactable
                slot="element-1"
                title="Moderation"
                description="With Auto Ban words, antispam, antiraid
                                    and 2 different warning systems (yes two!)
                                    Mewdeko can be as flexible as you want it to be!"
                cta="{{text:'Invite Me',href:'https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303&scope=bot' }}"
        >
            <div class="h-[22rem] bg-rose-100 w-full text-center">Image 1</div>
        </Interactable>
        <Interactable
                slot="element-2"
                title="Helpful/Friendly Staff"
                description="With a team that actually cares about you,
                                    we try to help out in the best way possible!
                                    Also don't be afraid to dm Sylveon for bot support, I don't bite!"
                cta="{{text:'Support Server',href:'https://discord.gg/mewdeko' }}"
        >
           <div class="h-[30rem] bg-rose-300 w-full text-center">Image 2</div>
        </Interactable>
        <Interactable
                slot="element-3"
                title="Open Source"
                description="Our bot is completely open source with an agplv3 license (to combat code resellers)!
                                    We have selfhost guides/scripts on the repo as well!"
                cta="{{text:'Source Code',href:'https://github.com/SylveonDeko/Mewdeko' }}"
        >
            <div class="h-[22rem] bg-rose-500 w-full text-center">Image 3</div>
        </Interactable>
        <Interactable
                slot="element-4"
                title="Custom Responses"
                description="You can create custom text and slash commands using
                                    the embed builder and variables, both are optional!<br><br>
                                    Go to Resources at the top for links to the embed builder and placeholders!"
        >
            <div class="h-[29rem] bg-rose-700 w-full text-center">Image 4</div>
        </Interactable>
        <Interactable
                slot="element-5"
                title="Customizable"
                description="After spending hours on end making sure this works properly,
                                    you can customize many, many aspects of the bot to your liking!
                                    It's overkill sometimes honestly."
        >
            <div class="h-[37rem] bg-rose-900 w-full text-center">Image 5</div>
        </Interactable>
        <Interactable
                slot="element-6"
                title="... And much more!"
                description="With a little over 20 modules, and me coming up with the most niche shit to add, you definitely wont get bored! (I hope)"
        />
    </FluidContainer>
</section>