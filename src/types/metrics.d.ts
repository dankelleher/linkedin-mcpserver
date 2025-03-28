/**
 * Response time categorization for metrics
 */
export type MetricCategory = 'search' | 'profile' | 'job' | 'message' | 'connection' | 'auth' | 'other'

/**
 * Detailed metrics data structure
 */
export interface MetricData {
  requestCount: number
  lastRequestTimestamp: number | null
  averageResponseTime: number
  p50ResponseTime: number
  p90ResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  minResponseTime: number
  maxResponseTime: number
}

/**
 * Detailed metrics by category
 */
export interface DetailedMetrics {
  overall: MetricData
  byCategory: Record<MetricCategory, MetricData>
}
