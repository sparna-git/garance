import argparse
import glob
from pathlib import Path
import pandas as pd

class rico:

	def __init__(self,pathRico:str):
		
		self.path_files = Path(pathRico).absolute()
		self.labelRicoEN = []
		self.labelRicoFR = []
		self.Definition = []
		
	def rico_lables(self):

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
	parser.add_argument("--input",help="Directory of inputs Files", required=True)
	
	arg = parser.parse_args()
	
	generateRico = rico(arg.input)
	generateRico.rico_lables()