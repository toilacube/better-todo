# Storage Unit Tests

This directory contains comprehensive unit tests for the storage operations in the Better Todo app.

## Test Coverage

The tests provide **100% coverage** of the storage module including:

### ✅ Generic Storage Operations

- Get/set values with proper type safety
- Default value handling for missing keys
- Error handling and logging for storage failures

### ✅ Task Management

- **Today Tasks**: CRUD operations for daily tasks
- **Must-Do Tasks**: CRUD operations for persistent important tasks
- **Task History**: Storage and retrieval of completed task history

### ✅ Application State

- **Last Date**: Date tracking for day transitions
- **Settings**: User preferences storage (auto-carry-over, notifications, theme, autostart)

### ✅ Data Validation

- Type safety enforcement for all data structures
- Proper handling of null/undefined values
- Complex nested task structures with subtasks

### ✅ Error Scenarios

- Storage read/write failures
- Network connectivity issues
- Disk space and save operation failures
- Graceful degradation with default values

### ✅ Storage Key Management

- Backward compatibility with legacy keys
- Consistent key usage across operations

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/__tests__/
├── storage.test.ts        # Main unit tests (22 test cases)
├── test-utils.ts         # Test helper utilities
└── setup.ts              # Jest configuration and mocks
```

## Key Features Tested

### Storage Operations

- ✅ `getTodayTasks()` / `setTodayTasks()`
- ✅ `getMustDoTasks()` / `setMustDoTasks()`
- ✅ `getTaskHistory()` / `setTaskHistory()`
- ✅ `getLastDate()` / `setLastDate()`
- ✅ `getSettings()` / `setSettings()`
- ✅ `get()` / `set()` generic operations

### Edge Cases

- ✅ Empty/null data handling
- ✅ Large dataset performance
- ✅ Concurrent operations
- ✅ Storage corruption recovery
- ✅ Partial failure scenarios

### Data Types

- ✅ `Task` objects with nested subtasks
- ✅ `TaskHistory` with date-keyed entries
- ✅ `Settings` with all configuration options
- ✅ Proper TypeScript type safety

## Mock Strategy

The tests use Jest mocks to simulate the Tauri Store plugin:

- Mock store instance with `get`, `set`, and `save` methods
- Configurable return values and error conditions
- Isolation between test cases for reliability

## Coverage Report

Current coverage: **100%** (Statements, Branches, Functions, Lines)

The comprehensive test suite ensures that all storage operations are reliable and handle edge cases gracefully.
