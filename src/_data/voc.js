// Call framing 
const frame = require("../_includes/frame.js");

// Read Files
const TURTLE_FILE = "./src/_data/concepts/concepts_mini.ttl";
// Framing
const FRAMING_FILE_VOC = "./src/_data/voc-framing.json";
// Cache Local
const MEMORY_VOC = "skos_vocabulary";

// Generate result
module.exports = async function () {

	const voc = await frame(TURTLE_FILE, FRAMING_FILE_VOC, MEMORY_VOC);	
	return voc;
}