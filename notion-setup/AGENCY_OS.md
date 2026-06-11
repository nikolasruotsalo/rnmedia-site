# RN Media Agency OS — Full Architecture

## 1. High-Level Page Hierarchy

```
🏠 RN Media — Agency OS          ← Home Dashboard (pin as Notion home)
├── 👥 Clients                   ← Master client records
├── 🎬 Content Pipeline          ← Every video, idea to posted
├── 🎯 Sales Pipeline            ← Leads, proposals, closed deals
├── 💰 Packages & Pricing        ← Tiers, add-ons, pricing rules
├── ✅ Tasks                     ← All tasks, linked to clients + content
├── 📈 Performance KPIs          ← Monthly KPIs per client
└── 🧾 Invoices                  ← Monthly invoice tracking, UKKO refs
```

---

## 2. Database Design

### 👥 Clients
| Property | Type | Notes |
|---|---|---|
| Name | Title | Client/Company name |
| Company | Text | Legal entity name |
| Contact Person | Text | Primary contact |
| Email | Email | |
| Phone | Phone | |
| Package | Relation → Packages | Active package |
| Status | Select | Active / Onboarding / Trial / Paused / Churned |
| Monthly Rate (€) | Number (€) | Actual agreed rate |
| Trial Rate | Checkbox | Flag for discounted/trial pricing |
| Start Date | Date | Contract start |
| Contract End | Date | |
| Next Action | Text | One-line next step |
| Next Action Date | Date | When to act |
| Content | Relation ↔ Content Pipeline | All videos for this client |
| Tasks | Relation ↔ Tasks | All tasks for this client |
| KPIs | Relation ↔ KPIs | Monthly performance records |
| Invoices | Relation ↔ Invoices | All invoices for this client |
| Notes | Text | Context, important notes |

**Views to create:**
- `Board` by Status — visual overview of all client statuses
- `Table` sorted by Next Action Date — daily action view
- `Gallery` — quick mobile overview

---

### 🎬 Content Pipeline
| Property | Type | Notes |
|---|---|---|
| Title | Title | Descriptive: "Client — Topic — #N" |
| Client | Relation ↔ Clients | |
| Status | Select | Idea → Scripting → Filming → Editing → Review → Approved → Scheduled → Posted |
| Platform | Multi-select | Instagram Reels, TikTok |
| Format | Select | Reel / TikTok / Story / Carousel |
| Due Date | Date | Internal deadline |
| Publish Date | Date | Scheduled publish |
| Hook | Text | First 3 seconds — the hook line |
| Script | Text | Full script / shot list |
| Tasks | Relation ↔ Tasks | Filming task, editing task, etc. |
| Notes | Text | |

**Views to create:**
- `Board` by Status — the core workflow view
- `Calendar` by Publish Date — content calendar
- `Table` filtered by Client — per-client view
- `Table` filtered by Status ≠ Posted — active pipeline only

---

### 🎯 Sales Pipeline
| Property | Type | Notes |
|---|---|---|
| Name | Title | Contact/Lead name |
| Company | Text | |
| Contact | Text | Person name |
| Email | Email | |
| Phone | Phone | |
| Stage | Select | Lead → Contacted → Discovery → Proposal Sent → Negotiation → Closed Won / Closed Lost |
| Package | Relation → Packages | Package they're interested in |
| Estimated Value (€/kk) | Number (€) | Monthly recurring value |
| Next Action | Text | |
| Next Action Date | Date | |
| Last Contact | Date | |
| Source | Select | Cold Outreach / Referral / Inbound / Social / Event |
| Package Interest | Select | Quick-reference without relation lookup |
| Notes | Text | |

**Views to create:**
- `Board` by Stage — primary sales view
- `Table` sorted by Next Action Date — daily follow-up view
- `Table` filtered by Stage = Closed Won — revenue reporting

---

### 💰 Packages & Pricing
| Property | Type | Notes |
|---|---|---|
| Name | Title | Starter / Growth / Premium / add-ons |
| Price (€/kk) | Number (€) | |
| Shoots/kk | Number | |
| Videos/kk | Number | |
| Edit Level | Select | Perus / Edistynyt / Cinematic |
| Julkaisu & ajastus | Checkbox | |
| Kommentit & DM | Checkbox | |
| Strategia + raportti | Checkbox | |
| Konsultointi | Checkbox | |
| Kampanjasuunnittelu | Checkbox | |
| Aloitusmaksu (€) | Number (€) | €79 for all main packages |
| Launch-hinta voimassa | Checkbox | |
| Launch-hinta asti | Date | 31.8.2026 |
| Notes | Text | |

---

### ✅ Tasks
| Property | Type | Notes |
|---|---|---|
| Title | Title | |
| Client | Relation ↔ Clients | |
| Content | Relation ↔ Content Pipeline | |
| Priority | Select | High / Medium / Low |
| Status | Select | To Do / In Progress / Blocked / Done |
| Due Date | Date | |
| Category | Select | Filming / Editing / Admin / Communication / Strategy / Invoicing / Outreach |
| Notes | Text | |

**Views to create:**
- `Board` by Status — kanban workflow
- `Table` filtered by Status ≠ Done, sorted by Due Date — daily list
- `Table` filtered by Category = Filming — shoot planning
- `Table` filtered by Priority = High — urgent only

---

