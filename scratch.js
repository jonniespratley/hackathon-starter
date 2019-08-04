const mongoose = require('mongoose');


const {
    Book
} = require('./models');


(async function main() {





    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/mongo-games', {
            useNewUrlParser: true
        })
        .then(() => {
            console.log('You are now connected to Mongo!')
        })
        .catch(err => console.error('Something went wrong', err))

    /* const db = mongoose.connection
     db.on('error', console.error.bind(console, 'connection error:'));
     db.once('open', function test() {
         //console.log('// were connected!')
     }); */


    async function createBookAndAuthor(book) {
        const b = new Book(book);
        const result = await b.save();
        console.log('saved', result);
        return result;
    }




    const Publisher = mongoose.model('Publisher', new mongoose.Schema({
        companyName: String,
        firstParty: Boolean,
        website: String
    }));
    const gameSchema = new mongoose.Schema({
        title: String,
        publisher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Publisher'
        },
        /* publisher: {
            type: new mongoose.Schema({
                companyName: String,
            })
        } */
        tags: [String],
        date: {
            type: Date,
            default: Date.now
        },
        onSale: Boolean,
        price: Number
    });

    const Game = mongoose.model('Game', gameSchema);

    async function saveGame({
        title,
        publisher,
        tags,
        price,
        onSale = false
    }) {
        const game = new Game({
            title,
            publisher,
            tags,
            onSale,
            price,
        });

        const result = await game.save();
        console.log(result);
        return result;
    }

    async function createPublisher(companyName, firstParty, website) {
        const publisher = new Publisher({
            companyName,
            firstParty,
            website
        });

        const result = await publisher.save();
        console.log(result);
        return result;
    }

    async function createGame(title, publisher) {
        const game = new Game({
            title,
            publisher

        });

        const result = await game.save();
        console.log('createGame', result);
        return result;
    }

    async function listGames() {
        const games = await Game
            .find()
            .populate('publisher', 'companyName -_id')
            .select('title publisher');
        console.log('listGames', games);
        return games;
    }

    async function getGames(params) {
        const games = await Game.find(params);
        console.log(games);
        return games;
    }





    // saveGame();



    createGame('Rayman', new Publisher({
        companyName: 'Ubisoft',
        firstParty: false,
        website: 'https://www.ubisoft.com/'
    }))


    const {
        _id
    } = await createPublisher('Nintendo', true, 'https://www.nintendo.com/');
    [
        'Super Smash Bros: Ultimate',
        'Super Smash Bros: Melee',
        'Super Smash Bros: Brawl',
        'Super Smash Bros',
    ].map(name => {
        createGame(name, _id);
    })



    listGames();
    getGames();


})()