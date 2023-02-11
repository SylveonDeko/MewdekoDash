import type {PageServerLoad} from "./$types";
import {compile} from "mdsvex";

const MOCK_MARKDOWN = `
## Lorem

Lorem is currently extended with the following plugins.
Instructions on how to use them in your application are linked below.

| Plugin | README |
| ------ | ------ |
| Dropbox | [plugins/dropbox/README.md](Link) |
| Medium | [plugins/medium/README.md](Link) |
| Google Analytics | [plugins/googleanalytics/README.md](Link) |
`;

export const load: PageServerLoad= async () => {
     // Get data with eg. `fetch`
    return await compile(MOCK_MARKDOWN);
};