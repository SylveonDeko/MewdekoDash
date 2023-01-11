<script lang="ts">
    import Navbar from "$lib/nav/Navbar.svelte";
    import FluidContainer from "$lib/util/FluidContainer.svelte";

    const navbarItems: { title: string, href: string }[] = [
        {href: "/tailwind", title: "Home"},
        {href: "/contacts", title: "Contact Us"},
        {href: "/staff", title: "Staff"},
        {href: "/resources", title: "Resources"}
    ]
</script>
<Navbar items="{navbarItems}"/>
<header class="p-12  flex justify-center bg-slate-200">
    <h1 class="font-bold text-center text-3xl ">The most free and customizable bot you'll&nbsp;find. Open Source too.
    </h1>
</header>
<section class="bg-gray-900">
    <div class="pt-12 px-3">
        <h2 class="p-9 font-bold text-center text-2xl  text-white">Here's what Mewdeko can do for you</h2>
    </div>

    <FluidContainer>
        <div class="w-64 h-96 bg-red-100 text-center" slot="element-1">Element 1</div>
        <div class="w-64 h-96 bg-red-200  text-center" slot="element-2">Element 2</div>
        <div class="w-64 h-96 bg-red-300  text-center" slot="element-3">Element 3</div>
        <div class="w-64 h-96 bg-red-400  text-center" slot="element-4">Element 4</div>
        <div class="w-64 h-96 bg-red-500  text-center" slot="element-5">Element 5</div>
    </FluidContainer>
</section>