<script>
    import FluidContainer from "$lib/util/FluidContainer.svelte";
    import InteractableElement from "$lib/util/InteractableElement.svelte";
    import Carousel from "$lib/util/Carousel.svelte";
</script>

<head>
    <meta content="Mewdeko - Other people that helped along the way." property="og:title">
    <meta content="Other people that helped along the way."
          name="description">
    <meta content="Other people that helped along the way."
          property="og:description">
    <meta content="Other people that helped along the way."
          name="twitter:description">
</head>

<section class="min-h-screen flex justify-center bg-mewd-dark-grey" title="Mewdeko's Partners!">
    <div class="pt-32 pb-12 lg:mx-14 max-w-[45rem] lg:max-w-[82rem] px-3">
        <FluidContainer>
            <InteractableElement
                    cta="{{text:'Invite DittoBOT',href:'https://discordapp.com/api/oauth2/authorize?client_id=1000125868938633297&permissions=387136&scope=bot+applications.commands' }}"
                    description="The most in depth and fully featured Pokemon themed discord bot! 6v6 PvP dueling, Nearly ALL abilities/moves/ and secondary's are working!"
                    slot="element-1"
                    title="DittoBOT">
                <Carousel
                        images="{[
                    {
                        title: 'Duels!',
                        src: 'img/img_1.png'
                    },
                    {
                        title: 'More Duels!',
                        src: 'img/img_3.png'
                    },
                    {
                        title: 'Breeding!',
                        src: 'img/img_2.png'
                    }
                ]}"></Carousel>
            </InteractableElement>
            <InteractableElement
                    cta="{{text:'Join The Server!',href:'https://discord.gg/AGzkRSYWb8' }}"
                    description="Created by the person who helped make this site (Enormous props to him, helped me learn a lot about tailwind and svelte), NotABot is a way to redefine how a bot works, using installable modules!"
                    slot="element-2"
                    title="NotABot">
                <img src="img/f0904d25b340c6ac4ac94c6d16fc2be7.webp" alt="NotABot logo">
            </InteractableElement>
            <InteractableElement
                    cta="{{text:'Join Island Getaway!',href:'https://discord.gg/animalcrossing' }}"
                    description="A Server that is Karuta Featured, Wholesome (Except for the karuta side), and has caring staff! The owner of the server helps keep mewdeko alive and is our biggest partner/sponsor!"
                    slot="element-3"
                    title="Island Getaway">
                <Carousel
                        images="{[
                    {
                        title: 'Cat!',
                        src: 'img/img_4.png'
                    },
                    {
                        title: 'Giveaways!',
                        src: 'img/img_5.png'
                    },
                    {
                        title: 'Karuta!',
                        src: 'img/img_6.png'
                    },
                    {
                        title: 'Karuta Giveaways!',
                        src: 'img/img_7.png'
                    }
                ]}"></Carousel>
            </InteractableElement>
        </FluidContainer>
    </div>
</section>