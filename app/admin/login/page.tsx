"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();

    if (data.success) {
      router.push("/admin");
    } else {
      setError(data.error ?? "오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--color-bg-base)" }}
    >
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">
            Admin
          </p>
          <h1 className="font-heading font-black text-2xl text-text-primary">
            하이프트레이닝클럽
          </h1>
          <p className="text-text-muted text-sm mt-1">관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            autoFocus
            className="w-full rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted border outline-none transition-all text-base"
            style={{
              background: "var(--color-bg-surface)",
              borderColor: "var(--color-border)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-cta w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
