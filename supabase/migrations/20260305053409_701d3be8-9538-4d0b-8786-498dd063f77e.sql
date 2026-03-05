
-- Create enum types
CREATE TYPE public.template_type AS ENUM ('email', 'whatsapp', 'sms');
CREATE TYPE public.submission_status AS ENUM ('new', 'in_review', 'approved', 'rejected');
CREATE TYPE public.template_status AS ENUM ('published', 'draft', 'archived');
CREATE TYPE public.tone_type AS ENUM ('formal', 'casual', 'direct', 'friendly', 'urgent');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'contributor', 'user');

-- User roles table (first, since others depend on it)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'form' CHECK (source IN ('email', 'form')),
  raw_subject TEXT,
  raw_from TEXT,
  raw_body TEXT,
  parsed_body TEXT,
  template_type template_type NOT NULL DEFAULT 'email',
  title TEXT,
  suggested_category TEXT,
  suggested_tags TEXT[],
  segment TEXT,
  language TEXT NOT NULL DEFAULT 'pt-br',
  status submission_status NOT NULL DEFAULT 'new',
  notes TEXT,
  reviewer_id UUID REFERENCES auth.users(id),
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and moderators can view submissions" ON public.submissions FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);
CREATE POLICY "Anyone can create submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and moderators can update submissions" ON public.submissions FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);

-- Templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  template_type template_type NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  tags TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'pt-br',
  segment TEXT,
  tone tone_type,
  variables TEXT[] DEFAULT '{}',
  persona TEXT CHECK (persona IN ('b2b', 'b2c', 'both')),
  copies_count INTEGER NOT NULL DEFAULT 0,
  status template_status NOT NULL DEFAULT 'draft',
  submission_id UUID REFERENCES public.submissions(id),
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  featured BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published templates viewable by everyone" ON public.templates FOR SELECT USING (
  status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);
CREATE POLICY "Admins and moderators manage templates" ON public.templates FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);

-- Increment copy count function
CREATE OR REPLACE FUNCTION public.increment_copy_count(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.templates SET copies_count = copies_count + 1 WHERE id = template_id;
END;
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Boas-vindas / Onboarding', 'boas-vindas', '👋'),
  ('Recuperação de Carrinho', 'recuperacao-carrinho', '🛒'),
  ('Confirmação de Pedido', 'confirmacao-pedido', '✅'),
  ('Cobrança / Pagamento', 'cobranca', '💳'),
  ('Pós-venda / Avaliação', 'pos-venda', '⭐'),
  ('Reativação / Winback', 'reativacao', '🔄'),
  ('Suporte / Status', 'suporte', '🎧'),
  ('Promoção / Oferta', 'promocao', '🔥'),
  ('Follow-up', 'follow-up', '📩'),
  ('Newsletter', 'newsletter', '📰');
