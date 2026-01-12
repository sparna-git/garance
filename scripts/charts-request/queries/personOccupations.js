module.exports = {
  name: "person_occupations",
  labelVar: "occupationLabel",
  valueVar: "count",
  query: `
PREFIX rico: <https://www.ica.org/standards/RiC/ontology#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?occupationLabel (COUNT(?person) AS ?count)
WHERE {
  {
    SELECT ?person (SAMPLE(?rawLabel) AS ?occupation)
    WHERE {
      ?person a rico:Person .
      OPTIONAL {
        ?person rico:hasOrHadOccupationOfType ?occ .
        ?occ skos:prefLabel ?rawLabel .
        FILTER(lang(?rawLabel) = "fr")
      }
    }
    GROUP BY ?person
  }
  BIND(COALESCE(?occupation, "Non spécifié") AS ?occupationLabel)
}
GROUP BY ?occupationLabel
ORDER BY DESC(?count)
`,
};
