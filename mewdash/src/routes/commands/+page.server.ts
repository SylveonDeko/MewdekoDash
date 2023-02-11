import type {PageServerLoad} from "./$types";
import {compile} from "mdsvex";
import type {Module} from "$lib/types/mewdekoModules";

import json from "./modules.json"

export const load: PageServerLoad = async (): Promise<{ modules: Module[] }> => {
    let modules: Module[] = json
    modules.sort((a, b) => a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0)
    modules.forEach(module => {
        module.Commands.sort((a, b) => a.CommandName < b.CommandName ? -1 : a.CommandName > b.CommandName ? 1 : 0)
        module.Commands.forEach(async (command) => {
            command.HtmlDescription = await compile(command.Description.trim()).then((result) => result?.code ?? "")
        })
    })

    return {modules}
};