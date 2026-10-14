const { defineConfig } = require('@mcit-vendor/seo-cli');

module.exports = defineConfig({
  entry: ['./docs/**/*.mdx'],
  modelName: 'gpt-4o-mini',
  experimental: {
    jsonMode: true,
  },
});
