export type ProductUpdate = {
  id: string;
  label: string;
  title: string;
  summary: string;
  details: string[];
  href: string;
  action: string;
};

// Keep the newest public update first. The landing page intentionally features one item at a time.
export const productUpdates: ProductUpdate[] = [
  {
    id: "currency-economy",
    label: "New in currency",
    title: "A Real Economy",
    summary: "Currency now has somewhere to go, ways to earn it, and numbers telling you whether any of it is working.",
    details: [
      "Open a shop selling roles, collectibles, or one-off rewards, and give balances a purpose beyond the leaderboard.",
      "Members can work, commit crimes, bank their savings out of reach of robbery, and pay each other.",
      "Tune every payout rate, cooldown and bet limit yourself, then check the analytics to see which games are quietly printing money."
    ],
    href: "/dashboard/currency",
    action: "Open economy settings"
  },
  {
    id: "music-link-conversion",
    label: "New in music",
    title: "Music Link Conversion",
    summary: "Drop an Apple Music, Spotify, or YouTube link and get every other platform back automatically.",
    details: [
      "Works with Apple Music, Spotify, YouTube, YouTube Music, Deezer, Tidal, and more.",
      "Auto-searches Spotify and YouTube Music when a link doesn't already have a match.",
      "Turn it on for any channel, not just the music channel."
    ],
    href: "/dashboard/music",
    action: "Set up music links"
  },
  {
    id: "image-hash-bans",
    label: "New in protection",
    title: "Image Hash Bans",
    summary: "Block known scam images before they spread through your server.",
    details: [
      "Turn on the maintained preset list for common scam images.",
      "Add your own images when a specific scam targets your community.",
      "Choose whether Mewdeko removes the post, warns, mutes, or bans."
    ],
    href: "/dashboard/administration?tab=protection",
    action: "Open protection settings"
  }
];

export const latestProductUpdate = productUpdates[0];
