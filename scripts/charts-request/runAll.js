const fs = require("fs");
const path = require("path");

const agentTypes = require("./queries/agentsTypes.js");
const personOccupations = require("./queries/personOccupations.js");
const corporateBodyTypes = require("./queries/corporateBodyTypes.js");
const anfTypes = require("./queries/anfTypes.js");
const placeTypes = require("./queries/placeTypes.js");

const { runSparqlQuery } = require("./client/sparqlClient.js");
const { toChartData } = require("./client/sparqlClient.js");

const ENDPOINT =
  "https://sparql.archives-nationales.culture.gouv.fr/garance/sparql";

// dossier src/_data depuis runAll.js
const OUTPUT_DIR = path.join(__dirname, "../../src/_data/charts");

const QUERIES = [
  agentTypes,
  personOccupations,
  corporateBodyTypes,
  anfTypes,
  placeTypes,
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAll() {
  for (const q of QUERIES) {
    console.log(q.name);

    const bindings = await runSparqlQuery(ENDPOINT, q.query);
    const data = toChartData(bindings, q.labelVar, q.valueVar);

    const outputPath = path.join(OUTPUT_DIR, `${q.name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");

    console.log(outputPath);
  }
}

runAll().catch((err) => {
  console.error("Global error:", err);
});
