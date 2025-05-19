const request = require('supertest');
const express = require('express');
const productsRoutes = require('./routes/products'); 
const { Pool } = require('pg');

jest.mock('pg');
const mockQuery = jest.fn();
Pool.prototype.query = mockQuery;

const app = express();
app.use(express.json());
app.use('/products', productsRoutes); 

describe('Products Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /products should return all products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product One', description: 'Description of Product One', price: 19.99 },
      { id: 2, name: 'Product Two', description: 'Description of Product Two', price: 29.99 },
    ];

    mockQuery.mockResolvedValueOnce({ rows: mockProducts });

    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProducts);
  });

  test('GET /products/:id should return a specific product', async () => {
    const mockProduct = { id: 1, name: 'Product One', description: 'Description of Product One', price: 19.99 };

    mockQuery.mockResolvedValueOnce({ rows: [mockProduct] });

    const response = await request(app).get('/products/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProduct);
  });

  test('GET /products/:id should return 404 if product not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get('/products/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Product not found');
  });

  test('POST /products should create a new product', async () => {
    const newProduct = { 
      name: 'New Product', 
      description: 'Description of New Product', 
      price: 49.99,
    };
    const createdProduct = { 
      id: 3, 
      ...newProduct 
    };

    mockQuery.mockResolvedValueOnce({ rows: [createdProduct] });

    const response = await request(app).post('/products').send(newProduct);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdProduct);
  });

  test('POST /products should return 500 if error occurs during product creation', async () => {
    const newProduct = { 
      name: 'Product Error', 
      description: 'This will cause an error', 
      price: 99.99,
    };

    mockQuery.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app).post('/products').send(newProduct);
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error creating product');
  });

  test('PUT /products/:id should update a product', async () => {
    const updatedProduct = { id: 1, name: 'Updated Product', description: 'Updated description', price: 19.99 };

    mockQuery.mockResolvedValueOnce({ rows: [updatedProduct] });

    const response = await request(app).put('/products/1').send(updatedProduct);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedProduct);
  });

  test('PUT /products/:id should return 404 if product not found', async () => {
    const updatedProduct = { name: 'Updated Product', description: 'Updated description', price: 19.99 };

    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).put('/products/999').send(updatedProduct);
    expect(response.status).toBe(404);
    expect(response.text).toBe('Product not found');
  });

  test('DELETE /products/:id should delete a product', async () => {
    const deletedProduct = { id: 1, name: 'Product One', description: 'Description of Product One', price: 19.99 };

    mockQuery.mockResolvedValueOnce({ rows: [deletedProduct] });

    const response = await request(app).delete('/products/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Product deleted' });
  });

  test('DELETE /products/:id should return 404 if product not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/products/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Product not found');
  });
});
