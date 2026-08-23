"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/pending");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brounic-light">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size={56} />
          <div className="text-center">
            <h1 className="text-xl font-medium text-brounic-black">Create your account</h1>
            <p className="text-sm text-gray-500 mt-1">
              An admin will need to approve your account before you can sign in.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Full name</label>
            <input
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Work email</label>
            <input
              required
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Password</label>
            <input
              required
              minLength={8}
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brounic-orange focus:border-brounic-orange"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brounic-black hover:bg-brounic-orange text-white rounded-md py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Request access"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center">
          Already approved?{" "}
          <a href="/login" className="text-brounic-orange underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
