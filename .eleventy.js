//npm install jsonld
const jsonld = require("jsonld");
// npm install rdf-parse
const rdfParser = require("rdf-parse").default;
// npm install rdf-serialize
const rdfSerializer = require("rdf-serialize").default;
// npm install @11ty/eleventy-fetch
const { AssetCache } = require("@11ty/eleventy-fetch");
const nunjucks = require('nunjucks');
const EleventyBaseError = require("@11ty/eleventy/src/EleventyBaseError");

/* Internationalization i18n : Jorge */
const { EleventyI18nPlugin } = require("@11ty/eleventy");
const i18n = require('eleventy-plugin-i18n');
const translations = require('./src/_data/i18n');

AssetCache.concurrency = 4;

module.exports = function (eleventyConfig) {

  eleventyConfig.setNunjucksEnvironmentOptions({
		throwOnUndefined: true,
		autoescape: false, // warning: don’t do this!
	});

  // Return the ID
  eleventyConfig.addFilter("notation", async function (concept) {
    return concept.split(":")[1];
  });

  eleventyConfig.addFilter("getId", async function (dataset,concept) {

    const data = [dataset]
    var result = data.find(x => x.id === concept)
    const jsonResult = result["skos:inScheme"]
    const reponse = jsonResult.split(":")[1]
    
    return reponse
  });

  eleventyConfig.addFilter("getURL", async function (inputContext,concept) {

    const inputPrefix = concept.split(":")[0];
    const inputConcept = concept.split(":")[1];

    const obj = JSON.parse(inputContext)
    const uriFound = JSON.stringify(obj, [inputPrefix])
    const objOutput = JSON.parse(uriFound)
    return objOutput[inputPrefix]+inputConcept    
  });

  //
  eleventyConfig.addFilter("relative",
        (absoluteUrl, page) => {
          if (!absoluteUrl.startsWith('/')) {
            throw new Error('URL is already relative')
          }
          const relativeUrl = require("path").relative(page.url, absoluteUrl);
          return relativeUrl;
        }
  );

  eleventyConfig.addFilter('Label', function(arr,locale) {
    result = "";
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];      
      if (element['@language'] === locale){
        result = element['@value']
      }
    };
    
    const output_Label = (result === "") ? arr['@value'][0] : result;
    
    return output_Label;
  });

  eleventyConfig.addFilter('jsonSort', function (jsonData) {
    return jsonData.sort(compareByNotation)
  });

  function compareByNotation(a, b) {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  }

  /**
   * https://stackoverflow.com/questions/46426306/how-to-safely-render-json-into-an-inline-script-using-nunjucks
   * Returns a JSON stringified version of the value, safe for inclusion in an
   * inline <script> tag. The optional argument 'spaces' can be used for
   * pretty-printing.
   *
   * Output is NOT safe for inclusion in HTML! If that's what you need, use the
   * built-in 'dump' filter instead.
   */
  eleventyConfig.addFilter('json', function (value) {
    if (value instanceof nunjucks.runtime.SafeString) {
      value = value.toString()
    }
    const spaces = null;
    //const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c')
    const jsonString = JSON.stringify(value);
    return new nunjucks.runtime.markSafe(jsonString)
  });

  eleventyConfig.addFilter('splitNameSpace', function (value) {
    return value.split(':')[1]
  });

  eleventyConfig.addFilter('splitGetTypeConcept', function (value) {
    if (value.includes('/')){
      return value.split('/')[1]
    }
  });
  
  // internationalization 
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: 'fr', // Required
    errorMode: 'allow-fallback' // Opting out of "strict"
  });
  // translation
  eleventyConfig.addPlugin(i18n, {
    translations,
    fallbackLocales: {
      'fr': 'en'
    }
  });

  
  // pass-through
  eleventyConfig.addPassthroughCopy({ "static": "/" });
  
  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
        input: "src",
        output: "dist",
        includes: "_includes",
        layouts: "_layouts",
        data: "_data"
    },
  };
};
