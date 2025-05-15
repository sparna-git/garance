const fs = require("fs"); //

// appelle les fichiers csv
const file_rico_fr = "./src/_data/i18n/fr/rico.csv";
const file_rico_en = "./src/_data/i18n/en/rico.csv";
const rico_fr = fs.readFileSync(file_rico_fr, { encoding: "utf-8", flag: "r" });
const rico_en = fs.readFileSync(file_rico_en, { encoding: "utf-8", flag: "r" });

// fonction pour lire les données d'un fichier csv et retourner une estructure de dictionaire
const dicFR = readCSV(rico_fr);
const dicEN = readCSV(rico_en);

// input : { "key": "translation" }
// output : { "key": { "en" : "translation" }}
const objFR = Object.fromEntries(Object.entries(dicFR).map(([k, v]) => [k, { "fr": v }]))
const objEN = Object.fromEntries(Object.entries(dicEN).map(([k, v]) => [k, { "en": v }]))


// Merge les objets dans une seule résultat
const multilangueRicO = Object.fromEntries(Object.keys(objEN).map(key => 
  [key, { fr: objFR[key], en: objEN[key] }]
));

// Ouptut Result
module.exports = multilangueRicO;


function readCSV(data) {
  // creer l'objetc
  const objLanguage = new Object();
  // split data csv
  const data_clean = data.split(/\r?\n/);
  // pour chaque line on v
  const entries = new Map();
  data_clean.forEach((l) => {
    const key = l.split(",")[0];
    const value = l.split(",")[1];

    if (key !== "ricoId" && key !== "") {
        entries.set(key, value);
    }
  });

  return Object.fromEntries(entries);
}