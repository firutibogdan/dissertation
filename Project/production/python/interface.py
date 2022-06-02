import os
import mysql.connector
import jinja2

from sanic import Sanic, response
from sanic_auth import Auth, User

app = Sanic(__name__)
app.config.AUTH_LOGIN_ENDPOINT = 'login'
auth = Auth(app)

file_loader = jinja2.FileSystemLoader('templates')
env = jinja2.Environment(loader=file_loader)

u_id = 0
active_users = {}
connection = None
cursor = None


## extra stuff ##
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


def handle_no_auth(request):
	# redirect to login if not authenticated
    return response.redirect('/login')


@app.middleware('request')
async def add_session(request):
	# add active session
	if request.ip not in active_users.keys():
		active_users[request.ip] = {'logged': False}
	request.ctx.session = active_users[request.ip]


@app.route('/logout')
@auth.login_required
async def logout(request):
	# clean session
	del active_users[request.ip]
	auth.logout_user(request)

	return response.redirect('/login')
## ## ## ## ## ## ##


## XSS vulnerable ##
@app.route("/", methods=['GET', 'POST'])
@auth.login_required(user_keyword='user', handle_no_auth=handle_no_auth)
async def index(request, user):
	if request.method == 'POST':
		# add to the database
		try:
			# run request
			cursor.execute("INSERT INTO MESSAGES(USER, MSG) VALUES('{}', '{}');".format(user.name, request.form.get('message')))
		except:
			pass

	items = []
	try:
		# run request
		cursor.execute("SELECT USERS.NAME, MESSAGES.MSG FROM USERS INNER JOIN MESSAGES ON USERS.USER = MESSAGES.USER ORDER BY MESSAGES.MESSAGE_ID")

		# check for messages
		rows = cursor.fetchall()
		for row in rows:
			item = dict(name=row[0], message=row[1])
			items.append(item)
	except:
		pass

	template = env.get_template('messages.html')
	return response.html(template.render(items=items))
## ## ## ## ## ## ##


## SQL Injection vulnerable ##
@app.route("/login", methods=['GET', 'POST'])
async def login(request):
	# go to index if user is already logged in
	if request.method == 'GET' and request.ip in active_users.keys() and active_users[request.ip]['logged']:
		return response.redirect('/')

	global u_id

	# try to login
	message = ''
	if request.method == 'POST':
		username = request.form.get('username')
		password = request.form.get('password')

		# connect to database
		global cursor
		try:
			# run request
			cursor.execute("SELECT * FROM USERS WHERE USER = '{}' AND PASS = '{}'".format(username, password))

			# check for users
			rows = cursor.fetchall()
			if len(rows) > 0:
				# found the user
				u_id += 1
				user = User(id=u_id, name=username)
				auth.login_user(request, user)
				active_users[request.ip]['logged'] = True
				return response.redirect('/')
			message = "User unknown or password mismatch"
		except:
			message = "Internal Error"
			pass

	# present login form
	print(message)
	template = env.get_template('login.html')
	return response.html(template.render(message=message))
## ## ## ## ## ## ##


## SQL Injection vulnerable through path ##
@app.route("/profile", methods=['GET'])
@auth.login_required(user_keyword='user', handle_no_auth=handle_no_auth)
async def index(request, user):
	items = []
	template = env.get_template('profile.html')

	# connect to database
	global cursor
	try:
		# run request
		user = request.args['profile_id'][0] if 'profile_id' in request.args.keys() else user.name
		cursor.execute("SELECT NAME, USER FROM USERS WHERE USER = '{}'".format(user))

		# check for users
		rows = cursor.fetchall()
		for row in rows:
			item = dict(name=row[0], username=row[1])
			items.append(item)
	except:
		pass

	return response.html(template.render(items=items))
## ## ## ## ## ## ##


## Path Traversal vulnerable ##
@app.route("/download", methods=['GET'])
@auth.login_required(user_keyword='user', handle_no_auth=handle_no_auth)
async def download(request, user):
	template = env.get_template('download.html')
	if 'file' not in request.args.keys():
		return response.html(template.render(text='No requested file.Path should be /download?file=some_file_name.txt.'))

	# get the file name
	file_path = request.args['file'][0]

	# return the image user asks for
	file_path = os.path.join(os.getcwd(), file_path)

	if os.path.isfile(file_path):
		with open(file_path) as f:
			buf = f.read()

			return response.html(template.render(text=buf))

	return response.html(template.render(text='File Not Found'))
## ## ## ## ## ## ##


if __name__ == "__main__":
	connect_db()
	app.run(host="0.0.0.0", port=80)
