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
  }
}
