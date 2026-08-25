"use client";

import { useState } from "react";

export default function AccountPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setSuccess(true);
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-lg font-medium text-brounic-black">Change Password</h1>
        <p className="text-sm text-gray-500 mt-1">Update the password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
        <div>
          <label className="block text-sm mb-1 text-brounic-dark">Current password</label>
          <input
            required
            type="password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-brounic-dark">New password</label>
          <input
            required
            minLength={8}
            type="password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-brounic-dark">Confirm new password</label>
          <input
            required
            minLength={8}
            type="password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">Password updated successfully.</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-brounic-black hover:bg-brounic-orange text-white rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
