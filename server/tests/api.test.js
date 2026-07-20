/**
 * Sample API test suite using Jest + Supertest.
 * Run with: npm test
 * Requires a running MongoDB instance (local or Atlas) reachable via MONGO_URI in .env
 */
require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

let token;
let userId;

beforeAll(async () => {
  await User.deleteMany({ email: 'jesttest@pmt.com' });
});

afterAll(async () => {
  await User.deleteMany({ email: 'jesttest@pmt.com' });
  await mongoose.connection.close();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jest Test User',
      email: 'jesttest@pmt.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
    userId = res.body.user._id;
  });

  it('should not register a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jest Test User',
      email: 'jesttest@pmt.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'jesttest@pmt.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'jesttest@pmt.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  it('should fetch profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('jesttest@pmt.com');
  });

  it('should reject profile fetch without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
  });
});

describe('Project API', () => {
  it('should reject project creation for non-admin', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Project',
        description: 'Test description',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      });
    expect(res.statusCode).toBe(403);
  });

  it('should list projects for authenticated user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.projects)).toBe(true);
  });
});

describe('Health check', () => {
  it('should return API running status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
