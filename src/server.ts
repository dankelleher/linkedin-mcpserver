import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { inject, injectable } from 'tsyringe'

import { linkedinApiSchemas } from './schemas/linkedin.schema.js'
import { ClientService } from './services/client.service.js'
import { LoggerService } from './services/logger.service.js'
import { MarketingService } from './services/marketing.service.js'
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
    @inject(MarketingService) private readonly marketingService: MarketingService,
    @inject(TokenService) private readonly tokenService: TokenService,
    @inject(LoggerService) private readonly logger: LoggerService
  ) {
    this.server = new McpServer({
      name: process.env.MCP_SERVER_NAME ?? 'linkedin-mcpserver',
      version: process.env.MCP_SERVER_VERSION ?? '0.1.0',
      port: process.env.MCP_SERVER_PORT ?? 5050
    })
    this.registerTools();

    (async () => {
        // test simple request
        await this.ensureAuthenticated()
        const results = await this.clientService.getMyProfile()
        console.error(results)
    })().catch((error:unknown) => {
        this.logger.error('Error during LinkedIn MCP Server initialization', error)
        throw error
    })
  }

  /**
   * Start the server with the given transport
   *
   * @param transport - Transport mechanism for server communication
   */
  public async start(transport: StdioServerTransport): Promise<void> {
    this.logger.info('Starting LinkedIn MCP Server')
    try {
      // Connect to MCP transport without authentication
      // Authentication will happen lazily on first API call
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
   * Ensures authentication before API calls
   * Implements lazy authentication pattern
   */
  private async ensureAuthenticated(): Promise<void> {
    try {
      await this.tokenService.authenticate()
    } catch (error) {
      this.logger.error('LinkedIn authentication failed', error)
      throw new Error(`LinkedIn authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
          await this.ensureAuthenticated()
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
          await this.ensureAuthenticated()
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
          await this.ensureAuthenticated()
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
          await this.ensureAuthenticated()
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
          await this.ensureAuthenticated()
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
          await this.ensureAuthenticated()
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
          await this.ensureAuthenticated()
          const connections = await this.clientService.getConnections()
          return this.createResourceResponse(connections)
        } catch (error) {
          this.logger.error('User Connections Retrieval Failed', error)
          throw error
        }
      }
    )

    // Create Text Post Tool
    this.server.tool(
      'create-text-post',
      'Create a text-only post on LinkedIn',
      linkedinApiSchemas.createTextPost,
      async (params) => {
        this.logger.info('Creating LinkedIn Text Post')
        try {
          await this.ensureAuthenticated()
          const result = await this.clientService.createTextPost(params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('LinkedIn Text Post Creation Failed', error)
          throw error
        }
      }
    )

    // Create Article Share Tool
    this.server.tool(
      'create-article-share',
      'Share an article/URL on LinkedIn with optional commentary',
      linkedinApiSchemas.createArticleShare,
      async (params) => {
        this.logger.info('Creating LinkedIn Article Share', { url: params.url })
        try {
          await this.ensureAuthenticated()
          const result = await this.clientService.createArticleShare(params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('LinkedIn Article Share Creation Failed', error)
          throw error
        }
      }
    )

    // Create Image Share Tool
    this.server.tool(
      'create-image-share',
      'Share an image on LinkedIn with optional commentary',
      linkedinApiSchemas.createImageShare,
      async (params) => {
        this.logger.info('Creating LinkedIn Image Share', { imageUrl: params.imageUrl })
        try {
          await this.ensureAuthenticated()
          const result = await this.clientService.createImageShare(params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('LinkedIn Image Share Creation Failed', error)
          throw error
        }
      }
    )

    // ===== Marketing API Tools (Requires Marketing API Access) =====

    // Search Ad Accounts Tool
    this.server.tool(
      'search-ad-accounts',
      'Search for accessible LinkedIn ad accounts',
      linkedinApiSchemas.searchAdAccounts,
      async (params) => {
        this.logger.info('Searching Ad Accounts')
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.searchAdAccounts(params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Ad Accounts Search Failed', error)
          throw error
        }
      }
    )

    // Get Ad Account Tool
    this.server.tool(
      'get-ad-account',
      'Get details of a specific LinkedIn ad account',
      linkedinApiSchemas.getAdAccount,
      async (params) => {
        this.logger.info('Getting Ad Account', { accountId: params.accountId })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.getAdAccount(params.accountId)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Get Ad Account Failed', error)
          throw error
        }
      }
    )

    // Create Ad Account Tool
    this.server.tool(
      'create-ad-account',
      'Create a new LinkedIn ad account (requires Standard tier)',
      linkedinApiSchemas.createAdAccount,
      async (params) => {
        this.logger.info('Creating Ad Account', { name: params.name })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.createAdAccount(params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Create Ad Account Failed', error)
          throw error
        }
      }
    )

    // Search Campaign Groups Tool
    this.server.tool(
      'search-campaign-groups',
      'Search campaign groups in a LinkedIn ad account',
      linkedinApiSchemas.searchCampaignGroups,
      async (params) => {
        this.logger.info('Searching Campaign Groups', { accountId: params.accountId })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.searchCampaignGroups(params.accountId, params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Campaign Groups Search Failed', error)
          throw error
        }
      }
    )

    // Get Campaign Group Tool
    this.server.tool(
      'get-campaign-group',
      'Get details of a specific campaign group',
      linkedinApiSchemas.getCampaignGroup,
      async (params) => {
        this.logger.info('Getting Campaign Group', { accountId: params.accountId, campaignGroupId: params.campaignGroupId })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.getCampaignGroup(params.accountId, params.campaignGroupId)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Get Campaign Group Failed', error)
          throw error
        }
      }
    )

    // Create Campaign Group Tool
    this.server.tool(
      'create-campaign-group',
      'Create a new campaign group in a LinkedIn ad account',
      linkedinApiSchemas.createCampaignGroup,
      async (params) => {
        this.logger.info('Creating Campaign Group', { name: params.name })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.createCampaignGroup(params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Create Campaign Group Failed', error)
          throw error
        }
      }
    )

    // Search Campaigns Tool
    this.server.tool(
      'search-campaigns',
      'Search campaigns in a LinkedIn ad account',
      linkedinApiSchemas.searchCampaigns,
      async (params) => {
        this.logger.info('Searching Campaigns', { accountId: params.accountId })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.searchCampaigns(params.accountId, params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Campaigns Search Failed', error)
          throw error
        }
      }
    )

    // Get Campaign Tool
    this.server.tool(
      'get-campaign',
      'Get details of a specific campaign',
      linkedinApiSchemas.getCampaign,
      async (params) => {
        this.logger.info('Getting Campaign', { accountId: params.accountId, campaignId: params.campaignId })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.getCampaign(params.accountId, params.campaignId)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Get Campaign Failed', error)
          throw error
        }
      }
    )

    // Create Campaign Tool
    this.server.tool(
      'create-campaign',
      'Create a new campaign in a LinkedIn ad account',
      linkedinApiSchemas.createCampaign,
      async (params) => {
        this.logger.info('Creating Campaign', { name: params.name })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.createCampaign(params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Create Campaign Failed', error)
          throw error
        }
      }
    )

    // Update Campaign Status Tool
    this.server.tool(
      'update-campaign-status',
      'Update the status of a LinkedIn campaign (activate, pause, or archive)',
      linkedinApiSchemas.updateCampaignStatus,
      async (params) => {
        this.logger.info('Updating Campaign Status', { accountId: params.accountId, campaignId: params.campaignId, status: params.status })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.updateCampaignStatus(params.accountId, params.campaignId, params.status)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Update Campaign Status Failed', error)
          throw error
        }
      }
    )

    // Search Creatives Tool
    this.server.tool(
      'search-creatives',
      'Search creatives in a LinkedIn campaign',
      linkedinApiSchemas.searchCreatives,
      async (params) => {
        this.logger.info('Searching Creatives', { campaign: params.campaign })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.searchCreatives(params.campaign, params)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Creatives Search Failed', error)
          throw error
        }
      }
    )

    // Get Creative Tool
    this.server.tool(
      'get-creative',
      'Get details of a specific creative',
      linkedinApiSchemas.getCreative,
      async (params) => {
        this.logger.info('Getting Creative', { creativeId: params.creativeId })
        try {
          await this.ensureAuthenticated()
          const result = await this.marketingService.getCreative(params.creativeId)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Get Creative Failed', error)
          throw error
        }
      }
    )

    // Get Ad Analytics Tool
    this.server.tool(
      'get-ad-analytics',
      'Get advertising analytics for LinkedIn campaigns, creatives, or accounts',
      linkedinApiSchemas.getAdAnalytics,
      async (params) => {
        this.logger.info('Getting Ad Analytics')
        try {
          await this.ensureAuthenticated()
          const analyticsParams = {
            accounts: params.accounts,
            campaigns: params.campaigns,
            creatives: params.creatives,
            dateRange: {
              start: {
                year: params.startYear,
                month: params.startMonth,
                day: params.startDay
              },
              end: {
                year: params.endYear,
                month: params.endMonth,
                day: params.endDay
              }
            },
            pivot: params.pivot,
            timeGranularity: params.timeGranularity
          }
          const result = await this.marketingService.getAdAnalytics(analyticsParams)
          return this.createResourceResponse(result)
        } catch (error) {
          this.logger.error('Get Ad Analytics Failed', error)
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
