/*
  # AI Agent Intelligence & Consistency Tracking System

  ## Overview
  This migration creates tables to track AI agent decisions, visual consistency validation,
  and learning metrics for continuous improvement of storyboard generation.

  ## New Tables

  ### `agent_decisions`
  Logs every decision made by AI agents during storyboard generation
  - `id` (uuid, primary key)
  - `generation_id` (uuid) - Links to specific storyboard generation session
  - `agent_type` (text) - Type of agent: 'story_architect', 'visual_generator', 'consistency_validator'
  - `decision_type` (text) - Type of decision: 'scene_structure', 'character_arc', 'visual_consistency', 'regeneration'
  - `input_data` (jsonb) - Input parameters that led to this decision
  - `output_data` (jsonb) - Result of the decision
  - `reasoning` (text) - Agent's reasoning for this decision
  - `confidence_score` (numeric) - Agent's confidence in decision (0-100)
  - `execution_time_ms` (integer) - Time taken to make decision
  - `created_at` (timestamptz)

  ### `consistency_validations`
  Tracks visual consistency checks between reference images and generated frames
  - `id` (uuid, primary key)
  - `generation_id` (uuid) - Links to storyboard generation
  - `scene_id` (text) - Scene identifier (e.g., "1", "2")
  - `frame_variant` (text) - Frame variant ('A' or 'B')
  - `frame_image_url` (text) - Generated frame image
  - `reference_type` (text) - Type of reference: 'character', 'background', 'art_style', 'logo'
  - `reference_image_url` (text) - Reference image used for comparison
  - `consistency_score` (numeric) - Overall consistency score (0-100)
  - `character_identity_score` (numeric) - Character likeness score (0-100)
  - `art_style_score` (numeric) - Art style adherence score (0-100)
  - `color_palette_score` (numeric) - Color matching score (0-100)
  - `lighting_score` (numeric) - Lighting consistency score (0-100)
  - `composition_score` (numeric) - Composition match score (0-100)
  - `validation_passed` (boolean) - Whether validation passed threshold
  - `threshold_used` (numeric) - Minimum score threshold applied
  - `validation_notes` (text) - Detailed validation feedback
  - `created_at` (timestamptz)

  ### `generation_sessions`
  Tracks complete storyboard generation sessions
  - `id` (uuid, primary key)
  - `user_id` (text) - User identifier
  - `story_description` (text) - Original story input
  - `frame_count` (integer) - Number of frames requested
  - `aspect_ratio` (text) - Aspect ratio used
  - `has_logo` (boolean) - Whether logo was provided
  - `has_character` (boolean) - Whether character reference provided
  - `has_background` (boolean) - Whether background reference provided
  - `has_art_style` (boolean) - Whether art style reference provided
  - `additional_characters_count` (integer) - Number of additional characters
  - `status` (text) - Status: 'started', 'story_world', 'script', 'images', 'validation', 'completed', 'failed'
  - `total_duration_ms` (integer) - Total generation time
  - `story_world_duration_ms` (integer) - Time for story world generation
  - `script_duration_ms` (integer) - Time for script generation
  - `images_duration_ms` (integer) - Time for image generation
  - `validation_duration_ms` (integer) - Time for consistency validation
  - `regeneration_count` (integer) - Number of frames regenerated for consistency
  - `average_consistency_score` (numeric) - Average consistency across all frames
  - `story_quality_score` (numeric) - Story quality rating (0-100)
  - `final_storyboard` (jsonb) - Complete final storyboard
  - `error_message` (text) - Error if generation failed
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### `agent_learning_metrics`
  Stores learning data for continuous agent improvement
  - `id` (uuid, primary key)
  - `agent_type` (text) - Agent type
  - `metric_name` (text) - Name of metric being tracked
  - `metric_value` (numeric) - Value of metric
  - `context` (jsonb) - Context data for this metric
  - `time_period` (text) - Time period: 'hourly', 'daily', 'weekly'
  - `recorded_at` (timestamptz)

  ### `prompt_performance`
  Tracks which prompts produce best results
  - `id` (uuid, primary key)
  - `agent_type` (text) - Agent that used this prompt
  - `prompt_template` (text) - The prompt template used
  - `prompt_version` (text) - Version identifier
  - `input_parameters` (jsonb) - Parameters used with prompt
  - `output_quality_score` (numeric) - Quality of output (0-100)
  - `consistency_score` (numeric) - Consistency score achieved
  - `user_feedback_score` (numeric) - User satisfaction score (0-5)
  - `execution_time_ms` (integer) - Time to execute
  - `success` (boolean) - Whether prompt succeeded
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read access for analytics (no sensitive data exposed)
  - Insert restricted to authenticated users and edge functions
  - Service role can perform all operations

  ## Indexes
  - Performance indexes on frequently queried fields
  - Composite indexes for common query patterns
*/

