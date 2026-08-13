"use client";

import { useEffect, useRef, useState } from "react";
import { enterAdmin, enterPrivate, type ActionState } from "../actions";

export function LongPressName({ children }: { children: React.ReactNode }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
  };

  return (
    <button
      className="hold-name"
      type="button"
      aria-label="Voss Graves: hold to open access"
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY };
        timer.current = setTimeout(() => {
          cancel();
          window.dispatchEvent(new CustomEvent("open-admin-access"));
        }, 650);
      }}
      onPointerMove={(event) => {
        const origin = start.current;
        if (!origin) return;
        if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) cancel();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
    >
      {children}
    </button>
  );
}

export function AccessGate() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"admin" | "personal" | null>(null);

  useEffect(() => {
    const openAdmin = () => setMode("admin");
    const openPersonal = () => setMode("personal");
    window.addEventListener("open-admin-access", openAdmin);
    window.addEventListener("open-private-access", openPersonal);
    return () => {
      window.removeEventListener("open-admin-access", openAdmin);
      window.removeEventListener("open-private-access", openPersonal);
    };
  }, []);

  useEffect(() => {
    if (mode) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [mode]);

  return (
    <dialog ref={dialog} className="dialog-backdrop" onCancel={() => setMode(null)}>
      <div className="dialog-panel">
        <button className="dialog-close" type="button" onClick={() => setMode(null)} aria-label="Close access dialog">Close</button>
        <h2>{mode === "personal" ? "Personal bio" : "Admin access"}</h2>
        <p>Access expires after 30 minutes. Verification happens on the server.</p>
        <div className="tabs" role="tablist" aria-label="Access type">
          <button type="button" role="tab" aria-selected={mode === "admin"} onClick={() => setMode("admin")}>Admin access</button>
          <button type="button" role="tab" aria-selected={mode === "personal"} onClick={() => setMode("personal")}>Personal bio</button>
        </div>
        {mode === "personal" ? <AccessForm action={enterPrivate} label="Privacy password" /> : <AccessForm action={enterAdmin} label="Admin password" />}
      </div>
    </dialog>
  );
}

function AccessForm({ action, label }: { action: (formData: FormData) => Promise<unknown>; label: string }) {
  const [state, setState] = useState<ActionState>(null);
  const [pending, setPending] = useState(false);

  return (
    <form className="dialog-form" action={async (formData) => {
      setPending(true);
      const result = (await action(formData)) as ActionState;
      if (result) setState(result);
      setPending(false);
    }}>
      <label>
        {label}
        <input className="input" name="password" type="password" autoComplete="current-password" maxLength={256} required />
      </label>
      {state?.message ? <p className={state.ok ? "status" : "status error"} role="alert">{state.message}</p> : null}
      <button className="button" type="submit" disabled={pending}>{pending ? "Checking…" : "Continue"}</button>
    </form>
  );
}
