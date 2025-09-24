-- Fix RLS policies for published_activities_simple
-- Each user should only see their own activities

-- 1. Drop current permissive policy
DROP POLICY IF EXISTS "Allow all operations for everyone" ON public.published_activities_simple;

-- 2. Create user-specific policies for authenticated users
CREATE POLICY "Users can insert their own activities" 
ON public.published_activities_simple
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own activities" 
ON public.published_activities_simple
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own activities" 
ON public.published_activities_simple
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own activities" 
ON public.published_activities_simple
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 3. Create policies for anonymous users (compatibility)
CREATE POLICY "Anonymous users can insert activities" 
ON public.published_activities_simple
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can read null activities" 
ON public.published_activities_simple
FOR SELECT 
TO anon
USING (user_id IS NULL);

-- 4. Service role has full access (for migrations and admin)
CREATE POLICY "Service role has full access" 
ON public.published_activities_simple
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Create index for performance on user_id queries
CREATE INDEX IF NOT EXISTS idx_published_simple_user_auth ON public.published_activities_simple(user_id);

-- 6. Create helper function for auto-assigning user_id
CREATE OR REPLACE FUNCTION auto_assign_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Auto-assign user_id if NULL and user is authenticated
    IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$;

-- 7. Create trigger to auto-assign user_id on insert
DROP TRIGGER IF EXISTS trigger_auto_assign_user_id ON public.published_activities_simple;
CREATE TRIGGER trigger_auto_assign_user_id
    BEFORE INSERT ON public.published_activities_simple
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_user_id();

-- 8. Add comments for documentation
COMMENT ON TABLE public.published_activities_simple IS 'Published activities with RLS by user - each user sees only their activities';
COMMENT ON COLUMN public.published_activities_simple.user_id IS 'Auth user ID (auth.uid()) - NULL for anonymous users';
