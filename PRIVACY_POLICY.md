# Privacy Policy for ContextLens

**Effective Date:** May 30, 2026

## Introduction
ContextLens ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how our Chrome Extension handles your data. ContextLens operates entirely on your local device to ensure maximum privacy and security.

## Data Collection and Usage
ContextLens does **not** collect, store, or transmit any of your personal data, chat history, or uploaded documents to any external servers. 

### Local Processing
- **Embeddings & RAG:** When you upload `.txt` or `.md` files to the Knowledge Base, the text is chunked and embedded using a local machine learning model (`@xenova/transformers`) running directly within your browser. 
- **Storage:** Vector embeddings and extension settings are stored locally on your device using Chrome's `storage.local` API and IndexedDB.
- **Prompt Interception:** ContextLens requires host permissions for supported AI platforms (Claude, ChatGPT, Gemini, DeepSeek) to intercept and optimize your prompts before they are sent by your browser. We do not read or store your conversations beyond what is necessary to perform real-time prompt compression on your machine.

## Third-Party Sharing
We do not sell, trade, or otherwise transfer your data to outside parties. All processing is strictly local.

## Permissions Justification
- **`storage`**: Required to save your customized settings, local vector embeddings, and token-saving statistics.
- **`activeTab` & `scripting`**: Required to interact with the DOM of the supported AI platforms in order to compress your prompts seamlessly.
- **Host Permissions**: Required to allow the content script to run on specific AI platform URLs.

## Changes to This Policy
We may update this Privacy Policy from time to time. We will notify users of any significant changes by updating the "Effective Date" at the top of this document.

## Contact Us
If you have any questions or concerns about this Privacy Policy, please contact us at:
`[developer@example.com]` *(Please update before publishing)*
