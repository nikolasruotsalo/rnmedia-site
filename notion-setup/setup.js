/**
 * RN Media Agency OS — Notion Workspace Builder
 * -----------------------------------------------
 * Tears down nothing (wipe manually first if needed), then builds:
 *   - Home Dashboard page
 *   - 7 relational databases
 *   - Seeded data for all clients, leads, packages, tasks
 *
 * Usage:
 *   NOTION_API_KEY=secret_xxx node setup.js
 *
 * Requires Node 18+ and @notionhq/client installed:
 *   npm install
 */

'use strict';

const { Client } = require('@notionhq/client');

// ─── Config ──────────────────────────────────────────────────────────────────

const NOTION_API_KEY = process.env.NOTION_API_KEY;
if (!NOTION_API_KEY) {
  console.error('ERROR: NOTION_API_KEY environment variable is not set.');
  process.exit(1);
}

const PARENT_PAGE_ID = '19dd06cf-f26b-45f2-a748-9666ac8871b1';

const notion = new Client({ auth: NOTION_API_KEY });

// Rate-limit guard: Notion API allows ~3 req/s
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DELAY = 350; // ms between API calls

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rich(text) {
  return [{ type: 'text', text: { content: text } }];
}

async function createChildPage(parentId, title, icon, content = []) {
  console.log(`  📄 Page: ${title}`);
  const page = await notion.pages.create({
    parent: { type: 'page_id', page_id: parentId },
    icon: { type: 'emoji', emoji: icon },
    properties: { title: { title: rich(title) } },
    children: content,
  });
  await sleep(DELAY);
  return page;
}

async function createDatabase(parentPageId, title, icon, properties) {
  console.log(`  🗃  Database: ${title}`);
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    icon: { type: 'emoji', emoji: icon },
    title: rich(title),
    properties,
  });
  await sleep(DELAY);
  return db;
}

async function addRelation(databaseId, propertyName, targetDatabaseId, dualName = null) {
  const relationDef = dualName
    ? {
        type: 'dual_property',
        dual_property: { synced_property_name: dualName },
      }
    : { type: 'single_property', single_property: {} };

  await notion.databases.update({
    database_id: databaseId,
    properties: {
      [propertyName]: {
        relation: {
          database_id: targetDatabaseId,
          ...relationDef,
        },
      },
    },
  });
  await sleep(DELAY);
}

async function seedRow(databaseId, properties) {
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  });
  await sleep(DELAY);
  return page;
}

// ─── Property schema builders ─────────────────────────────────────────────────

const prop = {
  title: () => ({ title: {} }),
  text: () => ({ rich_text: {} }),
  number: (format = 'number') => ({ number: { format } }),
  euro: () => prop.number('euro'),
  percent: () => prop.number('percent'),
  select: (options) => ({
    select: { options: options.map((o) => (typeof o === 'string' ? { name: o } : o)) },
  }),
  multiSelect: (options) => ({
    multi_select: { options: options.map((o) => (typeof o === 'string' ? { name: o } : o)) },
  }),
  date: () => ({ date: {} }),
  checkbox: () => ({ checkbox: {} }),
  email: () => ({ email: {} }),
  phone: () => ({ phone_number: {} }),
  url: () => ({ url: {} }),
  status: (options, groups) => ({
    status: {
      options: options.map((o) => (typeof o === 'string' ? { name: o } : o)),
      groups: groups || [],
    },
  }),
};

// ─── Page value builders ──────────────────────────────────────────────────────

const val = {
  title: (t) => ({ title: rich(t) }),
  text: (t) => ({ rich_text: rich(t) }),
  number: (n) => ({ number: n }),
  select: (s) => ({ select: { name: s } }),
  multiSelect: (arr) => ({ multi_select: arr.map((n) => ({ name: n })) }),
  date: (d) => ({ date: { start: d } }),
  checkbox: (b) => ({ checkbox: b }),
  email: (e) => ({ email: e }),
  phone: (p) => ({ phone_number: p }),
  url: (u) => ({ url: u }),
  relation: (ids) => ({ relation: ids.map((id) => ({ id })) }),
};

// ─── Phase 1: Create skeleton pages ──────────────────────────────────────────

