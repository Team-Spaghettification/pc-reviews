-- server/database/schema.sql

DROP DATABASE IF EXISTS catwalk;
CREATE DATABASE catwalk;

USE catwalk;

-- product
--     id, total_reviews, rating1, rating2, rating3, rating4, rating5, recommendT, recommendF, fit, width, length, comfort, quality, size

CREATE TABLE products (
  id              INT unsigned NOT NULL AUTO_INCREMENT UNIQUE,
  total_reviews   INT unsigned DEFAULT 0,
  rating1         INT unsigned DEFAULT 0,
  rating2         INT unsigned DEFAULT 0,
  rating3         INT unsigned DEFAULT 0,
  rating4         INT unsigned DEFAULT 0,
  rating5         INT unsigned DEFAULT 0,
  recommendT      INT unsigned DEFAULT 0,
  recommendF      INT unsigned DEFAULT 0,
  fit             DECIMAL(10,9),
  width           DECIMAL(10,9),
  length          DECIMAL(10,9),
  comfort         DECIMAL(10,9),
  quality         DECIMAL(10,9),
  size             DECIMAL(10,9),
  PRIMARY KEY     (id)
);

-- reviews
--     id, product_id, rating, date, summary, body, recommend, reported,
--     reviewer_name, reviewer_email, response, helpfulness

CREATE TABLE reviews (
  id              INT unsigned NOT NULL AUTO_INCREMENT,
  product_id      INT unsigned NOT NULL,
  rating          INT unsigned,
  date            VARCHAR(30) NOT NULL,
  summary         VARCHAR(60),
  body            VARCHAR(1000),
  recommend       BOOLEAN NOT NULL,
  reported        BOOLEAN DEFAULT false,
  reviewer_name   VARCHAR(50) NOT NULL,
  reviewer_email    VARCHAR(50) NOT NULL,
  response        VARCHAR(1000) DEFAULT '',
  helpfulness     INT DEFAULT 0,
  PRIMARY KEY     (id),
  FOREIGN KEY     (product_id) REFERENCES products(id)
);

-- characteristics
--     id, produxt_id, name

CREATE TABLE characteristics (
  id              INT unsigned NOT NULL AUTO_INCREMENT,
  product_id      INT unsigned NOT NULL,
  name            VARCHAR(7) NOT NULL,
  PRIMARY KEY     (id),
  FOREIGN KEY     (product_id) REFERENCES products(id)
);

-- characteristics_reviews
--     id, char_id, review_id, value

CREATE TABLE characteristics_reviews (
  id              INT unsigned NOT NULL AUTO_INCREMENT,
  char_id         INT unsigned NOT NULL,
  review_id       INT unsigned NOT NULL,
  value           INT unsigned NOT NULL,
  PRIMARY KEY     (id),
  FOREIGN KEY     (review_id) REFERENCES reviews(id),
  FOREIGN KEY     (char_id) REFERENCES characteristics(id)
);

-- photos
--     id, review_id, url

CREATE TABLE photos_reviews (
  id              INT unsigned NOT NULL AUTO_INCREMENT,
  review_id       INT unsigned NOT NULL,
  url             VARCHAR(250) NOT NULL,
  PRIMARY KEY     (id),
  FOREIGN KEY     (review_id) REFERENCES reviews(id)
);

-- mysql -u root < server/database/schema.sql
