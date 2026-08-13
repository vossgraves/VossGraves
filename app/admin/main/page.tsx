import { PublicEditor } from "../../ui/admin-editor";
import { getPublicData } from "../../../lib/site";

export const dynamic = "force-dynamic";

export default async function AdminMainPage() {
  const data = await getPublicData();
  return <main className="editor"><h1>Edit public page</h1><p className="editor-intro">These fields are stored in Neon and rendered on the public home page.</p><PublicEditor data={data} /></main>;
}