async function createHomePage(parentId) {
  console.log('\n📌 Phase 1 — Creating Home Dashboard page...');
  const home = await createChildPage(parentId, '🏠 RN Media — Agency OS', '🏠', [
    {
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: rich('RN Media | Solo Agency OS | Nikolas Ruotsalo | nikolas.ruotsalo@rnmedia.fi'),
        icon: { type: 'emoji', emoji: '⚡' },
        color: 'blue_background',
      },
    },
    {
      object: 'block',
      type: 'divider',
      divider: {},
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: rich('📊 Today at a Glance') },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: rich('Use the linked views below to manage your day. Pin this page as your Notion home.'),
      },
    },
    {
      object: 'block',
      type: 'divider',
      divider: {},
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: rich('🗂 System Databases') },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: rich('↓ All databases live below this page. Add linked views here after running setup.') },
    },
  ]);
  return home;
}

// ─── Phase 2: Create all databases ───────────────────────────────────────────

async function createPackagesDB(parentId) {
  console.log('\n📦 Creating Packages DB...');
  return createDatabase(parentId, '💰 Packages & Pricing', '💰', {
    Name: prop.title(),
    'Price (€/kk)': prop.euro(),
    'Shoots/kk': prop.number(),
    'Videos/kk': prop.number(),
    'Edit Level': prop.select(['Perus', 'Edistynyt', 'Cinematic']),
    'Julkaisu & ajastus': prop.checkbox(),
    'Kommentit & DM': prop.checkbox(),
    'Strategia + raportti': prop.checkbox(),
    'Konsultointi': prop.checkbox(),
    'Kampanjasuunnittelu': prop.checkbox(),
    'Aloitusmaksu (€)': prop.euro(),
    'Launch-hinta voimassa': prop.checkbox(),
    'Launch-hinta asti': prop.date(),
    Notes: prop.text(),
  });
}

async function createClientsDB(parentId) {
  console.log('\n👥 Creating Clients DB...');
  return createDatabase(parentId, '👥 Clients', '👥', {
    Name: prop.title(),
    Company: prop.text(),
    'Contact Person': prop.text(),
    Email: prop.email(),
    Phone: prop.phone(),
    Status: prop.select([
      { name: 'Active', color: 'green' },
      { name: 'Onboarding', color: 'blue' },
      { name: 'Trial', color: 'yellow' },
      { name: 'Paused', color: 'orange' },
      { name: 'Churned', color: 'red' },
    ]),
    'Monthly Rate (€)': prop.euro(),
    'Trial Rate': prop.checkbox(),
    'Start Date': prop.date(),
    'Contract End': prop.date(),
    'Next Action': prop.text(),
    'Next Action Date': prop.date(),
    Notes: prop.text(),
  });
}

async function createContentDB(parentId) {
  console.log('\n🎬 Creating Content Pipeline DB...');
  return createDatabase(parentId, '🎬 Content Pipeline', '🎬', {
    Title: prop.title(),
    Status: prop.select([
      { name: 'Idea', color: 'gray' },
      { name: 'Scripting', color: 'purple' },
      { name: 'Filming', color: 'yellow' },
      { name: 'Editing', color: 'orange' },
      { name: 'Review', color: 'blue' },
      { name: 'Approved', color: 'green' },
      { name: 'Scheduled', color: 'pink' },
      { name: 'Posted', color: 'green' },
    ]),
    Platform: prop.multiSelect([
      { name: 'Instagram Reels', color: 'pink' },
      { name: 'TikTok', color: 'gray' },
    ]),
    'Due Date': prop.date(),
    'Publish Date': prop.date(),
    'Script': prop.text(),
    'Hook': prop.text(),
    'Format': prop.select(['Reel', 'TikTok', 'Story', 'Carousel']),
    Notes: prop.text(),
  });
}

