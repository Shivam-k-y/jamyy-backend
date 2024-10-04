import request from 'supertest';
import http from 'http';
import app from '../server.mjs'; // Adjust the path as necessary

let server;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe('GET /users', () => {
  it('should return the user count', async () => {
    const res = await request(server).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('users_count');
  });
});