import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { authors, books } from './mock';

@Resolver()
export class BooksResolver {
  @Query()
  books() {
    return books;
  }

  @Query('authors')
  getAuthors() {
    return authors;
  }

  @Mutation()
  addBook(
    @Args('title') title: string,
    @Args('year') year: number,
    @Args('authorNames') authorNames: string[],
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
