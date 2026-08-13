import { exitAccess } from "../actions";
import { requireScope } from "../../lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireScope("admin");
  return <div className="admin-shell">
    <div className="admin-nav"><div className="container admin-nav-inner">
      <a className="brand" href="/admin/main">Voss Graves admin</a>
      <nav className="admin-nav-links" aria-label="Admin navigation">
        <a className="chip" href="/admin/main">Public</a>
        <a className="chip" href="/admin/personal">Personal</a>
        <a className="chip" href="/admin/projects">Projects</a>
        <a className="chip" href="/admin/questions">Questions</a>
        <a className="chip" href="/personal">View private</a>
        <form action={exitAccess}><button className="chip" type="submit">Sign out</button></form>
      </nav>
    </div></div>
    <div className="container">{children}</div>
  </div>;
}
