/**
 * GET /books
 * List all books.
 */

const Book = require('../models/Book.js');

exports.getBooks = (req, res) => {
  Book.find((err, docs) => {
    return res.render('books', {
      books: docs
    });
  });
};
