import { ProjectEditor } from "../../ui/admin-editor";

export default function AdminProjectsPage() {
  return <main className="editor"><h1>Manage projects</h1><p className="editor-intro">Add public or private projects without editing source code.</p><ProjectEditor /></main>;
}
