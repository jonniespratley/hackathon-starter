const request = require('supertest');
const app = require('../app.js');
const {Theme} = require('../models');

describe('Models', () => {
    it('should save theme', (done) => {
        const t = new Theme({
            
                "baseUri": "https://apm-chrome-poc.run.aws-usw02-pr.ice.predix.io",
                "error": "views/layouts/error.handlebars",
                "errorChromeless": "views/layouts/error_minimal.handlebars",
                "main": "views/layouts/main.handlebars",
                "displayName": "apm-chrome-theme",
                "demoLink": "https://apm-chrome-poc.run.aws-usw02-pr.ice.predix.io",
                "description": "APM AppHub Chrome"
            
        });
        t.save((err, res) => {
            console.log('save', err, res);
            done();
        })
    });
});
describe('GET /graphql', () => {
    xit('should return 200 OK', (done) => {
        request(app)
            .get('/graphql')
            .expect(200, done);
    });
});