/**
 * API response types for LinkedIn
 */

export interface SearchPeopleParams {
  keywords?: string
  location?: string
  currentCompany?: string[]
  industries?: string[]
}

export interface GetProfileParams {
  publicId?: string
  urnId?: string
}

export interface SearchJobsParams {
  keywords?: string
  location?: string
  companies?: string[]
  jobType?: string[]
}

export interface SendMessageParams {
  messageBody: string
  recipientUrn: string
  subject: string
}

export interface ProfilePicture {
  displayImage: string
}

export interface LinkedInLocation {
  country: string
  city?: string
}

export interface LinkedInPosition {
  companyName: string
  title: string
  startDate: {
    month: number
    year: number
  }
  endDate?: {
    month: number
    year: number
  }
  description?: string
}

export interface LinkedInEducation {
  schoolName: string
  degreeName?: string
  fieldOfStudy?: string
  startDate?: {
    year: number
  }
  endDate?: {
    year: number
  }
}

export interface LinkedInSkill {
  name: string
}

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: ProfilePicture
  headline?: string
  summary?: string
  industry?: string
  location?: LinkedInLocation
  positions?: LinkedInPosition[]
  educations?: LinkedInEducation[]
  skills?: LinkedInSkill[]
}

export interface NetworkStats {
  connections: number
  secondDegreeCount: number
}

export interface SearchPeopleResult {
  people: LinkedInProfile[]
  paging: {
    count: number
    start: number
    total: number
  }
}

export interface SearchJobsResult {
  jobs: {
    id: string
    title: string
    companyName: string
    location: string
    description?: string
    listedAt: number
    expireAt?: number
  }[]
  paging: {
    count: number
    start: number
    total: number
  }
}

export interface MessageResponse {
  id: string
  status: string
  sentAt: number
}

export interface ConnectionsResult {
  connections: {
    id: string
    firstName: string
    lastName: string
    headline?: string
    profilePicture?: ProfilePicture
  }[]
  paging: {
    count: number
    start: number
    total: number
  }
}

export interface ClientMetrics {
  requestCount: number
  lastRequestTimestamp: number | null
  averageRequestTime?: number
}

/**
 * Share API types for creating LinkedIn posts
 */

export type ShareVisibility = 'PUBLIC' | 'CONNECTIONS'

export interface CreateTextPostParams {
  text: string
  visibility?: ShareVisibility
}

export interface CreateArticleShareParams {
  url: string
  text?: string
  title?: string
  description?: string
  visibility?: ShareVisibility
}

export interface CreateImageShareParams {
  imageUrl: string
  text?: string
  visibility?: ShareVisibility
}

export interface ShareResponse {
  id: string
  createdAt: number
  author: string
}

export interface AssetRegistrationRequest {
  registerUploadRequest: {
    recipes: string[]
    owner: string
    serviceRelationships: Array<{
      relationshipType: string
      identifier: string
    }>
  }
}

export interface AssetRegistrationResponse {
  value: {
    uploadMechanism: {
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
        uploadUrl: string
        headers: Record<string, string>
      }
    }
    asset: string
    mediaArtifact: string
  }
}

/**
 * Marketing API types for advertising and campaign management
 */

// Ad Account Management
export interface AdAccount {
  id: string
  name: string
  type: 'BUSINESS' | 'ENTERPRISE'
  status: 'ACTIVE' | 'DRAFT' | 'CANCELED' | 'PENDING_DELETION' | 'REMOVED'
  currency: string
  reference?: string
  createdTime: number
  lastModifiedTime: number
}

export interface CreateAdAccountParams {
  name: string
  type: 'BUSINESS'
  currency: string
  reference?: string
}

export interface SearchAdAccountsParams {
  pageSize?: number
  pageToken?: string
  status?: 'ACTIVE' | 'DRAFT' | 'CANCELED'
}

export interface AdAccountsResult {
  elements: AdAccount[]
  paging?: {
    start: number
    count: number
    total: number
  }
  metadata?: {
    nextPageToken?: string
  }
}

// Campaign Group Management
export interface CampaignGroup {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'CANCELED' | 'PENDING_DELETION'
  account: string
  runSchedule?: {
    start: number
    end?: number
  }
  totalBudget?: {
    amount: string
    currencyCode: string
  }
  createdTime: number
  lastModifiedTime: number
}

