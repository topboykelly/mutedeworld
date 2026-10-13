-- Mutedeworld database setup
--
-- 1. Create a free project at https://supabase.com.
-- 2. Open SQL Editor -> New query, paste this whole file and click Run.
-- 3. Authentication -> Users -> Add user: create the admin login (email + password).
--    Then Authentication -> Sign In / Providers: turn OFF "Allow new users to sign up".
-- 4. Make that user an admin by running (with your email):
--      insert into public.admins (user_id)
--      select id from auth.users where email = 'you@example.com';
-- 5. Copy .env.example to .env.local and paste the project URL and keys.
-- 6. Sign in at /admin and click "Import starter products" to load the current catalogue.
--
-- Safe to re-run: everything uses "if not exists" / "or replace".

create extension if not exists pgcrypto;

-- ── Admins ──────────────────────────────────────────────────────────────

create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── Products ────────────────────────────────────────────────────────────
-- stock is keyed "colour|size" (colour is empty when a product has no colours), e.g. {"Black|M": 4, "|L": 2}

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('tees', 'joggers', 'shorts', 'baggy-jeans', 'socks', 'tank-tops', 'knit-bodysuit', 'caps')),
  price numeric(10, 2) not null check (price >= 0),
  description text not null default '',
  details text[] not null default '{}',
  badge text check (badge in ('new', 'bestseller', 'limited')),
  sizes text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  stock jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_sort_idx on public.products (sort_order, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
create policy "Anyone can view active products" on public.products
  for select using (is_active or public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
  for delete to authenticated using (public.is_admin());

-- ── Orders ──────────────────────────────────────────────────────────────

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  status text not null default 'new' check (status in ('new', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  region text not null,
  city text not null,
  address text not null,
  payment_method text not null,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null,
  total numeric(10, 2) not null,
  admin_note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Admins can view orders" on public.orders;
create policy "Admins can view orders" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Placing an order ────────────────────────────────────────────────────
-- Called only by the website's server (service role). Prices come from the database, stock is
-- checked and reduced in the same transaction, and the order is saved.
-- p_items: [{"product_id": uuid, "color": text, "size": text, "qty": int}]
-- p_delivery: {"fee": number, "free_over": number | null}

create or replace function public.place_order(
  p_customer jsonb,
  p_items jsonb,
  p_payment_method text,
  p_delivery jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_color text;
  v_size text;
  v_key text;
  v_qty integer;
  v_available integer;
  v_subtotal numeric := 0;
  v_fee numeric;
  v_lines jsonb := '[]'::jsonb;
  v_reference text;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'qty')::integer;
    v_color := coalesce(v_item ->> 'color', '');
    v_size := v_item ->> 'size';
    if v_qty is null or v_qty < 1 or v_size is null then
      raise exception 'INVALID_ITEM';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid and is_active
    for update;

    if not found then
      raise exception 'UNAVAILABLE';
    end if;

    v_key := v_color || '|' || v_size;
    v_available := coalesce((v_product.stock ->> v_key)::integer, 0);
    if v_available < v_qty then
      raise exception 'OUT_OF_STOCK|%|%|%|%', v_product.name, v_color, v_size, v_available;
    end if;

    update public.products
    set stock = jsonb_set(stock, array[v_key], to_jsonb(v_available - v_qty))
    where id = v_product.id;

    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'slug', v_product.slug,
      'name', v_product.name,
      'color', v_color,
      'size', v_size,
      'qty', v_qty,
      'price', v_product.price
    );
  end loop;

  v_fee := coalesce((p_delivery ->> 'fee')::numeric, 0);
  if (p_delivery ->> 'free_over') is not null and v_subtotal >= (p_delivery ->> 'free_over')::numeric then
    v_fee := 0;
  end if;

  loop
    v_reference := 'MDW-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.orders where reference = v_reference);
  end loop;

  insert into public.orders (
    reference, first_name, last_name, phone, email, region, city, address,
    payment_method, items, subtotal, delivery_fee, total
  ) values (
    v_reference,
    p_customer ->> 'first_name',
    p_customer ->> 'last_name',
    p_customer ->> 'phone',
    nullif(p_customer ->> 'email', ''),
    p_customer ->> 'region',
    p_customer ->> 'city',
    p_customer ->> 'address',
    p_payment_method,
    v_lines,
    v_subtotal,
    v_fee,
    v_subtotal + v_fee
  );

  return jsonb_build_object(
    'reference', v_reference,
    'items', v_lines,
    'subtotal', v_subtotal,
    'delivery_fee', v_fee,
    'total', v_subtotal + v_fee
  );
end;
$$;

revoke execute on function public.place_order(jsonb, jsonb, text, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb, text, jsonb) to service_role;

-- ── Changing an order's status (admins) ─────────────────────────────────
-- Cancelling puts the items back into stock. Cancelled orders can't be reopened.

create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item jsonb;
  v_key text;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  if v_order.status = p_status then
    return;
  end if;
  if v_order.status = 'cancelled' then
    raise exception 'ALREADY_CANCELLED';
  end if;

  if p_status = 'cancelled' then
    for v_item in select * from jsonb_array_elements(v_order.items) loop
      v_key := coalesce(v_item ->> 'color', '') || '|' || (v_item ->> 'size');
      update public.products
      set stock = jsonb_set(
        stock,
        array[v_key],
        to_jsonb(coalesce((stock ->> v_key)::integer, 0) + (v_item ->> 'qty')::integer)
      )
      where id = (v_item ->> 'product_id')::uuid;
    end loop;
  end if;

  update public.orders set status = p_status where id = p_order_id;
end;
$$;

revoke execute on function public.set_order_status(uuid, text) from public, anon;
grant execute on function public.set_order_status(uuid, text) to authenticated;

-- ── Product photos ──────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
