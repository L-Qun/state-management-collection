import { Field, ObjectType } from '@nestjs/graphql';
import { Book } from './book.model';

@ObjectType()
export class Author {
  @Field()
  name: string;

  @Field((type) => [Book])
  books: Book[];

  @Field()
  nationality: string;
}
