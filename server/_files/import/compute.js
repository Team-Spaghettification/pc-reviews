const _ = require('underscore');
const moment = require('moment');

const csv = require('csv-parser');
const fs = require('fs');
var db = require('../../database/index.js');

var computeProducts = () => {

  //QUERY FOR PRODUCTS
  var queryProducts = 'SELECT * FROM products';
  db.query(queryProducts, (err, products) => {
    if (err) {
      console.error(err)
      return
    } else {

      products.map((product, p) => {

        //QUERY FOR REVIEWS PER PRODUCT
        var queryReviews = `SELECT * FROM reviews WHERE product_id = ${product.id}`;
        db.query(queryReviews, (err, reviews) => {
          if (err) {
            console.error(err)
            return
          } else {

            //QUERY FOR CHARACTERISTIC ID PER PRODUCT
            var queryReviews = `SELECT * FROM characteristics WHERE product_id = ${product.id}`;
            db.query(queryReviews, (err, characteristics) => {
              if (err) {
                console.error(err)
                return
              } else {

                // console.log('PRODUCT', product)
                var chars = {}
                characteristics.map((characteristic) => {
                  chars[characteristic.id] = characteristic.name.toLowerCase()
                })
                // console.log('CHARS', chars)

                reviews.map((review, j) => {

                  // product.total_reviews++;
                  product['rating'+review.rating]++;
                  if (review.recommend) {
                    product.recommendT++
                  } else {
                    product.recommendF++
                  }
                  // console.log(review)

                  //QUERY FOR CHARACTERISTIC ID PER PRODUCT
                  var queryReviews = `SELECT * FROM characteristics_reviews WHERE review_id = ${review.id}`;
                  db.query(queryReviews, (err, charReviews) => {
                    if (err) {
                      console.error(err)
                      return
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
                      // console.log(product)

                      var queryUpdate = `UPDATE products SET total_reviews = ${product.total_reviews}, ` +
                        `rating1 = ${product.rating1}, ` +
                        `rating2 = ${product.rating2}, ` +
                        `rating3 = ${product.rating3}, ` +
                        `rating4 = ${product.rating4}, ` +
                        `rating5 = ${product.rating5}, ` +
                        `recommendT = ${product.recommendT}, ` +
                        `recommendF = ${product.recommendF}, ` +
                        `fit = ${product.fit}, ` +
                        `width = ${product.width}, ` +
                        `length = ${product.length}, ` +
                        `comfort = ${product.comfort}, ` +
                        `quality = ${product.quality}, ` +
                        `size = ${product.size} ` +
                        `WHERE id = ${product.id}`;
                      db.query(queryUpdate, (err, charReviews) => {
                        if (err) {
                          console.error(err)
                          return
                        } else {
                          console.log(p)
                          if (p === products.length -1) console.log('update product done')
                        } // update product else

                      }); // update product query
                    } // update product condition

                  }); // characteristics_review query

                }) // reviews map
              } // characteristics else

            }); // characteristric query
          } // reviews else

        }); // reviews query

      }) // map
    } // product else

  }); // product query

  return
} //function

computeProducts();