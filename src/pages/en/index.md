---
layout: index.njk
---

# GARANCE: National Archives of France Knowledge Graph for Research, Access, and Enriched Knowledge Navigation

Garance is **the experimental website for the dissemination, through knowledge graphs, of the reference datasets of the National Archives of France (AnF).**

These reference datasets consist of **collaboratively produced indexing vocabularies and authority records by AnF archivists**. To date, they describe approximately **18,400 agents, 54,000 places, and 3,400 concepts**, which serve as contextual entities for the archives preserved by the institution. This is **an incomplete and imperfect, yet unparalleled knowledge repository**, given the scope of AnF’s work and the expertise required to describe these entities. These datasets are of interest to a wide range of users (archivists, heritage professionals, humanities and social science researchers, engineers, etc.) and are already being used in various research projects.

However, the AnF’s information system, which manages the non-RDF source of these datasets, does not provide users with a way to access them (except for producer records, which can be searched in the [virtual reading room or SLV](https://www.siv.archives-nationales.culture.gouv.fr/siv/)), nor does it allow them to exploit their inherent nature as a **directed graph**. For example, there are numerous dated and documented relationships between the described agents, but these relationships are barely visible in the SLV and cannot be queried there.

In 2021, the AnF Lab developed, and has maintained since then on GitHub, a semantic version of these institutional reference datasets (see the repository [here](https://github.com/ArchivesNationalesFR/Referentiels)). It is currently finalizing a **version 2.0** of these datasets, **compliant with the latest version of the international Records in Contexts - Ontology ([RiC-O 1.1](https://www.ica.org/standards/RiC/ontology), released in May 2025; see also the release [here](https://github.com/ICA-EGAD/RiC-O/releases/tag/v1.1)) and with [SKOS](https://www.w3.org/2004/02/skos/). These datasets have been restructured, standardized, and transformed into a graph; they have also been enriched through various automatic or semi-automatic processes**. Notable enrichments include the creation of a vocabulary of place types and the enhancement of place reference datasets.

While a new information system, with optimized management and access features for these reference datasets is being designed and implemented, **the goal of the Garance project is to provide all users with a web-based solution for accessing these RDF datasets, thereby making them compliant with the [FAIR principles](https://www.go-fair.org/fair-principles/), while exploring new ways of navigating, searching, and consulting the data to inform the design of the future IS.**

The version of Garance you are viewing is **version 1, released in late April 2026**. The datasets it provides are constantly evolving. Version 2 will be released in autumn 2026.

For more information about the project, content, and features of Garance, please visit [this page](project).
