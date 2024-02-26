import type {PageServerLoad} from "./$types";
import type {Module} from "$lib/types/mewdekoModules";
import showdown from "showdown";
import json from "./modules.json"

const converter = new showdown.Converter();

export const load: PageServerLoad = async (): Promise<{ modules: Module[] }> => {
    let modules: Module[] = json;
    modules.sort((a, b) => a.Name.localeCompare(b.Name));

    modules = modules.map(module => {
        const commandsMap = new Map();

        // Populate the map to ensure uniqueness
        module.Commands.forEach(command => {
            commandsMap.set(command.CommandName, command);
        });

        // Convert each unique command's description to HTML and sort them alphabetically
        const uniqueAndSortedCommands = Array.from(commandsMap.values())
            .map(command => ({
                ...command,
                HtmlDescription: converter.makeHtml(command.Description.trim())
            }))
            .sort((a, b) => a.CommandName.localeCompare(b.CommandName)); // Sort commands alphabetically

        return { ...module, Commands: uniqueAndSortedCommands };
    });

    return { modules };
};
