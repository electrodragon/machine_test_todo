type EnvKeys = keyof ImportMetaEnv;

/**
 * Safely get an environment variable by key
 * Throws an error if the variable is missing (unless defaultValue provided)
 */
export function getEnv(key: EnvKeys, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined || value === null || value === "") {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}