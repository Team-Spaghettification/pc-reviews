var db = require('../database/index.js');
var moment = require('moment')

exports.getReviews = (req, res) => {

  var product_id = req.query.product_id
  var count = parseInt(req.query.count) || 5
  var page = parseInt(req.query.page) || 1
  var sort = req.query.sort || 'relevance'

  if (product_id === undefined ) {
    res.sendStatus(422)
    return;
  }

  var queryString = `SELECT id AS review_id, rating, summary, recommend, response, body,
  date, reviewer_name, helpfulness FROM reviews WHERE product_id = ${product_id} AND reported = 'false' LIMIT ${count * page}`
  db.query(queryString, (err, results) => {
    if (err) {
      res.sendStatus(404)
    } else {

      if (!results.length) {
        res.send([])
      } else {
        results.map((result, i) => {
          if (result.response === '') {
            result.response = null
          }


          var queryPhotos = `SELECT id, url FROM photos_reviews WHERE review_id = ${result.review_id}`
          db.query(queryPhotos, (err, resultsPhotos) => {
            if (err) {
              res.sendStatus(404)
            } else {
              result.photos = resultsPhotos
              if (i === results.length -1) {

                results = results.slice((page - 1) * count, (page - 1) * count + count)
                var response = {
                  "product": product_id,
                  "page": page,
                  "count": count,
                  "results": results
                }
                res.send(response)
              }
            }

          })
        })

      }


    }
  })
  // res.send('hello reviews')
}

exports.getMeta = (req, res) => {
  var product_id = req.query.product_id

  if (product_id === undefined ) {
    res.sendStatus(422)
    return;
  }

  var queryString = `SELECT id AS product_id, rating1, rating2, rating3, rating4, rating5,
    recommendT, recommendF, fit AS Fit, width AS Width, length AS Length,
    comfort AS Comfort, quality AS Quality, size AS Size FROM products WHERE id = ${product_id}`
  db.query(queryString, (err, results) => {
    if (err) {
      res.sendStatus(404)
    } else {

      var queryChar = `SELECT * FROM characteristics WHERE product_id = ${product_id}`
      db.query(queryChar, (err, resultsChar) => {
        if (err) {
          res.sendStatus(404)
        } else {
          results = results[0]
          var characteristics = {};

          resultsChar.map((char, i) => {
            characteristics[char.name] = {
              "id": char.id,
              "value": results[char.name].toFixed(9)
            }

            var ratings = {}
            if (results.rating1) { ratings["1"] = results.rating1.toString() }
            if (results.rating2) { ratings["2"] = results.rating2.toString() }
            if (results.rating3) { ratings["3"] = results.rating3.toString() }
            if (results.rating4) { ratings["4"] = results.rating4.toString() }
            if (results.rating5) { ratings["5"] = results.rating5.toString() }

            var recommended = {
              "false": results.recommendF.toString(),
              "true": results.recommendT.toString()
            }

            var response = {
              "product_id": product_id.toString(),
              "ratings": ratings,
              "recommended": recommended,
              "characteristics": characteristics
            }
            if (i === resultsChar.length -1) {
              res.send(response)
            }
          })
          // res.send(results)
        }
      })
    }
  })
}

exports.report = (req, res) => {
  var review_id = req.params.review_id

  if (review_id === undefined) {
    res.sendStatus(422)
    return
  }

  var queryString = `UPDATE reviews SET reported = 'true' WHERE id = ${review_id};`
  db.query(queryString, (err, results) => {
    if (err) {
      res.sendStatus(404)
    } else {
      res.sendStatus(204)
    }
  })
}

