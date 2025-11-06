const fs = require("fs");
//npm i glob
const { glob, globSync } = require("glob");
// npm install path
const path = require("path");

function getIdentifiers(jsonResource, eNode) {
  
  const listOfURL = []

  const jsonData = JSON.parse(jsonResource);
  const jsonArray = jsonData.graph;
  for (let obj of jsonArray) {
    if (Object.keys(obj).includes(eNode)) {      
      const dataDigital = obj[eNode]["rico:hasOrHadDigitalInstantiation"];
      if (dataDigital) {
        if (Array.isArray(dataDigital)) {
          for (let urlResource of dataDigital) {
            const isRDF = urlResource["dc:format"] === "application/rdf+xml";
            if (isRDF) {
              const url = String(urlResource["dcat:downloadURL"].id);
              const idAgent = url.split("/")
              listOfURL.push(idAgent[idAgent.length - 1]);
            }
          }
        }
      }
    }
  }
  return listOfURL;
}

function getAllListFilesResources(directoryResource) {
  //
  const allResources = glob.sync(directoryResource + "/**/*.rdf"); //globSync("**/*.rdf", { cwd: directoryResource }); 
  //
  const objResource = []
  allResources.forEach((element) => {
    const e = element.split("/");
    objResource.push({ name: e[e.length - 1], rdfpath: element });
});
  console.log("directory Referentiels")
  console.log(objResource)
  return objResource;
}

function copyResourceAgents(dirDist,pathResource) {
  // 
  const distWeb = fs.readdirSync(dirDist);
  for (let agent of pathResource) {
    const name = agent["name"];
    let name_of_dist = ""
    if (name.split("_").length === 3) {
      name_of_dist = name.replace("FRAN_Agent_","").replace(".rdf","");
    } else {
      name_of_dist = name.replace("_Agent_", "_").replace(".rdf", "");
    }

    const pathResource = agent["rdfpath"];
    if (distWeb.includes(name_of_dist)) {
      // path target
      const dirTarget = dirDist + "/" + name_of_dist + "/";
      // Copy File
      fs.copyFile(pathResource, dirTarget+'data.rdf', (err) => {
        if (err) throw err;
        console.log("The file was copied...");
      });
    }
  }
}

function copyResource(dirDist, pathResource) {
  //
  const distWeb = fs.readdirSync(dirDist);
  for (let agent of pathResource) {
    const name = agent["name"];
    let name_of_dist = name.replace("_Place_", "_").replace(".rdf", "");    
    const pathResource = agent["rdfpath"];

    if (distWeb.includes(name_of_dist)) {
      // path target
      const dirTarget = dirDist + "/" + name_of_dist + "/";
      // Copy File
      fs.copyFile(pathResource, dirTarget + "data.rdf", (err) => {
        if (err) throw err;
        console.log("The file was copied...");
      });
    }
  }
}

function resourcesAgents(
  listOfIdAgents,
  directoryAgentReferentiels,
  distAgents
) {
  // ist of files Referentiels Agents
  console.log("Load all file in Referentiel Agents")
  const allResourcesRDFAgents = getAllListFilesResources(directoryAgentReferentiels);
  // Read Frame JSON Agents Header and get the identifier donwload RDF
  console.log("Validate agent Id if exist in the referentiel agents");
  const pathAgentsFiles = [];
  listOfIdAgents.forEach((agentId) => {
    const getResult = allResourcesRDFAgents.filter(function (data) {
      return data.name === agentId;
    });
    if (getResult) {
      // build the full path of the file
      //path.join(directoryAgentReferentiels, 
      const filePath = getResult[0].rdfpath;
      pathAgentsFiles.push({ name: agentId, rdfpath: filePath });
    } else {
      pathAgentsFiles.push({ name: agentId, rdfpath: "" });
    }
  });
  // Copy all files Agents in the dist directory
  console.log("Copy all files");
  copyResourceAgents(distAgents, pathAgentsFiles);
}

function resourcesPlaces(
  listOfIdPlaces,
  directoryPlacesReferentiels,
  distPlaces
) {
  // ist of files Referentiels Agents
  console.log("Load all file in Referentiel Agents");
  const allResourcesRDFPlaces = getAllListFilesResources(
    directoryPlacesReferentiels
  );
  console.log("Validate places Id if exist in the referentiel folder");
  const pathPlacesFiles = [];
  listOfIdPlaces.forEach((placeId) => {
    const getResult = allResourcesRDFPlaces.filter(function (data) {
      return data.name === placeId;
    });
    if (getResult.length > 0) {
      // build the full path of the file
      const filePath = path.join(
        directoryPlacesReferentiels,
        getResult[0].rdfpath
      );
      pathPlacesFiles.push({ name: placeId, rdfpath: filePath });
    } else {
      pathPlacesFiles.push({ name: placeId, rdfpath: "" });
    }
  });
  // Copy all files Agents in the dist directory
  copyResource(distPlaces, pathPlacesFiles);
}

(async () => {
  
  // --- Agents  ---
  const directoryAgentReferentiels = process.argv[2] //"Referentiels/agents";
  console.log(directoryAgentReferentiels)
  const distAgents = process.argv[3] //"dist/entities/agent";
  console.log(distAgents)
  console.log("Reading " + "src/_data/agentsHeader.json" + " for Agents...");
  let dataJsonAgents = fs.readFileSync("src/_data/agentsHeader.json");
  
  // Get list of file name
  let listOfIdAgents = getIdentifiers(dataJsonAgents,"rico:isOrWasDescribedBy");
  console.log(listOfIdAgents);
  resourcesAgents(listOfIdAgents, directoryAgentReferentiels, distAgents);
  
  // Places
  const directoryPlaceReferentiels = process.argv[4] //"Referentiels/lieux";
  console.log(directoryPlaceReferentiels)
  const distPlace = process.argv[5] //"./dist/entities/place";
  console.log(distPlace)
  
  console.log("Reading " + "src/_data/placesHeader.json" + " for places...");
  let dataJsonPlaces = fs.readFileSync("src/_data/placesHeader.json");
  
  // Get list of file name
  let listOfIdPlaces = getIdentifiers(dataJsonPlaces,"rico:isOrWasDescribedBy");
  console.log(listOfIdAgents);
  resourcesPlaces(listOfIdPlaces, directoryPlaceReferentiels, distPlace);
})();
