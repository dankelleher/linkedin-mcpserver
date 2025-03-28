import { Bindings } from 'pino'

/**
 * Interface for logger implementation
 * Defines the standard logging methods that must be implemented
 */
export interface ILogger {
  /**
   * Log a message at trace level (lowest level)
   * @param message - The message to log
   * @param args - Additional arguments or context to log
   */
  trace(message: string, ...args: unknown[]): void

  /**
   * Log a message at debug level
   * @param message - The message to log
   * @param args - Additional arguments or context to log
   */
  debug(message: string, ...args: unknown[]): void

  /**
   * Log a message at info level
   * @param message - The message to log
   * @param args - Additional arguments or context to log
   */
  info(message: string, ...args: unknown[]): void

  /**
   * Log a message at warn level
   * @param message - The message to log
   * @param args - Additional arguments or context to log
   */
  warn(message: string, ...args: unknown[]): void

  /**
   * Log a message at error level
   * @param message - The message to log
   * @param args - Additional arguments or context to log
   */
  error(message: string, ...args: unknown[]): void

  /**
   * Create a child logger with additional context
   * @param bindings - Context to be added to all logs from this child
   * @returns A child logger instance
   */
  child(bindings: Bindings): ILogger
}
