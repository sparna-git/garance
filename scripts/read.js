// Directories
const fs = require('fs');
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
  const originalListOfFiles = await getDirectoriesFiles(PathDirectory);

  const listFiles = originalListOfFiles.filter(f => {
    const ext = path.extname(f);
    return ext === ".rdf" || ext === ".ttl";
  });

  // joint in only json ld
  const JSONLD_Result = [];
  
  const startTime = Date.now();
  for (let index = 0; index < listFiles.length; index++) {
    const f = listFiles[index];
    try {
      if(((index) % 100) == 0) {
        let elapsedTime = (Date.now() - startTime) / 1000;
        console.log(index + "/" + listFiles.length + " files. Elapsed time : " + elapsedTime + "s");
      }

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
    } catch (error) {
      console.error(`Error processing file ${f}:`, error);
    }
  } // end for
  let elapsedTime = (Date.now() - startTime) / 1000;
  console.log("Read a total of " + listFiles.length + " files in " + elapsedTime + "s");

  const startTimeCompact = Date.now();
  console.log("Compact with context : src/_data/context.json ...");
  let context = JSON.parse(fs.readFileSync("src/_data/context.json", { encoding: "utf8", flag: "r" }));
  const compactedJsonLdResult = await jsonld.compact(JSONLD_Result, context)
  console.log("Done compact in "+((Date.now() - startTimeCompact) / 1000)+"s");

  console.log("Writing compacted file to : "+filePath);
  /*
  fs.writeFile(filePath, JSON.stringify(compactedJsonLdResult, null, 2), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("ok");
    }
  });
  */
  writeLargeJsonFile(filePath, compactedJsonLdResult);
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

// Custom function to write large JSON objects with chunked arrays
function writeLargeJsonFile(filePath, jsonObject) {
  const stream = fs.createWriteStream(filePath, { encoding: "utf8" });
  stream.write('{\n');
  const keys = Object.keys(jsonObject);
  keys.forEach((key, idx) => {
    stream.write(`"${key}": `);
    const value = jsonObject[key];
    if (Array.isArray(value)) {
      stream.write('[');
      for (let i = 0; i < value.length; i += 1000) {
        const chunk = value.slice(i, i + 1000);
        console.log(`Writing chunk ${i / 1000 + 1} for property "${key}" (${chunk.length} items)`);
        stream.write(JSON.stringify(chunk, null, 2).slice(1, -1)); // remove [ and ]
        if (i + 1000 < value.length) stream.write(',');
      }
      stream.write(']');
    } else if (typeof value === 'object' && value !== null) {
      stream.write(JSON.stringify(value, null, 2));
    } else {
      stream.write(JSON.stringify(value));
    }
    if (idx < keys.length - 1) stream.write(',\n');
  });
  stream.write('\n}');
  stream.end();
  stream.on('finish', () => {
    console.log('Done writing !');
  });
  stream.on('error', (err) => {
    console.error(err);
  });
}


(async () => {
  console.log("Reading " + process.argv[2] + "...");
  await readJsonLDfromDirectory(process.argv[2], "_json/garance.json");
})()