async function createSalesDB(parentId) {
  console.log('\n🎯 Creating Sales Pipeline DB...');
  return createDatabase(parentId, '🎯 Sales Pipeline', '🎯', {
    Name: prop.title(),
    Company: prop.text(),
    Contact: prop.text(),
    Email: prop.email(),
    Phone: prop.phone(),
    Stage: prop.select([
      { name: 'Lead', color: 'gray' },
      { name: 'Contacted', color: 'blue' },
      { name: 'Discovery', color: 'purple' },
      { name: 'Proposal Sent', color: 'yellow' },
      { name: 'Negotiation', color: 'orange' },
      { name: 'Closed Won', color: 'green' },
      { name: 'Closed Lost', color: 'red' },
    ]),
    'Estimated Value (€/kk)': prop.euro(),
    'Next Action': prop.text(),
    'Next Action Date': prop.date(),
    'Last Contact': prop.date(),
    Source: prop.select(['Cold Outreach', 'Referral', 'Inbound', 'Social', 'Event']),
    'Package Interest': prop.select(['Starter €299', 'Growth €499', 'Premium €799', 'Custom']),
    Notes: prop.text(),
  });
}

async function createTasksDB(parentId) {
  console.log('\n✅ Creating Tasks DB...');
  return createDatabase(parentId, '✅ Tasks', '✅', {
    Title: prop.title(),
    Priority: prop.select([
      { name: 'High', color: 'red' },
      { name: 'Medium', color: 'yellow' },
      { name: 'Low', color: 'gray' },
    ]),
    Status: prop.select([
      { name: 'To Do', color: 'gray' },
      { name: 'In Progress', color: 'blue' },
      { name: 'Blocked', color: 'red' },
      { name: 'Done', color: 'green' },
    ]),
    'Due Date': prop.date(),
    Category: prop.select([
      'Filming',
      'Editing',
      'Admin',
      'Communication',
      'Strategy',
      'Invoicing',
      'Outreach',
    ]),
    Notes: prop.text(),
  });
}

async function createKPIsDB(parentId) {
  console.log('\n📈 Creating KPIs DB...');
  return createDatabase(parentId, '📈 Performance KPIs', '📈', {
    Title: prop.title(),
    Month: prop.date(),
    Platform: prop.select(['Instagram', 'TikTok', 'Both']),
    'Reach': prop.number(),
    'Impressions': prop.number(),
    'Engagement Rate (%)': prop.percent(),
    'Follower Growth': prop.number(),
    'Videos Posted': prop.number(),
    'Top Post': prop.text(),
    Notes: prop.text(),
  });
}

async function createInvoicesDB(parentId) {
  console.log('\n🧾 Creating Invoices DB...');
  return createDatabase(parentId, '🧾 Invoices', '🧾', {
    Title: prop.title(),
    'Invoice Month': prop.date(),
    'Amount (€)': prop.euro(),
    Status: prop.select([
      { name: 'Draft', color: 'gray' },
      { name: 'Sent', color: 'blue' },
      { name: 'Paid', color: 'green' },
      { name: 'Overdue', color: 'red' },
    ]),
    'UKKO Reference': prop.text(),
    'Due Date': prop.date(),
    'Paid Date': prop.date(),
    Notes: prop.text(),
  });
}

// ─── Phase 3: Wire relations ──────────────────────────────────────────────────

async function wireRelations(ids) {
  console.log('\n🔗 Phase 3 — Wiring relations...');

  // Clients ↔ Content
  await addRelation(ids.clients, 'Content', ids.content, 'Client');
  console.log('  ✓ Clients ↔ Content');

  // Clients ↔ Tasks
  await addRelation(ids.clients, 'Tasks', ids.tasks, 'Client');
  console.log('  ✓ Clients ↔ Tasks');

  // Clients ↔ KPIs
  await addRelation(ids.clients, 'KPIs', ids.kpis, 'Client');
  console.log('  ✓ Clients ↔ KPIs');

  // Clients ↔ Invoices
  await addRelation(ids.clients, 'Invoices', ids.invoices, 'Client');
  console.log('  ✓ Clients ↔ Invoices');

  // Clients ↔ Packages
  await addRelation(ids.clients, 'Package', ids.packages);
  console.log('  ✓ Clients → Packages');

  // Content ↔ Tasks
  await addRelation(ids.content, 'Tasks', ids.tasks, 'Content');
  console.log('  ✓ Content ↔ Tasks');

  // Sales ↔ Packages (single, no back-link needed)
  await addRelation(ids.sales, 'Package', ids.packages);
  console.log('  ✓ Sales → Packages');
}

// ─── Phase 4: Seed Packages ───────────────────────────────────────────────────

