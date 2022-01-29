import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';

const mysql = require('mysql');
const fs = require('fs');
const crypto = require('crypto');

var connection = mysql.createConnection({
  host     : 'db',
  user     : 'root',
  password : 'password',
  database : 'CARDS',
  multipleStatements: true
});

connection.connect();

function insertLink({ title, url }) {
  LinksCollection.insert({title, url, createdAt: new Date()});
}

Meteor.startup(() => {
  // If the Links collection is empty, add some data.
  if (LinksCollection.find().count() === 0) {
    insertLink({
      title: 'Do the Tutorial',
      url: 'https://www.meteor.com/tutorials/react/creating-an-app'
    });

    insertLink({
      title: 'Follow the Guide',
      url: 'http://guide.meteor.com'
    });

    insertLink({
      title: 'Read the Docs',
      url: 'https://docs.meteor.com'
    });

    insertLink({
      title: 'Discussions',
      url: 'https://forums.meteor.com'
    });
  }
});



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
Router.route('/api/login',{where : 'server'})
.post(function(){
  const user = this.request.body;
  var resp = this.response;

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
        var response = {
          "message" : "ERROR!"
        };
        resp.setHeader('Content-Type','application/json');
        resp.end(JSON.stringify(response));
      } else {
        if (results.length == 1) {
          var response = {
            "message" : "You managed to log in!"
          };
          resp.setHeader('Content-Type','application/json');
          resp.end(JSON.stringify(response));
        } else {
          var response = {
            "message" : "Try again!"
          };
          resp.setHeader('Content-Type','application/json');
          resp.end(JSON.stringify(response));
        }
      }
    });
  } catch {
    var response = {
      "message" : "ERROR!"
    };
    resp.setHeader('Content-Type','application/json');
    resp.end(JSON.stringify(response));
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
	                 .replace('&', '&amp;')
                   .replace('\"', '&quot;')
	                 .replace('/', '&#47;')
	                 .replace('\'', '&#39;')
  return msg
}

// XSS vulnerable function
Router.route('/api/show_xss',{where : 'server'})
.post(function(){
  const user = this.request.body;
  var resp = this.response;

  var username = user.username
  var safeness = user.safeness

  try {
    let query = `SELECT * FROM USERS WHERE USER = '${username}';`;
    var ret = ''
    connection.query(query, function (error, results, fields) {
      if (error) {
        var response = {
          "message" : "ERROR!"
        };
        resp.setHeader('Content-Type','application/json');
        resp.end(JSON.stringify(response));
      } else {
        if (results.length > 0 && results[0].hasOwnProperty('MSG')) {
          var msg = results[0].MSG;
          if (safeness == '2') {
            var response = {
              "message" : msg
            };
            resp.setHeader('Content-Type','text/plain');
            resp.end(JSON.stringify(response));
          } else {
            if (safeness == '1') {
              ret = xss_solution_1(msg)
            } else {
              ret = xss_solution_0(msg)
            }
            var response = {
              "message" : ret
            };
            resp.setHeader('Content-Type','application/json');
            resp.end(JSON.stringify(response));
          }
        } else {
          var response = {
            "message" : "ERROR!"
          };
          resp.setHeader('Content-Type','application/json');
          resp.end(JSON.stringify(response));
        }
      }
    });
  } catch {
    var response = {
      "message" : "ERROR!"
    };
    resp.setHeader('Content-Type','application/json');
    resp.end(JSON.stringify(response));
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
Router.route('/api/path_traversal',{where : 'server'})
.post(function(){
  const user = this.request.body;
  var resp = this.response;

  var username = user.username
  var path = user.path;
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
              var file = fs.readFileSync(path, 'utf8');//, function (err, data) {
              //   if (err) {
              //     var response = {
              //       "message" : "No file found!"
              //     };
              //     resp.setHeader('Content-Type','application/json');
              //     resp.end(JSON.stringify(response));
              //   } else {
              //     var response = {
              //       "message" : data
              //     };
              //     resp.setHeader('Content-Type','application/json');
              //     resp.end(JSON.stringify(response));
              //   }
              // });
              var response = {
                "message" : file
              };
              resp.setHeader('Content-Type','application/json');
              resp.end(JSON.stringify(response));
            } else {
              var response = {
                "message" : "No permissions!"
              };
              resp.setHeader('Content-Type','application/json');
              resp.end(JSON.stringify(response));
            }
          } else {
            var response = {
              "message" : "No permissions!"
            };
            resp.setHeader('Content-Type','application/json');
            resp.end(JSON.stringify(response));
          }
        } else {
          console.log(error)
          var response = {
            "message" : "ERROR!"
          };
          resp.setHeader('Content-Type','application/json');
          resp.end(JSON.stringify(response));
        }
      });
    } catch {
      var response = {
        "message" : "ERROR!"
      };
      resp.setHeader('Content-Type','application/json');
      resp.end(JSON.stringify(response));
    }
  } else {
    if (safeness == '1') {
      final_path = lfi_solution_1(username, path)
    } else if (safeness == '2') {
      final_path = '/' + lfi_solution_2(username, path)
    } else {
      final_path = lfi_solution_0(username, path)
    }

    try {
      var file = fs.readFileSync(path, 'utf8');
      // fs.readFile(final_path, 'utf8', function (err, data) {
      //   if (err) {
      //     console.log(err)
      //     var response = {
      //       "message" : "No file found!"
      //     };
      //     resp.setHeader('Content-Type','application/json');
      //     resp.end(JSON.stringify(response));
      //   } else {
      //     var response = {
      //       "message" : data
      //     };
      //     resp.setHeader('Content-Type','application/json');
      //     resp.end(JSON.stringify(response));
      //   }
      // });
      var response = {
        "message" : data
      };
      resp.setHeader('Content-Type','application/json');
      resp.end(JSON.stringify(response));
    } catch {
      var response = {
        "message" : "ERROR!"
      };
      resp.setHeader('Content-Type','application/json');
      resp.end(JSON.stringify(response));
    }
  }
});