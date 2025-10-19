-- =====================================================
-- MIGRACIÓN: Agregar columnas faltantes a training_plans
-- Fecha: 2025-10-19
-- =====================================================

-- Agregar columnas faltantes si no existen
ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;

ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS duration TEXT;

ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS intensity TEXT;

ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;

-- Verificar estructura
DO $$ 
BEGIN
  RAISE NOTICE 'Columnas agregadas a training_plans: start_date, duration, intensity, week_number';
END $$;

