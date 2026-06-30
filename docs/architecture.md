# 🏗️ System Architecture - North Star Invest

## Flow Overview

User → Frontend (Next.js)
↓
Backend (FastAPI)
↓
Data Layer:
- PostgreSQL (user + portfolio data)
- Market APIs (Alpha Vantage / Finnhub / Yahoo Finance)
- Macro Data (inflation, interest rates, liquidity)

↓
AI Layer:
- AI Financial Copilot (GPT-4o via LangChain)
- Macro Intelligence Engine (rule-based + AI interpretation)

↓
Response Layer:
- Portfolio insights
- Risk analysis
- Scenario simulations

↓
Frontend Visualization:
- Recharts dashboards
- Allocation charts
- Risk metrics
- What-if simulations

↓
Feedback Loop:
User behavior → improves personalization over time
