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
const multer = require('multer');
const upload = multer();

// connect to database
let connection = mysql.createConnection({
  host     : 'db',
  user     : 'root',
  password : 'password',
  database : 'CARDS',
  multipleStatements: true
});

while(true) {
  try {
    connection.connect();
    break;
  } catch (error) {}
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../my-app/dist')));

app.use(upload.array()); 
app.use(express.static('public'));


// XSS vulnerable function
app.get('/api/messages', (req, res) => {
  let answer = {};
  answer["messages"] = [];

  try {
    let query = `SELECT USERS.NAME, MESSAGES.MSG FROM USERS INNER JOIN MESSAGES ON USERS.USER = MESSAGES.USER ORDER BY MESSAGES.MESSAGE_ID;`;
    connection.query(query, function (error, results, fields) {
      if (!error) {
        for (let i = 0; i < results.length; ++i) {
          answer.messages.push({"id": i, "name": results[i].NAME, "message": results[i].MSG})
        }
      }
      res.json(answer);
    });
  } catch {
    res.json(answer);
  }
});


// SQL Injection vulnerable function
app.post('/api/login', (req, res) => {
  const user = req.body;
  var username = user.username
  var password = user.password

  let answer = {};
  answer["auth"] = false;

  try {
    let query = `SELECT * FROM USERS WHERE USER = '${username}' AND PASS = '${password}';`;
    connection.query(query, function (error, results, fields) {
      if (!error && results.length == 1) {
        answer["auth"] = true;
        answer["username"] = results[0].USER;
      }
      res.json(answer);
    });
  } catch {
    res.json(answer);
  }
});


// SQL Injection vulnerable function
app.post('/api/profile', (req, res) => {
  const user = req.body;
  var username = user.username

  let answer = {};
  answer["data"] = [];
  answer["found"] = false;

  try {
    let query = `SELECT NAME, USER FROM USERS WHERE USER = '${username}';`;
    connection.query(query, function (error, results, fields) {
      if (!error && results.length > 0) {
        for (let i = 0; i < results.length; ++i) {
          answer.data.push({"username": results[i].USER, "name": results[i].NAME})
        }
        answer["found"] = true;
      }
      res.json(answer);
    });
  } catch {
    res.json(answer);
  }
});


// XSS vulnerable function
app.post('/api/message', (req, res) => {
  const user = req.body;
  var username = user.username
  var message = user.message

  let answer = {};
  answer["inserted"] = false;

  try {
    let query = `INSERT INTO MESSAGES(USER, MSG) VALUES('${username}', '${message}');`
    var ret = ''
    connection.query(query, function (error, results, fields) {
      if (!error) {
        answer["inserted"] = true;
      }
      res.json(answer);
    });
  } catch {
    res.json(answer);
  }
});


// PathTraversal vulnerable function
app.post('/api/download', (req, res) => {
  const user = req.body
  var path = user.path

  let answer = {};
  answer["file"] = "";
  answer["found"] = false;

  try {
    fs.readFile(path, 'utf8', function (err, data) {
      if (!err) {
        answer["file"] = data;
        answer["found"] = true;
      }
      res.json(answer);
    });
  } catch {
    res.json(answer);
  }
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});