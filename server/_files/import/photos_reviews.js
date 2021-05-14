const csv = require('csv-parser');
const fs = require('fs');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var start = Date.now();

// STREAMS
const read = fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/actual/reviews_photos.csv').pipe(csv())
const write = fs.createWriteStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/clean/photos_reviews_clean.csv')

// READ PIPE READ
read.on('data', (data) => {

  // REQUIRED OR CANCEL
  if (data.id && data.review_id) {
    if (!data.url) { data.url = ''}
    var result = write.write(data.id + ',' + data.review_id + ',"' + data.url + '"\n')
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

// var importPhotos = () => {

//   var start = Date.now();

//   fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/reviews_photos7.csv')
//     .pipe(csv())
//     .on('data', (data) => {
//       /**
//        * REQUIRED OR CANCEL:
//        * id
//        * review_id
//        * url
//        */
//       lastReviewId = data.id

//       // REQUIRED OR CANCEL
//       if (data.id && data.review_id && data.url) {

//         // CREATE NEW PHOTO
//         var queryString = 'INSERT INTO photos_reviews (id, review_id, url) VALUES (?, ?, ?)';

//         db.query(queryString, [data.id, data.review_id, data.url], (err, rows) => {
//           if (err) {
//             console.error(err)

//             // LAST PHOTO
//             if(lastReviewId === data.id) {
//               var end = Date.now()
//               console.log('TIME: ' + (end-start)/60000 + 'ms')
//               console.log('TOTAL TIME: ' + (end-startAll)/60000 + 'ms')
//               console.log('photos queries done')
//             }
//           } else {

//             // LAST PHOTO
//             if(lastReviewId === data.id) {
//               var end = Date.now()
//               console.log('TIME: ' + (end-start)/60000 + 'ms')
//               console.log('photos queries done')
//             }
//           }
//         });

//       // REQUIRED FAILED --> CANCELLED
//       } else {
//         console.log('reviews_photos data format incorrect');
//         console.log(data)
//       }
//     })

//     // PIPE DONE
//     .on('end', () => {
//       console.log('photos reviews done')
//     });
// }



// // importReview(3);
// // importCharacteristics(2);
// // importCharacteristicsReviews();
// // importPhotos();
