const gStructure = require("../_includes/structure")

/* Fichiers de traduction de langue */
const data_fr = require("../fr/i18n")
const data_en = require("../en/i18n");

// Créer une estructure et returne une résultat de type objet
/*
* {input} le fichier de la langue
*/ 
const objFR = gStructure(data_fr);
const objEN = gStructure(data_en);

// Merge les objet dans une seule résultat
const multilangue = mergeTranslations(objFR, objEN);

// Ouptut Result
module.exports = multilangue;


// fonction pour merge tous les langues a utiliser 
function mergeTranslations(objFR, objEN) {
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