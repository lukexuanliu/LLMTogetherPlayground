import { test, expect } from '@playwright/test';

test.describe('LLM Together Playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load the playground page', async ({ page }) => {
    // Check if the main elements are visible
    await expect(page.getByRole('heading', { name: 'Together.ai Playground' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your prompt here')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  });

  test('should be able to enter a prompt and get a response', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/generate', async route => {
      const json = {
        text: 'This is a test response from the mock API.',
        usage: {
          total_tokens: 20
        }
      };
      await route.fulfill({ json });
    });

    // Enter a prompt
    const prompt = 'Tell me a short story about a robot';
    await page.getByPlaceholder('Enter your prompt here').fill(prompt);
    
    // Click the run button
    await page.getByRole('button', { name: 'Run' }).click();
    
    // Check if the response is displayed
    await expect(page.getByText('This is a test response from the mock API.')).toBeVisible();
  });

  test('should show error for empty prompt', async ({ page }) => {
    // Click run without entering a prompt
    await page.getByRole('button', { name: 'Run' }).click();
    
    // Check if error toast is shown
    await expect(page.getByText('Empty Prompt')).toBeVisible();
    await expect(page.getByText('Please enter a prompt before running.')).toBeVisible();
  });

  test('should be able to set and save API key', async ({ page }) => {
    // Open API key modal
    await page.getByRole('button', { name: 'Set API Key (Optional)' }).click();
    
    // Enter and save API key
    const testApiKey = 'test-api-key-123';
    await page.getByLabel('Together.ai API Key').fill(testApiKey);
    await page.getByRole('button', { name: 'Save API Key' }).click();
    
    // Check if API key is saved in localStorage
    const apiKey = await page.evaluate(() => {
      return localStorage.getItem('togetherApiKey');
    });
    
    expect(apiKey).toBe(testApiKey);
    
    // Check if the button text updates
    await expect(page.getByRole('button', { name: 'Change API Key' })).toBeVisible();
  });

  test('should show error when API call fails', async ({ page }) => {
    // Mock a failed API response
    await page.route('**/api/generate', route => {
      route.fulfill({
        status: 400,
        json: { error: 'Invalid API key' }
      });
    });

    // Enter a prompt and submit
    await page.getByPlaceholder('Enter your prompt here').fill('Test prompt');
    await page.getByRole('button', { name: 'Run' }).click();
    
    // Check if error is displayed
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('should be able to view and clear history', async ({ page }) => {
    // Add some test history
    await page.evaluate(() => {
      const history = [
        {
          id: '1',
          prompt: 'Test prompt 1',
          model: 'test-model',
          timestamp: new Date().toISOString(),
          tokensUsed: 10
        },
        {
          id: '2',
          prompt: 'Test prompt 2',
          model: 'test-model',
          timestamp: new Date().toISOString(),
          tokensUsed: 15
        }
      ];
      localStorage.setItem('promptHistory', JSON.stringify(history));
    });

    // Open history modal
    await page.getByRole('button', { name: 'History' }).click();
    
    // Check if history items are visible
    await expect(page.getByText('Test prompt 1')).toBeVisible();
    await expect(page.getByText('Test prompt 2')).toBeVisible();
    
    // Clear history
    await page.getByRole('button', { name: 'Clear History' }).click();
    
    // Check if history is cleared
    const history = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('promptHistory') || '[]');
    });
    
    expect(history).toHaveLength(0);
  });
});
