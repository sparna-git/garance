// Fontion pour generer les estructure { [key]: { [locale]: 'String' } }
module.exports = function generate_structure(objLangue) {
  const ObjTranslations = new Object();
  // get key Id
  const key_lang = Object.keys(objLangue);
  //
  for (const [key, value] of Object.entries(objLangue[key_lang])) {
    ObjTranslations[key] = { [key_lang]: value };
  }
  return ObjTranslations;
};
