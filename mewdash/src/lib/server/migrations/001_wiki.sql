create table dash_wiki_pages (
  id bigint generated always as identity primary key,
  slug text not null,
  icon text not null default 'fa-book',
  category text not null default 'General',
  dashboard_href text,
  module text,
  related text[] not null default '{}',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint dash_wiki_pages_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 64)
);

create unique index dash_wiki_pages_slug_live on dash_wiki_pages (slug) where deleted_at is null;
create index dash_wiki_pages_order on dash_wiki_pages (sort_order, id) where deleted_at is null;

create table dash_wiki_revisions (
  id bigint generated always as identity primary key,
  page_id bigint not null references dash_wiki_pages (id) on delete cascade,
  locale text not null,
  title text not null,
  summary text not null default '',
  markdown text not null default '',
  tags text[] not null default '{}',
  note text not null default '',
  author_id text not null,
  author_name text not null,
  created_at timestamptz not null default now()
);

create index dash_wiki_revisions_history on dash_wiki_revisions (page_id, locale, id desc);
create index dash_wiki_revisions_recent on dash_wiki_revisions (created_at desc, id desc);

create table dash_wiki_versions (
  page_id bigint not null references dash_wiki_pages (id) on delete cascade,
  locale text not null,
  title text not null,
  summary text not null default '',
  markdown text not null default '',
  tags text[] not null default '{}',
  current_revision_id bigint references dash_wiki_revisions (id),
  updated_at timestamptz not null default now(),
  updated_by_name text not null default '',
  primary key (page_id, locale)
);

create table dash_wiki_editors (
  user_id text primary key,
  display_name text not null,
  added_by text not null,
  added_at timestamptz not null default now()
);

create table dash_wiki_suggestions (
  id bigint generated always as identity primary key,
  page_id bigint not null references dash_wiki_pages (id) on delete cascade,
  locale text not null,
  base_revision_id bigint references dash_wiki_revisions (id),
  title text not null,
  summary text not null default '',
  markdown text not null default '',
  tags text[] not null default '{}',
  note text not null default '',
  user_id text not null,
  user_name text not null,
  status text not null default 'open',
  open_mark smallint default 1,
  decline_reason text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  reviewed_by_name text,
  revision_id bigint references dash_wiki_revisions (id),
  constraint dash_wiki_suggestions_status check (status in ('open', 'approved', 'declined', 'replaced')),
  constraint dash_wiki_suggestions_open_mark check (
    (status = 'open' and open_mark = 1) or (status <> 'open' and open_mark is null)
  ),
  constraint dash_wiki_suggestions_one_open unique (page_id, locale, user_id, open_mark)
);

create index dash_wiki_suggestions_queue on dash_wiki_suggestions (status, created_at desc);
create index dash_wiki_suggestions_user on dash_wiki_suggestions (user_id, created_at desc);

create table dash_wiki_feedback (
  id bigint generated always as identity primary key,
  page_id bigint not null references dash_wiki_pages (id) on delete cascade,
  locale text not null,
  helpful boolean not null,
  reason text not null default '',
  note text not null default '',
  user_id text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text,
  constraint dash_wiki_feedback_status check (status in ('open', 'resolved'))
);

create index dash_wiki_feedback_queue on dash_wiki_feedback (status, created_at desc);
create index dash_wiki_feedback_user on dash_wiki_feedback (page_id, locale, user_id);
