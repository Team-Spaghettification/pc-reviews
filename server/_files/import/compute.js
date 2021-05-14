const _ = require('underscore');
const moment = require('moment');

const csv = require('csv-parser');
const fs = require('fs');
var db = require('../../database/index.js');

var start = Date.now();

var results = {}

//QUERY FOR PRODUCTS
var queryProducts = 'SELECT * FROM products WHERE id BETWEEN 1 AND 100000';
db.query(queryProducts, (err, products) => {
  if (err) {
    console.error(err)
  } else {

    products.map((product, p) => {

      //QUERY FOR REVIEWS PER PRODUCT
      var queryReviews = `SELECT * FROM reviews WHERE product_id = ${product.id}`;

      db.query(queryReviews, (err, reviews) => {
        if (err) {
          console.error(err)
        } else {
          if (!reviews.length) {
            results[product.id] = product
          } else {
            //QUERY FOR CHARACTERISTIC ID PER PRODUCT
            var queryReviews = `SELECT * FROM characteristics WHERE product_id = ${product.id}`;
            db.query(queryReviews, (err, characteristics) => {
              if (err) {
                console.error(err)
              } else {

                // console.log('PRODUCT', product)
                var chars = {}
                characteristics.map((characteristic) => {
                  chars[characteristic.id] = characteristic.name.toLowerCase()
                })
                // console.log('CHARS', chars)

                reviews.map((review, j) => {

                  // product.total_reviews++;
                  if(product['rating'+review.rating] !== undefined) {
                    product['rating'+review.rating]++;
                    if (review.recommend) {
                      product.recommendT++
                    } else {
                      product.recommendF++
                    }
                  }
                  // console.log(review)

                  //QUERY FOR CHARACTERISTIC ID PER PRODUCT
                  var queryReviews = `SELECT * FROM characteristics_reviews WHERE review_id = ${review.id}`;
                  db.query(queryReviews, (err, charReviews) => {
                    if (err) {
                      console.error(err)
                    } else {

                      // console.log('REVIEW LENGTH = ' + charReviews.length)
                      product.total_reviews++;
                      charReviews.map((charReview) => {

                        if(product[chars[charReview.char_id]]!== null) {
                          var ave = product[chars[charReview.char_id]];
                          ave *= (product.total_reviews -1)
                          ave += charReview.value
                          ave /= product.total_reviews
                          product[chars[charReview.char_id]] = ave

                        } else {
                          product[chars[charReview.char_id]] = charReview.value
                        }
                      }); // charcteristics_review loop
                    } // characteristics_review else

                    if (j === reviews.length -1) {
                      if (product.fit === null) {
                        product.fit = 'NULL'
                      }
                      if (product.width === null) {
                        product.width = 'NULL'
                      }
                      if (product.length === null) {
                        product.length = 'NULL'
                      }
                      if (product.comfort === null) {
                        product.comfort = 'NULL'
                      }
                      if (product.quality === null) {
                        product.quality = 'NULL'
                      }
                      if (product.size === null) {
                        product.size = 'NULL'
                      }
                      results[product.id] = product
                      // console.log(results)
                    } // update product condition
                    // console.log('P:::::::;' + p)
                    // console.log(products.length)
                    if (p === products.length -1 && j === reviews.length -1) {

                      // console.log('NUMBER OF RESULTS:' + results.length)

                      var stream = fs.createWriteStream('/Users/rrchow/Documents/immersive/sdc/pc-reviews/server/_files/clean/cleanordered/products_computed0.csv');

                      var resultsArr = Object.keys(results)
                      // console.log(resultsArr.length)
                      // console.log(results[10000])
                      var buffer = {
                        // remainingLines: []
                        lastIndex: 0
                      };
                      for (var i = 1; i <= resultsArr.length; i++) {
                        var prod = results[i]
                        // console.log(prod)
                        if (prod.total_reviews === 0) {
                          var written = stream.write(prod.id + '\n'); //<-- the place to test); //<-- the place to test
                          // if (written) {
                          //   console.log('ORIGINAL: ' + i)
                          // }
                          if (!written){
                            // buffer.remainingLines = results.slice(i);
                            buffer.lastIndex = i + 1
                            break;
                          }

                        } else {
                          var written = stream.write(prod.id + ',' +
                            prod.total_reviews + ',' +
                            prod.rating1 + ',' +
                            prod.rating2 + ',' +
                            prod.rating3 + ',' +
                            prod.rating4 + ',' +
                            prod.rating5 + ',' +
                            prod.recommendT + ',' +
                            prod.recommendF + ',' +
                            prod.fit + ',' +
                            prod.width + ',' +
                            prod.length + ',' +
                            prod.comfort + ',' +
                            prod.quality + ',' +
                            prod.size + '\n'); //<-- the place to test); //<-- the place to test
                          // if (written) {
                          //   console.log('ORIGINAL: ' + i)
                          // }
                          if (!written){
                            // buffer.remainingLines = results.slice(i);
                            buffer.lastIndex = i + 1
                            break;
                          }
                        }
                      }


                      stream.on('drain',function(){
                        if (buffer.lastIndex <= resultsArr.length/*buffer.remainingLines.length*/){
                          for (var i = buffer.lastIndex; i <= resultsArr.length; i++) {
                            var prod = results[i]
                            if (prod.total_reviews === 0) {
                              var written = stream.write(prod.id + '\n'); //<-- the place to test); //<-- the place to test
                              // if (written) {
                              //   console.log('ORIGINAL: ' + i)
                              // }
                              if (!written){
                                // buffer.remainingLines = results.slice(i);
                                buffer.lastIndex = i + 1
                                break;
                              }

                            } else {
                              var written = stream.write(prod.id + ',' +
                                prod.total_reviews + ',' +
                                prod.rating1 + ',' +
                                prod.rating2 + ',' +
                                prod.rating3 + ',' +
                                prod.rating4 + ',' +
                                prod.rating5 + ',' +
                                prod.recommendT + ',' +
                                prod.recommendF + ',' +
                                prod.fit + ',' +
                                prod.width + ',' +
                                prod.length + ',' +
                                prod.comfort + ',' +
                                prod.quality + ',' +
                                prod.size + '\n'); //<-- the place to test
                              // if (written) {
                              //     console.log('BUFFER: ' + i)
                              //   }
                              if (!written){
                                // console.log(prod.id)
                                buffer.lastIndex = i + 1
                                // buffer.remainingLines = buffer.remainingLines.slice(i);
                              }
                            }
                          }
                        }
                      });

                      console.log('update product done')
                      var end = Date.now()
                      console.log('TIME: ' + (end-start)/60000 + 'ms')
                    }

                  }); // characteristics_review query

                }) // reviews map
              } // characteristics else

            }); // characteristric query
          }
        } // reviews else

      }); // reviews query

    }) // map
  } // product else

}); // product query



