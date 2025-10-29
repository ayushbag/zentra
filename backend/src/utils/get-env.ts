/**
 * Read an environment variable with optional default.
 * Throws if the variable is missing and no default is provided.
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (value === undefined || value === "") {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
