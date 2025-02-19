// Eleventy Version 3.0 with node.js >18
const nunjucks = require("nunjucks");

// internationalization
const i18n = require("eleventy-plugin-i18n");

// Traductions
const translations = require("./src/_data/translations.js");
//console.log(translations);

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

  // Return the localName of the prefixed URI in parameter
  eleventyConfig.addFilter("localName", async function (uri) {
    const splitURL = uri.substring(uri.lastIndexOf("/") + 1);
    if (splitURL === undefined) {
      splitURL = uri.split(":")[1];
    }
    return splitURL;
  });

  /**
   * Returns the first element in the array (or single item) having @language
   * equal to the provided language code,
   * or the first item if none matches the language code
   **/
  eleventyConfig.addFilter("lang", function (arr, locale) {
    if (arr) {
      // filter for language
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

    return objOutput[inputPrefix] != undefined
      ? objOutput[inputPrefix] + inputConcept
      : concept;
  });

  eleventyConfig.addFilter("dateModified", async function (dateModified) {
    const arrDates = [];
    dateModified.forEach((eDate) => {
      const newDate = new Date(eDate);
      arrDates.push(newDate);
    });
    // get Max date
    const dateOutput = new Date(Math.max(...arrDates.map(Date.parse)));
    return dateOutput.toLocaleDateString();
  });

  eleventyConfig.addFilter("timeline", function (jsonChangeNote, locale) {
    const tData = [];
    let JsonObj = JSON.stringify(jsonChangeNote);
    JsonObj = JSON.parse(JsonObj);
    for (let index = 0; index < JsonObj.length; index++) {
      const element = JsonObj[index];

      let dateNote = element["dc:date"];
      if (!isValidateDateFormate(element["dc:date"])) {
        if (isValidateYear(element["dc:date"])) {
          dateNote = new Date(element["dc:date"], "01", "01");
        }
      } else {
        dateNote = new Date(dateNote);
      }

      if (element["rdf:value"]["@language"] === locale) {
        const t = {
          dateOper: dateNote,
          date: element["dc:date"],
          description: element["rdf:value"]["@value"],
        };
        tData.push(t);
      }
    }

    if (tData.length > 1) {
      let jsonObj = JSON.stringify(tData);
      jsonObj = JSON.parse(jsonObj);
      const newJsonCode = jsonObj.sort((a, b) => {
        const aValue = a.dateOper;
        const bValue = b.dateOper;
        if (aValue < bValue) {
          return -1;
        }
        if (aValue > bValue) {
          return 1;
        }
        return 0;
      });
      return newJsonCode;
    } else {
      return tData;
    }
  });

  eleventyConfig.addFilter("traduction", function (label, labelTraduction) {
    if (labelTraduction) {
      return labelTraduction;
    } else {
      return label;
    }
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

  /*
  eleventyConfig.addFilter("sortJson",function(jsonSection, locale,element) {

    //
    const ObjOutput = new Object();
    const map1 = new Map();
    for (let index = 0; index < jsonSection.length; index++) {
      const e = jsonSection[index];
      const key = e.id;
      e[element].forEach(l => {
        if (l["@language"] === locale) {
          map1.set(key, l["@value"]);
        }
      })
    }
    // sort
    const mapSort = new Map([...map1.entries()].sort((a, b) => a[1] - b[1]));
    // convert to object output
    return Object.fromEntries(mapSort);

  });
  */

  eleventyConfig.addFilter("jsonSort", function (jsonContent, element) {
    const newJsonCode = jsonContent.sort((a, b) => {
      const aValue = JSON.stringify(Object.values(a[element][0]).sort());
      const bValue = JSON.stringify(Object.values(b[element][0]).sort());
      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }
      return 0;
    });

    return newJsonCode;
  });

  eleventyConfig.addFilter("flagPrint", function (jsonData) {
    const containsBroader = jsonData.find((e) => e.broader);
    const numberOfConcepts = jsonData.length;
    return containsBroader && (numberOfConcepts < 1000);
  });

  // skos:exactMatch
  /*
  eleventyConfig.addShortcode("getexactMatch", async function (jsonData) {
    var outputTag = "";
    if (jsonData.length > 0) {
      var obj = JSON.parse(jsonData);
      var tag = "";
      // if json data is a String
      if (typeof obj === "string") {
        tag += `<li>${obj}</li>`;
      } else {
        // if json data is an object
        var nCountSource = obj.length;
        if (nCountSource > 0) {
          for (const s of obj) {
            if (typeof s === "string") {
              tag += `<li>${s}</li>`;
            } else {
              nCountData = s.length;
              if (nCountData > 0) {
                for (let index = 0; index < s.length; index++) {
                  const element = s[index];
                  tag += `<li><a href="${element.id}">${element.id}</a></li>`;
                }
              } else {
                tag += `<li><a href="${s.id}">${s.id}</a></li>`;
              }
            }
          }
        } else {
          tag += `<li><a href="${obj.id}">${obj.id}</a></li>`;
        }
      }

      outputTag = `<div class="row">
        <div class="col-1">
          <h6>Alignments</h6>
        </div>
        <div class="col">  
          <ul>  
          ${tag}
          </ul>
        </div>
      </div>`;
    }

    return outputTag;
  });

  */

  // pass-through
  eleventyConfig.addPassthroughCopy({ static: "/" });

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


function isValidateDateFormate(dateString) {
  let regex = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regex) !== null;
}

function isValidateYear(yearString) {
  let regex = /^\d{4}-\d{2}-\d{2}$/;
  return yearString.match(regex) !== null;
}