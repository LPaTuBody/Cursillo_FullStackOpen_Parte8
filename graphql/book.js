const Book = require("../models/book");
const Author = require("../models/author");
const { GraphQLError } = require("graphql");
const { createPubSub  } = require("graphql-yoga");
const pubsub = createPubSub();

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
  }

  type Subscription {
    bookAdded: Book!
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => (await Book.collection.countDocuments()),
    allBooks: async (root, args) => {
      const { author, genre } = args;
      var filtrarPor = {};

      if (author) {
        const autor = await Author.find({ name: author });
        filtrarPor = { ...filtrarPor, author: autor[0].id };
      };
      if (genre) filtrarPor = { ...filtrarPor, genres: genre };

      const libros = await Book.find(filtrarPor).populate("author");
      return libros;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!Object.keys(context).length > 0) {
        throw new GraphQLError(
          "Se requiere autorización para realizar esta acción", {
          extensions: { code: "AUTHORIZATION_REQUIRED" }
        });
      }
      if (context.jwtError) {
        throw new GraphQLError(
          context.jwtError, {
          extensions: { code: "JWT_ERROR" }
        });
      }
      if (args.title.length < 3) {
        throw new GraphQLError(
          "El título debe contener más de 3 caracteres", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
          }
        });
      }

      const autor = await Author.find({ name: args.author });
      var book = {};

      if (autor.length === 0) {
        if (args.author.length < 4) throw new GraphQLError(
          "El nombre del autor debe ser de más de 4 caracteres", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.author,
          }
        });

        const newAuthor = new Author({ name: args.author });
        newAuthor.save();
        book = await Book.create({ ...args, author: newAuthor.id });
      } else {
        book = await Book.create({ ...args, author: autor[0].id });
      }

      await book.populate("author");
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
      return book;
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.subscribe("BOOK_ADDED"),
    }
  },
};

module.exports = { typeDefs, resolvers };