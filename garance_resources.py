import argparse
import glob
from pathlib import Path
from rdflib import Graph, Namespace, URIRef
from pyld import jsonld
import time
import json
import os
from rdflib.namespace import DC, DCAT, DCTERMS, FOAF, OWL, XSD
import pandas as pd

class garanceJson:

	def __init__(self,Directory:str,OutputDir:str, pathContext:str,pathFrame:str):
		
		self.source = Path(Directory).absolute()
		if not os.path.exists(Path(OutputDir).absolute()):
			os.mkdir(Path(OutputDir).absolute())
		self.output = Path(OutputDir).absolute()

		self.context = Path(pathContext).absolute()
		self.frames = Path(pathFrame).absolute()

		self.__saveGraph = Graph()

		self.__saveGraph.bind("foaf", FOAF)
		self.__saveGraph.bind("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
		self.__saveGraph.bind("rdfs", "http://www.w3.org/2000/01/rdf-schema#")
		self.__saveGraph.bind("skos", "http://www.w3.org/2004/02/skos/core#")
		self.__saveGraph.bind("xsd", XSD)
		self.__saveGraph.bind("dc", DC)
		self.__saveGraph.bind("dcat", DCAT)
		self.__saveGraph.bind("dcterms", DCTERMS)
		self.__saveGraph.bind("owl", OWL)

	def __time(self) -> str:
		timeStart = time.localtime() # get struct_time
		return time.strftime("%m/%d/%Y, %H:%M:%S", timeStart)
	
	def __get_files(self) -> list:
		print(f"Read files {self.source}")
		return glob.glob("**/*.rdf",root_dir=self.source,recursive=True)

	def __convert_Graph(self,Resource:list) -> Graph:

		print("Load files......")
		for f in Resource:
			__directoryPath = Path(self.source,f)
			self.__saveGraph.parse(__directoryPath)
	
	def __write_file(self, inputResource, outputFile:str):
		
		# Serializing json
		json_object = json.dumps(inputResource, indent=4)
		# Write File
		with open(outputFile,"w") as f:
			f.write(json_object)
	
	def __generate_Garance_JSON(self,inputJSON:str,outputFile:str):

		input = json.loads(inputJSON)
		context = json.loads(open(self.context,encoding="cp1252").read())

		compactJSON = jsonld.compact(input,context)
		self.__write_file(compactJSON,outputFile)

		return compactJSON

	def __generate_frames_JSON(self,compactJSON):

		files_list = glob.glob("**/*.json",root_dir=self.frames,recursive=True)
		print(f"Frames: {files_list}")
		for f in files_list:
			FramingFile = Path.joinpath(self.frames,f)
			# 
			filename,extension = os.path.splitext(f)
			# Lire le fichier framing
			frame_Vocabularies = json.loads(open(FramingFile).read())
			# Frame pour le tipe de frame a créer
			frame = jsonld.frame(compactJSON, frame_Vocabularies)
			# Ecrir dans un fichier de sortir
			pathOutput = Path(self.output,f"{filename}.json")
			print(f"Generate JSON Framing: {pathOutput} ")
			self.__write_file(frame,pathOutput)

	def convert_documents(self):
		print("================ Convert RDFs to JSON-LD ================")
		print(f"Start Time: {self.__time()}")
		# Read all RDF files
		self.__convert_Graph(self.__get_files())
		DOC = self.__saveGraph.serialize(format='json-ld', indent=4)
		print("================ Create JSON-LD File ================")
		output_garance_file = Path.joinpath(self.output,"garance.json")
		compactJSON = self.__generate_Garance_JSON(DOC,output_garance_file)
		print("================ Framing Files ================")
		self.__generate_frames_JSON(compactJSON)
		print("Le processus à termine")
		
class rico:

	def __init__(self,pathRico:str):
		
		self.path_files = Path(pathRico).absolute()

		self.labelRicoEN = []
		self.labelRicoFR = []
		self.Definition = []
		
	def generate_rico_voc(self):

		CSVs = glob.glob("**/*.csv",root_dir=self.path_files,recursive=True)
		print(f"Fichiers: {CSVs}")
		for f in CSVs:
			# read File rico
			pathFile = Path.joinpath(self.path_files,f)
			print(f"Lire le fichier: {pathFile}")
			dfExcel = pd.read_csv(pathFile,delimiter=",")
			
			# Generate Rico Label
			dfEN = dfExcel[[dfExcel.columns[0],dfExcel.columns[1]]]
			dfEN.columns = ["ricoId","label"]
			self.labelRicoEN.append(dfEN)
			
			dfFR = dfExcel[[dfExcel.columns[0],dfExcel.columns[2]]]
			dfFR.columns = ["ricoId","label"]
			self.labelRicoFR.append(dfFR)

			# Generate Rico Description
			dfDefinition = dfExcel[[dfExcel.columns[0],dfExcel.columns[4]]]
			dfDefinition.columns = ["ricoId","definition"]
			self.Definition.append(dfDefinition)

		dFlabelRicoEN = pd.concat(self.labelRicoEN)
		dFlabelRicoFR = pd.concat(self.labelRicoFR)
		dfDefinition = pd.concat(self.Definition)
		
		# Export all files
		outputEn = Path("src/_data/i18n/en").absolute()
		outputFR = Path("src/_data/i18n/fr").absolute()
		dFlabelRicoEN.to_csv(Path.joinpath(outputEn,"rico.csv"),sep=",",index=False)
		dFlabelRicoFR.to_csv(Path.joinpath(outputFR,"rico.csv"),sep=",",index=False)
		# Definitions
		dfDefinition.to_csv(Path.joinpath(outputEn,"definition.csv"),sep=",",index=False)
		dfDefinition.to_csv(Path.joinpath(outputFR,"definition.csv"),sep=",",index=False)

if __name__ == "__main__":
	
	parser = argparse.ArgumentParser()
	parser.add_argument("--generate",help="Generate à JSON-LD au RICO dictionnaire", action='append')
	parser.parse_args("--generate JSONLD --generate RICO".split())

	parser.add_argument("--input",help="Directory of inputs Files", required=True)
	parser.add_argument("--context",help="Fichier Context", required=False)
	parser.add_argument("--frame",help="Répértoire de fichiers Frame", required=False)
	parser.add_argument("--output",help="Répertoir pour stoker le résultat", required=False)
	
	arg = parser.parse_args()
	# Generate resources
	if 'JSONLD' in arg.generate:
		convert = garanceJson(arg.input,arg.output,arg.context,arg.frame)
		convert.convert_documents()

	if 'RICO' in arg.generate:
		# Rico 
		generateRico = rico(arg.input)
		generateRico.generate_rico_voc()