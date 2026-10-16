const fs = require('fs');

console.log('=== Patching Frontend Tut Page ===');

const clientChunk = '/app/frontend/.next/static/chunks/2ih891jj9ldi0.js';
if (fs.existsSync(clientChunk)) {
  let content = fs.readFileSync(clientChunk, 'utf8');
  const target = `function l(){let e=(0,s.useSearchParams)(),{data:a="",isLoading:l}=(0,n.useQuery)({queryKey:["tut-url"],queryFn:r.tutApi.url,staleTime:1/0}),u=e.get("notebook"),m=a?\`\${a}/\`:"";return(0,t.jsx)(o.AppShell,{children:(0,t.jsxs)("div",{className:"flex h-full min-h-0 flex-col",children:[(0,t.jsxs)("header",{className:"flex h-14 shrink-0 items-center gap-3 border-b border-border px-5",children:[(0,t.jsx)(d.TutAvatar,{size:28}),(0,t.jsxs)("div",{className:"flex min-w-0 flex-col",children:[(0,t.jsx)("span",{className:"text-sm font-semibold",children:"Tut Agent"}),(0,t.jsx)("span",{className:"truncate text-xs text-muted-foreground",children:u?"Ask Tut to work with this notebook: its MCIT AI tools can read it.":"Plans and runs multi-step work across your notebooks, files and Studio."})]}),a&&(0,t.jsx)(c.Button,{asChild:!0,size:"sm",variant:"outline",className:"ml-auto",children:(0,t.jsxs)("a",{href:m,target:"_blank",rel:"noreferrer",children:[(0,t.jsx)(i.ExternalLink,{className:"mr-1.5 h-4 w-4"})," Open in a new window"]})})]}),(0,t.jsx)("div",{className:"min-h-0 flex-1",children:l?null:a?(0,t.jsx)("iframe",{title:"Tut Agent",src:m,className:"h-full w-full border-0 bg-background",allow:"clipboard-read; clipboard-write; microphone; camera"}):(0,t.jsxs)("div",{className:"flex h-full flex-col items-center justify-center gap-3 p-8 text-center",children:[(0,t.jsx)(d.TutAvatar,{size:72}),(0,t.jsx)("h1",{className:"text-xl font-semibold",children:"Tut Agent is not connected yet"}),(0,t.jsx)("p",{className:"max-w-md text-sm text-muted-foreground",children:"Your administrator needs to start the Tut Agent service and set its address (TUT_AGENT_PUBLIC_URL). Notebook chat and Studio keep working in the meantime."})]})})]})})}`;

  const replacement = `function l(){let e=(0,s.useSearchParams)(),{data:a="",isLoading:l}=(0,n.useQuery)({queryKey:["tut-url"],queryFn:r.tutApi.url,staleTime:1/0}),th=(typeof window!=='undefined'&&document.documentElement.classList.contains('dark'))?'dark':'light',m=a?(a.indexOf('?')===-1?\`\${a}/?theme=\${th}\`:\`\${a}&theme=\${th}\`):"";return(0,t.jsx)(o.AppShell,{children:(0,t.jsx)("div",{className:"relative flex h-full w-full min-h-0 flex-1 overflow-hidden bg-background",children:l?null:a?(0,t.jsx)("iframe",{title:"Tut Agent",src:m,className:"h-full w-full border-0 bg-background",allow:"clipboard-read; clipboard-write; microphone; camera"}):(0,t.jsxs)("div",{className:"flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center bg-background",children:[(0,t.jsx)(d.TutAvatar,{size:72}),(0,t.jsx)("h1",{className:"text-xl font-semibold",children:"Tut Agent is not connected yet"}),(0,t.jsx)("p",{className:"max-w-md text-sm text-muted-foreground",children:"Your administrator needs to start the Tut Agent service and set its address (TUT_AGENT_PUBLIC_URL). Notebook chat and Studio keep working in the meantime."})]})})})}`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(clientChunk, content, 'utf8');
    console.log('[OK] Patched client chunk:', clientChunk);
  } else if (content.includes('relative flex h-full w-full min-h-0 flex-1')) {
    console.log('[ALREADY] Client chunk already patched');
  } else {
    console.log('[WARN] Target not found in client chunk');
  }
}

