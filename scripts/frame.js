// Directories
const fs = require("fs");
//npm install jsonld
const jsonld = require("jsonld");
const json = require('big-json');

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

function deleteEntitiesOfType(jsonArray, type) {
  return jsonArray.filter((obj) => !hasType(obj, type));
}


/**
 * Deletes all entities of a given type that have a given predicate referring to an entity of another given type.
 * The referred item is not embedded; it is found by its id in the original jsonArray.
 * @param {Array} jsonArray - The array of entities.
 * @param {string} entityType - The type of entities to delete (e.g., "rico:Record").
 * @param {string} predicate - The predicate to check (e.g., "rico:describesOrDescribed").
 * @param {string} referredType - The type of the referred entity (e.g., "rico:Agent").
 * @returns {Array} - The filtered array.
 */
function deleteEntitiesWithPredicateToType(jsonArray, entityType, predicate, referredType) {
  // Build a map of id -> entity for fast lookup
  const idMap = new Map();
  for (const obj of jsonArray) {
    const objId = getId(obj);
    if (objId) idMap.set(objId, obj);
  }

  return jsonArray.filter(obj => {
    if (!hasType(obj, entityType)) return true;
    const ref = obj[predicate];
    if (!ref) return true;

    // Normalize to array
    const refs = Array.isArray(ref) ? ref : [ref];
    for (const r of refs) {
      const refId = getId(r);
      if(refId == "place:FRAN_RI_005-d-104xmvek7--gl69gh2bcz1b") { console.log("Found ref to check: " + refId); }
      if (!refId) continue;
      const referredObj = idMap.get(refId);
      if (referredObj && hasType(referredObj, referredType)) {
        return false; // Should be deleted
      }
    }
    return true;
  });
}



/**
 * Deletes all entities of a given type that are NOT referenced by a predicate from entities of another given type.
 * For example, deletes all rico:Instantiation not referenced by rico:hasOrHadDigitalInstantiation from rico:Record.
 * @param {Array} jsonArray - The array of entities.
 * @param {string} entityType - The type of entities to delete (e.g., "rico:Instantiation").
 * @param {string} referringType - The type of referring entities (e.g., "rico:Record").
 * @param {string} predicate - The predicate used for reference (e.g., "rico:hasOrHadDigitalInstantiation").
 * @returns {Array} - The filtered array.
 */
