const { response } = require('express');
const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;
const fs = require('fs');

// connect to database
var connection = mysql.createConnection({
  host     : 'db',
  user     : 'root',
  password : 'password',
  database : 'CARDS'
});

connection.connect();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../my-app/dist')));

app.post('/api/login', (req, res) => {
  const user = req.body.user;
  try {
    let query = `SELECT * FROM USERS WHERE USER = '${user.username}' AND PASS = '${user.password}';`;
    connection.query(query, function (error, results, fields) {
      if (error) {
        res.json("ERROR!");
      } else {
        if (results.length == 1 && JSON.parse(JSON.stringify(results[0])).USER.toLowerCase() == "admin") {
          res.json("You managed to log in as admin!");
        } else {
          res.json("Try again!");
        }
      }
    });
  } catch {
    res.json("ERROR!");
  }
});

app.get('/api/show_xss', (req, res) => {
  try {
    let query = `SELECT * FROM USERS WHERE USER = 'admin';`;
    connection.query(query, function (error, results, fields) {
      if (error) {
        res.json("ERROR!");
      } else {
        res.json(JSON.parse(JSON.stringify(results[0])).MSG);
      }
    });
  } catch {
    res.json("ERROR!");
  }
});

app.post('/api/path_traversal', (req, res) => {
  const path = './' + req.body.path;
  try {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        res.json("ERROR!");
      } else {
        res.json(data);
      }
    });
  } catch {
    res.json("ERROR!");
  }
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});