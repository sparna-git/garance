from rdflib import Graph, URIRef
from rdflib.namespace import RDF, SKOS, FOAF, RDF, RDFS, DC, DCTERMS, FOAF, DCAT, Namespace
import sys
import os
import glob
from pathlib import Path

DIR_DIST = Path('dist/entities')
# Namespace
RICO = Namespace("https://www.ica.org/standards/RiC/ontology#")
OWL = Namespace("http://www.w3.org/2002/07/owl#")
HTML = Namespace("http://www.w3.org/1999/xhtml")
AN = Namespace("http://data.archives-nationales.culture.gouv.fr/")
ISO_TEHS = Namespace("http://purl.org/iso25964/skos-thes#")

def __get_outputFile(directory,filename) -> str:
    pathOutput = os.path.join(DIR_DIST,directory,f'{filename}.rdf')
    return pathOutput

def __convertToRDF(JSONFILE):

    g = Graph()
    # Add namespace
    g.bind("rico",RICO)
    g.bind("rdf",RDF)
    g.bind("rdfs",RDFS)
    g.bind("owl",OWL)
    g.bind("skos",SKOS)
    g.bind("foaf",FOAF)
    g.bind("dc",DC)
    g.bind("dcterms",DCTERMS)
    g.bind("html",HTML)
    g.bind("an",AN)
    g.bind("dcat",DCAT)
    g.bind("iso-thes",ISO_TEHS)

    # Parse
    g.parse(JSONFILE)

    # Get ID
    conceptParent = ''.join([o for s,p,o in g.triples((None,SKOS.inScheme,None))])
    vocabulary_Id = conceptParent.split("/")
    # Save rdf file
    basename = os.path.basename(JSONFILE).split(".")[0] 
    output_file = __get_outputFile(vocabulary_Id[-1],basename)
    rdfTriple = g.serialize(output_file,format="xml")  

if __name__ == "__main__":

    dirJson = sys.argv[1]
    # Get the list of json file
    listOfJson = glob.glob("*.json",root_dir=dirJson)
    listOfJson = [ os.path.join(dirJson,f)  for f in listOfJson]
    # for each json file convert to rdf/xml
    [__convertToRDF(jsonFile) for jsonFile in listOfJson]
    # Remove directory
    
    print("End process of copy RDF files to concepts.....")