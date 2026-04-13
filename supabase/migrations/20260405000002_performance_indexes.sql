-- PERFORMANCE INDEXES
-- Optimizes the query patterns used in SearchFilters.tsx, Index.tsx, Admin.tsx

-- Templates: compound index for the most common public query (published + type)
CREATE INDEX IF NOT EXISTS idx_templates_published_type
  ON public.templates(status, template_type)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_templates_category
  ON public.templates(category_id);

CREATE INDEX IF NOT EXISTS idx_templates_language
  ON public.templates(language);

CREATE INDEX IF NOT EXISTS idx_templates_featured
  ON public.templates(featured)
  WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_templates_created_at
  ON public.templates(created_at DESC);

-- Submissions: admin inbox filters by status and created_at
CREATE INDEX IF NOT EXISTS idx_submissions_status
  ON public.submissions(status);

CREATE INDEX IF NOT EXISTS idx_submissions_type
  ON public.submissions(template_type);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
  ON public.submissions(created_at DESC);

-- Categories: slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON public.categories(slug);

-- user_roles: fast role lookup by user
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
  ON public.user_roles(user_id);
