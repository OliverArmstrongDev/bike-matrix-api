import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { Router } from 'express';
import bikeRouter from '../src/services/api/routes/apiRoutes'; // Adjust the import path
import { authenticateToken } from '../src/middleware/auth';
import { BikeModel } from '../src/services/api/models/bikeModel';

jest.mock('../src/middleware/auth'); // Mock the auth middleware
jest.mock('../src/services/api/models/bikeModel'); // Mock the BikeModel

const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmQ3ZmRhM2Y1ZDY1MzkwODI2Y2M4YTYiLCJuYW1lIjoiSmltIiwiZW1haWwiOiJqaW1AaGVyZS5jb20iLCJpYXQiOjE3MjU0NTk3MjksImV4cCI6MTcyNTQ2NjkyOX0.kVnlJHc497zypNu3T2si-_5Z1zhZyoHk8vWhJJtsnjk"


const mockEmail = 'test@example.com';
const mockBikes = [
  { _id: '1', brand: 'Brand1', model: 'Model1', year: '2020', email: mockEmail },
  { _id: '2', brand: 'Brand2', model: 'Model2', year: '2021', email: mockEmail },
];
const newBike = { brand: 'BrandNew', model: 'ModelNew', year: '2022', email: mockEmail };


const app = express();
app.use(express.json());
app.use('/api', bikeRouter); 

describe('Bike Routes', () => {
  beforeAll(async () => {
  
    await mongoose.connect('mongodb://localhost:27017/bikematrix');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch all bikes for authenticated user', async () => {
    // Mock implementation of authenticateToken
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { email: mockEmail };
      next();
    });

    // Mock implementation of BikeModel.find()
    (BikeModel.find as jest.Mock).mockResolvedValue(mockBikes);

    // Simulate the request
    const response = await request(app)
      .get('/api/bikes')
      .set('Authorization', `Bearer ${mockToken}`); // Include token in header

    // Check the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockBikes);
  });

  it('should handle errors from BikeModel.find', async () => {
    // Mock implementation of authenticateToken
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { email: mockEmail };
      next();
    });

    // Mock implementation of BikeModel.find() to throw an error
    (BikeModel.find as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Simulate the request
    const response = await request(app)
      .get('/api/bikes')
      .set('Authorization', `Bearer ${mockToken}`); // Include token in header

    // Check the response
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to update bike' });
  });

  it('should return 401 if authentication fails', async () => {
    // Mock implementation of authenticateToken to simulate authentication failure
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      res.status(401).json({ error: 'Unauthorized' });
    });

    // Simulate the request
    const response = await request(app)
      .get('/api/bikes')
      .set('Authorization', `Bearer ${mockToken}`); // Include token in header

    // Check the response
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('should return 401 if no token is provided', async () => {
    // Mock implementation of authenticateToken to simulate missing token
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      res.status(401).json({ error: 'Unauthorized' });
    });

    // Simulate the request without Authorization header
    const response = await request(app)
      .get('/api/bikes');

    // Check the response
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('should handle cases where `req.user.email` is undefined', async () => {
    // Mock implementation of authenticateToken
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = {}; // No email set
      next();
    });

    // Mock implementation of BikeModel.find() to return an empty array
    (BikeModel.find as jest.Mock).mockResolvedValue([]);

    // Simulate the request
    const response = await request(app)
      .get('/api/bikes')
      .set('Authorization', `Bearer ${mockToken}`); // Include token in header

    // Check the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

//   Create endpoint
  it('should create a new bike for authenticated user', async () => {
    // Mock implementation of authenticateToken
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { email: mockEmail };
      next();
    });

    // Mock implementation of BikeModel.create()
    (BikeModel.create as jest.Mock).mockResolvedValue({ ...newBike, _id: '123' });

    // Simulate the request
    const response = await request(app)
      .post('/api/bikes')
      .set('Authorization', `Bearer ${mockToken}`) // Include token in header
      .send(newBike); // Send the bike data

    // Check the response
    expect(response.status).toBe(200); // Or use 201 if that is the expected status for successful creation
    expect(response.body).toEqual({ ...newBike, _id: '123' });
  });

  it('should handle errors during bike creation', async () => {
    // Mock implementation of authenticateToken
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { email: mockEmail };
      next();
    });

    // Mock implementation of BikeModel.create() to throw an error
    (BikeModel.create as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Simulate the request
    const response = await request(app)
      .post('/api/bikes')
      .set('Authorization', `Bearer ${mockToken}`) // Include token in header
      .send(newBike); // Send the bike data

    // Check the response
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to create bike' });
  });

  it('should return 401 if authentication fails', async () => {
    // Mock implementation of authenticateToken to simulate authentication failure
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      res.status(401).json({ error: 'Unauthorized' });
    });

    // Simulate the request
    const response = await request(app)
      .post('/api/bikes')
      .set('Authorization', `Bearer ${mockToken}`) // Include token in header
      .send(newBike); // Send the bike data

    // Check the response
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('should return 401 if no token is provided', async () => {
    // Mock implementation of authenticateToken to simulate missing token
    (authenticateToken as jest.Mock).mockImplementation((req, res, next) => {
      res.status(401).json({ error: 'Unauthorized' });
    });

    // Simulate the request without Authorization header
    const response = await request(app)
      .post('/api/bikes')
      .send(newBike); // Send the bike data without token

    // Check the response
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });



});