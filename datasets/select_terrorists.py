import csv

groups = []

with open('selectedTerroristGroups.txt', 'r') as f:
	f = f.readlines()
	for i in range(10):
		groups.append(f[i][:len(f[i])-1])

# print(groups)

csvKeys = open('csv_keys.txt', 'r', newline='').read()
csvKeys = csvKeys.split('\r\n')

newCsvFile = open('selectedGTD.csv', 'w')
newCsvFile.write(','.join(csvKeys)+'\n')

with open('reducedGTD.csv', newline='') as csvfile:
	reader = csv.DictReader(csvfile)

	for row in reader:
		if (row['gname'] in groups):
			newRow = []
			for key in csvKeys:
				newRow.append(row[key])

			newCsvFile.write(','.join(newRow)+'\n')