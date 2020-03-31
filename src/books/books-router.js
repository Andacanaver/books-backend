const xss = require('xss')
const express = require('express')
const BooksService = require('./books-service')
const path = require('path')
const BooksRouter = express.Router();
const jsonParser = express.json();

const serializeBook = book => ({
    id: book.id,
    book_name: xss(book.book_name),
    date_created: book.date_created
})

BooksRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        BooksService.getAllBooks(knexInstance)
            .then(books => {
                res.json(books.map(serializeBook));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const {book_name} = req.body;
        const newBook = { book_name }

        for (const [key, value] of Object.entries(newBook))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        BooksService.insertBook(req.app.get('db'), newBook)
                .then(book => {
                    res.status(200)
                        .location(path.posix.join(req.originalUrl + `/${book.id}`))
                        .json(serializeBook(book))
                })
                .catch(next)
    })

BooksRouter
    .route('./:book_id')
    .all((req, res, next) => {
        BooksService.getBookById(req.app.get('db'), req.params.book_id)
            .then(book => {
                if(!book) {
                    return res.json({ error: `Book doesn't exist` })
                }
                res.book = book;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBook(res.book))
    })