function deleteEntitiesNotReferencedByPredicate(jsonArray, entityType, referringType, predicate) {
  // Collect all referenced IDs from referringType entities via predicate
  const referencedIds = new Set();
  for (const obj of jsonArray) {
    if (!hasType(obj, referringType)) continue;
    const refs = obj[predicate];
    if (!refs) continue;
    const refArray = Array.isArray(refs) ? refs : [refs];
    for (const ref of refArray) {
      const refId = getId(ref);
      if (refId) {
        referencedIds.add(refId);
      }
    }
  }

  // Keep entities of entityType only if their id/@id is referenced
  return jsonArray.filter(obj => {
    if (!hasType(obj, entityType)) return true;
    const objId = getId(obj);
    result = referencedIds.has(objId);
    // console.log(`Entity ID ${objId} of type ${entityType} is ${result ? 'kept' : 'removed'}`);
    return result;
  });
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

/**
 * Gets the id of an object, supporting both 'id' and '@id'.
 * @param {object} obj
 * @returns {string|undefined}
 */
function getId(obj) {
  return obj ? (obj.id || obj["@id"]) : undefined;
}

/*
* Post Processing
*/
function replaceURL(jsonArray, eNode, urlTransformation) {

  // uris
  //const  = "https://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_";
  //const otherURI = "https://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_Agent_IR_";

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

function deleteOrganicProvenanceRelation(inputJson, type) {
  // Read array JSON
  for (let obj of inputJson) {
    Object.entries(obj).forEach(([k, v]) => {
      //
      if (Array.isArray(v)) {
        // Add filter
        const newObject = v.filter((item) => item.type !== type);
        obj[k] = newObject;
      } else {
        if (v.type === type) {
          delete obj[k];
        }
      }
    });
  }
}

function findItem(inputjson,properties) {
  result = false;
  const obj = Object.keys(inputjson);
  properties.forEach((p) => {
    if (obj.includes(p)) {
      result = true
    }
  });
  return result;
}

function deleteRelationsWithoutProperties2(inputJson,type,properties) {
  for (let objRP of inputJson) {
    Object.entries(objRP).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        // filter
        const newValue = v.filter(
          (item) => (item.type !== type) || (item.type === type && findItem(item, properties))
        );
        objRP[k] = newValue;        
      } else {
        if (v.type === type) {
          if (!findItem(v, properties)) {
            delete objRP[k];
          }
        }
      }
    });
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



function filterPlacesWithUri(jsonArray) {
  const regexPlace = new RegExp("place:FRAN_RI_");
  const newfilter = jsonArray.filter((f) => regexPlace.exec(f.id));
  return newfilter;
}


/**
 * Frames JSON-LD data and allows optional post-processing of the framed result.
 * @param {object} dataJsonLd - The JSON-LD data to frame.
 * @param {string} framingSpecPath - Path to the framing specification file.
 * @param {string} outputFile - Path to the output file.
 * @param {function} [postProcessFn] - Optional function to post-process the framed JSON.
 */
let doFrame = async function (dataJsonLd, framingSpecPath, outputFile, postProcessFn) {
  let framingSpec = fs.readFileSync(framingSpecPath, {
    encoding: "utf8",
    flag: "r",
  });


  console.log("Frame " + framingSpecPath + "...");
  const startTime = Date.now();
  let framingSpecObject = JSON.parse(framingSpec);
  const framed = await jsonld.frame(dataJsonLd, framingSpecObject);
  const endTime = Date.now();
  console.log(`Done frame! in ${(endTime - startTime) / 1000} seconds.`);

  // Optional post-processing
  let processed = postProcessFn ? postProcessFn(framed) : framed;

  console.log("Writing to file : " + outputFile + " ...");
  fs.writeFileSync(outputFile, JSON.stringify(processed, null, 2), { encoding: "utf8" });
};


async function readJsonStream(filePath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const parseStream = json.createParseStream();
    let result = null;
    parseStream.on('data', (data) => { result = data; });
    parseStream.on('end', () => resolve(result));
    parseStream.on('error', reject);
    readStream.pipe(parseStream);
  });
}