async function seedPackages(dbId) {
  console.log('\n📦 Phase 4 — Seeding Packages...');
  const launchDate = '2026-08-31';

  const packages = [
    {
      name: 'Starter',
      price: 299, shoots: 1, videos: 4, editLevel: 'Perus',
      julkaisu: false, kommentit: false, strategia: false, konsultointi: false, kampanja: false,
      aloitus: 79,
    },
    {
      name: 'Growth',
      price: 499, shoots: 2, videos: 8, editLevel: 'Edistynyt',
      julkaisu: true, kommentit: false, strategia: true, konsultointi: false, kampanja: false,
      aloitus: 79,
    },
    {
      name: 'Premium',
      price: 799, shoots: 3, videos: 12, editLevel: 'Cinematic',
      julkaisu: true, kommentit: true, strategia: true, konsultointi: true, kampanja: true,
      aloitus: 79,
    },
    {
      name: 'Lisävideo (add-on)',
      price: 99, shoots: 0, videos: 1, editLevel: 'Perus',
      julkaisu: false, kommentit: false, strategia: false, konsultointi: false, kampanja: false,
      aloitus: 0,
    },
    {
      name: 'Lisäshoot (add-on)',
      price: 249, shoots: 1, videos: 0, editLevel: 'Perus',
      julkaisu: false, kommentit: false, strategia: false, konsultointi: false, kampanja: false,
      aloitus: 0,
    },
    {
      name: 'Lisärevisio (add-on)',
      price: 49, shoots: 0, videos: 0, editLevel: 'Perus',
      julkaisu: false, kommentit: false, strategia: false, konsultointi: false, kampanja: false,
      aloitus: 0,
    },
    {
      name: 'Lisästrategiatunti (add-on)',
      price: 99, shoots: 0, videos: 0, editLevel: 'Perus',
      julkaisu: false, kommentit: false, strategia: false, konsultointi: false, kampanja: false,
      aloitus: 0,
    },
  ];

  const pkgIds = {};
  for (const pkg of packages) {
    const row = await seedRow(dbId, {
      Name: val.title(pkg.name),
      'Price (€/kk)': val.number(pkg.price),
      'Shoots/kk': val.number(pkg.shoots),
      'Videos/kk': val.number(pkg.videos),
      'Edit Level': val.select(pkg.editLevel),
      'Julkaisu & ajastus': val.checkbox(pkg.julkaisu),
      'Kommentit & DM': val.checkbox(pkg.kommentit),
      'Strategia + raportti': val.checkbox(pkg.strategia),
      'Konsultointi': val.checkbox(pkg.konsultointi),
      'Kampanjasuunnittelu': val.checkbox(pkg.kampanja),
      'Aloitusmaksu (€)': val.number(pkg.aloitus),
      'Launch-hinta voimassa': val.checkbox(['Starter', 'Growth', 'Premium'].includes(pkg.name)),
      'Launch-hinta asti': ['Starter', 'Growth', 'Premium'].includes(pkg.name)
        ? val.date(launchDate)
        : { date: null },
    });
    pkgIds[pkg.name] = row.id;
    console.log(`  ✓ Package: ${pkg.name}`);
  }
  return pkgIds;
}

// ─── Phase 5: Seed Clients ────────────────────────────────────────────────────

