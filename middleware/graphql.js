const { ApolloServer } = require('apollo-server-express');

const query = require('qs-middleware');

const passportConfig = require('../config/passport');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const rootValue = require('./rootValue');
const { createLoaders, getUser } = require('./loaders');

module.exports = function boot(app) {
  function loggingMiddleware(req, res, next) {
    console.log('sessionid:', req.session.id, req.session);
    next();
  }

  const server = new ApolloServer({
    debug: true,
    rootValue,
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      console.log('context', req.id);
     

      const authToken = req.headers.authorization || '';

      const user = await getUser(authToken);

      if (!user) {
        console.error('you must be logged in');
      }

      if (!authToken) {
        console.error('Must provide a auth token');
      }
      const loaders = createLoaders(authToken);

      return {
        user,
        loaders
      };
    }
  });

  // const app = connect();
  const path = '/graphql';

  app.use(query());
  app.use(loggingMiddleware);

  app.get('/session', (req, res) => {
    res.send(req.session);
  });

  server.applyMiddleware({
    //  passportConfig.isAuthenticated(),
    app,
    path,
    disableHealthCheck: true
  });

  return server;
};
