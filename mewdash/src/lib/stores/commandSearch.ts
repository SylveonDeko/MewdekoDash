import {writable} from "svelte/store";
import type {Module} from "$lib/types/mewdekoModules";

export const createSearchStore = (data: Module[]) => {
    const {subscribe, set, update} = writable({
        data: data,
        filtered: data,
        search: ""
    });
    return {subscribe, set, update};
}

export const searchHandler = (store: { search: string; filtered: Module[]; data: Module[]; }) => {
    const searchTerms = store.search.toLowerCase()
        .split(" ")
        .filter((term) => term) || [];

    store.filtered = store.data.map((module) => (
        {
            Name: module.Name,
            Commands: module.Commands.filter((command) =>
                searchTerms.every(item =>
                    command.CommandName.toLowerCase().includes(item) ||
                    command.Description.toLowerCase().includes(item)||
                    module.Name.toLowerCase().includes(item)
                )
            )
        } as Module
    )).filter((module) =>
        module.Commands.length > 0
    )
}