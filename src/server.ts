import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { inject, injectable } from 'tsyringe'

import { linkedinApiSchemas } from './schemas/linkedin.schema.js'
import { ClientService } from './services/client.service.js'
import { LoggerService } from './services/logger.service.js'
import { TokenService } from './services/token.service.js'

import type { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { McpResourceResponse } from './types/mcp.js'

/**
 * LinkedInMcpServer - Main server class for LinkedIn MCP integration
 *
 * Manages the MCP server lifecycle and registers LinkedIn-related tools
 * for interacting with LinkedIn's API through the Model Context Protocol.
 */
@injectable()
export class LinkedInMcpServer {
  private readonly server: McpServer

  constructor(
    @inject(ClientService) private readonly clientService: ClientService,
    @inject(TokenService) private readonly tokenService: TokenService,
    @inject(LoggerService) private readonly logger: LoggerService
  ) {
    this.server = new McpServer({
      name: process.env.MCP_SERVER_NAME ?? 'linkedin-mcpserver',
      version: process.env.MCP_SERVER_VERSION ?? '0.1.0',
      port: process.env.MCP_SERVER_PORT ?? 5050
    })
    this.registerTools()
  }

  /**
   * Start the server with the given transport
   *
   * @param transport - Transport mechanism for server communication
   */
  public async start(transport: StdioServerTransport): Promise<void> {
    this.logger.info('Starting LinkedIn MCP Server')
    try {
      await this.tokenService.authenticate()
      this.logger.info('LinkedIn authentication successful')
      await this.server.connect(transport)
      this.logger.info('LinkedIn MCP Server started successfully')
    } catch (error) {
      this.logger.error('Failed to start LinkedIn MCP Server', error)
      throw error
    }
  }

  /**
   * Stop the server and clean up resources
   */
  public async stop(): Promise<void> {
    this.logger.info('Stopping LinkedIn MCP Server')
    await this.server.close()
    this.logger.info('LinkedIn MCP Server stopped')
  }

  /**
   * Register MCP tools for LinkedIn API interactions
   * Implements tool definitions for various LinkedIn data operations
   */
  private registerTools(): void {
    // Search People Tool
    this.server.tool(
      'search-people',
      'Search for LinkedIn profiles based on various criteria',
      linkedinApiSchemas.searchPeople,
      async (params) => {
        this.logger.info('Executing LinkedIn People Search', { keywords: params.keywords })
        try {
          const results = await this.clientService.searchPeople(params)
          return this.createResourceResponse(results)
        } catch (error) {
          this.logger.error('LinkedIn People Search Failed', error)
          throw error
        }
      }
    )

    // Get Profile Tool
    this.server.tool(
      'get-profile',
      'Retrieve detailed LinkedIn profile information',
      linkedinApiSchemas.getProfile,
      async (params) => {
        this.logger.info('Retrieving LinkedIn Profile', {
          publicId: params.publicId,
          urnId: params.urnId
        })
        try {
          const profile = await this.clientService.getProfile(params)
          return this.createResourceResponse(profile)
        } catch (error) {
          this.logger.error('LinkedIn Profile Retrieval Failed', error)
          throw error
        }
      }
    )

    // Search Jobs Tool
    this.server.tool(
      'search-jobs',
      'Search for LinkedIn job postings based on various criteria',
      linkedinApiSchemas.searchJobs,
      async (params) => {
        this.logger.info('Executing LinkedIn Job Search', {
          keywords: params.keywords,
          location: params.location
        })
        try {
          const jobs = await this.clientService.searchJobs(params)
          return this.createResourceResponse(jobs)
        } catch (error) {
          this.logger.error('LinkedIn Job Search Failed', error)
          throw error
        }
      }
    )

    // Send Message Tool
    this.server.tool(
      'send-message',
      'Send a message to a LinkedIn connection',
      linkedinApiSchemas.sendMessage,
      async (params) => {
        this.logger.info('Sending LinkedIn Message', {
          recipientUrn: params.recipientUrn
        })
        try {
          const result = await this.clientService.sendMessage(params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('LinkedIn Message Sending Failed', error)
          throw error
        }
      }
    )

    // Get My Profile Tool
    this.server.tool(
      'get-my-profile',
      "Retrieve the current user's LinkedIn profile information",
      linkedinApiSchemas.emptyParams,
      async () => {
        this.logger.info('Retrieving Current User Profile')
        try {
          const profile = await this.clientService.getMyProfile()
          return this.createResourceResponse(profile)
        } catch (error) {
          this.logger.error('Current User Profile Retrieval Failed', error)
          throw error
        }
      }
    )

    // Get Network Statistics Tool
    this.server.tool(
      'get-network-stats',
      'Retrieve network statistics for the current user',
      linkedinApiSchemas.emptyParams,
      async () => {
        this.logger.info('Retrieving Network Statistics')
        try {
          const stats = await this.clientService.getNetworkStats()
          return this.createResourceResponse(stats)
        } catch (error) {
          this.logger.error('Network Statistics Retrieval Failed', error)
          throw error
        }
      }
    )

    // Get Connections Tool
    this.server.tool(
      'get-connections',
      'Retrieve the current user connections',
      linkedinApiSchemas.emptyParams,
      async () => {
        this.logger.info('Retrieving User Connections')
        try {
          const connections = await this.clientService.getConnections()
          return this.createResourceResponse(connections)
        } catch (error) {
          this.logger.error('User Connections Retrieval Failed', error)
          throw error
        }
      }
    )
  }

  private createResourceResponse(data: unknown): McpResourceResponse {
    const jsonString = JSON.stringify(data)
    const base64Data = Buffer.from(jsonString).toString('base64')
    return {
      content: [
        {
          type: 'resource',
          resource: {
            text: jsonString,
            uri: `data:application/json;base64,${base64Data}`,
            mimeType: 'application/json'
          }
        }
      ]
    }
  }
}
