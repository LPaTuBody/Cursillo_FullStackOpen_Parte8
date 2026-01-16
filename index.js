const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");
const mongoose = require("mongoose");
require("dotenv").config();

const Book = require("./models/book");
const Author = require("./models/author");

mongoose.set("strictQuery", false);
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("connected to", MONGODB_URI)
  })
  .catch((err) => {
    console.log("error connection to MongoDB:", err.message)
  });

let authors = [];
let books = [];


const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if (!args.author && !args.genre) return books;
      const filterBy = (libro) => {
        if (!args.genre) return libro.author === args.author;
        if (!args.author) return libro.genres.includes(args.genre);
        return (libro.genres.includes(args.genre)) && (libro.author === args.author);
      }
      return books.filter(filterBy)
    },
    allAuthors: () => authors,
  },
  Author: {
    bookCount: (root) => {
      const libros = books.filter(b => b.author === root.name);
      return libros.length;
    },
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() };
      if (!authors.find(a => a.name === book.author)) {
        const autor = { name: book.author, id: uuid() };
        authors = authors.concat(autor);
      }
      books = books.concat(book);
      return book;
    },
    editAuthor: (root, args) => {
      const autor = authors.find(a => a.name === args.name);
      if (!autor) return null;
      const updAutor = { ...autor, born: args.setBornTo };
      authors = authors.map(a => a.name === updAutor.name ? updAutor : a);
      return updAutor;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
});