import { QuestionInbox } from "../../ui/admin-editor";
import { getUnansweredQuestions } from "../../../lib/site";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const questions = await getUnansweredQuestions();
  return <main className="editor"><h1>Answer questions</h1><p className="editor-intro">Answering here publishes the response below the public question form.</p><QuestionInbox questions={questions} /></main>;
}
