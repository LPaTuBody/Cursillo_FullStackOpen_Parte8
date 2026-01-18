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
  query sacarLibros(
    $autor: String,
    $genero: String
  ) {
    allBooks (
      author: $autor,
      genre: $genero
    ) {
      id
      title
      published
      author {
        name
      }
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

export const USER_LOGGED = gql `
  query {
    me {
      username
      favGenre
      id
    }
  }
`