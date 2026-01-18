const User = require("../models/user");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const typeDefs = `
  type User {
    username: String!
    favGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    me: User
  }

  type Mutation {
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
    me: async (root, args, context) => (context.currentUser),
  },
  Mutation: {
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
          { expiresIn: "5h" }
        )
      };
    },
  },
};

module.exports = { typeDefs, resolvers };