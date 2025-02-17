// Call framing 
const frame = require("../_includes/frame.js");
// Read Files
const TURTLE_FILE = "./src/_data/concepts";
// Framing
const FRAMING_FILE_INDEX = "./src/_data/framings/index-framing.json";
// Cache Local
const CACHE_KEY = "index";

// Generate result
module.exports = async function () {
	const index = await frame(TURTLE_FILE, FRAMING_FILE_INDEX, CACHE_KEY);	
	return index
}