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

        // Populate the map to ensure uniqueness and maintain order
        module.Commands.forEach(command => {
            commandsMap.set(command.CommandName, command);
        });

        // Convert each unique command's description to HTML
        const uniqueCommands = Array.from(commandsMap.values()).map(command => ({
            ...command,
            HtmlDescription: converter.makeHtml(command.Description.trim())
        }));

        return { ...module, Commands: uniqueCommands };
    });

    return { modules };
};
