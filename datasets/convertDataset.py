import csv

csvKeys = open('csv_keys.txt', 'r', newline='').read()
csvKeys = csvKeys.split('\r\n')

newCsvFile = open('reducedGTD.csv', 'w')

newCsvFile.write(','.join(csvKeys)+'\n')

with open('globalterrorismdb_0616dist.csv', newline='') as csvfile:
	reader = csv.DictReader(csvfile)
	'''
	# Get all the CSV keys
	for keys in reader.fieldnames:
		print(keys)
	'''
	
	for row in reader:
		newRow = []
		for key in csvKeys:
			newRow.append(row[key])

		#print(', '.join(newRow))
		newCsvFile.write(','.join(newRow)+'\n')
	