import logging
from src.asJ import JSON_frames

class asJLd:

    def __init__(self,inputJson:str,inputFrame:str,outputFile:str):
        
        # Convert input files in JSON Obj
        self.inputJson = inputJson
        self.inputFrame = inputFrame
        self.OutputJson = outputFile
        self.logger = logging
        self.logger.basicConfig(filename='Frames.log', level=logging.INFO)
    
    def frame(self):
        JSON_frames(self.inputJson,self.inputFrame,self.OutputJson)