import { NextResponse } from "next/server";
import { getAdminSession, isSameOriginRequest } from "../../../../lib/adminAuth";
import { uploadProductImage } from "../../../../lib/supabaseAdmin";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "無效的操作來源" }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "請先登入後台" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ message: "請選擇商品圖片" }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return NextResponse.json({ message: "圖片只支援 JPG、PNG 或 WebP" }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: "圖片不可超過 4 MB" }, { status: 400 });
    }

    const imageUrl = await uploadProductImage({
      bytes: Buffer.from(await image.arrayBuffer()),
      contentType: image.type,
      fileName: image.name,
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    return NextResponse.json({ message: error.message || "圖片上傳失敗" }, { status: 500 });
  }
}
