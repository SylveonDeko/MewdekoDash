import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import { resolve } from "path";
import { glob } from "glob";

const baseUrl = "https://mewdeko.tech";

async function generateSitemap() {
  const pages = glob.sync("src/routes/**/*.svelte").map((file) => {
    const path = file
      .replace("src/routes", "")
      .replace(".svelte", "")
      .replace(/\/index$/, "");
    return path === "" ? "/" : path;
  });

  const sitemapStream = new SitemapStream({ hostname: baseUrl });
  const writeStream = createWriteStream(resolve("./static/sitemap.xml"));
  sitemapStream.pipe(writeStream);

  pages.forEach((page) => {
    sitemapStream.write({ url: page, changefreq: "weekly", priority: 0.8 });
  });

  sitemapStream.end();
  await streamToPromise(sitemapStream);
  console.log("Sitemap generated successfully!");
}

generateSitemap().catch(console.error);
