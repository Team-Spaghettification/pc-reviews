// server/database/index.js

const mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'student',
  password: 'student',
  database: 'catwalk'
});

connection.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log('mysql connected');
  }
});

module.exports = connection;