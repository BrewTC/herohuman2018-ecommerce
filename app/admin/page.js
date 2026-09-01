import { redirect } from "next/navigation";
import { requireAdmin } from "../lib/adminAuth";

export default async function AdminPage() {
  await requireAdmin();
  redirect("/admin/products");
}
