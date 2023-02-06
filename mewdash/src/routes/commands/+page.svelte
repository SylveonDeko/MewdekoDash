<script lang="ts">
    import modules from "./modules.json"
</script>
<ul>
    {#each modules as module}
        <li>{module.Name}
            <ul>
                {#each modules.Commands as command}
                    <li>{command.CommandName}</li>
                {/each}
            </ul>
        </li>
    {/each}
</ul>