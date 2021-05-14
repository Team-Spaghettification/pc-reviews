const moment = require('moment');
const csv = require('csv-parser');
const fs = require('fs');

var start = Date.now();

// STREAMS
const read = fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/actual/reviews.csv').pipe(csv())
const write = fs.createWriteStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/clean/reviews_cleantest.csv')

// READ PIPE READ
read.on('data', (data) => {

  if (!data.summary) { data.summary = '' }
  if (data.summary.length > 100) {
    data.summary = data.summary.substring(0, 100)
  }
  if (!data.body) { data.body = '' }
  if (data.body.length > 1000) {
    data.body = data.body.substring(0, 1000)
  }
  if (!data.reported) { data.reported = 'false' }
  if (!data.reviewer_email) { data.reviewer_email = '' }
  if (data.response === 'null' || !data.response || data.response === null) {
    data.response = 'NULL'
  } else {
    data.response = '"' + data.response + '"'
  }
  if (data.response === 'null') { data.response = '' }
  if (!data.helpfulness) { data.helpfulness = '' }

  // CONVERT REPORTED TO BOOLEAN - DEFAULT FALSE
  if (data.reported.length) {
    if ((data.reported).toLowerCase() === 'false' || data.reported === '0') {
      data.reported = 'false'
    } else if ((data.reported).toLowerCase() === 'true' || data.reported === '1') {
      data.reported = 'true'
    } else {
      data.reported = 'false'
    }
  } else {
    data.reported = 'false'
  }

  //CONVERT RECOMMEND TO BOOLEAN - DEFAULT FALSE
  if ((data.recommend).toLowerCase() === 'false' || data.recommend === '0') {
    data.recommend = 'false'
  } else if ((data.recommend).toLowerCase() === 'true' || data.recommend === '1') {
    data.recommend = 'true'
  } else {
    data.recommend = 'false'
    data.reported = 'true'
  }

  // REQUIRED OR REPORT
  if (!data.id) { data.reported = 'true' }
  if (!data.product_id) { data.reported = 'true' }
  if (!data.rating) { data.reported = 'true', data.rating = 0 }
  if (moment(Date.parse(data.date)).format() === 'Invalid date') {
    data.reported = 'true'
  }
  if (data.reviewer_name === 'null' || !data.reviewer_name || data.reviewer_name === null) {
    data.reviewer_name = '';
    data.reported = 'true'
  }

  // CONVERT DATE TO MOMENT
  data.date = moment(Date.parse(data.date)).format()

    var result = write.write(
      data.id + ',' + data.product_id + ',' + data.rating + ',"' + data.date + '","'
      + data.summary + '","' + data.body + '",' + data.recommend + ',' + data.reported + ',"'
      + data.reviewer_name + '","' + data.reviewer_email + '",' + data.response + ','
      + data.helpfulness + '\n')
    if (!result) {
      read.pause()
    }
})

// PIPE DONE
read.on('end', () => {
  write.end()
})

write.on('drain', () => {
  read.resume()
})

