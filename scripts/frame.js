// Directories
const fs = require("fs");
//npm install jsonld
const jsonld = require("jsonld");

/**
 * Removes type keys from an object.
 * @param {object} obj - The object to remove type keys from.
 */
function removeTypeKey(obj) {
  if(obj && typeof obj === "object") {
    if(! ("@value" in obj || "value" in obj)) {
      delete obj.type;
      delete obj["@type"];
    }
    Object.entries(obj).forEach(([key, value]) => {
      removeTypeKey(value)
    });
  }
}

function deleteAllOnTypeExcept(jsonArray, type, except) {
  let validKeys = [ 'type', '@type', 'id', '@id', ...except ];
  for(let obj of jsonArray) {
    if(hasType(obj, type)) {
      Object.keys(obj).forEach((key) => validKeys.includes(key) || delete obj[key]);
    }
  }
}

function hasType(obj, type) {  
  let objType = getType(obj);
  if(objType && Array.isArray(objType)) {
    for(let t of objType) {
      if(t === type) {
        return true;
      }
    }
  } else {
    return (objType === type)
  }

  
  return false;
}

function getType(obj) {
  return obj.type?obj.type:obj["@type"];
}

let framed = async function (dataJsonLd, framingSpecPath, outputFile) {

  let framingSpec = fs.readFileSync(framingSpecPath, { ncoding: "utf8", flag: "r"});

  console.log("jsonld.frame ...");
  let framingSpecObject = JSON.parse(framingSpec);
  // console.log(framingSpecObject);
  const framed = await jsonld.frame(dataJsonLd, framingSpecObject);
  // special : remove type keys after framing
  // framed.graph.forEach(e => Object.entries(e).forEach(([key, value]) => { removeTypeKey(value) }));
  console.log("end jsonld.frame !");

  console.log("Writing to file : "+outputFile+" ...");
  fs.writeFileSync(outputFile, JSON.stringify(framed, null, 2), { encoding: "utf8" });
  console.log("Done writing to "+outputFile);
};



(async () => {
  
  
  // Lecture de fichiers 
  console.log("Reading " + "./_json/garance.json"+" ...");
  let dataJsonLd = JSON.parse(fs.readFileSync("./_json/garance.json", { encoding: "utf8", flag: "r" }));  
  console.log("Done");

  console.log("Now framing agents...");
  // create deep copy of dataJsonLd
  agentFramingData = JSON.parse(JSON.stringify(dataJsonLd));
  // delete all unnecessary keys
  agentFramingData.graph = agentFramingData.graph.filter((obj) => !hasType(obj, "rico:PhysicalLocation"));
  agentFramingData.graph = agentFramingData.graph.filter((obj) => !hasType(obj, "rico:Coordinates"));
  agentFramingData.graph = agentFramingData.graph.filter((obj) => !hasType(obj, "rico:Instantiation"));
  deleteAllOnTypeExcept(agentFramingData.graph, "rico:Place", ["rdfs:label"]);
  deleteAllOnTypeExcept(agentFramingData.graph, "skos:Concept", ["skos:prefLabel"]);
  // serialize to check
  await framed(agentFramingData,"src/_data/framings/agents-framing.json","src/_data/agents.json");

  console.log("Now framing agents header...");
  await framed(agentFramingData,"src/_data/framings/agentsHeader-framing.json","src/_data/agentsHeader.json");

  console.log("Now framing vocabularies...");
  await framed(dataJsonLd,"src/_data/framings/vocabularies-framing.json","src/_data/vocabularies.json");

  console.log("Now framing index...");
  await framed(dataJsonLd,"src/_data/framings/index-framing.json","src/_data/index.json");



})()