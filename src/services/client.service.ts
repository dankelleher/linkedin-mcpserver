import { inject, injectable } from 'tsyringe'
import { RestliClient } from 'linkedin-api-client'

import { LoggerService } from './logger.service.js'
import { MetricsService } from './metrics.service.js'
import { TokenService } from './token.service.js'

import type {
  ClientMetrics,
  ConnectionsResult,
  GetProfileParams,
  LinkedInProfile,
  MessageResponse,
  NetworkStats,
  SearchJobsParams,
  SearchJobsResult,
  SearchPeopleParams,
  SearchPeopleResult,
  SendMessageParams
} from '../types/linkedin.js'
import type { DetailedMetrics } from '../types/metrics.js'

/**
 * ClientService - Manages the communication with LinkedIn API
 *
 * Provides access to LinkedIn API endpoints for searching people,
 * profiles, jobs and sending messages.
 */
@injectable()
export class ClientService {
  private restliClient: RestliClient

  constructor(
    @inject(TokenService) private readonly tokenService: TokenService,
    @inject(LoggerService) private readonly loggerService: LoggerService,
    @inject(MetricsService) private readonly metricsService: MetricsService
  ) {
    this.restliClient = new RestliClient()
  }

  /**
   * Makes an authenticated request to the LinkedIn API using RestliClient
   *
   * @param method - HTTP method (get, finder, create, update)
   * @param resourcePath - API resource path
   * @param params - Optional query parameters
   * @param data - Optional data to send with the request
   * @returns Typed API result
   */
  private async makeRequest<T>(method: 'get' | 'finder' | 'create' | 'update', resourcePath: string, params?: Record<string, any>, data?: unknown): Promise<T> {
    try {
      const startTime = Date.now()
      await this.tokenService.authenticate()
      const accessToken = this.tokenService.getAccessToken()

      let response: any
      
      switch (method) {
        case 'get':
          response = await this.restliClient.get({
            resourcePath,
            accessToken
          })
          break
        case 'finder':
          response = await this.restliClient.finder({
            resourcePath,
            finderName: params?.finderName || 'search',
            queryParams: params?.queryParams || {},
            accessToken
          })
          break
        case 'create':
          response = await this.restliClient.create({
            resourcePath,
            entity: data,
            accessToken
          })
          break
        case 'update':
          response = await this.restliClient.update({
            resourcePath,
            id: params?.id,
            patchSetObject: data,
            accessToken
          })
          break
      }

      const responseTime = Date.now() - startTime
      this.metricsService.recordRequest(resourcePath, responseTime)
      this.loggerService.info(`Successful request to ${resourcePath}`)
      return response.data as T
    } catch (error) {
      this.handleRequestError(error, resourcePath)
      throw error
    }
  }

  /**
   * Handles and logs request errors
   *
   * @param error - Error object
   * @param endpoint - API endpoint that failed
   */
  private handleRequestError(error: unknown, endpoint: string): void {
    if (error instanceof Error) {
      this.loggerService.error(`Request failed for ${endpoint}: ${error.message}`, error)
    } else {
      this.loggerService.error(`Unexpected error accessing ${endpoint}`, error)
    }
  }

  /**
   * Searches for people on LinkedIn with advanced filters
   *
   * @param params - Search parameters
   * @returns People search results
   */
  public async searchPeople(params: SearchPeopleParams): Promise<SearchPeopleResult> {
    const queryParams: Record<string, any> = {}
    
    if (params.keywords) queryParams.keywords = params.keywords
    if (params.location) queryParams.location = params.location
    if (params.currentCompany?.length) queryParams['current-company'] = params.currentCompany
    if (params.industries?.length) queryParams['facet-industry'] = params.industries

    return this.makeRequest<SearchPeopleResult>('finder', '/people', {
      finderName: 'search',
      queryParams
    })
  }

  /**
   * Gets a LinkedIn profile by public ID or URN ID
   *
   * @param params - Profile search parameters
   * @returns LinkedIn profile
   */
  public async getProfile(params: GetProfileParams): Promise<LinkedInProfile> {
    if (!params.publicId && !params.urnId) {
      throw new Error('Either publicId or urnId must be provided')
    }

    const id = params.urnId || params.publicId
    const resourcePath = params.urnId ? `/people/${encodeURIComponent(params.urnId)}` : `/people/${params.publicId}`

    return this.makeRequest<LinkedInProfile>('get', resourcePath)
  }

  /**
   * Searches for jobs on LinkedIn with advanced filters
   *
   * @param params - Job search parameters
   * @returns Job search results
   */
  public async searchJobs(params: SearchJobsParams): Promise<SearchJobsResult> {
    const queryParams: Record<string, any> = {}
    
    if (params.keywords) queryParams.keywords = params.keywords
    if (params.location) queryParams.location = params.location
    if (params.companies?.length) queryParams['company-name'] = params.companies
    if (params.jobType?.length) queryParams['job-type'] = params.jobType

    return this.makeRequest<SearchJobsResult>('finder', '/jobs', {
      finderName: 'search',
      queryParams
    })
  }


  /**
   * Sends a message to a LinkedIn connection
   *
   * @param params - Message parameters
   * @returns Confirmation response
   */
  public async sendMessage(params: SendMessageParams): Promise<MessageResponse> {
    const messageData = {
      recipients: {
        person: params.recipientUrn
      },
      subject: params.subject,
      body: params.messageBody,
      messageType: 'INMAIL'
    }
    return this.makeRequest<MessageResponse>('create', '/messages', undefined, messageData)
  }

  /**
   * Gets the current user's LinkedIn profile
   *
   * @returns Current user profile
   */
  public async getMyProfile(): Promise<LinkedInProfile> {
    return this.makeRequest<LinkedInProfile>('get', '/me')
  }

  /**
   * Gets network statistics for the current user
   *
   * @returns Network statistics
   */
  public async getNetworkStats(): Promise<NetworkStats> {
    return this.makeRequest<NetworkStats>('get', '/networkSizes/~')
  }

  /**
   * Gets the user's LinkedIn connections
   *
   * @returns List of connections
   */
  public async getConnections(): Promise<ConnectionsResult> {
    return this.makeRequest<ConnectionsResult>('finder', '/connections', {
      finderName: 'connections',
      queryParams: { start: 0, count: 100 }
    })
  }

  /**
   * Gets API request metrics and performance
   *
   * @returns Detailed metrics about API usage
   */
  public getMetrics(): DetailedMetrics {
    return this.metricsService.getDetailedMetrics()
  }

  /**
   * Gets basic client metrics for backward compatibility
   *
   * @returns Basic client metrics
   * @deprecated Use getDetailedMetrics() instead
   */
  public getBasicMetrics(): ClientMetrics {
    const metrics = this.metricsService.getDetailedMetrics().overall
    return {
      requestCount: metrics.requestCount,
      lastRequestTimestamp: metrics.lastRequestTimestamp,
      averageRequestTime: metrics.averageResponseTime
    }
  }
}