async function seedClients(dbId, pkgIds) {
  console.log('\n👥 Phase 5 — Seeding Clients...');

  const clients = [
    {
      name: 'Förå Oy',
      company: 'Förå Oy',
      contact: 'Samuli',
      status: 'Trial',
      rate: 150,
      trial: true,
      pkg: null,
      startDate: null,
      nextAction: 'Upgrade conversation — move to proper retainer package',
      nextActionDate: '2026-06-20',
      notes: 'Currently on trial/discounted rate ~€150/kk. Needs upgrade conversation to Starter €299 or Growth €499. Strong relationship.',
    },
    {
      name: 'KattoHoiva Oy',
      company: 'KattoHoiva Oy',
      contact: 'Mika',
      status: 'Onboarding',
      rate: 600,
      trial: false,
      pkg: 'Growth',
      startDate: '2026-08-01',
      nextAction: 'Prepare onboarding package, send contract',
      nextActionDate: '2026-07-01',
      notes: 'Signing 1.8.2026. Rate ~€600/kk (between Growth €499 and Premium €799). Confirm final package.',
    },
    {
      name: 'HeatUp Lämmityspalvelut Oy',
      company: 'HeatUp Lämmityspalvelut Oy',
      contact: 'Saku',
      status: 'Trial',
      rate: 0,
      trial: true,
      pkg: 'Premium',
      startDate: null,
      nextAction: 'Film free discovery shoot this week — present Premium package',
      nextActionDate: '2026-06-14',
      notes: 'Discovery call done. Free shoot this week. Premium €799/kk conditional on shoot quality. High value target.',
    },
  ];

  const clientIds = {};
  for (const c of clients) {
    const props = {
      Name: val.title(c.name),
      Company: val.text(c.company),
      'Contact Person': val.text(c.contact),
      Status: val.select(c.status),
      'Monthly Rate (€)': val.number(c.rate),
      'Trial Rate': val.checkbox(c.trial),
      'Next Action': val.text(c.nextAction),
      'Next Action Date': val.date(c.nextActionDate),
      Notes: val.text(c.notes),
    };
    if (c.startDate) props['Start Date'] = val.date(c.startDate);
    if (c.pkg && pkgIds[c.pkg]) props['Package'] = val.relation([pkgIds[c.pkg]]);

    const row = await seedRow(dbId, props);
    clientIds[c.name] = row.id;
    console.log(`  ✓ Client: ${c.name}`);
  }
  return clientIds;
}

// ─── Phase 6: Seed Sales Pipeline ────────────────────────────────────────────

async function seedSales(dbId) {
  console.log('\n🎯 Phase 6 — Seeding Sales Pipeline...');

  const leads = [
    {
      name: 'Piettolan tila',
      company: 'Piettolan tila',
      contact: 'Laura',
      stage: 'Proposal Sent',
      value: 299,
      pkgInterest: 'Starter €299',
      nextAction: 'Follow up on proposal — Starter €299/kk + one-off video options',
      nextActionDate: '2026-06-15',
      lastContact: '2026-06-10',
      source: 'Inbound',
      notes: 'Proposal sent. Awaiting response. Starter €299/kk + one-off shoots as add-ons.',
    },
    {
      name: 'FIT 24 Klaukkala',
      company: 'FIT 24 Klaukkala',
      contact: 'Ella Sorsa',
      stage: 'Contacted',
      value: 499,
      pkgInterest: 'Growth €499',
      nextAction: 'Follow up sent — await response or call to book discovery',
      nextActionDate: '2026-06-17',
      lastContact: '2026-06-10',
      source: 'Cold Outreach',
      notes: 'Follow-up sent. Gym in Klaukkala — strong fit for Growth package.',
    },
    {
      name: 'KOLL App',
      company: 'KOLL App',
      contact: 'Pekka Mettälä',
      stage: 'Contacted',
      value: 799,
      pkgInterest: 'Premium €799',
      nextAction: 'Follow up sent — await response or call to book discovery',
      nextActionDate: '2026-06-17',
      lastContact: '2026-06-10',
      source: 'Cold Outreach',
      notes: 'Follow-up sent. App company — premium content angle. Could be high-value.',
    },
    // Cold outreach batch — Uusimaa
    ...[
      'Gym Contact 1 — Uusimaa',
      'Gym Contact 2 — Uusimaa',
      'Wellness Contact 1 — Uusimaa',
      'Wellness Contact 2 — Uusimaa',
      'Café Contact 1 — Uusimaa',
      'Café Contact 2 — Uusimaa',
      'Restaurant Contact 1 — Uusimaa',
      'Restaurant Contact 2 — Uusimaa',
    ].map((name, i) => ({
      name,
      company: name,
      contact: '',
      stage: 'Lead',
      value: 299,
      pkgInterest: 'Starter €299',
      nextAction: 'Send initial outreach or follow up',
      nextActionDate: '2026-06-20',
      lastContact: '2026-06-01',
      source: 'Cold Outreach',
      notes: `Part of ~30 cold outreach contacts sent across Uusimaa (gyms, wellness, cafés, restaurants). Batch ${i + 1}.`,
    })),
  ];

  for (const lead of leads) {
    await seedRow(dbId, {
      Name: val.title(lead.name),
      Company: val.text(lead.company),
      Contact: val.text(lead.contact),
      Stage: val.select(lead.stage),
      'Estimated Value (€/kk)': val.number(lead.value),
      'Package Interest': val.select(lead.pkgInterest),
      'Next Action': val.text(lead.nextAction),
      'Next Action Date': val.date(lead.nextActionDate),
      'Last Contact': val.date(lead.lastContact),
      Source: val.select(lead.source),
      Notes: val.text(lead.notes),
    });
    console.log(`  ✓ Lead: ${lead.name}`);
  }
}

