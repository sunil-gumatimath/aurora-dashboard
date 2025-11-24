-- =====================================================
-- Employee Documents & Notes Migration
-- =====================================================
-- Run this in Supabase SQL Editor to add Documents and Notes features
-- =====================================================

-- 1. CREATE EMPLOYEE DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_documents (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('resume', 'contract', 'certificate', 'id_proof', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  uploaded_by TEXT, -- user email/id who uploaded
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT fk_employee_docs FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Enable Row Level Security
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable all operations for authenticated users" 
ON employee_documents FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_uploaded_at ON employee_documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_documents_type ON employee_documents(type);


-- 2. CREATE EMPLOYEE NOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_notes (
  id BIGSERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('performance', 'general', 'disciplinary', 'praise', 'meeting', 'other')),
  is_private BOOLEAN DEFAULT false,
  created_by TEXT NOT NULL, -- user email/id who created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_employee_notes FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Enable Row Level Security
ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable all operations for authenticated users" 
ON employee_notes FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employee_notes_employee_id ON employee_notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_notes_created_at ON employee_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_notes_category ON employee_notes(category);


-- 3. CREATE AUTO-UPDATE TRIGGER FOR NOTES
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists (for rerunning)
DROP TRIGGER IF EXISTS update_employee_notes_updated_at ON employee_notes;

CREATE TRIGGER update_employee_notes_updated_at 
BEFORE UPDATE ON employee_notes 
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 4. INSERT SAMPLE DATA (OPTIONAL - for testing)
-- =====================================================
-- Uncomment below to add sample notes for testing

/*
INSERT INTO employee_notes (employee_id, title, content, category, created_by)
SELECT 
    id,
    'Welcome Note',
    'Welcome to the team! We''re excited to have you on board.',
    'general',
    'admin@company.com'
FROM employees
LIMIT 3;

INSERT INTO employee_notes (employee_id, title, content, category, created_by)
SELECT 
    id,
    'Q4 Performance Review',
    'Excellent performance this quarter. Exceeded all targets and showed great leadership.',
    'performance',
    'manager@company.com'
FROM employees
LIMIT 2;
*/


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify tables were created successfully

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('employee_documents', 'employee_notes');

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'employee_documents'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'employee_notes'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS! ✅
-- =====================================================
-- If you see the table names above, the migration was successful!
-- Next steps:
-- 1. Set up Supabase Storage bucket named 'employee-documents'
-- 2. Configure storage policies for file uploads
-- 3. Update your React app to use these new tables
-- =====================================================
