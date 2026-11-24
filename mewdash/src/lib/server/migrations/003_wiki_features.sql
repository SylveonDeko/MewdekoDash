create table dash_wiki_categories (
  id bigint generated always as identity primary key,
  name text not null,
  icon text not null default 'fa-folder',
  sort_order integer not null default 0,
  constraint dash_wiki_categories_name_length check (char_length(name) between 1 and 40)
);

create unique index dash_wiki_categories_name_key on dash_wiki_categories (lower(name));

insert into dash_wiki_categories (name, sort_order)
select category, ((row_number() over (order by min(sort_order), category)) - 1)::integer * 10
  from dash_wiki_pages
 where deleted_at is null
 group by category;

create table dash_wiki_redirects (
  old_slug text primary key,
  page_id bigint not null references dash_wiki_pages (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint dash_wiki_redirects_slug_format check (old_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(old_slug) <= 64)
);

create index dash_wiki_redirects_page on dash_wiki_redirects (page_id);

create table dash_wiki_votes (
  page_id bigint not null references dash_wiki_pages (id) on delete cascade,
  locale text not null,
  voter_key text not null,
  helpful boolean not null,
  user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (page_id, locale, voter_key)
);

create index dash_wiki_votes_recent on dash_wiki_votes (updated_at desc);

insert into dash_wiki_votes (page_id, locale, voter_key, helpful, user_id, created_at, updated_at)
select distinct on (page_id, locale, user_id) page_id, locale, 'u' || user_id, helpful, user_id, created_at, created_at
  from dash_wiki_feedback
 order by page_id, locale, user_id, created_at desc, id desc;

alter table dash_wiki_feedback drop constraint dash_wiki_feedback_status;

alter table dash_wiki_feedback
  add constraint dash_wiki_feedback_status check (status in ('open', 'resolved', 'dismissed'));

create table dash_wiki_view_days (
  page_id bigint not null references dash_wiki_pages (id) on delete cascade,
  locale text not null,
  day date not null,
  views integer not null default 0,
  primary key (page_id, locale, day)
);

create index dash_wiki_view_days_day on dash_wiki_view_days (day);

create table dash_wiki_search_misses (
  query text not null,
  locale text not null,
  day date not null,
  misses integer not null default 0,
  primary key (query, locale, day),
  constraint dash_wiki_search_misses_length check (char_length(query) <= 100)
);

create index dash_wiki_search_misses_day on dash_wiki_search_misses (day);

create table dash_wiki_suggestion_blocks (
  user_id text primary key,
  display_name text not null,
  added_by text not null,
  added_at timestamptz not null default now()
);

create table dash_wiki_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table dash_wiki_images (
  id uuid primary key,
  content_type text not null,
  bytes integer not null,
  data bytea not null,
  uploaded_by text not null,
  uploaded_by_name text not null,
  created_at timestamptz not null default now(),
  constraint dash_wiki_images_type check (content_type in ('image/png', 'image/jpeg', 'image/gif', 'image/webp'))
);

alter table dash_wiki_versions add column source_revision_id bigint references dash_wiki_revisions (id);

update dash_wiki_versions v
   set source_revision_id = s.current_revision_id
  from dash_wiki_versions s
 where s.page_id = v.page_id and s.locale = 'en-US' and v.locale <> 'en-US';
