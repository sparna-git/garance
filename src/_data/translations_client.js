const static_translations_fr = require("../_data/i18n/fr/garance");
const static_translations_en = require("../_data/i18n/en/garance");
const fs = require("fs"); //
const gStructure = require("../_includes/structure")


// appelle les fichiers csv
const file_rico_fr = "./src/_data/i18n/fr/rico.csv";
const file_rico_en = "./src/_data/i18n/en/rico.csv";
const rico_fr = fs.readFileSync(file_rico_fr, { encoding: "utf-8", flag: "r" });
const rico_en = fs.readFileSync(file_rico_en, { encoding: "utf-8", flag: "r" });

// fonction pour lire les données d'un fichier csv et retourner une estructure de dictionaire
const dicFR = readCSV(rico_fr, "fr");
const dicEN = readCSV(rico_en, "en");

let rico_translations = Object.assign({}, dicFR, dicEN);
let static_translations = Object.assign({}, static_translations_fr, static_translations_en);

const translations = {
  "en": Object.assign(
    {},
    rico_translations["en"],
    static_translations["en"] 
  ),
  "fr": Object.assign(
    {},
    rico_translations["fr"],
    static_translations["fr"] 
  )
}

module.exports = translations;


function readCSV(data, langue) {
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

  // telecharcher les données dans l'object
  objLanguage[langue] = Object.fromEntries(entries);
  return objLanguage;
}

