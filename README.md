# Clinical Insight Generator

[8/18/2026 4:55 PM] .: # 🚀 Probably RAG – Lovable Migration Guide

This document contains everything you need to recreate the "Probably RAG" frontend using [Lovable.dev](https://lovable.dev) and successfully connect it to your existing Python backend.

---

## 1. How to Connect Lovable to Your Backend

When you build the UI in Lovable, the generated React code needs to know where your FastAPI backend lives to fetch the data. 

Here is exactly how you handle the integration in Lovable:

### Step 1: The API Endpoint
Your backend is hosted at: https://frontend-fawn-three-88.vercel.app/api/ask (Note: The FastAPI endpoints are hosted on this Vercel function). 

### Step 2: The Fetch Logic (Pass this to Lovable)
In your Lovable prompt (below), we specifically tell Lovable to make a POST request to /api/ask with the query in the body. Lovable will write the standard JavaScript fetch code.

### Step 3: Dealing with CORS (Cross-Origin Resource Sharing)
When you preview your app inside Lovable's editor, your browser will block API requests to your backend because they come from different domains (Lovable's domain vs your Vercel domain).
To fix this without changing the backend, tell Lovable to use a relative path like const API_URL = import.meta.env.VITE_API_URL || "https://frontend-fawn-three-88.vercel.app";. 
If CORS blocks the Lovable preview, you can test it by either downloading the Lovable code and running it locally (npm run dev), or by updating your FastAPI CORSMiddleware in api/light_pipeline.py to allow "*" temporarily.

---

## 2. The Lovable Prompt

Copy the text below and paste it directly into Lovable to generate the exact UI we built:

> Prompt for Lovable:
> 
> Please build a modern, premium, and responsive React frontend for an AI Clinical Decision Support application called "Probably RAG". 
> 
> Design & Theme Requirements:
> - Use a premium Dark/Light mode theme. The default is dark mode (Deep blue-black #070914, panels rgba(18,24,43,0.65) with glassmorphism backdrop-filter: blur(12px)).
> - Use standard spacing and rounded corners (12px for cards, 24px for main panels).
> - Use lucide-react for icons (Brain, MessageSquare, History, FileText, Info, Settings, Sun, Moon).
> - Include smooth micro-interactions (e.g., hover states using transform: translateY(-2px) and hardware-accelerated transitions).
> - Fonts: 'Outfit' for headings and brand, 'Inter' for body text.
>
> Layout Requirements:
> - Desktop: A 260px left sidebar (fixed width) and a main content area. The main content should use a CSS Grid (grid-template-columns: 2fr 1.2fr) for the dashboard.
> - Mobile (< 768px): The sidebar must transform into a smooth Off-Canvas Drawer that slides in from the left, triggered by a top mobile header containing a hamburger menu. Include a dark overlay when the drawer is open.
> 
> Features & Components:
> 1. Sidebar Navigation: Includes "Ask Question" (active by default), "History", "Sources", "About", and at the bottom: "Dark/Light Mode toggle", "Settings", and "Logout".
> 2. Main Dashboard (Ask Question Tab):
> - A top header reading "PROBABLY RAG" and a subtitle.
> - A search input area with a text input (placeholder="Enter clinical query...") and a primary gradient "Ask" button.
> 3. Loading State (Skeleton Loaders): When "Ask" is clicked, display shimmering skeleton loaders for the recommendation box, evidence box, citations table, and the right-side pipeline steps.
> 4. API Integration: When "Ask" is clicked, make a POST request to https://frontend-fawn-three-88.vercel.app/api/ask with JSON body: { "query": "<user_input>" }.
> 5. Displaying Results (Left Column):
> - Recommendation Box: Show result.structured_output.recommendation.
> - Evidence Box: Show result.structured_output.evidence.
> - Citations Table: A responsive table mapping result.structured_output.citations (showing Document and Section).
> - JSON Box: A <pre> tag displaying the raw result.structured_output JSON.
> 6. Displaying Results (Right Column):
[8/18/2026 4:55 PM] .: > - Pipeline Status: A visual step-by-step checklist showing that the pipeline passed (e.g., "Retriever connected", "Refusal logic strictly enforced").
> - Retrieved Chunks: A scrollable list showing result.retrieved_chunks (displaying the score, metadata.section, and text for the top 3 chunks).
>
> Ensure the code is strictly in React, uses standard CSS modules or Tailwind (your choice, but must match the glassmorphism aesthetic), and handles loading/error states gracefully.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://probable-rag.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6c4291ee-edf9-41aa-805e-3aae17aac440).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
