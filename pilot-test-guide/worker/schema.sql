CREATE TABLE IF NOT EXISTS chapter_progress (
  user_id TEXT NOT NULL,
  prefix TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  answers TEXT DEFAULT '{}',
  PRIMARY KEY (user_id, prefix, chapter_id)
);

CREATE TABLE IF NOT EXISTS detailed_progress (
  user_id TEXT PRIMARY KEY,
  data TEXT DEFAULT '{}',
  updated_at INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  question_ids TEXT DEFAULT '[]',
  PRIMARY KEY (user_id, mode)
);
