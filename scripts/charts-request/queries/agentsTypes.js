module.exports = {
  name: "agent_types",
  labelVar: "typelabel",
  valueVar: "count",
  query: `
PREFIX rico: <https://www.ica.org/standards/RiC/ontology#>

PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?typelabel (COUNT(DISTINCT ?agent) AS ?count)
WHERE {
  ?agent a ?type .
  FILTER (?type IN (rico:Person, rico:Family, rico:CorporateBody))
  ?type rdfs:label ?typelabel . FILTER(lang(?typelabel)="fr") .
}
GROUP BY ?typelabel 
ORDER BY DESC (?count)
`,
};
