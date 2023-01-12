<script lang="ts">
    import "../../app.css";
    import Navbar from "$lib/nav/Navbar.svelte";

    const navbarItems: { title: string, href: string }[] = [
        {href: "/tailwind", title: "Home"},
        {href: "/contacts", title: "Contact Us"},
        {href: "/staff", title: "Staff"},
        {href: "/resources", title: "Resources"}
    ]
</script>
<Navbar items="{navbarItems}"/>
<slot/>