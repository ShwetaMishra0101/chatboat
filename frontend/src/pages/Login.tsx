import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveUser } from "../api.ts";
import ThemeSwitcher from "../components/ThemeSwitcher.tsx";
import SocialButtons from "../components/SocialButtons.tsx";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
      {children} <span className="text-[var(--accent)]">*</span>
    </label>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login({ email, password });
      saveUser(user);
      navigate("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-14">
      <div className="fixed right-4 top-4 z-50">
        <ThemeSwitcher />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-xl flex-col rounded-3xl bg-[var(--surface)] p-8 shadow-xl sm:p-10"
      >
        <h1 className="mb-8 text-center text-3xl font-extrabold text-[var(--text)]">Sign In</h1>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 px-3 py-2.5 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <div className="mb-5">
          <Label>Email Address</Label>
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email address" />
        </div>

        <div className="mb-8">
          <Label>Password</Label>
          <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--accent)] py-3.5 text-sm font-bold uppercase tracking-wide text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <SocialButtons />

        <p className="mt-6 text-center text-sm text-[var(--text)]">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold uppercase text-[var(--accent)] underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
