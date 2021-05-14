const csv = require('csv-parser');
const fs = require('fs');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var start = Date.now();

// STREAMS
const read = fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/actual/characteristics.csv').pipe(csv())
const write = fs.createWriteStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/clean/characteristics_clean.csv')

// READ PIPE READ
read.on('data', (data) => {

  // REQUIRED OR CANCEL
  if (data.id && data.product_id && data.name) {
    var result = write.write(data.id + ',' + data.product_id + ',"' + data.name + '"\n')
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


// var importCharacteristics = (num) => {

//   var start = Date.now();

//   console.log('characteristics-'+num+'.csv')

//   fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/actual/characteristics-'+num+'.csv')
//     .pipe(csv())
//     .on('data', (data) => {
//       /**
//        * REQUIRED OR CANCEL:
//        * id
//        * product_id
//        * name
//        */

//       lastCharId = data.id

//       // REQUIRED OR CANCEL
//       if (data.id && data.product_id && data.name) {

//         // CREATE PRODUCT IF IT WASN'T CREATED BY REVIEWS
//         if (!productTracker[data.product_id]) {
//           productTracker[data.product_id] = 1
//           var queryStringProducts = 'INSERT INTO products (id) VALUES (?)';

//           db.query(queryStringProducts, [data.product_id], (err, rows) => {
//             if (err) {
//               // console.error(err)
//             }
//           });
//         }

//         // CREATE CHARACTERISTICS
//         var queryString = 'INSERT INTO characteristics (id, product_id, name) VALUES (?, ?, ?)';

//         db.query(queryString, [data.id, data.product_id, data.name], (err, rows) => {
//           if (err) {
//             console.error(err)

//             // LAST CHARACTERISTIC
//             if(lastCharId === data.id) {
//               var end = Date.now()
//               console.log('TIME: ' + (end-start)/60000 + 'ms')
//               console.log('characteristics queries done')

//               // NEXT IMPORT
//               // importCharacteristicsReviews()
//               if (num < 7) {
//                 importCharacteristics(num + 1)
//               }
//             }
//           } else {

//             // LAST CHARACTERISTIC
//             if(lastCharId === data.id) {
//               var end = Date.now()
//               console.log('TIME: ' + (end-start)/60000 + 'ms')
//               console.log('char queries done')

//               // NEXT IMPORT
//               // importCharacteristicsReviews()
//               if (num < 7) {
//                 importCharacteristics(num + 1)
//               }
//             }
//           }
//         });

//       // REQUIRED FAILED --> CANCEL
//       } else {
//         console.log('characteristic data format incorrect');
//         console.log(data)
//       }
//     })

//     // PIPE DONE
//     .on('end', () => {
//       console.log('characteristic pipe done')
//     });
// }


// importReview(3);
// importCharacteristics(2);
// importCharacteristicsReviews();
// importPhotos();
