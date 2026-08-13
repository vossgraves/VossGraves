"use client";

import { useActionState } from "react";
import { askQuestion, type ActionState } from "../actions";

export function QuestionForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(askQuestion, null);
  return (
    <form className="question-form" action={formAction}>
      <input className="input" name="prompt" placeholder="Drop a question..." maxLength={1000} required />
      <button className="button" type="submit" disabled={pending}>{pending ? "Sending…" : "Ask"}</button>
      {state?.message ? <p className={state.ok ? "status" : "status error"} role="status">{state.message}</p> : null}
    </form>
  );
}
