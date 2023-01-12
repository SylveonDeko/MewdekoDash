/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                "md-transparent": "rgba(255, 255, 255, 0.55)",
                "md-light-transparent": "rgba(255, 255, 255, 0.25)"
            }
        },
    },
    safelist: [
        "xl:w-1/2", "xl:w-1/3", "xl:w-1/4", "xl:w-1/5", "xl:w-1/6",
        "lg:w-1/2", "lg:w-1/3", "lg:w-1/4", "lg:w-1/5", "lg:w-1/6",
        "md:w-1/2", "md:w-1/3", "md:w-1/4", "md:w-1/5", "md:w-1/6",
        "sm:w-1/2", "sm:w-1/3", "sm:w-1/4", "sm:w-1/5", "sm:w-1/6"
    ],
    plugins: [],
}