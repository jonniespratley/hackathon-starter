const { ApolloServer } = require('apollo-server-express');
const { MongoDataSource } = require('apollo-datasource-mongodb');

const query = require('qs-middleware');

const passportConfig = require('../config/passport');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const rootValue = require('./rootValue');


const { createLoaders, getUser } = require('./loaders');

module.exports = function boot(app) {
  const db = require('../config/db')();  
  // const { db } = app;
  
  if(!db) {
    throw new Error('Must provide datasource')
  }
  
  function loggingMiddleware(req, res, next) {
    console.log('sessionid:', req.session.id, req.session);
    next();
  }

  class Users extends MongoDataSource {
    getUser(userId) {
      return this.findOneById(userId)
    }
  }
  
  class Posts extends MongoDataSource {
    getPosts(postIds) {
      return this.findManyByIds(postIds)
    }
  }
  
  const UserPostResolvers = {
    Post: {
      author: (post, _, { users }) => users.getUser(post.authorId)
    },
    User: {
      posts: (user, _, { posts }) => posts.getPosts(user.postIds)
    }
  }
  console.log(db);
  // const users = db.model('users')
  // const posts = db.model('posts')

  
  const server = new ApolloServer({
    debug: true,
    mocks: true,
    rootValue,
    typeDefs,
    resolvers:{...resolvers, ...UserPostResolvers},
    dataSources: () => ({
      // users: new Users({ users }),
      // posts: new Posts({ posts })
    }),
    context: async ({ req }) => {
      console.log('context', req.id);
     

      
      const {user} = req;
      const authToken = req.headers.authorization || '';

      if (!user) {
        console.error('you must be logged in');
      }

      if (!authToken) {
        console.error('Must provide a auth token');
      }
      const loaders = createLoaders(authToken);

      return {
        req,
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
