from rdflib import Graph, Namespace
from rdflib.namespace import DC, DCAT, DCTERMS, FOAF, OWL, XSD
from rdflib.util import guess_format
import logging
logger = logging.getLogger(__name__)

def createGraph() -> Graph:
    g = Graph()    
    return g

def load(r) -> Graph:    
    return Graph().parse(r,format=guess_format(r))

def serialize_data_json(g):
    return g.serialize(format='json-ld', indent=4)

def serialize_file(g,outputFile:str,fmtOutput:str):
    return g.serialize(outputFile,format=fmtOutput)

def generate_json(g,context:str,output:str):
    return g.serialize(format='json-ld',indent=4,context=context,destination=output)

def generate_json_data(g,context:str):
    return g.serialize(format='json-ld',indent=4,context=context)

def generate_json_compact(g,output:str):
    return g.serialize(format='json-ld',indent=4,destination=output)

def generate_json_compact_data(g):
    return g.serialize(format='json-ld',indent=4)