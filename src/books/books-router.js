const xss = require('xss')
const express = require('express')
const BooksService = require('./books-service')
const path = require('path')

const booksRouter = express.Router();
const jsonParser = express.json();

const serializeBook = book => ({
    id: book.id,
    book_name: xss(book.book_name),
    date_created: book.date_created
})

const serializeContent = content => ({
    id: content.id,
    title: xss(content.title),
    plot: xss(content.plot),
    book_id: content.book_id,
    date_created: content.date_created
})

booksRouter
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

booksRouter
    .route('/:book_id')
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
    .delete((req, res, next) => {
        BooksService
            .deleteBook(req.app.get('db'), req.params.book_id)
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { book_name } = req.body
        const bookToUpdate = { book_name }

        const numberOfValues = Object.values(bookToUpdate).filter(Boolean)
            .length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: `Request body must contain any of the following, name.`
            });
        }
        BooksService.updateBook(
            req.app.get('db'),
            req.params.book_id,
            bookToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

booksRouter
    .route('/:book_id/content')
    .get((req, res, next) => {
        console.log(req.params.book_id)
        BooksService.getContentForBook(req.app.get('db'), req.params.book_id)
            .then(content => {
                res.json(content.map(serializeContent));
            })
            .catch(next)
            console.p
    })

module.exports = booksRouter