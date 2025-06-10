import { Hono } from 'hono';
import type { APIRoute } from 'astro';
import zennMarkdownToHtml from "zenn-markdown-html";

const app = new Hono()
  .basePath('/api/')
  .get('/posts', async (c) => {
    // Mock data for now - replace with actual D1 queries later
    return c.json([
      { id: 1, title: 'Hello World', content: 'Sample content', slug: 'hello-world' },
      { id: 2, title: 'Goodbye World', content: 'Another sample', slug: 'goodbye-world' },
    ]);
  })
  .post('/admin/posts', async (c) => {
    const body = await c.req.json();
    const { title, content, slug, tags, published = false } = body;
    
    if (!title || !content || !slug) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Mock response - replace with actual D1 operations later
    return c.json({ id: Date.now(), title, content, slug, tags, published }, 201);
  })
  .post('/admin/images', async (c) => {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Mock image upload - replace with actual storage later
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const url = `data:${file.type};base64,${base64}`;

    return c.json({ 
      id: Date.now(),
      filename: file.name,
      url,
      postId: null
    }, 201);
  })
  .post('/render-markdown', async (c) => {
    const { markdown } = await c.req.json();
    
    if (!markdown) {
      return c.json({ error: 'No markdown provided' }, 400);
    }

    try {
      // Use zenn-markdown-html for consistent rendering with existing posts
      let markdownHtml = zennMarkdownToHtml;
      
      // Handle build-time compatibility
      if (typeof zennMarkdownToHtml !== "function") {
        markdownHtml = (zennMarkdownToHtml as any).default;
      }
      
      const html = markdownHtml(markdown, {
        embedOrigin: "https://embed.zenn.studio",
      });
      
      return c.json({ html });
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return c.json({ error: 'Failed to render markdown' }, 500);
    }
  });

export type App = typeof app;

export const ALL: APIRoute = (context) => app.fetch(context.request);