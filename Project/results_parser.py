#!/usr/bin/env python3

results = dict()


# 1 10 Keep-Alive sql_0.lua 8080 1 169.26

if __name__ == '__main__':
	with open('results') as f:
		for line in f.readlines():
			tokens = line.split(' ')
			name = tokens[0] + "_" + tokens[1] + "_" + tokens[2] + "_" + tokens[3] + "_" + tokens[4]

			if float(tokens[6]) != 0:
				if name not in results.keys():
					results[name] = list()
				results[name].append(float(tokens[6]))

	for key in results.keys():
		vals = results[key]

		total = 0
		for v in vals:
			total += v

		results[key] = total / len(vals)

	while True:
		cmd = input()
		if len(cmd.split(' ')) != 3:
			print('invalid command')
		else:
			d = dict()
			for key in results.keys():
				if key.startswith(cmd.split(' ')[0]) and key.find(cmd.split(' ')[1]) != -1 and key.find(cmd.split(' ')[2]) != -1:
					d[key] = results[key]
			print(d)