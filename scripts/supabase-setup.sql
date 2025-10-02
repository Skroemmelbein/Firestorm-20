-- Supabase setup for communications logging
create table if not exists communications (
  id bigint generated always as identity primary key,
  member_id bigint,
  channel text check (channel in ('sms','email','voice','push')),
  direction text check (direction in ('inbound','outbound')),
  from_number text,
  to_number text,
  subject text,
  content text not null,
  status text check (status in ('queued','sent','delivered','failed','bounced')),
  provider text,
  provider_id text,
  provider_status text,
  error_message text,
  cost numeric(10,4),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz default now(),
  ai_generated boolean default false,
  ai_sentiment text check (ai_sentiment in ('positive','neutral','negative')),
  ai_intent text,
  ai_confidence numeric(3,2)
);

create index if not exists idx_comm_provider_id on communications(provider_id);
create index if not exists idx_comm_member_id on communications(member_id);

