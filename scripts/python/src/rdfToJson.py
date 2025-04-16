import time
from src.asJ import toJson
import logging

class convertRDFtoJson:

	def __init__(self,pathResource:str,OutputFile:str,pathContext:str):

		self.logger = logging
		self.logger.basicConfig(filename='ConvertResourceToJson.log', level=logging.INFO)
		self.source = pathResource
		self.context = ""
		if pathContext != None:
			self.context = pathContext
		self.namespace = ""
		self.output = ""
		if OutputFile != None:
			self.output = OutputFile
		
	def __time(self) -> str:
		timeStart = time.localtime() # get struct_time
		return time.strftime("%m/%d/%Y, %H:%M:%S", timeStart)
	
	def convert_data_json(self):
		self.logger.info("================ Convert RDFs to JSON ================")
		self.logger.info(f"Input Resource: {self.source}")
		self.logger.info(f"Context: {self.context}")
		self.logger.info(f"Output: {self.output}")
		
		print(f"Start Time: {self.__time()}")
		self.logger.info(f"Start Time: {self.__time()}")
		
		toJson(self.source,self.output,self.context)
		
		print(f"End Time: {self.__time()}")
		self.logger.info(f"End Time: {self.__time()}")