# GARANCE

*G*raphe des *A*rchives nationales pour la *R*echerche, l'*A*ccès et la *N*avigation des *C*onnaissances *E*nrichies

Mise en ligne sous forme de site statique des données des référentiels des Archives Nationales publiées dans le dépôt https://github.com/ArchivesNationalesFR/Referentiels.
Utilise [11ty]([url](https://www.11ty.dev/)) comme outil de génération de site, et du [JSON-LD framing]([url](https://www.w3.org/TR/json-ld11-framing/)) pour structurer les notices des entités. Le framing est appliqué avec la librairie Javascript [jsonld.js]([url](https://github.com/digitalbazaar/jsonld.js)).

## Structure des répertoires et des fichiers

```
garance
├── .eleventy.js
├── package.json
├── _json
│   ├── ... Fichiers JSON après lecture mais avant framing
├── src
│   ├── _data
│   |   ├── framings
│   |   |   ├── ... Fichiers de specs du framing
│   |   ├── i18n
│   |   |   ├── en
│   |   |   |   ├── ... Fichiers de traductions (CSV and JS)
│   |   |   ├── fr
│   |   |   |   ├── ... Fichiers de traductions (CSV and JS)
│   |   ├── ... Fichiers JSON après framing
│   ├── entities
│   ├── _layouts
│   ├── pages
│   |   ├── en
│   |   |   ├── ... Fichiers de contenu *.md (dont page d'accueil index.md)
│   |   ├── fr
│   |   |   ├── ... Fichiers de contenu *.md (dont page d'accueil index.md)
├── static
│   ├── ... CSS, javascript, images, etc.
├── utils
│   ├── ... Javascripts utilisés dans le processus de génération du site (mais pas dans le site lui-même) : filtres + commandes frame & read
```

### package.json

Fichier de config principal de tout le projet. Contient notamment les dépendances aux librairies Javascript, et la définition des commances `npm run read`, `npm run frame`, `npm run start` et `npm run read` utiles pour la génération du site.

### .eleventy.js

Fichier de config principal d'11ty. Il charge les filtres Javascripts utiles à la génération du site et donne les chemins nécessaires à 11ty

### _json

Répertoire dans le lequel se retrouve le 

### src

#### src/_data

#### src/_data/framings

#### src/_data/i18n

#### src/entities

#### src/pages

### static

### utils

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
