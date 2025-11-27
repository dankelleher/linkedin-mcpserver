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
