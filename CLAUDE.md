# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Astro using the AstroPaper theme. It's a Japanese blog ("アルパカ三銃士") that aggregates content from both local markdown files and external Zenn articles via RSS feed processing.

## Essential Commands

```bash
# Development
pnpm run dev              # Start Astro SSG dev server at localhost:4321 (src/ directory)
pnpm install              # Install dependencies

# Build and Preview
pnpm run build            # Build production site to ./dist/
pnpm run preview          # Production-like preview with Workers SSR + static assets (localhost:8788)

# Code Quality
pnpm run lint             # Run ESLint
pnpm run format           # Auto-format code with Prettier
pnpm run sync             # Generate TypeScript types for Astro modules

# Content Management
pnpm run zenn-feed        # Fetch and sync Zenn articles (uses Deno)

# Wrangler
pnpm run wrangler
```

### Development vs Preview Environments

**🔧 Development Environment (`pnpm run dev`)**
- **Purpose**: Astro SSG development and testing
- **Port**: localhost:4321
- **Use for**: Testing Astro components, static site features, TailwindCSS styling
- **What's running**: Astro dev server only (no Workers)

**🚀 Production Preview (`pnpm run preview`)**  
- **Purpose**: Full-stack testing with Workers SSR and static assets
- **Port**: localhost:8788 (Cloudflare wrangler)
- **Use for**: Testing Workers API endpoints, markdown editor, full application integration
- **What's running**: Complete production-like environment with both Astro static site and Hono Workers API

## Architecture Overview

### Unified Architecture
- **Astro SSR** (`src/`): Static site generation + server-side rendering for the blog
- **Integrated Hono API** (`src/pages/api/`): API routes within Astro using Hono framework
- **Deployment**: Single deployment via wrangler with Astro SSR + integrated API

### Content System
- **Local Blog Posts**: Markdown files in `src/content/blog/` with frontmatter schema validation
- **External Zenn Articles**: JSON files in `src/content/zenn/` fetched from RSS feed
- **Dual Collection Setup**: Separate Astro content collections for blog and zenn content types

### Tech Stack Integration
- **Astro** (`src/`): Main framework with content layer API, file-based routing, and SSR
- **React**: Component framework for interactive elements (Search, MarkdownEditor, etc.)
- **TailwindCSS**: Unified styling solution with custom skin-based theme system
- **Hono** (`src/pages/api/`): Ultrafast web framework for API endpoints within Astro
- **TypeScript**: Full type safety with Astro's built-in type generation
- **Cloudflare D1**: SQLite database for dynamic content storage (planned)

### Styling System
**✅ UNIFIED APPROACH**: All components use TailwindCSS with skin-based theme system:

- **Consistent theming**: `bg-skin-*`, `text-skin-*`, `border-skin-*` utilities
- **Responsive design**: Mobile-first approach with Tailwind breakpoints
- **Dark theme support**: Built into skin system with CSS custom properties

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

## API Development Guidelines

### Hono API Routes in Astro

**📍 LOCATION**: API routes are located in `src/pages/api/` and integrate seamlessly with Astro SSR.

#### Basic API Route Structure:
```ts
// src/pages/api/[...path].ts
import { Hono } from 'hono';
import type { APIRoute } from 'astro';

const app = new Hono()
  .basePath('/api/')
  .get('/posts', async (c) => {
    return c.json([
      { id: 1, title: 'Hello World', content: 'Sample content' }
    ]);
  })
  .post('/admin/posts', async (c) => {
    const body = await c.req.json();
    return c.json({ success: true, id: Date.now() }, 201);
  });

export type App = typeof app;
export const ALL: APIRoute = (context) => app.fetch(context.request);
```

#### TypeScript Integration:
```tsx
// React component using typed Hono client
import { hc } from 'hono/client';
import type { App } from '../pages/api/[...path]';

const client = hc<App>(window.location.origin);

const response = await client.api['admin']['posts'].$post({
  json: { title: 'New Post', content: 'Content here' }
});
```

