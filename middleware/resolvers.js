// Provide resolver functions for your schema fields
const {
    find,
    filter
} = require('lodash');

const Link = require('../models/Link');
const Book = require('../models/Book');



const books = [{
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J.K. Rowling'
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton'
    }
];
const authors = [{
        id: 1,
        name: 'Jonnie'
    },
    {
        id: 2,
        name: 'J.K. Rowling'
    }
];

const links = [{
    id: 'link-0',
    url: 'www.howtographql.com',
    description: 'Fullstack tutorial for GraphQL'
}];
// 1
let idCount = links.length;

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        getBooks: (obj, args) => {
            return Book.find((err, docs) => {
                return docs
            });
        },
        feed: () => links,
        author(parent, args, context, info) {
            console.log('Query.author', args, context, info);
            return find(authors, {
                id: args.id
            });
        }
    },
    Author: {
        books(author) {
            console.log('Author.books', author);
            return filter(books, {
                author: author.name
            });
        }
    },
    Mutation: {
        addBook(parent, args) {
            const book = new Book(args);
            books.push(book);
            return book.save();
        },
        addLink: (parent, args) => {
            const link = {
                id: `link-${idCount++}`,
                description: args.description,
                url: args.url
            };
            links.push(link);
            const l = new Link(link);
            l.save();
            return l;
        }
    }
};
module.exports = resolvers;