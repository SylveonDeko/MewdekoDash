<!-- routes/staff/+page.svelte -->
<script>
  import Profile from "$lib/Profile.svelte";
  import FluidContainer from "$lib/util/FluidContainer.svelte";
</script>

<head>
  <meta
    content="Mewdeko - The people that make the bot possible."
    property="og:title"
  />
  <meta content="The people that make this bot possible." name="description" />
  <meta
    content="The people that make this bot possible."
    property="og:description"
  />
  <meta
    content="The people that make this bot possible."
    name="twitter:description"
  />
</head>
<section
  class="min-h-[calc(100vh-5.6rem)] flex justify-center bg-mewd-light-grey"
  title="mewdekos staff members"
>
  <div class="pt-32 pb-12 lg:mx-14 max-w-[45rem] lg:max-w-[82rem] px-3">
    <div class="mb-16 px-2">
      <p class=" h-min mb-2 text-center font-extrabold text-mewd-green">
        Our Staff
      </p>
      <h2
        class="h-min mb-2 text-center font-black text-mewd-white text-[26px] md:text-[30px] lg:text-[32px]"
      >
        Major People
      </h2>
      <p class="h-min text-center font-medium text-mewd-offwhite text-md">
        The team of Mewdeko, strong I would say.
      </p>
    </div>
    <FluidContainer>
      <Profile
        slot="element-1"
        profileData={{
          alt: "Owner/Developer",
          image: "https://cdn.mewdeko.tech/sylveon.gif",
          name: "SylveonDeko",
          description: "Owner/Developer",
          eggy: "LEEEEROY JEEEENKINS",
        }}
      />
      <Profile
        slot="element-2"
        profileData={{
          alt: "Owner/Developer",
          image: "https://cdn.mewdeko.tech/Cottage.png",
          name: "GraveyardDwellingCat",
          description: "Owner/Developer",
          eggy: "Head of evil science/Catgirl shenanigans",
        }}
      />
      <Profile
        slot="element-3"
        profileData={{
          alt: "Owner/Developer",
          image: "https://cdn.mewdeko.tech/Paw.gif",
          name: "Paw",
          description: "Owner/Major Supporter",
          eggy: "Placeholder",
        }}
      />
    </FluidContainer>
  </div>
</section>