// ─── Phase 7: Seed Tasks ──────────────────────────────────────────────────────

async function seedTasks(dbId, clientIds) {
  console.log('\n✅ Phase 7 — Seeding Tasks...');

  const tasks = [
    {
      title: 'HeatUp — Free Discovery Shoot',
      client: 'HeatUp Lämmityspalvelut Oy',
      priority: 'High',
      status: 'To Do',
      due: '2026-06-14',
      category: 'Filming',
      notes: 'Free discovery shoot for Saku. Premium €799 conditional on this shoot.',
    },
    {
      title: 'Förå — Upgrade Conversation',
      client: 'Förå Oy',
      priority: 'High',
      status: 'To Do',
      due: '2026-06-20',
      category: 'Communication',
      notes: 'Move Samuli from €150 trial to proper retainer. Pitch Starter €299 or Growth €499.',
    },
    {
      title: 'Piettolan tila — Follow Up Proposal',
      client: null,
      priority: 'High',
      status: 'To Do',
      due: '2026-06-15',
      category: 'Communication',
      notes: 'Follow up on Starter €299 proposal sent to Laura. One-off add-ons also in play.',
    },
    {
      title: 'KattoHoiva — Send Onboarding Package',
      client: 'KattoHoiva Oy',
      priority: 'Medium',
      status: 'To Do',
      due: '2026-07-01',
      category: 'Admin',
      notes: 'Prepare and send onboarding materials for 1.8.2026 start. Confirm final package (Growth ~€600).',
    },
    {
      title: 'FIT 24 Klaukkala — Follow Up',
      client: null,
      priority: 'Medium',
      status: 'To Do',
      due: '2026-06-17',
      category: 'Communication',
      notes: 'Follow up with Ella Sorsa on cold outreach.',
    },
    {
      title: 'KOLL App — Follow Up',
      client: null,
      priority: 'Medium',
      status: 'To Do',
      due: '2026-06-17',
      category: 'Communication',
      notes: 'Follow up with Pekka Mettälä on cold outreach.',
    },
    {
      title: 'Förå — Monthly Invoice June',
      client: 'Förå Oy',
      priority: 'Medium',
      status: 'To Do',
      due: '2026-06-25',
      category: 'Invoicing',
      notes: 'Send June invoice via UKKO.fi. Current rate €150 until upgrade.',
    },
    {
      title: 'Review UKKO.fi Y-tunnus 3481521-6',
      client: null,
      priority: 'Low',
      status: 'To Do',
      due: '2026-06-30',
      category: 'Admin',
      notes: 'Quarterly check — VAT, invoicing limits, kevytyrittäjä status.',
    },
  ];

  for (const task of tasks) {
    const props = {
      Title: val.title(task.title),
      Priority: val.select(task.priority),
      Status: val.select(task.status),
      'Due Date': val.date(task.due),
      Category: val.select(task.category),
      Notes: val.text(task.notes),
    };
    if (task.client && clientIds[task.client]) {
      props['Client'] = val.relation([clientIds[task.client]]);
    }
    await seedRow(dbId, props);
    console.log(`  ✓ Task: ${task.title}`);
  }
}

// ─── Phase 8: Seed Invoices ───────────────────────────────────────────────────

