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
    }
}

module.exports = BooksService