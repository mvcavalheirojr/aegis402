import { defineConfig } from "astro/config";

// Published at https://mvcavalheirojr.github.io/aegis402/.
const REPO_NAME = "aegis402";
const SITE = process.env.PAGES_SITE ?? "https://mvcavalheirojr.github.io";

export default defineConfig({
  site: SITE,
  base: `/${REPO_NAME}/`,
  output: "static",
  trailingSlash: "ignore",
});
