---
layout: project.njk
---

# The Project

*Note: The content of this page will be updated in the coming weeks.*

## Issues and Objectives

The objectives of the project are as follows:

- Make reference data produced over decades of effort accessible to both humans and machines, and highlight the expertise of the AnF on the described entities (for example, in the history of central administrations from the Middle Ages to the present day);
- Reveal the underlying graph by semantically enriching the data, in order to obtain, from a collection of XML files conforming to several different models, a unified knowledge graph linking the described entities.

The chart below provides an overview of the distribution of descriptions in the initial collection of files, by type of notice and then by type of entity.

![Global statistics, in the form of a pie chart, on the AnF reference data as of January 2025: approximately 18,700 agents, 58,000 places, and 3,400 concepts!](../../../assets/images/stats_en_small.png "Statistics on AnF referentials as of January 2025")

The table below presents statistics on the number of relationships existing between archival creators records in the source files, relationships that are currently not searchable via the AnF Virtual Reading Room (SLV).

![Statistics table on the relationships between archival creators in source files as of January 2025](../../../assets/images/tableau_garance_en.png "Number of relationships between the authority records of archival creators in the source files in January 2025")

- Make this graph compliant with international standards adapted to the nature of the data (mainly [RiC-O 1.1](https://www.ica.org/standards/RiC/ontology) and [SKOS](https://www.w3.org/2004/02/skos/)) and allow for the future evolution of this data and its linking with other datasets (or vice versa);
- Improve data quality by correcting certain defects, optimizing and enriching existing data, and adding new entities;
- Provide an intuitive, responsive, and efficient consultation interface, adapted to the nature of the data (a knowledge graph) and its content, with multiple access devices and powerful search tools for both human and machine users; we wanted this to be achieved by prioritizing a simple architecture, as lean as possible, ease of deployment, and open-source tools and technical standards;
- Explore avenues for the future of the AnF information system, whether in terms of the reference data itself or the functionalities of this system.

## Development of Garance

### Content Production

Below is some information about the process followed for the production of version 2.0 of the semantized reference data. The work was carried out by the Lab in several phases and iterations, based on source data exported from the AnF information system (SIA) in January 2025, following automated processes often associated with manual correction work.

---

#### URIs of Entities

The URIs of entities (agents, concepts, and places) are formed as follows, in accordance with an approach chosen several years ago:
- An invariant segment: `https://rdf.archives-nationales.culture.gouv.fr/`
- Followed by the lowercase name of the reference RiC-O class and a slash (for example `agent/` or `place/`)
- Followed by a string constructed from the entity's unique local identifier in the SIA, or, in the rare cases where the entity was added, an identifier created from the entity's preferred name in French.

---

#### Production of Controlled Vocabularies

With the exception of the vocabulary of document types (split into three RDF files), one RDF/XML file was generated per source vocabulary from the SIA. The structure of this file complies with the [SKOS](https://www.w3.org/2004/02/skos/) model (and thus ISO 25964). Furthermore, each of the concepts (`skos:Concept`) defined in these vocabularies is also defined as an instance of a class in the RiC-O 1.1 ontology.

The data initially stored in some XML elements of a DTD specific to the AnF were restructured to distinguish labels, definitions, application notes, semantic relationships, alignments, and management information. In some cases (notably for the vocabulary of types of corporate bodies), content also produced by the AnF and stored externally was aggregated into the vocabularies.

Precise metadata was added to each vocabulary (`skos:ConceptScheme`). A few new concepts were added to those that already existed. A new controlled vocabulary, that of place types, which was essential for categorizing all the described places, was also fully produced in RDF (it has no current equivalent in the SIA). All concepts thus added to those existing in the SIA are qualified as candidates. Examples were added in some vocabularies.

Finally, to facilitate certain reuses, a CSV file containing all the data stored in the vocabulary was generated from each of the SKOS files produced and is downloadable from GitHub or from the Garance vocabulary pages.

---

#### Production of Agent Records

The approximately 16,000 records abour archival creators from the AnF were converted into as many RDF/XML files compliant with RiC-O 1.1, using [version 3 of the RiC-O Converter software](https://github.com/ArchivesNationalesFR/rico-converter/releases/tag/3.0.0) and in accordance with its specifications. Some post-processing was then carried out.

Each of the small records contained in the two so-called indexing reference data of persons and corporate bodies was converted into an RDF/XML file compliant with the same ontology and having the same structure, making the best use of the conventions followed by the AnF for data entry (distinction of historical information, existence dates, equivalence relationships, source mentions, and management metadata).

The resulting records were then reconciled and deduplicated. In total, the content of 255 RDF files from as many indexing records was merged with the creator records, and these RDF files were then deleted. The identifier of the indexing record is preserved in the resulting RDF file. Finally, the RDF files were enriched with more than 4,000 equivalence relationships with Wikidata entities and more than 1,200 links to Wikipedia pages, based on the work carried out by the AnF archivists during a workshop held in December 2025.

---

#### Production of Place Records

An XML/RDF file was produced from each of the records contained in the 8 source XML files (except for the records of French 'arrondissements' and 'cantons', which were left aside for the time being).

With regard to French 'régions', 'départements', and 'communes' (contemporary French administrative districts), alignment work was carried out in 2021, on the one hand with INSEE RDF data (which made it possible to recover historical information in particular), and on the other hand with IGN RDF data—provided at the time by Nathalie Abadie from LASTIG, whom we thank. This latter alignment made it possible to recover, in particular, the geographic coordinates (polygons) of places and the adjacency relationships between districts. Partitive relationships (such as the location of a 'commune' within a 'département') were made explicit.

For all other places except those located in Paris (foreign countries and territories, natural geographical places, infrastructures and buildings, localities), and for the 1,492 buildings located in Paris, the content of the small source records was processed to identify and restructure dating information, descriptions, and, where present, alignment relationships with external reference data (mainly Geonames and Wikidata), information sources, and management metadata.

For the districts, neighborhoods, and parishes of Paris and the 'communes' attached to Paris in the 19th century, the initial nomenclature was manually enriched based on generalist information sources (mainly Wikipédia). Relationships between neighborhoods and districts were also added, as well as relationships specifying the partial or total absorption of a commune's territory into a district or Parisian neighborhood.

For the streets of Paris, the project made it possible, through several steps and iterations including reconciliation and modeling work, to move from a simple nomenclature of 13,189 names to a often much more precise description of each street. The names in the AnF reference data were aligned with the names in the nomenclature of current and obsolete streets in Paris published as open data by the City of Paris (2023 version). The data from this nomenclature was then incorporated into the AnF dataset in the form of information restructured in accordance with RiC-O: history, road management events affecting the street, dimensions, geographic coordinates (notably polygons), indications of the neighborhoods and districts crossed, and the start and end points of the street. The type of street was added using the vocabulary of place types.

For all places, preferred denominations were, as far as possible, brought into compliance with the rules set out by the [RDA-FR code](https://code.rdafr.fr/entite/lieu/), the French transposition of the RDA (Resource Description and Access) standard for cataloging library resources. Finally, all places were categorized using a place type found in the AnF place type vocabulary.

---

#### Towards a version 2.0 of the dataset

Version 2.0 of the resulting graph is being finalized. Some work is still ongoing, particularly concerning the standardization of place names in Paris and their categorization. All the files are already available on [GitHub](https://github.com/ArchivesNationalesFR/Referentiels). Furthermore, each of the source RDF files for the Garance pages can be downloaded from this page.

**A complete and consistent release will be published on GitHub before mid-June 2026, and its content will of course be made accessible via Garance at the same time.**

In addition, for the needs of the project (particularly for the description of agents and Paris streets) and other projects, a small extension of the RiC-O 1.1 ontology was developed (see[ here](https://github.com/ArchivesNationalesFR/ontology)), whose version 1.0 will be published in June 2026.

---



### Design and Implementation of the Garance Application and its Web Interface

The development of the Garance application was entrusted to the company Sparna, with whom the AnF has been working on various projects for several years and whom we thank here. An agile approach is followed for all the work. The version of Garance currently available on the web is version 1.
The QLever triplestore was deployed and is maintained by the company Zazuko GmbH, whom we also thank.



#### Technical Architecture

The current technical architecture of Garance includes:
- scripts that, from the approximately 70,000 RDF files in the GitHub repository of the semantized reference data, produce JSON files conforming to three framing specifications written in the [JSON-LD framing](https://www.w3.org/TR/json-ld11-framing/) language;
- a static website generator, [Eleventy](https://www.11ty.dev/), which produces, from the JSON files, as many static pages as there are vocabularies, place records, and agent records, and also produces the editorial static pages of the website, from easy-to-edit Markdown files;
- an index of the HTML page content, configured and produced with the [PageFind](https://pagefind.app/) software;
- a triplestore, specifically an instance of the open-source [QLever](https://github.com/ad-freiburg/qlever) software, recently developed in Switzerland, whose qualities the Lab was able to verify by testing it on its RDF datasets. In particular, we were able to verify QLever's speed in executing imports and indexing, as well as in executing SPARQL queries.

![Garance technical architecture: process of transforming RDF data and generating the website](../../../assets/images/architecture_garance_en.png "Garance Technical Architecture")

The source code of Garance is available [here](https://github.com/sparna-git/garance).


---

#### Features

Version 1 of Garance currently offers, through an interface available in French and English, various features accessible via the horizontal menu present on all pages:

- Through the **Auhority Records and Vocabularies** item, direct access to the data:
  - via the **Controlled Vocabularies** item, access to each of the 13 controlled vocabularies;
  - via the **Agents** or **Places** item:
    - when clicking directly on the item, access to a general presentation page of the records, including some diagrams and a list of examples;
    - when choosing the **"Alphabetical index"** sub-item, access to a complete alphabetical list of agents or places, sorted by the preferred names of the entities;

- Through the **Search** item, a page allowing for quick searches within the page content using an index built with PageFind, configured to adapt to the structure and nature of the available data. The search results show the word or phrase entered in context. Once an initial search is performed, the left column allows you to display and select or unselect various filters (such as place type or corporate body type) to narrow down the search scope.

- Through the **SPARQL Access** item, a page that provides useful links for users wishing to either query the SPARQL service remotely via a third-party application or directly query the SPARQL endpoint via a query entry interface in this language.

Each entity page has a structure defined by a specification file specific to the type of entity (agent, place, or concept). Special care was taken in the design and organization of these pages. Vocabularies are displayed as an expandable diagram. It is also possible to copy/paste an entity's URI, download the RDF file describing the agent, place, or controlled vocabulary, as well as CSV files (for controlled vocabularies) or XML/EAC-CPF files (for agent records derived from AnF creator records).


---

## Project Roadmap for 2026

Below are some non-exhaustive information about the Garance project roadmap.

**Before mid-June 2026**

- **Publication on Github and in Garance of the release of version 2 of the reference data**, including notably, in addition to what is already available, significantly enriched versions of the vocabularies of documentary form types and record set types, and, likely, the addition in each RDF file of a property specifying a quality score calculated from the file's content.
- **Integration into the interface of technical documentation on the profile of the data contained in Garance (SHACL profiles)**.

**Before the end of 2026**

- **Update of Garance content** from a recent version of the source files, which are continuously enriched by AnF archivists (particularly concerning the records on archival creators).
- Within the limits of available time, **update work on data regarding French administrative districts and alignment of places with external datasets** (in order to enrich RDF files with historical information, temporal relationships, and geographic coordinates).
- Within the limits of available time, bring the preferred names of agents into compliance with the RDA-FR standard.
- **Integration into the Garance interface of an advanced search feature**, allowing any interested user to build SPARQL queries by exploring the graph, without knowing the data model used or the SPARQL language, using the latest version of the [Sparnatural](https://sparnatural.eu/) tool.


---

## Bibliography

The project was briefly presented at the SemWeb.Pro 2025 annual conference, at the end of November 2025 in Paris. You can find the poster and the video recording of the presentation [here](https://semweb.pro/conference/2025/presentation/clavaud-archives-garance/).

