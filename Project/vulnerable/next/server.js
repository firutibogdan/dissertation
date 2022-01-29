const { createServer } = require('http')
const next = require('next')
const mysql = require('mysql');
const fs = require('fs');
const bodyParser = require("body-parser");

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

var connection = mysql.createConnection({
  host     : 'db',
  user     : 'root',
  password : 'password',
  database : 'CARDS'
});

connection.connect();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = new URL(req.url, 'http://w.w')
    const { pathname, query } = parsedUrl

    if (pathname === "/api/login" && req.method === "POST") {
      var body = "";
      req.on('readable', function() {
        var r = req.read();
        if (r != null) {
          body += r;
        }
      });
      req.on('end', function() {
        const user = JSON.parse(body);
        try {
          let query = `SELECT * FROM USERS WHERE USER = '${user.username}' AND PASS = '${user.password}';`;
          connection.query(query, function (error, results, fields) {
            if (error) {
              var response = {
                "message" : "ERROR!"
              };
              res.setHeader('Content-Type','application/json');
              res.end(JSON.stringify(response));
            } else {
              if (results.length == 1 && JSON.parse(JSON.stringify(results[0])).USER.toLowerCase() == "admin") {
                var response = {
                  "message" : "You managed to log in as admin!"
                };
                res.setHeader('Content-Type','application/json');
                res.end(JSON.stringify(response));
              } else {
                var response = {
                  "message" : "Try again!"
                };
                res.setHeader('Content-Type','application/json');
                res.end(JSON.stringify(response));
              }
            }
          });
        } catch {
          var response = {
            "message" : "ERROR!"
          };
          res.setHeader('Content-Type','application/json');
          res.end(JSON.stringify(response));
        }
      });
    } else if (pathname === "/api/show_xss" && req.method == "GET") {
      try {
        let query = `SELECT * FROM USERS WHERE USER = 'admin';`;
        connection.query(query, function (error, results, fields) {
          if (error) {
            var response = {
              "message" : "ERROR!"
            };
            res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify(response));
          } else {
            var response = {
              "message" : JSON.parse(JSON.stringify(results[0])).MSG
            };
            res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify(response));
          }
        });
      } catch {
        var response = {
          "message" : "ERROR!"
        };
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify(response));
      }
    } else if (pathname === "/api/path_traversal" && req.method == "POST") {
      var body = "";
      req.on('readable', function() {
        var r = req.read();
        if (r != null) {
          body += r;
        }
      });
      req.on('end', function() {
        const path = './' + JSON.parse(body).path;
        try {
          fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
              var response = {
                "message" : "ERROR!"
              };
              res.setHeader('Content-Type','application/json');
              res.end(JSON.stringify(response));
            } else {
              var response = {
                "message" : data
              };
              res.setHeader('Content-Type','application/json');
              res.end(JSON.stringify(response));
            }
          });
        } catch {
          var response = {
            "message" : "ERROR!"
          };
          res.setHeader('Content-Type','application/json');
          res.end(JSON.stringify(response));
        }
      });
    } else {
      var response = {
        "message" : "ERROR!"
      };
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify(response));
    }
  }).listen(3000, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:3000`)
  })
})