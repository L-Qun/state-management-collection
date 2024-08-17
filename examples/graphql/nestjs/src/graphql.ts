
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface Book {
    title?: Nullable<string>;
    authors?: Nullable<Nullable<Author>[]>;
    year?: Nullable<number>;
}

export interface Author {
    name?: Nullable<string>;
    books?: Nullable<Nullable<Book>[]>;
    nationality?: Nullable<string>;
}

export interface IQuery {
    books(): Nullable<Nullable<Book>[]> | Promise<Nullable<Nullable<Book>[]>>;
    authors(): Nullable<Nullable<Author>[]> | Promise<Nullable<Nullable<Author>[]>>;
}

export interface IMutation {
    addBook(title: string, year: number, authorNames: Nullable<string>[]): Nullable<Book> | Promise<Nullable<Book>>;
}

type Nullable<T> = T | null;
