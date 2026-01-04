export function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

export function error(message: string, err?: Error) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
  if (err) {
    console.error(err.stack);
  }
}

export function debug(message: string) {
  if (process.env.NODE_ENV === "development") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] DEBUG: ${message}`);
  }
}
