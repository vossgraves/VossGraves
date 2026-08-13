import { exitAccess } from "../actions";
import { requireScope } from "../../lib/auth";
import { getPersonalData } from "../../lib/site";

export const dynamic = "force-dynamic";

export default async function PersonalPage() {
  await requireScope("personal");
  const data = await getPersonalData();
  return (
    <main className="site-shell">
      <div className="container">
        <header className="site-header">
          <a className="brand" href="/">Voss Graves</a>
          <form action={exitAccess}><button className="chip" type="submit">Sign out</button></form>
        </header>
        <section className="hero">
          <div>
            <div className="eyebrow">Private space</div>
            <h1>{data.profile.tagline}</h1>
            <p className="lede">{data.profile.bio}</p>
          </div>
        </section>
        <section className="section">
          <div className="section-heading"><div><h2>Private interests</h2><p className="section-subtitle">Visible only after server-side verification.</p></div></div>
          <div className="grid">{data.interests.map((interest) => <article className="card" key={interest.id}><h3>{interest.title}</h3><p>{interest.description}</p></article>)}</div>
        </section>
        <section className="section">
          <div className="section-heading"><div><h2>Personal projects</h2><p className="section-subtitle">Private builds and works in progress.</p></div></div>
          {data.projects.length ? <div className="grid">{data.projects.map((project) => <article className="card project-card" key={project.id}><div><h3>{project.name}</h3><p>{project.description}</p></div><a href={project.href} target="_blank" rel="noreferrer">Open project ↗</a></article>)}</div> : <p className="status">No private projects yet.</p>}
        </section>
      </div>
    </main>
  );
}
