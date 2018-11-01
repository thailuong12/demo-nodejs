const request = require('supertest');
const app = require('../app.js');


describe('GET /login', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/login')
      .expect(200, done);
  });
});

describe('GET /signup', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/signup')
      .expect(200, done);
  });
});

describe('GET /contact', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/contact')
      .set('Accept', 'application/json')
      .set('X-CSRF-Token', 'eNHxxE9dpalq17opowZaLZY8arSrlAyC5iOus=')
      .expect(200, done);
  });
});
