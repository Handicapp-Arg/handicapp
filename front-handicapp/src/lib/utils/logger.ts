export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV !== 'production';

function makeLogger() {
  const log = (level: LogLevel, ...args: any[]) => {
    if (!isDev && (level === 'debug' || level === 'info')) return;
    // En producción permitimos 'warn' y 'error' solamente
    const fn = level === 'debug' ? console.debug
      : level === 'info' ? console.info
      : level === 'warn' ? console.warn
      : console.error;
    fn(...args);
  };

  return {
    debug: (...args: any[]) => log('debug', ...args),
    info: (...args: any[]) => log('info', ...args),
    warn: (...args: any[]) => log('warn', ...args),
    error: (...args: any[]) => log('error', ...args),
  };
}

export const logger = makeLogger();
