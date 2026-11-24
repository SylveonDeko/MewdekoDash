alter table dash_tr_suggestions add column origin text not null default 'suggestion';

alter table dash_tr_suggestions add constraint dash_tr_suggestions_origin check (origin in ('suggestion', 'edit', 'import', 'restore'));

update dash_tr_suggestions set origin = 'edit'
 where status = 'approved' and reviewed_by = user_id and created_at = reviewed_at;

create index dash_tr_suggestions_contributor on dash_tr_suggestions (locale, user_id);

create table dash_tr_events (
  id bigint generated always as identity primary key,
  catalog text not null,
  key text not null,
  locale text not null,
  kind text not null default 'revert',
  previous_text text not null,
  actor_id text not null,
  actor_name text not null,
  created_at timestamptz not null default now(),
  constraint dash_tr_events_kind check (kind in ('revert'))
);

create index dash_tr_events_string on dash_tr_events (catalog, key, locale, id desc);

create table dash_tr_blocks (
  user_id text primary key,
  display_name text not null,
  added_by text not null,
  added_at timestamptz not null default now()
);

create table dash_tr_settings (
  id smallint primary key default 1,
  suggestions_open boolean not null default true,
  open_suggestions_max integer not null default 200,
  updated_at timestamptz not null default now(),
  updated_by text,
  constraint dash_tr_settings_single check (id = 1),
  constraint dash_tr_settings_max check (open_suggestions_max between 1 and 1000)
);

insert into dash_tr_settings (id) values (1);
