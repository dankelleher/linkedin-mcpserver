import { inject, injectable } from 'tsyringe'
import axios, { type AxiosInstance } from 'axios'

import { LoggerService } from './logger.service.js'
import { MetricsService } from './metrics.service.js'
import { TokenService } from './token.service.js'

import type {
  AdAccount,
  AdAccountsResult,
  AdAnalyticsParams,
  AdAnalyticsResult,
  Campaign,
  CampaignGroup,
  CreateAdAccountParams,
  CreateCampaignGroupParams,
  CreateCampaignParams,
  Creative,
  SearchAdAccountsParams
} from '../types/linkedin.js'

/**
 * MarketingService - Manages LinkedIn Marketing API communication
 *
 * **REQUIRES LINKEDIN MARKETING API ACCESS**
 * - Development Tier: Read-only access for unlimited accounts, edit access for up to 5 accounts
 * - Standard Tier: No limits (requires application and approval)
 *
 * Required scope: rw_ads (read-write) or r_ads (read-only)
 *
 * All endpoints verified against LinkedIn Marketing API documentation (Nov 2025):
 * https://learn.microsoft.com/en-us/linkedin/marketing/
 *
 * **IMPORTANT**: Uses Rest.li protocol with custom parameter encoding.
 * Query params must NOT be URL-encoded by Axios - Rest.li requires:
 * - URL-encode URN values only
 * - Do NOT encode commas, parentheses, or List() syntax
 * See: https://linkedin.github.io/rest.li/spec/protocol
 */
@injectable()
export class MarketingService {
  private axiosClient: AxiosInstance

  constructor(
    @inject(TokenService) private readonly tokenService: TokenService,
    @inject(LoggerService) private readonly loggerService: LoggerService,
    @inject(MetricsService) private readonly metricsService: MetricsService
  ) {
    this.axiosClient = axios.create({
      baseURL: 'https://api.linkedin.com',
      // Disable Axios's default URL encoding for Rest.li compatibility
      // Rest.li requires specific encoding: URL-encode values but NOT commas/parentheses
      paramsSerializer: {
        encode: (val) => val // Don't encode - we'll handle it manually
      }
    })
  }

