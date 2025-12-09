// Test setup file
const mongoose = require('mongoose');

// Increase timeout for database operations
jest.setTimeout(10000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/homepage-cms-test';

// Global test cleanup
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Suppress console.log during tests
const originalConsoleLog = console.log;
global.console = {
  ...console,
  log: jest.fn(),
  error: originalConsoleLog,
  warn: originalConsoleLog,
  info: originalConsoleLog
};