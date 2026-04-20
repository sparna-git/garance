---
layout: index.njk
---

# GARANCE : Graphe des Archives nationales de France pour la Recherche, l’Accès et la Navigation des Connaissances Enrichies

Garance est **le site web expérimental de diffusion, sous la forme de graphes de connaissances, des référentiels des Archives nationales de France (AnF)**.

Ces données de référence consistent en **des vocabulaires d’indexation et des notices d’autorité produits collaborativement par les archivistes des AnF**. À ce jour, elles décrivent environ **18 400 agents, 54 000 lieux et 3 400 concepts**, entités de contexte des archives conservées par l’institution. Il s’agit d’**un réservoir de connaissances incomplet et imparfait mais sans équivalent, compte tenu du domaine d’intervention des AnF et de l’expertise nécessaire pour décrire ces entités**. Ces données sont susceptibles d'intéresser de nombreux utilisateurs (archivistes, professionnels des institutions patrimoniales, chercheurs en sciences humaines et sociales, ingénieurs...) et sont déjà utilisées dans le cadre de divers projets de recherche.

Cependant le système d’information des AnF, qui permet de gérer la source non RDF de ces données, ne donne pas aux usagers le moyen d’y accéder (sauf pour les notices de producteurs, interrogeables dans [la salle de lecture virtuelle ou SLV](https://www.siv.archives-nationales.culture.gouv.fr/siv/), ni d’en exploiter la nature même qui est celle d’un **graphe orienté**. Il existe par exemple un grand nombre de relations datées et documentées entre les agents décrits, mais ces relations sont très peu visibles en SLV et n’y sont pas interrogeables.

Le Lab des AnF a réalisé en 2021, et maintient depuis cette date sur GitHub, une version sémantisée de ces référentiels institutionnels (voir le dépôt [à cette adresse](https://github.com/ArchivesNationalesFR/Referentiels)). Il finalise actuellement une version **version 2.0** de ces données, **conforme à la dernière version en date de l’ontologie internationale Records in Contexts - Ontology ([RiC-O 1.1](https://www.ica.org/standards/RiC/ontology), publiée en mai 2025 ; voir aussi la release [ici](https://github.com/ICA-EGAD/RiC-O/releases/tag/v1.1)) et à [SKOS](https://www.w3.org/2004/02/skos/). Ces données ont donc été restructurées, normalisées et transformées en graphe ; elles sont par ailleurs enrichies par divers processus automatiques ou semi-automatiques**. Parmi les enrichissements notables, mentionnons la création d’un vocabulaire des types de lieux et l’enrichissement des référentiels de lieux.

En attendant qu’un nouveau système d’information soit conçu et réalisé, incluant des fonctionnalités de gestion et d’accès optimisées pour ces données de référence, **l’objectif du projet Garance est de mettre à disposition de tous les utilisateurs une solution web d’accès à ces données RDF, en les rendant de ce fait conformes aux  [principes FAIR](https://www.go-fair.org/fair-principles/), tout en explorant de nouvelles pistes de navigation, de recherche et de consultation, afin de nourrir la réflexion sur le futur SI**. 

La version de Garance que vous consultez est la **version 1, publiée fin avril 2026**. Les données qu’elle permet de consulter sont en constante évolution. Une version 2 sera publiée à l’automne 2026.

Vous trouverez plus d’informations sur le projet, le contenu et les fonctionnalités de Garance, en consultant [cette page](project).

