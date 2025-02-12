const static_data = require("../_data/translations_static")
const rico_data = require("../_data/RicO");

const outputTranslations = Object.assign(
  {},
  static_data,
  rico_data
);

module.exports = outputTranslations;


