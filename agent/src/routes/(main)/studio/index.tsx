'use client';

import { BRANDING_NAME, ORG_NAME } from '@tut/business-const';
import { Flexbox } from '@mcit-vendor/ui';
import { Button, Tag, Text, toast } from '@mcit-vendor/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import {
  Download,
  FileText,
  LayoutTemplate,
  Plus,
  Presentation,
  Sparkles,
  Trash2,
  Tv,
} from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { exportToPdf, type ReportSection } from '@/features/Studio/pdfGenerator';
import { exportToPptx, type SlideData } from '@/features/Studio/pptxGenerator';

const styles = createStaticStyles(({ css }) => ({
  card: css`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 18px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 14px;
    background: ${cssVar.colorBgContainer};
    transition: all 0.15s ease;

    &:hover {
      border-color: ${cssVar.colorPrimaryBorder};
      box-shadow: 0 6px 20px ${cssVar.colorFillTertiary};
    }
  `,
  editorBox: css`
    padding: 24px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;
    background: ${cssVar.colorBgContainer};
    box-shadow: 0 4px 16px ${cssVar.colorFillQuaternary};
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    width: 100%;
  `,
  input: css`
    width: 100%;
    padding: 10px 14px;
    border: 1px solid ${cssVar.colorBorder};
    border-radius: 10px;
    font: inherit;
    color: ${cssVar.colorText};
    background: ${cssVar.colorBgContainer};
  `,
  page: css`
    max-width: 1120px;
    margin: 0 auto;
    padding: 32px 20px 64px;
  `,
  slideCanvas: css`
    aspect-ratio: 16 / 9;
    padding: 36px 44px;
    border-radius: 14px;
    background: #0f172a;
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
  `,
  slideThumb: css`
    cursor: pointer;
    padding: 12px 14px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 10px;
    background: ${cssVar.colorBgContainer};
    transition: border-color 0.15s ease;

    &:hover {
      border-color: ${cssVar.colorPrimary};
    }
  `,
  textarea: css`
    width: 100%;
    min-height: 90px;
    padding: 12px 14px;
    border: 1px solid ${cssVar.colorBorder};
    border-radius: 10px;
    font: inherit;
    color: ${cssVar.colorText};
    background: ${cssVar.colorBgContainer};
    resize: vertical;
  `,
}));

type StudioFormat = 'pptx' | 'pdf' | 'infograph';

