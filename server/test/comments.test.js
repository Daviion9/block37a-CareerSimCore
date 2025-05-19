const request = require('supertest');
const express = require('express');
const commentRoutes = require('./routes/comments');
const { Pool } = require('pg');

jest.mock('pg');
const mockQuery = jest.fn();
Pool.prototype.query = mockQuery;

const app = express();
app.use(express.json());
app.use('/comments', commentRoutes);  

describe('Comments Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /comments should return all comments', async () => {
    const mockComments = [
      { id: 1, text: 'Great product!', user_id: 1, product_id: 1 },
      { id: 2, text: 'Not as expected.', user_id: 2, product_id: 1 },
    ];

    mockQuery.mockResolvedValueOnce({ rows: mockComments });

    const response = await request(app).get('/comments');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockComments);
  });

  test('GET /comments/:id should return a specific comment', async () => {
    const mockComment = { id: 1, text: 'Great product!', user_id: 1, product_id: 1 };

    mockQuery.mockResolvedValueOnce({ rows: [mockComment] });

    const response = await request(app).get('/comments/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockComment);
  });

  test('GET /comments/:id should return 404 if comment not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get('/comments/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Comment not found');
  });

  test('POST /comments should create a new comment', async () => {
    const newComment = { text: 'Amazing product!', user_id: 1, product_id: 1 };
    const createdComment = { id: 3, ...newComment };

    mockQuery.mockResolvedValueOnce({ rows: [createdComment] });

    const response = await request(app).post('/comments').send(newComment);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdComment);
  });

  test('POST /comments should return 500 if error occurs during comment creation', async () => {
    const newComment = { text: 'This will cause an error', user_id: 1, product_id: 1 };

    mockQuery.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).post('/comments').send(newComment);
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error creating comment');
  });

  test('PUT /comments/:id should update a comment', async () => {
    const updatedComment = { id: 1, text: 'Updated comment text', user_id: 1, product_id: 1 };

    mockQuery.mockResolvedValueOnce({ rows: [updatedComment] });

    const response = await request(app).put('/comments/1').send(updatedComment);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedComment);
  });

  test('PUT /comments/:id should return 404 if comment not found', async () => {
    const updatedComment = { text: 'Updated comment text', user_id: 1, product_id: 1 };

    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).put('/comments/999').send(updatedComment);
    expect(response.status).toBe(404);
    expect(response.text).toBe('Comment not found');
  });

  test('DELETE /comments/:id should delete a comment', async () => {
    const deletedComment = { id: 1, text: 'Great product!', user_id: 1, product_id: 1 };

    mockQuery.mockResolvedValueOnce({ rows: [deletedComment] });

    const response = await request(app).delete('/comments/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Comment deleted' });
  });

  test('DELETE /comments/:id should return 404 if comment not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/comments/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Comment not found');
  });
});
