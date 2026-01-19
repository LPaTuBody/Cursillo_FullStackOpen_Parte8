const { createSchema } = require("graphql-yoga");

const {
  typeDefs: bookTypeDefs,
  resolvers: bookResolvers
} = require("./book");
const {
  typeDefs: authorTypeDefs,
  resolvers: authorResolvers
} = require("./author");
const {
  typeDefs: userTypeDefs,
  resolvers: userResolvers
} = require("./user");


const typeDefs = [bookTypeDefs, authorTypeDefs, userTypeDefs];
const resolvers = {
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
  },
};

module.exports = createSchema({ typeDefs, resolvers });