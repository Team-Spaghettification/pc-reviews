// server/index/js

// const db = require('./database');
const controller = require('./controllers/index.js');
const bodyParser = require('body-parser');
const express = require('express');

let app = express();

app.use(bodyParser.json());
// app.use(express.static(__dirname + '/../client/public'));

/**-----------
 * Requests
 ------------*/

app.get('/reviews', controller.getReviews);
app.get('/reviews/meta', controller.getMeta);
app.put('/reviews/:review_id/report', controller.report)
app.put('/reviews/:review_id/helpful', controller.helpful)
app.post('/reviews', controller.post)

/**--------------
 * Server Running
 ---------------*/
let port = 1128;

app.listen(port, function() {
  console.log(`listening on port ${port}`);
});