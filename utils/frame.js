// Directories
const fs = require("fs");
//npm install jsonld
const jsonld = require("jsonld");

let framed = async function (rawJsonLd, framingSpecPath, outputFile) {

  // Lecture de fichiers 
  let dataJsonLd = JSON.parse(fs.readFileSync(rawJsonLd, { ncoding: "utf8", flag: "r" }));  
  let framingSpec = fs.readFileSync(framingSpecPath, { ncoding: "utf8", flag: "r"});

  console.log("Frame...");
  const framed = await jsonld.frame(dataJsonLd, JSON.parse(framingSpec));
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
  console.log("Reading " + process.argv[2] + " ...");
  // Dataset
  
  console.log("Now framing vocabularies...");
  await framed(process.argv[2],"src/_data/framings/vocabularies-framing.json","src/_data/vocabularies.json");

  console.log("Now framing index...");
  await framed(process.argv[2],"src/_data/framings/index-framing.json","src/_data/index.json");
  /*
  console.log("Now framing agents...");
  await framed(process.argv[2],"src/_data/framings/agents-framing.json","src/_data/agents.json");
  */
})()