const path = require("path");
const tsconfigPaths = require("vite-tsconfig-paths").default;

module.exports = {
  "stories": ["../src/**/*.stories.mdx", "../src/**/*stories.@(js|jsx|ts|tsx)"],
  "addons": ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions", "storybook-css-modules-preset"],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-vite"
  },
  async viteFinal(config) {
    config.plugins.push(
      /** @see https://github.com/aleclarson/vite-tsconfig-paths */
      tsconfigPaths({
        // My tsconfig.json isn't simply in viteConfig.root,
        // so I've passed an explicit path to it:
        projects: [path.resolve(path.dirname(__dirname), "tsconfig.json")],
      })
    );
    return {
      ...config,
      define: {
        ...config.define,
        global: "window",
      },
      esbuild: {
        ...config.esbuild,
      },
      features: {
        interactionsDebugger: true,
      },
    };
  },
};