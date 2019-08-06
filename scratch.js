const mongoose = require('mongoose');
const {App, Author, Book, Theme, Tenant} = require('./models');


const mockData = require('./test/mock-data');

(async function main() {




 
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/hackathon-starter', {
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


    async function createBookAndAuthor( book ){
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
        tags: [String],
        date: {
            type: Date,
            default: Date.now
        },
        onSale: Boolean,
        price: Number
    });
     
    const Game = mongoose.model('Game', gameSchema);
     
    async function saveGame({title, publisher, tags, price, onSale = false}) {
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
        console.log( 'createGame', result);
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

    async function getNintendoGames() {
        const games = await Game.find({
            publisher: 'Nintendo',
            onSale: true
        });
        console.log(games);
    }
     

   


    
    // saveGame();

    
  

    const { _id } = await createPublisher('Nintendo', true, 'https://www.nintendo.com/');
    [
        'Super Smash Bros: Ultimate',
        'Super Smash Bros: Melee',
        'Super Smash Bros: Brawl',
        'Super Smash Bros',
    ].map(name => {
        // createGame(name, _id);
    })

    
    
   // listGames();


    function createTenant(obj){
        const t = new Tenant(obj);
        return t.save();
    }

    const tenant = await createTenant({
        context: '',
        shared: false,
        applicationChrome: true,
        customHeader: {},
        hostname: 'test-tenant',
        appConfigUrl: "https://predix-apphub-arcs-prod.run.aws-usw02-pr.ice.predix.io/config",
        apphubUrl: "https://js-apphub.predix-apphub-prod.run.aws-usw02-pr.ice.predix.io/"
    })

    mockData.apps.map(async (app) => {
    app.tenant = tenant._id;
    const t = new App(app);
    const resp = await t.save();
    console.log(resp);
  });
    mockData.themes.map(async (theme) => {
    theme.tenant = tenant._id;
    const t = new Theme(theme);
    const resp = await t.save();
    console.log(resp);
  });
    

})()