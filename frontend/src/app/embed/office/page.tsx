'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { filesApi, officeApi } from '@/lib/api/studio'
import { useTheme } from '@/lib/stores/theme-store'

type DocsApi = { DocEditor: new (id: string, config: Record<string, unknown>) => { destroyEditor: () => void } }

declare global {
  interface Window {
    DocsAPI?: DocsApi
  }
}

const scriptLoads = new Map<string, Promise<void>>()

function loadDocsApi(publicUrl: string): Promise<void> {
  const src = `${publicUrl.replace(/\/$/, '')}/web-apps/apps/api/documents/api.js`
  if (window.DocsAPI) return Promise.resolve()
  const existing = scriptLoads.get(src)
  if (existing) return existing
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => {
      scriptLoads.delete(src)
      reject(new Error('ONLYOFFICE Document Server could not be reached'))
    }
    document.head.appendChild(el)
  })
  scriptLoads.set(src, p)
  return p
}

export default function OfficeEmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading editor…
        </div>
      }
    >
      <OfficeEmbedContent />
    </Suspense>
  )
}

function OfficeEmbedContent() {
  const searchParams = useSearchParams()
  const rawId = searchParams.get('id') || ''
  const name = searchParams.get('name') || ''
  const modeParam = searchParams.get('mode') || 'edit'
  const mode = (modeParam === 'view' ? 'view' : 'edit') as 'view' | 'edit'

  const { isDark } = useTheme()
  const holder = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedTitle, setResolvedTitle] = useState(name || rawId)

  useEffect(() => {
    let editor: { destroyEditor: () => void } | null = null
    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        let targetId = rawId

        // If no ID or if ID looks like a Tut Agent ID (file_...) or name is provided, resolve through files list
        if (!targetId || targetId.startsWith('file_') || !/^[a-f0-9]{16}$/.test(targetId)) {
          const files = await filesApi.list()
          const matched = files.find(
            (f) =>
              (targetId && f.id === targetId) ||
              (name && f.filename.toLowerCase() === name.toLowerCase()) ||
              (name && f.title.toLowerCase() === name.toLowerCase()) ||
              (name && name.toLowerCase().includes(f.filename.toLowerCase())) ||
              (name && f.filename.toLowerCase().includes(name.toLowerCase()))
          )
          if (matched) {
            targetId = matched.id
            setResolvedTitle(matched.filename)
          } else if (files.length > 0 && !targetId) {
            targetId = files[0].id
            setResolvedTitle(files[0].filename)
          }
        }

        if (!targetId) {
          throw new Error('No document file specified or found.')
        }

        const { public_url, config } = await officeApi.config(targetId, mode, isDark ? 'dark' : 'light', null)
        await loadDocsApi(public_url)

        if (cancelled || !window.DocsAPI || !holder.current) return

        const elementId = `office-embed-${targetId}`
        holder.current.innerHTML = `<div id="${elementId}" style="width: 100%; height: 100%;"></div>`
        editor = new window.DocsAPI.DocEditor(elementId, config)
        setLoading(false)
      } catch (err: any) {
        if (cancelled) return
        const msg = err?.response?.data?.detail || err?.message || 'ONLYOFFICE editor is unavailable.'
        setError(msg)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      try {
        editor?.destroyEditor()
      } catch {
        /* ignore */
      }
    }
  }, [rawId, name, mode, isDark])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80 text-sm text-muted-foreground backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Opening {resolvedTitle} in ONLYOFFICE…</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 text-center bg-background">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold">{error}</p>
          <p className="text-xs text-muted-foreground">The document could not be loaded into ONLYOFFICE.</p>
        </div>
      )}
      <div ref={holder} className="h-full w-full [&>div]:h-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0" />
    </div>
  )
}
