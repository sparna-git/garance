// Directories
const fs = require("fs");
//npm install jsonld
const jsonld = require("jsonld");
const { json } = require("stream/consumers");

/**
 * Removes type keys from an object.
 * @param {object} obj - The object to remove type keys from.
 */
function removeTypeKey(obj) {
  if (obj && typeof obj === "object") {
    if (!("@value" in obj || "value" in obj)) {
      delete obj.type;
      delete obj["@type"];
    }
    Object.entries(obj).forEach(([key, value]) => {
      removeTypeKey(value);
    });
  }
}

function deleteAllOnTypeExcept(jsonArray, type, except) {
  let validKeys = ["type", "@type", "id", "@id", ...except];
  for (let obj of jsonArray) {
    if (hasType(obj, type)) {
      Object.keys(obj).forEach(
        (key) => validKeys.includes(key) || delete obj[key]
      );
    }
  }
}


/**
 * Supprime les objets de type donné (ex: rico:PerformanceRelation) :
 * - du tableau principal `graph`
 * - ET des sous-structures comme `thingIsTargetOfRelation`
 */
function deleteRelationsWithoutProperties(graph, type) {
  const PROPERTIES_TO_KEEP = [
    "rico:beginningDate",
    "rico:endDate",
    "rico:note",
  ];

  const hasRequiredProperty = (obj) => {
    return PROPERTIES_TO_KEEP.some((prop) => obj[prop]);
  };

  // Étape 1 : filtrer le tableau principal
  const filteredGraph = graph.filter((obj) => {
    const objType = obj.type || obj["@type"];
    const typeList = Array.isArray(objType) ? objType : [objType];
    if (!typeList.includes(type)) return true;
    return hasRequiredProperty(obj);
  });

  // Étape 2 : filtrer les relations imbriquées dans chaque agent (thingIsTargetOfRelation)
  for (const obj of filteredGraph) {
    if (Array.isArray(obj["rico:thingIsTargetOfRelation"])) {
      obj["rico:thingIsTargetOfRelation"] = obj[
        "rico:thingIsTargetOfRelation"
      ].filter((rel) => {
        const relType = rel.type || rel["@type"];
        const relTypeList = Array.isArray(relType) ? relType : [relType];

        if (!relTypeList.includes(type)) return true;
        return hasRequiredProperty(rel);
      });
    }
  }

  return filteredGraph;
}

function hasType(obj, type) {
  let objType = getType(obj);
  if (objType && Array.isArray(objType)) {
    for (let t of objType) {
      if (t === type) {
        return true;
      }
    }
  } else {
    return objType === type;
  }

  return false;
}

function getType(obj) {
  return obj.type ? obj.type : obj["@type"];
}

function replaceURL(jsonArray, eNode, urlTransformation) {
  const rgx = new RegExp(
    "https://rdf.archives-nationales.culture.gouv.fr/recordResource/top-"
  );
  for (let obj of jsonArray) {
    if (Object.keys(obj).includes(eNode)) {
      if (obj[eNode].id != undefined) {
        if (rgx.exec(obj[eNode].id)) {
          obj[eNode].id = obj[eNode].id.replace(
            "https://rdf.archives-nationales.culture.gouv.fr/recordResource/top-",
            urlTransformation
          );
        }
      } else {
        obj[eNode].forEach((e) => {
          if (rgx.exec(e.id)) {
            e.id = e.id.replace(
              "https://rdf.archives-nationales.culture.gouv.fr/recordResource/top-",
              urlTransformation
            );
          }
        });
      }
    }
  }
  return jsonArray;
}

/**
 *
 * Supprime les AgentName inutiles dans le graphe selon la regle
 * - si 'rico:type' contient "forme préféré"
 * - et pas de 'rico:usedFromDate' ou 'rico:usedToDate'
 */
function cleanPreferredAgentsNames(graph) {
  const toRemoveIds = new Set();

  // Étape 1 : marquer les AgentName à supprimer
  for (const obj of graph) {
    const types = obj.type || obj["@type"];
    const isAgentName = Array.isArray(types)
      ? types.includes("rico:AgentName")
      : types === "rico:AgentName";

    if (!isAgentName) continue;

    const typeField = obj["rico:type"];
    const typeValue =
      typeof typeField === "string" ? typeField : typeField?.["@value"] || "";

    const noFromDate = !obj["rico:usedFromDate"];
    const noToDate = !obj["rico:usedToDate"];

    if (typeValue.includes("forme préférée") && noFromDate && noToDate) {
      toRemoveIds.add(obj.id);
    }
  }

  // Étape 2 : supprimer les objets eux-mêmes
  return graph.filter((obj) => !toRemoveIds.has(obj.id));
}