-- Create generation_sessions table
CREATE TABLE IF NOT EXISTS generation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default-user',
  story_description text NOT NULL,
  frame_count integer NOT NULL DEFAULT 4,
  aspect_ratio text NOT NULL DEFAULT '16:9',
  has_logo boolean DEFAULT false,
  has_character boolean DEFAULT false,
  has_background boolean DEFAULT false,
  has_art_style boolean DEFAULT false,
  additional_characters_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'started',
  total_duration_ms integer,
  story_world_duration_ms integer,
  script_duration_ms integer,
  images_duration_ms integer,
  validation_duration_ms integer,
  regeneration_count integer DEFAULT 0,
  average_consistency_score numeric(5,2),
  story_quality_score numeric(5,2),
  final_storyboard jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create agent_decisions table
CREATE TABLE IF NOT EXISTS agent_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid REFERENCES generation_sessions(id) ON DELETE CASCADE,
  agent_type text NOT NULL,
  decision_type text NOT NULL,
  input_data jsonb,
  output_data jsonb,
  reasoning text,
  confidence_score numeric(5,2),
  execution_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Create consistency_validations table
CREATE TABLE IF NOT EXISTS consistency_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid REFERENCES generation_sessions(id) ON DELETE CASCADE,
  scene_id text NOT NULL,
  frame_variant text NOT NULL,
  frame_image_url text,
  reference_type text NOT NULL,
  reference_image_url text,
  consistency_score numeric(5,2),
  character_identity_score numeric(5,2),
  art_style_score numeric(5,2),
  color_palette_score numeric(5,2),
  lighting_score numeric(5,2),
  composition_score numeric(5,2),
  validation_passed boolean DEFAULT false,
  threshold_used numeric(5,2),
  validation_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create agent_learning_metrics table
CREATE TABLE IF NOT EXISTS agent_learning_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric,
  context jsonb,
  time_period text NOT NULL DEFAULT 'daily',
  recorded_at timestamptz DEFAULT now()
);

-- Create prompt_performance table
CREATE TABLE IF NOT EXISTS prompt_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type text NOT NULL,
  prompt_template text NOT NULL,
  prompt_version text NOT NULL,
  input_parameters jsonb,
  output_quality_score numeric(5,2),
  consistency_score numeric(5,2),
  user_feedback_score numeric(3,1),
  execution_time_ms integer,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generation_sessions_user_id ON generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_status ON generation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_created_at ON generation_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_decisions_generation_id ON agent_decisions(generation_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent_type ON agent_decisions(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created_at ON agent_decisions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consistency_validations_generation_id ON consistency_validations(generation_id);
CREATE INDEX IF NOT EXISTS idx_consistency_validations_validation_passed ON consistency_validations(validation_passed);

CREATE INDEX IF NOT EXISTS idx_agent_learning_metrics_agent_type ON agent_learning_metrics(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_learning_metrics_recorded_at ON agent_learning_metrics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_prompt_performance_agent_type ON prompt_performance(agent_type);
CREATE INDEX IF NOT EXISTS idx_prompt_performance_success ON prompt_performance(success);
CREATE INDEX IF NOT EXISTS idx_prompt_performance_created_at ON prompt_performance(created_at DESC);

-- Enable Row Level Security
ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consistency_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generation_sessions
CREATE POLICY "Anyone can read generation sessions"
  ON generation_sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert generation sessions"
  ON generation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own sessions"
  ON generation_sessions FOR UPDATE
  TO authenticated
  USING (user_id = current_user OR user_id = 'default-user')
  WITH CHECK (user_id = current_user OR user_id = 'default-user');

-- RLS Policies for agent_decisions
CREATE POLICY "Anyone can read agent decisions"
  ON agent_decisions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert agent decisions"
  ON agent_decisions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for consistency_validations
CREATE POLICY "Anyone can read consistency validations"
  ON consistency_validations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert consistency validations"
  ON consistency_validations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for agent_learning_metrics
CREATE POLICY "Anyone can read learning metrics"
  ON agent_learning_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert learning metrics"
  ON agent_learning_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for prompt_performance
CREATE POLICY "Anyone can read prompt performance"
  ON prompt_performance FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert prompt performance"
  ON prompt_performance FOR INSERT
  TO authenticated
  WITH CHECK (true);
