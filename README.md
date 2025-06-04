# LLM Together Playground

A simple, no-frills web interface for interacting with various LLM models through the Together.ai API. This playground allows you to experiment with different models and parameters in a clean, intuitive interface.

## Features

- **Multiple Model Support**: Choose from various state-of-the-art language models
- **Adjustable Parameters**: Fine-tune model behavior with parameters like temperature, top-p, and more
- **Prompt History**: Keep track of your previous prompts and responses
- **Real-time Interaction**: Get instant responses from the models
- **Clean UI**: Simple and intuitive interface focused on usability

## Available Models

- **Meta Llama 3.3 70B Instruct Turbo** - High-performance instruction-tuned model
- **Meta Llama 3.3 70B Instruct Turbo Free** - Free tier version of the 70B model
- **Qwen QwQ-32B** - Powerful 32B parameter model from Qwen
- Custom model support by entering the model name directly

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Together.ai API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/LLMTogetherPlayground.git
   cd LLMTogetherPlayground
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Together.ai API key

### Running the Application

1. Start the application from the repository root:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your prompt in the input area
2. Adjust model parameters as needed
3. Click "Generate" to get a response
4. View response in the output area
5. Use the history panel to review previous interactions

## Configuration

You can customize the following parameters:

- **Model**: Select from available models or enter a custom model name
- **Max Tokens**: Maximum length of the generated response
- **Temperature**: Controls randomness (lower = more focused, higher = more creative)
- **Top P**: Nucleus sampling parameter
- **Top K**: Limits the next token selection to the K most probable tokens
- **Repetition Penalty**: Penalizes repeated tokens
- **Frequency Penalty**: Reduces the likelihood of repeated phrases

## Testing

This project includes both unit/integration tests and end-to-end (E2E) tests.

### Unit and Integration Tests

Run the test suite with:

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### End-to-End Tests

E2E tests are written using Playwright. See the [tests/README.md](tests/README.md) for detailed information.

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Together.ai](https://together.ai) for providing the API access to various LLM models
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Express](https://expressjs.com/) for the backend server
- [Playwright](https://playwright.dev/) for E2E testing
