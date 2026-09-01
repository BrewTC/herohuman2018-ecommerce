do $$ begin
  create type product_status as enum ('draft', 'active', 'archived');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id integer unique,
  sku text unique,
  slug text not null unique,
  name text not null,
  price integer not null check (price >= 0),
  image_url text not null default '',
  summary text not null default '',
  description text not null default '',
  highlights jsonb not null default '[]'::jsonb check (jsonb_typeof(highlights) = 'array'),
  specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array'),
  ingredients text not null default '',
  storage text not null default '',
  serving text not null default '',
  allergens text not null default '',
  status product_status not null default 'draft',
  is_sold_out boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_storefront
on public.products(status, sort_order, created_at);

create index if not exists idx_products_name
on public.products(name);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute function set_updated_at();

alter table public.products enable row level security;

drop policy if exists "public can view active products" on public.products;
create policy "public can view active products"
on public.products
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "service role can manage products" on public.products;
create policy "service role can manage products"
on public.products
for all
to service_role
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "service role can manage product images" on storage.objects;
create policy "service role can manage product images"
on storage.objects
for all
to service_role
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

insert into public.products (
  legacy_id,
  sku,
  slug,
  name,
  price,
  image_url,
  summary,
  description,
  highlights,
  specs,
  ingredients,
  storage,
  serving,
  allergens,
  status,
  is_sold_out,
  sort_order
)
values
  (
    4,
    'MC-MIX-6',
    'assorted-mooncake-6',
    '綜合六入',
    410,
    '/mooncake_6pcs_assorted.png',
    '經典蛋黃酥、麻糬綠豆碰與麻糬魚魚酥一次收藏，適合節慶送禮與多人分享。',
    '綜合六入月餅禮盒包含：經典蛋黃酥 2 入、麻糬綠豆碰 2 入、麻糬魚魚酥 2 入。從鹹甜平衡的蛋黃酥，到帶有麻糬口感的綠豆碰與魚魚酥，讓收禮者一次品嚐三種不同風味。適合作為中秋送禮、節慶拜訪、家庭聚會或辦公室分享的暖心選擇。',
    '["三種人氣口味一次享用", "節慶送禮大方有質感", "適合家庭與多人分享"]'::jsonb,
    '["經典蛋黃酥 2 入", "麻糬綠豆碰 2 入", "麻糬魚魚酥 2 入"]'::jsonb,
    '麵粉、糖、奶油、鹹蛋黃、豆沙、麻糬及各式內餡原料，依實際口味為準。',
    '請放置陰涼乾燥處，避免陽光直射，開封後請盡快食用以維持最佳風味。',
    '建議搭配熱茶、烏龍茶或黑咖啡享用，更能感受月餅層次風味。',
    '本產品含麩質穀物、蛋、奶類，可能含堅果、芝麻等過敏原。',
    'active',
    false,
    10
  ),
  (
    9,
    'MC-EGG-6',
    'egg-yolk-pastry-6',
    '蛋黃酥六入',
    420,
    '/mooncake_6pcs_egg_yolk.png',
    '六入經典蛋黃酥，適合節慶拜訪、家庭分享與企業小禮。',
    '經典蛋黃酥六入盒裝，將熟悉的餅皮香、豆沙甜與鹹蛋黃香氣完整收進禮盒裡。適合中秋送禮、家庭聚會、拜訪親友或辦公室分享，是穩重又不失溫度的經典選擇。',
    '["經典口味大方耐吃", "六入份量適合多人分享", "中秋送禮穩重有心意"]'::jsonb,
    '["經典蛋黃酥 6 入", "適合 3 至 6 人分享", "節慶送禮與辦公室分享皆合適"]'::jsonb,
    '麵粉、糖、奶油、豆沙、鹹蛋黃及各式原料，依實際製作標示為準。',
    '請放置陰涼乾燥處，避免陽光直射，開封後請盡快食用以維持最佳風味。',
    '建議切半後搭配烏龍茶、熱茶或黑咖啡享用，風味更平衡。',
    '本產品含麩質穀物、蛋、奶類，可能含堅果、芝麻等過敏原。',
    'active',
    false,
    20
  ),
  (
    10,
    'MC-MUNG-6',
    'mochi-mungbean-pastry-6',
    '麻酥綠豆酥六入',
    390,
    '/mooncake_6pcs_mochi_mungbean.png',
    '六入麻酥綠豆酥，綠豆香氣清爽、麻糬口感柔和，適合全家分享。',
    '麻酥綠豆酥六入盒裝，適合喜歡清爽豆香與柔軟口感的人。綠豆餡溫和細緻，搭配麻糬增添層次，作為家庭聚會點心或節慶拜訪禮都很合適。',
    '["綠豆餡細緻清爽", "麻糬增添柔軟口感", "六入盒裝適合家庭分享"]'::jsonb,
    '["麻酥綠豆酥 6 入", "適合 3 至 6 人分享", "節慶拜訪與茶點分享皆合適"]'::jsonb,
    '麵粉、糖、奶油、綠豆餡、麻糬及各式原料，依實際製作標示為準。',
    '請放置陰涼乾燥處，避免陽光直射，開封後請盡快食用以維持最佳風味。',
    '建議搭配綠茶、無糖茶或熱飲享用，能呈現更清爽的豆香層次。',
    '本產品含麩質穀物、蛋、奶類，可能含堅果、芝麻等過敏原。',
    'active',
    false,
    30
  ),
  (
    11,
    'MC-FISH-6',
    'mochi-fish-pastry-6',
    '麻糬魚魚酥六入',
    420,
    '/mooncake_6pcs_mochi_fish.png',
    '六入魚魚酥造型可愛，酥香外層搭配麻糬內餡，送禮分享都討喜。',
    '麻糬魚魚酥六入盒裝，以可愛魚魚造型帶出節慶的活潑感。酥香外層與麻糬內餡交織出柔軟又有層次的口感，很適合作為親友拜訪、孩子分享或節慶禮盒選擇。',
    '["魚魚造型活潑有記憶點", "酥香與麻糬口感一次享用", "六入份量適合送禮分享"]'::jsonb,
    '["麻糬魚魚酥 6 入", "適合 3 至 6 人分享", "節慶送禮與親友分享皆合適"]'::jsonb,
    '麵粉、糖、奶油、麻糬、內餡原料及各式原料，依實際製作標示為準。',
    '請放置陰涼乾燥處，避免陽光直射，開封後請盡快食用以維持最佳風味。',
    '建議搭配熱茶、咖啡或無糖飲品享用，能讓酥香與內餡層次更清楚。',
    '本產品含麩質穀物、蛋、奶類，可能含堅果、芝麻等過敏原。',
    'active',
    false,
    40
  ),
  (
    3,
    'MC-MIX-3',
    'assorted-mooncake-3',
    '綜合三入',
    205,
    '/mooncake_3pcs_assorted.png',
    '一次品嚐三種人氣月餅風味，適合自用、嘗鮮與節慶小禮。',
    '綜合三入月餅禮盒包含：經典蛋黃酥 1 入、麻糬綠豆碰 1 入、麻糬魚魚酥 1 入。小巧份量適合想輕鬆品嚐節慶點心的你，也很適合作為拜訪親友、下午茶分享或送給重要的人一份剛剛好的心意。',
    '["三種風味一次品嚐", "小份量輕鬆無負擔", "適合節慶小禮與下午茶"]'::jsonb,
    '["經典蛋黃酥 1 入", "麻糬綠豆碰 1 入", "麻糬魚魚酥 1 入"]'::jsonb,
    '麵粉、糖、奶油、鹹蛋黃、豆沙、麻糬及各式內餡原料，依實際口味為準。',
    '請放置陰涼乾燥處，避免高溫與陽光直射，開封後建議盡快食用。',
    '可搭配熱茶、無糖飲品或咖啡享用，風味更清爽。',
    '本產品含麩質穀物、蛋、奶類，可能含堅果、芝麻等過敏原。',
    'active',
    false,
    50
  ),
  (
    6,
    'MC-EGG-3',
    'egg-yolk-pastry-3',
    '蛋黃酥三入',
    210,
    '/mooncake_3pcs_egg_yolk.png',
    '酥香餅皮包入綿密豆沙與鹹香蛋黃，三入份量剛好適合自用與小禮。',
    '經典蛋黃酥以層次酥香的餅皮、細緻豆沙與鹹香蛋黃呈現中秋最熟悉的風味。三入盒裝適合第一次品嚐、午後茶點，也適合送給重要的人一份不過度負擔的節慶心意。',
    '["經典中秋風味", "鹹甜平衡不膩口", "三入小盒適合嘗鮮與分享"]'::jsonb,
    '["經典蛋黃酥 3 入", "適合 1 至 3 人分享", "節慶小禮與下午茶皆合適"]'::jsonb,
    '麵粉、糖、奶油、豆沙、鹹蛋黃及各式原料，依實際製作標示為準。',
    '請放置陰涼乾燥處，避免高溫與陽光直射，開封後建議盡快食用。',
    '建議搭配烏龍茶、熱茶或黑咖啡享用，能平衡蛋黃酥的濃郁香氣。',
    '本產品含麩質穀物、蛋、奶類，可能含堅果、芝麻等過敏原。',
    'active',
    false,
    60
  ),
  (
    7,
    'MC-MUNG-3',
    'mochi-mungbean-pastry-3',
    '麻酥綠豆酥三入',
    195,
    '/mooncake_3pcs_mochi_mungbean.png',
    '綿密綠豆餡搭配柔軟麻糬，口感溫潤，是清爽耐吃的節慶點心。',
    '麻酥綠豆酥以綿密綠豆餡為主角，加入柔軟麻糬帶出更豐富的咀嚼層次。三入份量輕巧，適合喜歡清爽豆香、想搭配茶飲慢慢享用的朋友。',
    '["綠豆香氣清爽溫和", "麻糬口感柔軟有層次", "三入份量適合小家庭與下午茶"]'::jsonb,
    '["麻酥綠豆酥 3 入", "適合 1 至 3 人分享", "冷藏後風味更清爽"]'::jsonb,
    '麵粉、糖、奶油、綠豆餡、麻糬及各式原料，依實際製作標示為準。',
    '請放置陰涼乾燥處，避免高溫與陽光直射，開封後建議盡快食用。',
    '建議搭配無糖茶、綠茶或熱飲享用，能襯托綠豆餡的細緻香氣。',
    '本產品含麩質穀物、蛋、奶類，可能含堅果、芝麻等過敏原。',
    'active',
    false,
    70
  ),
  (
    8,
    'MC-FISH-3',
    'mochi-fish-pastry-3',
    '麻糬魚魚酥三入',
    210,
    '/mooncake_3pcs_mochi_fish.png',
    '可愛魚魚造型酥點，內餡搭配麻糬口感，適合送禮也適合孩子一起分享。',
    '麻糬魚魚酥以討喜的魚魚造型帶出節慶的可愛感，搭配酥香外層與柔軟麻糬內餡，吃起來有香氣也有咀嚼樂趣。三入份量適合作為小禮、親子分享或下午茶點心。',
    '["魚魚造型可愛討喜", "酥香外層搭配麻糬口感", "適合作為節慶小禮"]'::jsonb,
    '["麻糬魚魚酥 3 入", "適合 1 至 3 人分享", "親友拜訪與下午茶皆合適"]'::jsonb,
    '麵粉、糖、奶油、麻糬、內餡原料及各式原料，依實際製作標示為準。',
    '請放置陰涼乾燥處，避免高溫與陽光直射，開封後建議盡快食用。',
    '建議搭配熱茶、咖啡或無糖飲品享用，讓酥皮香氣更明顯。',
    '本產品含麩質穀物、蛋、奶類，可能含堅果、芝麻等過敏原。',
    'active',
    false,
    80
  )
on conflict (slug) do update set
  legacy_id = excluded.legacy_id,
  sku = excluded.sku,
  name = excluded.name,
  price = excluded.price,
  image_url = excluded.image_url,
  summary = excluded.summary,
  description = excluded.description,
  highlights = excluded.highlights,
  specs = excluded.specs,
  ingredients = excluded.ingredients,
  storage = excluded.storage,
  serving = excluded.serving,
  allergens = excluded.allergens,
  sort_order = excluded.sort_order,
  updated_at = now();
