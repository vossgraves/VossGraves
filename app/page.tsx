import { AccessGate, LongPressName } from "./ui/access-gate";
import { QuestionForm } from "./ui/question-form";
import { TimeWidget } from "./ui/time-widget";
import { ParticleField } from "./ui/particle-field";
import { getPublicData } from "../lib/site";

export const dynamic = "force-dynamic";

const links = [
  ["GitHub", "https://github.com/Vossgraves"],
  ["YouTube", "https://youtube.com/@VossGraves"],
  ["Telegram", "https://t.me/ashengraves"],
  ["Discord", "https://discordapp.com/users/642189128812724225"],
  ["Instagram", "https://instagram.com/leongraved"],
] as const;

export default async function HomePage() {
  const data = await getPublicData();
  return (
    <main className="site-shell">
      <ParticleField />
      <div className="container content-layer">
        <header className="site-header">
          <a className="brand" href="#top">
            <img className="brand-avatar" src="https://github.com/Vossgraves.png" width="32" height="32" alt="Voss Graves avatar" loading="eager" />
            <span>Voss Graves</span>
          </a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="#about">Home</a>
            <a href="#love">Stuff I love</a>
            <a href="#projects">Projects</a>
            <a href="#ask">Ask me</a>
          </nav>
        </header>

        <section className="hero" id="top">
          <div>
            <div className="eyebrow">Noob vibe coder</div>
            <h1><LongPressName>{data.profile.name}</LongPressName></h1>
            <p className="lede">{data.profile.bio}</p>
          </div>
          <TimeWidget />
        </section>

        <section className="section" id="about">
          <div className="section-heading"><div><h2>Build openly.</h2><p className="section-subtitle">Useful things, without the noise.</p></div></div>
          <p className="lede">{data.profile.tagline} — shipping small, free, open-source projects with a little help from AI.</p>
        </section>

        <section className="section" id="love">
          <div className="section-heading"><div><h2>Stuff I love</h2><p className="section-subtitle">The principles behind the projects.</p></div></div>
          <div className="grid">
            {data.interests.map((interest) => <article className="card" key={interest.id}><h3>{interest.title}</h3><p>{interest.description}</p></article>)}
          </div>
        </section>

        <section className="section" id="projects">
          <div className="section-heading"><div><h2>Projects</h2><p className="section-subtitle">Small tools, shipped simply.</p></div></div>
          <div className="grid">
            {data.projects.map((project) => <article className="card project-card" key={project.id}><div><h3>{project.name}</h3><p>{project.description}</p></div><a href={project.href} target="_blank" rel="noreferrer">Open project ↗</a></article>)}
          </div>
        </section>

        <section className="section" id="ask">
          <div className="section-heading"><div><h2>Ask me anything</h2><p className="section-subtitle">A project idea, a vibe-coding question, or just say hi.</p></div></div>
          <QuestionForm />
          {data.questions.length ? <div className="answers">{data.questions.map((question) => <article className="answer" key={question.id}><p><strong>{question.prompt}</strong></p><p>{question.answer}</p></article>)}</div> : <p className="status">No answered questions yet. Be the first to ask.</p>}
        </section>

        <footer className="site-footer">
          <div>Find me</div>
          <div className="footer-links">{links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label}</a>)}</div>
          <p>© {new Date().getFullYear()} Voss Graves · vibe coded</p>
        </footer>
      </div>
      <AccessGate />
    </main>
  );
}
