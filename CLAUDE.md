# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Astro using the AstroPaper theme. It's a Japanese blog ("アルパカ三銃士") that aggregates content from both local markdown files and external Zenn articles via RSS feed processing.

## Essential Commands

```bash
# Development
pnpm run dev              # Start dev server at localhost:4321
pnpm install              # Install dependencies

# Build and Preview
pnpm run build            # Build production site to ./dist/
pnpm run preview          # Preview build locally (uses Cloudflare wrangler)

# Code Quality
pnpm run lint             # Run ESLint
pnpm run format           # Auto-format code with Prettier
pnpm run sync             # Generate TypeScript types for Astro modules

# Content Management
pnpm run zenn-feed        # Fetch and sync Zenn articles (uses Deno)
```

## Architecture Overview

### Content System
- **Local Blog Posts**: Markdown files in `src/content/blog/` with frontmatter schema validation
- **External Zenn Articles**: JSON files in `src/content/zenn/` fetched from RSS feed
- **Dual Collection Setup**: Separate Astro content collections for blog and zenn content types

### Tech Stack Integration
- **Astro**: Main framework with content layer API and file-based routing
- **React**: Component framework for interactive elements (Search, etc.)
- **TailwindCSS**: Styling with custom configuration and typography plugin
- **TypeScript**: Full type safety with Astro's built-in type generation

### Content Processing Pipeline
1. **Reading Time Calculation**: Custom remark plugin adds `minutesRead` to frontmatter
2. **RSS Integration**: Deno script fetches Zenn articles and converts to JSON
3. **OG Image Generation**: Dynamic OpenGraph images using Satori and resvg-js
4. **TOC & Collapse**: Remark plugins for table of contents and collapsible sections

### Key Configuration
- **Site Config**: `src/config.ts` contains blog metadata, social links, and feature flags
- **Content Schema**: `src/content/config.ts` defines validation for blog posts and zenn articles
- **Astro Config**: Markdown processing, integrations, and build settings

### Routing Structure
- `/` - Homepage with recent posts
- `/posts/[...page]` - Paginated blog posts
- `/posts/[slug]` - Individual blog post pages
- `/tags/[tag]/[...page]` - Tag-based filtering
- `/search` - Client-side fuzzy search
- `/archives` - Archive page (disabled by default)

### Content Sources
- **Local Posts**: Write markdown in `src/content/blog/` with required frontmatter
- **Zenn Integration**: External articles fetched via `scripts/zenn-feed.ts`
- **Mixed Display**: Both content types rendered uniformly in the UI

## Development Notes

### Adding Content
- Blog posts go in `src/content/blog/` with proper frontmatter schema
- Run `npm run zenn-feed` to sync external Zenn articles
- OG images auto-generate for posts without custom ogImage

### Styling Approach
- TailwindCSS with custom base styles disabled in favor of Astro's defaults
- Typography plugin for markdown content styling
- Responsive design with mobile-first approach

### Performance Features
- Static site generation with optional hybrid rendering
- Optimized image handling and lazy loading
- Minimal JavaScript with island architecture
- CDN deployment via Cloudflare Pages (wrangler preview)

