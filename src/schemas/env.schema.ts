import { z } from 'zod'

export const envSchema = z.object({
  LINKEDIN_CLIENT_ID: z.string().min(1, { message: 'LINKEDIN_CLIENT_ID cannot be empty' }),
  LINKEDIN_CLIENT_SECRET: z.string().min(1, { message: 'LINKEDIN_CLIENT_SECRET cannot be empty' })
})
