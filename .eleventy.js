// Eleventy Version 3.0 with node.js >18

const nunjucks = require("nunjucks");
// internationalization
const i18n = require("eleventy-plugin-i18n");
//
//const translations = require("./src/_data/i18n");
const translations = require("./src/_data/translations");

module.exports = async function (eleventyConfig) {
  const { EleventyI18nPlugin } = await import("@11ty/eleventy");

  eleventyConfig.setNunjucksEnvironmentOptions({
    throwOnUndefined: true,
    autoescape: false, // warning: don’t do this!
  });

  // ************** plugin **************************
  // internationalization
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "fr", // Required
    errorMode: "allow-fallback", // Opting out of "strict"
  });

  // translation
  eleventyConfig.addPlugin(i18n, {
    translations,
    fallbackLocales: {
      fr: "fr",
    },
  });

  // ***************** Filter ***********************
  // Return the ID
  eleventyConfig.addFilter("notation", async function (concept) {
    return concept.split(":")[1];
  });

  // label
  eleventyConfig.addFilter("label", function (arr, locale) {
    if (arr) {
      var jsonFilter = [arr].find((f) => f["@language"] === locale);
      if (jsonFilter === undefined) {
        result = "";
        for (let index = 0; index < arr.length; index++) {
          const element = arr[index];
          if (element["@language"] === locale) {
            result = element["@value"];
          }
        }
        const output_Label = result === "" ? arr["@value"][0] : result;
        return output_Label;
      } else {
        return jsonFilter["@value"];
      }
    }
  });

  // URL
  eleventyConfig.addFilter("getURL", async function (inputContext, concept) {
    
    const inputPrefix = concept.split(":")[0];
    const inputConcept = concept.split(":")[1];

    const obj = JSON.parse(inputContext);
    const uriFound = JSON.stringify(obj, [inputPrefix]);
    const objOutput = JSON.parse(uriFound);
    return objOutput[inputPrefix] + inputConcept;
  });

  /**
   * https://stackoverflow.com/questions/46426306/how-to-safely-render-json-into-an-inline-script-using-nunjucks
   * Returns a JSON stringified version of the value, safe for inclusion in an
   * inline <script> tag. The optional argument 'spaces' can be used for
   * pretty-printing.
   *
   * Output is NOT safe for inclusion in HTML! If that's what you need, use the
   * built-in 'dump' filter instead.
   */
  eleventyConfig.addFilter("json", function (value) {
    if (value instanceof nunjucks.runtime.SafeString) {
      value = value.toString();
    }
    const spaces = null;
    //const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c')
    const jsonString = JSON.stringify(value);
    return new nunjucks.runtime.markSafe(jsonString);
  });

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
