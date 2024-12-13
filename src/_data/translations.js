/* Fichiers de traduction de langue */
const data_fr = require("../fr/i18n")
const data_en = require("../en/i18n");


/* On appel au fontion pour generer le fichier de sortir   */
const multilangue = mergeTranslations(data_fr, data_en);
/* si on a besion de parametrer autre langue, seulement on ajout le code suivant:

const multilangue = mergeTranslations(multilangue, data_XXXXXXXXX );

*/

module.exports = multilangue

/*

Fontion pour creer une seule Object de langue 
*/
function mergeTranslations(lang1, lang2) {

    const ObjTranslations = new Object(); 
    for (key in lang1) {
      for (key2 in lang2) {
        if (key === key2) {
          const value = Object.assign({}, lang1[key], lang2[key2]);
          ObjTranslations[key] = value;
        }
      }
    }

    // 
    for (key in lang2) {
        if (!key in Object.keys(lang1)) {
          ObjTranslations[key] = lang2[key];
        }
    }

    return ObjTranslations;
}