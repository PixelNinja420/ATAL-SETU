# CleanConnect — Civic Waste Intelligence Platform

> **AI-Powered Community Waste Management & Civic Issue Reporting Platform**
> Built for Sankalp Setu Hackathon · Challenge Area: Environment, Climate & Sustainability

## 🌟 What is CleanConnect?

CleanConnect is an AI-assisted add-on layer to existing civic grievance systems, focused on illegal dumping and waste management at the ward level.

- Citizens upload photos, locations, and descriptions of waste issues
- **AI classifies waste**, checks image authenticity, and prioritizes complaints by severity
- Multiple reports from the same location are **combined to identify hotspots**
- **Predictive AI** analyzes historical complaints to forecast future problem areas
- Reddit-like **upvote/downvote** system lets citizens validate reports
- Panchayat/Municipality receives, manages, and resolves reports
- **AI recommends actions** for each complaint to help officials respond efficiently
- Admin dashboard provides ward-wise hotspots, pending complaints, and resolution stats

## 🏗️ Architecture

```
Citizens (PWA)  →  AI Analysis Pipeline  →  Authority Dashboard
     ↕                    ↕                        ↕
  Community          Waste Classification     Department Officers
  Validation         Image Authenticity       Field Worker Tasks
  Upvote/Downvote    Duplicate Detection      Resolution Tracking
  Flagging           Hotspot Prediction       Community Verification
```

## 🧠 AI Features

| Feature | Description |
|---------|-------------|
| **Waste Classification** | Automatically categorizes waste type from uploaded photos |
| **Image Authenticity** | Detects potentially AI-generated or manipulated images |
| **Duplicate Detection** | Identifies when multiple reports refer to the same incident |
| **Recurring Issue Detection** | Flags locations with repeated waste problems |
| **Predictive Hotspots** | Forecasts future problem areas from historical data |
| **AI Recommended Actions** | Suggests prioritized response actions for officials |
| **Comment Contradiction Analysis** | Detects conflicting community feedback |
| **Priority Scoring** | Multi-factor severity scoring (waste type × community signals × age × recurrence) |

## 👥 User Roles

- **Citizen** — Report issues, vote, comment, verify resolutions
- **Community Admin** — Moderate reports, review AI alerts, verify disputed content
- **Department Officer** — Manage reports, assign teams, set priorities and deadlines
- **Field Worker** — View tasks, upload before/after photos, mark completion
- **Super Admin** — System analytics, user/region/department management

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and select a demo account to explore.

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS 3
- **Routing**: React Router v6
- **Maps**: Leaflet + React-Leaflet (OpenStreetMap)
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: React Context + localStorage persistence
- **AI**: Simulated inference engine (classification, authenticity, clustering, prediction)

## 📊 Demo Data

Pre-loaded with 15 realistic waste reports across Curchorem, Goa — covering various categories, statuses, priorities, and AI verification states.

## 🏆 Hackathon

**Sankalp Setu** — AI Student Hackathon
**Challenge Area**: Environment, Climate & Sustainability
**Team**: DBCE

## 📜 License

MIT
