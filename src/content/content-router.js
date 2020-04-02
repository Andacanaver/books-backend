const xss = require('xss')
const express = require('express')
const ContentService = require('./content-service')
const path = require('path')

const contentRouter = express.Router();
const jsonParser = express.json();

const serializeContent = content => ({
    id: content.id,
    title: xss(content.title),
    plot: xss(content.plot),
    book_id: content.book_id,
    date_created: content.date_created
})

contentRouter
    .route('/')
    .get((req, res, next) => {
        ContentService.getAllContent(req.app.get('db'))
            .then(content => {
                res.json(content.map(serializeContent))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, plot, book_id } = req.body
        for (const field of ['title', 'book_id']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });
            }
        }
        const newContent = { title, plot, book_id }
        ContentService.insertContent(req.app.get('db'), newContent)
            .then(content => {
                res.status(200)
                    .location(path.posix.join(req.originalUrl + `/${content.id}`))
                    .json(serializeContent(content))
            })
            .catch(next)
    })

contentRouter
    .route('/:content_id')
    .all((req, res, next) => {
        ContentService.getById(req.app.get('db'), req.params.content_id)
            .then(content => {
                if (!content) {
                    return res.json({ error: `Content doesn't exist` })
                }
                res.content = content;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeContent(res.content))
    })
    .delete((req, res, next) => {
        ContentService
            .deleteContent(req.app.get('db'), req.params.content_id)
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, plot, book_id } = req.body
        const contentToUpdate = { title, plot, book_id }

        const numberOfValues = Object.values(contentToUpdate).filter(Boolean)
            .length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: `Request body must contain any of the following title, plot or book.`
            });
        }
        ContentService.updateContent(
            req.app.get('db'),
            req.params.content_id,
            contentToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = contentRouter