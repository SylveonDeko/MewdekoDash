// @ts-ignore
import typography from "@tailwindcss/typography";
import {Config} from "tailwindcss";

// noinspection JSUnusedGlobalSymbols
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            screens: {
                "xs": "330px"
            },
            colors: {
                "mewd-transparent": "rgba(255, 255, 255, 0.55)",
                "mewd-light-transparent": "rgba(255, 255, 255, 0.1)",
                "mewd-white": "#ffffff",
                "mewd-offwhite": "#b0bdd3",
                "mewd-dark-grey": "#27262e",
                "mewd-light-grey": "#2d2c38",
                "mewd-yellow": "#938018",
                "mewd-dark-yellow": "#6b5e14",
                "mewd-green": "#19f5aa"

            },
        },
    },
    safelist: [
        "xl:w-1/2", "xl:w-1/3", "xl:w-1/4", "xl:w-1/5",
        "lg:w-1/2", "lg:w-1/3", "lg:w-1/4",
        "md:w-1/2", "md:w-1/3",
        "sm:w-1/2",
    ],
    plugins: [
        typography,
    ],
} satisfies Config