// server/src/__tests__/plans.api.test.js
const request = require('supertest');
const express = require('express');
const planRoutes = require('../routes/planRoutes');
const { ApiError } = require('../middleware/errorMiddleware');

// Mock the database pool
jest.mock('../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

// Create an Express app for testing
const app = express();
app.use(express.json());
app.use('/api/plans', planRoutes);

// Add error handling middleware for testing
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

// Get the mocked pool
const { pool } = require('../db');

describe('Plan API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans', () => {
    it('should return all plans', async () => {
      // Mock the database response
      pool.query.mockResolvedValueOnce({
        rows: [
          { 
            id: 1, 
            name: 'Retirement Plan', 
            start_date: '2025-01-01', 
            end_date: '2045-01-01', 
            target_amount: 500000 
          },
          { 
            id: 2, 
            name: 'House Down Payment', 
            start_date: '2025-03-01', 
            end_date: '2030-03-01', 
            target_amount: 100000 
          }
        ],
      });

      const response = await request(app).get('/api/plans');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Retirement Plan');
      expect(response.body.data[1].name).toBe('House Down Payment');
    });

    it('should handle database errors', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      const response = await request(app).get('/api/plans');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/plans/:id', () => {
    it('should return a specific plan with linked accounts', async () => {
      // Mock the database responses
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Retirement Plan', description: 'My retirement savings plan' }]
      }); // Plan query
      
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 101, name: 'Checking Account', balance: 5000 }]
      }); // Standard accounts
      
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 201, name: 'Visa Card', balance: 2000 }]
      }); // Credit accounts
      
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 301, name: 'Car Loan', balance: 15000 }]
      }); // Loans
      
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 401, name: '401(k)', balance: 75000 }]
      }); // Investment accounts

      const response = await request(app).get('/api/plans/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Retirement Plan');
      expect(response.body.data.accounts).toHaveLength(1);
      expect(response.body.data.credit_accounts).toHaveLength(1);
      expect(response.body.data.loans).toHaveLength(1);
      expect(response.body.data.investment_accounts).toHaveLength(1);
    });

    it('should return 404 if plan not found', async () => {
      // Mock empty result
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/plans/999');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('No plan found with id 999');
    });
  });

  describe('POST /api/plans', () => {
    it('should create a new plan', async () => {
      // Mock the database response for insert
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          id: 3, 
          name: 'New Plan', 
          description: 'Test plan', 
          start_date: '2025-06-01', 
          end_date: '2035-06-01', 
          target_amount: 250000 
        }]
      });

      const planData = {
        name: 'New Plan',
        description: 'Test plan',
        start_date: '2025-06-01',
        end_date: '2035-06-01',
        target_amount: 250000
      };

      const response = await request(app)
        .post('/api/plans')
        .send(planData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('New Plan');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO plans'),
        expect.arrayContaining(['New Plan'])
      );
    });

    it('should validate required fields', async () => {
      // Missing required fields
      const planData = {
        name: 'Incomplete Plan'
        // Missing start_date and end_date
      };

      const response = await request(app)
        .post('/api/plans')
        .send(planData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('required');
    });

    it('should validate date range', async () => {
      // Invalid date range (end before start)
      const planData = {
        name: 'Invalid Plan',
        start_date: '2025-06-01',
        end_date: '2024-06-01', // End date before start date
      };

      const response = await request(app)
        .post('/api/plans')
        .send(planData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('End date must be after start date');
    });
  });

  describe('POST /api/plans/:planId/accounts', () => {
    it('should link an account to a plan', async () => {
      // Mock database queries
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Plan exists
      pool.query.mockResolvedValueOnce({ rows: [{ id: 101 }] }); // Account exists
      pool.query.mockResolvedValueOnce({ rows: [] }); // Link doesn't exist yet
      pool.query.mockResolvedValueOnce({ rows: [{ plan_id: 1, account_id: 101 }] }); // Link created
      
      const response = await request(app)
        .post('/api/plans/1/accounts')
        .send({ accountId: 101, accountType: 'standard' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Successfully linked');
      expect(response.body.data.planId).toBe('1');
      expect(response.body.data.accountId).toBe(101);
    });

    it('should validate account type', async () => {
      const response = await request(app)
        .post('/api/plans/1/accounts')
        .send({ accountId: 101, accountType: 'invalid_type' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Account type must be one of:');
    });
  });

  describe('DELETE /api/plans/:planId/accounts', () => {
    it('should unlink an account from a plan', async () => {
      // Mock database queries
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Plan exists
      pool.query.mockResolvedValueOnce({ rows: [{ plan_id: 1, account_id: 101 }] }); // Link exists
      pool.query.mockResolvedValueOnce({ rows: [] }); // Deleted successfully
      
      const response = await request(app)
        .delete('/api/plans/1/accounts')
        .send({ accountId: 101, accountType: 'standard' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Successfully unlinked');
    });

    it('should return 404 if account is not linked to the plan', async () => {
      // Mock database queries
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Plan exists
      pool.query.mockResolvedValueOnce({ rows: [] }); // Link doesn't exist
      
      const response = await request(app)
        .delete('/api/plans/1/accounts')
        .send({ accountId: 999, accountType: 'standard' });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not linked to the plan');
    });
  });
});
