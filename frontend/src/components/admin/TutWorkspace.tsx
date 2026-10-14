'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { StatCard, when } from '@/components/admin/AdminParts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { adminApi, type TutOverview } from '@/lib/api/admin'
import { formatBytes, formatTokens } from '@/lib/api/studio'
import { cn } from '@/lib/utils'

function apiError(err: unknown) {
  return (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Tut Agent did not answer.'
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function TutChats({ userId }: { userId: string }) {
  const { data: chats = [], isLoading, error } = useQuery({ queryKey: ['admin-tut-chats', userId], queryFn: () => adminApi.tut.chats(userId) })
  const [selected, setSelected] = useState<string | null>(null)
  const { data: messages = [], isFetching } = useQuery({
    queryKey: ['admin-tut-chat', userId, selected],
    queryFn: () => adminApi.tut.chat(userId, selected as string),
    enabled: !!selected,
  })
  if (isLoading) return <Muted>Loading…</Muted>
  if (error) return <Muted>{apiError(error)}</Muted>
  if (!chats.length) return <Muted>No Tut Agent chats yet.</Muted>
  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <ul className="flex flex-col gap-1">
        {chats.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setSelected(c.id)}
              className={cn('flex w-full flex-col rounded-lg border px-3 py-2 text-left', selected === c.id ? 'border-primary/60 bg-muted' : 'border-border hover:bg-muted/50')}
            >
              <span className="truncate text-sm font-medium">{c.title || 'Untitled chat'}</span>
              <span className="truncate text-xs text-muted-foreground">
                {c.messageCount} messages · {when(c.updatedAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex min-h-[320px] flex-col gap-3 rounded-xl border border-border bg-card p-4">
        {!selected ? (
          <p className="m-auto text-sm text-muted-foreground">Select a chat to read it.</p>
        ) : isFetching ? (
          <Muted>Loading…</Muted>
        ) : messages.length === 0 ? (
          <Muted>This chat has no messages.</Muted>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn('rounded-lg px-3 py-2 text-sm', m.role === 'user' ? 'max-w-[80%] self-end bg-primary/15' : 'max-w-[90%] bg-muted')}>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                {m.role === 'user' ? 'User' : 'Tut Agent'}
                {m.role !== 'user' && m.usage?.totalTokens ? ` · ${formatTokens(m.usage.totalTokens)} tokens` : ''}
              </span>
              <MarkdownRenderer>{m.content || ''}</MarkdownRenderer>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function TutFiles({ userId }: { userId: string }) {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['admin-tut-files', userId], queryFn: () => adminApi.tut.files(userId) })
  if (isLoading) return <Muted>Loading…</Muted>
  if (error) return <Muted>{apiError(error)}</Muted>
  if (!data.length) return <Muted>No files in Tut Agent yet.</Muted>
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {data.map((f) => (
        <li key={f.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
          <span className="min-w-0 truncate">{f.name}</span>
          <span className="shrink-0 text-muted-foreground">
            {formatBytes(f.size)} · {when(f.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function TutGenerations({ userId }: { userId: string }) {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['admin-tut-generations', userId], queryFn: () => adminApi.tut.generations(userId) })
  if (isLoading) return <Muted>Loading…</Muted>
  if (error) return <Muted>{apiError(error)}</Muted>
  if (!data.length) return <Muted>No image or video generations in Tut Agent yet.</Muted>
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {data.map((g) => (
        <li key={g.id} className="flex flex-col gap-0.5 px-4 py-2.5 text-sm">
          <span className="line-clamp-2">{g.prompt}</span>
          <span className="text-xs text-muted-foreground">
            {g.model} · {when(g.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function TutUsage({ userId }: { userId: string }) {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['admin-tut-usage', userId], queryFn: () => adminApi.tut.usage(userId) })
  if (isLoading) return <Muted>Loading…</Muted>
  if (error) return <Muted>{apiError(error)}</Muted>
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
          <tr>{['Model', 'Replies', 'Input', 'Output', 'Total'].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={`${m.provider}-${m.model}`} className="border-t border-border">
              <td className="px-4 py-2.5">{m.model || 'Unknown model'}</td>
              <td className="px-4 py-2.5 tabular-nums">{m.requests}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatTokens(Number(m.inputTokens))}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatTokens(Number(m.outputTokens))}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatTokens(Number(m.totalTokens))}</td>
            </tr>
          ))}
          {!data.length && (
            <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No Tut Agent usage yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** One person's Tut Agent workspace: chats, files, generations and token usage. */
export function TutWorkspace({ userId, overview }: { userId: string; overview?: TutOverview }) {
  if (overview && !overview.available) return <Muted>Tut Agent is not connected to the admin console.</Muted>
  if (overview && !overview.linked) return <Muted>This person has not opened Tut Agent yet.</Muted>
  const counts = overview?.counts
  const usage = overview?.usage
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tut chats" value={counts?.chats ?? '—'} />
        <StatCard label="Tut files" value={counts?.files ?? '—'} />
        <StatCard label="Tut generations" value={counts?.generations ?? '—'} />
        <StatCard label="Tut tokens" value={usage ? formatTokens(usage.total_tokens || usage.input_tokens + usage.output_tokens) : '—'} />
      </div>
      <Tabs defaultValue="chats" className="flex flex-col gap-4">
        <TabsList className="self-start">
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="generations">Generations</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="chats"><TutChats userId={userId} /></TabsContent>
        <TabsContent value="files"><TutFiles userId={userId} /></TabsContent>
        <TabsContent value="generations"><TutGenerations userId={userId} /></TabsContent>
        <TabsContent value="usage"><TutUsage userId={userId} /></TabsContent>
      </Tabs>
    </div>
  )
}
