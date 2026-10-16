'use client'

import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { FilePanelHost } from '@/components/files/FilePanel'

interface AppShellProps {
  children: React.ReactNode
  hideSidebar?: boolean
}

export function AppShell({ children, hideSidebar = false }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#000000] text-[#ececec]">
      {!hideSidebar && <AppSidebar />}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#000000]">
        <TopBar />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
      </main>
      <FilePanelHost />
    </div>
  )
}
