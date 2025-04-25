import argparse
from src.rdfToJson import convertRDFtoJson
from src.jsonToJsonld import asJLd

if __name__ == "__main__":
	
	parser = argparse.ArgumentParser()
	parser.add_argument("--generate",help="Generate à JSON-LD au RICO dictionnaire", action='append')
	parser.parse_args("--generate READ --generate FRAME".split())

	parser.add_argument("--input",help="Directory of inputs Files", required=True)
	parser.add_argument("--context",help="Fichier Context", required=False)
	parser.add_argument("--frame",help="Répértoire de fichiers Frame", required=False)
	parser.add_argument("--output",help="Répertoir pour stoker le résultat", required=False)
	
	arg = parser.parse_args()
	# Generate resources
	if 'READ' in arg.generate:
		read = convertRDFtoJson(arg.input,arg.output,arg.context)
		read.convert_data_json()

	if 'FRAME' in arg.generate:
		# Create a Json-LD Frame
		asJLd(arg.input,arg.frame,arg.output).frame()
