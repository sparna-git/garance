// Call framing 
const frame = require("../_includes/frame.js");

// Read Files
const TURTLE_FILE = "./src/_data/agents/collectivites";
// Framing
const FRAMING_FILE_VOC = "./src/_data/framings/agents/agents-framing.json";
// Cache Local
const MEMORY_VOC = "rico_collectivites";

// Generate result
module.exports = async function () {
    return await frame(TURTLE_FILE, FRAMING_FILE_VOC, MEMORY_VOC);	
}