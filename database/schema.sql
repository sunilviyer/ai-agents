-- =============================================================================
-- UNIVERSAL AI AGENTS DATABASE SCHEMA
-- =============================================================================
-- This schema is IMMUTABLE and shared across all 5 agents
-- DO NOT modify without updating all agent implementations
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CORE TABLES (Used by ALL agents)
-- =============================================================================

-- Case Studies: Stores pre-run agent executions
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Agent identification
  agent_slug VARCHAR(50) NOT NULL,        -- 'fraud-trends', 'stock-monitor', 'house-finder', 'article-editor', 'gita-guide'

  -- Display metadata
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),

  -- Agent-specific data (JSONB for flexibility)
  input_parameters JSONB NOT NULL,        -- Agent-specific input schema
  output_result JSONB NOT NULL,           -- Agent-specific output schema
  execution_trace JSONB NOT NULL,         -- Array of ExecutionStep objects

  -- Display controls
  featured BOOLEAN DEFAULT false,
  display_order INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_case_studies_slug ON case_studies(agent_slug);
CREATE INDEX idx_case_studies_featured ON case_studies(featured, display_order);
CREATE INDEX idx_case_studies_created ON case_studies(created_at DESC);

-- Execution Steps: Detailed step-by-step trace
CREATE TABLE execution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,

  -- Step identification
  step_number INTEGER NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_type VARCHAR(50) NOT NULL,         -- 'setup' | 'search' | 'analysis' | 'synthesis' | 'filter' | 'enrichment' | 'retrieval' | 'personalization' | 'guidance'

  -- Step content
  input_summary TEXT,
  output_summary TEXT,
  details JSONB,                          -- Step-specific expandable details

  -- Performance metrics
  duration_ms INTEGER,
  timestamp TIMESTAMP DEFAULT NOW(),

  UNIQUE(case_study_id, step_number)
);

CREATE INDEX idx_execution_steps_case_study ON execution_steps(case_study_id, step_number);

-- =============================================================================
-- GITA GUIDE SPECIFIC TABLES (for live chat functionality)
-- =============================================================================

-- Gita Verses: Complete Bhagavad Gita text
CREATE TABLE gita_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,

  -- Sanskrit text
  sanskrit TEXT,                          -- Devanagari script
  transliteration TEXT,                   -- Romanized Sanskrit
  word_by_word TEXT,                      -- Word-by-word meaning

  -- English
  translation TEXT NOT NULL,              -- Primary English translation
  commentary TEXT,                        -- Extended explanation

  -- Search and categorization
  themes TEXT[],                          -- e.g., ['karma', 'duty', 'action']
  keywords TEXT[],                        -- Searchable keywords

  UNIQUE(chapter, verse)
);

CREATE INDEX idx_gita_verses_chapter ON gita_verses(chapter, verse);
CREATE INDEX idx_gita_verses_keywords ON gita_verses USING GIN(keywords);
CREATE INDEX idx_gita_verses_themes ON gita_verses USING GIN(themes);

-- Gita Chapters: Chapter summaries
CREATE TABLE gita_chapters (
  chapter INTEGER PRIMARY KEY,
  title_english VARCHAR(200),
  title_sanskrit VARCHAR(200),
  summary TEXT,
  key_themes TEXT[],
  verse_count INTEGER
);

-- Gita Concepts: Key terms and definitions
CREATE TABLE gita_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term VARCHAR(100) NOT NULL UNIQUE,      -- English term
  sanskrit VARCHAR(100),                  -- Sanskrit term
  devanagari VARCHAR(100),                -- देवनागरी
  definition TEXT NOT NULL,
  extended_explanation TEXT,
  related_verses INTEGER[],               -- Array of verse numbers
  related_concepts TEXT[]                 -- Related term names
);

CREATE INDEX idx_gita_concepts_term ON gita_concepts(term);
CREATE INDEX idx_gita_concepts_sanskrit ON gita_concepts(sanskrit);

-- =============================================================================
-- AGENT-SPECIFIC OPTIONAL TABLES
-- =============================================================================

-- House Finder: School ratings data (Fraser Institute)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  school_type VARCHAR(20),                -- 'elementary', 'secondary'
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(50),
  postal_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  fraser_rating DECIMAL(3, 1),            -- 1.0 to 10.0
  rating_year INTEGER,
  enrollment INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schools_city ON schools(city, school_type);
CREATE INDEX idx_schools_postal ON schools(postal_code);
CREATE INDEX idx_schools_rating ON schools(fraser_rating DESC);

-- School Catchment Areas (simplified postal code mapping)
CREATE TABLE school_catchments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  postal_code VARCHAR(10),
  PRIMARY KEY (school_id, postal_code)
);

CREATE INDEX idx_catchments_postal ON school_catchments(postal_code);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for case_studies
CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Agent summary view
CREATE VIEW agent_summary AS
SELECT
  agent_slug,
  COUNT(*) as total_case_studies,
  COUNT(*) FILTER (WHERE featured = true) as featured_count,
  MAX(created_at) as last_updated
FROM case_studies
GROUP BY agent_slug;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE case_studies IS 'Stores pre-run agent execution results for all agents';
COMMENT ON TABLE execution_steps IS 'Detailed step-by-step execution trace for transparency';
COMMENT ON TABLE gita_verses IS 'Complete Bhagavad Gita text for Gita Guide agent';
COMMENT ON TABLE schools IS 'School ratings data for House Finder agent';
COMMENT ON COLUMN case_studies.agent_slug IS 'Identifies which agent generated this case study';
COMMENT ON COLUMN execution_steps.step_type IS 'Categories: setup, search, analysis, synthesis, filter, enrichment, retrieval, personalization, guidance';
