terrorists = []
count = []

j = 0

with open('todos_grupos_terroristas.txt', mode='r') as fp:
	for line in fp:
		#print('linha ' + str(j))
		#j += 1
		linha = line[:(len(line)-1)]
		if linha not in terrorists:
			terrorists.append(linha)
			count.append(1)
		else:
			i = terrorists.index(linha)
			count[i] += 1

zipped = list(zip(terrorists, count))
# print('zipado')
zipped.sort(key=lambda z: z[1], reverse=True)
# print('ordenado')

sT = open('selectedTerroristGroups.txt', mode='w')

with open('qty_attacks_per_group.txt', mode='w') as fp:
	fp.write('(Grupo Terrorista, Quantidade de Ataques)\n')
	fp.write('-------------------------------------------------------------------\n')
	for z in zipped:
		fp.write(str(z) + '\n')

	selectedTerrorists = zipped[1:21]
	for s in selectedTerrorists:
		sT.write(str(s[0]) + '\n')