"""
DNA Music System — PostgreSQL Schema Initialisation
Run this script once to set up the database before starting the backend.
Usage: python init_db.py
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Connection string (splits out host/db for initial createdb)
DB_URL = os.environ.get('DATABASE_URL', 'postgresql://dnamusic:dnamusic123@localhost:5432/dnamusic')

SCHEMA_SQL = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id           VARCHAR(64)  PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    cognito_sub  VARCHAR(128) UNIQUE NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    name         VARCHAR(255),
    is_admin     BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMP    DEFAULT NOW(),
    updated_at   TIMESTAMP    DEFAULT NOW()
);

-- ─── Groups ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
    id            VARCHAR(64)  PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name          VARCHAR(255) NOT NULL,
    token         VARCHAR(16)  UNIQUE NOT NULL,
    leader_id     VARCHAR(64)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_track JSONB,
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- ─── Group Members ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
    id         SERIAL      PRIMARY KEY,
    group_id   VARCHAR(64) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id    VARCHAR(64) NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    joined_at  TIMESTAMP   DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

-- ─── Chat Messages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id         SERIAL      PRIMARY KEY,
    group_id   VARCHAR(64) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id    VARCHAR(64) NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    message    TEXT        NOT NULL,
    created_at TIMESTAMP   DEFAULT NOW()
);

-- ─── Votes ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS votes (
    id         SERIAL      PRIMARY KEY,
    group_id   VARCHAR(64) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id    VARCHAR(64) NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    vote_type  VARCHAR(16) NOT NULL CHECK (vote_type IN ('skip','like','dislike','replay')),
    track_id   VARCHAR(32) DEFAULT 'current',
    created_at TIMESTAMP   DEFAULT NOW(),
    UNIQUE (group_id, user_id, track_id)
);

-- ─── Feedback ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
    id         SERIAL      PRIMARY KEY,
    user_id    VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message    TEXT        NOT NULL,
    created_at TIMESTAMP   DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_members_user  ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_group          ON chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_votes_group         ON votes(group_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user       ON feedback(user_id);
"""


def init():
    print("Connecting to PostgreSQL…")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    print("Creating schema…")
    cur.execute(SCHEMA_SQL)
    print("✅ DNA Music System database schema created successfully!")
    cur.close()
    conn.close()


if __name__ == '__main__':
    init()
