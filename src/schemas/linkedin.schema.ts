import { z } from 'zod'

/**
 * Schemas for LinkedIn MCP tools
 *
 * Defines the parameter structures for all LinkedIn API operations
 * using Zod schemas in raw shape format
 */
export const linkedinApiSchemas = {
  /**
   * Empty parameters schema for endpoints without required parameters
   */
  emptyParams: {},

  /**
   * Schema for searching people on LinkedIn
   */
  searchPeople: {
    currentCompany: z.array(z.string()).optional().describe('Filter by current company'),
    industries: z.array(z.string()).optional().describe('Filter by industries'),
    keywords: z.string().optional().describe('Keywords to search for LinkedIn Profiles'),
    location: z.string().optional().describe('Filter by location')
  },

  /**
   * Schema for getting a LinkedIn profile
   */
  getProfile: {
    publicId: z.string().optional().describe('Public ID of the LinkedIn profile'),
    urnId: z.string().optional().describe('URN ID of the LinkedIn profile')
  },

  /**
   * Schema for searching jobs on LinkedIn
   */
  searchJobs: {
    companies: z.array(z.string()).optional().describe('Filter by companies'),
    jobType: z.array(z.string()).optional().describe('Filter by job type (e.g., Full-Time, Contract)'),
    keywords: z.string().optional().describe('Keywords to search for in job postings'),
    location: z.string().optional().describe('Filter by location')
  },

  /**
   * Schema for sending messages on LinkedIn
   */
  sendMessage: {
    messageBody: z.string().describe('Content of the message to send'),
    recipientUrn: z.string().describe('URN of the message recipient'),
    subject: z.string().optional().default('LinkedIn Connection').describe('Subject of the message')
  },

  /**
   * Schema for creating a text post on LinkedIn
   */
  createTextPost: {
    text: z.string().describe('The text content of the post'),
    visibility: z.enum(['PUBLIC', 'CONNECTIONS']).optional().default('CONNECTIONS').describe('Who can see the post: PUBLIC or CONNECTIONS (1st-degree only)')
  },

  /**
   * Schema for creating an article share on LinkedIn
   */
  createArticleShare: {
    url: z.string().url().describe('URL of the article to share'),
    text: z.string().optional().describe('Commentary text to accompany the article'),
    title: z.string().optional().describe('Custom title for the article (optional)'),
    description: z.string().optional().describe('Custom description for the article (optional)'),
    visibility: z.enum(['PUBLIC', 'CONNECTIONS']).optional().default('CONNECTIONS').describe('Who can see the post: PUBLIC or CONNECTIONS (1st-degree only)')
  },

  /**
   * Schema for creating an image share on LinkedIn
   */
  createImageShare: {
    imageUrl: z.string().url().describe('URL of the image to share (must be publicly accessible)'),
    text: z.string().optional().describe('Commentary text to accompany the image'),
    visibility: z.enum(['PUBLIC', 'CONNECTIONS']).optional().default('CONNECTIONS').describe('Who can see the post: PUBLIC or CONNECTIONS (1st-degree only)')
  },

  /**
   * Marketing API Schemas
   */

  // Ad Account Management
  searchAdAccounts: {
    pageSize: z.number().min(1).max(1000).optional().default(100).describe('Number of results per page (max 1000)'),
    pageToken: z.string().optional().describe('Pagination token from previous response'),
    status: z.enum(['ACTIVE', 'DRAFT', 'CANCELED']).optional().describe('Filter by account status')
  },

  getAdAccount: {
    accountId: z.string().describe('Ad account ID')
  },

  createAdAccount: {
    name: z.string().describe('Name of the ad account'),
    type: z.literal('BUSINESS').default('BUSINESS').describe('Account type (always BUSINESS)'),
    currency: z.string().length(3).describe('ISO 4217 currency code (e.g., USD, EUR, GBP)'),
    reference: z.string().optional().describe('Optional reference identifier')
  },

  // Campaign Group Management
  searchCampaignGroups: {
    accountId: z.string().describe('Ad account ID'),
    pageSize: z.number().min(1).max(1000).optional().default(100).describe('Number of results per page'),
    pageToken: z.string().optional().describe('Pagination token from previous response'),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'DRAFT']).optional().describe('Filter by campaign group status')
  },

  getCampaignGroup: {
    accountId: z.string().describe('Ad account ID'),
    campaignGroupId: z.string().describe('Campaign group ID')
  },

  createCampaignGroup: {
    account: z.string().describe('Ad account URN'),
    name: z.string().describe('Name of the campaign group'),
    status: z.enum(['ACTIVE', 'DRAFT']).optional().default('DRAFT').describe('Initial status of the campaign group'),
    totalBudgetAmount: z.string().optional().describe('Total budget amount (e.g., "1000.00")'),
    totalBudgetCurrency: z.string().length(3).optional().describe('Currency code (e.g., USD)'),
    startTime: z.number().optional().describe('Unix timestamp for campaign start'),
    endTime: z.number().optional().describe('Unix timestamp for campaign end')
  },

  // Campaign Management
  searchCampaigns: {
    accountId: z.string().describe('Ad account ID'),
    campaignGroup: z.string().optional().describe('Filter by campaign group URN'),
    pageSize: z.number().min(1).max(1000).optional().default(100).describe('Number of results per page'),
    pageToken: z.string().optional().describe('Pagination token from previous response'),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'DRAFT']).optional().describe('Filter by campaign status')
  },

  getCampaign: {
    accountId: z.string().describe('Ad account ID'),
    campaignId: z.string().describe('Campaign ID')
  },

  createCampaign: {
    account: z.string().describe('Ad account URN'),
    campaignGroup: z.string().describe('Campaign group URN'),
    name: z.string().describe('Name of the campaign'),
    type: z.enum(['TEXT_AD', 'SPONSORED_UPDATES', 'SPONSORED_INMAILS', 'DISPLAY_ADS']).describe('Type of campaign'),
    objective: z.enum(['BRAND_AWARENESS', 'WEBSITE_VISITS', 'ENGAGEMENT', 'VIDEO_VIEWS', 'LEAD_GENERATION', 'WEBSITE_CONVERSIONS', 'JOB_APPLICANTS']).describe('Campaign objective'),
    costType: z.enum(['CPM', 'CPC', 'CPV']).describe('Cost type (CPM=cost per mille, CPC=cost per click, CPV=cost per view)'),
    status: z.enum(['ACTIVE', 'DRAFT']).optional().default('DRAFT').describe('Initial status of the campaign'),
    dailyBudgetAmount: z.string().optional().describe('Daily budget amount (e.g., "100.00")'),
    dailyBudgetCurrency: z.string().length(3).optional().describe('Currency code for daily budget'),
    totalBudgetAmount: z.string().optional().describe('Total budget amount (e.g., "1000.00")'),
    totalBudgetCurrency: z.string().length(3).optional().describe('Currency code for total budget'),
    unitCostAmount: z.string().optional().describe('Bid amount (e.g., "5.00")'),
    unitCostCurrency: z.string().length(3).optional().describe('Currency code for unit cost'),
    startTime: z.number().optional().describe('Unix timestamp for campaign start'),
    endTime: z.number().optional().describe('Unix timestamp for campaign end')
  },

  updateCampaignStatus: {
    accountId: z.string().describe('Ad account ID'),
    campaignId: z.string().describe('Campaign ID'),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).describe('New status for the campaign')
  },

  // Creative Management
  searchCreatives: {
    campaign: z.string().describe('Campaign URN to filter by'),
    pageSize: z.number().min(1).max(1000).optional().default(100).describe('Number of results per page'),
    pageToken: z.string().optional().describe('Pagination token from previous response'),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'DRAFT']).optional().describe('Filter by creative status')
  },

  getCreative: {
    creativeId: z.string().describe('Creative ID')
  },

  // Analytics
  getAdAnalytics: {
    accounts: z.array(z.string()).optional().describe('Ad account URNs to include in analytics'),
    campaigns: z.array(z.string()).optional().describe('Campaign URNs to include in analytics'),
    creatives: z.array(z.string()).optional().describe('Creative URNs to include in analytics'),
    startYear: z.number().min(2000).max(2100).describe('Start year (e.g., 2025)'),
    startMonth: z.number().min(1).max(12).describe('Start month (1-12)'),
    startDay: z.number().min(1).max(31).describe('Start day (1-31)'),
    endYear: z.number().min(2000).max(2100).describe('End year (e.g., 2025)'),
    endMonth: z.number().min(1).max(12).describe('End month (1-12)'),
    endDay: z.number().min(1).max(31).describe('End day (1-31)'),
    pivot: z.enum(['ACCOUNT', 'CAMPAIGN', 'CAMPAIGN_GROUP', 'CREATIVE', 'CONVERSION', 'COMPANY', 'MEMBER_COMPANY_SIZE', 'MEMBER_INDUSTRY', 'MEMBER_SENIORITY', 'MEMBER_JOB_TITLE', 'MEMBER_JOB_FUNCTION', 'MEMBER_COUNTRY_REGION']).optional().describe('Dimension to pivot by'),
    timeGranularity: z.enum(['DAILY', 'MONTHLY', 'ALL']).optional().default('ALL').describe('Time granularity for results')
  }
}
