const frame = require("../_includes/frame.js");

// Read Files
const TURTLE_FILE = "./src/_data/concepts/concepts_mini.ttl";
// Framing
const FRAMING_FILE_INDEX = "./src/_data/index-framing.json";
const FRAMING_FILE_VOC = "./src/_data/voc-framing.json";

// Cache Local
const MEMORY_VOC = "skos_vocabulary";
const MEMORY_INDEX = "categories";

// Generate result
module.exports = async function () {

	const index = await frame(TURTLE_FILE, FRAMING_FILE_INDEX, MEMORY_INDEX);
	const voc = await frame(TURTLE_FILE, FRAMING_FILE_VOC, MEMORY_VOC);
	
	return { 
		"index" : index,
		"voc" : voc
	};
}
