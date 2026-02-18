-- ============================================
-- UPDATE USER ROLES SCRIPT
-- Run this in Supabase SQL Editor to correct/update user roles
-- ============================================

-- 1. Ensure the 'role' column exists (it should, but just in case)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Employee';

-- 2. Update Specific Users to their Roles

-- ADMIN: admin@gmail.com
UPDATE public.employees 
SET role = 'Admin', 
    department = 'IT' 
WHERE email = 'admin@gmail.com';

-- MANAGER 1: Priya Sharma
UPDATE public.employees 
SET role = 'Manager', 
    department = 'Human Resources' 
WHERE email = 'priya.sharma@synergy.com';

-- MANAGER 2: Rajesh Kumar
UPDATE public.employees 
SET role = 'Manager', 
    department = 'Engineering' 
WHERE email = 'rajesh.kumar@synergy.com';

-- EMPLOYEE: Vikram Reddy
UPDATE public.employees 
SET role = 'Employee', 
    department = 'Engineering' 
WHERE email = 'vikram.reddy@synergy.com';

-- 3. Verify the updates
SELECT name, email, role, department FROM public.employees 
WHERE email IN (
    'admin@gmail.com', 
    'priya.sharma@synergy.com', 
    'rajesh.kumar@synergy.com', 
    'vikram.reddy@synergy.com'
);
