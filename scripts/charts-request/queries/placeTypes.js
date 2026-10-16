module.exports = {
  name: "place_types",
  labelVar: "finalPlaceTypeLabel",
  valueVar: "count",
  query: `
PREFIX rico: <https://www.ica.org/standards/RiC/ontology#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?finalPlaceTypeLabel (COUNT(?place) AS ?count)
WHERE {
  {
    SELECT ?place (SAMPLE(?rawLabel) AS ?placeTypeLabel)
    WHERE {
      ?place a rico:Place .
      FILTER (isIRI(?place))
      FILTER (strstarts(str(?place), "https://rdf.archives-nationales.culture.gouv.fr/place/FRAN_RI"))
      OPTIONAL {
        ?place rico:hasOrHadPlaceType ?placeType .
        ?placeType skos:prefLabel ?rawLabel .
        FILTER(lang(?rawLabel) = "fr")
      }
    }
    GROUP BY ?place
  }
  BIND(COALESCE(?placeTypeLabel, "Non spécifié") AS ?finalPlaceTypeLabel)
}
GROUP BY ?finalPlaceTypeLabel
ORDER BY DESC(?count)
`,
};
