"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const ERROR_MESSAGES: Record<string, string> = {
  PENDING_APPROVAL: "Your account is still awaiting admin approval.",
  ACCOUNT_REJECTED: "Your account request was not approved. Contact an admin.",
  ACCOUNT_SUSPENDED: "Your account has been suspended. Contact an admin.",
  CredentialsSignin: "Incorrect email or password.",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(ERROR_MESSAGES[res.error] || "Unable to sign in.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brounic-light">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size={56} />
          <div className="text-center">
            <h1 className="text-xl font-medium text-brounic-black">Sign in</h1>
            <p className="text-sm text-gray-500 mt-1">Project dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div>
            <label className="block text-sm mb-1 text-brounic-dark">Email</label>
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center">
          No account yet?{" "}
          <a href="/register" className="text-brounic-orange underline">
            Request access
          </a>
        </p>
      </div>
    </div>
  );
}
