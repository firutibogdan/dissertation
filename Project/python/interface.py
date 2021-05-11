import mysql.connector
import os

from flask import Flask, request, send_file
from time import sleep

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

@app.route('/login', methods=['POST'])
def login():
	# get user input
	username = request.form['username']
	password = request.form['password']

	# connect to database
	global cursor
	connect_db()

	# run request
	cursor.execute("SELECT * FROM USERS WHERE USER = '{}' AND PASS = '{}'".format(username, password))

	# check for users
	rows = cursor.fetchall()
	if len(rows) > 0:
		# found the user
		return 'You managed to log in!'
	return 'No user found'

@app.route('/show_xss', methods=['GET'])
def show_xss():
	# get user input
	if 'username' in request.args.keys():
		username = request.args.get('username')

		# connect to database
		global cursor
		connect_db()

		# run request
		cursor.execute("SELECT MSG FROM USERS WHERE USER = '{}'".format(username))

		# return the message as HTML
		rows = cursor.fetchall()
		if len(rows) > 0:
			# found the message
			for msg in rows:
				return '<html><body>' + msg[0] + '</body></html>'
		return 'No message yet'
	return 'Error'

@app.route('/path_traversal', methods=['GET'])
def path_traversal():
	# get the image name
	if 'path' in request.args.keys():
		image_path = request.args.get('path')

		# return the image user asks for
		return send_file(os.path.join(os.getcwd(), image_path))
	
	return 'Error'

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8080)