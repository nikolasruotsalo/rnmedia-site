# Paste this into Claude at claude.ai (with Notion integration enabled)

---

You are building a professional Agency OS in my Notion workspace. Use the Notion tools available to you to build everything directly. Do not write code — create the pages and databases using your Notion tools.

**Parent page ID: 19dd06cf-f26b-45f2-a748-9666ac8871b1**

Build the following inside that parent page:

---

## STEP 1 — Create a Home Dashboard page
Title: "🏠 RN Media — Agency OS"
Add a callout: "RN Media | Solo Agency OS | Nikolas Ruotsalo | nikolas.ruotsalo@rnmedia.fi | UKKO Y-tunnus: 3481521-6"

---

## STEP 2 — Create these 7 databases as children of the home page

### 1. 👥 Clients
Properties: Name (title), Company (text), Contact Person (text), Email (email), Phone (phone), Status (select: Active/Onboarding/Trial/Paused/Churned), Monthly Rate € (number), Trial Rate (checkbox), Start Date (date), Contract End (date), Next Action (text), Next Action Date (date), Notes (text)

### 2. 🎬 Content Pipeline
Properties: Title (title), Status (select: Idea/Scripting/Filming/Editing/Review/Approved/Scheduled/Posted), Platform (multi-select: Instagram Reels/TikTok), Format (select: Reel/TikTok/Story/Carousel), Due Date (date), Publish Date (date), Hook (text), Script (text), Notes (text)

### 3. 🎯 Sales Pipeline
Properties: Name (title), Company (text), Contact (text), Email (email), Phone (phone), Stage (select: Lead/Contacted/Discovery/Proposal Sent/Negotiation/Closed Won/Closed Lost), Package Interest (select: Starter €299/Growth €499/Premium €799/Custom), Estimated Value €/kk (number), Next Action (text), Next Action Date (date), Last Contact (date), Source (select: Cold Outreach/Referral/Inbound/Social), Notes (text)

### 4. 💰 Packages & Pricing
Properties: Name (title), Price €/kk (number), Shoots/kk (number), Videos/kk (number), Edit Level (select: Perus/Edistynyt/Cinematic), Julkaisu & ajastus (checkbox), Kommentit & DM (checkbox), Strategia + raportti (checkbox), Konsultointi (checkbox), Kampanjasuunnittelu (checkbox), Aloitusmaksu € (number), Launch-hinta asti (date), Notes (text)

### 5. ✅ Tasks
Properties: Title (title), Priority (select: High/Medium/Low), Status (select: To Do/In Progress/Blocked/Done), Due Date (date), Category (select: Filming/Editing/Admin/Communication/Strategy/Invoicing/Outreach), Notes (text)

### 6. 📈 Performance KPIs
Properties: Title (title), Month (date), Platform (select: Instagram/TikTok/Both), Reach (number), Impressions (number), Engagement Rate % (number), Follower Growth (number), Videos Posted (number), Top Post (text), Notes (text)

### 7. 🧾 Invoices
Properties: Title (title), Invoice Month (date), Amount € (number), Status (select: Draft/Sent/Paid/Overdue), UKKO Reference (text), Due Date (date), Paid Date (date), Notes (text)

---

## STEP 3 — Add relations between databases
- Clients ↔ Content Pipeline (relation)
- Clients ↔ Tasks (relation)
- Clients ↔ KPIs (relation)
- Clients ↔ Invoices (relation)
- Content Pipeline ↔ Tasks (relation)

---

## STEP 4 — Seed Packages & Pricing with this data

| Name | Price | Shoots | Videos | Edit Level | Julkaisu | Kommentit | Strategia | Konsultointi | Kampanja | Aloitusmaksu | Launch asti |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Starter | 299 | 1 | 4 | Perus | ☐ | ☐ | ☐ | ☐ | ☐ | 79 | 31.8.2026 |
| Growth | 499 | 2 | 8 | Edistynyt | ✓ | ☐ | ✓ | ☐ | ☐ | 79 | 31.8.2026 |
| Premium | 799 | 3 | 12 | Cinematic | ✓ | ✓ | ✓ | ✓ | ✓ | 79 | 31.8.2026 |
| Lisävideo (add-on) | 99 | 0 | 1 | Perus | ☐ | ☐ | ☐ | ☐ | ☐ | 0 | — |
| Lisäshoot (add-on) | 249 | 1 | 0 | Perus | ☐ | ☐ | ☐ | ☐ | ☐ | 0 | — |
| Lisärevisio (add-on) | 49 | 0 | 0 | Perus | ☐ | ☐ | ☐ | ☐ | ☐ | 0 | — |
| Lisästrategiatunti (add-on) | 99 | 0 | 0 | Perus | ☐ | ☐ | ☐ | ☐ | ☐ | 0 | — |

