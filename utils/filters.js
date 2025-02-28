// Eleventy Version 3.0 with node.js >18
const nunjucks = require("nunjucks");

const { DateTime } = require('luxon')

function isValidateDateFormate(dateString) {
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return dateString.match(regex) !== null;
};

function isValidateYear(yearString) {
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return yearString.match(regex) !== null;
};


module.exports = {
    readableDate: function (date, format, locale = "fr") {
        // default to Europe/Vienna Timezone
        const dt = DateTime.fromJSDate(date, { zone: 'UTC+2' })
        if (!format) {
            format =
                dt.hour + dt.minute > 0 ? 'dd LLL yyyy - HH:mm' : 'dd LLL yyyy'
        }
        return dt.toFormat(format, { locale: locale })
    },

    dateToFormat: function (date, format) {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(
            String(format)
        )
    },

    dateToISO: function (date) {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toISO({
            includeOffset: false,
            suppressMilliseconds: true
        })
    },

    dateFromISO: function (timestamp) {
        return DateTime.fromISO(timestamp, { zone: 'utc' }).toJSDate()
    },

    iso8601: function (dateObj) {
        return dateObj.toISOString();
    },

    // Return the localName of the prefixed URI in parameter
    localName: function (uri) {
        const splitURL = uri.substring(uri.lastIndexOf("/") + 1);
        if (splitURL === undefined) {
          splitURL = uri.split(":")[1];
        }
        return splitURL;
    },

    /**
    * Returns the first element in the array (or single item) having @language
    * equal to the provided language code,
    * or the first item if none matches the language code
    **/
    lang: function (arr, locale) {
      if(arr) {
          // filter for language
          if(Array.isArray(arr)) {
            for (let index = 0; index < arr.length; index++) {
              const element = arr[index];
              if (element["@language"] === locale) {
                return element["@value"];
              }
            }
            return "";
          } else {
            if(arr["@language"] === locale) {
                return arr["@value"];
            } else {
                return "";
            }
          }
        }
    },

    // returns the full URL from a prefixed URL, by analyzing the JSON-LD context
    getURL : function (inputContext, concept) {
        const inputPrefix = concept.split(":")[0];
        const inputConcept = concept.split(":")[1];

        const obj = JSON.parse(inputContext);
        const uriFound = JSON.stringify(obj, [inputPrefix]);

        const objOutput = JSON.parse(uriFound);

        return objOutput[inputPrefix] != undefined
          ? objOutput[inputPrefix] + inputConcept
          : concept;
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

    timeline: function (jsonChangeNote, locale) {
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
      if (!absoluteUrl.startsWith('/')) {
        throw new Error('URL is already relative : '+absoluteUrl)
      }
      const relativeUrl = require("path").relative(page.url, absoluteUrl);
      return relativeUrl;
    },

    jsonSort: function (jsonContent, element) {
        const newJsonCode = jsonContent.sort((a, b) => {
          if(a[element] && a[element].length > 0) {
            if(b[element] && b[element].length > 0) {
                const aValue = JSON.stringify(Object.values(a[element][0]));
                const bValue = JSON.stringify(Object.values(b[element][0]));
                return aValue.localeCompare(bValue);
            } else {
                return -1;
            }
          } else {
            if(b[element] && b[element].length > 0) {
                return 1
            } else {
                // default to id
                if(a.id) {
                    if(b.id) {
                        return a.id.localeCompare(b.id);
                    } else {
                        return -1;
                    }
                } else {
                    if(b.id) {
                        return 1
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
    }
}