// var computeProducts = () => {

//   //QUERY FOR PRODUCTS
//   var queryProducts = 'SELECT * FROM products';
//   db.query(queryProducts, (err, products) => {
//     if (err) {
//       console.error(err)
//       return
//     } else {

//       products.map((product, p) => {

//         //QUERY FOR REVIEWS PER PRODUCT
//         var queryReviews = `SELECT * FROM reviews WHERE product_id = ${product.id}`;
//         db.query(queryReviews, (err, reviews) => {
//           if (err) {
//             console.error(err)
//             return
//           } else {

//             //QUERY FOR CHARACTERISTIC ID PER PRODUCT
//             var queryReviews = `SELECT * FROM characteristics WHERE product_id = ${product.id}`;
//             db.query(queryReviews, (err, characteristics) => {
//               if (err) {
//                 console.error(err)
//                 return
//               } else {

//                 // console.log('PRODUCT', product)
//                 var chars = {}
//                 characteristics.map((characteristic) => {
//                   chars[characteristic.id] = characteristic.name.toLowerCase()
//                 })
//                 // console.log('CHARS', chars)

//                 reviews.map((review, j) => {

//                   // product.total_reviews++;
//                   if(product['rating'+review.rating] !== undefined) {
//                     product['rating'+review.rating]++;
//                     if (review.recommend) {
//                       product.recommendT++
//                     } else {
//                       product.recommendF++
//                     }
//                   }
//                   // console.log(review)

//                   //QUERY FOR CHARACTERISTIC ID PER PRODUCT
//                   var queryReviews = `SELECT * FROM characteristics_reviews WHERE review_id = ${review.id}`;
//                   db.query(queryReviews, (err, charReviews) => {
//                     if (err) {
//                       console.error(err)
//                       return
//                     } else {

//                       // console.log('REVIEW LENGTH = ' + charReviews.length)
//                       product.total_reviews++;
//                       charReviews.map((charReview) => {

//                         if(product[chars[charReview.char_id]]!== null) {
//                           var ave = product[chars[charReview.char_id]];
//                           ave *= (product.total_reviews -1)
//                           ave += charReview.value
//                           ave /= product.total_reviews
//                           product[chars[charReview.char_id]] = ave

//                         } else {
//                           product[chars[charReview.char_id]] = charReview.value
//                         }
//                       }); // charcteristics_review loop
//                     } // characteristics_review else

//                     if (j === reviews.length -1) {
//                       // console.log(product)

//                       var queryUpdate = `UPDATE products SET total_reviews = ${product.total_reviews}, ` +
//                         `rating1 = ${product.rating1}, ` +
//                         `rating2 = ${product.rating2}, ` +
//                         `rating3 = ${product.rating3}, ` +
//                         `rating4 = ${product.rating4}, ` +
//                         `rating5 = ${product.rating5}, ` +
//                         `recommendT = ${product.recommendT}, ` +
//                         `recommendF = ${product.recommendF}, ` +
//                         `fit = ${product.fit}, ` +
//                         `width = ${product.width}, ` +
//                         `length = ${product.length}, ` +
//                         `comfort = ${product.comfort}, ` +
//                         `quality = ${product.quality}, ` +
//                         `size = ${product.size} ` +
//                         `WHERE id = ${product.id}`;
//                       db.query(queryUpdate, (err, charReviews) => {
//                         if (err) {
//                           console.error(err)
//                           return
//                         } else {
//                           console.log(p)
//                           if (p === products.length -1) console.log('update product done')
//                         } // update product else

//                       }); // update product query
//                     } // update product condition

//                   }); // characteristics_review query

//                 }) // reviews map
//               } // characteristics else

//             }); // characteristric query
//           } // reviews else

//         }); // reviews query

//       }) // map
//     } // product else

//   }); // product query

//   return
// } //function

// computeProducts();