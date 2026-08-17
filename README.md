# 🔬 WaferVision — AI-Driven Semiconductor Wafer Defect Detection

> High-precision deep learning inspection system detecting 9 types of semiconductor wafer defects with up to **98.07% accuracy**, powered by convolutional neural networks (ResNet-18, EfficientNet, DenseNet, & Ensembles).

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Supported Defect Classes](#-supported-defect-classes)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [API Endpoints](#-api-endpoints)
- [AI Copilot Integration](#-ai-copilot-integration)
- [License](#-license)

---

## 🌟 Overview

In semiconductor fabrication, wafer defect pattern classification is critical for yield enhancement and root-cause failure analysis. **WaferVision** provides an end-to-end interactive platform for real-time wafer inspection, simulated defect generation, batch analytics, and AI-assisted semiconductor troubleshooting.

Trained and benchmarked on the industry-standard **WM-811K** dataset (~811,457 wafer maps), WaferVision delivers fast, explainable, and reliable defect classification for quality engineering workflows.

---

## 🚀 Key Features

- **🔬 Real-Time Defect Inspection**: Upload or simulate wafer defect patterns and receive instant classification results with confidence scores and heatmaps.
- **🎨 Interactive Wafer Map Simulator**: Generate synthetic wafer maps with adjustable noise, die resolution, defect density, and pattern types directly in the browser canvas.
- **📊 Batch Processing & Analytics**: Run multi-wafer inspection runs, track batch yield statistics, analyze defect distributions, and export reports.
- **🧠 Model Comparison Matrix**: Compare performance across ResNet-18, EfficientNet-B0, DenseNet-121, and CNN Ensemble models (Accuracy, Precision, Recall, F1-score, Inference Latency).
- **🤖 WaferVision AI Copilot**: Integrated AI assistant capable of answering semiconductor physics questions, diagnosing fabrication issues, explaining defect physics, and rendering LaTeX formulas & syntax-highlighted code.
- **🛡️ Secure Backend Proxy**: Node.js Express proxy with rate limiting, Helmet security headers, input sanitization, and masked API key handling for LLM providers (Groq / OpenAI).
- **🌙 Futuristic UI/UX**: Dark-mode glassmorphic interface with reactive animations, interactive charts, and mobile responsiveness.

---

## 🔍 Supported Defect Classes

WaferVision identifies and classifies the 9 standard WM-811K wafer failure patterns:

| # | Defect Pattern | Typical Root Cause | Impact on Yield |
|---|---|---|---|
| 1 | **Center** | CMP slurry buildup, gas flow unevenness | Moderate to High |
| 2 | **Donut** | Thermal gradients, spin-coater velocity anomalies | High |
| 3 | **Edge-Loc** | Clamping pin stress, wafer edge bevel defects | Low to Moderate |
| 4 | **Edge-Ring** | Edge-bead removal (EBR) issues, plasma etch non-uniformity | High |
| 5 | **Loc (Localized)** | Particle contamination, localized mask defect | Moderate |
| 6 | **Random** | Airborne particulates, airborne molecular contamination (AMC) | Variable |
| 7 | **Scratch** | Mechanical handling, robotic end-effector abrasion | Severe |
| 8 | **Near-Full** | Total process runaway, gross photolithography failure | Critical |
| 9 | **None (Normal)** | Pristine die yield within acceptable tolerance | Baseline Yield |

---

## 🛠️ Architecture & Tech Stack

### **Frontend**
- **HTML5 & Vanilla CSS3**: Glassmorphism design system, custom responsive layout, CSS variables.
- **JavaScript (ES6+)**: Canvas wafer rendering engine, synthetic noise generators, metrics calculations.
- **KaTeX**: LaTeX mathematical equation rendering in the AI Copilot.
- **Prism.js**: Code syntax highlighting for technical responses.

### **Backend (Proxy Server)**
- **Node.js & Express**: Lightweight secure API gateway and static file server.
- **Security & Protection**: `helmet`, `cors`, `express-rate-limit`.
- **AI Integrations**: Groq Cloud API (`llama-3.3-70b-versatile`) / OpenAI API (`gpt-4o-mini`).

---

## 📁 Project Structure

```text
WaferVision/
├── assets/
│   └── images/               # Pre-rendered sample wafers, diagrams & previews
│       ├── dashboard_preview.png
│       ├── hero_wafer.png
│       └── wafer_defects.png
├── .env                      # Environment configuration (ignored in git)
├── .gitignore                # Git ignore rules (node_modules, .env, etc.)
├── index.html                # Main application interface & dashboard
├── package.json              # Project dependencies and npm scripts
├── script.js                 # Frontend application logic, canvas engine, & UI handlers
├── server.js                 # Node.js backend proxy server with security controls
├── styles.css                # Custom styling, dark theme, and responsive design
└── README.md                 # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- `npm` (bundled with Node.js)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vishnusadasivan2006-dot/wafer-vision.git
   cd wafer-vision
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
# Configure either a Groq API key or an OpenAI API key:
GROK_API_KEY=gsk_your_groq_api_key_here
# or
OPENAI_API_KEY=sk_your_openai_api_key_here
```

> **Note:** The backend automatically detects `gsk_` keys for Groq (`llama-3.3-70b-versatile`) and `sk_` keys for OpenAI (`gpt-4o-mini`).

### Running the Application

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `POST` | `/api/chat` | Proxies prompts securely to Groq / OpenAI LLM | 30 requests / min |
| `GET` | `/api/health` | Service health status, uptime, & API key check | None |

---

## 🤖 AI Copilot Integration

The built-in **WaferVision Semiconductor Copilot** helps engineers:
- Diagnose potential fabrication line equipment failures based on observed spatial patterns.
- Calculate theoretical die yield formulas (e.g., Murphy, Seeds, Poisson models).
- Recommend recipe adjustments for Lithography, Etch, CMP, and CVD processes.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
