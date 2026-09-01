"use client";

import { useState } from "react";

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  };

  return (
    <button
      type="button"
      className="admin-logout-button"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "登出中" : "登出"}
    </button>
  );
}
