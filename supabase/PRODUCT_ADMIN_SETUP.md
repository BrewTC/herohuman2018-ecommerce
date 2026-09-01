# 喜洛商品後台啟用方式

## 1. 建立商品資料與圖片空間

登入 Supabase Dashboard，開啟 **SQL Editor**，將 `supabase/sql/002_products.sql` 的完整內容貼入並執行。

這份 migration 會建立：

- `products` 商品表
- 商品狀態、排序與必要索引
- 前台只讀取上架商品的 RLS policy
- `product-images` Storage bucket
- 現有八項月餅初始資料

SQL 可以重複執行。再次執行時會更新初始商品內容，但不會覆蓋商品的上架、售完狀態。

## 2. 建立 Supabase Auth 管理員

在 Supabase Dashboard 前往 **Authentication > Users**，新增一位 Email 使用者並設定密碼。

將相同 Email 加入本機 `.env.local` 與 Vercel 的環境變數：

```dotenv
ADMIN_EMAILS=your-admin@example.com
```

多位管理員可以用逗號分隔：

```dotenv
ADMIN_EMAILS=owner@example.com,staff@example.com
```

建議另外設定至少 32 字元的隨機工作階段密鑰：

```dotenv
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
```

未設定時程式會暫時使用 `SUPABASE_SERVICE_ROLE_KEY` 衍生後台工作階段簽章，但正式環境建議使用獨立密鑰。

既有的 `ADMIN_PASSWORD` 不再用於後台登入；密碼由 Supabase Auth 管理。

## 3. 本機測試

```bash
npm run dev
```

開啟：

- 商店首頁：`http://localhost:8080/`
- 後台登入：`http://localhost:8080/admin/login`
- 商品管理：`http://localhost:8080/admin/products`
- 訂單紀錄：`http://localhost:8080/admin/orders`

## 4. Vercel 設定

在 Vercel 專案的 **Settings > Environment Variables** 設定：

- `SUPABASE_URL`
- `SUPABASE_PROJECT_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`
- `ADMIN_SESSION_SECRET`
- 現有 ECPay 環境變數

設定完成後重新部署。`SUPABASE_SERVICE_ROLE_KEY` 與 `ADMIN_SESSION_SECRET` 不可加上 `NEXT_PUBLIC_` 前綴。

## 5. 日常商品維護

1. 進入 `/admin/login` 登入。
2. 在商品管理選擇「新增商品」。
3. 填寫內容並上傳主圖。
4. 先存為草稿預覽，確認後切換為上架。
5. 暫時缺貨時使用「目前售完」，不必刪除商品。
6. 不再販售的商品改為封存，舊訂單仍會保留原始品名與成交價格。
