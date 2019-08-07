const glob = require('glob');
const path = require('path');

const basePath = path.join(process.cwd(), '../middleware');

const resolvers = require('../middleware/resolvers');

describe('Resolvers', () => {
    // Find all our resolver files
    const files = glob.sync(`${basePath}**/*.test.js`);

    files.forEach(file => {
        describe(file, () => {
            const resolvers = require.resolve(file);
            console.log('file', file);
            Object.entries(resolvers).forEach(([name, fn]) => {
                it(name, () => Promise.resolve(fn()));
            });
        });
    });


    Object.keys(resolvers).forEach(file => {
        console.log('file', file);
        describe(file, () => {
            const methods = resolvers[file];

            Object.entries(methods).forEach(([name, fn]) => {
                it(name, () => Promise.resolve(fn()));
            });
        });
    });

});