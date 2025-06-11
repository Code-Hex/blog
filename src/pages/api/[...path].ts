import { Hono } from "hono";
import type { APIRoute } from "astro";
import zennMarkdownToHtml from "zenn-markdown-html";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>()
  .basePath("/api/")
  .get("/posts", async c => {
    try {
      const { results } = await c.env.DB.prepare(
        "SELECT * FROM posts WHERE draft = false ORDER BY pubDatetime DESC"
      ).all();

      // Parse tags from JSON string and convert boolean fields
      const posts = results.map(post => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags as string) : [],
        draft: Boolean(post.draft),
        featured: Boolean(post.featured),
      }));

      return c.json(posts);
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ error: "Failed to fetch posts" }, 500);
    }
  })
  .get("/admin/posts", async c => {
    try {
      const url = new URL(c.req.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const status = url.searchParams.get("status"); // 'draft', 'published', or null
      const tag = url.searchParams.get("tag");
      const search = url.searchParams.get("search");

      const offset = (page - 1) * limit;

      // Build dynamic query
      let whereConditions = [];
      let params = [];

      if (status === "draft") {
        whereConditions.push("draft = ?");
        params.push(true);
      } else if (status === "published") {
        whereConditions.push("draft = ?");
        params.push(false);
      }

      if (tag) {
        whereConditions.push("tags LIKE ?");
        params.push(`%"${tag}"%`);
      }

      if (search) {
        whereConditions.push(
          "(title LIKE ? OR content LIKE ? OR description LIKE ?)"
        );
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM posts ${whereClause}`;
      const countResult = await c.env.DB.prepare(countQuery)
        .bind(...params)
        .first();
      const total = countResult?.total || 0;

      // Get posts with pagination
      const postsQuery = `
        SELECT * FROM posts ${whereClause} 
        ORDER BY pubDatetime DESC 
        LIMIT ? OFFSET ?
      `;
      const { results } = await c.env.DB.prepare(postsQuery)
        .bind(...params, limit, offset)
        .all();

      // Parse tags from JSON string and convert boolean fields
      const posts = results.map(post => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags as string) : [],
        draft: Boolean(post.draft),
        featured: Boolean(post.featured),
      }));

      return c.json({
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ error: "Failed to fetch posts" }, 500);
    }
  })
  .get("/posts/:id", async c => {
    try {
      const id = c.req.param("id");
      const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?")
        .bind(id)
        .first();

      if (!post) {
        return c.json({ error: "Post not found" }, 404);
      }

      // Parse tags from JSON string
      const postWithTags = {
        ...post,
        tags: post.tags ? JSON.parse(post.tags as string) : [],
      };

      return c.json(postWithTags);
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ error: "Failed to fetch post" }, 500);
    }
  })
  .put("/admin/posts/:id", async c => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const {
        title,
        content,
        description,
        slug,
        tags = [],
        draft = true,
        featured = false,
        ogImage = null,
        canonicalURL = null,
      } = body;

      if (!title || !content || !description || !slug) {
        return c.json(
          {
            error: "Missing required fields: title, content, description, slug",
          },
          400
        );
      }

      // Update post in database
      const { success, changes } = await c.env.DB.prepare(
        `
          UPDATE posts SET 
            title = ?, content = ?, description = ?, slug = ?, tags = ?, 
            draft = ?, featured = ?, ogImage = ?, canonicalURL = ?, 
            modDatetime = ?, updatedAt = ?
          WHERE id = ?
        `
      )
        .bind(
          title,
          content,
          description,
          slug,
          JSON.stringify(tags),
          draft,
          featured,
          ogImage,
          canonicalURL,
          new Date().toISOString(),
          new Date().toISOString(),
          id
        )
        .run();

      if (!success || changes === 0) {
        return c.json({ error: "Post not found or failed to update" }, 404);
      }

      return c.json({
        id: parseInt(id),
        title,
        content,
        description,
        slug,
        tags,
        draft,
        featured,
        ogImage,
        canonicalURL,
      });
    } catch (error) {
      console.error("Database error:", error);
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint")
      ) {
        return c.json({ error: "Post with this slug already exists" }, 409);
      }
      return c.json({ error: "Failed to update post" }, 500);
    }
  })
  .delete("/admin/posts/:id", async c => {
    try {
      const id = c.req.param("id");

      const { success, changes } = await c.env.DB.prepare(
        "DELETE FROM posts WHERE id = ?"
      )
        .bind(id)
        .run();

      if (!success || changes === 0) {
        return c.json({ error: "Post not found" }, 404);
      }

      return c.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ error: "Failed to delete post" }, 500);
    }
  })
  .post("/admin/posts", async c => {
    try {
      const body = await c.req.json();
      console.log("Received POST body:", body);

      const {
        title,
        content,
        description,
        slug,
        tags = [],
        draft = true,
        featured = false,
        ogImage = null,
        canonicalURL = null,
      } = body;

      console.log("Extracted fields:", {
        title,
        content,
        description,
        slug,
        tags,
        draft,
        featured,
      });

      if (!title || !content || !description || !slug) {
        return c.json(
          {
            error: "Missing required fields: title, content, description, slug",
          },
          400
        );
      }

      // Insert post into database
      const { success, meta } = await c.env.DB.prepare(
        `
          INSERT INTO posts (
            title, content, description, slug, tags, draft, featured, 
            ogImage, canonicalURL, pubDatetime
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
        .bind(
          title,
          content,
          description,
          slug,
          JSON.stringify(tags),
          draft,
          featured,
          ogImage,
          canonicalURL,
          new Date().toISOString()
        )
        .run();

      if (!success) {
        return c.json({ error: "Failed to create post" }, 500);
      }

      return c.json(
        {
          id: meta.last_row_id,
          title,
          content,
          description,
          slug,
          tags,
          draft,
          featured,
          ogImage,
          canonicalURL,
        },
        201
      );
    } catch (error) {
      console.error("Database error:", error);
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint")
      ) {
        return c.json({ error: "Post with this slug already exists" }, 409);
      }
      return c.json({ error: "Failed to create post" }, 500);
    }
  })
  .get("/admin/images", async c => {
    try {
      const url = new URL(c.req.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const postId = url.searchParams.get("postId");

      const offset = (page - 1) * limit;

      let whereClause = "";
      let params = [];

      if (postId) {
        whereClause = "WHERE postId = ?";
        params.push(postId);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM images ${whereClause}`;
      const countResult = await c.env.DB.prepare(countQuery)
        .bind(...params)
        .first();
      const total = countResult?.total || 0;

      // Get images with pagination
      const imagesQuery = `
        SELECT * FROM images ${whereClause} 
        ORDER BY createdAt DESC 
        LIMIT ? OFFSET ?
      `;
      const { results } = await c.env.DB.prepare(imagesQuery)
        .bind(...params, limit, offset)
        .all();

      return c.json({
        images: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ error: "Failed to fetch images" }, 500);
    }
  })
  .post("/admin/images", async c => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      const postId = formData.get("postId") as string;

      if (!file) {
        return c.json({ error: "No file provided" }, 400);
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        return c.json(
          {
            error:
              "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
          },
          400
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return c.json({ error: "File too large. Maximum size is 10MB." }, 400);
      }

      // For now, store as base64 - will migrate to R2 later
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const url = `data:${file.type};base64,${base64}`;

      // Store image metadata in database
      const { success, meta } = await c.env.DB.prepare(
        "INSERT INTO images (filename, url, postId) VALUES (?, ?, ?)"
      )
        .bind(file.name, url, postId || null)
        .run();

      if (!success) {
        return c.json({ error: "Failed to save image" }, 500);
      }

      return c.json(
        {
          id: meta.last_row_id,
          filename: file.name,
          url,
          postId: postId || null,
        },
        201
      );
    } catch (error) {
      console.error("Image upload error:", error);
      return c.json({ error: "Failed to upload image" }, 500);
    }
  })
  .delete("/admin/images/:id", async c => {
    try {
      const id = c.req.param("id");

      const { success, changes } = await c.env.DB.prepare(
        "DELETE FROM images WHERE id = ?"
      )
        .bind(id)
        .run();

      if (!success || changes === 0) {
        return c.json({ error: "Image not found" }, 404);
      }

      return c.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ error: "Failed to delete image" }, 500);
    }
  })
  .get("/admin/tags", async c => {
    try {
      // Get all tags from posts
      const { results } = await c.env.DB.prepare(
        'SELECT tags FROM posts WHERE tags IS NOT NULL AND tags != ""'
      ).all();

      // Extract and count tags
      const tagCounts = new Map();
      results.forEach(row => {
        try {
          const tags = JSON.parse(row.tags as string);
          if (Array.isArray(tags)) {
            tags.forEach(tag => {
              tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
          }
        } catch (error) {
          console.error("Error parsing tags:", error);
        }
      });

      // Convert to array and sort by count
      const tagsArray = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      return c.json({ tags: tagsArray });
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ error: "Failed to fetch tags" }, 500);
    }
  })
  .get("/admin/stats", async c => {
    try {
      // Get post statistics
      const totalPosts = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM posts"
      ).first();

      const publishedPosts = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM posts WHERE draft = false"
      ).first();

      const draftPosts = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM posts WHERE draft = true"
      ).first();

      const featuredPosts = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM posts WHERE featured = true"
      ).first();

      const totalImages = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM images"
      ).first();

      return c.json({
        posts: {
          total: totalPosts?.count || 0,
          published: publishedPosts?.count || 0,
          draft: draftPosts?.count || 0,
          featured: featuredPosts?.count || 0,
        },
        images: {
          total: totalImages?.count || 0,
        },
      });
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ error: "Failed to fetch statistics" }, 500);
    }
  })
  .post("/render-markdown", async c => {
    const { markdown } = await c.req.json();

    if (!markdown) {
      return c.json({ error: "No markdown provided" }, 400);
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
      console.error("Markdown rendering error:", error);
      return c.json({ error: "Failed to render markdown" }, 500);
    }
  });

export type App = typeof app;

export const ALL: APIRoute = context =>
  app.fetch(context.request, context.locals.runtime.env);
