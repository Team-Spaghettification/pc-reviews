

const _ = require('underscore');
const moment = require('moment');

const csv = require('csv-parser');
const fs = require('fs');
var db = require('../../database/index.js');


const results = [];
var productTracker = {};
var dateFormat = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

var importReview = () => {

  fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/reviews.csv')
    .pipe(csv())
    .on('data', (data) => {
      /**
       * REQUIRED OR CANCEL:
       * id
       * product_id
       * rating
       * date
       * recommend
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

      if (data.id && data.product_id && data.rating &&
        data.date.match(dateFormat) &&
        ((data.recommend).toLowerCase() === 'false' || (data.recommend).toLowerCase() === 'true')) {

        if (!data.summary) { data.summary = '' }
        if (!data.body) { data.body = '' }
        if (!data.reported) { data.reported = false }
        if (!data.reviewer_name) { data.reviewer_name = '' }
        if (!data.reviewer_email) { data.reviewer_email = '' }
        if (!data.response) { data.response = '' }
        if (!data.helpfulness) { data.helpfulness = '' }

        if ((data.reported).toLowerCase() === 'false') {
          data.reported = false;
        } else if ((data.reported).toLowerCase() === 'true') {
          data.reported = true;
        } else {
          data.reported = false;
        }

        if ((data.recommend).toLowerCase() === 'false') {
          data.recommend = false;
        } else if ((data.recommend).toLowerCase() === 'true') {
          data.recommend = true;
        } else {
          data.recommend = false;
        }

        data.date = moment(data.date).format()


        if (!productTracker[data.product_id]) {
          productTracker[data.product_id] = 1
          var queryStringProducts = 'INSERT INTO products (id) VALUES (?)';

          db.query(queryStringProducts, [data.product_id], (err, rows) => {
            if (err) {
              console.error(err)
              return;
            }
          });
        }

        var queryString = 'INSERT INTO reviews (id, product_id, rating, date, ' +
        'summary, body, recommend, reported, reviewer_name, reviewer_email, ' +
        'response, helpfulness) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';


        db.query(queryString, [data.id, data.product_id, data.rating, data.date,
          data.summary, data.body, data.recommend, data.reported, data.reviewer_name,
          data.reviewer_email, data.response, data.helpfulness], (err, rows) => {
          if (err) {
            console.error(err)
            return
          }
        });
      } else {
        console.log('review data format incorrect');
        console.log(data)
        return
      }
    })
    .on('end', () => {
      console.log('reviews done')
      importCharacteristics();
      return
    });
    return
}

var importCharacteristics = () => {

  fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/characteristics.csv')
    .pipe(csv())
    .on('data', (data) => {
      /**
       * REQUIRED OR CANCEL:
       * id
       * product_id
       * name
       */

      if (data.id && data.product_id && data.name) {

        if (!productTracker[data.product_id]) {
          productTracker[data.product_id] = 1
          var queryStringProducts = 'INSERT INTO products (id) VALUES (?)';

          db.query(queryStringProducts, [data.product_id], (err, rows) => {
            if (err) {
              console.error(err)
              return;
            }
          });
        }

        var queryString = 'INSERT INTO characteristics (id, product_id, name) VALUES (?, ?, ?)';


        db.query(queryString, [data.id, data.product_id, data.name], (err, rows) => {
          if (err) {
            console.error(err)
            return
          }
        });
      } else {
        console.log('characteristic data format incorrect');
        console.log(data)
        return
      }
    })
    .on('end', () => {
      console.log('characteristic done')
      importCharacteristicsReviews()
      return
    });
    return
}

var importCharacteristicsReviews = () => {

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

      if (data.id && data.characteristic_id && data.review_id && data.value) {

        var queryString = 'INSERT INTO characteristics_reviews (id, char_id, review_id, value) VALUES (?, ?, ?, ?)';

        db.query(queryString, [data.id, data.characteristic_id, data.review_id, data.value], (err, rows) => {
          if (err) {
            console.error(err)
            return
          }
        });

      } else {
        console.log('characteristic_reviews data format incorrect');
        console.log(data)
        return
      }
    })
    .on('end', () => {
      console.log('characteristics reviews done')
      importPhotos()
      return
    });
    return
}

var importPhotos = () => {

  fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/reviews_photos.csv')
    .pipe(csv())
    .on('data', (data) => {
      /**
       * REQUIRED OR CANCEL:
       * id
       * review_id
       * url
       */

      if (data.id && data.review_id && data.url) {

        var queryString = 'INSERT INTO photos_reviews (id, review_id, url) VALUES (?, ?, ?)';

        db.query(queryString, [data.id, data.review_id, data.url], (err, rows) => {
          if (err) {
            console.error(err)
            return
          }
        });

      } else {
        console.log('reviews_photos data format incorrect');
        console.log(data)
        return
      }
    })
    .on('end', () => {
      console.log('photos reviews done')
      return
    });
    return
}



importReview();
