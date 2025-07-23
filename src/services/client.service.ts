import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { inject, injectable } from 'tsyringe'

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
  private readonly baseUrl = 'https://api.linkedin.com/v2'

  constructor(
    @inject(TokenService) private readonly tokenService: TokenService,
    @inject(LoggerService) private readonly loggerService: LoggerService,
    @inject(MetricsService) private readonly metricsService: MetricsService
  ) {}

  /**
   * Makes an authenticated request to the LinkedIn API
   *
   * @param method - HTTP method (GET, POST)
   * @param endpoint - Relative API endpoint
   * @param data - Optional data to send with the request
   * @returns Typed API result
   */
  private async makeRequest<T>(method: 'get' | 'post', endpoint: string, data?: unknown): Promise<T> {
    try {
      const startTime = Date.now()
      await this.tokenService.authenticate()

      const config: AxiosRequestConfig = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.tokenService.getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        data
      }

      const response: AxiosResponse<T> = await axios(config)
      const responseTime = Date.now() - startTime
      this.metricsService.recordRequest(endpoint, responseTime)
      this.loggerService.info(`Successful request to ${endpoint}`)
      return response.data
    } catch (error) {
      this.handleRequestError(error, endpoint)
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
    if (axios.isAxiosError(error)) {
      this.loggerService.error(`Request failed for ${endpoint}: ${error.message}`, {
        status: error.response?.status,
        data: error.response?.data
      })
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
    const queryParams = new URLSearchParams()

    const paramMapping: Record<string, string | undefined> = {
      keywords: params.keywords,
      location: params.location
    }

    Object.entries(paramMapping)
      .filter(([_, value]) => value !== undefined)
      .forEach(([key, value]) => queryParams.append(key, value as string))

    this.appendArrayParams(queryParams, {
      'current-company': params.currentCompany,
      'facet-industry': params.industries
    })

    return this.makeRequest<SearchPeopleResult>('get', `/search/people?${queryParams.toString()}`)
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

    const idTypeMapping: Record<string, () => string> = {
      publicId: () => `/people/${params.publicId}`,
      urnId: () => `/people/${encodeURIComponent(params.urnId as string)}`
    }

    const idType = Object.keys(idTypeMapping).find((key) => params[key as keyof GetProfileParams])
    if (!idType) {
      throw new Error('No valid ID provided')
    }

    const endpoint =
      idTypeMapping[idType]() +
      '?projection=(id,firstName,lastName,profilePicture,headline,summary,industry,location,positions,educations,skills)'

    return this.makeRequest<LinkedInProfile>('get', endpoint)
  }

  /**
   * Searches for jobs on LinkedIn with advanced filters
   *
   * @param params - Job search parameters
   * @returns Job search results
   */
  public async searchJobs(params: SearchJobsParams): Promise<SearchJobsResult> {
    const queryParams = new URLSearchParams()

    const paramMapping: Record<string, string | undefined> = {
      keywords: params.keywords,
      location: params.location
    }

    Object.entries(paramMapping)
      .filter(([_, value]) => value !== undefined)
      .forEach(([key, value]) => queryParams.append(key, value as string))

    this.appendArrayParams(queryParams, {
      'company-name': params.companies,
      'job-type': params.jobType
    })

    return this.makeRequest<SearchJobsResult>('get', `/jobs/search?${queryParams.toString()}`)
  }

  /**
   * Helper method to append array parameters to a URLSearchParams object
   *
   * @param queryParams - URLSearchParams object to append to
   * @param paramsMap - Map of parameter names to array values
   */
  private appendArrayParams(queryParams: URLSearchParams, paramsMap: Record<string, string[] | undefined>): void {
    Object.entries(paramsMap)
      .filter(([_, values]) => values && values.length > 0)
      .forEach(([paramName, values]) => {
        ;(values as string[]).forEach((value, index) => {
          queryParams.append(`${paramName}[${index}]`, value)
        })
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
    return this.makeRequest<MessageResponse>('post', '/messages', messageData)
  }

  /**
   * Gets the current user's LinkedIn profile
   *
   * @returns Current user profile
   */
  public async getMyProfile(): Promise<LinkedInProfile> {
    return this.makeRequest<LinkedInProfile>('get', '/me?projection=(id,firstName,lastName,headline,profilePicture)')
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
    return this.makeRequest<ConnectionsResult>('get', '/connections?start=0&count=100')
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
