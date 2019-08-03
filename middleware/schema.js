const {
  gql
} = require('apollo-server-express');
// Construct a schema, using GraphQL schema language
const typeDefs = gql `
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    name: String
    author: Author
  }

  type Author {
    name: String
    books: [Book]
  }

  type User {
    id: ID!
    name: String!
    age: Int!
  }

  type Link {
    id: ID!
    description: String!
    url: String!
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    hello: String
    feed: [Link!]!
    author: Author
    getBooks: [Book]
    getAuthors: [Author]

    # "Fetch a single link by its id"
    link(id: ID!): Link
  }

  type Mutation {
    # Add a link
    addLink(url: String!, description: String!): Link!

    # Update a link
    updateLink(id: ID!, url: String, description: String): Link

    # Delete a link
    deleteLink(id: ID!): Link
    updateUserAge(id: ID!, age: Int!): User
    addBook(name: String, author: String): Book
  }
`;
module.exports = typeDefs;