<script lang="ts">
    import MailIcon from "$lib/icon/Mail.svelte"
    import DiscordIcon from "$lib/icon/Discord.svelte"
    import ItemLink from "$lib/ItemLink.svelte"
</script>

<div class="min-h-[calc(100vh-5.6rem)] w-full bg-mewd-light-grey flex flex-col justify-center" style="color:white">
    <h2 class="fw-bold text-3xl pb-6 text-center">How you can reach us</h2>
    <ItemLink link="{{href:'mailto:sylveon@mewdeko.tech', text:'sylveon@mewdeko.tech'}}">
        <MailIcon/>
    </ItemLink>
    <ItemLink link="{{href:'mailto:cottage@mewdeko.tech', text:'cottage@mewdeko.tech (GraveyardDwellingCat)'}}">
        <MailIcon/>
    </ItemLink>
    <ItemLink link="{{href:'https://discord.gg/mewdeko', text:'Discord Server'}}">
        <DiscordIcon/>
    </ItemLink>

</div>