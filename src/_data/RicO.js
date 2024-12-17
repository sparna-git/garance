const fs = require("fs"); //
const gStructure = require("../_includes/structure")

// appelle les fichiers csv
const file_rico_fr = "./src/fr/rico_fr.csv";
const file_rico_en = "./src/en/rico_en.csv";
const rico_fr = fs.readFileSync(file_rico_fr, { encoding: "utf-8", flag: "r" });
const rico_en = fs.readFileSync(file_rico_en, { encoding: "utf-8", flag: "r" });

// fonction pour lire les données d'un fichier csv et retourner une estructure de dictionaire
const dicFR = readCSV(rico_fr, "fr");
const dicEN = readCSV(rico_en, "en");

// Créer une estructure et returne une résultat de type objet
/*
* {input} le fichier de la langue
*/ 
const objFR = gStructure(dicFR);
const objEN = gStructure(dicEN);

// Merge les objet dans une seule résultat
const multilangueRicO = merge(objFR, objEN);

// Ouptut Result
module.exports = multilangueRicO;

// fonction pour merge tous les langues a utiliser 
function merge(objFR, objEN) {
  // fonction pour merge le résultat
  const ObjTranslations = new Object();
  for (o in objEN) {
    const id = o;
    //
    const assign_values = Object.assign({}, objEN[o], objFR[o]);
    ObjTranslations[o] = assign_values;
  }
  return ObjTranslations;
};

function readCSV(data, langue) {
  // creer l'objetc
  const objLanguage = new Object();
  // split data csv
  const data_clean = data.split("\r\n");
  // pour chaque line on v
  const entries = new Map();
  data_clean.forEach((l) => {
    const key = l.split(",")[0];
    const value = l.split(",")[1];

    if (key !== "ricoId" && key !== "") {
        entries.set(key, value);
    }
  });

  // telecharcher les données dans l'object
  objLanguage[langue] = Object.fromEntries(entries);
  return objLanguage;
}