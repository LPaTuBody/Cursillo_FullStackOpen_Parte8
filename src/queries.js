import { gql } from '@apollo/client';

// fragments
const BOOK_DETAILS = gql`
  fragment bookDetails on Book {
    id
    title
    published
    author {
      id
      name
      born
      bookCount
    }
    genres
  }
`

// queries
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
  query (
    $autor: String,
    $genero: String
  ) {
    allBooks (
      author: $autor,
      genre: $genero
    ) {
      ...bookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const USER_LOGGED = gql`
  query {
    me {
      username
      favGenre
      id
    }
  }
`

// mutations
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
      ...bookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const EDIT_AUTHOR = gql`
  mutation editarAutor(
    $nombre: String!,
    $anno: Int!
  ) {
    editAuthor(
      name: $nombre
      setBornTo: $anno
    ) {
      name
      born
      bookCount  
    }
  }
`

export const LOGIN = gql`
  mutation login(
    $username: String!,
    $password: String!
  ) {
    login(
      username: $username,
      password: $password
    ) {
      value
    }
  }
`

// subscriptions
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...bookDetails 
    }
  }
  ${BOOK_DETAILS}
`