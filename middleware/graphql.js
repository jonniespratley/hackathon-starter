const {
  ApolloServer
} = require('apollo-server-express');

const query = require('qs-middleware');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = function boot(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  // const app = connect();
  const path = '/graphql';

  app.use(query());
  server.applyMiddleware({
    app,
    path
  });

  return server;
};