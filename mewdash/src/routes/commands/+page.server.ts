import type {PageServerLoad} from "./$types";
import type {Module} from "$lib/types/mewdekoModules";
import showdown from "showdown";
import json from "./modules.json"

const converter = new showdown.Converter();

export const load: PageServerLoad = async (): Promise<{ modules: Module[] }> => {
    let modules: Module[] = json
    modules.sort((a, b) => a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0)
    modules.forEach(module => {
        module.Commands.sort((a, b) => a.CommandName < b.CommandName ? -1 : a.CommandName > b.CommandName ? 1 : 0)
        module.Commands.forEach(async (command) => {
            command.HtmlDescription =  converter.makeHtml(command.Description.trim())
        })
    })

    return {modules}
};