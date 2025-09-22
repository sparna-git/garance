const jsonld = require("./jsonld.js");


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

function getDownloadLinks(agent, context) {
  const id = jsonld.getId(agent);
  const types = Array.isArray(jsonld.getTypes(agent))
    ? jsonld.getTypes(agent)
    : [jsonld.getTypes(agent)];
  const expandedId = jsonld.expandUri(id, context);
  let fileName = expandedId.split("/").pop();

  let rdfUrl = null;
  let eacUrl = null;

  const shortMatch = /^(\d{6})$/.exec(fileName);
  if (shortMatch) {
    const num = shortMatch[1];
    rdfUrl = `https://github.com/ArchivesNationalesFR/Referentiels/blob/main/agents/producteurs/rdf/FRAN_Agent_${num}.rdf`;
    eacUrl = `https://github.com/ArchivesNationalesFR/Referentiels/blob/main/agents/producteurs/eac-cpf/FRAN_NP_${num}.xml`;
    return { rdfUrl, eacUrl };
  } else {
    // removes the "FRAN_" from the beginning of the filename
    const match = /^FRAN_(.*)/.exec(fileName);
    if (match) {
      // insert "_Agent_" after "FRAN_"
      // e.g. FRAN_123456 becomes FRAN_Agent_123456
      fileName = match[1];
      fileName = `FRAN_Agent_${fileName}`;
    }

    if (types.includes("rico:CorporateBody")) {
      rdfUrl = `https://github.com/ArchivesNationalesFR/Referentiels/blob/main/agents/collectivites/${fileName}.rdf`;
      return { rdfUrl };
    }
    if (types.includes("rico:Person")) {
      rdfUrl = `https://github.com/ArchivesNationalesFR/Referentiels/blob/main/agents/personnesPhysiques/${fileName}.rdf`;
      return { rdfUrl };
    }
  }

  return null;
}

function place_identifier(place) {

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

function place_getDownloadLink(place) {

  const digitalInstance = place?.["rico:isOrWasDescribedBy"]?.["rico:hasOrHadDigitalInstantiation"];  
  if (jsonld.isArray(digitalInstance)) {
    for (const item of digitalInstance) {      
      const format = item?.["dc:format"];
      if(format == "application/rdf+xml") {
        const urlResource = item?.["dcat:downloadURL"];
        const rdfURL = [];
        if (urlResource) {
          if (!jsonld.isArray(urlResource)) {
            rdfURL.push(item?.["dcat:downloadURL"]?.["id"]);
            return rdfURL;
          } else {
            if (jsonld.isArray(urlResource)) {
              for (const e in urlResource) {
                rdfURL.push(e);
              }
              return rdfURL;
            }
          }
        }
      }

    }
  }
  return null;
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
 * Returns the SIV URL (rdfs:seeAlso) if available on digital instantiation.
 * @param {object} agent - The agent object.
 * @returns {string|null} The SIV URL or null.
 */
function getSivSeeAlsoUrl(agent) {
  const seeAlso =
    agent?.["rico:isOrWasDescribedBy"]?.["rico:hasOrHadDigitalInstantiation"]?.[
      "rdfs:seeAlso"
    ];
  return typeof seeAlso === "object"
    ? seeAlso?.id || seeAlso?.["@id"]
    : seeAlso || null;
}

function isValidDateFormat(dateString) {
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return dateString.match(regex) !== null;
}

function isValidYearFormat(yearString) {
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return yearString.match(regex) !== null;
}

function timeline (jsonChangeNote, locale) {
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
        c => (!c.isoThesStatus || (c.isoThesStatus["@value"] != "obsolète"))
    );
}

function removeURL(uri) {
  const NAMESPACE = "https://rdf.archives-nationales.culture.gouv.fr/";
  var result = "";
  if(uri.startsWith(NAMESPACE)) {
    result = uri.replace(NAMESPACE,"")
  } 
  return result
}

function toUrl(uri) {
    const NAMESPACE = "https://rdf.archives-nationales.culture.gouv.fr/";
    var result = uri;
    if(uri.startsWith(NAMESPACE)) {
        let endUri = uri.substring(NAMESPACE.length);
        if(
            endUri.includes("corporateBodyType/")
            ||
            endUri.includes("recordState/")
            ||
            endUri.includes("activityType/")
            ||
            endUri.includes("occupationType/")
            ||
            endUri.includes("language/")
            ||
            endUri.includes("thing/")
            ||
            endUri.includes("carrierType/")
            ||
            endUri.includes("productionTechniqueType/")
            ||
            endUri.includes("identifierType/")
            ||
            endUri.includes("placeType/")
            ||
            endUri.includes("representationType/")
            ||
            endUri.includes("documentaryFormType/")
            ||
            endUri.includes("recordSetType/")
        ) {
            result = "/entities/"+endUri.split("/")[0]+"s"+"#"+endUri.split("/")[1];       
        } else {
            result = "/entities/"+endUri; 
        }
    }

    return result;
}

module.exports = {
  getCreationDate,
  getDownloadLinks,
  getLastModificationDate,
  getSivSeeAlsoUrl,
  timeline,
  excludeObsolete,
  removeURL,
  toUrl,
  place_getDownloadLink,
  place_identifier,
};
