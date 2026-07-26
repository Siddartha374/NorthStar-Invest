# North Star Invest

AI-powered multi-asset financial intelligence platform for Indian retail investors.  
Built for the **SEBI Securities Market TechSprint – WealthTech track**.

## What it does

- **Unified Portfolio Dashboard** — equities, MFs, ETFs, bonds, FDs, gold, REITs, InvITs, alternatives in one view
- **AI Financial Copilot** — proactive insights with transparent evidence (Gemini + deterministic fallback)
- **Macro Intelligence** — current regime → portfolio-specific historical implications (educational only)
- **Portfolio Health** — risk (volatility + concentration), diversification vs stated risk tolerance, goal tracking
- **Scenario Simulator** — income change / market shift / lump-sum with live before/after chart
- **Discover & Awareness** — asset-class education + filterable catalogue with “could help diversify” tags

## Quick start (demo mode – no backend required)

```bash
npm install
npm run dev
```

Open the app → click **“Load demo portfolio”**.  
Everything runs client-side with a realistic seeded portfolio (concentration risk, behind-schedule goal, macro-relevant mix).

## Full stack (Supabase)

1. Create a Supabase project.
2. Run `supabase/migrations/001_schema.sql` in the SQL editor.
3. Deploy Edge Functions (`ai-copilot`, `portfolio-health`) and set `GEMINI_API_KEY` as a secret.
4. Copy `.env.example` → `.env` and fill in URL + anon key.
5. `npm run dev`

## Architecture highlights

| Layer | Choice | Why |
|-------|--------|-----|
| Auth + DB | Supabase | RLS, email auth, Edge Functions |
| AI | Gemini 1.5 Flash via Edge Function | Key never client-side; 8s timeout + fallback |
| Charts | Recharts | Consistent, responsive |
| Live prices | Cached Edge Function (Yahoo / IndianAPI) | Demo never depends on live call |
| Mock assets | Seeded with realistic vol/return/liquidity | Bonds, FDs, REITs, InvITs, alts |

## Data sources (for judges)

| Asset class | Source |
|-------------|--------|
| Equities, ETFs, Mutual Funds | Live (cached) |
| Bonds, FDs, Gold, REITs, InvITs, Alternatives | High-quality simulated |

## Disclaimer

Educational / informational only. Not regulated financial advice under SEBI.  
All projections and insights use simplified assumptions. Past patterns do not guarantee future outcomes.

## License

Built for hackathon demonstration purposes.
