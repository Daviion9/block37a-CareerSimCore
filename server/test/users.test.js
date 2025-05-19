const request = require('supertest');
const express = require('express');
const userRoutes = require('./routes/users'); 
const { Pool } = require('pg');

jest.mock('pg');
const mockQuery = jest.fn();
Pool.prototype.query = mockQuery;

const app = express();
app.use(express.json());
app.use('/users', userRoutes); 

describe('Users Routes', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /users should return all users', async () => {
    const mockUsers = [
      { id: 1, name: 'User One', email: 'user1@example.com' },
      { id: 2, name: 'User Two', email: 'user2@example.com' },
    ];

    mockQuery.mockResolvedValueOnce({ rows: mockUsers });

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
  });

  test('GET /users/:id should return a specific user', async () => {
    const mockUser = { id: 1, name: 'User One', email: 'user1@example.com' };

    mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

    const response = await request(app).get('/users/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  test('GET /users/:id should return 404 if user not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get('/users/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });

  test('POST /users should create a new user', async () => {
    const newUser = { name: 'User Three', email: 'user3@example.com', password_hash: 'hashedpassword' };
    const createdUser = { id: 3, ...newUser };

    mockQuery.mockResolvedValueOnce({ rows: [createdUser] });

    const response = await request(app).post('/users').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdUser);
  });

  test('POST /users should return 500 if error occurs during user creation', async () => {
    const newUser = { name: 'User Four', email: 'user4@example.com', password_hash: 'hashedpassword' };

    mockQuery.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).post('/users').send(newUser);
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error creating user');
  });

  test('PUT /users/:id should update user information', async () => {
    const updatedUser = { id: 1, name: 'Updated User', email: 'updateduser@example.com', password_hash: 'newhashedpassword' };

    mockQuery.mockResolvedValueOnce({ rows: [updatedUser] });

    const response = await request(app).put('/users/1').send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedUser);
  });

  test('PUT /users/:id should return 404 if user not found', async () => {
    const updatedUser = { name: 'Updated User', email: 'updateduser@example.com' };

    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).put('/users/999').send(updatedUser);
    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });

  test('DELETE /users/:id should delete a user', async () => {
    const deletedUser = { id: 1, name: 'User One', email: 'user1@example.com' };

    mockQuery.mockResolvedValueOnce({ rows: [deletedUser] });

    const response = await request(app).delete('/users/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'User deleted' });
  });

  test('DELETE /users/:id should return 404 if user not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/users/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });
});
