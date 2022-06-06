#!/usr/bin/env python3

import sys
import json
from requests_html import HTMLSession
import nmap
import itertools

from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep


################################################## reconnaissance_stage stuff ##################################################
def reconnaissance_stage(url, current_exploit, next_exploits, driver, report_file):
	def port_scan(url, current_exploit, report_file):
		# get domain
		domain = urlparse(url).hostname

		# run port scanning
		nmScan = nmap.PortScanner()

		min_port = 0
		max_port = 65535

		# get min and max port for scanning
		if 'min_port' in current_exploit.keys():
			try:
				min_port = int(current_exploit['min_port'])
			except:
				pass

		if 'max_port' in current_exploit.keys():
			try:
				max_port = int(current_exploit['max_port'])
			except:
				pass

		# run PortScan
		nmScan.scan(domain, '{}-{}'.format(min_port, max_port))

		# write report to file
		report_file.write('## Reconnaissance Open Ports {}-{} ##\n'.format(min_port, max_port))
		for host in nmScan.all_hosts():
			report_file.write('### Host {} ###\n'.format(host))
			for proto in nmScan[host].all_protocols():
				report_file.write('### Protocol {} ###\n'.format(proto))
		
				for port in sorted(nmScan[host][proto].keys()):
					state = ''
					try:
						state = nmScan[host][proto][port]['state']
					except:
						pass

					name = ''
					try:
						name = nmScan[host][proto][port]['name']
					except:
						pass

					report_file.write('* Port: {} State: {} Name: {}\n'.format(port, state, name))


	def path_scan(url, current_exploit, report_file):
		# check if custom list
		if 'custom_paths' not in current_exploit.keys():
			print('Error: no file containing paths')
			return

		# read paths
		paths = []
		with open(current_exploit['custom_paths']) as f:
			paths = list(filter(lambda line: line.strip() != '' and not line.startswith('#'), f.readlines()))
			paths = list(map(lambda line: line.strip(), paths))

		# try paths
		success = []
		for path in paths:
			try:
				session = HTMLSession()
				resp = session.get('{}/{}'.format(url, path))
				if resp.status_code == 200:
					resp.html.render()
					if '404 page not found' not in resp.html.html:
						success.append(path)
				session.close()
			except:
				pass

		# write report to file
		report_file.write('## Reconnaissance WebServer Paths ##\n')
		for path in success:
			report_file.write('* {}/{}\n'.format(url, path))

	port_scan(url, current_exploit, report_file)
	path_scan(url, current_exploit, report_file)

	if len(next_exploits) == 0:
		return

	run_exploit(url, next_exploits[0], next_exploits[1:], driver, report_file)


