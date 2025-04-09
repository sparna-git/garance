const static_translations_fr = require("../_data/i18n/fr/garance");
const static_translations_en = require("../_data/i18n/en/garance");
const fs = require("fs"); //


// appelle les fichiers csv
const file_rico_fr = "./src/_data/i18n/fr/rico.csv";
const file_rico_en = "./src/_data/i18n/en/rico.csv";
const rico_fr = fs.readFileSync(file_rico_fr, { encoding: "utf-8", flag: "r" });
const rico_en = fs.readFileSync(file_rico_en, { encoding: "utf-8", flag: "r" });

const file_rico_fr_definition = "./src/_data/i18n/fr/definition.csv";
const file_rico_en_definition = "./src/_data/i18n/en/definition.csv";
const rico_fr_definition = fs.readFileSync(file_rico_fr_definition, { encoding: "utf-8", flag: "r" });
const rico_en_definition = fs.readFileSync(file_rico_en_definition, { encoding: "utf-8", flag: "r" });

// fonction pour lire les données d'un fichier csv et retourner une estructure de dictionaire
const dicFR = readCSV(rico_fr);
const dicEN = readCSV(rico_en);
const dicFR_definition = readCSV_for_Tooltip(rico_fr_definition);
const dicEN_definition = readCSV_for_Tooltip(rico_en_definition);

const translations = {
  en: Object.assign(
    {},
    Object.assign({}, dicEN, dicEN_definition),
    static_translations_en
  ),
  fr: Object.assign(
    {},
    Object.assign({}, dicFR, dicFR_definition),
    static_translations_fr
  ),
};

module.exports = translations;


function readCSV(data) {
  // creer l'objetc
  //const objLanguage = new Object();
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

function readCSV_for_Tooltip(data) {
  // split data csv
  const data_clean = data.split(/\r?\n/);
  // pour chaque line on v
  const entries = new Map();
  data_clean.forEach((l) => {
    const key = l.split(",")[0] + "_tooltip";
    const value = l.split(",")[1];

    if (key !== "ricoId" && key !== "") {
      entries.set(key, value);
    }
  });
  return Object.fromEntries(entries);
}
