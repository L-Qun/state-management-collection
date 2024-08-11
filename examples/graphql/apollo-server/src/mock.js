const authors = []
const books = []

const book1 = { title: 'book1', authors: [], year: 2021 }
const book2 = { title: 'book2', authors: [], year: 2022 }
const book3 = { title: 'book3', authors: [], year: 2021 }

books.push(book1, book2, book3)

const author1 = {
  name: 'author1',
  books: [book1, book2],
  nationality: 'American',
}
const author2 = { name: 'author2', books: [book2], nationality: 'British' }
const author3 = { name: 'author3', books: [book3], nationality: 'Canadian' }

authors.push(author1, author2, author3)

book1.authors.push(author1, author3)
book2.authors.push(author1, author2)
book3.authors.push(author3)

export { authors, books }
