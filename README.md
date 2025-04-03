# GARANCE

*G*raphe des *A*rchives nationales pour la *R*echerche, l'*A*ccès et la *N*avigation des *C*onnaissances *E*nrichies

## Liens

Dépôt actuel des données des référentiels : https://github.com/ArchivesNationalesFR/Referentiels

- Agents
  - Personnes
  - CorporateBody
  - Producteurs d'archives (avec leurs relations)
- Lieux
  - Communes
  - Départements
  - Voies de Paris
  - Quartiers de Paris
  - etc.
- Concepts
  - Types d'organisation
  - Types de document
  - etc.


## Generate des resources JSON-LD et RICO avec une Script Python

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