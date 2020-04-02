const xss = require('xss')
const express = require('express')
const CharacterService = require('./character-service')
const path = require('path')

const characterRouter = express.Router();
const jsonParser = express.json();

const serializeCharacter = character => ({
    id: character.id,
    character_name: xss(character.character_name),
    char_description: xss(character.char_description),
    book_content_id: character.book_content_id,
    date_created: character.date_created
})

characterRouter
    .route('/')
    .get((req, res, next) => {
        CharacterService.getAllCharacters(req.app.get('db'))
            .then(character => {
                res.json(character.map(serializeCharacter))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { character_name, char_description, book_content_id } = req.body
        for (const field of ['character_name', 'book_content_id']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });
            }
        }
        const newCharacter = { character_name, char_description, book_content_id }
        CharacterService.insertCharacters(req.app.get('db'), newCharacter)
            .then(character => {
                res.status(200)
                    .location(path.posix.join(req.originalUrl + `/${character.id}`))
                    .json(serializeCharacter(character))
            })
            .catch(next)
    })

characterRouter
    .route('/:character_id')
    .all((req, res, next) => {
        CharacterService.getById(req.app.get('db'), req.params.character_id)
            .then(character => {
                if (!character) {
                    return res.json({ error: `Character doesn't exist` })
                }
                res.character = character;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeCharacter(res.character))
    })
    .delete((req, res, next) => {
        CharacterService
            .deleteCharacters(req.app.get('db'), req.params.character_id)
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { character_name, char_description, book_content_id } = req.body
        const characterToUpdate = { character_name, char_description, book_content_id }

        const numberOfValues = Object.values(characterToUpdate).filter(Boolean)
            .length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: `Request body must contain any of the following name, description or book content id.`
            });
        }
        CharacterService.updateCharacters(
            req.app.get('db'),
            req.params.character_id,
            characterToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = characterRouter