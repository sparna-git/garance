// Directories
const fs = require("fs");
// npm i glob
const { glob } = require("glob");
const stringToStream = require("streamify-string");
//npm install rdf-parse
const { rdfParser } = require("rdf-parse");
// npm install rdf-serialize
const { rdfSerializer } = require("rdf-serialize");
//npm install jsonld
const jsonld = require("jsonld");

const { resolve } = require("path");
const path = require("path");

let readJsonLDfromDirectory = async function (PathDirectory, filePath) {
  // Get all files in directory root of resources
  const listFiles = await getDirectoriesFiles(PathDirectory);
  // joint in only json ld
  console.log("Process JSON-LD");
  const JSONLD_Result = [];
  for (let index = 0; index < listFiles.length; index++) {
    const f = listFiles[index];
    if (path.extname(f) === ".rdf" || path.extname(f) === ".ttl") {
      console.log("Fichier: " + f);

      // read file
      let inputRDF = fs.readFileSync(f, { encoding: "utf8", flag: "r" });
      const streamRDF = stringToStream(inputRDF);

      // We convert the RDF to an N-Quads string.
      var quadStream;
      if (path.extname(f) === ".rdf") {
        quadStream = rdfParser.parse(streamRDF, {
          contentType: "application/rdf+xml",
          baseIRI: "http://example.org",
        });
      } else if (path.extname(f) === ".ttl") {
        quadStream = rdfParser.parse(streamRDF, {
          contentType: "text/turtle",
          baseIRI: "http://example.org",
        });
      }
      const textStream = rdfSerializer.serialize(quadStream, {
        contentType: "application/n-quads",
      });
      // Convert string to n-quads
      const nQuadsString = await streamToString(textStream);

      // Convert n-quads to Json LD
      const doc = await jsonld.fromRDF(nQuadsString, {
        format: "application/n-quads",
      });
      JSONLD_Result.push(doc);
    }
  }

  fs.writeFile(filePath, JSON.stringify(JSONLD_Result, null, 2), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("ok");
    }
  });
};

/**
 * This function turns a stream into a string.
 * @param stream -  The stream that needs to be turned into a string.
 * @returns {Promise<unknown>}
 */
async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream
      .on("data", (chunk) => chunks.push(Buffer.from(chunk)))
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

function getDirectoriesFiles(src) {
  return glob.sync(src + "/**/*");
}

(async () => {
  console.log("Reading " + process.argv[2] + "...");
  await readJsonLDfromDirectory(process.argv[2], process.argv[3]);
})()