/**
 * Application configuration
 * Centralizes all configuration variables and provides validation
 */

/**
 * Environment variable configuration with validation
 */
export const env = {
  /**
   * Application environment
   */
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  /**
   * Together.ai API key
   */
  TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
  
  /**
   * Server port
   */
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  /**
   * Returns true if the environment is production
   */
  isProd: () => process.env.NODE_ENV === 'production',
  
  /**
   * Validates that all required environment variables are present
   * @throws Error if any required variables are missing
   */
  validate: (): void => {
    const requiredVars = ['TOGETHER_API_KEY'];
    
    const missingVars = requiredVars.filter(
      varName => !process.env[varName] || process.env[varName]?.trim() === ''
    );
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please check your .env file or environment configuration.'
      );
    }
  }
};

/**
 * Together.ai API configuration
 */
export const togetherAI = {
  /**
   * API endpoint for completions
   */
  COMPLETIONS_ENDPOINT: 'https://api.together.xyz/v1/completions',
  
  /**
   * Default model parameters
   */
  defaultParameters: {
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    max_tokens: 256,
    temperature: 0.7,
    top_p: 0.8,
    top_k: 40,
    repetition_penalty: 1,
    frequency_penalty: 0,
  },
  
  /**
   * Available models
   */
  models: [
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'meta-llama/Llama-3.1-70B-Instruct',
    'meta-llama/Llama-3.1-8B-Instruct',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'mistralai/Mistral-7B-Instruct-v0.2'
  ]
};

/**
 * API response configuration
 */
export const api = {
  /**
   * Maximum history items to return
   */
  MAX_HISTORY_ITEMS: 50,
  
  /**
   * Error messages
   */
  errors: {
    INVALID_REQUEST: 'Invalid request parameters',
    API_KEY_MISSING: 'API key not found. Please set TOGETHER_API_KEY in .env file or provide in request.',
    INTERNAL_ERROR: 'An unexpected error occurred',
  }
};
