// Call framing 
const frame = require("../_includes/frame.js");

// Read Files
const TURTLE_FILE = "./src/_data/concepts";
// Framing
const FRAMING_FILE_VOC = "./src/_data/framings/vocabularies-framing.json";
// Cache Local
const CACHE_KEY = "vocabularies";

// Generate result
module.exports = async function () {

	const voc = await frame(TURTLE_FILE, FRAMING_FILE_VOC, CACHE_KEY);	
	return voc;
}