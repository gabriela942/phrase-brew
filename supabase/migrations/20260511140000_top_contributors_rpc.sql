-- Top contributors leaderboard
--
-- The previous client-side query used `submissions!inner(raw_from)`, but RLS
-- on `submissions` restricts SELECT to admins/moderators. For anonymous
-- visitors the inner join eliminated every row and the leaderboard rendered
-- empty. This RPC reads `submissions` under SECURITY DEFINER, returning only
-- the aggregated, non-sensitive shape the UI needs (display name + counts).

CREATE OR REPLACE FUNCTION public.get_top_contributors(limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
  name TEXT,
  published BIGINT,
  last_published_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH parsed AS (
    SELECT
      t.published_at,
      btrim(
        COALESCE(
          (regexp_match(s.raw_from, '^"?([^"<]+?)"?\s*<'))[1],
          (regexp_match(s.raw_from, '([^@\s]+)@'))[1],
          s.raw_from
        )
      ) AS contributor_name
    FROM public.templates t
    INNER JOIN public.submissions s ON s.id = t.submission_id
    WHERE t.status = 'published'
      AND s.raw_from IS NOT NULL
      AND length(btrim(s.raw_from)) > 0
  ),
  grouped AS (
    SELECT
      lower(regexp_replace(contributor_name, '\s+', ' ', 'g')) AS norm_key,
      (array_agg(contributor_name ORDER BY published_at DESC NULLS LAST))[1] AS display_name,
      count(*) AS published,
      max(published_at) AS last_published_at
    FROM parsed
    WHERE contributor_name IS NOT NULL AND length(contributor_name) > 0
    GROUP BY norm_key
  )
  SELECT g.display_name, g.published, g.last_published_at
  FROM grouped g
  ORDER BY g.published DESC, g.last_published_at DESC NULLS LAST
  LIMIT limit_count;
END;
$$;

-- Anon (visitor) and authenticated (signed-in) both need to call this for
-- the home page leaderboard to render.
GRANT EXECUTE ON FUNCTION public.get_top_contributors(INTEGER) TO anon, authenticated;
