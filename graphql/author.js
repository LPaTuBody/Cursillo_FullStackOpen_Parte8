const Author = require("../models/author");
const Book = require("../models/book");
const { GraphQLError } = require("graphql");

const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Query {
    authorCount: Int!
    allAuthors: [Author!]!
  }

  type Mutation {
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`;

const resolvers = {
  Query: {
    authorCount: async () => (await Author.collection.countDocuments()),
    allAuthors: async () => (await Author.find({})),
  },
  Author: {
    bookCount: async (root) => {
      const libros = await Book.find({ author: root.id });
      return libros.length;
    },
  },
  Mutation: {
    editAuthor: async (root, args, context) => {
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

      const updAuthor = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      )
      return updAuthor;
    },
  },
};

module.exports = { typeDefs, resolvers };