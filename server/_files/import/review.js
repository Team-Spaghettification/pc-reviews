const moment = require('moment');
const csv = require('csv-parser');
const fs = require('fs');
var db = require('../../database/index.js');

const results = [];
var productTracker = {};
var lastReviewId = 0;
var startAll = Date.now();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var importReview = () => {

  var start = Date.now()

  fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/reviews.csv')
    .pipe(csv())
    .on('data', (data) => {
      /**
       * REQUIRED OR CANCEL:
       * id
       * product_id
       * rating
       * date = date
       * recommend = T/F/1/0
       */

      /**
       * REQUIRED OR FILL:
       * summary
       * body
       * reported
       * reviewer_name
       * reviewer_email
       * response
       * helpfulness
       */

      lastReviewId = data.id

      // REQUIRED OR CANCEL
      if (data.id && data.product_id && data.rating && Date.parse(data.date) !== NaN &&
        ((data.recommend).toLowerCase() === 'false' || data.recommend === '0' || (data.recommend).toLowerCase() === 'true') || data.recommend === '1') {

        // REQUIRED OR FILL
        if (!data.summary) { data.summary = '' }
        if (!data.body) { data.body = '' }
        if (!data.reported) { data.reported = false }
        if (!data.reviewer_name) { data.reviewer_name = '' }
        if (!data.reviewer_email) { data.reviewer_email = '' }
        if (!data.response) { data.response = '' }
        if (!data.helpfulness) { data.helpfulness = '' }

        // CONVERT REPORTED TO BOOLEAN - DEFAULT FALSE
        if ((data.reported).toLowerCase() === 'false' || data.reported === '0') {
          data.reported = false
        } else if ((data.reported).toLowerCase() === 'true' || data.reported === '1') {
          data.reported = true
        } else {
          data.reported = false
        }

        //CONVERT RECOMMEND TO BOOLEAN - DEFAULT FALSE
        if ((data.recommend).toLowerCase() === 'false' || data.recommend === '0') {
          data.recommend = false
        } else if ((data.recommend).toLowerCase() === 'true' || data.recommend === '1') {
          data.recommend = true
        } else {
          data.recommend = false
        }

        // CONVERT DATE TO MOMENT
        data.date = moment(Date.parse(data.date)).format()

        // ONLY ADD NEW PRODUCT IF IT'S NEVER BEEN ADDED BEFORE
        if (!productTracker[data.product_id]) {
          productTracker[data.product_id] = 1

          var queryStringProducts = 'INSERT INTO products (id) VALUES (?)';

          db.query(queryStringProducts, [data.product_id], (err, rows) => {
            if (err) {
              console.error(err)
            }
          });
        }

        // CREATE NEW REVIEW
        var queryString = 'INSERT INTO reviews (id, product_id, rating, date, ' +
        'summary, body, recommend, reported, reviewer_name, reviewer_email, ' +
        'response, helpfulness) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';


        db.query(queryString, [data.id, data.product_id, data.rating, data.date,
          data.summary, data.body, data.recommend, data.reported, data.reviewer_name,
          data.reviewer_email, data.response, data.helpfulness], (err, rows) => {
          if (err) {
            console.error(err)

            // LAST REVIEW
            if(lastReviewId === data.id) {
              var end = Date.now()
              console.log('TIME: ' + (end-start)/60000 + 'ms')
              console.log('review queries done')
              // CALL NEXT IMPORT
              importCharacteristics();
            }

          } else {

            // LAST REVIEW
            if(lastReviewId === data.id) {
              var end = Date.now()
              console.log('TIME: ' + (end-start)/60000 + 'ms')
              console.log('review queries done')
              //CALL NEXT IMPORT
              importCharacteristics();
            }
          }
        });

      // REQUIRED FAILED --> CANCEL
      } else {
        console.log('review data format incorrect');
        console.log(data)
      }
    })
    // CSV PARSER DONE
    .on('end', () => {
      console.log('reviews pipe done')
    });

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var importCharacteristics = () => {

  var start = Date.now();

  fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/characteristics.csv')
    .pipe(csv())
    .on('data', (data) => {
      /**
       * REQUIRED OR CANCEL:
       * id
       * product_id
       * name
       */

      lastReviewId = data.id

      // REQUIRED OR CANCEL
      if (data.id && data.product_id && data.name) {

        // CREATE PRODUCT IF IT WASN'T CREATED BY REVIEWS
        if (!productTracker[data.product_id]) {
          productTracker[data.product_id] = 1
          var queryStringProducts = 'INSERT INTO products (id) VALUES (?)';

          db.query(queryStringProducts, [data.product_id], (err, rows) => {
            if (err) {
              console.error(err)
            }
          });
        }

        // CREATE CHARACTERISTICS
        var queryString = 'INSERT INTO characteristics (id, product_id, name) VALUES (?, ?, ?)';

        db.query(queryString, [data.id, data.product_id, data.name], (err, rows) => {
          if (err) {
            console.error(err)

            // LAST CHARACTERISTIC
            if(lastReviewId === data.id) {
              var end = Date.now()
              console.log('TIME: ' + (end-start)/60000 + 'ms')
              console.log('characteristics queries done')

              // NEXT IMPORT
              importCharacteristicsReviews()
            }
          } else {

            // LAST CHARACTERISTIC
            if(lastReviewId === data.id) {
              var end = Date.now()
              console.log('TIME: ' + (end-start)/60000 + 'ms')
              console.log('char queries done')

              // NEXT IMPORT
              importCharacteristicsReviews()
            }
          }
        });

      // REQUIRED FAILED --> CANCEL
      } else {
        console.log('characteristic data format incorrect');
        console.log(data)
      }
    })

    // PIPE DONE
    .on('end', () => {
      console.log('characteristic pipe done')
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var importCharacteristicsReviews = () => {

  var start = Date.now();

  fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/characteristics_reviews.csv')
    .pipe(csv())
    .on('data', (data) => {
      /**
       * REQUIRED OR CANCEL:
       * id
       * char_id
       * review_id
       * value
       */

      lastReviewId = data.id

      // REQUIRED OR CANCEL
      if (data.id && data.characteristic_id && data.review_id && data.value) {

        // CREATE NEW CHARACTERISTICS_REVIEWS
        var queryString = 'INSERT INTO characteristics_reviews (id, char_id, review_id, value) VALUES (?, ?, ?, ?)';

        db.query(queryString, [data.id, data.characteristic_id, data.review_id, data.value], (err, rows) => {
          if (err) {
            console.error(err)
            if(lastReviewId === data.id) {

              // LAST CHAR_REV
              var end = Date.now()
              console.log('TIME: ' + (end-start)/60000 + 'ms')
              console.log('char_review queries done')

              // NEXT IMPORT
              importPhotos()
            }

          } else {

            // LAST CHAR_REV
            if(lastReviewId === data.id) {
              var end = Date.now()
              console.log('TIME: ' + (end-start)/60000 + 'ms')
              console.log('char_review queries done')

              // NEXT IMPORT
              importPhotos()
            }
          }
        });

      // REQUIRED FAILED --> CANCEL
      } else {
        console.log('characteristic_reviews data format incorrect');
        console.log(data)
      }
    })

    // PIPE DONE
    .on('end', () => {
      console.log('characteristics reviews done')
    });

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var importPhotos = () => {

  var start = Date.now();

  fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/reviews_photos.csv')
    .pipe(csv())
    .on('data', (data) => {
      /**
       * REQUIRED OR CANCEL:
       * id
       * review_id
       * url
       */
      lastReviewId = data.id

      // REQUIRED OR CANCEL
      if (data.id && data.review_id && data.url) {

        // CREATE NEW PHOTO
        var queryString = 'INSERT INTO photos_reviews (id, review_id, url) VALUES (?, ?, ?)';

        db.query(queryString, [data.id, data.review_id, data.url], (err, rows) => {
          if (err) {
            console.error(err)

            // LAST PHOTO
            if(lastReviewId === data.id) {
              var end = Date.now()
              console.log('TIME: ' + (end-start)/60000 + 'ms')
              console.log('TOTAL TIME: ' + (end-startAll)/60000 + 'ms')
              console.log('photos queries done')
            }
          } else {

            // LAST PHOTO
            if(lastReviewId === data.id) {
              var end = Date.now()
              console.log('TIME: ' + (end-start)/60000 + 'ms')
              console.log('TOTAL TIME: ' + (end-startAll)/60000 + 'ms')
              console.log('photos queries done')
            }
          }
        });

      // REQUIRED FAILED --> CANCELLED
      } else {
        console.log('reviews_photos data format incorrect');
        console.log(data)
      }
    })

    // PIPE DONE
    .on('end', () => {
      console.log('photos reviews done')
    });
}



importReview();
// importCharacteristics();
// importCharacteristicsReviews();
// importPhotos();
