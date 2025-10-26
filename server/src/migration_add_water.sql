-- Migration to add water column to meal_entries table
-- Run this if you have an existing database

-- Add water column with default value 0
ALTER TABLE meal_entries ADD COLUMN water REAL NOT NULL DEFAULT 0;

-- Update any existing water entries to have the amount as water value
-- This assumes water entries have 'water' as meal type and the amount represents water in ml
UPDATE meal_entries 
SET water = amount 
WHERE meal = 'water' OR name = 'Vesi';

-- Verify the migration
SELECT COUNT(*) as total_entries, 
       COUNT(CASE WHEN water > 0 THEN 1 END) as entries_with_water
FROM meal_entries;