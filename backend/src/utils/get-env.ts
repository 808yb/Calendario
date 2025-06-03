import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const getEnv = (key: string, defaultValue: string = "") => {
  console.log(`Attempting to get environment variable: ${key}`);
  console.log('Current environment variables:', process.env);
  
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};
