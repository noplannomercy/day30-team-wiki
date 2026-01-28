-- Migration: Add full-text search indexes
-- Phase 7: Search & Discovery

-- Create GIN indexes for full-text search on documents
CREATE INDEX IF NOT EXISTS idx_documents_fts
  ON documents
  USING GIN (to_tsvector('english', title || ' ' || content));

-- Create GIN index for full-text search on comments
CREATE INDEX IF NOT EXISTS idx_comments_fts
  ON comments
  USING GIN (to_tsvector('english', content));

-- Create indexes for common filters
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_created_by ON comments(created_by);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
