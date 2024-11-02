// @ts-check
import { defineConfig, envField } from "astro/config";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",

  experimental: {
    env: {
      schema: {
        DEV: envField.string({
          context: "client",
          access: "public",
          optional: true,
          default: undefined,
        }),
        POSTGRES_URL: envField.string({
          context: "server",
          access: "secret",
          optional: false,
        }),
        OPENAI_KEY: envField.string({
          context: "server",
          access: "secret",
          optional: false,
        }),
      },
    },
  },

  adapter: node({
    mode: "standalone",
  }),
});