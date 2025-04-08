# GARANCE

*G*raphe des *A*rchives nationales pour la *R*echerche, l'*A*ccès et la *N*avigation des *C*onnaissances *E*nrichies

Mise en ligne sous forme de site statique des données des référentiels des Archives Nationales publiées dans le dépôt https://github.com/ArchivesNationalesFR/Referentiels.
Utilise [11ty]([url](https://www.11ty.dev/)) comme outil de génération de site, et du [JSON-LD framing]([url](https://www.w3.org/TR/json-ld11-framing/)) pour structurer les notices des entités. Le framing est appliqué avec la librairie Javascript [jsonld.js]([url](https://github.com/digitalbazaar/jsonld.js)).

## Structure des répertoires et des fichiers

```
garance
├── .eleventy.js
├── src
│   ├── _data
│   |   ├── framings
│   |   ├── i18n
│   |   |   ├── en
│   |   |   |   ├── translation files (CSV and JS)
│   |   |   ├── fr
│   |   |   |   ├── translation files (CSV and JS)
│   ├── entities
│   ├── _layouts
│   ├── pages
│   |   ├── en
│   |   |   ├── *.md files (index.md)
│   |   ├── fr
│   |   |   ├── *.md files (index.md)
├── static
├── utils
```

### .eleventy.js

### src

#### src/_data

#### src/_data/framings


## Génération du site







## /!\ Instable / Non testé - Utilisation de Python pour le framing JSON-LD et les CVS RiC-O

Le script a deux options pour generer un resource:

  - JSONLD
  - RICO

Option [JSONLD] - Generate un fichier JSON-LD à partir des fichiers RDF.

* ces importante de renomer le nombre de chaque fichier framing: 
Exemple:
vocabularies-framing.json -> vocabularies.json
agents-framing.json -> agents.json
index-framing.json -> index.json


Liste des fichiers qui doit generer le script:
vocabularies.json
index.json
agents.json

Utilisation:
  python garance_resources.py --generate JSONLD --input <répertoire de fichiers RDFs>  --context <fichier de context> --frame <répertoire de fichiers framings> --output <Répertoire output>

Exemple:
 python garance_resources.py --generate JSONLD --input Referentiels-version_2 --context context.json --frame framings --output data

 
Option [RICO]

Utilisation:
  python .\garance_resources.py --generate RICO --input <Répertoire de resources RICO (csv)>

Exemple:
  python .\garance_resources.py --generate RICO --input C:\tmp\convertRDFtoJson\rico
