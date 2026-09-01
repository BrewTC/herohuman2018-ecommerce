import { NextResponse } from "next/server";
import { getAdminSession, isSameOriginRequest } from "../../../lib/adminAuth";
import { createProduct, listAdminProducts } from "../../../lib/supabaseAdmin";
import { validateProductInput } from "../../../lib/productValidation";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "請先登入後台" }, { status: 401 });
  }

  try {
    return NextResponse.json({ products: await listAdminProducts() });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "無效的操作來源" }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "請先登入後台" }, { status: 401 });
  }

  try {
    const product = validateProductInput(await request.json());
    const createdProduct = await createProduct(product);
    return NextResponse.json({ product: createdProduct }, { status: 201 });
  } catch (error) {
    const isDuplicate = /duplicate key|unique constraint/i.test(error.message);
    return NextResponse.json(
      { message: isDuplicate ? "商品網址代碼或 SKU 已被使用" : error.message },
      { status: isDuplicate ? 409 : 400 }
    );
  }
}
