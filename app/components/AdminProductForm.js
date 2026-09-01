"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMPTY_PRODUCT = {
  sku: "",
  slug: "",
  name: "",
  price: 0,
  imageUrl: "",
  summary: "",
  description: "",
  highlights: [],
  specs: [],
  ingredients: "",
  storage: "",
  serving: "",
  allergens: "",
  status: "draft",
  isSoldOut: false,
  sortOrder: 0,
};

function listToText(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function textToList(value) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export default function AdminProductForm({ product = null }) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({ ...EMPTY_PRODUCT, ...product }));
  const [highlightsText, setHighlightsText] = useState(() => listToText(product?.highlights));
  const [specsText, setSpecsText] = useState(() => listToText(product?.specs));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(product?.id);

  const preview = useMemo(
    () => ({
      name: form.name || "商品名稱預覽",
      price: Number(form.price) || 0,
      imageUrl: form.imageUrl,
      summary: form.summary || "填寫商品簡介後，這裡會顯示前台卡片內容。",
    }),
    [form]
  );

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const uploadData = new FormData();
      uploadData.append("image", file);
      const response = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: uploadData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "圖片上傳失敗");
      setForm((current) => ({ ...current, imageUrl: result.imageUrl }));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        sortOrder: Number(form.sortOrder),
        highlights: textToList(highlightsText),
        specs: textToList(specsText),
      };
      const response = await fetch(
        isEditing ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "商品儲存失敗");

      router.push("/admin/products");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-product-editor" onSubmit={handleSubmit}>
      <div className="admin-product-form-fields">
        <section className="admin-form-section">
          <div className="admin-section-heading">
            <span>01</span>
            <div>
              <h2>基本資料</h2>
              <p>設定顧客會先看到的商品名稱、售價與簡介。</p>
            </div>
          </div>
          <div className="admin-form-grid two-columns">
            <label>
              <span>商品名稱 *</span>
              <input name="name" value={form.name} onChange={updateField} required />
            </label>
            <label>
              <span>售價（NT$）*</span>
              <input name="price" type="number" min="0" step="1" value={form.price} onChange={updateField} required />
            </label>
            <label>
              <span>SKU</span>
              <input name="sku" value={form.sku || ""} onChange={updateField} placeholder="例如 MC-MIX-6" />
            </label>
            <label>
              <span>商品網址代碼</span>
              <input name="slug" value={form.slug} onChange={updateField} placeholder="例如 assorted-mooncake-6" />
              <small>可留白自動建立，只能使用小寫英文、數字與連字號。</small>
            </label>
          </div>
          <label>
            <span>商品簡介</span>
            <textarea name="summary" rows="3" value={form.summary} onChange={updateField} />
          </label>
          <label>
            <span>完整說明</span>
            <textarea name="description" rows="6" value={form.description} onChange={updateField} />
          </label>
        </section>

        <section className="admin-form-section">
          <div className="admin-section-heading">
            <span>02</span>
            <div>
              <h2>商品主圖</h2>
              <p>支援 JPG、PNG、WebP，單張圖片上限 4 MB。</p>
            </div>
          </div>
          <div className="admin-image-control">
            <label className="admin-upload-button">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={uploading} />
              {uploading ? "圖片上傳中..." : "選擇並上傳圖片"}
            </label>
            <label className="admin-image-url-field">
              <span>圖片網址</span>
              <input name="imageUrl" value={form.imageUrl} onChange={updateField} placeholder="上傳後會自動填入，也可使用現有網址" />
            </label>
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-section-heading">
            <span>03</span>
            <div>
              <h2>特色與規格</h2>
              <p>每行填寫一項，前台會自動整理成清單。</p>
            </div>
          </div>
          <div className="admin-form-grid two-columns">
            <label>
              <span>商品特色</span>
              <textarea rows="5" value={highlightsText} onChange={(event) => setHighlightsText(event.target.value)} placeholder={"三種人氣口味一次享用\n適合節慶送禮"} />
            </label>
            <label>
              <span>商品規格</span>
              <textarea rows="5" value={specsText} onChange={(event) => setSpecsText(event.target.value)} placeholder={"蛋黃酥 2 入\n綠豆酥 2 入"} />
            </label>
          </div>
          <div className="admin-form-grid two-columns">
            <label>
              <span>主要成分</span>
              <textarea name="ingredients" rows="4" value={form.ingredients} onChange={updateField} />
            </label>
            <label>
              <span>保存方式</span>
              <textarea name="storage" rows="4" value={form.storage} onChange={updateField} />
            </label>
            <label>
              <span>建議食用方式</span>
              <textarea name="serving" rows="4" value={form.serving} onChange={updateField} />
            </label>
            <label>
              <span>過敏原提醒</span>
              <textarea name="allergens" rows="4" value={form.allergens} onChange={updateField} />
            </label>
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-section-heading">
            <span>04</span>
            <div>
              <h2>上架設定</h2>
              <p>草稿不會顯示在商店；封存適合保留歷史商品。</p>
            </div>
          </div>
          <div className="admin-form-grid two-columns">
            <label>
              <span>商品狀態</span>
              <select name="status" value={form.status} onChange={updateField}>
                <option value="draft">草稿</option>
                <option value="active">上架</option>
                <option value="archived">封存</option>
              </select>
            </label>
            <label>
              <span>排序數字</span>
              <input name="sortOrder" type="number" min="0" step="1" value={form.sortOrder} onChange={updateField} />
              <small>數字越小越前面，例如 10、20、30。</small>
            </label>
          </div>
          <label className="admin-checkbox-field">
            <input name="isSoldOut" type="checkbox" checked={form.isSoldOut} onChange={updateField} />
            <span>目前售完，保留商品但停用加入購物車</span>
          </label>
        </section>

        {error && <p className="admin-form-error" role="alert">{error}</p>}
        <div className="admin-form-actions">
          <Link href="/admin/products" className="btn-secondary">取消</Link>
          <button type="submit" className="btn-primary" disabled={saving || uploading}>
            {saving ? "儲存中..." : isEditing ? "儲存商品" : "建立商品"}
          </button>
        </div>
      </div>

      <aside className="admin-product-preview">
        <p className="page-kicker">Store Preview</p>
        <h2>前台卡片預覽</h2>
        <div className="admin-preview-card">
          <div className="admin-preview-image">
            {preview.imageUrl ? (
              <img src={preview.imageUrl} alt="商品主圖預覽" />
            ) : (
              <span>尚未上傳圖片</span>
            )}
            {form.isSoldOut && <strong>已售完</strong>}
          </div>
          <h3>{preview.name}</h3>
          <p className="admin-preview-price">NT$ {preview.price}</p>
          <p>{preview.summary}</p>
        </div>
      </aside>
    </form>
  );
}
