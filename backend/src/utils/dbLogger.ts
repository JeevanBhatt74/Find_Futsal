export const dbLogger = {
  info: (message: string, data?: any) => console.log(`[DB INFO] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[DB ERROR] ${message}`, error || ''),
  warn: (message: string, data?: any) => console.warn(`[DB WARN] ${message}`, data || ''),
};
