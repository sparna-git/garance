const { RdfParser } = require("rdf-parse");
const frame = require("../_includes/frame.js");
const fs = require("fs");


// Read Files
const TURTLE_FILE = "./src/_data/an/concepts/concepts_mini.ttl";
// Framing
const FRAMING_FILE = "./src/_data/spa-skos-framing.json";
// Cache Local
const MEMORY_SCHEME = "listOfConcepts";
// Generate result
module.exports = async function () {
	const scheme = await frame(TURTLE_FILE,FRAMING_FILE,MEMORY_SCHEME);
	const scheme_data = scheme.graph

	list_concepts = new Array();
	for (let index = 0; index < scheme_data.length; index++) {
		const element = scheme_data[index];
		concept = element.inverse_inScheme
		for (let index = 0; index < concept.length; index++) {
			const elementConcept = concept[index];
			conceptId = elementConcept.id.split(":")[1]			
			labels = elementConcept.prefLabel
			for (let index = 0; index < labels.length; index++) {
				const label = labels[index];
				var concepList = {};
				const Title = label["@value"]
				const Language  = label["@language"]				
				concepList["label"] = Title.concat(' (',Language,') [',conceptId,']')
				concepList["value"] = conceptId
				list_concepts.push(concepList);			
			}

			/* get all altLabels  */
			if (elementConcept.altLabel) {
				altlabels = elementConcept.altLabel
				for (let index = 0; index < altlabels.length; index++) {
					const altlabel = altlabels[index];
					var concepList = {};
					const Title = altlabel["@value"]
					const Language  = altlabel["@language"]				
					concepList["label"] = Title.concat(' (',Language,') [',conceptId,']')
					concepList["value"] = conceptId
					list_concepts.push(concepList);			
				}
			}			
			
		}
	}
    // output list
	return list_concepts;
}