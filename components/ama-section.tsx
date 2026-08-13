'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ArrowRight, Trash2, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { askQuestion, answerQuestion, deleteQuestion } from '@/app/actions/questions'
import type { Question } from '@/lib/db/schema'

function timeAgo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function AmaSection({
  answered,
  inbox,
  admin,
}: {
  answered: Question[]
  inbox: Question[]
  admin: boolean
}) {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [nameOpen, setNameOpen] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function onContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setNameOpen(true)
  }

  async function onSend() {
    if (!name.trim()) return
    setSubmitting(true)
    const fd = new FormData()
    fd.set('name', name.trim())
    fd.set('question', question.trim())
    const res = await askQuestion(fd)
    setSubmitting(false)
    if (res.ok) {
      toast.success('Question sent. It appears once Voss answers.')
      setQuestion('')
      setName('')
      setNameOpen(false)
      router.refresh()
    } else {
      toast.error(res.error || 'Something went wrong.')
    }
  }

  return (
    <section id="ama" className="scroll-mt-24 border-t border-border py-16">
      <div className="mb-2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Ask me anything
      </div>
      <h2 className="mb-3 text-balance text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Drop a question
      </h2>
      <p className="mx-auto mb-8 max-w-md text-pretty text-center text-sm text-muted-foreground">
        A project idea, a vibe-coding question, or just say hi. Answers show up below.
      </p>

      {/* Owner inbox */}
      {admin && inbox.length > 0 && (
        <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <Inbox className="h-4 w-4" />
            Inbox &middot; {inbox.length} waiting
          </div>
          <div className="flex flex-col gap-4">
            {inbox.map((q) => (
              <InboxItem key={q.id} q={q} onDone={() => router.refresh()} />
            ))}
          </div>
        </div>
      )}

      {/* Ask form */}
      <form onSubmit={onContinue} className="mx-auto mb-10 flex max-w-2xl items-center gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={280}
          placeholder="Drop a question..."
          className="h-11 flex-1"
          aria-label="Your question"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Continue">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>

      {/* Answered questions */}
      <div className="mx-auto max-w-2xl">
        {answered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground/70">
            No answered questions yet. Be the first to ask.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {answered.map((q) => (
              <li
                key={q.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{q.askerName}</span>
                  {q.answeredAt && (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {timeAgo(q.answeredAt)}
                    </span>
                  )}
                </div>
                <p className="mb-3 text-pretty text-sm text-muted-foreground">{q.question}</p>
                <div className="flex gap-3 border-l-2 border-foreground/40 pl-3">
                  <p className="text-pretty text-sm text-foreground">{q.answer}</p>
                </div>
                {admin && (
                  <button
                    onClick={async () => {
                      await deleteQuestion(q.id)
                      router.refresh()
                    }}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Name modal */}
      <Dialog open={nameOpen} onOpenChange={setNameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{"What's your name?"}</DialogTitle>
            <DialogDescription>
              Your question will be sent after you enter your name.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                onSend()
              }
            }}
          />
          <Button onClick={onSend} disabled={!name.trim() || submitting} className="w-full gap-2">
            {submitting ? 'Sending...' : 'Send'}
            <Send className="h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function InboxItem({ q, onDone }: { q: Question; onDone: () => void }) {
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{q.askerName}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{timeAgo(q.createdAt)}</span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{q.question}</p>
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer..."
        className="mb-2 min-h-16"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!answer.trim() || busy}
          onClick={async () => {
            setBusy(true)
            const res = await answerQuestion(q.id, answer)
            setBusy(false)
            if (res.ok) {
              toast.success('Answer posted.')
              onDone()
            } else {
              toast.error(res.error || 'Failed.')
            }
          }}
        >
          Post answer
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            await deleteQuestion(q.id)
            onDone()
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
