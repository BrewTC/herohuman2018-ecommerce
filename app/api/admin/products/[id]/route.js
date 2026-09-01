import { NextResponse } from "next/server";
import { getAdminSession, isSameOriginRequest } from "../../../../lib/adminAuth";
import { getProductById, updateProduct } from "../../../../lib/supabaseAdmin";
import { validateProductInput } from "../../../../lib/productValidation";

export async function GET(_request, { params }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "請先登入後台" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ message: "找不到商品" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "無效的操作來源" }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "請先登入後台" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product = validateProductInput(await request.json());
    const updatedProduct = await updateProduct(id, product);
    if (!updatedProduct) {
      return NextResponse.json({ message: "找不到商品" }, { status: 404 });
    }
    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    const isDuplicate = /duplicate key|unique constraint/i.test(error.message);
    return NextResponse.json(
      { message: isDuplicate ? "商品網址代碼或 SKU 已被使用" : error.message },
      { status: isDuplicate ? 409 : 400 }
    );
  }
}