const ssrChunk = '/app/frontend/.next/server/chunks/ssr/src_1k38i28._.js';
if (fs.existsSync(ssrChunk)) {
  let content = fs.readFileSync(ssrChunk, 'utf8');
  const target = `function k(){let a=(0,e.useSearchParams)(),{data:c="",isLoading:k}=(0,d.useQuery)({queryKey:["tut-url"],queryFn:j.tutApi.url,staleTime:1/0}),l=a.get("notebook"),m=c?\`\${c}/\`:"";return(0,b.jsx)(g.AppShell,{children:(0,b.jsxs)("div",{className:"flex h-full min-h-0 flex-col",children:[(0,b.jsxs)("header",{className:"flex h-14 shrink-0 items-center gap-3 border-b border-border px-5",children:[(0,b.jsx)(i.TutAvatar,{size:28}),(0,b.jsxs)("div",{className:"flex min-w-0 flex-col",children:[(0,b.jsx)("span",{className:"text-sm font-semibold",children:"Tut Agent"}),(0,b.jsx)("span",{className:"truncate text-xs text-muted-foreground",children:l?"Ask Tut to work with this notebook: its MCIT AI tools can read it.":"Plans and runs multi-step work across your notebooks, files and Studio."})]}),c&&(0,b.jsx)(h.Button,{asChild:!0,size:"sm",variant:"outline",className:"ml-auto",children:(0,b.jsxs)("a",{href:m,target:"_blank",rel:"noreferrer",children:[(0,b.jsx)(f.ExternalLink,{className:"mr-1.5 h-4 w-4"})," Open in a new window"]})})]}),(0,b.jsx)("div",{className:"min-h-0 flex-1",children:k?null:c?(0,b.jsx)("iframe",{title:"Tut Agent",src:m,className:"h-full w-full border-0 bg-background",allow:"clipboard-read; clipboard-write; microphone; camera"}):(0,b.jsxs)("div",{className:"flex h-full flex-col items-center justify-center gap-3 p-8 text-center",children:[(0,b.jsx)(i.TutAvatar,{size:72}),(0,b.jsx)("h1",{className:"text-xl font-semibold",children:"Tut Agent is not connected yet"}),(0,b.jsx)("p",{className:"max-w-md text-sm text-muted-foreground",children:"Your administrator needs to start the Tut Agent service and set its address (TUT_AGENT_PUBLIC_URL). Notebook chat and Studio keep working in the meantime."})]})})]})})}`;

  const replacement = `function k(){let a=(0,e.useSearchParams)(),{data:c="",isLoading:k}=(0,d.useQuery)({queryKey:["tut-url"],queryFn:j.tutApi.url,staleTime:1/0}),th=(typeof window!=='undefined'&&document.documentElement.classList.contains('dark'))?'dark':'light',m=c?(c.indexOf('?')===-1?\`\${c}/?theme=\${th}\`:\`\${c}&theme=\${th}\`):"";return(0,b.jsx)(g.AppShell,{children:(0,b.jsx)("div",{className:"relative flex h-full w-full min-h-0 flex-1 overflow-hidden bg-background",children:k?null:c?(0,b.jsx)("iframe",{title:"Tut Agent",src:m,className:"h-full w-full border-0 bg-background",allow:"clipboard-read; clipboard-write; microphone; camera"}):(0,b.jsxs)("div",{className:"flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center bg-background",children:[(0,b.jsx)(i.TutAvatar,{size:72}),(0,b.jsx)("h1",{className:"text-xl font-semibold",children:"Tut Agent is not connected yet"}),(0,b.jsx)("p",{className:"max-w-md text-sm text-muted-foreground",children:"Your administrator needs to start the Tut Agent service and set its address (TUT_AGENT_PUBLIC_URL). Notebook chat and Studio keep working in the meantime."})]})})})}`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(ssrChunk, content, 'utf8');
    console.log('[OK] Patched SSR chunk:', ssrChunk);
  } else if (content.includes('relative flex h-full w-full min-h-0 flex-1')) {
    console.log('[ALREADY] SSR chunk already patched');
  } else {
    console.log('[WARN] Target not found in SSR chunk');
  }
}

console.log('=== Frontend Tut Page Patch Complete ===');
