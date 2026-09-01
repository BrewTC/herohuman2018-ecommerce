import { NextResponse } from "next/server";
import { getStorefrontProducts } from "../../lib/productCatalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { products } = await getStorefrontProducts();
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "商品資料讀取失敗" },
      { status: 500 }
    );
  }
}