---

## STEP 5 — Seed Clients with this data

1. **Förå Oy** — Contact: Samuli — Status: Trial — Rate: €150/kk — Trial Rate: yes — Next Action: "Upgrade conversation — move to Starter €299 or Growth €499" — Next Action Date: 20.6.2026 — Notes: "Currently on discounted trial rate. Needs upgrade conversation."

2. **KattoHoiva Oy** — Contact: Mika — Status: Onboarding — Rate: €600/kk — Start Date: 1.8.2026 — Next Action: "Send onboarding package and contract" — Next Action Date: 1.7.2026 — Notes: "Signing 1.8.2026. Rate ~€600/kk, between Growth and Premium."

3. **HeatUp Lämmityspalvelut Oy** — Contact: Saku — Status: Trial — Rate: €0 — Trial Rate: yes — Next Action: "Film free discovery shoot this week, present Premium package" — Next Action Date: 14.6.2026 — Notes: "Discovery done. Free shoot this week. Premium €799 conditional on shoot quality."

---

## STEP 6 — Seed Sales Pipeline with this data

1. **Piettolan tila** — Contact: Laura — Stage: Proposal Sent — Value: €299/kk — Package Interest: Starter €299 — Next Action: "Follow up on proposal" — Next Action Date: 15.6.2026 — Source: Inbound — Notes: "Proposal sent. Awaiting response. Starter €299 + one-off add-ons."

2. **FIT 24 Klaukkala** — Contact: Ella Sorsa — Stage: Contacted — Value: €499/kk — Package Interest: Growth €499 — Next Action: "Follow up" — Next Action Date: 17.6.2026 — Source: Cold Outreach — Notes: "Follow-up sent. Gym in Klaukkala."

3. **KOLL App** — Contact: Pekka Mettälä — Stage: Contacted — Value: €799/kk — Package Interest: Premium €799 — Next Action: "Follow up" — Next Action Date: 17.6.2026 — Source: Cold Outreach — Notes: "Follow-up sent. App company."

4. Add 5 rows with names "Cold Outreach — Uusimaa Gym #1" through "#3" and "Cold Outreach — Uusimaa Café #1" "#2" — Stage: Lead — Source: Cold Outreach — Notes: "Part of ~30 cold outreach contacts sent across Uusimaa."

---

## STEP 7 — Seed Tasks with this data

1. "HeatUp — Free Discovery Shoot" — Priority: High — Status: To Do — Due: 14.6.2026 — Category: Filming
2. "Förå — Upgrade Conversation" — Priority: High — Status: To Do — Due: 20.6.2026 — Category: Communication
3. "Piettolan tila — Follow Up Proposal" — Priority: High — Status: To Do — Due: 15.6.2026 — Category: Communication
4. "KattoHoiva — Send Onboarding Package" — Priority: Medium — Status: To Do — Due: 1.7.2026 — Category: Admin
5. "FIT 24 Klaukkala — Follow Up" — Priority: Medium — Status: To Do — Due: 17.6.2026 — Category: Outreach
6. "KOLL App — Follow Up" — Priority: Medium — Status: To Do — Due: 17.6.2026 — Category: Outreach
7. "Förå — Send June Invoice via UKKO.fi" — Priority: Medium — Status: To Do — Due: 25.6.2026 — Category: Invoicing

---

## STEP 8 — Seed Invoices

1. "Förå Oy — Kesäkuu 2026" — Month: June 2026 — Amount: €150 — Status: Draft — Due: 25.6.2026
2. "KattoHoiva Oy — Elokuu 2026" — Month: August 2026 — Amount: €600 — Status: Draft — Due: 25.8.2026

---

Build everything in order, step by step. Confirm each step as you complete it. Link all relations after the databases are created.
