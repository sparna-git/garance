const { getDatatype } = require("./jsonld");

// registry of rendering plugins: { name: string, test: function(item): boolean }
const renderingRegistry = [
  /*
  {
    name: "renderWktLiteral",
    test: (item, context) => {
      if (!item) return false;
      const t = item["@type"] || item.type;
      if (!t) return false;
      if (Array.isArray(t)) return t.includes("http://www.opengis.net/ont/geosparql#wktLiteral");
      return t === "http://www.opengis.net/ont/geosparql#wktLiteral";
    },
  },
  */
  /*
  {
    name: "renderXsdDate",
    test: (item, context) => {
      let datatype = getDatatype(item, context);
      return datatype === "http://www.w3.org/2001/XMLSchema#date";
    },
  },
  */
  // add more entries here as needed
];


/**
 * Return the name of a rendering macro (string) able to render `item`,
 * or undefined if no suitable renderer is found.
 * The logic is driven by the renderingRegistry above and can be extended
 * by pushing new {name, test} entries into renderingRegistry.
 *
 * Example:
 *   getRenderingPlugin(someItem) -> "renderWktLiteral" | "renderRawLiteral" | undefined
 */
function getRenderingPlugin(item, context) {
  for (const entry of renderingRegistry) {
    try {
      
      if (entry.test(item, context)) {
        return entry.name;
      }
    } catch (err) {
      // ignore test errors and continue to next rule
    }
  }
  return undefined;
}

// export functions if using module exports (optional; keep consistent with file)
module.exports = Object.assign(module.exports || {}, {
  getRenderingPlugin
});