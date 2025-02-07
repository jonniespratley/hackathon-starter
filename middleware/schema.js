const {
  gql
} = require('apollo-server-express');
// Construct a schema, using GraphQL schema language
const typeDefs = gql `
  # Comments in GraphQL are defined with the hash (#) symbol.
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  # This "Book" type can be used in other type declarations.
  type Book {
    name: String
    author: Author
  }

  type Author {
    name: String
    books: [Book]
    posts: [Post]
  }



  type Link {
    id: ID!
    description: String!
    url: String!
  }

  type Post {
    id: ID!
    title: String!
    body: String
    url: String
    author: Author
  }
  



  type Track { 
    href: String 
    name: String
    image: String
  }


  type Tracks { 
    href: String 
    total: Int 
  }

  type Epoc { 
    id: ID!
    image: String
    name: String
    tracks: Tracks 
  }

  type User { 
    id: ID!
    posts: [Post]
    username: String 
    image: String 
    items: [Epoc] 
  }


  type Session {
    user: User
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    hello: String
    uploads: [File]
    feed: [Link!]!
    author: Author
    getBooks: [Book]
    getAuthors: [Author]

    getSession(username: String!): Session
    
    getEpochs(username: String!): [ Epoc ]

    # "Fetch a single link by its id"
    link(id: ID!): Link

    getTracks: [Track]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
    ### CRUD on Link
    # Add a link
    addLink(url: String!, description: String!): Link!

    # Update a link
    updateLink(id: ID!, url: String, description: String): Link

    # Delete a link
    deleteLink(id: ID!): Link
    
    
    updateUserAge(id: ID!, age: Int!): User
    
    
    ### CRUD on a book
    addBook(name: String, author: String): Book
  }
`;
module.exports = typeDefs;