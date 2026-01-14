import { gql } from '@apollo/client';

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      id
      title
      published
      author
      genres
    }
  }
`

export const CREATE_BOOK = gql`
  mutation crearLibro(
    $titulo: String!,
    $publicado: Int!,
    $autor: String!,
    $generos: [String!]!
  ) {
    addBook(
      title: $titulo,
      published: $publicado,
      author: $autor,
      genres: $generos
    ) {
      title
      published
      author
      genres
    }
  }
`