exports.helpful = (req, res) => {
  var review_id = req.params.review_id

  if (review_id === undefined) {
    res.sendStatus(422)
    return
  }

  var queryString = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${review_id};`
  db.query(queryString, (err, results) => {
    if (err) {
      res.sendStatus(404)
    } else {
      res.sendStatus(204)
    }
  })
}

exports.post = (req, res) => {
  var {product_id, rating, summary, body, recommend, name, email, photos, characteristics} = req.body
  if (!(product_id && rating && summary && body &&
    recommend !== undefined && name && email && photos && characteristics)) {
    res.sendStatus(422)
    return
  }

  if(typeof recommend !== 'boolean') {
    res.sendStatus(422)
    return;
  }

  var queryProduct = `SELECT * FROM products WHERE id = ${product_id}`
  db.query(queryProduct, (err, resultsProd) => {
    if (err) {
      res.sendStatus(422)
    } else {

      var queryChar = `SELECT * FROM characteristics WHERE product_id = ${product_id}`
      db.query(queryChar, (err, resultsChar) => {
        if (err) {
          res.sendStatus(422)
        } else {
          resultsProd = resultsProd[0]
          var oldProd = JSON.parse(JSON.stringify(resultsProd))

          for (var i = 0; i < resultsChar.length; i++) {
            var char = resultsChar[i]
            var val = characteristics[char.id]
            if (val === undefined) {
              res.sendStatus(422)
              return
            }
            if (resultsProd[char.name.toLowerCase()] === null) {
              resultsProd[char.name.toLowerCase()] = val
            } else {
              var oldAve = resultsProd[char.name.toLowerCase()]
              var oldTotal = oldAve * resultsProd.total_reviews
              var newTotal = oldTotal + val
              var newAve = newTotal / (resultsProd.total_reviews + 1)
              resultsProd[char.name.toLowerCase()] = newAve
            }


            // ALL CHARACTERISTICS HAVE BEEN LOOPED THROUGH
            if (i === resultsChar.length -1) {
              if (recommend) {
                recommend = 'true'
              } else {
                recommend = 'false'
              }
              resultsProd['rating' + rating]++
              resultsProd['total_reviews']++
              // res.send(resultsProd)
              var r = {
                product_id,
                rating,
                date: moment(Date.now()).format(),
                summary,
                body,
                recommend,
                reported: 'false',
                reviewer_name: name,
                reviewer_email: email,
                response: '',
                helpfulness: 0,
              }

              var queryReviewsPost = `INSERT INTO reviews (product_id, rating, date, summary, body, ` +
              `recommend, reported, reviewer_name, reviewer_email, response, helpfulness) ` +
              `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

              db.query(queryReviewsPost, Object.values(r), (err, resultsReviewsPost) => {
                if (err) {
                  res.send(err)
                } else {
                  var {insertId} = resultsReviewsPost
                  var queryPhotos = `INSERT INTO photos_reviews (review_id, url) VALUES (?, ?)`
                  var photosCount = 0;
                  for (var i = 0; i < photos.length; i++) {
                    db.query(queryPhotos, [insertId, photos[i]], (err, resultsPhotos) => {
                      photosCount++
                      if (err) {
                        res.sendStatus(422)
                        return
                      } else {
                        if (photosCount === photos.length) {
                          var queryCR = `INSERT INTO characteristics_reviews (char_id, review_id, value)
                            VALUES (?, ?, ?)`

                            var countChar = 0;
                            var charIds = Object.keys(characteristics)

                            for (var i = 0; i < charIds.length; i++) {

                              db.query(queryCR, [charIds[i], insertId, characteristics[charIds[i]]], (err, resultsCR) => {
                                countChar++;
                                if (err) {
                                  res.send(err)
                                } else {
                                  if (countChar === charIds.length) {
                                    var querySetArr = []
                                    for (var key in resultsProd) {
                                      if (resultsProd[key] !== oldProd[key]) {
                                        querySetArr.push(key + ' = ' + resultsProd[key])
                                      }
                                    }
                                    var querySet = querySetArr.join(', ')


                                    var queryProdUp = `UPDATE products SET ${querySet} WHERE id = ${product_id}`
                                    db.query(queryProdUp, (err, results) => {
                                      if (err) {
                                        res.sendStatus(422)
                                      } else {
                                        res.sendStatus(201)
                                      }
                                    })
                                  }
                                }
                              })
                            }
                          // res.send('count ' + photosCount)
                        }
                      }
                    })
                  }
                  // res.send(results)
                }
              })
              // res.send(r)
            }
          }
        }
      })
    }
  })
  // res.send('hello add')
}