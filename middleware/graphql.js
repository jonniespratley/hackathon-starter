const {
  ApolloServer
} = require('apollo-server-express');

const query = require('qs-middleware');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const rootValue = require('./rootValue');

module.exports = function boot(app) {

  function loggingMiddleware(req, res, next) {
    console.log('sessionid:', req.session.id, req.session);
    next();
  }


  const server = new ApolloServer({
    debug: true,
    rootValue,
    typeDefs,
    resolvers
  });

  // const app = connect();
  const path = '/graphql';


  app.use(query());
  app.use(loggingMiddleware)
  app.get('/session', (req, res) => {
    res.send(req.session);
  })
  
  server.applyMiddleware({
    app,
    path
  });

  return server;
};