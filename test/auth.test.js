const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Endpoints', () => {
  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'invalid',
        password: 'invalid'
      });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
}); 