const StudioPage = memo(() => {
  const [format, setFormat] = useState<StudioFormat>('pptx');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  // DeckCraft (PPTX) State
  const [deckTitle, setDeckTitle] = useState('MCIT Digital Transformation Strategy');
  const [slides, setSlides] = useState<SlideData[]>([
    {
      id: '1',
      title: 'Executive Vision & Strategic Alignment',
      subtitle: 'Ministry of Communications and Information Technology',
      bullets: [
        'Accelerating national AI adoption across public sector entities',
        'Strengthening digital infrastructure and secure sovereign data processing',
        'Fostering homegrown technological leadership and innovation cohorts',
      ],
      notes: 'Introduce the core mission and alignment with MCIT national directives.',
    },
    {
      id: '2',
      title: 'Key Milestones & Deliverables 2026',
      subtitle: 'Phase 1 Roadmap Execution',
      bullets: [
        'Deployment of private local AI inference models (Gemma 4 e4b)',
        'Establishment of the Tut Agent unified intelligent assistant framework',
        'Strict governance, automated auditing, and zero external telemetry egress',
      ],
      notes: 'Detail technical progress and timelines.',
    },
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // PDF Craft State
  const [reportTitle, setReportTitle] = useState('MCIT Comprehensive Technology Briefing');
  const [reportSummary, setReportSummary] = useState(
    'This report outlines current operational readiness, local AI infrastructure benchmarks, and strategic initiatives spearheaded by the Ministry of Communications and Information Technology.',
  );
  const [reportSections, setReportSections] = useState<ReportSection[]>([
    {
      id: '1',
      title: 'Operational Context & Infrastructure',
      content:
        'MCIT continues to expand sovereign compute capacity, running local model inference (Gemma 4 e4b, Qwen 2.5) on secure premise nodes. Complete data isolation protects official records and institutional workflows.',
    },
    {
      id: '2',
      title: 'Strategic Recommendations',
      content:
        '1. Consolidate model registries under local Ollama management.\n2. Provision role-based permissions strictly via the MCIT Admin Portal.\n3. Implement standardized PPTX and PDF artifact pipelines for all departments.',
    },
  ]);

  // Infographic State
  const [infoTitle, setInfoTitle] = useState('MCIT AI Performance & Metrics 2026');
  const [infoStats, setInfoStats] = useState([
    { label: 'Local Models Active', val: '4+', desc: 'Gemma 4, Qwen 2.5 on-premise' },
    { label: 'Data Egress', val: '0%', desc: '100% Sovereign & Telemetry Disabled' },
    { label: 'Inference Latency', val: '<45ms', desc: 'Direct GPU acceleration' },
    { label: 'Admin Provisioning', val: '100%', desc: 'Strict organization access control' },
  ]);

  // Generate content via Ollama
  const generate = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('Enter a topic or prompt first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/webapi/mcit/studio', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ format, topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      const raw = data.content || '';
      if (format === 'pptx') {
        setDeckTitle(topic.trim());
        // Parse raw output into slides
        const slideChunks = raw.split(/##\s+Slide/gi).filter((c: string) => c.trim().length > 0);
        if (slideChunks.length > 0) {
          const parsed = slideChunks.map((chunk: string, idx: number) => {
            const lines = chunk.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
            const title = lines[0]?.replace(/^[:\s—\-]+/, '') || `Slide ${idx + 1}`;
            const bullets = lines
              .slice(1)
              .filter((l: string) => l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l))
              .map((l: string) => l.replace(/^[-*\d.]+\s*/, ''));
            return {
              id: String(idx + 1),
              title,
              subtitle: 'MCIT AI Studio Generated',
              bullets: bullets.length > 0 ? bullets : ['Key point A', 'Key point B', 'Key point C'],
              notes: 'Generated by Gemma 4 local engine.',
            };
          });
          setSlides(parsed);
          setActiveSlideIndex(0);
        }
      } else if (format === 'pdf') {
        setReportTitle(topic.trim());
        const secChunks = raw.split(/##\s+/gi).filter((c: string) => c.trim().length > 0);
        if (secChunks.length > 0) {
          setReportSummary(secChunks[0] || 'Executive Summary generated by MCIT AI Studio.');
          const parsedSecs = secChunks.slice(1).map((sec: string, idx: number) => {
            const [heading, ...rest] = sec.split('\n');
            return {
              id: String(idx + 1),
              title: heading?.trim() || `Section ${idx + 1}`,
              content: rest.join('\n').trim() || 'Content analysis and recommendations.',
            };
          });
          setReportSections(parsedSecs.length > 0 ? parsedSecs : reportSections);
        }
      }

      toast.success(`${format.toUpperCase()} draft generated successfully!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [format, reportSections, topic]);

  // Export handlers
  const handleExportPptx = async () => {
    try {
      await exportToPptx(deckTitle, slides, 'mcit');
      toast.success('PowerPoint presentation downloaded!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    }
  };

  const handleExportPdf = () => {
    try {
      exportToPdf(reportTitle, reportSummary, reportSections);
      toast.success('PDF report downloaded!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <Flexbox justify="space-between" align="center" horizontal style={{ marginBottom: 28 }}>
        <Flexbox gap={4}>
          <Flexbox horizontal align="center" gap={10}>
            <Sparkles size={28} style={{ color: 'var(--ant-color-primary)' }} />
            <Text as="h1" fontSize={28} weight="bold">
              MCIT Studio &bull; Document Craft
            </Text>
          </Flexbox>
          <Text type="secondary" fontSize={14}>
            {ORG_NAME} &bull; Native PowerPoint (PPTX), PDF Reports & Infographic Generation Suite
          </Text>
        </Flexbox>
        <Tag color="gold" style={{ fontSize: 13, padding: '4px 10px' }}>
          Engine: Gemma 4 e4b (Local Ollama)
        </Tag>
      </Flexbox>

      {/* Format Selector Grid */}
      <div className={styles.grid} style={{ marginBottom: 24 }}>
        {[
          {
            id: 'pptx' as const,
            title: 'Presentation (PPTX)',
            desc: 'DeckCraft Slide Studio with live preview & PowerPoint download',
            icon: Presentation,
          },
          {
            id: 'pdf' as const,
            title: 'Report (PDF)',
            desc: 'PDF Craft formatted briefing with executive summary & sections',
            icon: FileText,
          },
          {
            id: 'infograph' as const,
            title: 'Infographic',
            desc: 'Visual metrics cards, KPI stats & executive dashboard',
            icon: LayoutTemplate,
          },
        ].map((item) => {
          const Icon = item.icon;
          const active = format === item.id;
          return (
            <div
              key={item.id}
              className={styles.card}
              style={
                active
                  ? {
                      borderColor: 'var(--ant-color-primary)',
                      outline: '2px solid var(--ant-color-primary-border)',
                    }
                  : undefined
              }
              onClick={() => setFormat(item.id)}
            >
              <Flexbox horizontal align="center" gap={10}>
                <Icon size={22} style={{ color: active ? 'var(--ant-color-primary)' : undefined }} />
                <Text weight="bold" fontSize={16}>
                  {item.title}
                </Text>
              </Flexbox>
              <Text type="secondary" fontSize={13}>
                {item.desc}
              </Text>
            </div>
          );
        })}
      </div>

      {/* Prompt / AI Generation Input */}
      <div className={styles.editorBox} style={{ marginBottom: 28 }}>
        <Flexbox gap={12}>
          <Text weight="bold" fontSize={15}>
            AI Generator Prompt & Outline
          </Text>
          <input
            className={styles.input}
            placeholder={`Enter topic for ${format.toUpperCase()} (e.g. AI Strategy Roadmap 2026, Cybersecurity Baseline Report)...`}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Flexbox horizontal justify="space-between" align="center">
            <Text type="secondary" fontSize={12}>
              Uses on-premise local Ollama &bull; Output stays strictly sovereign
            </Text>
            <Button icon={<Sparkles size={16} />} loading={loading} type="primary" onClick={() => void generate()}>
              Generate with AI
            </Button>
          </Flexbox>
        </Flexbox>
      </div>

      {/* FORMAT SPECIFIC CRAFT ENVIRONMENTS */}

      {/* 1. DECKCRAFT (PPTX STUDIO) */}
      {format === 'pptx' && (
        <div className={styles.editorBox}>
          <Flexbox justify="space-between" align="center" horizontal style={{ marginBottom: 20 }}>
            <Flexbox gap={4}>
              <Flexbox horizontal align="center" gap={8}>
                <Tv size={20} style={{ color: 'var(--ant-color-primary)' }} />
                <Text fontSize={18} weight="bold">
                  DeckCraft &bull; Slide Canvas
                </Text>
              </Flexbox>
              <Text type="secondary" fontSize={13}>
                Edit slide titles, bullets, and speaker notes directly before downloading .pptx
              </Text>
            </Flexbox>
            <Button icon={<Download size={16} />} type="primary" onClick={() => void handleExportPptx()}>
              Export .PPTX File
            </Button>
          </Flexbox>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <Text fontSize={13} weight="bold">
              Deck Title:
            </Text>
            <input
              className={styles.input}
              style={{ marginTop: 6 }}
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
            {/* Slide Navigation Thumbnails */}
            <Flexbox gap={10} style={{ maxHeight: 460, overflowY: 'auto' }}>
              {slides.map((s, idx) => (
                <div
                  key={s.id}
                  className={styles.slideThumb}
                  style={activeSlideIndex === idx ? { borderColor: 'var(--ant-color-primary)', background: 'var(--ant-color-fill-quaternary)' } : undefined}
                  onClick={() => setActiveSlideIndex(idx)}
                >
                  <Text weight="bold" fontSize={13}>
                    {idx + 1}. {s.title.slice(0, 24)}...
                  </Text>
                  <div style={{ fontSize: 11, color: 'var(--ant-color-text-secondary)', marginTop: 4 }}>
                    {s.bullets.length} bullets
                  </div>
                </div>
              ))}
              <Button
                icon={<Plus size={14} />}
                onClick={() => {
                  const newS: SlideData = {
                    id: String(slides.length + 1),
                    title: `Slide ${slides.length + 1}`,
                    subtitle: 'Subtitle',
                    bullets: ['Point 1', 'Point 2'],
                  };
                  setSlides([...slides, newS]);
                  setActiveSlideIndex(slides.length);
                }}
              >
                Add Slide
              </Button>
            </Flexbox>

            {/* Main Interactive Slide Canvas */}
            {slides[activeSlideIndex] && (
              <Flexbox gap={16}>
                <div className={styles.slideCanvas}>
                  <div>
                    <input
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#E2B857',
                        fontSize: 22,
                        fontWeight: 'bold',
                        width: '100%',
                        outline: 'none',
                      }}
                      value={slides[activeSlideIndex].title}
                      onChange={(e) => {
                        const copy = [...slides];
                        copy[activeSlideIndex].title = e.target.value;
                        setSlides(copy);
                      }}
                    />
                    <input
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        fontSize: 13,
                        width: '100%',
                        marginTop: 4,
                        outline: 'none',
                      }}
                      value={slides[activeSlideIndex].subtitle || ''}
                      placeholder="Add slide subtitle..."
                      onChange={(e) => {
                        const copy = [...slides];
                        copy[activeSlideIndex].subtitle = e.target.value;
                        setSlides(copy);
                      }}
                    />
                  </div>

                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: 10,
                      padding: '16px 20px',
                      flex: 1,
                      margin: '14px 0',
                    }}
                  >
                    <textarea
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#F8FAFC',
                        width: '100%',
                        height: '100%',
                        font: 'inherit',
                        fontSize: 14,
                        lineHeight: 1.8,
                        outline: 'none',
                        resize: 'none',
                      }}
                      value={slides[activeSlideIndex].bullets.join('\n')}
                      onChange={(e) => {
                        const copy = [...slides];
                        copy[activeSlideIndex].bullets = e.target.value.split('\n');
                        setSlides(copy);
                      }}
                    />
                  </div>

                  <Flexbox justify="space-between" align="center" horizontal>
                    <Text fontSize={11} style={{ color: '#94A3B8' }}>
                      MCIT AI Studio &bull; Slide {activeSlideIndex + 1} of {slides.length}
                    </Text>
                    {slides.length > 1 && (
                      <Button
                        danger
                        size="small"
                        icon={<Trash2 size={13} />}
                        onClick={() => {
                          const copy = slides.filter((_, i) => i !== activeSlideIndex);
                          setSlides(copy);
                          setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
                        }}
                      >
                        Delete Slide
                      </Button>
                    )}
                  </Flexbox>
                </div>
              </Flexbox>
            )}
          </div>
        </div>
      )}

      {/* 2. PDF CRAFT (REPORT STUDIO) */}
      {format === 'pdf' && (
        <div className={styles.editorBox}>
          <Flexbox justify="space-between" align="center" horizontal style={{ marginBottom: 20 }}>
            <Flexbox gap={4}>
              <Flexbox horizontal align="center" gap={8}>
                <FileText size={20} style={{ color: 'var(--ant-color-primary)' }} />
                <Text fontSize={18} weight="bold">
                  PDF Craft &bull; Structured Report Editor
                </Text>
              </Flexbox>
              <Text type="secondary" fontSize={13}>
                Formatted executive summary, analytical sections, and one-click PDF export
              </Text>
            </Flexbox>
            <Button icon={<Download size={16} />} type="primary" onClick={handleExportPdf}>
              Export .PDF File
            </Button>
          </Flexbox>

          <Flexbox gap={16}>
            <label>
              <Text fontSize={13} weight="bold">
                Report Title
              </Text>
              <input
                className={styles.input}
                style={{ marginTop: 6 }}
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </label>

            <label>
              <Text fontSize={13} weight="bold">
                Executive Summary
              </Text>
              <textarea
                className={styles.textarea}
                style={{ marginTop: 6 }}
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
              />
            </label>

            <Text weight="bold" fontSize={15} style={{ marginTop: 8 }}>
              Report Sections ({reportSections.length})
            </Text>

            {reportSections.map((sec, idx) => (
              <div
                key={sec.id}
                style={{
                  padding: 18,
                  borderRadius: 12,
                  border: '1px solid var(--ant-color-border-secondary)',
                  background: 'var(--ant-color-fill-quaternary)',
                }}
              >
                <Flexbox justify="space-between" align="center" horizontal style={{ marginBottom: 10 }}>
                  <Text weight="bold" fontSize={14}>
                    Section {idx + 1}
                  </Text>
                  {reportSections.length > 1 && (
                    <Button
                      danger
                      size="small"
                      icon={<Trash2 size={13} />}
                      onClick={() => setReportSections(reportSections.filter((_, i) => i !== idx))}
                    >
                      Delete
                    </Button>
                  )}
                </Flexbox>
                <input
                  className={styles.input}
                  placeholder="Section Title"
                  style={{ marginBottom: 10 }}
                  value={sec.title}
                  onChange={(e) => {
                    const copy = [...reportSections];
                    copy[idx].title = e.target.value;
                    setReportSections(copy);
                  }}
                />
                <textarea
                  className={styles.textarea}
                  placeholder="Section Content..."
                  value={sec.content}
                  onChange={(e) => {
                    const copy = [...reportSections];
                    copy[idx].content = e.target.value;
                    setReportSections(copy);
                  }}
                />
              </div>
            ))}

            <Button
              icon={<Plus size={15} />}
              onClick={() => {
                const newSec: ReportSection = {
                  id: String(reportSections.length + 1),
                  title: `New Section ${reportSections.length + 1}`,
                  content: 'Enter section observations and analysis...',
                };
                setReportSections([...reportSections, newSec]);
              }}
            >
              Add Section
            </Button>
          </Flexbox>
        </div>
      )}

      {/* 3. INFOGRAPHIC STUDIO */}
      {format === 'infograph' && (
        <div className={styles.editorBox}>
          <Flexbox justify="space-between" align="center" horizontal style={{ marginBottom: 20 }}>
            <Flexbox gap={4}>
              <Flexbox horizontal align="center" gap={8}>
                <LayoutTemplate size={20} style={{ color: 'var(--ant-color-primary)' }} />
                <Text fontSize={18} weight="bold">
                  Infographic Visualizer
                </Text>
              </Flexbox>
              <Text type="secondary" fontSize={13}>
                Interactive visual cards, KPIs, and executive fact sheet
              </Text>
            </Flexbox>
            <Button
              icon={<Download size={16} />}
              type="primary"
              onClick={() => {
                window.print();
              }}
            >
              Print / Save Infograph
            </Button>
          </Flexbox>

          <input
            className={styles.input}
            style={{ marginBottom: 20, fontSize: 18, fontWeight: 'bold' }}
            value={infoTitle}
            onChange={(e) => setInfoTitle(e.target.value)}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {infoStats.map((st, i) => (
              <div
                key={i}
                style={{
                  padding: 20,
                  borderRadius: 14,
                  border: '1px solid var(--ant-color-border-secondary)',
                  background: 'var(--ant-color-fill-quaternary)',
                }}
              >
                <input
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ant-color-primary)',
                    fontSize: 28,
                    fontWeight: 'bold',
                    width: '100%',
                    outline: 'none',
                  }}
                  value={st.val}
                  onChange={(e) => {
                    const copy = [...infoStats];
                    copy[i].val = e.target.value;
                    setInfoStats(copy);
                  }}
                />
                <input
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    width: '100%',
                    marginTop: 6,
                    outline: 'none',
                  }}
                  value={st.label}
                  onChange={(e) => {
                    const copy = [...infoStats];
                    copy[i].label = e.target.value;
                    setInfoStats(copy);
                  }}
                />
                <input
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 12,
                    color: 'var(--ant-color-text-secondary)',
                    width: '100%',
                    marginTop: 4,
                    outline: 'none',
                  }}
                  value={st.desc}
                  onChange={(e) => {
                    const copy = [...infoStats];
                    copy[i].desc = e.target.value;
                    setInfoStats(copy);
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              padding: 18,
              borderRadius: 12,
              border: '1px solid var(--ant-color-border-secondary)',
              background: 'var(--ant-color-fill-tertiary)',
            }}
          >
            <Text weight="bold" fontSize={14}>
              Executive Summary & Strategic Takeaways
            </Text>
            <Text type="secondary" fontSize={13} style={{ display: 'block', marginTop: 6, lineHeight: 1.6 }}>
              The Ministry of Communications and Information Technology maintains sovereign oversight over on-premise
              AI systems. All telemetry egress is disabled, ensuring full compliance with national data privacy standards.
            </Text>
          </div>
        </div>
      )}
    </div>
  );
});

StudioPage.displayName = 'StudioPage';

export default StudioPage;
