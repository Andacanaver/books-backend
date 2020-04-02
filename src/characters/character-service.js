const CharactersService = {
    getAllCharacters(knex) {
        return knex.select('*').from('characters');
    },
    getById(knex, id) {
        return knex
            .from('characters')
            .select('*')
            .where('id', id)
            .first();
    },
    insertCharacters(knex, newcharacters) {
        return knex
            .insert(newcharacters)
            .into('characters')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    updateCharacters(knex, id, newCharactersFields) {
        return knex('characters')
            .where({ id })
            .update(newCharactersFields)
    },
    deleteCharacters(knex, id) {
        return knex('characters')
            .where({ id })
            .delete()
    },
    getCharactersForContent(knex, contentId) {
        return knex
            .from('book_characters')
            .where('book_id', contentId)
    }
}

module.exports = CharactersService