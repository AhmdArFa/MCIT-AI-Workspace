'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate, StatCard, actionLabel, when } from '@/components/admin/AdminParts'
import { TutWorkspace } from '@/components/admin/TutWorkspace'
import { FileCard } from '@/components/files/FileCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { adminApi } from '@/lib/api/admin'
import { formatBytes, formatTokens } from '@/lib/api/studio'
import { useAuth } from '@/lib/hooks/use-auth'
import { cn } from '@/lib/utils'

function apiError(err: unknown, fallback: string) {
  return (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || fallback
}

function Chats({ userId }: { userId: string }) {
  const { data: chats = [], isLoading } = useQuery({ queryKey: ['admin-chats', userId], queryFn: () => adminApi.chats(userId) })
  const [selected, setSelected] = useState<string | null>(null)
  const { data: messages = [], isFetching } = useQuery({
    queryKey: ['admin-chat', userId, selected],
    queryFn: () => adminApi.chat(userId, selected as string),
    enabled: !!selected,
  })
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (!chats.length) return <p className="text-sm text-muted-foreground">No chats yet.</p>
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
              <span className="truncate text-sm font-medium">{c.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {c.notebook_name || 'Notebook'} · {c.message_count} messages · {when(c.updated)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex min-h-[320px] flex-col gap-3 rounded-xl border border-border bg-card p-4">
        {!selected ? (
          <p className="m-auto text-sm text-muted-foreground">Select a chat to read it.</p>
        ) : isFetching ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">This chat has no messages.</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn('rounded-lg px-3 py-2 text-sm', m.role === 'user' ? 'self-end bg-primary/15 max-w-[80%]' : 'bg-muted max-w-[90%]')}>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">{m.role === 'user' ? 'User' : 'TuT Agent'}</span>
              <MarkdownRenderer>{m.content}</MarkdownRenderer>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function AccountSettings({ userId }: { userId: string }) {
  const qc = useQueryClient()
  const router = useRouter()
  const { user: me } = useAuth()
  const { data } = useQuery({ queryKey: ['admin-user', userId], queryFn: () => adminApi.user(userId) })
  const [password, setPassword] = useState('')
  const [name, setName] = useState<string | null>(null)
  if (!data) return null
  const u = data.user
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-user', userId] })
    qc.invalidateQueries({ queryKey: ['admin-monitoring'] })
  }
  const run = async (fn: () => Promise<unknown>, ok: string, fail: string) => {
    try {
      await fn()
      toast.success(ok)
      refresh()
    } catch (err) {
      toast.error(apiError(err, fail))
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Label htmlFor="dn">Display name</Label>
        <div className="flex gap-2">
          <Input id="dn" value={name ?? u.display_name} onChange={(e) => setName(e.target.value)} />
          <Button variant="outline" disabled={name === null} onClick={() => run(() => adminApi.update(userId, { display_name: name ?? '' }), 'Saved', 'Could not save')}>
            Save
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Label htmlFor="pw">New password</Label>
        <div className="flex gap-2">
          <Input id="pw" type="text" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button
            variant="outline"
            disabled={password.length < 4}
            onClick={() => run(() => adminApi.resetPassword(userId, password).then(() => setPassword('')), 'Password reset', 'Could not reset the password')}
          >
            Reset password
          </Button>
        </div>
      </section>
      <section className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => run(() => adminApi.update(userId, { role: u.role === 'admin' ? 'user' : 'admin' }), 'Role changed', 'Could not change the role')}>
          {u.role === 'admin' ? 'Make member' : 'Make administrator'}
        </Button>
        <Button variant="outline" onClick={() => run(() => adminApi.update(userId, { active: !u.active }), u.active ? 'Account disabled' : 'Account enabled', 'Could not update the account')}>
          {u.active ? 'Disable sign-in' : 'Enable sign-in'}
        </Button>
        {me?.id !== u.id && (
          <Button
            variant="destructive"
            onClick={async () => {
              if (!window.confirm(`Delete ${u.username} and their private workspace? This cannot be undone.`)) return
              try {
                await adminApi.remove(userId)
                toast.success('Account deleted')
                qc.invalidateQueries({ queryKey: ['admin-monitoring'] })
                router.push('/admin')
              } catch (err) {
                toast.error(apiError(err, 'Could not delete the account'))
              }
            }}
          >
            Delete account
          </Button>
        )}
      </section>
    </div>
  )
}

export default function AdminUserPage() {
  const params = useParams<{ id: string }>()
  const userId = decodeURIComponent(params.id)
  const { data, isLoading } = useQuery({ queryKey: ['admin-user', userId], queryFn: () => adminApi.user(userId) })
  const { data: files = [] } = useQuery({ queryKey: ['admin-files', userId], queryFn: () => adminApi.generations(userId) })
  const { data: usage } = useQuery({ queryKey: ['admin-usage', userId], queryFn: () => adminApi.usage(userId) })
  const { data: activity = [] } = useQuery({ queryKey: ['admin-activity', userId], queryFn: () => adminApi.activity(userId) })

  return (
    <AdminGate>
      <AppShell>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
            <Link href="/admin" className="flex items-center gap-1.5 self-start text-sm text-[#F5C242] hover:text-[#ffcf55] transition-colors">
              <ArrowLeft className="h-4 w-4" /> Admin console
            </Link>
            {isLoading || !data ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white">{data.user.display_name || data.user.username}</h1>
                    {data.user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(245,194,66,0.15)] px-2.5 py-0.5 text-xs font-semibold text-[#F5C242] border border-[rgba(245,194,66,0.3)]">
                        Administrator
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[rgba(255,255,255,0.06)] px-2.5 py-0.5 text-xs text-[#b0b5c5]">
                        Member
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8b92a5]">
                    {data.user.username} {!data.user.active && ' · sign-in disabled'} · last sign-in {when(data.user.last_login)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                  <StatCard label="Notebooks" value={data.counts.notebooks} />
                  <StatCard label="Sources" value={data.counts.sources} />
                  <StatCard label="Chats" value={data.counts.chats} />
                  <StatCard label="Files" value={data.counts.generations} hint={formatBytes(data.storage_bytes)} />
                  <StatCard label="Requests" value={formatTokens((data.total_usage ?? data.usage).requests)} hint="TuT AI and TuT Agent" />
                  <StatCard
                    label="Tokens"
                    value={formatTokens((data.total_usage ?? data.usage).input_tokens + (data.total_usage ?? data.usage).output_tokens)}
                    hint="TuT AI and TuT Agent"
                  />
                </div>

                <Tabs defaultValue="chats" className="flex flex-col gap-4">
                  <TabsList className="self-start bg-[rgba(15,18,25,0.8)] border border-[rgba(245,194,66,0.18)] p-1 rounded-xl">
                    <TabsTrigger value="chats" className="data-[state=active]:bg-[#F5C242] data-[state=active]:text-black font-medium transition-all">Chats</TabsTrigger>
                    <TabsTrigger value="files" className="data-[state=active]:bg-[#F5C242] data-[state=active]:text-black font-medium transition-all">Generations</TabsTrigger>
                    <TabsTrigger value="usage" className="data-[state=active]:bg-[#F5C242] data-[state=active]:text-black font-medium transition-all">Usage</TabsTrigger>
                    <TabsTrigger value="tut" className="data-[state=active]:bg-[#F5C242] data-[state=active]:text-black font-medium transition-all">TuT Agent</TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-[#F5C242] data-[state=active]:text-black font-medium transition-all">Activity</TabsTrigger>
                    <TabsTrigger value="account" className="data-[state=active]:bg-[#F5C242] data-[state=active]:text-black font-medium transition-all">Account</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chats">
                    <Chats userId={userId} />
                  </TabsContent>
                  <TabsContent value="files">
                    {files.length === 0 ? (
                      <p className="text-sm text-[#8b92a5]">No generated files yet.</p>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        {files.map((f) => (
                          <FileCard key={f.id} file={f} openAsUser={userId} onDownload={(file) => adminApi.downloadAs(userId, file)} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="usage" className="flex flex-col gap-4">
                    <div className="overflow-x-auto rounded-xl border border-[rgba(245,194,66,0.18)] bg-[rgba(15,18,25,0.7)] backdrop-blur-md">
                      <table className="w-full text-sm">
                        <thead className="bg-[rgba(20,24,35,0.95)] text-left text-xs font-semibold text-[#a0a5b5] border-b border-[rgba(245,194,66,0.15)]">
                          <tr>{['Model', 'Requests', 'Input', 'Output', 'Errors', 'Last used'].map((h) => <th key={h} className="px-4 py-3 font-medium uppercase tracking-wider text-[11px]">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {(usage?.models ?? []).map((m) => (
                            <tr key={`${m.provider}-${m.model}`} className="border-t border-[rgba(255,255,255,0.06)] hover:bg-[rgba(245,194,66,0.04)] transition-colors">
                              <td className="px-4 py-2.5 font-medium text-white">{m.model}</td>
                              <td className="px-4 py-2.5 tabular-nums text-[#e0e2ec]">{m.requests}</td>
                              <td className="px-4 py-2.5 tabular-nums text-[#F5C242]">{formatTokens(m.input_tokens)}</td>
                              <td className="px-4 py-2.5 tabular-nums text-[#F5C242]">{formatTokens(m.output_tokens)}</td>
                              <td className="px-4 py-2.5 tabular-nums text-destructive">{m.errors}</td>
                              <td className="px-4 py-2.5 text-[#8b92a5]">{when(m.last_used)}</td>
                            </tr>
                          ))}
                          {!usage?.models.length && (
                            <tr><td colSpan={6} className="px-4 py-6 text-center text-[#8b92a5]">No model usage in the last 30 days.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  <TabsContent value="tut">
                    <TutWorkspace userId={userId} overview={data.tut} />
                  </TabsContent>
                  <TabsContent value="activity">
                    <ul className="flex flex-col divide-y divide-[rgba(255,255,255,0.06)] rounded-xl border border-[rgba(245,194,66,0.18)] bg-[rgba(15,18,25,0.7)] backdrop-blur-md">
                      {activity.map((a) => (
                        <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-[rgba(245,194,66,0.04)] transition-colors">
                          <span className="font-medium text-[#F5C242]">{actionLabel(a.action)}</span>
                          <span className="text-[#8b92a5]">{when(a.created)}</span>
                        </li>
                      ))}
                      {!activity.length && <li className="px-4 py-6 text-center text-sm text-[#8b92a5]">No activity recorded.</li>}
                    </ul>
                  </TabsContent>
                  <TabsContent value="account">
                    <AccountSettings userId={userId} />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </AppShell>
    </AdminGate>
  )
}
