const mongoose = require('mongoose');
const Author = require('./models/Author');
const Book = require('./models/Book');


(async function main() {

    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true
    });
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function test() {
        console.log('// were connected!')
    });




    const doc = await Author.create({
        name: 'Ned Stark'
    });
    // const changeStream = Author.watch().on('change', change => console.log(change));
    // console.log(doc);
    doc.save();
    const b = new Book({

        name: `Web Dev ${Date.now()}`,
        author: 'Jonnie'
    });
    console.log('BOok', b);


    try {
        const result = await b.save();
        console.log('saved', result);
    } catch (error) {

        console.error('Error', error);
    }


})()