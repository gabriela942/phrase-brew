
-- Add 'push' to template_type enum
ALTER TYPE public.template_type ADD VALUE 'push';

-- Add brand/sender and market_type fields to templates
ALTER TABLE public.templates ADD COLUMN brand TEXT;
ALTER TABLE public.templates ADD COLUMN market_type TEXT;

-- Add brand and market_type to submissions too
ALTER TABLE public.submissions ADD COLUMN brand TEXT;
ALTER TABLE public.submissions ADD COLUMN market_type TEXT;
