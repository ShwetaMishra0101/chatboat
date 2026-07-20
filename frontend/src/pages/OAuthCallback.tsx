import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginWithToken } from "../api.ts";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    const err = params.get("error");

    if (err) {
      setError(err);
      return;
    }
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    loginWithToken(token)
      .then(() => navigate("/chat", { replace: true }))
      .catch((e) => setError(e instanceof Error ? e.message : "Login failed"));
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] px-4 text-center">
      {error ? (
        <>
          <p className="text-[var(--text)]">Social login failed: {error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] hover:bg-[var(--accent-hover)]"
          >
            Back to login
          </button>
        </>
      ) : (
        <p className="text-[var(--muted)]">Signing you in…</p>
      )}
    </div>
  );
}
