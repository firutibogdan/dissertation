import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';

const mysql = require('mysql');
const fs = require('fs');

var connection = mysql.createConnection({
  host     : 'db',
  user     : 'root',
  password : 'password',
  database : 'CARDS'
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

Router.route('/api/login',{where : 'server'})
.post(function(){
  const user = this.request.body;
  var resp = this.response;

  try {
    let query = `SELECT * FROM USERS WHERE USER = '${user.username}' AND PASS = '${user.password}';`;
    connection.query(query, [resp], function (error, results, fields) {
      if (error) {
        var response = {
          "message" : "ERROR!"
        };
        resp.setHeader('Content-Type','application/json');
        resp.end(JSON.stringify(response));
      } else {
        if (results.length == 1 && JSON.parse(JSON.stringify(results[0])).USER.toLowerCase() == "admin") {
          var response = {
            "message" : "You managed to log in as admin!"
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

Router.route('/api/show_xss',{where : 'server'})
.get(function(){
  var resp = this.response;

  try {
    let query = `SELECT * FROM USERS WHERE USER = 'admin';`;
    connection.query(query, [resp], function (error, results, fields) {
      if (error) {
        var response = {
          "message" : "ERROR!"
        };
        resp.setHeader('Content-Type','application/json');
        resp.end(JSON.stringify(response));
      } else {
        var response = {
          "message" : JSON.parse(JSON.stringify(results[0])).MSG
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
});

Router.route('/api/path_traversal',{where : 'server'})
.post(function(){
  var resp = this.response;
  const path = './' + this.request.body.path;

  try {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        var response = {
          "message" : "ERROR!"
        };
        resp.setHeader('Content-Type','application/json');
        resp.end(JSON.stringify(response));
      } else {
        var response = {
          "message" : data
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
});