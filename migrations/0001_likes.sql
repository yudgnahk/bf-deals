-- Likes: one vote per anonymized IP hash per deal.
CREATE TABLE IF NOT EXISTS likes (
  deal_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (deal_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS likes_deal_id_idx ON likes (deal_id);

-- Lightweight rate-limit buckets (per IP hash, per minute window).
CREATE TABLE IF NOT EXISTS like_rate (
  ip_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, window_start)
);
