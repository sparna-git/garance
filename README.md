# GARANCE

*G*raphe des *A*rchives nationales pour la *R*echerche, l'*A*ccès et la *N*avigation des *C*onnaissances *E*nrichies

Mise en ligne sous forme de site statique des données des référentiels des Archives Nationales publiées dans le dépôt https://github.com/ArchivesNationalesFR/Referentiels.
Utilise [11ty]([url](https://www.11ty.dev/)) comme outil de génération de site, et du [JSON-LD framing]([url](https://www.w3.org/TR/json-ld11-framing/)) pour structurer les notices des entités. Le framing est appliqué avec la librairie Javascript [jsonld.js]([url](https://github.com/digitalbazaar/jsonld.js)).

## Structure des répertoires

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
├── scripts
│   ├── ... commandes exécutées pour traiter les données : frame et read
├── utils
│   ├── ... Javascripts utilisés dans la génération du site (mais pas dans le site lui-même)
```

### `package.json`

Fichier de config principal de tout le projet. Contient notamment les dépendances aux librairies Javascript, et la définition des commances `npm run read`, `npm run frame`, `npm run start` et `npm run read` utiles pour la génération du site.

### `.eleventy.js`

Fichier de config principal d'11ty. Il charge les filtres Javascripts utiles à la génération du site et donne les chemins nécessaires à 11ty

### `_json`

Répertoire dans le lequel se retrouve le gros fichier JSON-LD `garance.json`qui est la concaténation de la lecture de tous les référentiels, et sur lequel est appliqué le framing. Ce répertoire est créé par la commande `npm run read`.

### `scripts`

Répertoire contenant les commandes "frame" et "read" utilisées pour préparer les données avant la génération du site.
En plus, une répertoire avec script python.

### `src`

Répertoire contenant toutes les sources à partir desquelles le site est généré

#### `src/_data`

Répertoire contenant tous les fichiers de données sources qui alimentent le site. En particulier, ce répertoire est alimenté par le résultat du framing (commande `npm run frame`)

#### `src/_data/framings`

Fichiers de spécifications du framing JSON-LD, utilisés par la commande `npm run frame` et appliqué sur le fichier d'entrée `_json/garance.json`

#### `src/_data/i18n`

Répertoire contenant les traductions des libellés du site en anglais et en français.

#### `src/entities`

Répertoire contenant les markdowns qui déclenchent la génération des pages sous l'URL `/entities`. Ce sont des fichiers vides qui font appel à un layout sous `src/_layouts` qui fait effectivement le travail.

#### `src/_layouts`

Répertoire contenant les layouts qui se chargent de la génération du HTML à partir des données. Contient toute la mise en forme HTML du site à partir des données. En particulier le fichier jsonld.njk est un template générique d'affichage de n'importe quelle structure JSON-LD.

#### `src/pages`

Répertoire contenant les pages statiques du site (non produites à partir de fichiers de données JSON). Ces pages doivent exister en 2 variantes, anglaise et française.


### `static`

Répertoire contenant tous les fichiers statiques du site final (images, Javascripts, CSS, etc...), qui est recopié tel quel dans la sortie.

### `utils`

Répertoire contenant tous les scripts utiles pour la génération du site (mais pas dans le site lui-même). Ce sont des filtres Nunjuck pour l'affichage des données des données 

## Commandes de génération du site

### 1. Installer les dépendances

`npm install`

### 2. Faire un clone du repository Référentiels

`git clone https://github.com/ArchivesNationalesFR/Referentiels.git`

### 3. Lancer le read

`npm run read <chemin vers le repository Référentiels>` : appelle le script utils/read.js pour lire le contenu des RDF.
Exemple : `npm run read ../Referentiels`
Cette commande créé le fichier `_json/garance.json`

### 3. Lancer le framing

`npm run frame`
Cette commande applique les specs de framing du dossier `src/_data/framings` sur le fichier `_json/garance.json`, pour produire des fichiers dans `src/_data`, par exemple `src/_data/agents.json`.

### 4. Lancer la génération du site

`npm run start` pour le serveur local, ou `npm run build` pour la génération du site final.
Le résultat finale est dans le répertoire `dist`

## /!\ Instable / Non testé - Utilisation de Python pour le framing JSON-LD et les CVS RiC-O

## Prérequis

* [Python 3.12](https://www.python.org/ftp/python/3.13.3/python-3.13.3-amd64.exe)

1. Installation  pip
```sh
sudo apt install python3-pip
```
## Aller au répertoire scripts\python
2. Création d'environnement Virtuel

```sh
python -m venv envgarance
```
3. Activer l'environnement
```sh
Windows : envgarance/Scripts/activate.bat
Linux : source envgarance/
```
4. Installation de paquets
```sh 
pip install -r requirements.txt
```

Dans le répértoire script/python, on a 2 fichiers `label.py` et `convertToJson.py`:

### Script `label.py` 

Créer fichiers de traductions RiC-0 dans Français et Anglais. Les résultats se stocke dans les fichiers `rico.csv` et `definition.csv`.

### Lancer le script Python
```sh
python label.py --input <Répertoire des fichiers de traductions RIC-O>
```
>Exemple
>``` python label.py --input ../../rico```


### Script `convertToJson.py`

Convertir des fichiers RDF en un fichier JSON-LD.

*Utilisation du Script:*
```sh
    python convertToJson.py --generate READ --input <Répertoire de fichiers RDF> --context <Fichier de context> --output <>
    [--context] : 
```

>Exemple
>``` python convertToJson.py --generate READ --input .../Referentiels --context ../context.json --output garance.json   ```