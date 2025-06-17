---
layout: index.njk
---

# GARANCE: Graphe des Archives nationales de France pour la Recherche, l’Accès et la Navigation des Connaissances Enrichies

Garance is the dissemination website, in the form of RDF data graphs, of the authority records and vocabularies of the Archives nationales de France (AnF).

To date, these vocabularies and authority records, which are produced collaboratively by AnF archivists, describe approximately 18,700 agents, 58,000 places, and 3,400 concepts, contextual entities of the records held by the institution. It is an incomplete and imperfect but unparalleled reservoir of knowledge, given the AnF’s field of intervention and the expertise required to describe these entities.

![Overall statistics, in the form of a pie chart, on the AnF vocabularies and authority records in January 2025: approximately 18,700 agents, 58,000 places, and 3,400 concepts!](../../assets/images/stats_en_small.png "Authority records and vocabularies at the AnF in January 2025: global overview")

In 2021, the AnF Lab created, and from this date it has maintained on GitHub, a semanticized version of these institutional datasets, compliant with SKOS and the [Records in Contexts Ontology (RiC-O)](https://www.ica.org/standards/RiC/ontology). It recently published version 2.0 of this data (link). This version results from the semantization, in accordance with the latest version of RiC-O, RiC-O 1.1 (released in May 2025; see the release [here](https://github.com/ICA-EGAD/RiC-O/releases/tag/v1.1)), and [SKOS](https://www.w3.org/2001/sw/wiki/SKOS), of these reference data and its enrichment through automated processes. Notable enhancements include the creation of a vocabulary of place types and the enrichment of the descriptions of places.

The AnF information system, which manages the non-RDF source of this data, does not provide users with the means to access it (except for producer records, which can be searched in [the virtual reading room or SLV](https://www.siv.archives-nationales.culture.gouv.fr/siv/), nor to exploit its very nature, which is that of a directed graph. For example, there are a large number of dated and documented relationships between the agents described, but these relationships are very little visible in the SLV and cannot be searched there.

While waiting for a new information system to be designed and implemented, including optimized management and access functionalities for this reference data, **the objective of the Garance project is to provide all users with a web solution for accessing this data, while exploring new avenues of navigation, research and consultation, in order to fuel thinking about the future IS**.
