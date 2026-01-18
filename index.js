const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
require("dotenv").config();

const {
  typeDefs: bookTypeDefs,
  resolvers: bookResolvers
} = require("./graphql/book");
const {
  typeDefs: authorTypeDefs,
  resolvers: authorResolvers
} = require("./graphql/author");
const {
  typeDefs: userTypeDefs,
  resolvers: userResolvers
} = require("./graphql/user");

mongoose.set("strictQuery", false);
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("connected to", MONGODB_URI);
  })
  .catch((err) => {
    console.log("error connection to MongoDB:", err.message);
  });

const server = new ApolloServer({
  typeDefs: [bookTypeDefs, authorTypeDefs, userTypeDefs],
  resolvers: {
    Query: {
      ...bookResolvers.Query,
      ...authorResolvers.Query,
      ...userResolvers.Query
    },
    Mutation: {
      ...bookResolvers.Mutation,
      ...authorResolvers.Mutation,
      ...userResolvers.Mutation
    },
    Subscription: {
      ...bookResolvers.Subscription,
    },
    Author: {
      ...authorResolvers.Author,
    }
  }
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.replace("Bearer ", "");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        return { currentUser };
      } catch (err) {
        return { jwtError: err.message };
      }
    };
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});