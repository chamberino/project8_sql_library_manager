var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
const Sequelize = require('Sequelize');
const Op = Sequelize.Op;

/* GET books listing. */
router.get('/', function(req, res, next) {
  //If search query params exist run this code
  if(req.query.search){
    Book.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${req.query.search}%`
            }
          },
          {
            author: {
              [Op.like]: `%${req.query.search}%`
            }
          },
          {
            genre: {
              [Op.like]: `%${req.query.search}%`
            }
          },
          {
            year: {
              [Op.like]: `%${req.query.search}%`
            }
          }
        ]
      }
    }).then(function(books){
      // res.redirect(`/books/${req.query}`);
      res.render("books/index", {books: books, title: "Library DB" });
      // res.send('howdy');
    }).catch(function(error){
      res.send(500, error);
    });
  } else {
    // no search query exists, grab and paginate all books
    let limit = 5;
    let offset = 0;
    Book.findAndCountAll()
      .then((data) => {
        let page = 1;      // page number
        if (req.query.page && isNaN(req.query.page)){
          throw new Error('Not a valid page number');
        };
        if (req.query.page){
          page=req.query.page
        }     
        let pages = Math.ceil(data.count / limit);
        offset = limit * (page - 1);
        
        Book.findAll({
          attributes: ['id', 'title', 'author', 'genre', 'year', 'createdAt', 'updatedAt'],
          limit: limit,
          offset: offset,
          $sort: { id: 1 }    
        })
        .then((results) => {
          res.render("books/index", {books: results, count: data.count, pages: pages, title: 'Library DB'});
        })
        .catch(function(error){
          res.render("books/page_not_found");
          console.log(error);
       });
      })
      .catch(function(error){
        res.render("books/page_not_found");
        console.log(error.message);
     });
  }
});

/* POST create book. */
router.post('/', function(req, res, next) {
  //req.body contains a json object with the values of the form which maps 1:1 to the Book model.
  Book.create(req.body).then(function(book) {
    res.redirect("/books");
  }).catch(function(error){
      if(error.name === "SequelizeValidationError") {
        console.log(error.errors)
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
      // res.send(404);
      res.render("books/page-not-found")
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
      throw new Error('No book attached to ID given');
    }
  }).catch(function(error){
      res.render("books/page-not-found");
      console.log(error.message);
   });
});

module.exports = router;