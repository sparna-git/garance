import json
from pyld import jsonld
from pathlib import Path

def openFile(InputPath):
    """
    Validate if path exist
    """
    isFile = Path(InputPath)
    try:
        if isFile.is_file():
            return open(InputPath).read()
    except FileNotFoundError as eFile:
        print(f"Warning: {eFile}")

def JsonLoads(inputFile:str) -> object:    
    return json.loads(inputFile)

def jsonDumps(input:str) -> object:
    return json.dumps(input,sort_keys=True,indent=4)

def JsonLoadsObj(inputFile:str) -> object:    
    return json.loads(openFile(inputFile))

def write_file(inputResource, outputFile:str):
		
    # Serializing json
    json_object = json.dumps(inputResource, indent=4)
    # Write File
    with open(outputFile,"w") as f:
        f.write(json_object)

# PyLD
def compact(inputJson, context):
    return jsonld.compact(inputJson,context)

def frame(inputJson, inputFrame):
    return jsonld.frame(inputJson,inputFrame)