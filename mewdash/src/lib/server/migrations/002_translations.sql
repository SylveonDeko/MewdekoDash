create table dash_tr_catalogs (
  catalog text primary key,
  build_hash text not null,
  version bigint not null default 0,
  registered_at timestamptz not null default now()
);

create table dash_tr_strings (
  catalog text not null,
  key text not null,
  grp text not null default '',
  source_text text not null,
  updated_at timestamptz not null default now(),
  primary key (catalog, key)
);

create index dash_tr_strings_group on dash_tr_strings (catalog, grp);

create table dash_tr_baselines (
  catalog text not null,
  key text not null,
  locale text not null,
  text text not null,
  primary key (catalog, key, locale)
);

create index dash_tr_baselines_locale on dash_tr_baselines (catalog, locale);

create table dash_tr_overrides (
  catalog text not null,
  key text not null,
  locale text not null,
  text text not null,
  source_text text not null,
  updated_at timestamptz not null default now(),
  updated_by text,
  updated_by_name text,
  primary key (catalog, key, locale)
);

create index dash_tr_overrides_locale on dash_tr_overrides (catalog, locale);

create table dash_tr_suggestions (
  id bigint generated always as identity primary key,
  catalog text not null,
  key text not null,
  locale text not null,
  text text not null,
  source_text text not null,
  user_id text not null,
  user_name text not null,
  status text not null default 'open',
  open_mark smallint default 1,
  decline_reason text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  reviewed_by_name text,
  constraint dash_tr_suggestions_status check (status in ('open', 'approved', 'declined', 'replaced')),
  constraint dash_tr_suggestions_open_mark check (
    (status = 'open') = (open_mark is not null) and (open_mark is null or open_mark = 1)
  ),
  constraint dash_tr_suggestions_one_open unique (catalog, key, locale, user_id, open_mark)
);

create index dash_tr_suggestions_queue on dash_tr_suggestions (catalog, locale, status, created_at desc);
create index dash_tr_suggestions_user on dash_tr_suggestions (user_id, created_at desc);
create index dash_tr_suggestions_string on dash_tr_suggestions (catalog, key, locale, id desc);

create table dash_translators (
  user_id text not null,
  locale text not null,
  display_name text not null,
  added_by text not null,
  added_at timestamptz not null default now(),
  primary key (user_id, locale)
);