#### Key Points for API Development:
1. **Use Hono within Astro**: No separate workers directory needed
2. **Full TypeScript support**: Export App type for client-side typing
3. **Astro integration**: Use APIRoute for seamless deployment
4. **Authentication**: Implement in Astro pages (like `/admin/*` routes)

### Setup Guide (Reference: nuro.dev)

**Installation Steps:**
```bash
# 1. Install dependencies
npm install hono

# 2. Create catch-all API route
# File: src/pages/api/[...path].ts
```

**Basic Integration Pattern:**
```typescript
import { Hono } from 'hono';
import type { APIRoute } from 'astro';

const app = new Hono().basePath('/api/');

// Sample endpoint
app.get('/posts', async (c) => c.json({
  posts: [
    { id: 1, title: 'Hello World' },
    { id: 2, title: 'Goodbye World' }
  ]
}));

// Bind Hono to Astro
export const ALL: APIRoute = (context) => app.fetch(context.request);

// Export type for client-side typing
export type App = typeof app;
```

**Typed Client Usage:**
```typescript
import { hc } from 'hono/client';
import type { App } from './api/[...path]';

const client = hc<App>(window.location.origin);
const response = await client.api.posts.$get();
const data = await response.json();
```

**Benefits of this Integration:**
- **Seamless API integration** within Astro's file-based routing
- **End-to-end type safety** with TypeScript
- **Flexible routing** with Hono's powerful routing system
- **Multi-environment support** (Cloudflare, Node.js, etc.)
- **RPC-like experience** with typed client

