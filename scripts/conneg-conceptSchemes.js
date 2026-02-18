const fs = require("fs");
//npm i glob
const { glob, globSync } = require("glob");
// npm install path
const path = require("path");


function getAllListFilesResources(directory, distDiretory) {

  // Read directory source and get all path of files
  const pathFiles = globSync(directory + "/*.rdf", { absolute: true,  });
  
  const listFiles = [];
  pathFiles.forEach((file) => {
    const name = path.basename(file);
    listFiles.push({ name: name, rdfpath: file });
  });

  // for each item get the name and path
  listFiles.forEach((item) => {
    const name = item["name"];
    const path = item["rdfpath"];
    
    console.log("name", name);
    // regex to get the name of the file without the extension
    const regex = /^(FRAN_+)(RI_[0-9]{2,3}_+)?([a-zA-Z]+)\.rdf$/;
    const match = name.match(regex);
    if (match) {
      const nameOfconcept = match[3];
      // find directory in dist/entitites/ and copy the file in it
      const dirTarget = distDiretory + "/" + nameOfconcept + "/";
      console.log("dirTarget", dirTarget);
      fs.copyFile(path, dirTarget + "data.rdf", (err) => {
        if (err) throw err;        
      }); 
    } else {
      console.log("No match found");
    }
    
  });

  
  return listFiles;
} 

(async () => {
  

    const conceptsDirectory = process.argv[2]; //"Referentiels/concepts";
    const distDiretory = process.argv[3]; //"dist/entities/concept";

    getAllListFilesResources(conceptsDirectory, distDiretory);
})();