# My E-Commerce 專案介紹

這是一個以 Next.js App Router 建立的電商網站範例，主題偏向烘焙與甜點商品銷售。專案目前包含首頁輪播、商品列表、浮動購物車、結帳表單，以及串接綠界 ECPay 付款流程的 API。整體視覺採用柔和烘焙品牌風格，適合做為小型商店、甜點店或個人品牌電商的雛形。

## 專案概覽

- 專案名稱：`my-ecommerce`
- 主要框架：Next.js 15、React 19
- 樣式工具：Tailwind CSS、自訂全域 CSS 變數
- 金流串接：ECPay 綠界科技
- 開發伺服器：`http://localhost:8080`
- 主要語言：JavaScript、JSX、CSS

## 主要功能

### 1. 首頁商品展示

首頁位於 `app/page.js`，由輪播 Banner、商品列表、購物車與頁尾組成。

目前商品資料直接寫在 `app/components/ProductList.js` 中，包含：

- 原味貝果
- 可可貝果
- 3 入月餅
- 6 入月餅
- 千層蛋塔 經典原味

商品卡片支援響應式網格排列，手機為兩欄，平板為三欄，桌機為四欄。

### 2. 輪播 Banner

`app/components/Carousel.js` 使用 `react-slick` 與 `slick-carousel` 實作首頁輪播。輪播目前支援：

- 自動播放
- 無限循環
- 單張圖片切換
- 不同裝置高度調整

### 3. 購物車系統

購物車狀態由 `app/components/CartContext.js` 管理，並在 `app/layout.js` 透過 `CartProvider` 包住全站。

購物車目前支援：

- 加入商品
- 同商品數量累加
- 減少商品數量
- 數量歸零後自動移除
- 計算商品總數
- 計算購物車總金額
- 右下角浮動購物車按鈕
- 側邊滑出式購物車面板

### 4. 結帳頁

結帳頁位於 `app/checkout/page.js`，使用者可填寫：

- 姓名
- 電子郵件
- 電話號碼
- 住址

結帳前會進行基本驗證，例如必填欄位、電子郵件格式、電話號碼格式、購物車金額，以及商品名稱長度。送出後會呼叫 `/api/ecpay` 建立付款資料。

### 5. 綠界 ECPay 金流 API

主要 API 位於 `app/api/ecpay/route.js`，負責：

- 接收前端送出的訂單資料
- 驗證訂單編號、金額、商品名稱與客戶資訊
- 產生綠界需要的交易參數
- 計算 `CheckMacValue`
- 回傳一個 HTML 訂單確認頁
- 透過表單將使用者導向綠界付款頁

專案中也有 `app/api/ecpay/notify.js`，用途是接收綠界付款回調，但目前只記錄回調資料，尚未完整驗證 `CheckMacValue` 或儲存訂單狀態。

## 資料夾結構

```text
.
├── app/
│   ├── api/
│   │   └── ecpay/
│   │       ├── route.js       # App Router 使用的綠界付款 API
│   │       ├── ecpay.js       # 舊式 API handler 寫法，可視情況整理
│   │       └── notify.js      # 綠界付款回調草稿
│   ├── checkout/
│   │   └── page.js            # 結帳頁
│   ├── components/
│   │   ├── Carousel.js        # 首頁輪播
│   │   ├── Cart.js            # 浮動購物車與側邊面板
│   │   ├── CartContext.js     # 購物車全域狀態
│   │   ├── Footer.js          # 頁尾
│   │   ├── Header.js          # 頁首元件，目前首頁未啟用
│   │   └── ProductList.js     # 商品列表
│   ├── globals.css            # 全站樣式與設計變數
│   ├── layout.js              # 全站 layout 與 CartProvider
│   └── page.js                # 首頁
├── public/
│   ├── *_bagel*.jpg           # 貝果商品圖片
│   ├── *_mooncakes*.jpg       # 月餅商品圖片
│   └── resize_image.py        # 圖片尺寸處理腳本
├── package.json               # npm scripts 與相依套件
├── next.config.mjs            # Next.js 設定與環境變數注入
├── tailwind.config.mjs        # Tailwind 設定
├── postcss.config.mjs         # PostCSS 設定
└── README.md                  # create-next-app 預設 README
```

## 技術棧

### 前端

- Next.js App Router
- React Client Components
- React Context
- Tailwind CSS
- react-slick
- slick-carousel

### 後端 API

- Next.js Route Handler
- Node.js `crypto`
- ECPay 綠界付款參數與 `CheckMacValue` 計算

### 其他套件

- `dotenv`：讀取環境變數
- `jquery`：目前列為相依套件，但程式碼中尚未明顯使用
- `ecpay_aio_nodejs`：目前列為相依套件，但主要付款流程使用自寫 API 參數產生邏輯

## 安裝與啟動

先安裝套件：

```bash
npm install
```

啟動開發環境：

```bash
npm run dev
```

專案的 `dev` script 設定為：

```bash
next dev -p 8080
```

因此啟動後請開啟：

```text
http://localhost:8080
```

## 環境變數

若要讓綠界金流正常運作，建議建立 `.env.local`，並設定以下變數：

```bash
ECPAY_MERCHANT_ID=你的商店代號
ECPAY_HASH_KEY=你的 HashKey
ECPAY_HASH_IV=你的 HashIV
ECPAY_PAYMENT_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
ECPAY_RETURN_URL=https://你的網域/api/ecpay/notify
ECPAY_CLIENT_BACK_URL=https://你的網站網址
```

目前 `app/api/ecpay/route.js` 中有部分預設值與正式網址占位，正式上線前應確認所有 URL、商店代號與金鑰都來自安全的環境變數。

## 目前狀態與注意事項

- 商品資料目前寫死在前端元件中，尚未串接資料庫或 CMS。
- 購物車狀態保存在 React state，重新整理頁面後會消失。
- 結帳流程已能產生綠界付款表單，但訂單尚未寫入資料庫。
- `notify.js` 目前尚未匯入 `NextResponse`，若要使用需要先補上 import。
- `notify.js` 尚未驗證綠界回傳的 `CheckMacValue`，正式環境必須補齊。
- 專案同時存在 `tailwind.config.js` 與 `tailwind.config.mjs`、`postcss.config.js` 與 `postcss.config.mjs`，建議後續整理成單一設定檔，降低維護混淆。
- `README.md` 目前仍是 create-next-app 預設內容，可改寫成正式專案 README。

## 建議後續改善

1. 將商品資料抽出為 JSON、資料庫或後台 CMS。
2. 加入購物車 localStorage 保存功能，避免重新整理後清空。
3. 建立訂單資料表，結帳時先建立訂單，再導向付款。
4. 完整實作 ECPay 回調驗證與訂單狀態更新。
5. 移除未使用套件或整合官方 ECPay SDK。
6. 補上 loading、付款成功、付款失敗與訂單查詢頁面。
7. 整理重複設定檔與舊 API 草稿檔案。
8. 補上 ESLint、build 與基本元件測試流程。

## 適合用途

這個專案適合做為：

- 小型甜點店電商網站原型
- Next.js App Router 練習專案
- React Context 購物車功能範例
- 綠界金流串接練習
- 個人品牌商品頁展示與結帳流程 Demo

