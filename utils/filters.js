// Eleventy Version 3.0 with node.js >18
const nunjucks = require("nunjucks");

const { DateTime } = require("luxon");

// Helper: stable stringify with sorted keys
function stableStringify(obj) {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }

  // Sort keys for consistent ordering
  const keys = Object.keys(obj).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k]))
      .join(",") +
    "}"
  );
}

module.exports = {
  readableDate: function (date, format, locale = "fr") {
    // default to Europe/Vienna Timezone
    const dt = DateTime.fromJSDate(date, { zone: "UTC+2" });
    if (!format) {
      format = dt.hour + dt.minute > 0 ? "dd LLL yyyy - HH:mm" : "dd LLL yyyy";
    }
    return dt.toFormat(format, { locale: locale });
  },

  /**
   * Retourne la première lettre normalisée d’un libellé
   * - enlève accents (É → E, Ç → C, …)
   * - enlève crochets ou ponctuations au début
   * - renvoie la lettre en majuscule
   */
  firstLetter: function (label) {
    if (!label) return "";
    let normalized = label.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // retire accents
    normalized = normalized.replace(/^\W+/, ""); // enlève crochets, ponctuation au début
    return normalized.charAt(0).toUpperCase();
  },

  /**
   * Extracts the label
   */
  extractLabel: function (labelObj) {
    if (!labelObj) return "";
    if (labelObj["@value"]) return labelObj["@value"];
    return "";
  },

  // Ajouter cette fonction dans votre fichier filters.js
  langFromUrl: function (url) {
    // Détecte la langue à partir de l'URL (/pages/fr/ ou /pages/en/)
    if (url.includes("/fr/")) {
      return "fr";
    } else if (url.includes("/en/")) {
      return "en";
    } else {
      return "fr"; // Langue par défaut
    }
  },

  dateToFormat: function (date, format) {
    return DateTime.fromJSDate(date, { zone: "utc" }).toFormat(String(format));
  },

  dateToISO: function (date) {
    return DateTime.fromJSDate(date, { zone: "utc" }).toISO({
      includeOffset: false,
      suppressMilliseconds: true,
    });
  },

  /**
   * Create a DateTime from an ISO 8601 string
   * DateTime.fromISO('2016-05-25T09:08:34.123')
   **/
  dateFromISO: function (timestamp) {
    return DateTime.fromISO(timestamp, { zone: "utc" }).toJSDate();
  },

  xsdDateToLocale: function(xsdDate, locale) {
    return DateTime.fromISO(xsdDate, { zone: "utc" }).toJSDate().toLocaleDateString(locale?locale:"en");
  },

  iso8601: function (dateObj) {
    return dateObj.toISOString();
  },

  // Return the localName of the prefixed URI in parameter
  localName: function (uri) {
    if (uri.includes("#")) {
      return uri.split("#")[1];
    } else if (uri.includes("/")) {
      return uri.substring(uri.lastIndexOf("/") + 1);
    } else if (uri.includes(":")) {
      return uri.split(":")[1];
    }

    return uri;
  },

  /**
   * Returns the first element in the array (or single item) having @language
   * equal to the provided language code,
   * or the first item if none matches the language code
   **/
  lang: function (arr, locale) {
    if (arr) {
      // filter for language
      if (Array.isArray(arr)) {
        for (let index = 0; index < arr.length; index++) {
          const element = arr[index];
          if (element["@language"] === locale) {
            return element["@value"];
          }
        }
        return "";
      } else {
        if (arr["@language"] === locale) {
          return arr["@value"];
        } else {
          return "";
        }
      }
    } else {
      return "";
    }
  },

  getMaxDate: function (dateArray) {
    const arrDates = [];
    dateArray.forEach((eDate) => {
      const newDate = new Date(eDate);
      arrDates.push(newDate);
    });
    // get Max date
    const dateOutput = new Date(Math.max(...arrDates.map(Date.parse)));
    return dateOutput.toLocaleDateString();
  },

  /**
   * https://stackoverflow.com/questions/46426306/how-to-safely-render-json-into-an-inline-script-using-nunjucks
   * Returns a JSON stringified version of the value, safe for inclusion in an
   * inline <script> tag. The optional argument 'spaces' can be used for
   * pretty-printing.
   *
   * Output is NOT safe for inclusion in HTML! If that's what you need, use the
   * built-in 'dump' filter instead.
   */
  json: function (value) {
    if (value instanceof nunjucks.runtime.SafeString) {
      value = value.toString();
    }
    const spaces = null;
    //const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c')
    const jsonString = JSON.stringify(value);
    return new nunjucks.runtime.markSafe(jsonString);
  },

  // filters
  // allows to make an absolute URL relative. Use it like this :
  // {{ '/assets/old-website/uploads/2014/09/illustration.jpg' | relative(page) }}
  relative: function (absoluteUrl, page) {
    if (absoluteUrl.includes("://")) {
      // full URI, return it directly
      return absoluteUrl;
    }
    // if (!absoluteUrl.startsWith('/')) {
    //  throw new Error('URL is already relative : '+absoluteUrl)
    // }
    try {
      var relativeUrl = require("path").relative(page.url, absoluteUrl);
      const URLRelative = relativeUrl.replace(new RegExp(/\\/g), "/");
      return URLRelative;
    } catch (error) {
      return absoluteUrl;
    }
  },

  /**
   * Returns unique values of a property from an array of objects having this property
   **/
  unique: function (array, property) {
    const seen = new Set();
    const result = [];

    for (const item of array) {
      const value = item[property];
      // exclude undefined value
      if (value) {
        const key = stableStringify(value); // serialize object
        if (!seen.has(key)) {
          seen.add(key);
          result.push(value);
        }
      }
    }
    return result;
  },

  /**
   *
   * @param {*} array
   * @param {*} property
   * @param {*} id
   * @returns the items in the array where the provided property has the provided id or @id
   */
  findWithPropertyId: function (array, property, id) {
    return array.filter(
      (item) =>
        item[property] &&
        (item[property]["id"] == id || item[property]["@id"] == id)
    );
  },

  /**
   *
   * @param {*} array
   * @param {*} property
   * @returns the items in the array not having the provided property
   */
  findWithoutProperty: function (array, property) {
    return array.filter((item) => item[property] == undefined);
  },

  jsonSort: function (jsonContent, key) {
    const newJsonCode = jsonContent.sort((a, b) => {
      if (a[key]) {
        let aValue =
          Array.isArray(a[key]) && a[key].length > 0 ? a[key][0] : a[key];

        if (b[key]) {
          let bValue =
            Array.isArray(b[key]) && b[key].length > 0 ? b[key][0] : b[key];
          const aValueString = JSON.stringify(aValue);
          const bValueString = JSON.stringify(bValue);
          return aValueString.localeCompare(bValueString);
        } else {
          return -1;
        }
      } else {
        if (b[key]) {
          return 1;
        } else {
          // default to id
          if (a.id) {
            if (b.id) {
              return a.id.localeCompare(b.id);
            } else {
              return -1;
            }
          } else {
            if (b.id) {
              return 1;
            } else {
              // default to string comparison
              const aValue = JSON.stringify(a);
              const bValue = JSON.stringify(b);
              return aValue.localeCompare(bValue);
            }
          }
        }
      }
    });

    return newJsonCode;
  },

  hasBroader: function (conceptArray) {
    const containsBroader = conceptArray.find((e) => e.broader);
    return containsBroader;
  },
};