### Satori OG Image Generation
- **Styling Limitations**: Satori doesn't directly support TailwindCSS classes - use inline `style` objects instead
- **Display Property**: Always specify `display: "flex"` explicitly for containers with multiple children
- **No className/tw**: Avoid `className` or `tw` props in Satori components - convert to CSS-in-JS style objects
- **Reference**: [Satori Tailwind experimental support](https://github.com/vercel/satori/pull/340) uses twrnc but doesn't reflect project Tailwind config

## Markdown Editor Project (Cloudflare Workers + D1 + Astro)

### Project Goals
Adding a web-based markdown editor with the following requirements:
- **Authentication**: Only for the editor page (not the entire site)
- **Image Upload**: Support for image uploading and management
- **Mobile Support**: Responsive design for smartphone editing
- **Static Build Integration**: D1 content downloaded as markdown files during build time
- **Performance**: Maintain static site performance while adding dynamic editing capabilities

### Technology Stack Investigation Results

#### ✅ What We Know

**Current Environment (Ready for Implementation)**
- Cloudflare Workers/Pages environment fully configured
- wrangler 4.19.1, Astro 5.9.1 (latest versions)
- TypeScript, React, TailwindCSS already integrated
- wrangler.jsonc configuration already set up with assets directory

**Hono Framework**
- Ultrafast & lightweight web framework for edge computing
- Multi-runtime support: Cloudflare Workers, Deno, Bun, Node.js
- First-class TypeScript support with full type safety
- Built-in middleware ecosystem (CORS, authentication, etc.)
- Web Standards-based with excellent performance
- Perfect for Cloudflare Workers API development

**Cloudflare D1 + Hono Integration**
- SQLite-compatible serverless database (10GB limit)
- Type-safe database operations with `c.env.DB`
- Prepared statements with parameter binding
- Batch operations for transaction-like behavior
- Built-in error handling and connection management
- Global read replication (Beta)

**Recommended Markdown Editor**
- `@uiw/react-md-editor`: React-based, TypeScript support, customizable
- Features: Real-time preview (optional), syntax highlighting, mobile-friendly
- MIT license, lightweight, good balance of features vs complexity

**Authentication with Hono**
- Built-in `basicAuth` middleware for simple authentication
- Environment variable-based credential management
- Session management via Workers KV
- Easy integration with editor-only access requirements

**Astro Static Build + Cloudflare Workers API Coexistence**
- Workers Static Assets: Single deployment for static + dynamic content
- Path-based routing: `/api/*` for Workers API, everything else for static assets
- Astro remains as static site generator (no Hybrid mode needed)
- Single `wrangler deploy` command for both static site and API endpoints
- Configuration via wrangler.jsonc (not wrangler.toml) with JSON schema support

#### 🔍 What We Need to Investigate Further

**Image Upload Strategy**
- Cloudflare Images vs R2 bucket for storage
- Upload size limits and optimization
- Integration with markdown editor
- Mobile upload UX considerations

**Build Process Integration**
- D1 API access during build time
- Markdown file generation script
- Integration with existing `pnpm run build` command
- Handling of frontmatter and metadata

**Authentication Implementation Details**
- Session storage mechanism (Workers KV vs local storage)
- Login/logout flow design
- Security considerations for single-user vs multi-user scenarios

**Mobile Editor Optimization**
- Touch interaction optimization
- Keyboard behavior on mobile devices
- Editor toolbar responsiveness
- Performance on slower mobile connections

#### 📋 Technical Architecture Plan

**Static + Dynamic Coexistence Pattern**
```javascript
// src/index.js (Cloudflare Workers entry point)
import { Hono } from 'hono'

const app = new Hono()

// Hono API routes
app.get('/api/posts', getAllPosts)
app.use('/api/admin/*', basicAuth({ /* credentials */ }))
app.post('/api/admin/posts', createPost)
// ... other API routes

// Main fetch handler
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    
    // Route API requests to Hono
    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env)
    }
    
    // Serve static assets (Astro build output)
    return env.ASSETS.fetch(request)
  }
}
```

**wrangler.jsonc Configuration**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "blog",
  "compatibility_date": "2025-03-25",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist",           // Astro build output
    "binding": "ASSETS",             // Access in Workers as env.ASSETS
    "not_found_handling": "404-page"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "blog-db",
      "database_id": "your-database-id"
    }
  ],
  "preview_urls": true,
  "workers_dev": true
}
```

**Deployment Workflow**
```bash
# 1. Build Astro static site
pnpm run build

# 2. Deploy both static assets and Workers API
wrangler deploy
```

**Database Schema (D1)**
```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tags TEXT, -- JSON array as string
  published BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  postId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts (id)
);
```

**Architecture Benefits**
- **Performance**: Static assets served via Cloudflare's global CDN
- **Simplicity**: Single deployment command for both static and dynamic content
- **Cost-effective**: No separate hosting needed for API endpoints
- **Edge computing**: API endpoints run at edge locations globally
- **Scalability**: Automatic scaling for both static and dynamic requests

### 📝 Implementation TODO List

#### High Priority
1. **Hono Setup + Workers Static Assets**: Install Hono, update existing wrangler.jsonc with D1 binding and assets binding
2. **Static + Dynamic Routing**: Create Workers entry point with path-based routing (/api/* → Hono, others → static assets)
3. **D1 Database Setup**: Create posts/images tables, add D1 database configuration to wrangler.jsonc
4. **Hono CRUD API**: Implement type-safe markdown content API with D1 integration (/api/admin/* routes)

#### Medium Priority  
5. **Authentication Middleware**: Implement Hono basicAuth for /api/admin/* protection
6. **Image Upload API**: Build Cloudflare Images/R2 integration via /api/admin/images endpoint
7. **Responsive Editor Page**: Create mobile-optimized editor with @uiw/react-md-editor + API integration
8. **Build-time Content Sync**: Develop D1 → markdown file conversion script using /api/posts endpoint

#### Low Priority
9. **Admin UI Implementation**: Build complete management interface with Hono API integration
10. **Deployment Testing**: Verify static build + Workers API integration in production
11. **Production Configuration**: Finalize D1, Images/R2, authentication settings for live deployment