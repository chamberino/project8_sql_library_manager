var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('books');
});

module.exports = router;
