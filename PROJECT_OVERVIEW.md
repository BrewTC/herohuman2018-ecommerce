# 喜洛 HeroHuman 專案介紹

喜洛 HeroHuman 是以 Next.js App Router 建立的品牌電商網站，結合月餅商品販售、食農教育內容、食品人工具介紹、ECPay 金流，以及 Supabase 商品與訂單管理。

## 技術架構

- Next.js 15、React 19
- Tailwind CSS 與全域 CSS
- Supabase Database、Auth、Storage
- ECPay AIO 金流
- Vercel 部署

本機開發網址為 `http://localhost:8080`。

## 前台功能

- 月餅商品列表、搜尋及商品詳情彈窗
- 商品售完狀態
- 購物車、數量調整與加入商品通知
- 結帳顧客資料驗證
- ECPay 付款頁導向
- 品牌故事、食品人工具與暫停開放的課程／會員頁
- 全站聯絡資訊、社群連結與 Google Maps

首頁商品優先從 Supabase `products` 讀取。資料庫尚未完成 migration 時，開發環境仍可使用 `app/data/products.js` 的八項月餅資料顯示頁面。

## 商品後台

管理入口為 `/admin/login`，使用 Supabase Auth 驗證帳號，並透過管理員 Email 名單限制權限。

後台目前支援：

- 商品列表
- 新增與編輯商品
- 上傳商品主圖至 Supabase Storage
- 草稿、上架與封存狀態
- 售完標示
- 數字排序
- 前台卡片即時預覽
- 查看最近 50 筆訂單

後台頁面與寫入 API 都需要有效的 HttpOnly 管理員工作階段。`SUPABASE_SERVICE_ROLE_KEY` 只在伺服器端使用。

## 商品與訂單資料

Supabase migration 位於：

- `supabase/sql/001_orders.sql`
- `supabase/sql/002_products.sql`

主要資料表：

- `products`：目前商品內容、價格與上架狀態
- `orders`：訂單主要資料、付款及出貨狀態
- `order_items`：下單當時的品名、單價、數量與小計快照
- `order_events`：建立訂單與 ECPay 通知歷程

商品價格修改後不會影響舊訂單，因為成交內容會保存於 `order_items`。

## 結帳安全

前端結帳只提交商品 ID 與數量。`/api/ecpay` 會在伺服器端重新取得正式商品資料、檢查商品是否上架或售完，並重新計算總金額後才建立訂單及產生 ECPay 付款參數。

ECPay 付款通知由 `/api/ecpay/notify` 驗證 `CheckMacValue`，再更新訂單付款狀態並寫入事件紀錄。

## 主要目錄

```text
app/
├── admin/                    # 管理員登入、商品及訂單頁
├── api/admin/                # 後台登入、商品 CRUD、圖片上傳 API
├── api/ecpay/                # 商品／課程付款與付款通知 API
├── components/               # 前台、購物車與後台共用元件
├── data/                     # 本機商品 fallback 與課程資料
├── lib/                      # Supabase、商品目錄、驗證與管理員工作階段
├── apps/                     # 食品人工具頁
├── about/                    # 品牌故事
├── checkout/                 # 結帳頁
└── page.js                   # 首頁 Server Component

supabase/
├── sql/                      # Database migrations
└── PRODUCT_ADMIN_SETUP.md    # 商品後台啟用步驟
```

## 開發指令

```bash
npm install
npm run dev
npm run lint
npm run build:local
```

正式建置使用：

```bash
npm run build
```

## 啟用商品後台

完整步驟請閱讀 `supabase/PRODUCT_ADMIN_SETUP.md`，內容包含：

1. 執行商品 migration。
2. 建立 Supabase Auth 管理員。
3. 設定 `ADMIN_EMAILS` 與 `ADMIN_SESSION_SECRET`。
4. 設定 Vercel 環境變數。
5. 登入後台新增及維護商品。

## 尚未納入的功能

- 商品多規格與多張圖片
- 即時庫存扣除
- 分類、促銷折扣與優惠券
- 批次匯入及銷售報表
- 後台修改訂單出貨狀態
- 購物車跨重新整理保存

這些功能可在商品後台與正式訂單流程穩定後分階段加入。
