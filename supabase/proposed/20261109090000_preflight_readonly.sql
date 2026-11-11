-- SELECT ONLY. Review with Dr. Ahmed before any hosted execution.
-- Counts/catalog metadata only. Does not return identifiers or row content.
-- Run the column/FK queries before the orphan query to confirm table availability.

SELECT cols.table_name, cols.column_name, cols.data_type, cols.udt_name,
       cols.is_nullable
FROM information_schema.columns AS cols
WHERE cols.table_schema = 'public'
  AND (cols.table_name, cols.column_name) IN (
    ('profiles', 'id'), ('case_completions', 'user_id'),
    ('mcq_answers', 'user_id'), ('subscriptions', 'user_id')
  )
ORDER BY cols.table_name;

SELECT t.relname AS table_name, a.attname AS owner_column,
       fk.conname, fk.confdeltype,
       pg_catalog.pg_get_constraintdef(fk.oid) AS definition,
       fk.convalidated
FROM pg_catalog.pg_constraint AS fk
JOIN pg_catalog.pg_class AS t ON t.oid = fk.conrelid
JOIN pg_catalog.pg_namespace AS n ON n.oid = t.relnamespace
JOIN pg_catalog.pg_attribute AS a ON a.attrelid = t.oid AND a.attnum = ANY(fk.conkey)
WHERE fk.contype = 'f' AND n.nspname = 'public'
  AND (t.relname, a.attname) IN (
    ('profiles', 'id'), ('case_completions', 'user_id'),
    ('mcq_answers', 'user_id'), ('subscriptions', 'user_id')
  )
ORDER BY t.relname, fk.conname;

-- Text comparison avoids a cast failure when an owner column is not UUID.
-- Counts include NULL owners separately because they are outside FK enforcement.
SELECT 'profiles' AS table_name,
       count(*) FILTER (WHERE p.id IS NOT NULL AND u.id IS NULL) AS orphan_rows,
       count(*) FILTER (WHERE p.id IS NULL) AS null_owners
FROM public.profiles AS p LEFT JOIN auth.users AS u ON p.id::text = u.id::text
UNION ALL
SELECT 'case_completions',
       count(*) FILTER (WHERE p.user_id IS NOT NULL AND u.id IS NULL),
       count(*) FILTER (WHERE p.user_id IS NULL)
FROM public.case_completions AS p LEFT JOIN auth.users AS u ON p.user_id::text = u.id::text
UNION ALL
SELECT 'mcq_answers',
       count(*) FILTER (WHERE p.user_id IS NOT NULL AND u.id IS NULL),
       count(*) FILTER (WHERE p.user_id IS NULL)
FROM public.mcq_answers AS p LEFT JOIN auth.users AS u ON p.user_id::text = u.id::text
UNION ALL
SELECT 'subscriptions',
       count(*) FILTER (WHERE p.user_id IS NOT NULL AND u.id IS NULL),
       count(*) FILTER (WHERE p.user_id IS NULL)
FROM public.subscriptions AS p LEFT JOIN auth.users AS u ON p.user_id::text = u.id::text;

SELECT c.table_name, c.column_name, c.data_type
FROM information_schema.columns AS c
JOIN information_schema.tables AS t
  ON t.table_schema = c.table_schema AND t.table_name = c.table_name
WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  AND c.column_name IN ('user_id', 'owner_id', 'profile_id', 'created_by')
ORDER BY c.table_name, c.column_name;
