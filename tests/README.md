# End-to-End (E2E) Tests

This directory contains end-to-end tests for the LLM Together Playground application using Playwright.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Chromium (installed automatically by Playwright)

### Installation

Playwright and its dependencies are already installed as part of the project's devDependencies. If you need to reinstall them, run:

```bash
npx playwright install
```

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode

This opens the Playwright Test UI for a more interactive testing experience:

```bash
npm run test:e2e:ui
```

### Debug Tests

To run tests in debug mode:

```bash
npm run test:e2e:debug
```

### Update Snapshots

If you've made visual changes that affect snapshots:

```bash
npm run test:e2e:update-snapshots
```

## Test Structure

- `playground.spec.ts` - Contains tests for the main playground functionality
  - Page load and basic rendering
  - Prompt submission and response display
  - API key management
  - History functionality
  - Error handling

## Writing Tests

When adding new tests:

1. Use the `test` function to define a new test case
2. Use Playwright's built-in assertions (`expect`) for validations
3. Mock API responses when needed using `page.route()`
4. Follow the Page Object Model pattern for maintainability (for larger test suites)

## Best Practices

- Keep tests independent and isolated
- Use descriptive test names
- Mock external dependencies
- Clean up test data after each test
- Use accessibility selectors when possible (e.g., `getByRole`, `getByLabel`)

## CI/CD Integration

These tests can be integrated into your CI/CD pipeline. A sample GitHub Actions workflow is provided in `.github/workflows/playwright.yml`.

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
