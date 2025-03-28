# 🌐 LinkedIn MCP Server

A powerful Model Context Protocol server for LinkedIn API integration

## 📋 Overview

LinkedIn MCP Server brings the power of the LinkedIn API to your AI assistants through the Model Context Protocol (MCP). This TypeScript server empowers AI agents to interact with LinkedIn data, search profiles, find jobs, and even send messages.

MCP (Model Context Protocol) is an open protocol that standardizes how applications provide context to LLMs - think of it as a USB-C port for AI applications, connecting models to external data sources and tools.

## ✨ Features

### 🔍 LinkedIn API Tools

**Profile Search** - Find LinkedIn profiles with advanced filters
**Profile Retrieval** - Get detailed information about LinkedIn profiles
**Job Search** - Discover job opportunities with customized criteria
**Messaging** - Send messages to LinkedIn connections
**Network Stats** - Access connection statistics and analytics

### 🛠️ Technical Highlights

**TypeScript** - Built with modern TypeScript for type safety and developer experience
**Dependency Injection** - Uses TSyringe for clean, testable architecture
**Structured Logging** - Comprehensive logging with Pino for better observability
**MCP Integration** - Implements the Model Context Protocol for seamless AI assistant connectivity
**REST Client** - Axios-powered API client with automatic token management

### 🚀 Development

#### Prerequisites

- Node.js 20+
- npm/yarn

#### Setup

```bash
# Install dependencies
npm install

# Run the development server
npm run start:dev

# Build the server
npm run build
```

### 📦 Installation

To use with Claude Desktop or other MCP-compatible AI assistants:

#### Configuration

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
Windows: `%APPDATA%/Claude/claude_desktop_config.json`

### 🔧 Debugging

MCP servers communicate over stdio which can make debugging challenging. Use the integrated MCP Inspector:

```bash
# Debug with MCP Inspector
npm run inspector
```

The Inspector provides a browser-based interface for monitoring requests and responses.

### 🔒 Security

This server handles sensitive LinkedIn authentication credentials. Review the token management system to ensure it meets your security requirements.

### 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
