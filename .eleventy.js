// internationalization
const i18n = require("eleventy-plugin-i18n");

const filters = require('./utils/filters.js')
const jsonldFilters = require('./utils/jsonld.js')
const shapesFilters = require('./utils/shapes.js')

module.exports = async function (config) {
  const { EleventyI18nPlugin } = await import("@11ty/eleventy");

  config.setNunjucksEnvironmentOptions({
    throwOnUndefined: true,
    autoescape: false, // warning: don’t do this!
  });

  // ***************** Filters ***********************

  // filters
  // all imported filters from utils/filters.js
  Object.keys(filters).forEach((filterName) => {
      config.addFilter(filterName, filters[filterName])
  });
  Object.keys(jsonldFilters).forEach((filterName) => {
    config.addFilter(filterName, jsonldFilters[filterName])
  });
  Object.keys(shapesFilters).forEach((filterName) => {
    config.addFilter(filterName, shapesFilters[filterName])
  });

  // pass-through
  config.addPassthroughCopy({ static: "/" });

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist",
      layouts: "_layouts",
      data: "_data"
    },
  };
};