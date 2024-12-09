//npm install jsonld
const jsonld = require("jsonld");
// npm install rdf-parse
const rdfParser = require("rdf-parse").default;
// npm install rdf-serialize
const rdfSerializer = require("rdf-serialize").default;
// endpoint
const stringToStream = require('streamify-string')

const fs = require("fs");

const { AssetCache } = require("@11ty/eleventy-fetch");
const { resolve } = require("path");

AssetCache.concurrency = 4;

module.exports = async function (inputRdfPath,inputFramingPath, MEMORYKEY) {

	let inputRDF = fs.readFileSync(inputRdfPath,{ encoding: 'utf8', flag: 'r' });
	let inputFRAMING = fs.readFileSync(inputFramingPath,{ encoding: 'utf8', flag: 'r' });
	
	// ********************** Process for convert a turtle file to JSON Framing **********************
	const stream = stringToStream(inputRDF);
	// We convert the RDF to an N-Quads string.
	const quadStream = rdfParser.parse(require('streamify-string')(inputRDF), {contentType: 'text/turtle', baseIRI: 'http://example.org'})
	const textStream = rdfSerializer.serialize(quadStream, { contentType: 'application/n-quads' });
	const nQuadsString = await streamToString(textStream);
	
	// We convert the RDF JSON-LD, which is JSON with semantics embedded.
	const doc = await jsonld.fromRDF(nQuadsString, {format: 'application/n-quads'});
	//console.log(framed)
	// Write jsonld file  
	fs.writeFile('an_concepts.jsonld',JSON.stringify(doc),err => {
		if (err) {
			console.log(err);
		} else {
			console.log('ok');
		}
	});
	
	
	// We use the frame and the JSON-LD generated earlier to generate a new JSON-LD document based on the frame.
	const framed = await jsonld.frame(doc, JSON.parse(inputFRAMING));
	
	// ********************** Cache local **********************

	// Pass in your unique custom cache key
	let asset = new AssetCache(MEMORYKEY)
	//console.log(asset)

	// check if the cache is fresh within the last day
	if (asset.isCacheValid("1d")) {
		// return cached data.
		return asset.getCachedValue(); // a promise
	}
	let JsonResult = framed;
	// do some expensive operation here, this is simplified for brevity
	await asset.save(JsonResult, "json");
	
	//console.log("JSON Result")
	//console.log(JSON.stringify(JsonResult))
	return JsonResult
}

/**
 * This function turns a stream into a string.
 * @param stream -  The stream that needs to be turned into a string.
 * @returns {Promise<unknown>}
 */
function streamToString (stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
	stream
		.on('data', chunk => chunks.push(Buffer.from(chunk)))
    .on('error', reject)
		.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}
