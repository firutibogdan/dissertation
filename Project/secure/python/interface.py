import mysql.connector
import os
import hashlib
import time

from flask import Flask, request, Response

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)


app = Flask(__name__)
connection = None
cursor = None


# connect to the database
def connect_db():
	global connection
	global cursor

	ok = False

	# try to connect to database
	while not ok:
		try:
			connection = mysql.connector.connect(
				host='db',
				user='root',
				password='password',
				port='3306',
				database='CARDS'
			)
			ok = True
		except:
			ok = False

	cursor = connection.cursor()


########## SQL INJECTION ##########
def sql_injection_solution_0(username, password):
	# do nothing
	return (username, password)

def sql_injection_solution_1(username, password):
	# try to sanitize the input
	uname = ''
	for c in username:
		if ('0' <= c <= '9') or ('a' <= c <= 'z') or ('A' <= c <= 'Z'):
			uname += c

	pwd = ''
	for c in password:
		if ('0' <= c <= '9') or ('a' <= c <= 'z') or ('A' <= c <= 'Z'):
			pwd += c

	return (uname, pwd)

def sql_injection_solution_2(username, password):
	# try to sanitize the input
	username = username.replace('\'', '\'\'')
	password = password.replace('\'', '\'\'')

	return (username, password)


def sql_injection_solution_3(username, password):
	# hash input and search for hash in database
	username = hashlib.sha256(str.encode(username)).hexdigest()
	password = hashlib.sha256(str.encode(password)).hexdigest()

	return (username, password)


@app.route('/login', methods=['POST'])
def login():
	# get user input
	username = request.json['username']
	password = request.json['password']
	safeness = request.json['safeness']

	# connect to database
	global cursor

	sanitizer = sql_injection_solution_0
	if safeness == 1:
		sanitizer = sql_injection_solution_1
	elif safeness == 2:
		sanitizer = sql_injection_solution_2
	elif safeness == 3:
		sanitizer = sql_injection_solution_3

	(username, password) = sanitizer(username, password)

	try:
		# run request
		cursor.execute("SELECT * FROM USERS WHERE USER = '{}' AND PASS = '{}'".format(username, password))

		# check for users
		rows = cursor.fetchall()
		if len(rows) > 0:
			# found the user
			end = time.time()
			return 'You managed to log in!'

		return 'No user found'
	except:
		return 'No user found'
########## END OF SQL INJECTION ##########


########## XSS ##########
def xss_solution_0(message):
	# do nothing
	return Response('<html><body>' + message + '</body></html>')

def xss_solution_1(message):
	# try to sanitize the input
	message = message.replace('&', '&amp;')
	message = message.replace('<', '&lt;')
	message = message.replace('>', '&gt;')
	message = message.replace('\"', '&quot;')
	message = message.replace('/', '&#47;')
	message = message.replace('\'', '&#39;')

	return Response('<html><body>' + message + '</body></html>')

def xss_solution_2(message):
	# apply headers so content is interpreted as text
	resp = Response(message)
	resp.headers['X-Content-Type-Options'] = 'nosniff'
	resp.headers['Content-Type'] = 'text/plain'

	return resp

@app.route('/show_xss', methods=['POST'])
def show_xss():
	# get user input
	username = request.json['username']
	safeness = request.json['safeness']

	# connect to database
	global cursor

	try:
		# run request
		cursor.execute("SELECT MSG FROM USERS WHERE USER = '{}'".format(username))

		# return the message as HTML
		rows = cursor.fetchall()
		sanitizer = xss_solution_0
		if safeness == 1:
			sanitizer = xss_solution_1
		elif safeness == 2:
			sanitizer = xss_solution_2
		if len(rows) > 0:
			# found the message
			for msg in rows:
				return sanitizer(msg[0])

		return 'No message yet'
	except:
		return 'No message yet'
########## END OF XSS ##########


########## PATH TRAVERSAL ##########
def lfi_solution_0(username, path_arg):
	# do nothing
	return path_arg


def lfi_solution_1(username, path_arg):
	# take out '..' and '/' characters
	return path_arg.replace('..', '').replace('/', '')


def lfi_solution_2(username, path_arg):
	# try hashing the input
	# only accessible file named "admin1" with hash e00cf25ad42683b3df678c61f42c6bda
	# as file_e00cf25ad42683b3df678c61f42c6bda.txt
	return 'file_' + hashlib.md5(str.encode(path_arg)).hexdigest() + '.txt'


def lfi_solution_3(username, path_arg):
	# connect to database
	global cursor
	try:
		ret = cursor.callproc('check_file', [username, path_arg, 0])
		if ret[2] > 0:
			return path_arg
		return ''
	except:
		return ''


@app.route('/path_traversal', methods=['POST'])
def path_traversal():
	# get the image name
	username = request.json['username']
	file_path = request.json['path']
	safeness = request.json['safeness']

	if safeness == 1:
		file_path = lfi_solution_1(username, file_path)
	elif safeness == 2:
		file_path = lfi_solution_2(username, file_path)
	elif safeness == 3:
		file_path = lfi_solution_3(username, file_path)
	else:
		file_path = lfi_solution_0(username, file_path)

	# return the image user asks for
	file_path = os.path.join(os.getcwd(), file_path)

	if os.path.isfile(file_path):
		with open(file_path) as f:
			buf = f.read()

			return buf

	return 'File Not Found'
########## END OF PATH TRAVERSAL ##########


if __name__ == '__main__':
	connect_db()
	app.run(host='0.0.0.0', port=8080)