### 📈 Performance KPIs
| Property | Type | Notes |
|---|---|---|
| Title | Title | "Client — Month YYYY" |
| Client | Relation ↔ Clients | |
| Month | Date | First of the month |
| Platform | Select | Instagram / TikTok / Both |
| Reach | Number | |
| Impressions | Number | |
| Engagement Rate (%) | Number (%) | |
| Follower Growth | Number | Net new followers |
| Videos Posted | Number | |
| Top Post | Text | URL or description |
| Notes | Text | Insights, anomalies |

---

### 🧾 Invoices
| Property | Type | Notes |
|---|---|---|
| Title | Title | "Client — Month YYYY" |
| Client | Relation ↔ Clients | |
| Invoice Month | Date | |
| Amount (€) | Number (€) | |
| Status | Select | Draft / Sent / Paid / Overdue |
| UKKO Reference | Text | UKKO.fi invoice number |
| Due Date | Date | Net 14 typically |
| Paid Date | Date | |
| Notes | Text | |

**Views to create:**
- `Table` filtered by Status ≠ Paid — outstanding invoices
- `Table` sorted by Invoice Month — revenue history
- `Board` by Status — payment pipeline

---

## 3. Content Workflow

```
IDEA
  → Add row to Content Pipeline, set client, platform, format
  → Write hook + rough script in Notes

SCRIPTING
  → Expand script, finalise hook
  → Create linked Task: "Filming — [Client] [Title]"

FILMING
  → Shoot on location
  → Update status to Filming → Editing when raw footage is done

EDITING
  → Edit video, apply grade (Perus/Edistynyt/Cinematic per package)
  → Create revision task if needed

REVIEW
  → Share with client for approval (Finnish: "Pyydän palautetta…")
  → Log revision requests as tasks

APPROVED
  → Video locked, ready for scheduling

SCHEDULED
  → Set Publish Date
  → Schedule in Later/Buffer/natively

POSTED
  → Mark Posted, log performance in KPIs after 48–72h
```

---

## 4. Homepage Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ ⚡ RN Media Agency OS | nikolas.ruotsalo@rnmedia.fi  │
│    UKKO Y-tunnus: 3481521-6                          │
├─────────────────────────────────────────────────────┤
│ 📊 TODAY'S PRIORITIES                                │
│  [Tasks DB — linked view: Status=To Do, Due≤today]  │
│                                                     │
│ 🎬 ACTIVE CONTENT (this week)                        │
│  [Content DB — linked view: Status≠Posted, Due≤+7d] │
│                                                     │
│ 🎯 HOT LEADS (action due today)                      │
│  [Sales DB — linked view: Stage active, Due≤today]  │
│                                                     │
│ 🧾 OUTSTANDING INVOICES                              │
│  [Invoices DB — linked view: Status≠Paid]           │
├─────────────────────────────────────────────────────┤
│ 🗂 QUICK LINKS                                       │
│  👥 Clients  🎬 Content  🎯 Sales  📈 KPIs           │
├─────────────────────────────────────────────────────┤
│ 📦 PACKAGE QUICK REF                                 │
│  Starter €299 · Growth €499 · Premium €799          │
│  Add-ons: Lisävideo €99 · Lisäshoot €249 · ...      │
└─────────────────────────────────────────────────────┘
```

---

## 5. Client Template (per row in Clients DB)

When you open a client's page from the Clients database, add these sections as a template body:

```
# [Company Name]

## 📋 Brief
- Contact: [Name], [email], [phone]
- Package: [Starter/Growth/Premium]
- Rate: €X/kk | Start: DD.MM.YYYY

## 🎬 Active Content
[Linked view: Content Pipeline, filtered to this client, Status ≠ Posted]

## ✅ Open Tasks
[Linked view: Tasks, filtered to this client, Status ≠ Done]

## 🧾 Invoices
[Linked view: Invoices, filtered to this client]

## 📈 Performance
[Linked view: KPIs, filtered to this client, sorted by Month desc]

## 📝 Notes & History
[Freeform log — add dated entries like a CRM]
```

---

## 6. Migration Map

| Existing Data | → New Location |
|---|---|
| Förå Oy (Samuli, €150 trial) | Clients DB — Status: Trial, Trial Rate: ✓ |
| KattoHoiva Oy (Mika, signing 1.8) | Clients DB — Status: Onboarding, Start: 1.8.2026 |
| HeatUp (Saku, discovery done) | Clients DB — Status: Trial, Task: free shoot |
| Piettolan tila (Laura, proposal sent) | Sales Pipeline — Stage: Proposal Sent |
| FIT 24 Klaukkala (Ella) | Sales Pipeline — Stage: Contacted |
| KOLL App (Pekka) | Sales Pipeline — Stage: Contacted |
| ~30 cold outreach contacts | Sales Pipeline — Stage: Lead, 8 representative rows + bulk note |

---

## 7. Post-Setup Checklist

After running `node setup.js`:

- [ ] Pin "🏠 RN Media — Agency OS" as Notion home on mobile and desktop
- [ ] On Home page: Add Linked Database views for Tasks, Content, Sales, Invoices with filters
- [ ] In Clients DB: Create Board view by Status
- [ ] In Content Pipeline: Create Board view by Status (your main editorial board)
- [ ] In Sales Pipeline: Create Board view by Stage
- [ ] In Tasks DB: Create Board view by Status
- [ ] For each client page: Add linked sub-views for Content, Tasks, Invoices, KPIs
- [ ] Set up Notion reminders on Next Action Date fields
- [ ] Create a monthly recurring task template: "Send invoice — [Client]"
- [ ] Add remaining ~22 cold outreach contacts to Sales Pipeline manually or via CSV import
