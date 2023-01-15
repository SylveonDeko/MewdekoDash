import {readable} from "svelte/store";

export default readable(false, (set) => {
    //Getting the query
    const query = "(prefers-reduced-motion: no-preference)";
    const mediaQueryList = typeof window !== "undefined" ? window.matchMedia(query) : null;

    //If no media query list could be obtained, we're not on a browser that supports it -> default value
    if (!mediaQueryList) {
        return () => {
        };
    }

    //When the media query changes, update the store
    const onChange = (event: MediaQueryListEvent | null) => set(!event ? !mediaQueryList.matches : !event.matches);

    //Add an eventlister to the media query list and call it once to set the initial value
    mediaQueryList.addEventListener("change", onChange);
    onChange(null);

    //Unmount the event listener once the store is no longer used
    return () => {
        mediaQueryList.removeEventListener("change", onChange);
    }
});