let framed = async function (dataJsonLd, framingSpecPath, outputFile) {
  let framingSpec = fs.readFileSync(framingSpecPath, {
    ncoding: "utf8",
    flag: "r",
  });

  console.log("jsonld.frame ...");
  let framingSpecObject = JSON.parse(framingSpec);
  // console.log(framingSpecObject);
  const framed = await jsonld.frame(dataJsonLd, framingSpecObject);
  // special : remove type keys after framing
  // framed.graph.forEach(e => Object.entries(e).forEach(([key, value]) => { removeTypeKey(value) }));
  console.log("end jsonld.frame !");

  console.log("Writing to file : " + outputFile + " ...");
  fs.writeFileSync(outputFile, JSON.stringify(framed, null, 2), {
    encoding: "utf8",
  });
  console.log("Done writing to " + outputFile);
};

(async () => {
  // Lecture de fichiers
  console.log("Reading " + "./_json/garance.json" + " ...");
  let dataJsonLd = JSON.parse(
    fs.readFileSync("./_json/garance.json", { encoding: "utf8", flag: "r" })
  );
  console.log("Done");

  console.log("Now framing agents...");
  // create deep copy of dataJsonLd
  agentFramingData = JSON.parse(JSON.stringify(dataJsonLd));
  // delete all unnecessary keys
  agentFramingData.graph = agentFramingData.graph.filter((obj) => !hasType(obj, "rico:PhysicalLocation"));
  agentFramingData.graph = agentFramingData.graph.filter((obj) => !hasType(obj, "rico:Coordinates"));

  deleteAllOnTypeExcept(agentFramingData.graph, "rico:Place", ["rdfs:label"]);
  deleteAllOnTypeExcept(agentFramingData.graph, "skos:Concept", ["skos:prefLabel"]);

  // clean agents names
  agentFramingData.graph = cleanPreferredAgentsNames(agentFramingData.graph);

  // serialize to check
  await framed(agentFramingData,"src/_data/framings/agents-framing.json","src/_data/agents.json");

  // ------------------------
  console.log("Post-processing: delete empty relations...");
  let agentsData = JSON.parse(fs.readFileSync("src/_data/agents.json", { encoding: "utf8", flag: "r" }));

  // Supprime les relations vides
  agentsData.graph = deleteRelationsWithoutProperties(agentsData.graph,"rico:MandateRelation");
  agentsData.graph = deleteRelationsWithoutProperties(agentsData.graph,"rico:PerformanceRelation");
  agentsData.graph = deleteRelationsWithoutProperties(agentsData.graph,"rico:PlaceRelation");

  /*
  * Replace les URIs
  */
  replaceURL(agentsData.graph,"rico:isOrganicProvenanceOf","https://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_");

  fs.writeFileSync("src/_data/agents.json",JSON.stringify(agentsData, null, 2),{ encoding: "utf8" });

  console.log("Relations sans date/note supprimées !");  

  console.log("Now framing agents header...");
  await framed(agentFramingData,"src/_data/framings/agentsHeader-framing-2.json","src/_data/agentsHeader.json");

  console.log("Now framing vocabularies...");
  await framed(dataJsonLd,"src/_data/framings/vocabularies-framing.json","src/_data/vocabularies.json");

  console.log("Now framing index...");
  await framed(dataJsonLd,"src/_data/framings/index-framing.json","src/_data/index.json");
})();

/*

function cleanCreationActivities(graph) {
  for (const obj of graph) {
    if (!hasType(obj, 'rico:Agent')) continue;

    const record = obj['rico:isOrWasDescribedBy'];
    if (!record || typeof record !== 'object') continue;

    const affected = record['rico:isOrWasAffectedBy'];
    if (!affected) continue;

    const activities = Array.isArray(affected) ? affected : [affected];

    const filtered = activities.filter(act => {
      const name = act['rico:name'];
      const value = name?.['@value'] || '';
      return value.startsWith('création');
    });

    if (filtered.length === 0) {
      delete record['rico:isOrWasAffectedBy'];
    } else {
      record['rico:isOrWasAffectedBy'] =
        filtered.length === 1 ? filtered[0] : filtered;
    }
  }

  return graph;
}

*/
