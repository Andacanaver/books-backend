const ContentService = {
    getAllContent(knex) {
        return knex.select('*').from('book_content');
    },
    getById(knex, id) {
        return knex
            .from('book_content')
            .select('*')
            .where('id', id)
            .first();
    },
    insertContent(knex, newContent) {
        return knex
            .insert(newContent)
            .into('book_content')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    updateContent(knex, id, newContentFields) {
        return knex('book_content')
            .where({ id })
            .update(newContentFields)
    },
    deleteContent(knex, id) {
        return knex('book_content')
            .where({ id })
            .delete()
    },
    getContentForBook(knex, bookId) {
        return knex
            .from('book_content')
            .where('book_id', bookId)
    }
}

module.exports = ContentService