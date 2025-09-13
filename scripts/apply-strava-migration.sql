-- Script para aplicar la migración de campos de Strava
-- Ejecuta esto en el SQL Editor de Supabase

-- Migration 005: Add Strava fields to published_activities table
-- This ensures all Strava-related fields are present for proper integration

-- Add Strava fields to published_activities if they don't exist
DO $$ 
BEGIN
  -- Add strava_activity_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities' 
    AND column_name = 'strava_activity_id'
  ) THEN
    ALTER TABLE public.published_activities 
    ADD COLUMN strava_activity_id BIGINT;
    
    -- Add index for better performance
    CREATE INDEX idx_published_activities_strava_id 
    ON public.published_activities(strava_activity_id);
    
    RAISE NOTICE 'Added strava_activity_id column and index';
  ELSE
    RAISE NOTICE 'strava_activity_id column already exists';
  END IF;

  -- Add imported_from_strava column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities' 
    AND column_name = 'imported_from_strava'
  ) THEN
    ALTER TABLE public.published_activities 
    ADD COLUMN imported_from_strava BOOLEAN DEFAULT FALSE;
    
    RAISE NOTICE 'Added imported_from_strava column';
  ELSE
    RAISE NOTICE 'imported_from_strava column already exists';
  END IF;

  -- Add strava_upload_id column (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities' 
    AND column_name = 'strava_upload_id'
  ) THEN
    ALTER TABLE public.published_activities 
    ADD COLUMN strava_upload_id TEXT;
    
    RAISE NOTICE 'Added strava_upload_id column';
  ELSE
    RAISE NOTICE 'strava_upload_id column already exists';
  END IF;

  -- Add entrenamiento_id column (if not exists) for backward compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'published_activities' 
    AND column_name = 'entrenamiento_id'
  ) THEN
    ALTER TABLE public.published_activities 
    ADD COLUMN entrenamiento_id UUID;
    
    RAISE NOTICE 'Added entrenamiento_id column';
  ELSE
    RAISE NOTICE 'entrenamiento_id column already exists';
  END IF;

END $$;

-- Verify the structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'published_activities' 
AND column_name IN ('strava_activity_id', 'imported_from_strava', 'strava_upload_id', 'entrenamiento_id')
ORDER BY column_name;

-- Show current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'published_activities' 
ORDER BY ordinal_position;
