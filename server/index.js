// server/index/js

// const db = require('./database');
const controller = require('./controllers/index.js');
const bodyParser = require('body-parser');
const express = require('express');
const _ = require('underscore');
const Promise = require('bluebird');
const moment = require('moment');

const csv = require('csv-parser');
const fs = require('fs');
var db = require('./database/index.js');
Promise.promisifyAll(db);

let app = express();

app.use(bodyParser.json());
// app.use(express.static(__dirname + '/../client/public'));

/**-----------
 * Requests
 ------------*/

// app.get('/cows', controller.get);
// app.post('/cows', controller.post);

/**--------------
 * Server Running
 ---------------*/
let port = 1128;

app.listen(port, function() {
  console.log(`listening on port ${port}`);
});