**Reference**: [How to use Astro with Hono](https://nuro.dev/posts/how_to_use_astro_with_hono/)

### 🎯 Quick Styling Reference

| Directory | Framework | Styling Method | Example |
|-----------|-----------|----------------|---------|
| `src/` | Astro/React/Hono API | **TailwindCSS + Skin System** | `class="bg-skin-fill text-skin-base border-skin-line"` |

#### Theme System Colors (Unified styling approach)
```css
/* Primary Colors */
bg-skin-fill          /* Main background */
bg-skin-card          /* Card/secondary background */
bg-skin-accent        /* Accent color (links, buttons) */

/* Text Colors */
text-skin-base        /* Primary text */
text-skin-accent      /* Accent text */
text-skin-inverted    /* Inverted text (on accent backgrounds) */

/* Border Colors */
border-skin-line      /* Standard borders */
```

**Current Architecture**: 
- **Unified styling**: All components use TailwindCSS with skin system
- **Astro SSR**: Hono API integrated within Astro (no separate workers directory)
- **Theme consistency**: Always use skin-based colors for proper theme integration

## Development Notes

### Adding Content
- Blog posts go in `src/content/blog/` with proper frontmatter schema
- Run `npm run zenn-feed` to sync external Zenn articles
- OG images auto-generate for posts without custom ogImage

### Styling Approach for Astro Components
- **TailwindCSS**: Primary styling solution for all Astro components in `src/` directory
- **Custom base styles**: Disabled in favor of Astro's defaults
- **Typography plugin**: For markdown content styling
- **Responsive design**: Mobile-first approach with Tailwind responsive utilities

#### TailwindCSS Usage Examples:
```astro
<!-- src/components/Header.astro -->
<header class="bg-white shadow-md border-b border-gray-200">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Navigation content -->
    </div>
  </nav>
</header>
```

```tsx
// src/components/Search.tsx (React in Astro)
export default function Search() {
  return (
    <div className="relative max-w-md mx-auto">
      <input 
        type="search"
        placeholder="Search posts..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}
```
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

## Markdown Editor Project (COMPLETED ✅)

### Project Overview
Successfully implemented a full-featured web-based markdown editor for blog content creation using Astro SSR + Hono + React integration.

### ✅ Completed Features

#### Core Editor Functionality
- **Real-time Markdown Editor**: React-based editor with live preview using `zenn-markdown-html`
- **Dual-pane Interface**: Edit/Preview toggle with smooth animations
- **Professional UI**: Modern header bar, floating action buttons, responsive design
- **Keyboard Shortcuts**: Ctrl+S (save), Ctrl+M (toggle metadata panel)

#### Content Management Features  
- **Complete Blog Schema Support**: All required fields per `src/content/config.ts`
  - Title, Description (required)
  - Content (markdown with zenn-style rendering)
  - URL Slug (auto-generated from title, manually editable)
  - Tags (dynamic add/remove with Enter key)
  - Draft/Published toggle
  - Featured post toggle
- **Image Upload**: File upload with markdown insertion
- **Auto-save Integration**: Structured form validation

#### Technical Implementation
- **Architecture**: Astro hybrid SSR with Cloudflare adapter
- **API Layer**: Hono-based routes at `/api/[...path].ts` with full TypeScript typing
- **Authentication**: Basic auth protection on admin routes
- **Responsive Design**: 
  - Desktop: Sidebar-based settings panel
  - Mobile: Full-screen modal for post settings
- **Consistent Styling**: Full integration with existing skin-based theme system

#### UI/UX Highlights
- **Floating Action Buttons**: Settings, image upload, back-to-top
- **Status Indicators**: Real-time draft/published status with character count
- **Theme Integration**: All colors use existing `bg-skin-*`, `text-skin-*` utilities
- **Professional Polish**: Toggle switches, smooth transitions, proper focus states

### 🎯 Current Routes
- `/admin/new` - New post creation (✅ COMPLETE)
- `/api/*` - Hono-based API endpoints (✅ COMPLETE)

### 🚧 Next Phase: Data Persistence & Management

#### High Priority
1. **D1 Database Integration**
   - Replace mock API responses with actual D1 queries
   - Implement proper data models for posts, images, metadata
   - Add data migration scripts

2. **Image Storage Optimization** 
   - Move from base64 to Cloudflare R2 or Images service
   - Implement proper image optimization and CDN delivery
   - Add image management (delete, replace)

3. **Admin Dashboard** (`/admin`)
   - Post listing with filtering (draft/published, tags, search)
   - Quick actions (publish, delete, duplicate)
   - Edit existing posts functionality

#### Medium Priority
4. **Enhanced Authentication**
   - Replace Basic Auth with proper session management
   - Add user roles and permissions
   - Implement secure logout functionality

5. **Build Integration**
   - Auto-download D1 content as markdown files during build
   - Maintain static site performance benefits
   - Implement incremental static regeneration workflow

6. **Advanced Features**
   - Auto-save drafts functionality
   - Revision history and version control
   - Bulk import/export capabilities
   - Advanced image gallery and management

### 📁 Key Files Created/Modified
- `src/pages/admin/new.astro` - Admin editor page with auth
- `src/components/MarkdownEditor.tsx` - Main React editor component  
- `src/pages/api/[...path].ts` - Hono API routes with TypeScript types
- `astro.config.ts` - Updated for SSR with Cloudflare adapter
- `wrangler.jsonc` - Configured for hybrid deployment

### 🎨 Design System Integration
- **Full Theme Compatibility**: Uses existing `bg-skin-*`, `text-skin-*`, `border-skin-*`
- **Responsive Patterns**: Follows established mobile-first approach
- **Component Consistency**: Matches existing UI patterns and interactions
- **Accessibility**: Proper focus states, semantic HTML, keyboard navigation

### 💡 Implementation Notes
- **Styling Separation**: React components use TailwindCSS (not Hono CSS)
- **Type Safety**: Full TypeScript integration with Hono client typing
- **Performance**: Minimal JavaScript, efficient rendering, proper code splitting
- **Maintainability**: Clean component structure, well-documented code

This editor is now production-ready for content creation, with the next phase focusing on data persistence and admin management features.