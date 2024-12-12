// Call framing 
const frame = require("../_includes/frame.js");
// Read Files
const TURTLE_FILE = "./src/_data/concepts/concepts_mini.ttl";
// Framing
const FRAMING_FILE_INDEX = "./src/_data/index-framing.json";
// Cache Local
const MEMORY_INDEX = "skos_index";

// Generate result
module.exports = async function () {
	const index = await frame(TURTLE_FILE, FRAMING_FILE_INDEX, MEMORY_INDEX);	
	return index
}