const request = require('supertest');
const express = require('express');
const reviewsRouter = require('./routes/reviews');  
const { Pool } = require('pg');

jest.mock('pg');
const mockQuery = jest.fn();
Pool.prototype.query = mockQuery;

const app = express();
app.use(express.json());
app.use('/reviews', reviewsRouter);  

describe('Reviews Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /reviews/:product_id should return all reviews for a product', async () => {
    const mockReviews = [
      { id: 1, user_id: 1, product_id: 1, content: 'Great product!', rating: 5 },
      { id: 2, user_id: 2, product_id: 1, content: 'Not bad', rating: 3 }
    ];

    mockQuery.mockResolvedValueOnce({ rows: mockReviews });

    const response = await request(app).get('/reviews/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReviews);
  });

  test('GET /reviews/:id should return a specific review', async () => {
    const mockReview = { id: 1, user_id: 1, product_id: 1, content: 'Great product!', rating: 5 };

    mockQuery.mockResolvedValueOnce({ rows: [mockReview] });

    const response = await request(app).get('/reviews/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReview);
  });

  test('GET /reviews/:id should return 404 if review not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get('/reviews/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Review not found');
  });

  test('POST /reviews should create a new review', async () => {
    const newReview = { user_id: 1, product_id: 1, content: 'Amazing!', rating: 5 };
    const createdReview = { id: 3, ...newReview };

    mockQuery.mockResolvedValueOnce({ rows: [createdReview] });

    const response = await request(app).post('/reviews').send(newReview);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdReview);
  });

  test('POST /reviews should return 500 if error occurs during review creation', async () => {
    const newReview = { user_id: 1, product_id: 1, content: 'Not good', rating: 2 };

    mockQuery.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).post('/reviews').send(newReview);
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error creating review');
  });

  test('PUT /reviews/:id should update review', async () => {
    const updatedReview = { id: 1, user_id: 1, product_id: 1, content: 'Updated review!', rating: 4 };

    mockQuery.mockResolvedValueOnce({ rows: [updatedReview] });

    const response = await request(app).put('/reviews/1').send(updatedReview);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedReview);
  });

  test('PUT /reviews/:id should return 404 if review not found', async () => {
    const updatedReview = { content: 'Updated review', rating: 4 };

    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).put('/reviews/999').send(updatedReview);
    expect(response.status).toBe(404);
    expect(response.text).toBe('Review not found');
  });

  test('DELETE /reviews/:id should delete a review', async () => {
    const deletedReview = { id: 1, user_id: 1, product_id: 1, content: 'Great product!', rating: 5 };

    mockQuery.mockResolvedValueOnce({ rows: [deletedReview] });

    const response = await request(app).delete('/reviews/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Review deleted' });
  });

  test('DELETE /reviews/:id should return 404 if review not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/reviews/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Review not found');
  });
});
