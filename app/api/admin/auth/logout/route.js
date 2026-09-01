import { NextResponse } from "next/server";
import { clearAdminSession, isSameOriginRequest } from "../../../../lib/adminAuth";

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "無效的登出來源" }, { status: 403 });
  }

  return clearAdminSession(NextResponse.json({ success: true }));
}
