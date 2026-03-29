const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');
const { requireAdmin } = require('../middleware/auth');
const router     = express.Router();

router.use(requireAdmin);

const vehiclesPath = path.join(__dirname, '../data/vehicles.json');
const sitePath     = path.join(__dirname, '../data/site.json');
const usersPath    = path.join(__dirname, '../data/users.json');
const wikiPath     = path.join(__dirname, '../data/wiki.json');
const tokensPath   = path.join(__dirname, '../data/tokens.json');

function readVehicles() { return JSON.parse(fs.readFileSync(vehiclesPath)); }
function writeVehicles(data) { fs.writeFileSync(vehiclesPath, JSON.stringify(data, null, 2)); }
function readSite() { return JSON.parse(fs.readFileSync(sitePath)); }
function writeSite(data) { fs.writeFileSync(sitePath, JSON.stringify(data, null, 2)); }
function readWiki()  { return JSON.parse(fs.readFileSync(wikiPath)); }
function writeWiki(data) { fs.writeFileSync(wikiPath, JSON.stringify(data, null, 2)); }
function readTokens() { try { return JSON.parse(fs.readFileSync(tokensPath)); } catch { return []; } }
function writeTokens(data) { fs.writeFileSync(tokensPath, JSON.stringify(data, null, 2)); }

/* ── DASHBOARD HOME ── */
router.get('/', (req, res) => {
  const vehicles  = readVehicles();
  const totalSlots = vehicles.reduce((s, v) => s + v.liveries.length, 0);
  const site      = readSite();
  res.render('dashboard/index', {
    user: req.session.user, vehicles, totalSlots, site,
    flash: { success: req.flash('success'), error: req.flash('error') }
  });
});

/* ── FLEET LIST ── */
router.get('/fleet', (req, res) => {
  const vehicles = readVehicles();
  res.render('dashboard/fleet', {
    user: req.session.user, vehicles,
    flash: { success: req.flash('success'), error: req.flash('error') }
  });
});

/* ── NEW VEHICLE ── */
router.get('/fleet/new', (req, res) => {
  res.render('dashboard/fleet-edit', {
    user: req.session.user,
    vehicle: { name: '', year: '', variant: '', liveries: [{ slot: '', id: '' }], colors: [{ role: 'Primary', hex: '#020101' }] },
    index: -1, isNew: true,
    flash: { success: req.flash('success'), error: req.flash('error') }
  });
});

router.post('/fleet/new', (req, res) => {
  const vehicles = readVehicles();
  const vehicle  = parseVehicleBody(req.body);
  if (!vehicle.name) {
    req.flash('error', 'Vehicle name is required.');
    return res.redirect('/dashboard/fleet/new');
  }
  vehicles.push(vehicle);
  writeVehicles(vehicles);
  req.flash('success', `"${vehicle.name}" added.`);
  res.redirect('/dashboard/fleet');
});

/* ── EDIT VEHICLE ── */
router.get('/fleet/:index/edit', (req, res) => {
  const vehicles = readVehicles();
  const index    = parseInt(req.params.index, 10);
  if (isNaN(index) || !vehicles[index]) return res.redirect('/dashboard/fleet');
  res.render('dashboard/fleet-edit', {
    user: req.session.user,
    vehicle: vehicles[index], index, isNew: false,
    flash: { success: req.flash('success'), error: req.flash('error') }
  });
});

router.post('/fleet/:index/edit', (req, res) => {
  const vehicles = readVehicles();
  const index    = parseInt(req.params.index, 10);
  if (isNaN(index) || !vehicles[index]) return res.redirect('/dashboard/fleet');
  const updated  = parseVehicleBody(req.body);
  if (!updated.name) {
    req.flash('error', 'Vehicle name is required.');
    return res.redirect(`/dashboard/fleet/${index}/edit`);
  }
  vehicles[index] = updated;
  writeVehicles(vehicles);
  req.flash('success', `"${updated.name}" saved.`);
  res.redirect('/dashboard/fleet');
});

/* ── DELETE VEHICLE ── */
router.post('/fleet/:index/delete', (req, res) => {
  const vehicles = readVehicles();
  const index    = parseInt(req.params.index, 10);
  if (isNaN(index) || !vehicles[index]) return res.redirect('/dashboard/fleet');
  const name = vehicles[index].name;
  vehicles.splice(index, 1);
  writeVehicles(vehicles);
  req.flash('success', `"${name}" deleted.`);
  res.redirect('/dashboard/fleet');
});

