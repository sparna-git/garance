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

let framed = async function (rawJsonLd, framingSpecPath, outputFile) {

  // Lecture de fichiers 
  let dataJsonLd = JSON.parse(fs.readFileSync(rawJsonLd, { ncoding: "utf8", flag: "r" }));  
  let framingSpec = fs.readFileSync(framingSpecPath, { ncoding: "utf8", flag: "r"});

  console.log("Frame...");
  const framed = await jsonld.frame(dataJsonLd, JSON.parse(framingSpec));
  // special : remove type keys after framing
  Object.entries(framed).forEach(([key, value]) => { removeTypeKey(value) });
  console.log("End framing !");
  console.log("Writing to file : "+outputFile+" ...");
  fs.writeFile(outputFile, JSON.stringify(framed, null, 2), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("ok");
    } 
  });
};



(async () => {
  console.log("Reading " + "./_json/garance.json" + " ...");
  // Dataset
  
  console.log("Now framing vocabularies...");
  await framed("./_json/garance.json","src/_data/framings/vocabularies-framing.json","src/_data/vocabularies.json");

  console.log("Now framing index...");
  await framed("./_json/garance.json","src/_data/framings/index-framing.json","src/_data/index.json");

  console.log("Now framing agents...");
  await framed("./_json/garance.json","src/_data/framings/agents-framing.json","src/_data/agents.json");

})()