var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
const Sequelize = require('Sequelize');
const Op = Sequelize.Op;

/* GET books listing. */
router.get('/', function(req, res, next) {
  //If search query params exist run this code to search using the following specified parameters
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
      // render index page passing in the returned books and the title of the Library.
      res.render("books/index", {books: books, title: "Library DB" });
      // catch any errors
    }).catch(function(error){
      res.send(500, error);
    });
  } else {
    // no search query exists, grab and paginate all books
    //Set item limit per page
    let limit = 5;
    let offset = 0;
    // Get number of books in db
    Book.findAndCountAll()
      .then((data) => {
        let page = 1;      // page number
        //if page being queried is not a number throw error with custom message.
        if (req.query.page && isNaN(req.query.page)){  
          throw new Error('Not a valid page number');
        };
        if (req.query.page && !isNaN(req.query.page)){ 
          page=req.query.page  //If a page number is being queried and is a number, set page number
        }     
        let pages = Math.ceil(data.count / limit);
        offset = limit * (page - 1);
        //Grab all books within limited range and offset and return them with the following attributes
        Book.findAll({
          attributes: ['id', 'title', 'author', 'genre', 'year', 'createdAt', 'updatedAt'],
          limit: limit,
          offset: offset,
          $sort: { id: 1 }    
        })
        .then((results) => { // render index passing in locals
          res.render("books/index", {books: results, count: data.count, pages: pages, title: 'Library DB'});
        })
        .catch(function(error){ // catch any errors and render page-not-found
          res.render("books/page_not_found");
          console.log(error);
       });
      })
      .catch(function(error){
        res.render("books/page_not_found");  // catch any errors and render page-not-found
        console.log(error.message);
     });
  }
});

/* POST create book. */
router.post('/', function(req, res, next) {
  //req.body contains a json object with the values of the form which maps 1:1 to the Book model.
  Book.create(req.body).then(function(book) {
    res.redirect("/books");
  }).catch(function(error){  // check for errors within body
      if(error.name === "SequelizeValidationError") {
        console.log(error.errors)
        res.render("books/new", {  // rerender new book form if any errors
          book: Book.build(req.body),
          errors: error.errors,
          title: "New Book"
        })
      } else {
        throw error;
      }
  }).catch(function(error){  //
      res.send(500, error);
   });
});

/* Create a new book form. */
router.get('/new', function(req, res, next) {
  res.render("books/new", {book: Book.build(), title: "New Book"});
});

/* Delete book form. */
router.get("/:id/delete", function(req, res, next){
  // Get book by id
  Book.findByPk(req.params.id).then(function(book){
    if(book) { // If book is matched render delete verification page
      res.render("books/delete", {
        book: book,
        title: "Delete Book"
      });
    } else { // else set http response status
      res.send(404);
    }
  }).catch(function(error){ // catch any errors
     res.send(500, error);
  });
});

/* PUT update book. */
router.put("/:id", function(req, res, next){
  // Get book by id
  Book.findByPk(req.params.id).then(function(book){
    if(book) { // if matching books exists, update it with the json data
      return book.update(req.body);
    } else {
      res.send(404);
    }
  }).then(function(book){  // If successful rerender index page
    res.redirect("/books");
  }).catch(function(error){ //catch any errors and rerender edit page setting locals
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
  }).catch(function(error){  //catch any errors
      res.send(500, error);
  });
});

/* Delete book. */
// Get book by id
router.delete("/:id", function(req, res, next){
  Book.findByPk(req.params.id).then(function(book){
    if(book) { //if matched book exists, delete it
      return book.destroy();
    } else { // book doesn't exists, redirect to not-found page
      // res.send(404);
      res.render("books/page-not-found")
    }
  }).then(function(){ //after successful deletion send back to index
    res.redirect("/books");
  }).catch(function(error){  // catch any errors
      res.send(500, error);
  });
});

/* GET individual book. */
router.get("/:id", function(req, res, next){
  // Get book by id
  Book.findByPk(req.params.id).then(function(book){
    if(book) { //if matching books exists render edit match and pass in locals
               //so form fields will be filled with matching values
      res.render("books/edit", {
        book: book,
        title: book.title
      });
    } else {
      throw new Error('No book attached to ID given'); //throw custom error
    }
  }).catch(function(error){
      res.render("books/page-not-found"); //catch any errors
      console.log(error.message);
   });
});

module.exports = router;