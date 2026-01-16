const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql")
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
    bookCount: async () => (await Book.collection.countDocuments()),
    authorCount: async () => (await Author.collection.countDocuments()),
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
    allAuthors: async () => (await Author.find({})),
  },
  Author: {
    bookCount: async (root) => {
      const libros = await Book.find({ author: root.id });
      return libros.length;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      if (args.title.length < 3) throw new GraphQLError(
        "El título debe contener más de 3 caracteres", {
        extensions: {
          code: "BAD_USER_INPUT",
          shortTitle: args.title,
        }
      });

      const autor = await Author.find({ name: args.author });
      if (autor.length === 0) {
        if (args.author.length < 4) throw new GraphQLError(
          "El nombre del autor debe ser de más de 4 caracteres", {
          extensions: {
            code: "BAD_USER_INPUT",
            shortAuthorName: args.author,
          }
        });

        const newAuthor = new Author({ name: args.author });
        newAuthor.save();
        return Book.create({ ...args, author: newAuthor.id });
      } else {
        return Book.create({ ...args, author: autor[0].id });
      }
    },
    editAuthor: async (root, args) => {
      const updAuthor = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      )
      return updAuthor;
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