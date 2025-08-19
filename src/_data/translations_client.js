const static_translations_fr = require("../_data/i18n/fr/garance");
const static_translations_en = require("../_data/i18n/en/garance");
const fs = require("fs"); //


// appelle les fichiers csv
const file_rico_fr = "./src/_data/i18n/fr/rico.csv";
const file_rico_en = "./src/_data/i18n/en/rico.csv";
const rico_fr = fs.readFileSync(file_rico_fr, { encoding: "utf-8", flag: "r" });
const rico_en = fs.readFileSync(file_rico_en, { encoding: "utf-8", flag: "r" });

const file_anfonto_fr = "./src/_data/i18n/fr/anf-onto.csv";
const file_anfonto_en = "./src/_data/i18n/en/anf-onto.csv";
const anfonto_fr = fs.readFileSync(file_anfonto_fr, { encoding: "utf-8", flag: "r" });
const anfonto_en = fs.readFileSync(file_anfonto_en, { encoding: "utf-8", flag: "r" });

const file_otheronto_fr = "./src/_data/i18n/fr/other-ontologies.csv";
const file_otheronto_en = "./src/_data/i18n/en/other-ontologies.csv";
const otheronto_fr = fs.readFileSync(file_otheronto_fr, { encoding: "utf-8", flag: "r" });
const otheronto_en = fs.readFileSync(file_otheronto_en, { encoding: "utf-8", flag: "r" });

const file_rico_fr_definition = "./src/_data/i18n/fr/definition.csv";
const file_rico_en_definition = "./src/_data/i18n/en/definition.csv";
const rico_fr_definition = fs.readFileSync(file_rico_fr_definition, { encoding: "utf-8", flag: "r" });
const rico_en_definition = fs.readFileSync(file_rico_en_definition, { encoding: "utf-8", flag: "r" });

const translations = {
  en: Object.assign(
    {},
    readCSV(rico_en),
    readCSV(anfonto_en),
    readCSV(otheronto_en),
    readCSV_for_Tooltip(rico_en_definition),
    static_translations_en
  ),
  fr: Object.assign(
    {},
    readCSV(rico_fr),
    readCSV(anfonto_fr),
    readCSV(otheronto_fr),
    readCSV_for_Tooltip(rico_fr_definition),
    static_translations_fr
  ),
};

module.exports = translations;

// fonction pour lire les données d'un fichier csv et retourner une estructure de dictionaire
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
    entries.set(key,value);
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
    entries.set(key,value);
  });
  return Object.fromEntries(entries);
}
