const csv = require('csv-parser');
const fs = require('fs');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var start = Date.now();
var tracker = {};

// STREAMS
const read = fs.createReadStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/test/characteristics7.csv').pipe(csv())
const write = fs.createWriteStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/clean/products_clean7.csv')

// READ PIPE READ
read.on('data', (data) => {
  // REQUIRED OR CANCEL
  if (data.product_id) {
    if (tracker[data.product_id] === undefined) {
      tracker[data.product_id] = true;
      var result = write.write(data.product_id + '\n')
      if (!result) {
        read.pause()
      }
    }
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