################################################## exploit stuff ##################################################
def run_generic_exploit(url, current_exploit, next_exploits, driver, report_file):
	def cleanup(msg, report_file):
		print(msg)
		report_file.write('\n\nFailed with status {}\n'.format(msg))

	if 'search_for' not in current_exploit.keys():
		print('Error: unable to get elements from {}'.format(current_exploit))
		return

	if 'path' not in current_exploit.keys():
		print('Error: unable to get elements from {}'.format(current_exploit))
		return

	# get the report file
	report_file.write('\n## {} ##\n'.format(current_exploit['name']))
	report_file.write('### Attempts ###\n')

	# search through input and precalculate input values
	# in order to do this, we need to generate combinations
	all_possible_values = []
	for entity in current_exploit['search_for']:
		if 'action' in entity.keys() and entity['action'] == 'fill' and 'fill_with' in entity.keys():
			if isinstance(entity['fill_with'], list):
				all_possible_values.append(entity['fill_with'])
			elif isinstance(entity['fill_with'], str):
				with open(entity['fill_with']) as f:
					fill_with = f.readlines()
					fill_with = list(map(lambda line: line.strip(), fill_with))
					all_possible_values.append(fill_with)
	all_possible_values = list(itertools.product(*all_possible_values))

	for possible_value in all_possible_values:
		# load webpage
		driver.get('{}{}'.format(url, current_exploit['path']))

		# possible input needed
		actions = []
		for entity in current_exploit['search_for']:
			if 'tag' in entity.keys():
				try:
					tags = entity['tag'] if isinstance(entity['tag'], list) else [entity['tag']]
					compulsory_attributes = entity['compulsory_attributes']
					possible_attributes = entity['possible_attributes']

					# get all elements in page
					elements = driver.find_elements_by_xpath('//*')

					# filter only for those that have a certain tag
					elements = list(filter(lambda elem: elem.tag_name in tags, elements))

					# filter for compulsory attributes
					for attr in compulsory_attributes:
						def ffilter(elem):
							for value in (attr['value'] if isinstance(attr['value'], list) else [attr['value']]):
								if value in elem.get_attribute(attr['key']):
									return True
							return False

						elements = list(filter(ffilter, elements))

					# if we need to further filter
					if len(elements) > 1:
						# filter for compulsory attributes
						for attr in possible_attributes:
							def ffilter(elem):
								for value in (attr['value'] if isinstance(attr['value'], list) else [attr['value']]):
									if value in elem.get_attribute(attr['key']):
										return True
								return False
							possible_elements = list(filter(lambda elem: attr['value'] in elem.get_attribute(attr['key']), elements))

							if len(possible_elements) == 1:
								elements = possible_elements
								break

					# save elements and actions for them
					if len(elements) == 1:
						actions.append((elements[0], entity))
					else:
						print(len(elements))
						# must be perfectly filtered
						cleanup('Error: unable to get only one element for {}'.format(entity), report_file)
						return
				except:
					# some parsing error
					cleanup('Error: unable to parse {}'.format(entity), report_file)
					return
			elif 'location' in entity.keys():
				actions.append((None, entity))

		# do all the needed actions
		index = 0
		for (elem, action) in actions:
			try:
				if action['action'] == 'fill':
					if 'tag' in action.keys():
						elem.send_keys(possible_value[index])
						index = index + 1
					elif 'location' in action.keys():
						if action['location'] == 'url_param':
							driver.get('{}{}{}'.format(url, current_exploit['path'], possible_value[index]))
						else:
							# unknown action
							cleanup('Error: unknown action {}'.format(action['action']), report_file)
							return

				elif action['action'] == 'click':
					elem.click()
				else:
					# unknown action
					cleanup('Error: unknown action {}'.format(action['action']), report_file)
					return
			except:
				cleanup('Error: unable to parse action for {}'.format(action), report_file)
				return

		if 'expected' in current_exploit.keys():
			if current_exploit['expected'] == 'redirect':
				if driver.current_url != '{}{}'.format(url, current_exploit['path']):
					report_file.write('* combination {} -> success\n'.format(possible_value))

					# found a way in -> we exit
					if len(next_exploits) == 0:
						return

					# continue with explois
					run_exploit(url, next_exploits[0], next_exploits[1:], driver, report_file)
					return
				else:
					report_file.write('* combination {} -> fail\n'.format(possible_value))
			elif current_exploit['expected'] == 'alert':
				try:
					WebDriverWait(driver, 3).until(EC.alert_is_present(),
									'Timed out waiting for PA creation ' +
									'confirmation popup to appear.')

					alert = driver.switch_to.alert
					alert.accept()

					report_file.write('* combination {} -> success\n'.format(possible_value))

					# found a way in -> we exit
					if len(next_exploits) == 0:
						return

					# continue with explois
					run_exploit(url, next_exploits[0], next_exploits[1:], driver, report_file)
					return
				except:
					report_file.write('* combination {} -> fail\n'.format(possible_value))
			elif current_exploit['expected'] == 'content':
				if current_exploit['content'] in driver.find_element_by_xpath("/html/body").text:
					report_file.write('* combination {} -> success\n'.format(possible_value))

					# found a way in -> we exit
					if len(next_exploits) == 0:
						return

					# continue with explois
					run_exploit(url, next_exploits[0], next_exploits[1:], driver, report_file)
					return
				else:
					report_file.write('* combination {} -> fail\n'.format(possible_value))


################################################## main stuff ##################################################
def run_exploit(url, current_exploit, next_exploits, driver, report_file):
	if 'name' not in current_exploit.keys():
		print('Error: unknown exploit {}'.format(current_exploit))
		exit(1)

	if current_exploit['name'] == 'reconnaissance':
		reconnaissance_stage(url, current_exploit, next_exploits, driver, report_file)
	else:
		run_generic_exploit(url, current_exploit, next_exploits, driver, report_file)


def close_all_pages(driver):
	for w in driver.window_handles:
		driver.switch_to.window(w)
		driver.close()


def main(conf_path):
	def parse_options(conf_path):
		try:
			with open(conf_path) as conf:
				return json.loads(conf.read())
		except:
			return None

	# get data from config
	conf = parse_options(conf_path)
	if conf == None:
		print('Error: config not valid')
		exit(1)

	if 'exploits' not in conf.keys():
		print('Error: config not containing exploits')
		exit(1)

	if 'domain' not in conf.keys():
		print('Error: config not containing domain')
		exit(1)

	# get domain
	domain = urlparse(conf['domain']).hostname

	# create report file
	report_file = open('{}_report.md'.format(domain), 'w')
	report_file.write('# Exploit report #\n')

	# create driver
	options = webdriver.FirefoxOptions()
	options.add_argument('--private')
	driver = webdriver.Firefox(options=options, service_log_path='/dev/null')

	# run exploits sequentially
	run_exploit(conf['domain'], conf['exploits'][0], conf['exploits'][1:], driver, report_file)

	# cleanup
	close_all_pages(driver)
	report_file.close()

if __name__ == '__main__':
	if len(sys.argv) != 2:
		print('Usage: python {} path_to_config', sys.argv[0])
	main(sys.argv[1])