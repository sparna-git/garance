from json import load
import os
import glob
from src import asJson
from . import asJRdfLib
from pathlib import Path
from urllib.parse import urlparse
import numpy as np
import logging

logger = logging.getLogger(__name__)

def createDirectory(dirFile:str):
    if not os.path.exists(dirFile):
        os.mkdir(dirFile)
    return dirFile

def readFile(inputResource) -> list:
    files = []
    list_of_files = glob.glob("**/*.rdf",root_dir=inputResource,recursive=True)
    for f in list_of_files:
        iFiles = os.path.join(inputResource,f)
        files.append(iFiles)
    return files

def localResources(input) -> str:

    if os.path.isfile(input):
        name,extends = os.path.split(input)
        return "file",[input]
    
    if os.path.isdir(input):
        return "dir",readFile(input)

# Graph RDFLib
def toJson(inputResource:str,outputFile:str,context:str):

    print(f"Directory: {Path(inputResource).absolute()}")
    print(f"Directory?: {os.path.isdir(inputResource)}")
    # Input type resource
    typeResource,r= localResources(Path(inputResource).absolute())

    # Create Directory
    if outputFile != "":
        pathOutput = Path(outputFile).absolute()
        createDirectory(pathOutput.parent)
    # Create Graph and Add namespace
    graph = asJRdfLib.createGraph()

    #Load in Graph
    if typeResource == "file" or typeResource == "dir":
        # Load in Graph
        loadGraph = np.vectorize(asJRdfLib.load,otypes=[list])(r)
        for g in loadGraph:
            graph += g
    logger.info(f"Taille Graph: {len(graph)} ")    
    
    # Serializetion
    #jsonld_data = asJRdfLib.serialize_data_json(gLib)
    logger.info("================ Create JSON File ================")    
    if context != "":
        objContext = asJson.JsonLoadsObj(Path(context).absolute())
        if outputFile != "":
            asJRdfLib.generate_json(graph,objContext,outputFile)
        else:
            data = asJRdfLib.generate_json_data(graph,objContext)
            print(asJson.jsonDumps(data))
    else:
        if outputFile != "":
            asJRdfLib.generate_json_compact(graph,outputFile)
        else:
            data = asJRdfLib.generate_json_compact_data(graph)
            print(asJson.jsonDumps(data))
    
    logger.info(f"****** The {outputFile} file was generated..... ")
    print(f"****** The {outputFile} file was generated..... ")

# Frame
def JSON_frames(inputJson:str,inputFrame:str,outputFile:str):
    
    logger.info(f"JSON Input: {inputJson}")
    objJson = asJson.JsonLoadsObj(Path(inputJson).absolute())
    logger.info(f"JSON Frame: {inputFrame}")
    objFrame = asJson.JsonLoadsObj(Path(inputFrame).absolute())
    
    pathOutput = Path(outputFile).absolute()
    createDirectory(pathOutput.parent)

    # Create Frame 
    data_framing = asJson.frame(objJson,objFrame)
    
    # Write result
    if outputFile != None:
        logger.info(f"JSON Frame Output: {outputFile}")
        asJson.write_file(data_framing,outputFile)
    else:
        print(asJson.jsonDumps(data_framing))

    logger.info(f"****** The {outputFile} file was generated..... ")
    print(f"****** The {outputFile} file was generated..... ")
