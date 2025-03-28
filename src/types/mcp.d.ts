/**
 * Response structure for MCP resource responses
 * Contains a standard format for returning resource data in MCP protocol
 */
export interface McpResourceResponse {
  content: Array<{
    type: 'resource'
    resource: {
      text: string
      uri: string
      mimeType: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }>
  [key: string]: unknown
}
