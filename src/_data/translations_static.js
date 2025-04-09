/* Fichiers de traduction de langue */
const data_fr = require("../_data/i18n/fr/garance");
const data_en = require("../_data/i18n/en/garance");

// input : { "key": "translation" }
// output : { "key": { "en" : "translation" }}
const objFR = Object.fromEntries(Object.entries(data_fr).map(([k, v]) => [k, { "fr": v }]))
const objEN = Object.fromEntries(Object.entries(data_en).map(([k, v]) => [k, { "en": v }]))

// Merge les objets dans une seule résultat
const multilangue = Object.fromEntries(Object.keys(objEN).map(key => 
  [key, { fr: objFR[key], en: objEN[key] }]
));

// output result
module.exports = multilangue;
