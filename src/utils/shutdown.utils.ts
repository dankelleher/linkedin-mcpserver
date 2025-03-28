import type { LinkedInMcpServer } from '../server.js'
import type { LoggerService } from '../services/logger.service.js'

/**
 * Handle graceful shutdown of the application
 *
 * @param server - Server instance to stop
 * @param logger - Logger service
 */
export function setupShutdownHandlers(server: LinkedInMcpServer, logger: LoggerService): void {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const

  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal} signal, shutting down`)

      try {
        await server.stop()
        logger.info('Server shut down successfully')
        process.exit(0)
      } catch (error) {
        logger.error('Error during shutdown', error)
        process.exit(1)
      }
    })
  })

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error)
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', { reason, promise })
  })
}
