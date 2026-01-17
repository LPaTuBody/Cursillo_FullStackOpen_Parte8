const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

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

  type User {
    username: String!
    favGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
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

    createUser(
      username: String!
      favGenre: String!
    ): User
    
    login(
      username: String!
      password: String!
    ): Token
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
    me: async (root, args, context) => (context.currentUser),
  },
  Author: {
    bookCount: async (root) => {
      const libros = await Book.find({ author: root.id });
      return libros.length;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      console.log("contexto", context)

      if (args.title.length < 3) throw new GraphQLError(
        "El título debe contener más de 3 caracteres", {
        extensions: {
          code: "BAD_USER_INPUT",
          invalidArgs: args.title,
        }
      });

      const autor = await Author.find({ name: args.author });
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
        return Book.create({ ...args, author: newAuthor.id });
      } else {
        return Book.create({ ...args, author: autor[0].id });
      }
    },
    editAuthor: async (root, args, context) => {
      const updAuthor = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      )
      return updAuthor;
    },
    createUser: async (root, args) => {
      const { username, favGenre } = args;
      try {
        const newUser = await User.create({ username, favGenre });
        return newUser;
      } catch (err) {
        throw new GraphQLError("Error al crear usuario", {
          extensions: {
            code: "BAD_USER_INPUT",
            err,
          }
        });
      };
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "contraseña") {
        throw new GraphQLError("credenciales incorrectas", {
          extensions: { code: "BAD_USER_INPUT" }
        });
      };

      return {
        value: jwt.sign(
          {
            username: user.username,
            id: user.id,
          },
          process.env.JWT_SECRET,
          { expiresIn: 5 }
        )
      };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, {
  listen: { port: process.env.PORT },
  context: async ({ req, res }) => {
    // console.log("request", req.headers.authorization)
    const auth = req ? req.headers.authorization : null;

    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
});