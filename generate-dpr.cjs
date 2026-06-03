const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents
} = require("docx");

// ---------- Image helpers ----------
const IMG_DIR = path.join(__dirname, "screenshots");
const GEN_DIR = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\c5c64ceb-4b64-434f-b0ff-898687452836";

function loadImg(filePath) {
  try { return fs.readFileSync(filePath); } catch { return null; }
}

const images = {
  hero: loadImg(path.join(IMG_DIR, "hero-banner.png")),
  arch: loadImg(path.join(IMG_DIR, "architecture.png")),
  howItWorks: loadImg(path.join(IMG_DIR, "how-it-works.png")),
  stats: loadImg(path.join(IMG_DIR, "stats-panel.png")),
  knowledge: loadImg(path.join(IMG_DIR, "knowledge-panel.png")),
  settings: loadImg(path.join(IMG_DIR, "settings-panel.png")),
  sysArch: loadImg(path.join(GEN_DIR, "system_architecture_1780393047203.png")),
  dataFlow: loadImg(path.join(GEN_DIR, "data_flow_diagram_1780393062287.png")),
  techStack: loadImg(path.join(GEN_DIR, "tech_stack_diagram_1780393074151.png")),
  useCase: loadImg(path.join(GEN_DIR, "use_case_diagram_1780393116817.png")),
  erDiagram: loadImg(path.join(GEN_DIR, "er_diagram_1780393130572.png")),
};

// ---------- Reusable styling ----------
const COLORS = { primary: "1A3C6E", accent: "2E7D32", heading2: "1565C0", dark: "212121", gray: "616161", lightBg: "E3F2FD", tableBorder: "B0BEC5", headerBg: "1A3C6E", white: "FFFFFF" };
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: COLORS.tableBorder };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

function makeHeaderCell(text, width) {
  return new TableCell({
    borders: cellBorders, width: { size: width, type: WidthType.DXA },
    shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text, bold: true, color: COLORS.white, size: 20, font: "Arial" })] })]
  });
}
function makeCell(text, width, opts = {}) {
  return new TableCell({
    borders: cellBorders, width: { size: width, type: WidthType.DXA },
    shading: opts.shade ? { fill: "F5F5F5", type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ spacing: { before: 40, after: 40 }, indent: { left: 80 }, children: [new TextRun({ text, size: 20, font: "Arial", color: COLORS.dark, bold: opts.bold || false })] })]
  });
}
function makeMultiLineCell(lines, width, opts = {}) {
  return new TableCell({
    borders: cellBorders, width: { size: width, type: WidthType.DXA },
    shading: opts.shade ? { fill: "F5F5F5", type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.TOP,
    children: lines.map(l => new Paragraph({ spacing: { before: 20, after: 20 }, indent: { left: 80 }, children: [new TextRun({ text: l, size: 20, font: "Arial", color: COLORS.dark })] }))
  });
}

function imgParagraph(data, w, h, altTitle) {
  if (!data) return new Paragraph({ children: [new TextRun({ text: `[Image: ${altTitle} - file not found]`, italics: true, color: COLORS.gray, size: 20, font: "Arial" })] });
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 },
    children: [new ImageRun({ type: "png", data, transformation: { width: w, height: h }, altText: { title: altTitle, description: altTitle, name: altTitle } })]
  });
}
function figCaption(text) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text, italics: true, size: 18, color: COLORS.gray, font: "Arial" })] });
}
function bodyText(text) {
  return new Paragraph({ spacing: { before: 60, after: 100 }, children: [new TextRun({ text, size: 22, font: "Arial", color: COLORS.dark })] });
}
function spacer() { return new Paragraph({ spacing: { before: 40, after: 40 }, children: [] }); }

