<script>
    import Profile from "$lib/Profile.svelte";
    import FluidContainer from "$lib/util/FluidContainer.svelte";
</script>
<head>
    <meta content="Mewdeko - The people that make the bot possible." property="og:title">
    <meta content="The people that make this bot possible."
          name="description">
    <meta content="The people that make this bot possible."
          property="og:description">
    <meta content="The people that make this bot possible."
          name="twitter:description">
</head>
<section class="min-h-[calc(100vh-5.6rem)] flex justify-center bg-mewd-light-grey" title="mewdekos staff members">
    <div class="pt-32 pb-12 lg:mx-14 max-w-[45rem] lg:max-w-[82rem] px-3">
        <div class="mb-16 px-2">
            <p class=" h-min mb-2 text-center font-extrabold text-mewd-green">
                Our Staff
            </p>
            <h2 class="h-min mb-2 text-center font-black text-mewd-white text-[26px] md:text-[30px] lg:text-[32px]">
                Major People
            </h2>
            <p class="h-min text-center font-medium text-mewd-offwhite text-md ">
                The team of Mewdeko, strong I would say.
            </p>
        </div>
        <FluidContainer>
            <Profile slot="element-1"
                     profileData='{{alt: "Owner/Developer", image: "https://cdn.discordapp.com/avatars/280835732728184843/a_7c7edfc05cfa28c83706a7c53da77d0a.gif", name: "SylveonDeko", description: "Owner/Developer"}}'/>
            <Profile slot="element-2"
                     profileData='{{alt: "Owner/Developer", image: "https://theowlshed.cottagedwelling.dev/f9e1dfc9a3a8db57fdd872631a493512.png", name: "GraveyardDwellingCat", description: "Owner/Developer", eggy: "Head of evil science/Catgirl shenanigans"}}'/>
            <Profile slot="element-3"
                     profileData='{{alt: "Owner/Developer", image: "https://cdn.discordapp.com/avatars/436201394543001600/a_413cad5a6215188495d259ac8742b575.gif", name: "Paw", description: "Owner/Major Supporter"}}'/>
        </FluidContainer>
    </div>

</section>
