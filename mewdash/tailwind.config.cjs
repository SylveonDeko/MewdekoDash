/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                "md-transparent": "rgba(255, 255, 255, 0.55)",
                "md-light-transparent": "rgba(255, 255, 255, 0.25)"
            }
        },
    },
    plugins: [],
}
