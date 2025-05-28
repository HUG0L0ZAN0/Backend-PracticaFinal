const request = require('supertest');
const app = require('../server');

// Mock the database connection
jest.mock('../dbconfig', () => ({
  pool: {
    request: jest.fn().mockResolvedValue({
      recordset: []
    })
  }
}));

describe('Usuarios API sin token', () => {
  it('GET /api/usuarios sin token debe retornar 401', async () => {
    const response = await request(app)
      .get('/api/usuarios')
      .set('Accept', 'application/json');
    
    expect(response.status).toBe(401);
  });
}); 