import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Author } from './author.model';

@ObjectType()
export class Book {
  @Field({ description: 'The title of the book.' })
  title: string;

  @Field((type) => [Author])
  authors: Author[];

  @Field((type) => Int)
  year: number;
}
