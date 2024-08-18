import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { authors, books } from './mock';
import { Book } from './models/book.model';
import { Author } from './models/author.model';

@Resolver()
export class BooksResolver {
  @Query((returns) => [Book])
  books() {
    return books;
  }

  @Query((returns) => [Author], { name: 'authors' })
  getAuthors() {
    return authors;
  }

  @Mutation((returns) => Book)
  addBook(
    @Args('title')
    title: string,
    @Args('year', {
      type: () => Int,
    })
    year: number,
    @Args('authorNames', {
      type: () => [String],
    })
    authorNames: string[],
  ) {
    const newBook = {
      title,
      year,
      authors: authors.filter((author) => authorNames.includes(author.name)),
    };
    books.push(newBook);
    return newBook;
  }
}
