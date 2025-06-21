<!-- routes/partners+page.svelte -->
<script>
  import FluidContainer from "$lib/components/FluidContainer.svelte";
  import InteractableElement from "$lib/components/InteractableElement.svelte";
  import Carousel from "$lib/components/Carousel.svelte";
</script>

<head>
  <meta
    content="Mewdeko - Other people that helped along the way."
    property="og:title"
  />
  <meta content="Other people that helped along the way." name="description" />
  <meta
    content="Other people that helped along the way."
    property="og:description"
  />
  <meta
    content="Other people that helped along the way."
    name="twitter:description"
  />
</head>

<section
  class="min-h-screen flex justify-center bg-mewd-dark-grey"
  title="Mewdeko's Partners!"
>
  <div class="pt-32 pb-12 lg:mx-14 max-w-[45rem] lg:max-w-[82rem] px-3">
    <FluidContainer>
      <InteractableElement
        cta={{
          text: "Invite DittoBOT",
          href: "https://discordapp.com/api/oauth2/authorize?client_id=1000125868938633297&permissions=387136&scope=bot+applications.commands",
          target: "_blank",
        }}
        description="The most in depth and fully featured Pokemon themed discord bot! 6v6 PvP dueling, Nearly ALL abilities/moves/ and secondary's are working!"
        slot="element-1"
        title="DittoBOT"
      >
        <Carousel
          items={[
            {
              component: null,
              props: {
                title: "Duels!",
                src: "img/img_1.png",
              }
            },
            {
              component: null,
              props: {
                title: "More Duels!",
                src: "img/img_3.png",
              }
            },
            {
              component: null,
              props: {
                title: "Breeding!",
                src: "img/img_2.png",
              }
            },
          ]}
        ></Carousel>
      </InteractableElement>
    </FluidContainer>
  </div>
</section>
