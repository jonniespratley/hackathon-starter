const request = require('supertest');
const app = require('../app.js');

describe('GET /graphql', () => {
    it('should return 200 OK', (done) => {
        request(app)
            .get('/graphql')
            .expect(200, done);
    });
});