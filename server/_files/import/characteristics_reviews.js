const csv = require('csv-parser');
const fs = require('fs');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var start = Date.now();

// STREAMS
const read = fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/actual/characteristic_reviews.csv').pipe(csv())
const write = fs.createWriteStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/clean/characteristics_reviews_clean.csv')

// READ PIPE READ
read.on('data', (data) => {

  // REQUIRED OR CANCEL
  if (data.id && data.characteristic_id && data.review_id && data.value) {
    var result = write.write(data.id + ',' + data.characteristic_id + ',' + data.review_id + ',' + data.value + '\n')
    if (!result) {
      read.pause()
    }

  // REQUIRED FAILED --> CANCEL
  } else {
    console.log('characteristic data format incorrect');
    console.log(data)
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

// var importCharacteristicsReviews = () => {

//   var start = Date.now();

//   fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/characteristics_reviews7.csv')
//     .pipe(csv())
//     .on('data', (data) => {
//       /**
//        * REQUIRED OR CANCEL:
//        * id
//        * char_id
//        * review_id
//        * value
//        */

//       lastReviewId = data.id

//       // REQUIRED OR CANCEL
//       if (data.id && data.characteristic_id && data.review_id && data.value) {

//         // CREATE NEW CHARACTERISTICS_REVIEWS
//         var queryString = 'INSERT INTO characteristics_reviews (id, char_id, review_id, value) VALUES (?, ?, ?, ?)';

//         db.query(queryString, [data.id, data.characteristic_id, data.review_id, data.value], (err, rows) => {
//           if (err) {
//             console.error(err)
//             if(lastReviewId === data.id) {

//               // LAST CHAR_REV
//               var end = Date.now()
//               console.log('TIME: ' + (end-start)/60000 + 'ms')
//               console.log('char_review queries done')

//               // NEXT IMPORT
//               // importPhotos()
//             }

//           } else {

//             // LAST CHAR_REV
//             if(lastReviewId === data.id) {
//               var end = Date.now()
//               console.log('TIME: ' + (end-start)/60000 + 'ms')
//               console.log('char_review queries done')

//               // NEXT IMPORT
//               // importPhotos()
//             }
//           }
//         });

//       // REQUIRED FAILED --> CANCEL
//       } else {
//         console.log('characteristic_reviews data format incorrect');
//         console.log(data)
//       }
//     })

//     // PIPE DONE
//     .on('end', () => {
//       console.log('characteristics reviews done')
//     });

// }

// // importReview(3);
// // importCharacteristics(2);
// // importCharacteristicsReviews();
// // importPhotos();
