import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # Widescreen 16:9
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors
    c_bg = RGBColor(10, 14, 23)        # #0A0E17 Deep Midnight Obsidian
    c_card = RGBColor(17, 24, 39)      # #111827 Dark Card
    c_card_inner = RGBColor(23, 32, 51)# #172033 Card inner
    c_gold = RGBColor(212, 175, 55)    # #D4AF37 Royal Egyptian Gold
    c_gold_light = RGBColor(245, 214, 115) # #F5D673 Soft Gold
    c_cyan = RGBColor(56, 189, 248)    # #38BDF8 Electric Cyan
    c_green = RGBColor(52, 211, 153)   # #34D399 Mint Green
    c_white = RGBColor(248, 250, 252)  # #F8FAFC Crisp White
    c_muted = RGBColor(148, 163, 184)  # #94A3B8 Silver Gray

    # Ministry Logo path
    logo_candidates = [
        r"C:\MCIT AI Final\mcit-logo.png",
        r"C:\MCIT AI Final\frontend\public\mcit-logo.png",
        r"C:\Users\abdoh\OneDrive\Documents\Desktop\mcit-logo.png"
    ]
    mcit_logo = next((p for p in logo_candidates if os.path.exists(p)), None)

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = c_bg
        bg.line.fill.background()
        return bg

    def add_top_bar(slide, title_text, category="TuT AI — SOVEREIGN INTELLIGENCE PLATFORM"):
        # Category tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(9.8), Inches(0.4))
        tf = cat_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = category.upper()
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = c_gold

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(9.8), Inches(0.7))
        tf2 = title_box.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = title_text
        p2.font.name = "Arial"
        p2.font.size = Pt(24)
        p2.font.bold = True
        p2.font.color.rgb = c_white

        # Ministry Logo at top right of every slide
        if mcit_logo:
            slide.shapes.add_picture(mcit_logo, Inches(11.1), Inches(0.42), width=Inches(1.43), height=Inches(0.75))

        # Divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.733), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = c_gold
        line.line.fill.background()

    def add_card(slide, left, top, width, height, title, items, badge="", accent_color=c_gold):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = c_card
        card.line.color.rgb = accent_color
        card.line.width = Pt(1.2)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.25)
        tf.margin_bottom = Inches(0.2)

        if badge:
            p_badge = tf.paragraphs[0]
            p_badge.text = badge.upper()
            p_badge.font.name = "Arial"
            p_badge.font.size = Pt(10)
            p_badge.font.bold = True
            p_badge.font.color.rgb = accent_color
            p_badge.space_after = Pt(4)
            p_title = tf.add_paragraph()
        else:
            p_title = tf.paragraphs[0]

        p_title.text = title
        p_title.font.name = "Arial"
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = c_white
        p_title.space_after = Pt(10)

        for itm in items:
            p = tf.add_paragraph()
            p.text = f"•  {itm}"
            p.font.name = "Arial"
            p.font.size = Pt(12)
            p.font.color.rgb = c_muted
            p.space_after = Pt(6)

        return card

    def add_showcase_card(slide, left, top, width, height, title, items, badge="", accent_color=c_gold):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = c_card
        card.line.color.rgb = accent_color
        card.line.width = Pt(1.2)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.2)
        tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.12)
        tf.margin_bottom = Inches(0.08)

        if badge:
            p_badge = tf.paragraphs[0]
            p_badge.text = badge.upper()
            p_badge.font.name = "Arial"
            p_badge.font.size = Pt(9)
            p_badge.font.bold = True
            p_badge.font.color.rgb = accent_color
            p_badge.space_after = Pt(2)
            p_title = tf.add_paragraph()
        else:
            p_title = tf.paragraphs[0]

        p_title.text = title
        p_title.font.name = "Arial"
        p_title.font.size = Pt(13)
        p_title.font.bold = True
        p_title.font.color.rgb = c_white
        p_title.space_after = Pt(4)

        for itm in items:
            p = tf.add_paragraph()
            p.text = f"•  {itm}"
            p.font.name = "Arial"
            p.font.size = Pt(10.5)
            p.font.color.rgb = c_muted
            p.space_after = Pt(2)

        return card

    def add_image_showcase(slide, img_path, left, top, width, height, border_color=c_gold):
        bezel_margin = Inches(0.06)
        bezel = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            left - bezel_margin,
            top - bezel_margin,
            width + (bezel_margin * 2),
            height + (bezel_margin * 2)
        )
        bezel.fill.solid()
        bezel.fill.fore_color.rgb = c_card
        bezel.line.color.rgb = border_color
        bezel.line.width = Pt(1.5)

        if os.path.exists(img_path):
            slide.shapes.add_picture(img_path, left, top, width, height)
        else:
            print(f"WARNING: Image not found at {img_path}")

    # =========================================================================
    # SLIDE 1: COVER
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Ministry Logo at top
    if mcit_logo:
        s1.shapes.add_picture(mcit_logo, Inches(1.2), Inches(0.8), width=Inches(1.85), height=Inches(0.96))

    # Accent decorative box
    gold_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(2.1), Inches(0.12), Inches(3.6))
    gold_bar.fill.solid()
    gold_bar.fill.fore_color.rgb = c_gold
    gold_bar.line.fill.background()

    tb = s1.shapes.add_textbox(Inches(1.2), Inches(1.9), Inches(11), Inches(4.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p_badge = tf.paragraphs[0]
    p_badge.text = "MINISTRY OF COMMUNICATIONS AND INFORMATION TECHNOLOGY (MCIT)"
    p_badge.font.name = "Arial"
    p_badge.font.size = Pt(12)
    p_badge.font.bold = True
    p_badge.font.color.rgb = c_gold
    p_badge.space_after = Pt(12)

    p_main = tf.add_paragraph()
    p_main.text = "TuT AI: Sovereign Local AI Platform"
    p_main.font.name = "Arial"
    p_main.font.size = Pt(42)
    p_main.font.bold = True
    p_main.font.color.rgb = c_white
    p_main.space_after = Pt(10)

    p_sub = tf.add_paragraph()
    p_sub.text = "Strategic Pitch Deck — 100% Offline National Intelligence, Deep Summarization, Autonomous Presentations & Vector Infographics"
    p_sub.font.name = "Arial"
    p_sub.font.size = Pt(18)
    p_sub.font.color.rgb = c_cyan
    p_sub.space_after = Pt(16)

    # =========================================================================
    # SLIDE 2: THE PROBLEM & SOVEREIGN IMPERATIVE
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_top_bar(s2, "The Strategic Imperative: Why Sovereign Local AI Matters", "Challenge & Opportunity")

    add_card(s2, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "1. Severe Data Security Risks",
             [
                 "Relying on foreign commercial clouds (OpenAI, Claude) means confidential state data leaves Egypt.",
                 "Strict government data laws forbid storing ministerial decrees and citizen archives abroad.",
                 "Risk of third-party model retraining on sensitive Egyptian intellectual property.",
                 "Cloud services remain vulnerable to international outages, embargoes, and rate limits."
             ],
             badge="Vulnerability", accent_color=RGBColor(239, 68, 68))

    add_card(s2, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "2. The Document Bottleneck",
             [
                 "Ministries process thousands of 100+ page technical specs, legal decrees, and briefs daily.",
                 "Human summarization takes hours or days, causing executive bottlenecks in decision-making.",
                 "Building slide presentations and executive infographics requires multiple manual designers.",
                 "High recurring SaaS subscription fees for disparate design and AI editing platforms."
             ],
             badge="Operational Friction", accent_color=RGBColor(245, 158, 11))

    add_card(s2, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "3. The TuT AI Breakthrough",
             [
                 "100% On-Premise, Air-Gapped execution on local Egyptian infrastructure.",
                 "Zero cloud transmission — works completely offline without internet connectivity.",
                 "Unifies deep research, document drafting, slides, and spreadsheet audit in one single sign-on.",
                 "Maximizes local hardware via dedicated NVIDIA GPU acceleration."
             ],
             badge="Sovereign Solution", accent_color=c_green)

    # =========================================================================
    # SLIDE 3: THREE CORE POWERHOUSES
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_top_bar(s3, "TuT AI Core Engine: Three Deliverable Powerhouses", "Platform Capabilities")

    add_card(s3, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "📑 Deep Summarization",
             [
                 "Ingests 100+ page PDFs, Word docs, decrees, and raw spreadsheets into local notebooks.",
                 "Hierarchical multi-tier synthesis: Executive Brief, Chapter Breakdown, and Key Deliverables.",
                 "Grounded passage citations: Every bullet point is bound to exact numbered passage references.",
                 "Guaranteed Zero-Hallucination via local vector and full-text hybrid RAG retrieval."
             ],
             badge="Research Engine", accent_color=c_cyan)

    add_card(s3, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "📊 Autonomous Presentations",
             [
                 "Prompts in natural language directly generate complete 12+ slide PowerPoint decks (.pptx).",
                 "DeckCraft local engine with strict MCIT branding, Nohemi typography, and royal gold accents.",
                 "5-pass automated layout audit loop fixes text overflow, card alignment, and visual balance.",
                 "Direct download in chat & instant editing via integrated ONLYOFFICE Document Server."
             ],
             badge="DeckCraft Studio", accent_color=c_gold)

    add_card(s3, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "🎨 Vector Infographics",
             [
                 "Translates complex metrics, policy timelines, and architectures into visual sketchnotes.",
                 "VectorCraft engine integrates Open Doodles, structured flowchart arrows, and metric badges.",
                 "High-resolution exports in PNG, scalable SVG, and print-ready vector PDF.",
                 "Instantly embeds into official ministerial publications and social media briefs."
             ],
             badge="VectorCraft Studio", accent_color=c_green)

    # =========================================================================
    # SLIDE 4: DEEP DIVE: SUMMARIZATION
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_top_bar(s4, "Pillar 1: Intelligent Deep Summarization Engine", "Core Feature Deep-Dive")

    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0),
             "Multi-Source Knowledge Digestion",
             [
                 "Omni-Channel Ingestion: Scanned and text PDFs, Word (.docx), Excel spreadsheets, audio transcripts, and HTML portals.",
                 "Local Chunking & Vectorization: Embeddings generated on-premise using nomic-embed-text via local Ollama bridge.",
                 "SurrealDB Account Isolation: Each ministry department and user operates in a segregated, sandboxed database.",
                 "Lightning Synthesis: Synthesizes complex multi-volume reports into an executive brief in under 20 seconds."
             ],
             badge="Architecture", accent_color=c_cyan)

    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
             "Grounded Trust & Zero-Hallucination",
             [
                 "Numbered Citation System: Summary sentences display [1], [2] clickable references pointing back to the exact passage.",
                 "Context-Locked LLM: The model is strictly instructed to answer only from verified retrieved passages.",
                 "Executive Summary Tiers: Switch between a 1-page High-Level Digest, a 5-page Comprehensive Study, or a Table of Deliverables.",
                 "Arabic & English Mastery: Full bilingual comprehension of complex Egyptian administrative and legal phrasing."
             ],
             badge="Verification", accent_color=c_gold)

    # =========================================================================
    # SLIDE 5: DEEP DIVE: PRESENTATION ENGINE
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_top_bar(s5, "Pillar 2: Autonomous PowerPoint Presentation Engine", "Core Feature Deep-Dive")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0),
             "End-to-End In-Chat Generation",
             [
                 "Natural Language Prompting: Ask TuT Agent: 'Create a 12-slide presentation on Egypt Vision 2030 digital pillars'.",
                 "Local MCP Protocol: Agent invokes the local deck generator tool via Model Context Protocol (MCP) in real-time.",
                 "Production Deck Output: Produces a genuine, fully editable .pptx file (5+ MB) directly in the conversation stream.",
                 "Instant ONLYOFFICE Editing: Click to open in port :8082 without needing Microsoft Office installed on the PC."
             ],
             badge="Conversational Flow", accent_color=c_gold)

    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
             "DeckCraft Design & Audit Pipeline",
             [
                 "Approved MCIT Typography: Automatically embeds Nohemi headings, Libre Franklin body, and Inter covers.",
                 "Royal Obsidian Theme: High-contrast midnight obsidian background with royal Egyptian gold framing (#D4AF37).",
                 "Multi-Slide Typology: Hero cover slides, 3-pillar metric cards, timeline roadmaps, and closing executive summaries.",
                 "Automated Layout Audit: Self-healing loop inspects slide text lengths and refactors cards to ensure zero visual overlap."
             ],
             badge="Design Rigor", accent_color=c_cyan)

    # =========================================================================
    # SLIDE 6: DEEP DIVE: INFOGRAPHICS STUDIO
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_top_bar(s6, "Pillar 3: VectorCraft Infographics Studio", "Core Feature Deep-Dive")

    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0),
             "Visualizing Abstract Governmental Data",
             [
                 "From Numbers to Art: Transforms dry tables and statistical metrics into intuitive visual sketchnotes.",
                 "Process & Flow Mapping: Automatically draws sequential arrows, milestone containers, and dependency diagrams.",
                 "Open Doodles & Custom Vector Icons: Integrates approved human-centric vector doodles for friendly, modern appeal.",
                 "Responsive Layouts: Generates square, portrait, and landscape compositions adapted for print, web, or mobile."
             ],
             badge="Visual Design", accent_color=c_green)

    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
             "Multi-Format Sovereign Export",
             [
                 "Vector SVG Export: Infinitely scalable vector art suitable for billboards, official banners, and web publication.",
                 "Ultra-HD PNG: High-DPI raster output for seamless embedding into Word reports, executive PDFs, and emails.",
                 "Print-Ready PDF: Vector PDF output matching international A4 / A3 print standards.",
                 "Zero Cloud Dependency: All rendering done via local Node.js VectorCraft engine inside Docker container."
             ],
             badge="Production Formats", accent_color=c_gold)

    # =========================================================================
    # SLIDE 7: LIVE PLATFORM SHOWCASE: KNOWLEDGE NOTEBOOKS & MULTI-SOURCE RAG
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_top_bar(s7, "Live Platform Showcase: Knowledge Notebooks & Multi-Source RAG", "Live System Interface")

    img_notebooks = r"C:\MCIT AI Final\docs\images\tut_ui_notebooks.png"
    if not os.path.exists(img_notebooks):
        img_notebooks = r"C:\Users\abdoh\OneDrive\Documents\Desktop\tut_ui_notebooks.png"

    add_image_showcase(s7, img_notebooks, Inches(0.8), Inches(1.95), Inches(7.4), Inches(4.38), border_color=c_gold)

    add_showcase_card(s7, Inches(8.5), Inches(1.88), Inches(4.03), Inches(1.48),
                      "Multi-Source Knowledge Ingestion",
                      [
                          "Ingests massive governmental PDFs (e.g. WEF Global Risks Report 2024), decrees, and spreadsheets.",
                          "Full-text search & vector embeddings extracted and stored 100% locally."
                      ],
                      badge="Data Ingestion", accent_color=c_gold)

    add_showcase_card(s7, Inches(8.5), Inches(3.52), Inches(4.03), Inches(1.48),
                      "Departmental Notebook Sandboxing",
                      [
                          "Isolated sovereign workspaces ('dsc', 'klh', 'arfa', 'eg') protect departmental boundaries.",
                          "Prevents data cross-contamination with secure account-level isolation."
                      ],
                      badge="Security & Isolation", accent_color=c_cyan)

    add_showcase_card(s7, Inches(8.5), Inches(5.16), Inches(4.03), Inches(1.48),
                      "Sovereign National Attribution",
                      [
                          "Custom-built for the Ministry of Communications & Information Technology.",
                          "Verified interface attribution: 'Developed by Eng Ahmed Arfa for MCIT'."
                      ],
                      badge="MCIT Provenance", accent_color=c_green)

    # =========================================================================
    # SLIDE 8: LIVE AGENT SHOWCASE: IN-CHAT DECK GENERATION & 3D AVATAR
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_top_bar(s8, "Live Agent Showcase: In-Chat Deck Generation & 3D Avatar", "Conversational Intelligence")

    img_agent = r"C:\MCIT AI Final\docs\images\tut_ui_agent.png"
    if not os.path.exists(img_agent):
        img_agent = r"C:\Users\abdoh\OneDrive\Documents\Desktop\tut_ui_agent.png"

    add_image_showcase(s8, img_agent, Inches(0.8), Inches(1.95), Inches(7.4), Inches(4.38), border_color=c_cyan)

    add_showcase_card(s8, Inches(8.5), Inches(1.88), Inches(4.03), Inches(1.48),
                      "3D Holographic Sovereign Avatar",
                      [
                          "Interactive real-time 3D King Tut avatar blending Egyptian heritage with state-of-the-art AI.",
                          "Dynamic state cues respond to thought cycles and generation stages."
                      ],
                      badge="Sovereign Identity", accent_color=c_gold)

    add_showcase_card(s8, Inches(8.5), Inches(3.52), Inches(4.03), Inches(1.48),
                      "In-Chat Autonomous Presentation Engine",
                      [
                          "Live conversational workflow: User asks in Arabic for presentations on complex national topics.",
                          "Generates genuine, fully editable PowerPoint decks (.pptx) right inside chat."
                      ],
                      badge="DeckCraft Engine", accent_color=c_cyan)

    add_showcase_card(s8, Inches(8.5), Inches(5.16), Inches(4.03), Inches(1.48),
                      "Pinned Local Gemma 4 Engine",
                      [
                          "Powered by Gemma 4 e4b pinned directly in NVIDIA RTX GPU VRAM.",
                          "Instant token streaming with zero latency and 100% offline data privacy."
                      ],
                      badge="GPU Acceleration", accent_color=c_green)

    # =========================================================================
    # SLIDE 9: TECHNICAL ARCHITECTURE & SPEED
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    add_top_bar(s9, "Technical Breakthroughs: 131k Context & GPU Acceleration", "Engineering Rigor")

    add_card(s9, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "131k Context Window",
             [
                 "PostgreSQL database tables unlocked to 131,072 context tokens.",
                 "16,384 maximum output tokens for exhaustive document generation.",
                 "Eliminates memory truncation: Ingest entire decree books without losing context.",
                 "Reasoning mode: 'pro' with 8,192 dedicated thinking budget."
             ],
             badge="Model Capacity", accent_color=c_cyan)

    add_card(s9, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "NVIDIA RTX 4050 GPU VRAM",
             [
                 "Pinned local gemma4:e4b weights in dedicated 5.1 GB GPU VRAM.",
                 "Configured keep_alive: '-1' to completely eliminate cold-start unloading.",
                 "Instant response velocity: First token streamed in milliseconds.",
                 "Optimized for smooth pair programming and multi-turn conversational agents."
             ],
             badge="Velocity", accent_color=c_gold)

    add_card(s9, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "Self-Healing Docker Stack",
             [
                 "11 isolated Docker services: Agent, Platform, ONLYOFFICE, SurrealDB, Postgres, Redis, Kokoro.",
                 "Built-in runtime self-patching in startServer.js guarantees TRPC stability on container boot.",
                 "Turnkey 1-click bootstrap scripts (.ps1 and .sh) launch the full ecosystem in under 15 seconds.",
                 "All source code versioned on GitHub: MCIT-DEPI/DEPI-PPTX."
             ],
             badge="Resilience", accent_color=c_green)

    # =========================================================================
    # SLIDE 10: THE DEVELOPMENT JOURNEY (مراحل التطوير)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    add_top_bar(s10, "The Development Journey: 4 Evolutionary Phases", "Engineering Milestones")

    add_card(s10, Inches(0.8), Inches(1.8), Inches(5.7), Inches(2.4),
             "Phase 1: Foundation & Sovereign Identity",
             [
                 "Transitioned away from generic third-party code to 100% Egyptian sovereign platform.",
                 "Engineered the TuT AI identity: 10 historical personas & 3D holographic cartouche."
             ],
             badge="Phase 1: Inception", accent_color=c_gold)

    add_card(s10, Inches(6.8), Inches(1.8), Inches(5.7), Inches(2.4),
             "Phase 2: Core Engines & Resilient Fixes",
             [
                 "Engineered the 3 pillars: Deep Summarization, DeckCraft (.pptx), and VectorCraft (infographics).",
                 "Resolved TRPC runtime crashes via intelligent local Ollama fallback proxy."
             ],
             badge="Phase 2: Architecture", accent_color=c_cyan)

    add_card(s10, Inches(0.8), Inches(4.4), Inches(5.7), Inches(2.4),
             "Phase 3: Model Intelligence & GPU Velocity",
             [
                 "Unlocked database to 131,072 context tokens, 16,384 output tokens, and 'pro' reasoning.",
                 "Pinned gemma4:e4b into NVIDIA RTX 4050 GPU VRAM (keep_alive: '-1') for instant streaming."
             ],
             badge="Phase 3: Intelligence", accent_color=c_green)

    add_card(s10, Inches(6.8), Inches(4.4), Inches(5.7), Inches(2.4),
             "Phase 4: Turnkey Production & GitHub Release",
             [
                 "Built self-healing Docker architecture and turnkey 1-click setup scripts (.ps1 and .sh).",
                 "Integrated ONLYOFFICE document server and published full production repo to GitHub."
             ],
             badge="Phase 4: Production", accent_color=RGBColor(245, 158, 11))

    # =========================================================================
    # SLIDE 11: STRATEGIC IMPACT FOR MCIT
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_top_bar(s11, "Strategic & Economic Impact for MCIT & Government", "Institutional Value")

    add_card(s11, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "100% Data Sovereignty",
             [
                 "Zero cloud leakage: Classified ministerial files remain within the state firewall.",
                 "Full compliance with national cybersecurity and data protection frameworks.",
                 "Immune to foreign sanctions, cloud pricing hikes, or global connection blackouts.",
                 "Total ownership of code, weights, data, and fine-tuned domain models."
             ],
             badge="Sovereignty", accent_color=c_green)

    add_card(s11, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "10x Operational Speed",
             [
                 "Reduces 4-hour document reading to a 30-second verified executive summary.",
                 "Eliminates external design delays: Generates ready-to-present PowerPoint decks on demand.",
                 "Instant ONLYOFFICE co-editing: Staff collaborate inside the platform without license costs.",
                 "Empowers leadership with real-time strategic briefs during meetings."
             ],
             badge="Productivity", accent_color=c_gold)

    add_card(s11, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
             "Zero Recurring SaaS Costs",
             [
                 "No per-seat licensing fees (saving thousands of dollars annually on Copilot / ChatGPT Plus).",
                 "Runs on existing departmental GPUs and workstations without expensive cloud clusters.",
                 "Built on robust open-source foundations (SurrealDB, ParadeDB, Next.js, Fastify).",
                 "Future-proof modularity: swap underlying open models seamlessly."
             ],
             badge="Cost Efficiency", accent_color=c_cyan)

    # =========================================================================
    # SLIDE 12: FUTURE ROADMAP
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)
    add_top_bar(s12, "Strategic Future Roadmap: Expanding TuT AI", "Evolution")

    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.7), Inches(2.4),
             "1. Ultra-Fast Inference via vLLM",
             [
                 "Integrate containerized vLLM with PagedAttention to achieve 60–80+ tokens/sec on RTX GPUs.",
                 "Support concurrent multi-user streaming for entire ministerial departments."
             ],
             badge="Speed", accent_color=c_cyan)

    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.7), Inches(2.4),
             "2. Egyptian Governmental LoRA Fine-Tuning",
             [
                 "Fine-tune specialized LoRA adapters on official ministerial circulars, decrees, and laws.",
                 "Guarantees 100% authentic Egyptian administrative protocol and terminology."
             ],
             badge="Specialization", accent_color=c_gold)

    add_card(s12, Inches(0.8), Inches(4.4), Inches(5.7), Inches(2.4),
             "3. Multimodal Vision for Scanned PDFs",
             [
                 "Deploy Qwen2-VL or Llama-3.2-Vision to process historical Arabic manuscripts, stamps, and blueprints.",
                 "Direct table extraction from paper scans directly into Excel and charts."
             ],
             badge="Vision", accent_color=c_green)

    add_card(s12, Inches(6.8), Inches(4.4), Inches(5.7), Inches(2.4),
             "4. Autonomous Multi-Agent Swarms",
             [
                 "Autonomous delegation: Thoth researches, Imhotep audits data, and TuT delivers the final slides.",
                 "Zero human micromanagement on complex multi-step state projects."
             ],
             badge="Multi-Agent", accent_color=RGBColor(245, 158, 11))

    # =========================================================================
    # SLIDE 13: LEADERSHIP & PROJECT TEAM
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_bg(s13)
    add_top_bar(s13, "Project Leadership & Development Team", "People & Governance")

    # Leadership Box
    card_lead = s13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
    card_lead.fill.solid()
    card_lead.fill.fore_color.rgb = c_card
    card_lead.line.color.rgb = c_gold
    card_lead.line.width = Pt(1.5)

    tf_lead = card_lead.text_frame
    tf_lead.word_wrap = True
    tf_lead.margin_left = Inches(0.3)
    tf_lead.margin_top = Inches(0.3)

    p = tf_lead.paragraphs[0]
    p.text = "MINISTRY HEADS & SUPERVISION"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_gold
    p.space_after = Pt(8)

    p = tf_lead.add_paragraph()
    p.text = "Ministry Leadership & Guidance"
    p.font.name = "Arial"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = c_white
    p.space_after = Pt(18)

    supervisors = [
        "Dr. Mohamed Rehan",
        "Eng. Reham Metwally",
        "Eng. Mohamed Khalid Mohamed Roshdy"
    ]

    for name in supervisors:
        p1 = tf_lead.add_paragraph()
        p1.text = f"🎖️  {name}"
        p1.font.name = "Arial"
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = c_gold_light
        p1.space_after = Pt(20)

    # Team Box
    card_team = s13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    card_team.fill.solid()
    card_team.fill.fore_color.rgb = c_card
    card_team.line.color.rgb = c_cyan
    card_team.line.width = Pt(1.5)

    tf_team = card_team.text_frame
    tf_team.word_wrap = True
    tf_team.margin_left = Inches(0.3)
    tf_team.margin_top = Inches(0.3)

    p = tf_team.paragraphs[0]
    p.text = "ENGINEERING & DEVELOPMENT TEAM"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_cyan
    p.space_after = Pt(8)

    p = tf_team.add_paragraph()
    p.text = "TuT AI Core Team"
    p.font.name = "Arial"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = c_white
    p.space_after = Pt(16)

    team_members = [
        "Ahmed Gamal Sophi Arfa",
        "Abdelrhman Mahmoud Fawzy",
        "Saja Raafat Gaber",
        "Mohamed Hamdy Abdelazez",
        "Asmaa Samy Hagag",
        "Mohamed Abd elhgani el kwatihy"
    ]

    for name in team_members:
        p1 = tf_team.add_paragraph()
        is_lead = "Ahmed Gamal Sophi Arfa" in name
        p1.text = f"{'⭐' if is_lead else '•'}  {name}"
        p1.font.name = "Arial"
        p1.font.size = Pt(14 if is_lead else 13)
        p1.font.bold = True
        p1.font.color.rgb = c_gold if is_lead else c_white
        p1.space_after = Pt(12 if is_lead else 8)

    # =========================================================================
    # SLIDE 14: CONCLUSION & CALL TO ACTION
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    add_bg(s14)

    if mcit_logo:
        s14.shapes.add_picture(mcit_logo, Inches(5.72), Inches(0.6), width=Inches(1.88), height=Inches(0.98))

    tb = s14.shapes.add_textbox(Inches(1.5), Inches(1.7), Inches(10.33), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "SOVEREIGNTY IS OUR FOUNDATION"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_gold
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(16)

    p = tf.add_paragraph()
    p.text = "TuT AI is Ready for Institutional Deployment"
    p.font.name = "Arial"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = c_white
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(18)

    p = tf.add_paragraph()
    p.text = "Delivering national data security, autonomous PowerPoint presentations, deep document summarization, and vector infographics on local Egyptian hardware."
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.color.rgb = c_cyan
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(32)

    p = tf.add_paragraph()
    p.text = "GitHub Repository: https://github.com/MCIT-DEPI/DEPI-PPTX\nLocal Endpoints: http://localhost:3210 (TuT Agent) | http://localhost:8502 (Platform)"
    p.font.name = "Arial"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = c_gold_light
    p.alignment = PP_ALIGN.CENTER

    # Save to Desktop
    desktop_path = r"C:\Users\abdoh\OneDrive\Documents\Desktop\TuT_AI_Marketing_Pitch_Deck.pptx"
    prs.save(desktop_path)
    print(f"SUCCESS: Saved presentation to {desktop_path}")

    # Also save inside project docs
    project_doc_path = r"C:\MCIT AI Final\docs\TuT_AI_Marketing_Pitch_Deck.pptx"
    prs.save(project_doc_path)
    print(f"SUCCESS: Saved copy to {project_doc_path}")

    # Also save to project root
    root_path = r"C:\MCIT AI Final\TuT_AI_Marketing_Pitch_Deck.pptx"
    prs.save(root_path)
    print(f"SUCCESS: Saved copy to {root_path}")

if __name__ == "__main__":
    create_presentation()
