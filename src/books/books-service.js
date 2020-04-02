const BooksService = {
    getAllBooks(knex) {
        return knex.select('*').from('books');
    },
    getBookById(knex, id) {
        return knex
            .from('books')
            .select('*')
            .where('id', id)
            .first();
    },
    insertBook(knex, newBook) {
        return knex
            .insert(newBook)
            .into('books')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    updateBook(knex, id, newBookFields) {
        return knex('books')
            .where({ id })
            .update(newBookFields)
    },
    deleteBook(knex, id) {
        return knex('books')
            .where({ id })
            .delete()
    },
    getContentForBook(knex, bookId) {
        return knex
            .select('*')
            .from('book_content')
            .where('book_id', bookId)
    }
}

module.exports = BooksService