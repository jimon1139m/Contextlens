# Project Brief

**ContextLens** is a Chrome extension that intercepts prompts typed into AI chat platforms (Claude, ChatGPT, Gemini, DeepSeek) and runs them through a local RAG + compression pipeline before submission.

## Core Requirements
- Chrome MV3 extension.
- Local RAG using `@xenova/transformers` and IndexedDB.
- Prompt compression using heuristics and chat history trimming.
- Popup UI for knowledge management and settings.
- Transparently intercept and update prompt inputs on target AI websites.