/* ── SITE SETTINGS ── */
router.get('/site', (req, res) => {
  res.render('dashboard/site', {
    user: req.session.user, site: readSite(),
    flash: { success: req.flash('success'), error: req.flash('error') }
  });
});

router.post('/site', (req, res) => {
  const site = {
    status: {
      group:        req.body.group        || 'ACTIVE',
      sessions:     req.body.sessions     || 'WEEKLY',
      applications: req.body.applications || 'OPEN'
    },
    stats: {
      members:  req.body.members  || '50+',
      sessions: req.body.statSessions || '100+',
      discord:  req.body.discord  || '24/7',
      rank:     req.body.rank     || '#1'
    }
  };
  writeSite(site);
  req.flash('success', 'Site settings saved.');
  res.redirect('/dashboard/site');
});

/* ── CHANGE PASSWORD ── */
router.get('/password', (req, res) => {
  res.render('dashboard/password', {
    user: req.session.user,
    flash: { success: req.flash('success'), error: req.flash('error') }
  });
});

router.post('/password', (req, res) => {
  const { current, newpass, confirm } = req.body;
  if (!current || !newpass || !confirm) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/dashboard/password');
  }
  if (newpass !== confirm) {
    req.flash('error', 'New passwords do not match.');
    return res.redirect('/dashboard/password');
  }
  if (newpass.length < 6) {
    req.flash('error', 'Password must be at least 6 characters.');
    return res.redirect('/dashboard/password');
  }

  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersPath)); } catch {}

  const idx = users.findIndex(u => u.username === req.session.user.username);
  if (idx === -1 || !bcrypt.compareSync(current, users[idx].passwordHash)) {
    req.flash('error', 'Current password is incorrect.');
    return res.redirect('/dashboard/password');
  }

  users[idx].passwordHash = bcrypt.hashSync(newpass, 10);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  req.flash('success', 'Password changed successfully.');
  res.redirect('/dashboard/password');
});

/* ── WIKI EDITOR ── */
router.get('/wiki', (req, res) => {
  res.render('dashboard/wiki', {
    user: req.session.user,
    wiki: readWiki(),
    tab: req.query.tab || 'schedule',
    flash: { success: req.flash('success'), error: req.flash('error') }
  });
});

router.post('/wiki/schedule', (req, res) => {
  const wiki = readWiki();
  const days    = [].concat(req.body.day          || []);
  const types   = [].concat(req.body.type         || []);
  const times   = [].concat(req.body.time         || []);
  const accesses = [].concat(req.body.access      || []);
  const labels  = [].concat(req.body.accessLabel  || []);
  wiki.schedule = days
    .map((d, i) => ({ day: d.trim(), type: (types[i]||'').trim(), time: (times[i]||'').trim(), access: (accesses[i]||'').trim(), accessLabel: (labels[i]||'').trim() }))
    .filter(r => r.day && r.type);
  writeWiki(wiki);
  req.flash('success', 'Schedule saved.');
  res.redirect('/dashboard/wiki?tab=schedule');
});

router.post('/wiki/radio', (req, res) => {
  const wiki    = readWiki();
  const rTypes  = [].concat(req.body.radio_type  || []);
  const rCodes  = [].concat(req.body.radio_code  || []);
  const rNames  = [].concat(req.body.radio_name  || []);
  const rDescs  = [].concat(req.body.radio_desc  || []); // for categories, this field holds the label
  wiki.radio = rTypes.map((t, i) => ({
    isCategory: t === 'category',
    label:  t === 'category' ? (rDescs[i]||'').trim().toUpperCase() : '',
    code:   t === 'code'     ? (rCodes[i]||'').trim() : '',
    name:   t === 'code'     ? (rNames[i]||'').trim() : '',
    desc:   t === 'code'     ? (rDescs[i]||'').trim() : ''
  })).filter(r => r.isCategory ? r.label : (r.code && r.name));
  writeWiki(wiki);
  req.flash('success', 'Radio codes saved.');
  res.redirect('/dashboard/wiki?tab=radio');
});

