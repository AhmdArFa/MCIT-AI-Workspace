const fs = require('fs');

console.log('=== Building and Applying Notebooks Page Patch ===');

// 1. Prepare the Client module replacement
const clientChunkPath = '/app/frontend/.next/static/chunks/06zn4uez7ei31.js';
const ssrChunkPath = '/app/frontend/.next/server/chunks/ssr/src_app_(dashboard)_notebooks_page_tsx_09i8ha6._.js';

if (!fs.existsSync(clientChunkPath)) {
  console.error('Client chunk not found:', clientChunkPath);
  process.exit(1);
}
if (!fs.existsSync(ssrChunkPath)) {
  console.error('SSR chunk not found:', ssrChunkPath);
  process.exit(1);
}

// Generate the code for the client component
function getClientModuleCode() {
  return `62030,e=>{"use strict";
var t=e.i(18050),s=e.i(71645),o=e.i(10400),i=e.i(18566),n=e.i(19455),a=e.i(87486),b=e.i(22016),g=e.i(94184),f=e.i(59394),x=e.i(94913),p=e.i(55146),E=e.i(66027),V=e.i(247),D=e.i(73465),O=e.i(69687),d=e.i(22915),u=e.i(13639),m=e.i(27612),l=e.i(75254);

let c=(0,l.default)("ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]]);

const ACCENT_PRESETS = [
  { name: 'Royal Gold', gold: '#FFEDB9', gold2: '#FFF5DC', deep: '#C9A227', rgb: '255, 237, 185', on: '#000000' },
  { name: 'Lapis Blue', gold: '#4B7BFF', gold2: '#A9C1FF', deep: '#1F3FB8', rgb: '75, 123, 255', on: '#ffffff' },
  { name: 'Emerald', gold: '#2FD08C', gold2: '#A4F2CF', deep: '#0B8A5C', rgb: '47, 208, 140', on: '#03140c' },
  { name: 'Amethyst', gold: '#A47CF5', gold2: '#DCCBFF', deep: '#5E34C4', rgb: '164, 124, 245', on: '#ffffff' },
  { name: 'Crimson', gold: '#F0506E', gold2: '#FFADBD', deep: '#A8123A', rgb: '240, 80, 110', on: '#ffffff' },
  { name: 'Aqua', gold: '#22C7E8', gold2: '#A6EEFB', deep: '#0A7C98', rgb: '34, 199, 232', on: '#02161b' }
];

function applyAccentTheme(idx) {
  const preset = ACCENT_PRESETS[idx];
  if (!preset) return;
  const root = document.documentElement;
  root.style.setProperty('--primary', preset.gold);
  root.style.setProperty('--gold', preset.gold);
  root.style.setProperty('--ring', preset.gold);
  root.style.setProperty('--mcit-gold', preset.gold);
  root.style.setProperty('--mcit-gold2', preset.gold2);
  root.style.setProperty('--mcit-gold-deep', preset.deep);
  root.style.setProperty('--mcit-accrgb', preset.rgb);
  try {
    localStorage.setItem('mcit-accent-index', String(idx));
    localStorage.setItem('mcit-accent-color', preset.gold);
    window.postMessage({ type: 'MCIT_ACCENT_CHANGE', accent: preset.gold }, '*');
    document.querySelectorAll('iframe').forEach(f => {
      try { f.contentWindow && f.contentWindow.postMessage({ type: 'MCIT_ACCENT_CHANGE', accent: preset.gold }, '*'); } catch(_) {}
    });
  } catch(_) {}
}

function NotebookCard({ notebook: e, viewMode: vm }) {
  const router = (0,i.useRouter)();
  const updateNotebook = (0,g.useUpdateNotebook)();
  const [deleteOpen, setDeleteOpen] = (0,s.useState)(!1);

  const formatRel = dt => {
    if (!dt) return 'recently';
    try {
      const d = new Date(dt);
      return isNaN(d.getTime()) ? 'recently' : (0,x.formatDistanceToNow)(d, { addSuffix: true });
    } catch(_) { return 'recently'; }
  };

  const isList = vm === 'list';

  return (0,t.jsxs)(t.Fragment, {
    children: [
      (0,t.jsxs)("div", {
        onClick: () => router.push('/notebooks/' + encodeURIComponent(e.id)),
        className: isList
          ? "group flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#0e0e0e] border border-[#1f1f1f] hover:border-[var(--primary)] hover:bg-[#121212] transition-all cursor-pointer shadow-sm"
          : "group flex flex-col justify-between p-5 rounded-2xl bg-[#0e0e0e] border border-[#1f1f1f] hover:border-[var(--primary)] hover:bg-[#121212] transition-all cursor-pointer hover:-translate-y-0.5 shadow-sm min-h-[168px]",
        children: [
          isList ? (
            (0,t.jsxs)(t.Fragment, {
              children: [
                (0,t.jsx)("div", {
                  className: "w-8 h-8 rounded-lg bg-[rgba(255,237,185,0.08)] text-[var(--primary)] flex items-center justify-center shrink-0",
                  children: (0,t.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("path", { d: "M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z" }), (0,t.jsx)("path", { d: "M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" })] })
                }),
                (0,t.jsx)("h4", { className: "w-56 text-sm font-semibold text-[#f0f0f2] group-hover:text-white truncate shrink-0", children: e.name }),
                (0,t.jsx)("p", { className: "flex-1 text-xs text-[#8b8b8b] truncate", children: e.description || 'No description' }),
                (0,t.jsxs)("div", {
                  className: "flex items-center gap-6 text-xs text-[#8b8b8b] shrink-0",
                  children: [
                    (0,t.jsxs)("span", { children: ["Updated ", formatRel(e.updated || e.updated_at)] }),
                    (0,t.jsxs)("span", {
                      className: "flex items-center gap-1",
                      children: [
                        (0,t.jsx)("svg", { className: "h-3 w-3 text-[#6d6d6d]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), (0,t.jsx)("polyline", { points: "14 2 14 8 20 8" }), (0,t.jsx)("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), (0,t.jsx)("line", { x1: "16", y1: "17", x2: "8", y2: "17" })] }),
                        e.source_count ?? 0
                      ]
                    })
                  ]
                }),
                (0,t.jsxs)(p.DropdownMenu, {
                  children: [
                    (0,t.jsx)(p.DropdownMenuTrigger, {
                      asChild: !0,
                      children: (0,t.jsx)(n.Button, {
                        variant: "ghost",
                        size: "sm",
                        className: "opacity-0 group-hover:opacity-100 transition-opacity p-1.5 h-8 w-8 text-[#8b8b8b] hover:text-white",
                        onClick: ev => ev.stopPropagation(),
                        children: (0,t.jsx)(c, { className: "h-4 w-4" })
                      })
                    }),
                    (0,t.jsxs)(p.DropdownMenuContent, {
                      align: "end",
                      onClick: ev => ev.stopPropagation(),
                      className: "bg-[#161616] border border-[#262626] text-[#ececec]",
                      children: [
                        (0,t.jsx)(p.DropdownMenuItem, {
                          onClick: ev => { ev.stopPropagation(); updateNotebook.mutate({ id: e.id, data: { archived: !e.archived } }); },
                          children: e.archived ? "Unarchive" : "Archive"
                        }),
                        (0,t.jsx)(p.DropdownMenuItem, {
                          onClick: ev => { ev.stopPropagation(); setDeleteOpen(!0); },
                          className: "text-red-400 focus:text-red-300",
                          children: "Delete"
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ) : (
            (0,t.jsxs)(t.Fragment, {
              children: [
                (0,t.jsxs)("div", {
                  children: [
                    (0,t.jsxs)("div", {
                      className: "flex items-start justify-between mb-3",
                      children: [
                        (0,t.jsx)("div", {
                          className: "w-9 h-9 rounded-xl bg-[rgba(255,237,185,0.08)] text-[var(--primary)] flex items-center justify-center",
                          children: (0,t.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("path", { d: "M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z" }), (0,t.jsx)("path", { d: "M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" })] })
                        }),
                        (0,t.jsxs)(p.DropdownMenu, {
                          children: [
                            (0,t.jsx)(p.DropdownMenuTrigger, {
                              asChild: !0,
                              children: (0,t.jsx)(n.Button, {
                                variant: "ghost",
                                size: "sm",
                                className: "opacity-0 group-hover:opacity-100 transition-opacity p-1 h-7 w-7 text-[#8b8b8b] hover:text-white",
                                onClick: ev => ev.stopPropagation(),
                                children: (0,t.jsx)(c, { className: "h-4 w-4" })
                              })
                            }),
                            (0,t.jsxs)(p.DropdownMenuContent, {
                              align: "end",
                              onClick: ev => ev.stopPropagation(),
                              className: "bg-[#161616] border border-[#262626] text-[#ececec]",
                              children: [
                                (0,t.jsx)(p.DropdownMenuItem, {
                                  onClick: ev => { ev.stopPropagation(); updateNotebook.mutate({ id: e.id, data: { archived: !e.archived } }); },
                                  children: e.archived ? "Unarchive" : "Archive"
                                }),
                                (0,t.jsx)(p.DropdownMenuItem, {
                                  onClick: ev => { ev.stopPropagation(); setDeleteOpen(!0); },
                                  className: "text-red-400 focus:text-red-300",
                                  children: "Delete"
                                })
                              ]
                            })
                          ]
                        })
                      ]
                    }),
                    (0,t.jsx)("h4", { className: "text-base font-semibold text-[#f0f0f2] group-hover:text-white mb-1 truncate", children: e.name }),
                    (0,t.jsx)("p", { className: "text-xs text-[#8b8b8b] line-clamp-2 min-h-[32px]", children: e.description || 'No description provided' })
                  ]
                }),
                (0,t.jsxs)("div", {
                  className: "flex items-center justify-between text-xs text-[#8b8b8b] mt-4 pt-3 border-t border-[#1f1f1f]",
                  children: [
                    (0,t.jsxs)("span", { children: ["Updated ", formatRel(e.updated || e.updated_at)] }),
                    (0,t.jsxs)("span", {
                      className: "flex items-center gap-1",
                      children: [
                        (0,t.jsx)("svg", { className: "h-3 w-3 text-[#6d6d6d]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), (0,t.jsx)("polyline", { points: "14 2 14 8 20 8" }), (0,t.jsx)("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), (0,t.jsx)("line", { x1: "16", y1: "17", x2: "8", y2: "17" })] }),
                        e.source_count ?? 0
                      ]
                    })
                  ]
                })
              ]
            })
          )
        ]
      }),
      (0,t.jsx)(f.NotebookDeleteDialog, { open: deleteOpen, onOpenChange: setDeleteOpen, notebookId: e.id, notebookName: e.name })
    ]
  });
}

e.s(["default", 0, function() {
  const router = (0,i.useRouter)();
  const [createDialogOpen, setCreateDialogOpen] = (0,s.useState)(!1);
  const [searchTerm, setSearchTerm] = (0,s.useState)("");
  const [viewMode, setViewMode] = (0,s.useState)("grid");
  const [paletteOpen, setPaletteOpen] = (0,s.useState)(!1);
  const [selectedAccentIndex, setSelectedAccentIndex] = (0,s.useState)(0);

  const { data: notebooks, isLoading: isLoadingActive } = (0,g.useNotebooks)(!1);
  const { data: archivedNotebooks } = (0,g.useNotebooks)(!0);
  const { data: recentItems = [] } = (0,E.useQuery)({
    queryKey: ['recently-viewed', 8],
    queryFn: () => V.notebooksApi.recentlyViewed(8)
  });

  (0,s.useEffect)(() => {
    try {
      const savedIndex = localStorage.getItem('mcit-accent-index');
      if (savedIndex !== null) {
        const idx = parseInt(savedIndex, 10);
        if (!isNaN(idx) && idx >= 0 && idx < ACCENT_PRESETS.length) {
          applyAccentTheme(idx);
          setSelectedAccentIndex(idx);
          return;
        }
      }
      applyAccentTheme(0);
    } catch (_) {}
  }, []);

  const norm = searchTerm.trim().toLowerCase();
  const filteredActive = (0,s.useMemo)(() => {
    if (!notebooks) return [];
    if (!norm) return notebooks;
    return notebooks.filter(nb => nb.name.toLowerCase().includes(norm) || (nb.description && nb.description.toLowerCase().includes(norm)));
  }, [notebooks, norm]);

  const formatRel = dt => {
    if (!dt) return 'recently';
    try {
      const d = new Date(dt);
      return isNaN(d.getTime()) ? 'recently' : (0,x.formatDistanceToNow)(d, { addSuffix: true });
    } catch (_) { return 'recently'; }
  };

  return (0,t.jsxs)(o.AppShell, {
    children: [
      (0,t.jsx)("div", {
        className: "flex-1 overflow-y-auto bg-[#000000] text-[#ececec]",
        children: (0,t.jsxs)("div", {
          className: "w-full max-w-[1080px] mx-auto px-6 py-8",
          children: [
            /* Top Bar */
            (0,t.jsxs)("div", {
              className: "flex flex-wrap items-center justify-between gap-3 mb-8",
              children: [
                (0,t.jsx)("h1", { className: "text-2xl font-semibold tracking-tight text-[#f0f0f2]", children: "Notebooks" }),
                (0,t.jsxs)("div", {
                  className: "flex items-center gap-3 ml-auto flex-wrap",
                  children: [
                    /* Search */
                    (0,t.jsxs)("div", {
                      className: "relative",
                      children: [
                        (0,t.jsx)("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b8b8b]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("circle", { cx: "11", cy: "11", r: "8" }), (0,t.jsx)("path", { d: "m21 21-4.3-4.3" })] }),
                        (0,t.jsx)("input", {
                          type: "text",
                          value: searchTerm,
                          onChange: ev => setSearchTerm(ev.target.value),
                          placeholder: "Search notebooks…",
                          className: "w-56 max-w-full bg-[#0e0e0e] border border-[#1f1f1f] rounded-xl py-2 pl-9 pr-3 text-sm text-[#ececec] placeholder-[#6d6d6d] outline-none focus:border-[var(--primary)] transition-colors"
                        })
                      ]
                    }),
                    /* Segmented Grid / List toggle */
                    (0,t.jsxs)("div", {
                      className: "flex items-center bg-[#0e0e0e] border border-[#1f1f1f] rounded-xl p-1 gap-0.5",
                      children: [
                        (0,t.jsx)("button", {
                          type: "button",
                          onClick: () => setViewMode("grid"),
                          title: "Grid View",
                          className: "p-1.5 rounded-lg transition-colors " + (viewMode === "grid" ? "bg-[#161616] text-[var(--primary)]" : "text-[#8b8b8b] hover:text-[#ececec]"),
                          children: (0,t.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }), (0,t.jsx)("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }), (0,t.jsx)("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }), (0,t.jsx)("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" })] })
                        }),
                        (0,t.jsx)("button", {
                          type: "button",
                          onClick: () => setViewMode("list"),
                          title: "List View",
                          className: "p-1.5 rounded-lg transition-colors " + (viewMode === "list" ? "bg-[#161616] text-[var(--primary)]" : "text-[#8b8b8b] hover:text-[#ececec]"),
                          children: (0,t.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("line", { x1: "8", y1: "6", x2: "21", y2: "6" }), (0,t.jsx)("line", { x1: "8", y1: "12", x2: "21", y2: "12" }), (0,t.jsx)("line", { x1: "8", y1: "18", x2: "21", y2: "18" }), (0,t.jsx)("line", { x1: "3", y1: "6", x2: "3.01", y2: "6" }), (0,t.jsx)("line", { x1: "3", y1: "12", x2: "3.01", y2: "12" }), (0,t.jsx)("line", { x1: "3", y1: "18", x2: "3.01", y2: "18" })] })
                        })
                      ]
                    }),
                    /* Accent Palette Picker */
                    (0,t.jsxs)("div", {
                      className: "relative",
                      children: [
                        (0,t.jsx)("button", {
                          type: "button",
                          onClick: () => setPaletteOpen(!paletteOpen),
                          title: "Accent Color",
                          className: "h-9 w-9 rounded-xl bg-[#0e0e0e] border border-[#1f1f1f] flex items-center justify-center text-[#8b8b8b] hover:text-[var(--primary)] transition-colors",
                          children: (0,t.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("path", { d: "M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.3-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-3.9-4-7.2-9-7.2z" }), (0,t.jsx)("circle", { cx: "7.5", cy: "11", r: "1" }), (0,t.jsx)("circle", { cx: "10", cy: "7", r: "1" }), (0,t.jsx)("circle", { cx: "15", cy: "7.5", r: "1" })] })
                        }),
                        paletteOpen ? (0,t.jsxs)(t.Fragment, {
                          children: [
                            (0,t.jsx)("div", { className: "fixed inset-0 z-40", onClick: () => setPaletteOpen(!1) }),
                            (0,t.jsx)("div", {
                              className: "absolute right-0 top-11 z-50 flex gap-2.5 p-3 rounded-2xl bg-[#0e0e0e] border border-[#262626] shadow-2xl",
                              children: ACCENT_PRESETS.map((p, idx) => (0,t.jsx)("button", {
                                key: p.name,
                                type: "button",
                                onClick: () => { applyAccentTheme(idx); setSelectedAccentIndex(idx); setPaletteOpen(!1); },
                                title: p.name,
                                style: { background: "linear-gradient(135deg, " + p.gold2 + ", " + p.gold + " 50%, " + p.deep + ")" },
                                className: "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 " + (selectedAccentIndex === idx ? "border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "border-transparent")
                              }, p.name))
                            })
                          ]
                        }) : null
                      ]
                    }),
                    /* New Notebook Button */
                    (0,t.jsxs)("button", {
                      type: "button",
                      onClick: () => setCreateDialogOpen(!0),
                      className: "flex items-center gap-2 bg-[var(--primary)] text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all hover:brightness-110 shadow-[0_2px_12px_rgba(255,237,185,0.15)]",
                      children: [
                        (0,t.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), (0,t.jsx)("line", { x1: "5", y1: "12", x2: "19", y2: "12" })] }),
                        "New Notebook"
                      ]
                    })
                  ]
                })
              ]
            }),

            /* Section 1: Recently Viewed */
            recentItems.length > 0 ? (
              (0,t.jsxs)("div", {
                className: "mb-10",
                children: [
                  (0,t.jsx)("h3", { className: "text-xs font-semibold text-[#8b8b8b] tracking-wider uppercase mb-3", children: "Recently viewed" }),
                  (0,t.jsx)("div", {
                    className: "flex flex-col border border-[#1f1f1f] rounded-2xl overflow-hidden bg-[#070707]",
                    children: recentItems.slice(0, 8).map((item, idx) => {
                      const isSource = item.type !== 'notebook';
                      const href = isSource ? '/sources/' + item.id : '/notebooks/' + encodeURIComponent(item.id);
                      return (0,t.jsxs)(b.default, {
                        href: href,
                        className: "flex items-center gap-3 px-4 py-3 border-b border-[#1f1f1f] last:border-b-0 hover:bg-[#0e0e0e] transition-colors group",
                        children: [
                          isSource
                            ? (0,t.jsx)("svg", { className: "h-4 w-4 text-[#3fd0c0] shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), (0,t.jsx)("polyline", { points: "14 2 14 8 20 8" }), (0,t.jsx)("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), (0,t.jsx)("line", { x1: "16", y1: "17", x2: "8", y2: "17" })] })
                            : (0,t.jsx)("svg", { className: "h-4 w-4 text-[var(--primary)] shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("path", { d: "M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z" }), (0,t.jsx)("path", { d: "M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" })] }),
                          (0,t.jsx)("span", { className: "flex-1 min-w-0 text-sm text-[#ececec] group-hover:text-white truncate", children: item.title }),
                          (0,t.jsx)("span", { className: "text-[10px] tracking-wider uppercase text-[#8b8b8b] border border-[#1f1f1f] rounded-md px-2 py-0.5 shrink-0", children: isSource ? "Source" : "Notebook" }),
                          (0,t.jsx)("small", { className: "text-xs text-[#8b8b8b] shrink-0", children: formatRel(item.viewed_at) })
                        ]
                      }, item.id + idx);
                    })
                  })
                ]
              })
            ) : null,

            /* Section 2: Active Notebooks */
            (0,t.jsxs)("div", {
              className: "mb-12",
              children: [
                (0,t.jsxs)("h3", {
                  className: "text-xs font-semibold text-[#8b8b8b] tracking-wider uppercase mb-4",
                  children: ["Active notebooks · ", (0,t.jsx)("span", { children: filteredActive.length })]
                }),
                isLoadingActive ? (
                  (0,t.jsx)("div", { className: "flex items-center justify-center py-16", children: (0,t.jsx)(D.LoadingSpinner, { size: "lg" }) })
                ) : filteredActive.length === 0 ? (
                  (0,t.jsxs)("div", {
                    className: "p-8 border border-dashed border-[#1f1f1f] rounded-2xl text-center bg-[#070707]",
                    children: [
                      (0,t.jsx)("svg", { className: "h-8 w-8 text-[#6d6d6d] mx-auto mb-3", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("path", { d: "m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" })] }),
                      (0,t.jsx)("p", { className: "text-sm text-[#8b8b8b] mb-4", children: norm ? "No notebooks matched your search." : "No active notebooks yet." }),
                      !norm ? (
                        (0,t.jsxs)("button", {
                          type: "button",
                          onClick: () => setCreateDialogOpen(!0),
                          className: "inline-flex items-center gap-2 bg-[var(--primary)] text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all hover:brightness-110",
                          children: [
                            (0,t.jsx)("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [(0,t.jsx)("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), (0,t.jsx)("line", { x1: "5", y1: "12", x2: "19", y2: "12" })] }),
                            "Create First Notebook"
                          ]
                        })
                      ) : null
                    ]
                  })
                ) : viewMode === "grid" ? (
                  (0,t.jsx)("div", {
                    className: "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4",
                    children: filteredActive.map(nb => (0,t.jsx)(NotebookCard, { notebook: nb, viewMode: "grid" }, nb.id))
                  })
                ) : (
                  (0,t.jsx)("div", {
                    className: "flex flex-col gap-2",
                    children: filteredActive.map(nb => (0,t.jsx)(NotebookCard, { notebook: nb, viewMode: "list" }, nb.id))
                  })
                )
              ]
            }),

            /* Section 3: Archived Notebooks */
            archivedNotebooks && archivedNotebooks.length > 0 ? (
              (0,t.jsx)("div", {
                className: "mb-12",
                children: (0,t.jsxs)("details", {
                  className: "group",
                  children: [
                    (0,t.jsxs)("summary", {
                      className: "flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#6d6d6d] hover:text-[#8b8b8b] uppercase tracking-wider mb-4 list-none",
                      children: [
                        (0,t.jsx)("svg", { className: "h-3.5 w-3.5 transition-transform group-open:rotate-90", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: (0,t.jsx)("polyline", { points: "9 18 15 12 9 6" }) }),
                        "Archived notebooks · " + archivedNotebooks.length
                      ]
                    }),
                    (0,t.jsx)("div", {
                      className: "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 opacity-75",
                      children: archivedNotebooks.map(nb => (0,t.jsx)(NotebookCard, { notebook: nb, viewMode: "grid" }, nb.id))
                    })
                  ]
                })
              })
            ) : null,

            /* Footer */
            (0,t.jsxs)("div", {
              className: "mt-12 pt-5 border-t border-[#1f1f1f] flex flex-wrap justify-between items-center gap-3 text-xs text-[#6d6d6d]",
              children: [
                (0,t.jsxs)("span", {
                  children: [
                    (0,t.jsx)("b", { className: "font-semibold text-[var(--primary)]", children: "MCIT AI" }),
                    " · Ministry of Communications and Information Technology"
                  ]
                }),
                (0,t.jsx)("span", { children: "Developed by Eng Ahmed Arfa for MCIT" })
              ]
            })
          ]
        })
      }),
      (0,t.jsx)(O.CreateNotebookDialog, { open: createDialogOpen, onOpenChange: setCreateDialogOpen })
    ]
  });
}], 62030)}`;
}

