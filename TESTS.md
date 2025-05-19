# API Integration Tests

This document describes the test suite for the LLM Together Playground API integration tests.

## Test Suite Overview

The test suite verifies the functionality of the API endpoints, focusing on:
- Request validation
- Authentication and API key handling
- Response formatting
- Error handling
- History management

## Test Categories

### 1. POST /api/generate

#### Test Cases:
1. **Invalid Request Body**
   - Verifies that the API returns a 400 status code when the request body is invalid
   - Checks for proper error message in the response

2. **Valid Generation Request**
   - Tests successful text generation with valid parameters
   - Verifies response structure and expected fields

3. **Missing API Key**
   - Ensures the API returns a 400 status code when no API key is provided
   - Verifies proper error message for missing API key

4. **API Call Failure**
   - Tests error handling when the external API call fails
   - Verifies proper error status and message are returned

### 2. GET /api/history

#### Test Cases:
1. **Empty History**
   - Verifies that an empty array is returned when no history exists

2. **Retrieve History**
   - Tests retrieval of saved prompt history
   - Verifies the structure and content of history items

3. **History Limit**
   - Tests the limit parameter for history retrieval
   - Verifies that only the specified number of items are returned

### 3. DELETE /api/history

#### Test Cases:
1. **Clear History**
   - Tests clearing the prompt history
   - Verifies that history is properly cleared

### 4. Error Handling

#### Test Cases:
1. **Non-existent Routes**
   - Tests handling of unknown routes (404)

2. **Route Handler Errors**
   - Tests error handling in route handlers
   - Verifies proper error status and message

## Running the Tests

To run the tests, use the following command:

```bash
npm test
```

Or for a specific test file:

```bash
npx vitest run server/tests/integration
```

## Test Dependencies

- Vitest: Test runner
- Supertest: HTTP assertions
- node-mocks-http: Mocking HTTP requests/responses
- node-fetch: Mocked for testing API calls

## Test Coverage

The test suite provides comprehensive coverage of:
- Input validation
- Authentication
- Success and error responses
- Data persistence (history)
- Edge cases and error conditions
