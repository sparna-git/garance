async function runSparqlQuery(endpoint, query) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      Accept: "application/sparql-results+json",
    },
    body: query,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`SPARQL ${response.status}: ${text.slice(0, 200)}`);
  }

  const json = JSON.parse(text);

  if (!json.results || !json.results.bindings) {
    throw new Error("Invalid SPARQL JSON results");
  }

  return json.results.bindings;
}

function toChartData(bindings, labelVar, valueVar) {
  return {
    labels: bindings.map((b) => b[labelVar]?.value ?? "Non spécifié"),
    values: bindings.map((b) => Number(b[valueVar]?.value ?? 0)),
  };
}

module.exports = { runSparqlQuery, toChartData };
