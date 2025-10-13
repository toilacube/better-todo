// Test setup file
import { jest } from "@jest/globals";

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Keep error and warn for important messages
  error: jest.fn(),
  warn: jest.fn(),
  // Mock info and log to avoid clutter
  info: jest.fn(),
  log: jest.fn(),
};
