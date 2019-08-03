const {
    ApolloServer,
    gql
} = require('apollo-server-express');
const query = require('qs-middleware');

const typeDefs = require('./schema');
const resolvers = require('./resolvers')

module.exports = function (app) {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    // const app = connect();
    const path = '/graphql';


    server.applyMiddleware({
        app,
        path
    });

};
if (module.main) {

    app.listen({
            port: 4000
        }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
}