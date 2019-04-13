var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

/* GET books listing. */
router.get('/', function(req, res, next) {
  Book.findAll({order: [["createdAt", "DESC"]]}).then(function(books){
    res.render("books/index", {books: books, title: "Library DB" });
  });
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

/* Edit book form. */
router.get("/:id/edit", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/edit", {book: book, title: "Edit Book"});
  });
});

/* PUT update book. */
router.put("/:id", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    return book.update(req.body);
  }).then(function(book){
    res.redirect("/books/" + book.id);
  });
});

/* Delete book form. */
router.delete("/:id", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    return book.destroy();
  }).then(function(){
    res.redirect("/books");
  });
});

/* GET individual book. */
router.get("/:id", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    res.render("books/showTemp", {book: book, title: book.title});
  });
});

module.exports = router;