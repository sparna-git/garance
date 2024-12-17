// read files
const fs = require("fs");// 
const stringToStream = require("streamify-string");
//
const { rdfParser } = require("rdf-parse");
// npm install rdf-serialize
const { rdfSerializer } = require("rdf-serialize");
//npm install jsonld
const jsonld = require("jsonld");

const { AssetCache } = require("@11ty/eleventy-fetch");
const { resolve } = require("path");
const path = require("path");

module.exports = async function (dirRdfPath, inputFramingPath, MEMORYKEY) {
  let inputFRAMING = fs.readFileSync(inputFramingPath, {ncoding: "utf8", flag: "r"});

  // lire directory
  const list_files = fs.readdirSync(dirRdfPath);
  // récupérer le resultat dans une seule string
  let nQuadsString_output = "";
  for (f of list_files) {
    path_file = dirRdfPath + "/" + f;
    if (path.extname(f) === ".rdf") {
      // read file
      let inputRDF = fs.readFileSync(path_file, {encoding: "utf8",flag: "r"});
      const streamRDF = stringToStream(inputRDF);

      // We convert the RDF to an N-Quads string.
      const quadStream = rdfParser.parse(streamRDF, {contentType: "application/rdf+xml",baseIRI: "http://example.org"});
      const textStream = rdfSerializer.serialize(quadStream, {contentType: "application/n-quads"});
      const nQuadsString = await streamToString(textStream);
      nQuadsString_output += nQuadsString;
    }
  }
  // We convert the RDF JSON-LD, which is JSON with semantics embedded.
  const doc = await jsonld.fromRDF(nQuadsString_output, {format: "application/n-quads"});
  // We use the frame and the JSON-LD generated earlier to generate a new JSON-LD document based on the frame.
  const framed = await jsonld.frame(doc, JSON.parse(inputFRAMING));

  // ********************** Cache local **********************
  // Pass in your unique custom cache key
  let asset = new AssetCache(MEMORYKEY);
  // check if the cache is fresh within the last day
  if (asset.isCacheValid("1d")) {
    // return cached data.
    return asset.getCachedValue(); // a promise
  }
  let JsonResult = framed;
  // do some expensive operation here, this is simplified for brevity
  await asset.save(JsonResult, "json");

  return JsonResult;
}

/**
 * This function turns a stream into a string.
 * @param stream -  The stream that needs to be turned into a string.
 * @returns {Promise<unknown>}
 */
async function streamToString (stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
	stream
		.on('data', chunk => chunks.push(Buffer.from(chunk)))
    .on('error', reject)
		.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}