import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import tailwindConfig from './tailwind.config.js'

// noinspection JSUnusedGlobalSymbols
export default {
    plugins: [tailwind(tailwindConfig), autoprefixer]
}
