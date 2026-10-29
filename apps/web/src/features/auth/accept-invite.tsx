import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { passwordSchema } from "@swiftdrop/contracts";
import { acceptInvitation, errorMessage } from "./client.js";

export function AcceptInvite() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    const value =
      new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    setToken(value);
    if (!value)
      setError(
        "This invitation link is missing or invalid. Ask an administrator to send a new one.",
      );
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || complete) return;
    setError("");
    const valid = passwordSchema.safeParse(password);
    if (!valid.success) {
      setError(valid.error.issues[0]?.message ?? "Choose a valid password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      setNotice((await acceptInvitation(token, password)).message);
      setComplete(true);
      setPassword("");
      setConfirm("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-panel">
      <span className="eyebrow">Staff invitation</span>
      <h1>Set your password</h1>
      <p className="muted">
        Choose a private password. You’ll sign in from the usual login page
        after setup.
      </p>
      {complete ? (
        <div className="notice" role="status">
          <p>{notice}</p>
          <Link to="/auth/login">Go to sign in</Link>
        </div>
      ) : (
        <form onSubmit={(event) => void submit(event)} noValidate>
          <div className="field">
            <label htmlFor="invite-password">Password</label>
            <input
              id="invite-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!token || pending}
              aria-invalid={Boolean(error)}
              aria-describedby="invite-password-hint"
            />
            <p id="invite-password-hint" className="muted">
              At least 15 characters, no common passwords, and at most 72 UTF-8
              bytes.
            </p>
          </div>
          <div className="field">
            <label htmlFor="invite-confirm">Confirm password</label>
            <input
              id="invite-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              disabled={!token || pending}
            />
          </div>
          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}
          <button
            className="primary"
            type="submit"
            disabled={!token || pending}
          >
            {pending ? "Setting password…" : "Set password"}
          </button>
        </form>
      )}
      <p className="muted">
        If you already signed in elsewhere, this action won’t replace that
        session.
      </p>
    </section>
  );
}