// 2. Read client chunk and replace module 62030
let clientChunk = fs.readFileSync(clientChunkPath, 'utf8');
const clientStart = clientChunk.indexOf('62030,e=>{"use strict";');
const clientEnd = clientChunk.indexOf(',29288,e=>');

if (clientStart !== -1 && clientEnd !== -1) {
  const newClientModule = getClientModuleCode();
  clientChunk = clientChunk.slice(0, clientStart) + newClientModule + clientChunk.slice(clientEnd);
  fs.writeFileSync(clientChunkPath, clientChunk, 'utf8');
  console.log('[OK] Successfully patched client chunk:', clientChunkPath);
} else {
  console.error('[ERROR] Could not find module 62030 bounds in client chunk. clientStart:', clientStart, 'clientEnd:', clientEnd);
}

// 3. Prepare SSR module replacement
function getSSRModuleCode() {
  return `module.exports=[47746,a=>{"use strict";
var b=a.i(87924),c=a.i(72131),d=a.i(48441),e=a.i(50944),v=a.i(38246),q=a.i(89397),r=a.i(31645),o=a.i(94632),p=a.i(35732),I=a.i(33217),L=a.i(20681),B=a.i(29991),Q=a.i(79825),i=a.i(70106);

let j=(0,i.default)("ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]]);

const ACCENT_PRESETS = [
  { name: 'Royal Gold', gold: '#FFEDB9', gold2: '#FFF5DC', deep: '#C9A227', rgb: '255, 237, 185', on: '#000000' },
  { name: 'Lapis Blue', gold: '#4B7BFF', gold2: '#A9C1FF', deep: '#1F3FB8', rgb: '75, 123, 255', on: '#ffffff' },
  { name: 'Emerald', gold: '#2FD08C', gold2: '#A4F2CF', deep: '#0B8A5C', rgb: '47, 208, 140', on: '#03140c' },
  { name: 'Amethyst', gold: '#A47CF5', gold2: '#DCCBFF', deep: '#5E34C4', rgb: '164, 124, 245', on: '#ffffff' },
  { name: 'Crimson', gold: '#F0506E', gold2: '#FFADBD', deep: '#A8123A', rgb: '240, 80, 110', on: '#ffffff' },
  { name: 'Aqua', gold: '#22C7E8', gold2: '#A6EEFB', deep: '#0A7C98', rgb: '34, 199, 232', on: '#02161b' }
];

function NotebookCardSSR({ notebook: nb, viewMode: vm }) {
  const router = (0,e.useRouter)();
  const isList = vm === 'list';
  return (0,b.jsx)("div", {
    className: isList
      ? "flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#0e0e0e] border border-[#1f1f1f]"
      : "flex flex-col justify-between p-5 rounded-2xl bg-[#0e0e0e] border border-[#1f1f1f] min-h-[168px]",
    children: (0,b.jsx)("h4", { className: "text-base font-semibold text-[#f0f0f2]", children: nb.name })
  });
}

a.s(["default", 0, function() {
  const [createDialogOpen, setCreateDialogOpen] = (0,c.useState)(!1);
  const [searchTerm, setSearchTerm] = (0,c.useState)("");
  const [viewMode, setViewMode] = (0,c.useState)("grid");
  const [paletteOpen, setPaletteOpen] = (0,c.useState)(!1);

  const { data: notebooks, isLoading: isLoadingActive } = (0,q.useNotebooks)(!1);
  const { data: archivedNotebooks } = (0,q.useNotebooks)(!0);
  const { data: recentItems = [] } = (0,I.useQuery)({
    queryKey: ['recently-viewed', 8],
    queryFn: () => L.notebooksApi.recentlyViewed(8)
  });

  const norm = searchTerm.trim().toLowerCase();
  const filteredActive = (0,c.useMemo)(() => {
    if (!notebooks) return [];
    if (!norm) return notebooks;
    return notebooks.filter(nb => nb.name.toLowerCase().includes(norm));
  }, [notebooks, norm]);

  return (0,b.jsxs)(d.AppShell, {
    children: [
      (0,b.jsx)("div", {
        className: "flex-1 overflow-y-auto bg-[#000000] text-[#ececec]",
        children: (0,b.jsxs)("div", {
          className: "w-full max-w-[1080px] mx-auto px-6 py-8",
          children: [
            (0,b.jsxs)("div", {
              className: "flex flex-wrap items-center justify-between gap-3 mb-8",
              children: [
                (0,b.jsx)("h1", { className: "text-2xl font-semibold tracking-tight text-[#f0f0f2]", children: "Notebooks" })
              ]
            }),
            (0,b.jsx)("div", {
              className: "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4",
              children: filteredActive.map(nb => (0,b.jsx)(NotebookCardSSR, { notebook: nb, viewMode: "grid" }, nb.id))
            }),
            (0,b.jsxs)("div", {
              className: "mt-12 pt-5 border-t border-[#1f1f1f] flex flex-wrap justify-between items-center gap-3 text-xs text-[#6d6d6d]",
              children: [
                (0,b.jsxs)("span", {
                  children: [
                    (0,b.jsx)("b", { className: "font-semibold text-[var(--primary)]", children: "MCIT AI" }),
                    " · Ministry of Communications and Information Technology"
                  ]
                }),
                (0,b.jsx)("span", { children: "Developed by Eng Ahmed Arfa for MCIT" })
              ]
            })
          ]
        })
      }),
      (0,b.jsx)(Q.CreateNotebookDialog, { open: createDialogOpen, onOpenChange: setCreateDialogOpen })
    ]
  });
}], 47746)}];`;
}

// 4. Overwrite SSR chunk
fs.writeFileSync(ssrChunkPath, getSSRModuleCode(), 'utf8');
console.log('[OK] Successfully patched SSR chunk:', ssrChunkPath);

console.log('=== Notebooks Page Patch Finished Successfully ===');
