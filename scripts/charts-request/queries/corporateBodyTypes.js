module.exports = {
  name: "corporatebody_types",
  labelVar: "label",
  valueVar: "count",
  query: `
PREFIX rico: <https://www.ica.org/standards/RiC/ontology#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?label (COUNT(?cb) AS ?count)
WHERE {
  {
    SELECT ?cb (SAMPLE(?rawLabel) AS ?typeLabel)
    WHERE {
      ?cb a rico:CorporateBody .
      OPTIONAL {
        ?cb rico:hasOrHadCorporateBodyType ?type .
        ?type skos:prefLabel ?rawLabel .
        FILTER(lang(?rawLabel) = "fr")
      }
    }
    GROUP BY ?cb
  }
  BIND(COALESCE(?typeLabel, "Non spécifié") AS ?label)
}
GROUP BY ?label
ORDER BY DESC(?count)
`,
};
