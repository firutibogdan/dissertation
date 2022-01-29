const { response } = require('express');
const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;
const fs = require('fs');
const e = require('express');
const crypto = require('crypto');

// connect to database
var connection = mysql.createConnection({
  host     : 'db',
  user     : 'root',
  password : 'password',
  database : 'CARDS',
  multipleStatements: true
});

connection.connect();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../my-app/dist')));



// SQL Injection no sanitize
function sql_injection_solution_0(username, password) {
  return [username, password]
}

// SQL Injection sanitize and keep only 0-9a-zA-Z
function sql_injection_solution_1(username, password) {
  var u = ''
  for (var i = 0; i < username.length; i++) {
    if (('0' <= username[i] && username[i] <= '9') ||
        ('a' <= username[i] && username[i] <= 'z') ||
        ('A' <= username[i] && username[i] <= 'Z')) {
      u += username[i]
    }
  }

  var p = ''
  for (var i = 0; i < password.length; i++) {
    if (('0' <= password[i] <= '9') || ('a' <= password[i] <= 'z') || ('A' <= password[i] <= 'Z')) {
      p += password[i]
    }
  }

  return [u, p]
}

// SQL Injection sanitize character '
function sql_injection_solution_2(username, password) {
  return [username.replace("\'", "\'\'"), password.replace("\'", "\'\'")]
}

// SQL Injection hash input
function sql_injection_solution_3(username, password) {
  var u = crypto.createHash('sha256').update(username).digest('hex')
  var p = crypto.createHash('sha256').update(password).digest('hex')

  return [u, p]
}

// SQL Injection vulnerable function
app.post('/api/login', (req, res) => {
  const user = req.body;
  var username = user.username
  var password = user.password
  var safeness = user.safeness
  
  var ret = []
  if (safeness == '1') {
    ret = sql_injection_solution_1(username, password)
  } else if (safeness == '2') {
    ret = sql_injection_solution_2(username, password)
  } else if (safeness == '3') {
    ret = sql_injection_solution_3(username, password)
  } else {
    ret = sql_injection_solution_0(username, password)
  }

  try {
    let query = `SELECT * FROM USERS WHERE USER = '${ret[0]}' AND PASS = '${ret[1]}';`;
    connection.query(query, function (error, results, fields) {
      if (error) {
        res.json("ERROR!");
      } else {
        if (results.length == 1) {
          res.json("You managed to log in!");
        } else {
          res.json("Try again!");
        }
      }
    });
  } catch {
    res.json("ERROR!");
  }
});



// XSS no sanitization
function xss_solution_0(message) {
  return message
}

// XSS sanitize input
function xss_solution_1(message) {
  var msg = message.replace('&', '&amp;')
                   .replace('<', '&lt;')
                   .replace('>', '&gt;')
                   .replace('\"', '&quot;')
	                 .replace('/', '&#47;')
	                 .replace('\'', '&#39;')
  return msg
}

// XSS vulnerable function
app.post('/api/show_xss', (req, res) => {
  const user = req.body;
  var username = user.username
  var safeness = user.safeness

  try {
    let query = `SELECT * FROM USERS WHERE USER = '${username}';`;
    var ret = ''
    connection.query(query, function (error, results, fields) {
      if (error) {
        res.json("ERROR!");
      } else {
        if (results.length > 0 && results[0].hasOwnProperty('MSG')) {
          var msg = results[0].MSG;
          if (safeness == '1') {
            ret = xss_solution_1(msg)
          } else if (safeness == '2') {
            ret = msg
            res.header('Content-Type', 'text/plain')
          } else {
            ret = xss_solution_0(msg)
          }
          res.json(JSON.parse(JSON.stringify(ret)));
        } else {
          res.json("ERROR!");
        }
      }
    });
  } catch {
    res.json("ERROR!");
  }
});



// PathTraversa no sanitization
function lfi_solution_0(username, path_arg) {
  return path_arg
}

// PathTraversa sanitize input
function lfi_solution_1(username, path_arg) {
  return path_arg.replace('..', '').replace('/', '')
}

// PathTraversa hash filename
function lfi_solution_2(username, path_arg) {
  return 'file_' + crypto.createHash('md5').update(path_arg).digest('hex') + '.txt'
}

// PathTraversal vulnerable function
app.post('/api/path_traversal', (req, res) => {
  const user = req.body
  var username = user.username
  var path = user.path
  var safeness = user.safeness

  var final_path = ''
  if (safeness == '3') {
    // PathTraversa check if access permitted in database
    try {
      let query = `CALL check_file(?,?,@output); select @output;`;
      connection.query(query, [username, path] , function (error, results, fields) {
        if (!error) {
          if (results.length > 0) {
            if (results[1][0]['@output'] == 1) {
              fs.readFile(path, 'utf8', function (err, data) {
                if (err) {
                  res.json("No file found!");
                } else {
                  res.json(data);
                }
              });
            } else {
              res.json("No permissions!");
            }
          } else {
            res.json("No permissions!");
          }
        } else {
          res.json("No permissions!");
        }
      });
    } catch {
      res.json("ERROR!");
    }
  } else {
    if (safeness == '1') {
      final_path = lfi_solution_1(username, path)
    } else if (safeness == '2') {
      final_path = lfi_solution_2(username, path)
    } else {
      final_path = lfi_solution_0(username, path)
    }

    try {
      fs.readFile(final_path, 'utf8', function (err, data) {
        if (err) {
          res.json("No file found!");
        } else {
          res.json(data);
        }
      });
    } catch {
      res.json("ERROR!");
    }
  }
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});