var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

// router.get('/', function(req, res, next) {
//   res.render('books/test');
// });
//
// router.get('/', function(req, res, next) {
//   res.render('books/books');
// });

var books = [
  {
    id: 1,
    title: "Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    year: 1927,
  },
];

/* GET books listing. */
router.get('/', function(req, res, next) {
  Book.findAll({order: [["createdAt", "DESC"]]}).then(function(books){
    res.render("books/index", {books: books, title: "Library DB" });
  });
});

// render books template
router.get('/', function(req, res, next) {
  res.render('books/booksTemp', {books});
});


/* POST create book. */
router.post('/', function(req, res, next) {
  Book.create(req.body).then(function(book) {
    res.redirect("/books/" + book.id);
  });
;});


/* Create a new book form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book: Book.build(), title: "New Book"});
});

/* GET individual article. */
router.get("/:id", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/show", {book: book, title: book.title});
  });
});

module.exports = router;
