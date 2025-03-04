// internationalization
const i18n = require("eleventy-plugin-i18n");

// Traductions
const translations = require("./src/_data/translations.js");

const filters = require('./utils/filters.js')
const jsonldFilters = require('./utils/jsonld.js')

module.exports = async function (config) {
  const { EleventyI18nPlugin } = await import("@11ty/eleventy");

  config.setNunjucksEnvironmentOptions({
    throwOnUndefined: true,
    autoescape: false, // warning: don’t do this!
  });

  // ************** plugins **************************
  
  // internationalization
  config.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "fr", // Required
    errorMode: "allow-fallback", // Opting out of "strict"
  });

  // translation
  config.addPlugin(i18n, {
    translations,
    fallbackLocales: {
      fr: "fr",
    },
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

  // pass-through
  config.addPassthroughCopy({ static: "/" });

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
  };
};


