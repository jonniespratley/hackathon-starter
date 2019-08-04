const {
  ApolloServer
} = require('apollo-server-express');

const query = require('qs-middleware');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = function boot(app) {

  function loggingMiddleware(req, res, next) {
    console.log('sessionid:', req.session.id, req.session);
    next();
  }
  const root = {
    ip(args, request) {
      return request.ip;
    },
    session(args, request) {
      console.log('root.session', request);
      return null;
    }
  };

  const server = new ApolloServer({
    debug: true,
    rootValue: root,
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


  console.log('graphql', app);


  server.applyMiddleware({
    app,
    path
  });

  return server;
};