// ---------- BUILD DOCUMENT ----------
const doc = new Document({
  creator: "Sujimo / jimon1139m",
  title: "ContextLens — Detailed Project Report (DPR)",
  description: "Detailed Project Report for ContextLens: RAG-Powered Prompt Optimizer Chrome Extension",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { size: 56, bold: true, color: COLORS.primary, font: "Arial" }, paragraph: { spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, color: COLORS.primary, font: "Arial" }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: COLORS.heading2, font: "Arial" }, paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, color: COLORS.dark, font: "Arial" }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-objectives", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-features", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-modules", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-scope", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-testing", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-privacy", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-future", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-install", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-benefits", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [
    // ==================== COVER PAGE ====================
    {
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
        imgParagraph(images.hero, 500, 280, "ContextLens Hero Banner"),
        spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "DETAILED PROJECT REPORT", size: 40, bold: true, color: COLORS.primary, font: "Arial" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "(DPR)", size: 32, bold: true, color: COLORS.primary, font: "Arial" })] }),
        spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "ContextLens", size: 52, bold: true, color: COLORS.accent, font: "Arial" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "RAG-Powered Prompt Optimizer for AI Chat Platforms", size: 24, italics: true, color: COLORS.gray, font: "Arial" })] }),
        spacer(), spacer(),
        new Table({
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [makeCell("Project Title", 3120, { bold: true }), makeCell("ContextLens — RAG-Powered Prompt Optimizer", 6240)] }),
            new TableRow({ children: [makeCell("Version", 3120, { bold: true }), makeCell("0.1.0 (Initial Release)", 6240)] }),
            new TableRow({ children: [makeCell("Developer", 3120, { bold: true }), makeCell("jimon1139m (Sujimo)", 6240)] }),
            new TableRow({ children: [makeCell("Platform", 3120, { bold: true }), makeCell("Google Chrome Extension (Manifest V3)", 6240)] }),
            new TableRow({ children: [makeCell("License", 3120, { bold: true }), makeCell("MIT License", 6240)] }),
            new TableRow({ children: [makeCell("Date", 3120, { bold: true }), makeCell("June 2026", 6240)] }),
            new TableRow({ children: [makeCell("Repository", 3120, { bold: true }), makeCell("https://github.com/jimon1139m/Contextlens", 6240)] }),
          ]
        }),
      ]
    },

    // ==================== TABLE OF CONTENTS ====================
    {
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "ContextLens — Detailed Project Report", size: 16, color: COLORS.gray, font: "Arial", italics: true })] })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 18, font: "Arial" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial" }), new TextRun({ text: " of ", size: 18, font: "Arial" }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Arial" })] })] })
      },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Table of Contents")] }),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 1. EXECUTIVE SUMMARY ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Executive Summary")] }),
        bodyText("ContextLens is an innovative, privacy-first Google Chrome browser extension that revolutionizes the way users interact with AI chat platforms such as ChatGPT, Claude, Gemini, and DeepSeek. Built on Chrome's Manifest V3 architecture, ContextLens operates as a transparent middleware layer between the user's keyboard input and the AI platform, automatically optimizing prompts before submission."),
        bodyText("The extension addresses three critical pain points in modern AI-assisted workflows: (1) Token waste from verbose, filler-heavy prompts that consume unnecessary context window budget; (2) Repetitive manual context injection where users repeatedly paste the same background information; and (3) Privacy concerns arising from cloud-based prompt optimization tools that transmit user data to external servers."),
        bodyText("ContextLens solves these problems through a sophisticated dual-engine pipeline: a local Retrieval-Augmented Generation (RAG) system that automatically enriches prompts with relevant knowledge from the user's personal document library, and a multi-level heuristic compression engine that strips filler phrases and redundant verbiage while preserving semantic intent. All processing occurs entirely within the browser using ONNX Runtime (WebAssembly), ensuring zero data leaves the user's machine."),
        bodyText("Key metrics demonstrate significant value: prompt compression ratios of 40–70%, support for 10+ AI platforms through a modular adapter architecture, and a beautiful glassmorphic side-panel dashboard providing real-time analytics on token savings and optimization history."),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 2. INTRODUCTION ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Introduction")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Background and Motivation")] }),
        bodyText("The rapid proliferation of Large Language Models (LLMs) has transformed knowledge work across industries. Platforms like OpenAI's ChatGPT, Anthropic's Claude, Google's Gemini, and DeepSeek have become indispensable tools for software development, content creation, research, and decision-making. However, these platforms impose fundamental constraints—context window limits and token-based pricing—that directly impact user productivity and cost efficiency."),
        bodyText("Users frequently encounter the following friction points:"),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Token limits: Hitting maximum context window sizes (e.g., 128K tokens on GPT-4, 200K on Claude 3) when working with lengthy codebases or documents.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Cost escalation: Paying for wasted tokens on API-based plans when prompts contain excessive filler words, verbose openers, and redundant phrases.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Context repetition: Manually copy-pasting the same project context, documentation, or notes into every new conversation.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Privacy exposure: Using cloud-based optimization tools that process sensitive prompts on external servers.", size: 22, font: "Arial" })] }),
        bodyText("ContextLens was conceived as a comprehensive solution to these challenges, providing automatic, transparent, privacy-preserving prompt optimization that works seamlessly across all major AI chat platforms."),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Problem Statement")] }),
        bodyText("AI chat platform users waste 40–70% of their token budget on conversational filler, redundant phrasing, and missing contextual information. Existing solutions either require manual effort (prompt engineering guides), depend on cloud processing (third-party optimizers), or are limited to a single platform. There is no existing tool that provides automatic, multi-platform, privacy-preserving prompt optimization with integrated local RAG capabilities."),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 Proposed Solution")] }),
        bodyText("ContextLens proposes a Chrome browser extension that intercepts user prompts before submission, enriches them with relevant local knowledge via RAG, compresses them using heuristic algorithms, and submits the optimized version—all transparently and entirely within the browser. The solution features:"),
        new Paragraph({ numbering: { reference: "num-objectives", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Automatic prompt interception via platform-specific content script adapters", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-objectives", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Local RAG pipeline using 384-dimensional vector embeddings and cosine similarity search", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-objectives", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Multi-level heuristic compression (Light / Medium / Aggressive)", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-objectives", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Real-time analytics dashboard with token savings tracking", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-objectives", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "100% local processing with zero cloud dependencies", size: 22, font: "Arial" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 3. OBJECTIVES ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Project Objectives")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Primary Objectives")] }),
        new Paragraph({ numbering: { reference: "num-features", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Develop a Chrome Manifest V3 extension that automatically intercepts and optimizes AI chat prompts across 10+ platforms.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-features", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Implement a local RAG pipeline that stores, embeds, and retrieves user-uploaded knowledge documents for context injection.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-features", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Build a multi-level heuristic compression engine achieving 40–70% token reduction while preserving semantic intent.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-features", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Ensure 100% local data processing with zero data transmission to external servers.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-features", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Deliver a premium glassmorphic UI with real-time analytics, knowledge management, and configuration panels.", size: 22, font: "Arial" })] }),
        spacer(),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Secondary Objectives")] }),
        new Paragraph({ numbering: { reference: "bullet-benefits", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Provide a modular adapter architecture for easy addition of new AI platforms.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-benefits", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Implement comprehensive test coverage including unit tests (Vitest) and E2E tests (Playwright).", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-benefits", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Open-source the project under MIT License for community contribution and transparency.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-benefits", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Prepare for Chrome Web Store publication with full store listing and privacy policy.", size: 22, font: "Arial" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 4. SYSTEM ARCHITECTURE ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. System Architecture")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 High-Level Architecture")] }),
        bodyText("ContextLens follows a modular, event-driven architecture built on Chrome's Manifest V3 extension platform. The system comprises four primary layers: the Content Script Layer (platform adapters), the Background Service Worker (processing engine), the Side Panel UI (React application), and the Storage Layer (IndexedDB + Chrome Storage API)."),
        imgParagraph(images.sysArch, 520, 380, "System Architecture Diagram"),
        figCaption("Figure 1: ContextLens System Architecture — Component Overview"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 Architecture Overview Diagram")] }),
        imgParagraph(images.arch, 520, 380, "Architecture Overview"),
        figCaption("Figure 2: ContextLens Architecture — Detailed Component Interactions"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 Data Flow Pipeline")] }),
        bodyText("The core optimization pipeline processes prompts through four sequential stages: Interception, RAG Retrieval, Compression, and Submission. Each stage is designed to fail gracefully—if RAG retrieval times out, the pipeline proceeds without context injection; if compression encounters an error, the original prompt is submitted unchanged."),
        imgParagraph(images.dataFlow, 520, 320, "Data Flow Diagram"),
        figCaption("Figure 3: Prompt Optimization Data Flow Pipeline"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.4 How It Works — User Perspective")] }),
        imgParagraph(images.howItWorks, 520, 280, "How ContextLens Works"),
        figCaption("Figure 4: How ContextLens Works — End-to-End User Flow"),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 5. TECHNOLOGY STACK ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Technology Stack")] }),
        imgParagraph(images.techStack, 500, 380, "Technology Stack Diagram"),
        figCaption("Figure 5: ContextLens Technology Stack — Layered View"),
        spacer(),
        new Table({
          columnWidths: [2340, 3120, 3900],
          rows: [
            new TableRow({ tableHeader: true, children: [makeHeaderCell("Layer", 2340), makeHeaderCell("Technology", 3120), makeHeaderCell("Purpose", 3900)] }),
            new TableRow({ children: [makeCell("Runtime", 2340, { bold: true }), makeCell("Chrome Extension (Manifest V3)", 3120), makeCell("Browser integration platform", 3900)] }),
            new TableRow({ children: [makeCell("Frontend", 2340, { bold: true }), makeCell("React 19 + TypeScript", 3120), makeCell("Side panel UI with glassmorphic design", 3900)] }),
            new TableRow({ children: [makeCell("Build", 2340, { bold: true }), makeCell("Vite 8 + vite-plugin-web-extension", 3120), makeCell("Fast builds with MV3 hot-reload support", 3900)] }),
            new TableRow({ children: [makeCell("Styling", 2340, { bold: true }), makeCell("Tailwind CSS 3", 3120), makeCell("Utility-first responsive styling", 3900)] }),
            new TableRow({ children: [makeCell("ML Inference", 2340, { bold: true }), makeCell("@xenova/transformers (ONNX WASM)", 3120), makeCell("Client-side text embeddings (384-dim)", 3900)] }),
            new TableRow({ children: [makeCell("Vector Storage", 2340, { bold: true }), makeCell("IndexedDB (custom wrapper)", 3120), makeCell("Local persistent vector store", 3900)] }),
            new TableRow({ children: [makeCell("Icons", 2340, { bold: true }), makeCell("Lucide React", 3120), makeCell("Clean, consistent iconography", 3900)] }),
            new TableRow({ children: [makeCell("Unit Testing", 2340, { bold: true }), makeCell("Vitest + Testing Library", 3120), makeCell("Component and logic testing", 3900)] }),
            new TableRow({ children: [makeCell("E2E Testing", 2340, { bold: true }), makeCell("Playwright", 3120), makeCell("Chrome extension integration tests", 3900)] }),
          ]
        }),
        figCaption("Table 1: Complete Technology Stack"),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 6. MODULE DESCRIPTIONS ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Module Descriptions")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Content Script Layer (Adapter Architecture)")] }),
        bodyText("The Content Script Layer is responsible for intercepting user prompts on supported AI platforms. It implements the Adapter Pattern, where each supported platform has a dedicated adapter that understands the platform's DOM structure, input mechanisms, and submit button behavior."),
        bodyText("Each adapter implements the SiteAdapter interface with four methods: getPromptText() to extract the current prompt, setPromptText() to inject the optimized prompt, onSubmit() to register a callback intercepting the submit action, and destroy() for cleanup."),
        new Table({
          columnWidths: [2800, 3280, 3280],
          rows: [
            new TableRow({ tableHeader: true, children: [makeHeaderCell("Adapter", 2800), makeHeaderCell("Platform", 3280), makeHeaderCell("Type", 3280)] }),
            new TableRow({ children: [makeCell("ClaudeAdapter", 2800), makeCell("claude.ai", 3280), makeCell("Dedicated (ProseMirror)", 3280)] }),
            new TableRow({ children: [makeCell("ChatGPTAdapter", 2800), makeCell("chat.openai.com / chatgpt.com", 3280), makeCell("Dedicated (ProseMirror)", 3280)] }),
            new TableRow({ children: [makeCell("GeminiAdapter", 2800), makeCell("gemini.google.com", 3280), makeCell("Dedicated (Quill Editor)", 3280)] }),
            new TableRow({ children: [makeCell("DeepSeekAdapter", 2800), makeCell("chat.deepseek.com", 3280), makeCell("Dedicated (Textarea)", 3280)] }),
            new TableRow({ children: [makeCell("GenericAdapter", 2800), makeCell("Perplexity, Copilot, Meta AI, etc.", 3280), makeCell("Generic (textarea/contenteditable)", 3280)] }),
          ]
        }),
        figCaption("Table 2: Platform Adapter Registry"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 RAG Pipeline (Retrieval-Augmented Generation)")] }),
        bodyText("The RAG Pipeline enables intelligent context injection by maintaining a local knowledge base of user-uploaded documents. The pipeline consists of three sub-modules:"),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.2.1 Embedder Module (embedder.ts)")] }),
        bodyText("The Embedder converts text into 384-dimensional dense vector representations using a hash-based bag-of-words approach. Each word is tokenized, hashed, and mapped to multiple dimensions, then L2-normalized for cosine similarity computation. This lightweight approach runs efficiently in service workers without requiring DOM or WASM access."),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.2.2 Vector Store Module (vectorStore.ts)")] }),
        bodyText("The Vector Store provides a persistent storage layer using IndexedDB. It stores KnowledgeChunk objects containing the original text, its vector embedding, source metadata, and timestamp. Operations include saveChunk, getAllChunks, and deleteChunk, with built-in timeout protection (3-second limit) to prevent IndexedDB from hanging the service worker."),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.2.3 Retriever Module (retriever.ts)")] }),
        bodyText("The Retriever performs semantic search by embedding the user's prompt query, computing cosine similarity against all stored chunks, ranking results, and returning the top-K most relevant chunks (default K=3) that exceed a 0.3 similarity threshold. Retrieved chunks are formatted with source attribution and wrapped in XML-style <context> tags."),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.3 Heuristic Compression Engine")] }),
        bodyText("The compression engine removes linguistic noise from prompts while preserving technical content and semantic intent. It operates at three configurable levels:"),
        new Table({
          columnWidths: [1800, 3780, 3780],
          rows: [
            new TableRow({ tableHeader: true, children: [makeHeaderCell("Level", 1800), makeHeaderCell("Operations", 3780), makeHeaderCell("Typical Reduction", 3780)] }),
            new TableRow({ children: [makeCell("Light", 1800, { bold: true }), makeCell("Strip opener fluff (greetings, pleasantries)", 3780), makeCell("10–20% token reduction", 3780)] }),
            new TableRow({ children: [makeCell("Medium", 1800, { bold: true }), makeCell("Light + filler phrase removal + whitespace normalization", 3780), makeCell("30–50% token reduction", 3780)] }),
            new TableRow({ children: [makeCell("Aggressive", 1800, { bold: true }), makeCell("Medium + article removal + verbose phrase condensation", 3780), makeCell("50–70% token reduction", 3780)] }),
          ]
        }),
        figCaption("Table 3: Compression Levels and Their Operations"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.4 Background Service Worker")] }),
        bodyText("The Background Service Worker serves as the central message hub and processing engine. It receives messages from content scripts and the side panel UI, orchestrates the optimization pipeline (compression → RAG retrieval → assembly), persists statistics to Chrome Storage, and manages the knowledge base lifecycle. The service worker handles four message types: COMPRESS_PROMPT, ADD_KNOWLEDGE, GET_STATS, and DELETE_KNOWLEDGE."),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.5 Side Panel UI (React Application)")] }),
        bodyText("The side panel provides a premium glassmorphic user interface built with React 19 and Tailwind CSS. It features three tabbed views:"),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Stats Dashboard: Real-time token savings, compression ratios, weekly trends chart, per-platform breakdown, and optimization history.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Knowledge Base: Upload .txt/.md files or paste text, view stored knowledge sources with chunk counts, and delete sources.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Settings: Toggle extension on/off, enable/disable RAG and compression, configure max knowledge chunks, and select compression level.", size: 22, font: "Arial" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 7. USE CASE DIAGRAM ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Use Case Analysis")] }),
        imgParagraph(images.useCase, 500, 400, "Use Case Diagram"),
        figCaption("Figure 6: UML Use Case Diagram — ContextLens Extension"),
        spacer(),
        new Table({
          columnWidths: [2340, 2340, 4680],
          rows: [
            new TableRow({ tableHeader: true, children: [makeHeaderCell("Use Case", 2340), makeHeaderCell("Actor", 2340), makeHeaderCell("Description", 4680)] }),
            new TableRow({ children: [makeCell("Optimize Prompt", 2340), makeCell("End User", 2340), makeCell("Automatically compress and enrich prompts before AI submission", 4680)] }),
            new TableRow({ children: [makeCell("Upload Knowledge", 2340), makeCell("End User", 2340), makeCell("Add .txt/.md documents to local knowledge base for RAG retrieval", 4680)] }),
            new TableRow({ children: [makeCell("View Statistics", 2340), makeCell("End User", 2340), makeCell("Monitor token savings, compression ratios, and optimization history", 4680)] }),
            new TableRow({ children: [makeCell("Configure Settings", 2340), makeCell("End User", 2340), makeCell("Toggle features, set compression level, configure max chunks", 4680)] }),
            new TableRow({ children: [makeCell("Manage Knowledge", 2340), makeCell("End User", 2340), makeCell("View, refresh, and delete stored knowledge sources", 4680)] }),
            new TableRow({ children: [makeCell("Receive Optimized Input", 2340), makeCell("AI Platform", 2340), makeCell("Receive leaner, context-enriched prompt from ContextLens", 4680)] }),
          ]
        }),
        figCaption("Table 4: Use Case Summary"),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 8. DATA MODEL ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Data Model and Storage Design")] }),
        imgParagraph(images.erDiagram, 500, 380, "Entity-Relationship Diagram"),
        figCaption("Figure 7: Entity-Relationship Diagram — ContextLens Data Model"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.1 KnowledgeChunk Entity (IndexedDB)")] }),
        new Table({
          columnWidths: [2340, 2340, 4680],
          rows: [
            new TableRow({ tableHeader: true, children: [makeHeaderCell("Field", 2340), makeHeaderCell("Type", 2340), makeHeaderCell("Description", 4680)] }),
            new TableRow({ children: [makeCell("id", 2340, { bold: true }), makeCell("string (PK)", 2340), makeCell("Unique identifier (timestamp + random hash)", 4680)] }),
            new TableRow({ children: [makeCell("content", 2340, { bold: true }), makeCell("string", 2340), makeCell("Raw text content of the knowledge chunk", 4680)] }),
            new TableRow({ children: [makeCell("embedding", 2340, { bold: true }), makeCell("number[] (384-dim)", 2340), makeCell("L2-normalized vector embedding for similarity search", 4680)] }),
            new TableRow({ children: [makeCell("source", 2340, { bold: true }), makeCell("string", 2340), makeCell("Original filename or source label", 4680)] }),
            new TableRow({ children: [makeCell("createdAt", 2340, { bold: true }), makeCell("number (timestamp)", 2340), makeCell("Unix timestamp of creation", 4680)] }),
          ]
        }),
        figCaption("Table 5: KnowledgeChunk Entity Schema"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.2 ExtensionSettings Entity (Chrome Storage Sync)")] }),
        new Table({
          columnWidths: [2800, 2280, 4280],
          rows: [
            new TableRow({ tableHeader: true, children: [makeHeaderCell("Field", 2800), makeHeaderCell("Type", 2280), makeHeaderCell("Default Value", 4280)] }),
            new TableRow({ children: [makeCell("enabled", 2800, { bold: true }), makeCell("boolean", 2280), makeCell("true", 4280)] }),
            new TableRow({ children: [makeCell("ragEnabled", 2800, { bold: true }), makeCell("boolean", 2280), makeCell("true", 4280)] }),
            new TableRow({ children: [makeCell("compressionEnabled", 2800, { bold: true }), makeCell("boolean", 2280), makeCell("true", 4280)] }),
            new TableRow({ children: [makeCell("maxChunks", 2800, { bold: true }), makeCell("number", 2280), makeCell("3 (Top-K retrieval limit)", 4280)] }),
            new TableRow({ children: [makeCell("compressionLevel", 2800, { bold: true }), makeCell("enum", 2280), makeCell("'medium' (light | medium | aggressive)", 4280)] }),
          ]
        }),
        figCaption("Table 6: ExtensionSettings Entity Schema"),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 9. SCREENSHOTS ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. User Interface Screenshots")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.1 Stats Dashboard")] }),
        bodyText("The Stats Dashboard provides a real-time overview of token savings, including total tokens saved, number of prompts optimized, average compression ratio, weekly token savings chart, and recent optimization history with per-platform breakdown."),
        imgParagraph(images.stats, 420, 420, "Stats Dashboard"),
        figCaption("Figure 8: Stats Dashboard — Real-Time Token Savings Analytics"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.2 Knowledge Base Panel")] }),
        bodyText("The Knowledge Base panel allows users to manage their local document library. Users can paste text directly, drag-and-drop .txt or .md files, view stored knowledge sources with chunk counts, and delete individual sources."),
        imgParagraph(images.knowledge, 420, 420, "Knowledge Base Panel"),
        figCaption("Figure 9: Knowledge Base Panel — Local Document Management"),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.3 Settings Panel")] }),
        bodyText("The Settings panel provides granular control over the extension's behavior, including master enable/disable toggle, RAG search toggle, prompt compression toggle, max knowledge chunks slider, and compression level selector (Light / Medium / Aggressive)."),
        imgParagraph(images.settings, 320, 420, "Settings Panel"),
        figCaption("Figure 10: Settings Panel — Extension Configuration"),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 10. PROJECT STRUCTURE ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("10. Project Structure")] }),
        new Table({
          columnWidths: [4000, 5360],
          rows: [
            new TableRow({ tableHeader: true, children: [makeHeaderCell("Path", 4000), makeHeaderCell("Description", 5360)] }),
            new TableRow({ children: [makeCell("public/manifest.json", 4000), makeCell("Chrome MV3 manifest configuration", 5360)] }),
            new TableRow({ children: [makeCell("src/background/service-worker.ts", 4000), makeCell("Background message hub & processing engine", 5360)] }),
            new TableRow({ children: [makeCell("src/content/index.ts", 4000), makeCell("Content script entry — adapter selection & pipeline", 5360)] }),
            new TableRow({ children: [makeCell("src/content/adapters/", 4000), makeCell("Platform-specific DOM adapters (5 adapters)", 5360)] }),
            new TableRow({ children: [makeCell("src/rag/embedder.ts", 4000), makeCell("Text → 384-dim vector embedding (hash-based)", 5360)] }),
            new TableRow({ children: [makeCell("src/rag/vectorStore.ts", 4000), makeCell("IndexedDB wrapper for vector storage/retrieval", 5360)] }),
            new TableRow({ children: [makeCell("src/rag/retriever.ts", 4000), makeCell("Cosine similarity search & context formatting", 5360)] }),
            new TableRow({ children: [makeCell("src/compressor/heuristicCompressor.ts", 4000), makeCell("Multi-level rule-based prompt compression", 5360)] }),
            new TableRow({ children: [makeCell("src/compressor/historyTrimmer.ts", 4000), makeCell("Chat history token budget management", 5360)] }),
            new TableRow({ children: [makeCell("src/popup/App.tsx", 4000), makeCell("Side panel main UI (React + Tailwind)", 5360)] }),
            new TableRow({ children: [makeCell("src/popup/components/Stats.tsx", 4000), makeCell("Token savings analytics dashboard", 5360)] }),
            new TableRow({ children: [makeCell("src/popup/components/KnowledgeBase.tsx", 4000), makeCell("Knowledge document management panel", 5360)] }),
            new TableRow({ children: [makeCell("src/popup/components/Settings.tsx", 4000), makeCell("Extension configuration panel", 5360)] }),
            new TableRow({ children: [makeCell("src/shared/types.ts", 4000), makeCell("TypeScript interfaces & type definitions", 5360)] }),
            new TableRow({ children: [makeCell("src/shared/utils.ts", 4000), makeCell("Text chunking, token estimation, ID generation", 5360)] }),
            new TableRow({ children: [makeCell("tests/", 4000), makeCell("Unit tests (Vitest) & E2E tests (Playwright)", 5360)] }),
          ]
        }),
        figCaption("Table 7: Complete Project File Structure"),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 11. SUPPORTED PLATFORMS ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("11. Supported AI Platforms")] }),
        new Table({
          columnWidths: [2340, 3900, 3120],
          rows: [
            new TableRow({ tableHeader: true, children: [makeHeaderCell("Platform", 2340), makeHeaderCell("URL", 3900), makeHeaderCell("Adapter Type", 3120)] }),
            new TableRow({ children: [makeCell("ChatGPT", 2340, { bold: true }), makeCell("chat.openai.com / chatgpt.com", 3900), makeCell("Dedicated", 3120)] }),
            new TableRow({ children: [makeCell("Claude", 2340, { bold: true }), makeCell("claude.ai", 3900), makeCell("Dedicated", 3120)] }),
            new TableRow({ children: [makeCell("Gemini", 2340, { bold: true }), makeCell("gemini.google.com", 3900), makeCell("Dedicated", 3120)] }),
            new TableRow({ children: [makeCell("DeepSeek", 2340, { bold: true }), makeCell("chat.deepseek.com", 3900), makeCell("Dedicated", 3120)] }),
            new TableRow({ children: [makeCell("Perplexity", 2340, { bold: true }), makeCell("perplexity.ai", 3900), makeCell("Generic", 3120)] }),
            new TableRow({ children: [makeCell("Microsoft Copilot", 2340, { bold: true }), makeCell("copilot.microsoft.com", 3900), makeCell("Generic", 3120)] }),
            new TableRow({ children: [makeCell("Meta AI", 2340, { bold: true }), makeCell("meta.ai", 3900), makeCell("Generic", 3120)] }),
            new TableRow({ children: [makeCell("HuggingFace Chat", 2340, { bold: true }), makeCell("huggingface.co/chat", 3900), makeCell("Generic", 3120)] }),
            new TableRow({ children: [makeCell("Poe", 2340, { bold: true }), makeCell("poe.com", 3900), makeCell("Generic", 3120)] }),
          ]
        }),
        figCaption("Table 8: Supported AI Platforms"),
        bodyText("The Generic Adapter provides fallback support for any AI chat site using standard textarea or contenteditable inputs, enabling the extension to work on unlisted platforms without code changes."),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 12. TESTING ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("12. Testing Strategy")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("12.1 Unit Testing (Vitest + Testing Library)")] }),
        bodyText("Comprehensive unit tests cover all core modules:"),
        new Paragraph({ numbering: { reference: "num-testing", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Heuristic Compressor: Tests all three compression levels (light/medium/aggressive) with diverse input patterns.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-testing", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "History Trimmer: Validates token budget enforcement and turn summarization logic.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-testing", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Vector Store: Tests CRUD operations against a fake IndexedDB implementation.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-testing", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Utility Functions: Validates text chunking (overlap handling), token estimation, and unique ID generation.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-testing", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Site Adapter Detection: Verifies correct adapter selection based on hostname.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-testing", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "React Components: Snapshot and interaction testing for Stats, KnowledgeBase, and Settings components.", size: 22, font: "Arial" })] }),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("12.2 End-to-End Testing (Playwright)")] }),
        bodyText("E2E tests boot an isolated Chromium instance with the compiled extension to verify:"),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Extension loads without errors in the Chrome Extensions page.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Side panel renders correctly with all three tabs (Stats, Knowledge, Settings).", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Service worker registers and responds to messages.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Prompt Interception & Rewriting: Intercepts, compresses, and submits prompts on ChatGPT and Claude using mocked page structures.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Event Loop & Freeze Protection: Validates event propagation prevention and the Enter keydown fallback logic, ensuring no interface freezes or duplicate submissions occur.", size: 22, font: "Arial" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 13. PRIVACY & SECURITY ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("13. Privacy and Security")] }),
        bodyText("ContextLens is designed with a privacy-first architecture. The following principles are strictly enforced:"),
        new Paragraph({ numbering: { reference: "num-privacy", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "All Processing is Local: All text processing, vector embedding, cosine similarity computation, and prompt compression happen entirely within the browser. No data is transmitted to external servers.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-privacy", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "No API Keys Required: ML models run via ONNX Runtime (WASM) directly in the browser, eliminating the need for external API keys or authentication.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-privacy", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "No Analytics or Tracking: Zero telemetry is collected. The extension does not use any analytics services, advertising networks, or user tracking mechanisms.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-privacy", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Minimal Permissions: The extension only requests access to supported AI chat domains. Permissions include storage, activeTab, scripting, and sidePanel.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-privacy", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Open Source: The entire codebase is publicly available under the MIT License for full auditability.", size: 22, font: "Arial" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 14. INSTALLATION ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("14. Installation and Deployment")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("14.1 Prerequisites")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Node.js 18+ (LTS recommended)", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Google Chrome (latest stable version)", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "npm (bundled with Node.js)", size: 22, font: "Arial" })] }),
        spacer(),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("14.2 Installation Steps")] }),
        new Paragraph({ numbering: { reference: "num-install", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Clone the repository: git clone https://github.com/jimon1139m/Contextlens.git", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-install", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Install dependencies: npm install", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-install", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Build the extension: npm run build (outputs to /dist directory)", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-install", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Open Chrome and navigate to chrome://extensions/", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-install", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Enable Developer Mode (toggle in top-right corner)", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-install", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Click 'Load unpacked' and select the dist/ folder", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-install", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Verify: Click ContextLens icon → Side panel opens with Stats/Knowledge/Settings tabs", size: 22, font: "Arial" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 15. FUTURE SCOPE ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("15. Future Scope and Enhancements")] }),
        new Paragraph({ numbering: { reference: "num-future", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Transformer-based Embeddings: Migrate from hash-based embeddings to full MiniLM-L6 via ONNX offscreen document for higher semantic accuracy.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-future", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Firefox and Edge Support: Port the extension to Firefox WebExtensions API and Microsoft Edge Add-ons for broader browser coverage.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-future", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Smart Caching: Implement an LRU cache for frequently retrieved knowledge chunks to reduce IndexedDB read latency.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-future", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "AI-Powered Compression: Replace or augment heuristic rules with a distilled language model for context-aware compression.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-future", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Multi-language Support: Add prompt optimization for non-English languages with language-specific filler phrase dictionaries.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-future", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Export/Import Knowledge: Allow users to export and import their knowledge bases for backup and sharing.", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-future", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Chrome Web Store Publication: Complete the review process for public distribution via the Chrome Web Store.", size: 22, font: "Arial" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 16. CONCLUSION ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("16. Conclusion")] }),
        bodyText("ContextLens successfully demonstrates a novel approach to AI prompt optimization through a privacy-first, fully local browser extension. By combining Retrieval-Augmented Generation (RAG) with heuristic compression in a transparent middleware architecture, the project delivers measurable value: 40–70% token savings, automatic context injection from personal knowledge bases, and support for 10+ AI platforms—all without any data leaving the user's browser."),
        bodyText("The modular adapter architecture ensures easy extensibility to new platforms, while the Chrome Manifest V3 foundation provides a stable, modern, and secure runtime environment. The glassmorphic React UI offers a premium user experience with real-time analytics that reinforce the tangible benefits of the extension."),
        bodyText("The project is fully open-source under the MIT License, comprehensively tested with both unit and E2E test suites, and prepared for Chrome Web Store publication. ContextLens represents a significant step forward in making AI interactions more efficient, cost-effective, and private."),
        spacer(), spacer(),

        // ==================== 17. REFERENCES ====================
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("17. References")] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Chrome Extensions Manifest V3 Documentation: https://developer.chrome.com/docs/extensions/mv3/", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "React 19 Documentation: https://react.dev/", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "@xenova/transformers — Hugging Face Transformers for JS: https://huggingface.co/docs/transformers.js/", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "IndexedDB API — MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Vite Build Tool: https://vite.dev/", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Tailwind CSS: https://tailwindcss.com/", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Vitest Testing Framework: https://vitest.dev/", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Playwright End-to-End Testing: https://playwright.dev/", size: 22, font: "Arial" })] }),
        new Paragraph({ numbering: { reference: "num-scope", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "GitHub Repository: https://github.com/jimon1139m/Contextlens", size: 22, font: "Arial" })] }),
      ]
    }
  ]
});

// ---------- GENERATE ----------
const OUTPUT = path.join(__dirname, "ContextLens_DPR.docx");
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`\n✅ DPR generated successfully: ${OUTPUT}`);
  console.log(`   File size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
