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

module.exports = async function (dirRdfPath, framingSpecPath, MEMORYKEY) {
  // first look if there is something in the cache
  // Pass in your unique custom cache key
  let assetCache = new AssetCache(MEMORYKEY);
  // check if the cache is fresh within the last day
  if (assetCache.isCacheValid("1d")) {
    // return cached data.
    return assetCache.getCachedValue(); // a promise
  }
  // nothing in cache, concat the RDF files and apply framing

  let framingSpec = fs.readFileSync(framingSpecPath, {
    ncoding: "utf8",
    flag: "r",
  });

  // lire le directory
  const list_files = fs.readdirSync(dirRdfPath);

  // string nQuad finale concaténant le contenu de tous les fichiers
  let nQuadsString_output = "";

  // pour chaque fichier dans le répertoire ...
  for (f of list_files) {
    path_file = dirRdfPath + "/" + f;
    // si l'extension est .rdf ...
    if (path.extname(f) === ".rdf") {
      // read file
      let inputRDF = fs.readFileSync(path_file, {
        encoding: "utf8",
        flag: "r",
      });
      const streamRDF = stringToStream(inputRDF);

      // We convert the RDF to an N-Quads string.
      const quadStream = rdfParser.parse(streamRDF, {
        contentType: "application/rdf+xml",
        baseIRI: "http://example.org",
      });
      const textStream = rdfSerializer.serialize(quadStream, {
        contentType: "application/n-quads",
      });
      const nQuadsString = await streamToString(textStream);

      // concat into final BIG n-quads string
      nQuadsString_output += nQuadsString;
    }
  }

  // We convert the RDF JSON-LD, which is JSON with semantics embedded.
  const doc = await jsonld.fromRDF(nQuadsString_output, {
    format: "application/n-quads",
  });

  // We use the frame and the JSON-LD generated earlier to generate a new JSON-LD document based on the frame.
  /* Write jsonld file   
	fs.writeFile('vocabularies_performing_arts.jsonld',JSON.stringify(doc),err => {
		if (err) {
			console.log(err);
		} else {
			console.log('ok');
		}
	});
  */
  const framed = await jsonld.frame(doc, JSON.parse(framingSpec));

  // ********************** Cache local **********************
  let JsonResult = framed;
  // do some expensive operation here, this is simplified for brevity
  await assetCache.save(JsonResult, "json");

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