router.post('/wiki/ranks', (req, res) => {
  const wiki = readWiki();
  const tiers       = [].concat(req.body.tier       || []);
  const names       = [].concat(req.body.rank_name  || []);
  const nameClasses = [].concat(req.body.nameClass  || []);
  const times       = [].concat(req.body.rank_time  || []);
  const reqs        = [].concat(req.body.reqs       || []);
  const perms       = [].concat(req.body.perms      || []);
  wiki.ranks = tiers
    .map((t, i) => ({ tier: t.trim(), name: (names[i]||'').trim(), nameClass: (nameClasses[i]||'').trim(), time: (times[i]||'').trim(), reqs: (reqs[i]||'').trim(), perms: (perms[i]||'').trim() }))
    .filter(r => r.name);
  const ruleTitles = [].concat(req.body.rule_title || []);
  const ruleTexts  = [].concat(req.body.rule_text  || []);
  wiki.promoRules = ruleTitles
    .map((t, i) => ({ title: t.trim(), text: (ruleTexts[i]||'').trim() }))
    .filter(r => r.title);
  writeWiki(wiki);
  req.flash('success', 'Ranks & promotion rules saved.');
  res.redirect('/dashboard/wiki?tab=ranks');
});

router.post('/wiki/uniforms', (req, res) => {
  const wiki = readWiki();
  const icons       = [].concat(req.body.uniform_icon     || []);
  const roles       = [].concat(req.body.uniform_role     || []);
  const tagLabels   = [].concat(req.body.uniform_tagLabel || []);
  const tagClasses  = [].concat(req.body.uniform_tagClass || []);
  const itemsTexts  = [].concat(req.body.uniform_items    || []);
  const notes       = [].concat(req.body.uniform_note     || []);
  wiki.uniforms = icons.map((icon, i) => ({
    icon: icon.trim(),
    role: (roles[i]||'').trim(),
    tagLabel: (tagLabels[i]||'').trim(),
    tagClass: (tagClasses[i]||'').trim(),
    items: (itemsTexts[i]||'').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const ci = l.indexOf(':');
      return ci === -1 ? { label: l, desc: '' } : { label: l.slice(0, ci).trim(), desc: l.slice(ci + 1).trim() };
    }),
    note: (notes[i]||'').trim()
  })).filter(u => u.role);
  writeWiki(wiki);
  req.flash('success', 'Uniforms saved.');
  res.redirect('/dashboard/wiki?tab=uniforms');
});

/* ── FLEET TOKENS ── */
router.get('/tokens', (req, res) => {
  const tokens = readTokens().map(t => ({ ...t, expired: t.expiresAt ? new Date(t.expiresAt) < new Date() : false }));
  res.render('dashboard/tokens', {
    user: req.session.user, tokens,
    flash: { success: req.flash('success'), error: req.flash('error') }
  });
});

router.post('/tokens/create', (req, res) => {
  const { label, tokenpass, expiry } = req.body;
  const token = crypto.randomBytes(16).toString('hex');
  const durations = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '3d': 259200000, '7d': 604800000 };
  const expiresAt = durations[expiry] ? new Date(Date.now() + durations[expiry]).toISOString() : null;
  const entry = {
    token,
    label:        (label || 'Access Link').trim(),
    passwordHash: tokenpass ? bcrypt.hashSync(tokenpass, 10) : null,
    expiresAt,
    createdAt:    new Date().toISOString()
  };
  const tokens = readTokens();
  tokens.push(entry);
  writeTokens(tokens);
  req.flash('success', `Token created. Share: /fleet/access/${token}`);
  res.redirect('/dashboard/tokens');
});

router.post('/tokens/:token/delete', (req, res) => {
  let tokens = readTokens();
  const before = tokens.length;
  tokens = tokens.filter(t => t.token !== req.params.token);
  writeTokens(tokens);
  if (tokens.length < before) req.flash('success', 'Token deleted.');
  res.redirect('/dashboard/tokens');
});

/* ── HELPER ── */
function parseVehicleBody(body) {
  const slots = [].concat(body.livery_slot || []);
  const ids   = [].concat(body.livery_id   || []);
  const roles = [].concat(body.color_role  || []);
  const hexes = [].concat(body.color_hex   || []);

  const liveries = slots
    .map((slot, i) => ({ slot: slot.trim(), id: (ids[i] || '').trim() }))
    .filter(l => l.slot && l.id);

  const colors = roles
    .map((role, i) => ({ role: role.trim(), hex: (hexes[i] || '#000000').trim() }))
    .filter(c => c.role);

  return {
    name:     (body.name    || '').trim(),
    year:     (body.year    || '').trim(),
    variant:  (body.variant || '').trim(),
    liveries,
    colors
  };
}

module.exports = router;