  /**
   * Makes an authenticated request to the LinkedIn Marketing API
   */
  private async makeRequest<T>(method: 'get' | 'post', path: string, params?: Record<string, any>, data?: any): Promise<T> {
    try {
      const startTime = Date.now()
      await this.tokenService.authenticate()
      const accessToken = this.tokenService.getAccessToken()

      // Get current date for LinkedIn-Version header (YYYYMM format)
      const now = new Date()
      const version = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

      const response = await this.axiosClient.request<T>({
        method,
        url: path,
        params,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': version
        },
        data
      })

      const responseTime = Date.now() - startTime
      this.metricsService.recordRequest(path, responseTime)
      this.loggerService.info(`Successful Marketing API request to ${path}`)
      return response.data
    } catch (error) {
      this.loggerService.error(`Marketing API request failed for ${path}`, error)
      throw error
    }
  }

  /**
   * Searches for ad accounts accessible to the authenticated user
   *
   * Endpoint: GET /rest/adAccounts?q=search
   * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-accounts
   */
  public async searchAdAccounts(params?: SearchAdAccountsParams): Promise<AdAccountsResult> {
    const queryParams: Record<string, any> = {
      q: 'search'
    }

    if (params?.pageSize) queryParams.pageSize = params.pageSize
    if (params?.pageToken) queryParams.pageToken = params.pageToken
    if (params?.status) {
      queryParams.search = `(status:(values:List(${params.status})))`
    }

    return this.makeRequest<AdAccountsResult>('get', '/rest/adAccounts', queryParams)
  }

  /**
   * Gets details of a specific ad account
   *
   * Endpoint: GET /rest/adAccounts/{id}
   */
  public async getAdAccount(accountId: string): Promise<AdAccount> {
    return this.makeRequest<AdAccount>('get', `/rest/adAccounts/${encodeURIComponent(accountId)}`)
  }

  /**
   * Creates a new ad account
   *
   * **REQUIRES STANDARD TIER** (Development tier limited to 5 accounts)
   * Endpoint: POST /rest/adAccounts
   */
  public async createAdAccount(params: CreateAdAccountParams): Promise<AdAccount> {
    const accountData = {
      name: params.name,
      type: 'BUSINESS',
      currency: params.currency,
      ...(params.reference && { reference: params.reference }),
      status: 'DRAFT'
    }

    return this.makeRequest<AdAccount>('post', '/rest/adAccounts', undefined, accountData)
  }

  /**
   * Searches for campaign groups in an ad account
   *
   * Endpoint: GET /rest/adAccounts/{adAccountId}/adCampaignGroups?q=search
   * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-campaign-groups
   */
  public async searchCampaignGroups(
    accountId: string,
    params?: { pageSize?: number; pageToken?: string; status?: string }
  ): Promise<{ elements: CampaignGroup[] }> {
    const queryParams: Record<string, any> = {
      q: 'search'
    }

    if (params?.pageSize) queryParams.pageSize = params.pageSize
    if (params?.pageToken) queryParams.pageToken = params.pageToken
    if (params?.status) {
      queryParams.search = `(status:(values:List(${params.status})))`
    }

    return this.makeRequest<{ elements: CampaignGroup[] }>(
      'get',
      `/rest/adAccounts/${encodeURIComponent(accountId)}/adCampaignGroups`,
      queryParams
    )
  }

  /**
   * Gets details of a specific campaign group
   *
   * Endpoint: GET /rest/adAccounts/{adAccountId}/adCampaignGroups/{id}
   */
  public async getCampaignGroup(accountId: string, campaignGroupId: string): Promise<CampaignGroup> {
    return this.makeRequest<CampaignGroup>(
      'get',
      `/rest/adAccounts/${encodeURIComponent(accountId)}/adCampaignGroups/${encodeURIComponent(campaignGroupId)}`
    )
  }

  /**
   * Creates a new campaign group
   *
   * Endpoint: POST /rest/adAccounts/{adAccountId}/adCampaignGroups
   */
  public async createCampaignGroup(params: CreateCampaignGroupParams): Promise<CampaignGroup> {
    // Extract accountId from account URN
    const accountId = params.account.split(':').pop() || params.account

    const groupData: any = {
      account: params.account,
      name: params.name,
      status: params.status || 'DRAFT'
    }

    if (params.totalBudget) {
      groupData.totalBudget = params.totalBudget
    }

    if (params.runSchedule) {
      groupData.runSchedule = params.runSchedule
    }

    return this.makeRequest<CampaignGroup>(
      'post',
      `/rest/adAccounts/${encodeURIComponent(accountId)}/adCampaignGroups`,
      undefined,
      groupData
    )
  }

  /**
   * Searches for campaigns in an ad account
   *
   * Endpoint: GET /rest/adAccounts/{adAccountId}/adCampaigns?q=search
   * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-campaigns
   */
  public async searchCampaigns(
    accountId: string,
    params?: { campaignGroup?: string; pageSize?: number; pageToken?: string; status?: string }
  ): Promise<{ elements: Campaign[] }> {
    const queryParams: Record<string, any> = {
      q: 'search'
    }

    const searchCriteria: string[] = []
    if (params?.campaignGroup) {
      searchCriteria.push(`campaignGroup:(values:List(${params.campaignGroup}))`)
    }
    if (params?.status) {
      searchCriteria.push(`status:(values:List(${params.status}))`)
    }

    if (searchCriteria.length > 0) {
      queryParams.search = `(${searchCriteria.join(',')})`
    }

    if (params?.pageSize) queryParams.pageSize = params.pageSize
    if (params?.pageToken) queryParams.pageToken = params.pageToken

    return this.makeRequest<{ elements: Campaign[] }>(
      'get',
      `/rest/adAccounts/${encodeURIComponent(accountId)}/adCampaigns`,
      queryParams
    )
  }

  /**
   * Gets details of a specific campaign
   *
   * Endpoint: GET /rest/adAccounts/{adAccountId}/adCampaigns/{id}
   */
  public async getCampaign(accountId: string, campaignId: string): Promise<Campaign> {
    return this.makeRequest<Campaign>(
      'get',
      `/rest/adAccounts/${encodeURIComponent(accountId)}/adCampaigns/${encodeURIComponent(campaignId)}`
    )
  }

  /**
   * Creates a new campaign
   *
   * Endpoint: POST /rest/adAccounts/{adAccountId}/adCampaigns
   */
  public async createCampaign(params: CreateCampaignParams): Promise<Campaign> {
    // Extract accountId from account URN
    const accountId = params.account.split(':').pop() || params.account

    const campaignData: any = {
      account: params.account,
      campaignGroup: params.campaignGroup,
      name: params.name,
      type: params.type,
      objectiveType: params.objective,
      costType: params.costType,
      status: params.status || 'DRAFT'
    }

    if (params.dailyBudget) {
      campaignData.dailyBudget = params.dailyBudget
    }

    if (params.totalBudget) {
      campaignData.totalBudget = params.totalBudget
    }

    if (params.unitCost) {
      campaignData.unitCost = params.unitCost
    }

    if (params.runSchedule) {
      campaignData.runSchedule = params.runSchedule
    }

    return this.makeRequest<Campaign>(
      'post',
      `/rest/adAccounts/${encodeURIComponent(accountId)}/adCampaigns`,
      undefined,
      campaignData
    )
  }

  /**
   * Updates campaign status (activate, pause, archive)
   *
   * Endpoint: POST /rest/adAccounts/{adAccountId}/adCampaigns/{id}
   * Header: X-RestLi-Method: PARTIAL_UPDATE
   */
  public async updateCampaignStatus(accountId: string, campaignId: string, status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'): Promise<Campaign> {
    const now = new Date()
    const version = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

    const response = await this.axiosClient.request<Campaign>({
      method: 'post',
      url: `/rest/adAccounts/${encodeURIComponent(accountId)}/adCampaigns/${encodeURIComponent(campaignId)}`,
      headers: {
        'Authorization': `Bearer ${this.tokenService.getAccessToken()}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': version,
        'X-RestLi-Method': 'PARTIAL_UPDATE'
      },
      data: { patch: { $set: { status } } }
    })

    return response.data
  }

  /**
   * Searches for creatives in a campaign
   *
   * Endpoint: GET /rest/creatives?q=search
   * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-creatives
   */
  public async searchCreatives(
    campaignUrn: string,
    params?: { pageSize?: number; pageToken?: string; status?: string }
  ): Promise<{ elements: Creative[] }> {
    const queryParams: Record<string, any> = {
      q: 'search',
      search: `(campaign:(values:List(${campaignUrn})))`
    }

    if (params?.status) {
      queryParams.search = `(campaign:(values:List(${campaignUrn})),status:(values:List(${params.status})))`
    }

    if (params?.pageSize) queryParams.pageSize = params.pageSize
    if (params?.pageToken) queryParams.pageToken = params.pageToken

    return this.makeRequest<{ elements: Creative[] }>('get', '/rest/creatives', queryParams)
  }

  /**
   * Gets details of a specific creative
   *
   * Endpoint: GET /rest/creatives/{id}
   */
  public async getCreative(creativeId: string): Promise<Creative> {
    return this.makeRequest<Creative>('get', `/rest/creatives/${encodeURIComponent(creativeId)}`)
  }

  /**
   * Gets ad analytics for specified entities and date range
   *
   * Endpoint: GET /rest/adAnalytics?q=analytics
   * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting
   *
   * Example: ?q=analytics&pivot=CREATIVE&campaigns=List(urn%3Ali%3AsponsoredCampaign%3A123)
   */
  public async getAdAnalytics(params: AdAnalyticsParams): Promise<AdAnalyticsResult> {
    const queryParams: Record<string, any> = {
      q: 'analytics',
      dateRange: `(start:(year:${params.dateRange.start.year},month:${params.dateRange.start.month},day:${params.dateRange.start.day}),end:(year:${params.dateRange.end.year},month:${params.dateRange.end.month},day:${params.dateRange.end.day}))`
    }

    // URNs must be URL-encoded, but List() and commas must NOT be encoded
    // Example: List(urn%3Ali%3AsponsoredCampaign%3A123,urn%3Ali%3AsponsoredCampaign%3A456)
    if (params.accounts?.length) {
      const encodedUrns = params.accounts.map(urn => encodeURIComponent(urn))
      queryParams.accounts = `List(${encodedUrns.join(',')})`
    }

    if (params.campaigns?.length) {
      const encodedUrns = params.campaigns.map(urn => encodeURIComponent(urn))
      queryParams.campaigns = `List(${encodedUrns.join(',')})`
    }

    if (params.creatives?.length) {
      const encodedUrns = params.creatives.map(urn => encodeURIComponent(urn))
      queryParams.creatives = `List(${encodedUrns.join(',')})`
    }

    if (params.pivot) {
      queryParams.pivot = params.pivot
    }

    if (params.timeGranularity) {
      queryParams.timeGranularity = params.timeGranularity
    }

    if (params.fields?.length) {
      queryParams.fields = params.fields.join(',')
    }

    return this.makeRequest<AdAnalyticsResult>('get', '/rest/adAnalytics', queryParams)
  }
}
