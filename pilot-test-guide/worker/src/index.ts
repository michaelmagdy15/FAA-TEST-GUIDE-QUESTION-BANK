import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  pilot_guide_db: D1Database;
  ALLOWED_ORIGIN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({
  origin: (origin) => {
    return origin || '*';
  },
  allowMethods: ['GET', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

// Load all progress for a user
app.get('/api/sync/:userId', async (c) => {
  const userId = c.req.param('userId');
  if (!userId || userId.length < 5) {
    return c.json({ error: 'Invalid userId' }, 400);
  }

  const db = c.env.pilot_guide_db;

  const [chapterRows, detailedRow, bookmarkRows] = await Promise.all([
    db.prepare('SELECT prefix, chapter_id, answers FROM chapter_progress WHERE user_id = ?')
      .bind(userId).all(),
    db.prepare('SELECT data, updated_at FROM detailed_progress WHERE user_id = ?')
      .bind(userId).first<{ data: string; updated_at: number }>(),
    db.prepare('SELECT mode, question_ids FROM bookmarks WHERE user_id = ?')
      .bind(userId).all(),
  ]);

  const chapters: Record<string, Record<string, string>> = {};
  for (const row of chapterRows.results) {
    const key = `${row.prefix}_${row.chapter_id}`;
    try {
      chapters[key] = JSON.parse(row.answers as string);
    } catch {
      chapters[key] = {};
    }
  }

  let detailed: Record<string, unknown> = {};
  let detailedUpdatedAt = 0;
  if (detailedRow) {
    try {
      detailed = JSON.parse(detailedRow.data);
    } catch {
      detailed = {};
    }
    detailedUpdatedAt = detailedRow.updated_at;
  }

  const bookmarks: Record<string, string[]> = {};
  for (const row of bookmarkRows.results) {
    try {
      bookmarks[row.mode as string] = JSON.parse(row.question_ids as string);
    } catch {
      bookmarks[row.mode as string] = [];
    }
  }

  return c.json({ chapters, detailed, detailedUpdatedAt, bookmarks });
});

// Save all progress for a user
app.put('/api/sync/:userId', async (c) => {
  const userId = c.req.param('userId');
  if (!userId || userId.length < 5) {
    return c.json({ error: 'Invalid userId' }, 400);
  }

  const body = await c.req.json<{
    chapters?: Record<string, Record<string, string>>;
    detailed?: Record<string, unknown>;
    detailedUpdatedAt?: number;
    bookmarks?: Record<string, string[]>;
  }>();

  const db = c.env.pilot_guide_db;
  const now = Date.now();

  const stmts: D1PreparedStatement[] = [];

  // Upsert chapter progress
  if (body.chapters) {
    const upsertChapter = db.prepare(
      'INSERT INTO chapter_progress (user_id, prefix, chapter_id, answers) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, prefix, chapter_id) DO UPDATE SET answers = excluded.answers'
    );
    for (const [key, answers] of Object.entries(body.chapters)) {
      const parts = key.split('_');
      // Keys look like "progress_chapter1", "ir_progress_chapter3", "pilot_guide_chapter5"
      // We need to split into prefix + chapter_id
      const prefixIdx = parts.indexOf('progress');
      if (prefixIdx === -1) continue;
      const prefix = parts.slice(0, prefixIdx + 1).join('_');
      const chapterId = parts.slice(prefixIdx + 1).join('_');
      stmts.push(upsertChapter.bind(userId, prefix, chapterId, JSON.stringify(answers)));
    }
  }

  // Upsert detailed progress
  if (body.detailed) {
    stmts.push(
      db.prepare(
        'INSERT INTO detailed_progress (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
      ).bind(userId, JSON.stringify(body.detailed), body.detailedUpdatedAt || now)
    );
  }

  // Upsert bookmarks
  if (body.bookmarks) {
    const upsertBookmark = db.prepare(
      'INSERT INTO bookmarks (user_id, mode, question_ids) VALUES (?, ?, ?) ON CONFLICT(user_id, mode) DO UPDATE SET question_ids = excluded.question_ids'
    );
    for (const [mode, ids] of Object.entries(body.bookmarks)) {
      stmts.push(upsertBookmark.bind(userId, mode, JSON.stringify(ids)));
    }
  }

  if (stmts.length > 0) {
    await db.batch(stmts);
  }

  return c.json({ ok: true });
});

export default app;