write.on('close', () => {
  console.log('write done')
  var end = Date.now()
  console.log('TIME: ' + (end-start)/60000 + 'ms')
})


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var importReview = (num) => {

//   var start = Date.now()

//   console.log('reviews-'+num+'.csv')

//   fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/actual/reviews-'+num+'.csv')
//     .pipe(csv())
//     .on('data', (data) => {
//       /**
//        * REQUIRED OR REPORT:
//        * id
//        * product_id
//        * rating
//        * date = date
//        * recommend = T/F/1/0
//        */

//       /**
//        * REQUIRED OR FILL:
//        * summary
//        * body
//        * reported
//        * reviewer_name
//        * reviewer_email
//        * response
//        * helpfulness
//        */

//       lastReviewId = data.id



//       // REQUIRED OR FILL
//       if (!data.summary) { data.summary = '' }
//       if (data.summary.length > 100) {
//         data.summary = data.summary.substring(0, 100)
//       }
//       if (!data.body) { data.body = '' }
//       if (data.body.length > 1000) {
//         data.body = data.body.substring(0, 1000)
//       }
//       if (!data.reported) { data.reported = false }
//       if (!data.reviewer_name) { data.reviewer_name = '' }
//       if (!data.reviewer_email) { data.reviewer_email = '' }
//       if (!data.response) { data.response = '' }
//       if (!data.helpfulness) { data.helpfulness = '' }

//       // CONVERT REPORTED TO BOOLEAN - DEFAULT FALSE
//       if (data.reported.length) {
//         if ((data.reported).toLowerCase() === 'false' || data.reported === '0') {
//           data.reported = false
//         } else if ((data.reported).toLowerCase() === 'true' || data.reported === '1') {
//           data.reported = true
//         } else {
//           data.reported = false
//         }
//       } else {
//         data.reported = false
//       }

//       //CONVERT RECOMMEND TO BOOLEAN - DEFAULT FALSE
//       if ((data.recommend).toLowerCase() === 'false' || data.recommend === '0') {
//         data.recommend = false
//       } else if ((data.recommend).toLowerCase() === 'true' || data.recommend === '1') {
//         data.recommend = true
//       } else {
//         data.recommend = false
//         data.reported = true
//       }

//       // REQUIRED OR REPORT
//       if (!data.id) { data.reported = true }
//       if (!data.product_id) { data.reported = true }
//       if (!data.rating) { data.reported = true, data.rating = 0 }
//       if (moment(Date.parse(data.date)).format() === 'Invalid date') {
//         console.log('NO')
//         data.reported = true
//         data.date = ''
//       }

//       // CONVERT DATE TO MOMENT
//       data.date = moment(Date.parse(data.date)).format()

//       // ONLY ADD NEW PRODUCT IF IT'S NEVER BEEN ADDED BEFORE
//       if (!productTracker[data.product_id]) {
//         productTracker[data.product_id] = 1

//         var queryStringProducts = 'INSERT INTO products (id) VALUES (?)';

//         db.query(queryStringProducts, [data.product_id], (err, rows) => {
//           if (err) {
//             console.error(err)
//           }
//         });
//       }

//       // CREATE NEW REVIEW
//       var queryString = 'INSERT INTO reviews (id, product_id, rating, date, ' +
//       'summary, body, recommend, reported, reviewer_name, reviewer_email, ' +
//       'response, helpfulness) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';


//       db.query(queryString, [data.id, data.product_id, data.rating, data.date,
//         data.summary, data.body, data.recommend, data.reported, data.reviewer_name,
//         data.reviewer_email, data.response, data.helpfulness], (err, rows) => {
//         if (err) {
//           console.error(err)

//           // LAST REVIEW
//           if(lastReviewId === data.id) {
//             var end = Date.now()
//             console.log('TIME: ' + (end-start)/60000 + 'ms')
//             console.log('review queries done')
//             // CALL NEXT IMPORT
//             // importCharacteristics();
//             if (num < 12) {
//               importReview(num + 1)
//             }
//           }

//         } else {

//           // LAST REVIEW
//           if(lastReviewId === data.id) {
//             var end = Date.now()
//             console.log('TIME: ' + (end-start)/60000 + 'ms')
//             console.log('review queries done')
//             //CALL NEXT IMPORT
//             // importCharacteristics();
//             if (num < 12) {
//               importReview(num + 1)
//             }
//           }
//         }
//       });

//       // REQUIRED FAILED --> CANCEL
//       // } else {
//       //   console.log('review data format incorrect');
//       //   console.log(data)
//       // }
//     })
//     // CSV PARSER DONE
//     .on('end', () => {
//       console.log('reviews pipe done')
//     });

// }

// // importReview(3);
// // importCharacteristics(2);
// // importCharacteristicsReviews();
// // importPhotos();
