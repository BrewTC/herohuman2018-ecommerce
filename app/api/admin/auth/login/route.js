import { NextResponse } from "next/server";
import {
  authenticateAdmin,
  isSameOriginRequest,
  setAdminSession,
} from "../../../../lib/adminAuth";

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "無效的登入來源" }, { status: 403 });
  }

  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: "請填寫 Email 與密碼" }, { status: 400 });
    }

    const { token, user } = await authenticateAdmin(email, password);
    const response = NextResponse.json({ user });
    return setAdminSession(response, token);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "登入失敗" },
      { status: 401 }
    );
  }
}
