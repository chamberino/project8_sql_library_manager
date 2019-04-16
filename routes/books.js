var express = require('express');
var router = express.Router();
var Book = require("../models").Book;

/* GET books listing. */
router.get('/', function(req, res, next) {
  Book.findAll({order: [["createdAt", "DESC"]]}).then(function(books){
    res.render("books/index", {books: books, title: "Library DB" });
  }).catch(function(error){
    res.send(500, error);
  });
});

/* POST create book. */
router.post('/', function(req, res, next) {
  Book.create(req.body).then(function(book) {
    res.redirect("/books");
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        res.render("books/new", {
          book: Book.build(req.body),
          errors: error.errors,
          title: "New Book"
        })
      } else {
        throw error;
      }
  }).catch(function(error){
      res.send(500, error);
   });
});

// res.render("books/new", {book: Book.build(req.body), errors: error.errors, title: "New Book"})

/* Create a new book form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book: Book.build(), title: "New Book"});
});

/* Delete book form. */
router.get("/:id/delete", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    if(book) {
      res.render("books/delete", {
        book: book,
        title: "Delete Book"
      });
    } else {
      res.send(404);
    }
  }).catch(function(error){
     res.send(500, error);
  });
});

/* PUT update book. */
router.put("/:id", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    if(book) {
      return book.update(req.body);
    } else {
      res.send(404);
    }
  }).then(function(book){
    res.redirect("/books");
  }).catch(function(error){
    if(error.name === "SequelizeValidationError") {
      var book = Book.build(req.body);
      book.id = req.params.id;
      res.render("books/edit", {
        book: book,
        errors: error.errors,
        title: "Edit Book"
      });
    } else {
      throw error;
    }
  }).catch(function(error){
      res.send(500, error);
  });
});

/* Delete book. */
router.delete("/:id", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    if(book) {
      return book.destroy();
    } else {
      res.send(404);
      // res.render("books/page-not-found")
    }
  }).then(function(){
    res.redirect("/books");
  }).catch(function(error){
      res.send(500, error);
  });
});

/* GET individual book. */
router.get("/:id", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    if(book) {
      res.render("books/edit", {
        book: book,
        title: book.title
      });
    } else {
      res.send(404)
      // res.render("books/page-not-found")
    }
  }).catch(function(error){
      res.send(500, error);
   });
});

module.exports = router;
