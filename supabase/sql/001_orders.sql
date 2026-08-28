create extension if not exists pgcrypto;

do $$ begin
  create type order_type as enum ('product', 'experience');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending_payment', 'paid', 'failed', 'cancelled', 'refunded');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type fulfillment_status as enum ('unfulfilled', 'preparing', 'shipped', 'ready_for_pickup', 'completed', 'returned', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  order_type order_type not null default 'product',
  customer_name text not null,
  email text not null,
  phone text not null,
  address text,
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'TWD',
  payment_provider text not null default 'ecpay',
  payment_status payment_status not null default 'pending_payment',
  fulfillment_status fulfillment_status not null default 'unfulfilled',
  ecpay_merchant_trade_no text,
  ecpay_trade_no text,
  paid_at timestamptz,
  note text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_type text not null default 'product',
  item_id text,
  item_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal integer not null check (subtotal >= 0),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  event_type text not null,
  message text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_payment_status on orders(payment_status);
create index if not exists idx_orders_fulfillment_status on orders(fulfillment_status);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_events_order_id on order_events(order_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
before update on orders
for each row
execute function set_updated_at();

alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;

drop policy if exists "service role can manage orders" on orders;
create policy "service role can manage orders"
on orders
for all
to service_role
using (true)
with check (true);

drop policy if exists "service role can manage order items" on order_items;
create policy "service role can manage order items"
on order_items
for all
to service_role
using (true)
with check (true);

drop policy if exists "service role can manage order events" on order_events;
create policy "service role can manage order events"
on order_events
for all
to service_role
using (true)
with check (true);