async function seedInvoices(dbId, clientIds) {
  console.log('\n🧾 Phase 8 — Seeding Invoices...');

  const invoices = [
    {
      title: 'Förå Oy — Kesäkuu 2026',
      client: 'Förå Oy',
      month: '2026-06-01',
      amount: 150,
      status: 'Draft',
      ukko: '',
      due: '2026-06-25',
      notes: 'Trial rate. Upgrade conversation pending.',
    },
    {
      title: 'KattoHoiva Oy — Elokuu 2026',
      client: 'KattoHoiva Oy',
      month: '2026-08-01',
      amount: 600,
      status: 'Draft',
      ukko: '',
      due: '2026-08-25',
      notes: 'First invoice — starts 1.8.2026.',
    },
  ];

  for (const inv of invoices) {
    const props = {
      Title: val.title(inv.title),
      'Invoice Month': val.date(inv.month),
      'Amount (€)': val.number(inv.amount),
      Status: val.select(inv.status),
      'Due Date': val.date(inv.due),
      Notes: val.text(inv.notes),
    };
    if (inv.ukko) props['UKKO Reference'] = val.text(inv.ukko);
    if (inv.client && clientIds[inv.client]) {
      props['Client'] = val.relation([clientIds[inv.client]]);
    }
    await seedRow(dbId, props);
    console.log(`  ✓ Invoice: ${inv.title}`);
  }
}

// ─── Phase 9: Seed starter Content Pipeline rows ──────────────────────────────

async function seedContent(dbId, clientIds) {
  console.log('\n🎬 Phase 9 — Seeding Content Pipeline...');

  const items = [
    {
      title: 'HeatUp — Discovery Shoot Edit #1',
      client: 'HeatUp Lämmityspalvelut Oy',
      status: 'Filming',
      platform: ['Instagram Reels', 'TikTok'],
      due: '2026-06-18',
      hook: 'Talvi teki tuhojaan — katso mitä löysimme',
      format: 'Reel',
      notes: 'From free discovery shoot this week.',
    },
    {
      title: 'Förå — Reel Kesäkuu #1',
      client: 'Förå Oy',
      status: 'Idea',
      platform: ['Instagram Reels'],
      due: '2026-06-22',
      hook: '',
      format: 'Reel',
      notes: 'June content — confirm brief with Samuli.',
    },
    {
      title: 'Förå — Reel Kesäkuu #2',
      client: 'Förå Oy',
      status: 'Idea',
      platform: ['Instagram Reels', 'TikTok'],
      due: '2026-06-28',
      hook: '',
      format: 'Reel',
      notes: 'June content — secondary video.',
    },
  ];

  for (const item of items) {
    const props = {
      Title: val.title(item.title),
      Status: val.select(item.status),
      Platform: val.multiSelect(item.platform),
      'Due Date': val.date(item.due),
      Format: val.select(item.format),
      Notes: val.text(item.notes),
    };
    if (item.hook) props['Hook'] = val.text(item.hook);
    if (item.client && clientIds[item.client]) {
      props['Client'] = val.relation([clientIds[item.client]]);
    }
    await seedRow(dbId, props);
    console.log(`  ✓ Content: ${item.title}`);
  }
}

// ─── Phase 10: Update Home Page with DB links ─────────────────────────────────

