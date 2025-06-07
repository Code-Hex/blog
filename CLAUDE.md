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
pnpm run format:check     # Check formatting with Prettier
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