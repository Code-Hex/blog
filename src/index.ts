import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'

const app = new Hono<{ Bindings: Env }>()

// API routes
app.get('/api/posts', async (c) => {
  const db = c.env.DB
  
  const { results } = await db.prepare(`
    SELECT id, title, slug, tags, published, createdAt, updatedAt
    FROM posts
    WHERE published = true
    ORDER BY createdAt DESC
  `).all()

  return c.json(results)
})

app.get('/api/posts/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  
  const { results } = await db.prepare(`
    SELECT *
    FROM posts
    WHERE id = ? AND published = true
  `).bind(id).all()

  if (results.length === 0) {
    return c.json({ error: 'Post not found' }, 404)
  }

  return c.json(results[0])
})

// Admin routes with basic auth
app.use('/api/admin/*', basicAuth({
  username: 'admin',
  password: 'changeme' // TODO: Use environment variable
}))

app.get('/api/admin/posts', async (c) => {
  const db = c.env.DB
  
  const { results } = await db.prepare(`
    SELECT *
    FROM posts
    ORDER BY createdAt DESC
  `).all()

  return c.json(results)
})

app.post('/api/admin/posts', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  
  const { title, content, slug, tags, published = false } = body
  
  if (!title || !content || !slug) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  try {
    const result = await db.prepare(`
      INSERT INTO posts (title, content, slug, tags, published, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(title, content, slug, JSON.stringify(tags || []), published).run()

    return c.json({ id: result.meta.last_row_id }, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500)
  }
})

app.put('/api/admin/posts/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const body = await c.req.json()
  
  const { title, content, slug, tags, published } = body
  
  try {
    await db.prepare(`
      UPDATE posts
      SET title = ?, content = ?, slug = ?, tags = ?, published = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).bind(title, content, slug, JSON.stringify(tags || []), published, id).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update post' }, 500)
  }
})

app.delete('/api/admin/posts/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  
  try {
    await db.prepare(`
      DELETE FROM posts WHERE id = ?
    `).bind(id).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete post' }, 500)
  }
})

// Image management endpoints
app.get('/api/admin/images', async (c) => {
  const db = c.env.DB
  
  const { results } = await db.prepare(`
    SELECT *
    FROM images
    ORDER BY createdAt DESC
  `).all()

  return c.json(results)
})

app.post('/api/admin/images', async (c) => {
  const db = c.env.DB
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  const postId = formData.get('postId') as string | null
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }

  // For now, we'll store images as base64 in the database
  // In production, you'd upload to Cloudflare Images or R2
  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const filename = file.name
  const url = `data:${file.type};base64,${base64}`

  try {
    const result = await db.prepare(`
      INSERT INTO images (filename, url, postId, createdAt)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(filename, url, postId).run()

    return c.json({ 
      id: result.meta.last_row_id,
      filename,
      url,
      postId
    }, 201)
  } catch (error) {
    return c.json({ error: 'Failed to upload image' }, 500)
  }
})

app.delete('/api/admin/images/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  
  try {
    await db.prepare(`
      DELETE FROM images WHERE id = ?
    `).bind(id).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete image' }, 500)
  }
})

// Main fetch handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    
    // Route API requests to Hono
    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env)
    }
    
    // Serve static assets (Astro build output)
    return env.ASSETS.fetch(request)
  }
}