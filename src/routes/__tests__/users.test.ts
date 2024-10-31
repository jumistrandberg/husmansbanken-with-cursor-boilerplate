import request from 'supertest';
import app from '../../index.js';
import prisma from '../../db/prisma.js';

jest.mock('../../db/prisma.js', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

describe('User routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/:id', () => {
    it('should return a user when a valid ID is provided', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 404 when user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 500 when an error occurs', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });

      consoleSpy.mockRestore();
    });
  });
});
