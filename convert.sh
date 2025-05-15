#!/bin/sh

# path
export dir_home=$(dirname $0)

# source 
export input_rdfs=$dir_home/rdfs
export input_rico=$dir_home/rico/
# Virtual name directory
export envPython=$dir_home/envDev

rm -rf envDev

pythonStar="$(date +"%T")"
#####################################################################
#     WebScrapping Python                                           #
#####################################################################
# Creation of virtual environments
echo "Créer l'environnement ....."
python -m venv $envPython
# 
# Active environnement
. $envPython/Scripts/activate
echo "Installation d	'outils ....."
python -m pip install --upgrade pip --quiet
# Install all library
pip install pathlib --quiet
pip install rdflib --quiet
pip install pyld --quiet
#pip install json --quiet
pip install pandas --quiet
# Execute Script Python
echo "Generate resources JSON-LD......."
# Generate JON-LD Files
input_referentiels="C:\Users\thoma\Downloads\Referentiels-small\Referentiels-version_2"
input_context="C:\Users\thoma\Documents\GitHub\garance\src\_data\context.json"
input_frame="C:\Users\thoma\Documents\GitHub\garance\src\_data\framings"
output_result="C:\Users\thoma\Documents\GitHub\garance\src\_data"
# Remove all JSON FILES
rm $output_result/garance.json
rm $output_result/agents.json
rm $output_result/index.json
rm $output_result/vocabularies.json
# Execute Script 
python garance_resources.py --generate JSONLD --input $input_referentiels --context $input_context --frame $input_frame --output $output_result
# Generate RICO dictionary
echo "Generate resources RICO ......."
input_rico="C:\tmp\convertRDFtoJson\rico"
python garance_resources.py --generate RICO --input $input_rico

# Close environnement
deactivate
# remove directory 
rm -rf $envPython
pythonEnd="$(date +"%T")"

echo "Time of used WebScrapin Star: "$pythonStar" - End: "$pythonEnd