async function updateHomePage(homePageId, dbIds) {
  console.log('\n🏠 Phase 10 — Updating Home Dashboard with DB links...');

  const blocks = [
    {
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: rich('RN Media Agency OS — Solo agency, Finland | nikolas.ruotsalo@rnmedia.fi | UKKO Y-tunnus: 3481521-6'),
        icon: { type: 'emoji', emoji: '⚡' },
        color: 'blue_background',
      },
    },
    { object: 'block', type: 'divider', divider: {} },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: rich('📊 Today at a Glance') },
    },
    {
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: rich('Open each database below. In Notion, create a Linked View on this page from each DB filtered to show only urgent/today items. Pin this page as your Notion home on mobile.'),
        icon: { type: 'emoji', emoji: '💡' },
        color: 'yellow_background',
      },
    },
    { object: 'block', type: 'divider', divider: {} },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: rich('🗂 System Databases') },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'mention', mention: { type: 'database', database: { id: dbIds.clients } } }] },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'mention', mention: { type: 'database', database: { id: dbIds.content } } }] },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'mention', mention: { type: 'database', database: { id: dbIds.sales } } }] },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'mention', mention: { type: 'database', database: { id: dbIds.tasks } } }] },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'mention', mention: { type: 'database', database: { id: dbIds.kpis } } }] },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'mention', mention: { type: 'database', database: { id: dbIds.invoices } } }] },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'mention', mention: { type: 'database', database: { id: dbIds.packages } } }] },
    },
    { object: 'block', type: 'divider', divider: {} },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: rich('📦 Packages (Quick Reference)') },
    },
    {
      object: 'block',
      type: 'table',
      table: {
        table_width: 4,
        has_column_header: true,
        has_row_header: false,
        children: [
          {
            type: 'table_row',
            table_row: { cells: [rich('Package'), rich('Hinta/kk'), rich('Shootit/kk'), rich('Videot/kk')] },
          },
          { type: 'table_row', table_row: { cells: [rich('Starter'), rich('€299'), rich('1 (max 2h)'), rich('4')] } },
          { type: 'table_row', table_row: { cells: [rich('Growth'), rich('€499'), rich('2 (max 2,5h)'), rich('jopa 8')] } },
          { type: 'table_row', table_row: { cells: [rich('Premium'), rich('€799'), rich('3 (max 3h)'), rich('jopa 12')] } },
        ],
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: rich('Add-ons: Lisävideo €99 · Lisäshoot €249 · Lisärevisio €49 · Lisästrategiatunti €99'),
      },
    },
    { object: 'block', type: 'divider', divider: {} },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: rich('🔑 Key Info') },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: rich('Kevytyrittäjä via UKKO.fi — Y-tunnus: 3481521-6') },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: rich('Launch prices valid until 31.8.2026 — all packages') },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: rich('Aloitusmaksu €79 kaikilla paketeilla') },
    },
  ];

  // Append blocks to existing home page
  await notion.blocks.children.append({
    block_id: homePageId,
    children: blocks,
  });
  await sleep(DELAY);
  console.log('  ✓ Home page updated');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   RN Media Agency OS — Notion Builder  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`Parent page: ${PARENT_PAGE_ID}`);
  console.log('');

  try {
    // Phase 1: Home page
    const homePage = await createHomePage(PARENT_PAGE_ID);
    const homeId = homePage.id;
    console.log(`  ✓ Home page created: ${homeId}`);

    // Phase 2: All databases
    console.log('\n🗃  Phase 2 — Creating databases...');
    const packagesDB = await createPackagesDB(homeId);
    const clientsDB = await createClientsDB(homeId);
    const contentDB = await createContentDB(homeId);
    const salesDB = await createSalesDB(homeId);
    const tasksDB = await createTasksDB(homeId);
    const kpisDB = await createKPIsDB(homeId);
    const invoicesDB = await createInvoicesDB(homeId);

    const dbIds = {
      packages: packagesDB.id,
      clients: clientsDB.id,
      content: contentDB.id,
      sales: salesDB.id,
      tasks: tasksDB.id,
      kpis: kpisDB.id,
      invoices: invoicesDB.id,
    };

    console.log('\n  Database IDs:');
    Object.entries(dbIds).forEach(([k, v]) => console.log(`    ${k}: ${v}`));

    // Phase 3: Wire relations
    await wireRelations(dbIds);

    // Phase 4: Seed packages
    const pkgIds = await seedPackages(dbIds.packages);

    // Phase 5: Seed clients
    const clientIds = await seedClients(dbIds.clients, pkgIds);

    // Phase 6: Seed sales pipeline
    await seedSales(dbIds.sales);

    // Phase 7: Seed tasks
    await seedTasks(dbIds.tasks, clientIds);

    // Phase 8: Seed invoices
    await seedInvoices(dbIds.invoices, clientIds);

    // Phase 9: Seed content
    await seedContent(dbIds.content, clientIds);

    // Phase 10: Update home page
    await updateHomePage(homeId, dbIds);

    console.log('\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║           ✅ BUILD COMPLETE             ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Open Notion and navigate to "🏠 RN Media — Agency OS"');
    console.log('  2. Pin that page as your Notion home (mobile + desktop)');
    console.log('  3. On the home page, add Linked Database views filtered by:');
    console.log('     • Tasks: Status = To Do, Due Date = Today/This Week');
    console.log('     • Content: Status ≠ Posted, Due Date = This Week');
    console.log('     • Sales: Stage ≠ Closed Won/Lost, Next Action Date = Today');
    console.log('  4. For each client, open their Clients row and check relations are linked');
    console.log('  5. Duplicate the Clients row as a template for new clients');
    console.log('');
    console.log(`  Home URL: https://www.notion.so/${homeId.replace(/-/g, '')}`);
    console.log('');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.body) console.error('   Notion error body:', JSON.stringify(err.body, null, 2));
    process.exit(1);
  }
}

main();
