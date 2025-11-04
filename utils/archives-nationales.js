const jsonld = require("./jsonld.js");
const filters = require("./filters.js");

/**
 * Finds the creation date from activities matching specific names.
 * @param {object} agent - The agent object from JSON-LD.
 * @returns {string|null} The creation date if found, otherwise null.
 */
function getCreationDate(agent) {
  const activities =
    agent?.["rico:isOrWasDescribedBy"]?.["rico:isOrWasAffectedBy"];

  if (!activities) return null;

  const list = Array.isArray(activities) ? activities : [activities];

  for (const activity of list) {
    const name = activity?.["rico:name"]?.["@value"];
    if (name && name.startsWith("Création")) {
      return activity?.["rico:date"]?.["@value"] || null;
    }
  }

  return null;
}

function getIdentifier(place) {
  const Ids = place?.["rico:hasOrHadIdentifier"];
  const identifier = [];
  if (Ids) {
    if (jsonld.isArray(Ids)) {
      for (const e of Ids) {
        identifier.push(e["rico:textualValue"]);
      }
    } else {
      identifier.push(Ids["rico:textualValue"]);
    }
    return identifier;
  }
  return null;
}

function getDownloadLinks(place) {
  let rdfUrl = null;
  let eacUrl = null;

  const digitalInstance =
    place?.["rico:isOrWasDescribedBy"]?.["rico:hasOrHadDigitalInstantiation"];
  if (jsonld.isArray(digitalInstance)) {
    for (const item of digitalInstance) {
      const format = item?.["dc:format"];
      if (format == "application/rdf+xml") {
        const urlResource = item?.["dcat:downloadURL"];
        if (urlResource) {
          if (!jsonld.isArray(urlResource)) {
            rdfUrl = item?.["dcat:downloadURL"]["id"];
          } else {
            rdfUrl = item?.["dcat:downloadURL"][0]["id"];
          }
        }
      }

      if (format == "text/xml") {
        const urlResource = item?.["dcat:downloadURL"];
        if (urlResource) {
          if (!jsonld.isArray(urlResource)) {
            eacUrl = item?.["dcat:downloadURL"]["id"];
          } else {
            eacUrl = item?.["dcat:downloadURL"][0]["id"];
          }
        }
      }
    }
  }
  return { rdfUrl, eacUrl };
}

/**
 * Returns the last modification date of an agent.
 * @param {object} agent - The agent object.
 * @returns {string|null} The modification date or null.
 */
function getLastModificationDate(agent) {
  return (
    agent?.["rico:isOrWasDescribedBy"]?.["rico:lastModificationDate"]?.[
      "@value"
    ] || null
  );
}

/**
 * Returns the SIV URL (rdfs:seeAlso) if available on digital instantiation of format text/xml
 * @param {object} agent - The agent object.
 * @returns {string|null} The SIV URL or null.
 */
function getSivSeeAlsoUrl(item) {
  const digitalInstances =
    item?.["rico:isOrWasDescribedBy"]?.["rico:hasOrHadDigitalInstantiation"];
  // normalize to array
  let instantiations = [digitalInstances].flat();
  
  for (const instantiation of instantiations) {
    const format = instantiation?.["dc:format"];
    if (format == "text/xml") {
      let seeAlso = instantiation["rdfs:seeAlso"];
      if(seeAlso) {
        return typeof seeAlso === "object"
          ? seeAlso?.id || seeAlso?.["@id"]
          : seeAlso || null;
      }
    }
  }
}

function isValidDateFormat(dateString) {
  let regex = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regex) !== null;
}

function isValidYearFormat(yearString) {
  let regex = /^\d{4}-\d{2}-\d{2}$/;
  return yearString.match(regex) !== null;
}

function timeline(jsonChangeNote, locale) {
  const tData = [];
  let JsonObj = JSON.stringify(jsonChangeNote);
  JsonObj = JSON.parse(JsonObj);
  for (let index = 0; index < JsonObj.length; index++) {
    const element = JsonObj[index];

    let dateNote = element["dc:date"];
    if (!isValidDateFormat(element["dc:date"])) {
      if (isValidYearFormat(element["dc:date"])) {
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
}

function excludeObsolete(conceptArray) {
  return conceptArray.filter(
    (c) => !c.isoThesStatus || c.isoThesStatus["@value"] != "obsolète"
  );
}

function removeURL(uri) {
  const NAMESPACE = "https://rdf.archives-nationales.culture.gouv.fr/";
  var result = "";
  if (uri.startsWith(NAMESPACE)) {
    result = uri.replace(NAMESPACE, "");
  }
  return result;
}

function toUrl(uri) {
  const NAMESPACE = "https://rdf.archives-nationales.culture.gouv.fr/";
  var result = uri;
  if (uri.startsWith(NAMESPACE)) {
    let endUri = uri.substring(NAMESPACE.length);
    if (
      endUri.includes("corporateBodyType/") ||
      endUri.includes("recordState/") ||
      endUri.includes("activityType/") ||
      endUri.includes("occupationType/") ||
      endUri.includes("language/") ||
      endUri.includes("thing/") ||
      endUri.includes("carrierType/") ||
      endUri.includes("productionTechniqueType/") ||
      endUri.includes("identifierType/") ||
      endUri.includes("placeType/") ||
      endUri.includes("representationType/") ||
      endUri.includes("documentaryFormType/") ||
      endUri.includes("recordSetType/")
    ) {
      result =
        "/entities/" + endUri.split("/")[0] + "s" + "#" + endUri.split("/")[1];
    } else {
      result = "/entities/" + endUri;
    }
  }

  return result;
}

/**
 * Filtre Eleventy pour extraire les entités (agents ou places)
 */
function getEntities(graph, currentLetter, type = "agents") {
  if (!Array.isArray(graph)) return [];

  const labelKey = type === "places" ? "skos:prefLabel" : "rdfs:label";

  let entitiesByLetter = graph.filter((item) => {
    if (!item?.id || !item[labelKey]) return false;

    // récupération du label (français ou @value)
    const labelObj = item[labelKey];
    const label =
      labelObj?.fr ||
      labelObj?.["@value"] ||
      (typeof labelObj === "string" ? labelObj : "") ||
      "";

    if (!label) return false;

    const firstLetter = filters.firstLetter(label);
    return firstLetter === currentLetter;
  });

  // tri cohérent sur le même type de label
  entitiesByLetter = sortLabels(entitiesByLetter);
  return entitiesByLetter;
}

/**
 * Trie un tableau d’entités agents ou places
 * trie avec collatpr
 */
function sortLabels(arr) {
  if (!Array.isArray(arr)) return arr;
  const collator = new Intl.Collator("fr", {
    sensitivity: "base",
    ignorePunctuation: true,
    numeric: true,
  });

  return arr.sort((a, b) => {
    const aLabel =
      a["rdfs:label"]?.fr ||
      a["rdfs:label"]?.["@value"] ||
      a["skos:prefLabel"]?.fr ||
      a["skos:prefLabel"]?.["@value"] ||
      "";

    const bLabel =
      b["rdfs:label"]?.fr ||
      b["rdfs:label"]?.["@value"] ||
      b["skos:prefLabel"]?.fr ||
      b["skos:prefLabel"]?.["@value"] ||
      "";

    return collator.compare(aLabel, bLabel);
  });
}

module.exports = {
  getEntities,
  getCreationDate,
  getDownloadLinks,
  getLastModificationDate,
  getSivSeeAlsoUrl,
  timeline,
  excludeObsolete,
  removeURL,
  toUrl,
  getIdentifier,
};
