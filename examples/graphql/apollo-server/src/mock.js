const authors = []
const books = []

const book1 = { title: 'book1', authors: [] }
const book2 = { title: 'book2', authors: [] }

books.push(book1, book2)

const author1 = { name: 'author1', books: [book1, book2] }
const author2 = { name: 'author2', books: [book2] }

authors.push(author1, author2)

book1.authors.push(author1)
book2.authors.push(author1, author2)

export { authors, books }
