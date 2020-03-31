TRUNCATE
    books
    RESTART IDENTITY CASCADE;

INSERT INTO books(book_name)
VALUES
    ('Book One'),
    ('Book Two'),
    ('Book Three');