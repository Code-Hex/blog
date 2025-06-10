import type { APIRoute } from 'astro';

// POST: 画像アップロード
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postId = formData.get('postId') as string | null;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // For now, we'll store images as base64 in the database
    // In production, you'd upload to Cloudflare Images or R2
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const filename = file.name;
    const url = `data:${file.type};base64,${base64}`;

    const result = await db.prepare(`
      INSERT INTO images (filename, url, postId, createdAt)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(filename, url, postId).run();

    return new Response(JSON.stringify({ 
      id: result.meta.last_row_id,
      filename,
      url,
      postId
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};