export interface CreateCampaignGroupParams {
  account: string
  name: string
  status: 'ACTIVE' | 'DRAFT'
  totalBudget?: {
    amount: string
    currencyCode: string
  }
  runSchedule?: {
    start: number
    end?: number
  }
}

// Campaign Management
export type CampaignObjective =
  | 'BRAND_AWARENESS'
  | 'WEBSITE_VISITS'
  | 'ENGAGEMENT'
  | 'VIDEO_VIEWS'
  | 'LEAD_GENERATION'
  | 'WEBSITE_CONVERSIONS'
  | 'JOB_APPLICANTS'

export type CampaignType = 'TEXT_AD' | 'SPONSORED_UPDATES' | 'SPONSORED_INMAILS' | 'DISPLAY_ADS'

export interface Campaign {
  id: string
  name: string
  account: string
  campaignGroup: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'CANCELED' | 'PENDING_DELETION'
  type: CampaignType
  objective: CampaignObjective
  costType: 'CPM' | 'CPC' | 'CPV'
  dailyBudget?: {
    amount: string
    currencyCode: string
  }
  totalBudget?: {
    amount: string
    currencyCode: string
  }
  unitCost?: {
    amount: string
    currencyCode: string
  }
  runSchedule?: {
    start: number
    end?: number
  }
  createdTime: number
  lastModifiedTime: number
}

export interface CreateCampaignParams {
  account: string
  campaignGroup: string
  name: string
  type: CampaignType
  objective: CampaignObjective
  costType: 'CPM' | 'CPC' | 'CPV'
  status?: 'ACTIVE' | 'DRAFT'
  dailyBudget?: {
    amount: string
    currencyCode: string
  }
  totalBudget?: {
    amount: string
    currencyCode: string
  }
  unitCost?: {
    amount: string
    currencyCode: string
  }
  runSchedule?: {
    start: number
    end?: number
  }
}

// Creative Management
export type CreativeType =
  | 'SPONSORED_STATUS_UPDATE'
  | 'SPONSORED_VIDEO'
  | 'SPONSORED_ARTICLE'
  | 'SPONSORED_CAROUSEL'
  | 'TEXT_AD'
  | 'MESSAGE_AD'
  | 'CONVERSATION_AD'

export interface Creative {
  id: string
  campaign: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'CANCELED'
  type: CreativeType
  reference?: string
  servingStatuses?: string[]
  createdTime: number
  lastModifiedTime: number
}

export interface CreateCreativeParams {
  campaign: string
  type: CreativeType
  status?: 'ACTIVE' | 'DRAFT'
  reference?: string
  content?: {
    shareUrn?: string
    ugcPostUrn?: string
  }
}

// Analytics and Reporting
export type AnalyticsPivot =
  | 'ACCOUNT'
  | 'CAMPAIGN'
  | 'CAMPAIGN_GROUP'
  | 'CREATIVE'
  | 'CONVERSION'
  | 'COMPANY'
  | 'MEMBER_COMPANY_SIZE'
  | 'MEMBER_INDUSTRY'
  | 'MEMBER_SENIORITY'
  | 'MEMBER_JOB_TITLE'
  | 'MEMBER_JOB_FUNCTION'
  | 'MEMBER_COUNTRY_REGION'

export interface AdAnalyticsParams {
  accounts?: string[]
  campaigns?: string[]
  creatives?: string[]
  dateRange: {
    start: {
      year: number
      month: number
      day: number
    }
    end: {
      year: number
      month: number
      day: number
    }
  }
  pivot?: AnalyticsPivot
  fields?: string[]
  timeGranularity?: 'DAILY' | 'MONTHLY' | 'ALL'
}

export interface AdAnalyticsMetrics {
  impressions: number
  clicks: number
  totalEngagements: number
  shares: number
  likes: number
  comments: number
  follows: number
  costInUsd: number
  costInLocalCurrency: number
  dateRange: {
    start: {
      year: number
      month: number
      day: number
    }
    end: {
      year: number
      month: number
      day: number
    }
  }
  pivotValue?: string
}

export interface AdAnalyticsResult {
  elements: AdAnalyticsMetrics[]
  paging?: {
    start: number
    count: number
    total: number
  }
}
