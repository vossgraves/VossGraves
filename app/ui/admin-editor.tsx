"use client";

import { useActionState } from "react";
import { addProject, answerQuestion, savePersonalContent, savePublicContent, type ActionState } from "../actions";
import type { PersonalData, SiteData } from "../../lib/site";

function Result({ state }: { state: ActionState }) {
  return state?.message ? <p className={state.ok ? "status" : "status error"} role="status">{state.message}</p> : null;
}

function InterestFields({ prefix, interests }: { prefix: string; interests: { title: string; description: string }[] }) {
  return <>
    {interests.slice(0, 3).map((interest, index) => {
      const position = index + 1;
      return <fieldset className="editor-card" key={`${prefix}-${position}`}>
        <h2>{prefix === "public" ? "Public" : "Private"} interest {position}</h2>
        <div className="field"><label>Title<input className="input" name={`interest_${position}_title`} defaultValue={interest.title} maxLength={120} required /></label></div>
        <div className="field"><label>Description<textarea className="textarea" name={`interest_${position}_description`} defaultValue={interest.description} maxLength={500} rows={3} required /></label></div>
      </fieldset>;
    })}
  </>;
}

export function PublicEditor({ data }: { data: SiteData }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(savePublicContent, null);
  return <form className="editor-form" action={formAction}>
    <div className="editor-card"><h2>Public profile</h2>
      <div className="field-grid">
        <div className="field"><label>Public name<input className="input" name="name" defaultValue={data.profile.name} maxLength={80} required /></label></div>
        <div className="field"><label>Tagline<input className="input" name="tagline" defaultValue={data.profile.tagline} maxLength={160} required /></label></div>
      </div>
      <div className="field"><label>Bio<textarea className="textarea" name="bio" defaultValue={data.profile.bio} maxLength={2000} rows={5} required /></label></div>
    </div>
    <InterestFields prefix="public" interests={data.interests} />
    <div className="editor-actions"><button className="button" type="submit" disabled={pending}>{pending ? "Saving…" : "Save public changes"}</button><Result state={state} /></div>
  </form>;
}

export function PersonalEditor({ data }: { data: PersonalData }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(savePersonalContent, null);
  return <form className="editor-form" action={formAction}>
    <div className="editor-card"><h2>Private profile</h2>
      <div className="field"><label>Private tagline<input className="input" name="tagline" defaultValue={data.profile.tagline} maxLength={160} required /></label></div>
      <div className="field"><label>Private bio<textarea className="textarea" name="bio" defaultValue={data.profile.bio} maxLength={2000} rows={5} required /></label></div>
    </div>
    <InterestFields prefix="personal" interests={data.interests} />
    <div className="editor-actions"><button className="button" type="submit" disabled={pending}>{pending ? "Saving…" : "Save private changes"}</button><Result state={state} /></div>
  </form>;
}

export function ProjectEditor() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addProject, null);
  return <form className="editor-form" action={formAction}>
    <div className="editor-card"><h2>Add project</h2>
      <div className="field-grid">
        <div className="field"><label>Name<input className="input" name="name" maxLength={120} required /></label></div>
        <div className="field"><label>Visibility<select className="select" name="visibility" defaultValue="public"><option value="public">Public</option><option value="personal">Personal</option></select></label></div>
      </div>
      <div className="field"><label>Description<input className="input" name="description" maxLength={500} required /></label></div>
      <div className="field"><label>Link<input className="input" name="href" type="url" placeholder="https://" maxLength={500} required /></label></div>
    </div>
    <div className="editor-actions"><button className="button" type="submit" disabled={pending}>{pending ? "Adding…" : "Add project"}</button><Result state={state} /></div>
  </form>;
}

export function QuestionInbox({ questions }: { questions: SiteData["questions"] }) {
  return <div className="answers">{questions.length ? questions.map((question) => <QuestionAnswer key={question.id} question={question} />) : <p className="status">No unanswered questions.</p>}</div>;
}

function QuestionAnswer({ question }: { question: SiteData["questions"][number] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(answerQuestion, null);
  return <form className="editor-card" action={formAction}>
    <h2>Question</h2>
    <p>{question.prompt}</p>
    <input type="hidden" name="id" value={question.id} />
    <div className="field"><label>Answer<textarea className="textarea" name="answer" maxLength={2000} rows={4} required /></label></div>
    <div className="editor-actions"><button className="button" type="submit" disabled={pending}>{pending ? "Saving…" : "Post answer"}</button><Result state={state} /></div>
  </form>;
}
