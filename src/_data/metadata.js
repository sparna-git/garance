const frame = require("../_includes/frame.js");

// Read Files
const TURTLE_FILE = "./src/_data/an/concepts/concepts_mini.ttl";
// Framing
const FRAMING_FILE_CATEGORIES = "./src/_data/spa-categories-framing.json";
const FRAMING_FILE_CONCEPTS = "./src/_data/spa-categories-framing.json";
const FRAMING_FILE = "./src/_data/spa-skos-framing.json";
// Cache Local
const MEMORY_SCHEME = "skos_vocabulary";
const MEMORY_CATEGORIES = "categories";
const MEMORY_CONCEPTS = "concepts";

// Generate result
module.exports = async function () {

	const categories = await frame(TURTLE_FILE,FRAMING_FILE_CATEGORIES,MEMORY_CATEGORIES);
	const scheme = await frame(TURTLE_FILE,FRAMING_FILE,MEMORY_SCHEME);
	const concepts = await frame(TURTLE_FILE,FRAMING_FILE_CONCEPTS,MEMORY_CONCEPTS);
	
	return { 
		"categories" : categories,
		"concepts" : concepts,
		"scheme" : scheme
	};
}
