// Provide resolver functions for your schema fields
const {
    find,
    filter
} = require('lodash');
const DataLoader = require('dataloader');
const rp = require('request-promise')

const {
    Book,
    Link
} = require('../models');



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


/*

const Epoch = require('../models/Epoch');
let item = new Epoch({name: 'Test 1'});
item.user = '5d4caa97241678c45e73656b';
console.log(await item.save());
*/

async function spotifyAPIRequest({accessToken, resource, id, sub, query}){
    return rp({
        url: `https://api.spotify.com/v1/${resource}/${id}/${sub}`,
        qs: query,
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })
}



function genLoaders(accessToken, ids) {
    console.log('Create loaders for ', accessToken, ids);
    let out = [];
    out = [...ids].map(id => spotifyAPIRequest({accessToken, resource: 'users', id, sub: 'playlists'}))
    return out;
}
function createLoaders(authToken) {
    return {
      playlists: new DataLoader(ids => genLoaders(authToken, ids)),
    }
  }


const loaders = createLoaders('abc');


const resolvers = {
    Query: {
        hello: () => 'Hello world!',




        getEpochs: (obj, {username}, context, info) => {
            console.log('Query.getEpochs', obj, username, context, info);
            return loaders.playlists( username );
        },










        getBooks: (obj, args, context, info) => {
            console.log('Query.getBooks', obj, args, context, info);
            return Book.find((err, docs) => {
                return docs
            });
        },
        feed: () => links,
        author(obj, args, context, info) {
            console.log('Query.author', obj, args, context, info);
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