(async () => {
  // Lecture de fichiers


  // --- PLACES PROCESSING ---
  console.log("Reading " + "./_json/garance.json" + " for places...");
  let dataJsonLdPlaces = await readJsonStream("./_json/garance.json");
  console.log("Original graph size: " + dataJsonLdPlaces.graph.length);
  
  // Mutate for places
  dataJsonLdPlaces.graph = dataJsonLdPlaces.graph.filter((obj) => { return (
       !hasType(obj, "rico:OrganicProvenanceRelation") 
    && !hasType(obj, "rico:AgentControlRelation")
    && !hasType(obj, "rico:MandateRelation")
    && !hasType(obj, "rico:AgentName")
    && !hasType(obj, "rico:AgentHierarchicalRelation")
    && !hasType(obj, "rico:AgentTemporalRelation")
    && !hasType(obj, "rico:AgentToAgentRelation")
    && !hasType(obj, "rico:GroupSubdivisionRelation")
    && !hasType(obj, "rico:LeadershipRelation")
    && !hasType(obj, "rico:MembershipRelation")
    && !hasType(obj, "rico:PerformanceRelation")
  )});
  console.log("Graph size step 1: " + dataJsonLdPlaces.graph.length);
  dataJsonLdPlaces.graph = deleteEntitiesWithPredicateToType(
    dataJsonLdPlaces.graph,
    "rico:Record",
    "rico:describesOrDescribed",
    "rico:Agent"
  );
  console.log("Graph size step 2: " + dataJsonLdPlaces.graph.length);
  dataJsonLdPlaces.graph = deleteEntitiesNotReferencedByPredicate(
    dataJsonLdPlaces.graph,
    "rico:Instantiation",
    "rico:Record",
    "rico:hasOrHadDigitalInstantiation"
  );
  console.log("Graph size step 3: " + dataJsonLdPlaces.graph.length);
  deleteAllOnTypeExcept(dataJsonLdPlaces.graph, "rico:Agent", ["rdfs:label"]);
  deleteAllOnTypeExcept(dataJsonLdPlaces.graph, "skos:Concept", ["skos:prefLabel"]);
  deleteAllOnTypeExcept(dataJsonLdPlaces.graph, "rico:Instantiation", ["dcat:downloadURL","rico:identifier", "dc:format"]);
  dataJsonLdPlaces.graph = dataJsonLdPlaces.graph.filter((obj) => { return (
    !hasType(obj, "rico:Agent") 
  )});
  console.log("Graph size step 4: " + dataJsonLdPlaces.graph.length);
  console.log("Graph size: " + dataJsonLdPlaces.graph.length);

  // ...places framing code...
  await doFrame(
    dataJsonLdPlaces,
    "src/_data/framings/places-framing.json",
    "src/_data/places.json",
    function(framedData) {
      console.log("Post-processing: places ...");
      framedData.graph = filterPlacesWithUri(framedData.graph);
      console.log("Done post-processing: places ...");
      return framedData;
    }
  );
  await doFrame(
    dataJsonLdPlaces,
    "src/_data/framings/placesHeader-framing.json",
    "src/_data/placesHeader.json",
    function(framedData) {
      console.log("Post-processing: places header ...");
      framedData.graph = filterPlacesWithUri(framedData.graph);
      console.log("Done post-processing: places header ...");
      return framedData;
    }
  );
  console.log("Done framing places and places header");


  // --- AGENTS PROCESSING ---
  console.log("Reading " + "./_json/garance.json" + " for agents...");
  let dataJsonLdAgents = await readJsonStream("./_json/garance.json");
  console.log("Original graph size: " + dataJsonLdAgents.graph.length);
  
  // Mutate for agents
  dataJsonLdAgents.graph = deleteEntitiesWithPredicateToType(
    dataJsonLdAgents.graph,
    "rico:Record",
    "rico:describesOrDescribed",
    "rico:Place"
  );
  console.log("Graph size: " + dataJsonLdAgents.graph.length);
  dataJsonLdAgents.graph = deleteEntitiesNotReferencedByPredicate(
    dataJsonLdAgents.graph,
    "rico:Instantiation",
    "rico:Record",
    "rico:hasOrHadDigitalInstantiation"
  );
  console.log("Graph size: " + dataJsonLdAgents.graph.length);
  dataJsonLdAgents.graph = dataJsonLdAgents.graph.filter((obj) => !hasType(obj, "rico:PhysicalLocation"));
  dataJsonLdAgents.graph = dataJsonLdAgents.graph.filter((obj) => !hasType(obj, "rico:Coordinates"));
  deleteAllOnTypeExcept(dataJsonLdAgents.graph, "rico:Place", ["rdfs:label"]);
  dataJsonLdAgents.graph = cleanPreferredAgentsNames(dataJsonLdAgents.graph);
  console.log("Graph size: " + dataJsonLdAgents.graph.length);


  // Define post-processing function for agents framing
  function postProcessAgents(framedData) {
    console.log("Post-processing agents...");
    // Replace les URIs
    replaceURL(framedData.graph, "rico:isOrganicProvenanceOf", "https://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_");

    // Supprime les relations vides
    deleteRelationsWithoutProperties2(framedData.graph, "rico:MandateRelation", ["rico:beginningDate", "rico:endDate", "rico:note"]);
    deleteRelationsWithoutProperties2(framedData.graph, "rico:PlaceRelation", ["rico:beginningDate", "rico:endDate", "rico:note"]);
    // deleteRelationsWithoutProperties2(framedData.graph, "rico:PerformanceRelation", ["rico:beginningDate", "rico:endDate", "rico:note"]);

    // Supprimer les relations de OrganicProvenanceRelation
    deleteOrganicProvenanceRelation(framedData.graph, "rico:OrganicProvenanceRelation");

    console.log("Done Post-processing agents.");  
    return framedData;
  }

  // ...agents framing code...
  await doFrame(
    dataJsonLdAgents,
    "src/_data/framings/agents-framing.json",
    "src/_data/agents.json",
    postProcessAgents
  );
  await doFrame(dataJsonLdAgents, "src/_data/framings/agentsHeader-framing.json", "src/_data/agentsHeader.json");
  await doFrame(dataJsonLdAgents, "src/_data/framings/vocabularies-framing.json", "src/_data/vocabularies.json");
  await doFrame(dataJsonLdAgents, "src/_data/framings/index-framing.json", "src/_data/index.json");
  console.log('Finished processing agents, vocabularies, and index.');




})();
