import { PersonalEditor } from "../../ui/admin-editor";
import { getPersonalData } from "../../../lib/site";

export const dynamic = "force-dynamic";

export default async function AdminPersonalPage() {
  const data = await getPersonalData();
  return <main className="editor"><h1>Edit personal bio</h1><p className="editor-intro">This content is separate from the public table and appears only after personal-password verification.</p><PersonalEditor data={data} /></main>;
}
