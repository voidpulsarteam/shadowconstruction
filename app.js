const express = require('express');
const path    = require('path');
const session = require('express-session');
const flash   = require('connect-flash');
const bcrypt  = require('bcryptjs');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

const vehiclesPath = path.join(__dirname, 'data/vehicles.json');
const usersPath    = path.join(__dirname, 'data/users.json');
const sitePath     = path.join(__dirname, 'data/site.json');
const wikiPath     = path.join(__dirname, 'data/wiki.json');
const tokensPath   = path.join(__dirname, 'data/tokens.json');

// ── INIT DEFAULT DATA FILES ──────────────────────────────────────────────────
if (!fs.existsSync(usersPath)) {
  fs.writeFileSync(usersPath, JSON.stringify([{
    username:     'admin',
    passwordHash: bcrypt.hashSync('shadow2025', 10),
    role:         'admin'
  }], null, 2));
}

if (!fs.existsSync(sitePath)) {
  fs.writeFileSync(sitePath, JSON.stringify({
    status: { group: 'ACTIVE', sessions: 'WEEKLY', applications: 'OPEN' },
    stats:  { members: '50+', sessions: '100+', discord: '24/7', rank: '#1' }
  }, null, 2));
}

// If vehicles.json doesn't exist, seed from vehicles.js
if (!fs.existsSync(vehiclesPath)) {
  const seed = require('./data/vehicles');
  fs.writeFileSync(vehiclesPath, JSON.stringify(seed, null, 2));
}

if (!fs.existsSync(tokensPath)) {
  fs.writeFileSync(tokensPath, '[]');
}

// ── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'shadow-construction-2025-secret',
  resave:            false,
  saveUninitialized: false,
  cookie:            { maxAge: 24 * 60 * 60 * 1000 }   // 24 h
}));
app.use(flash());

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ── ROUTES ───────────────────────────────────────────────────────────────────
const { requireFleetAccess } = require('./middleware/auth');

app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/fleet/access', require('./routes/access'));

app.get('/', (_req, res) => {
  const site = JSON.parse(fs.readFileSync(sitePath));
  res.render('index', { site });
});

app.get('/wiki', (_req, res) => {
  const wiki = JSON.parse(fs.readFileSync(wikiPath));
  res.render('wiki', { wiki });
});

app.get('/map', (_req, res) => res.render('map'));

app.get('/fleet', requireFleetAccess, (req, res) => {
  const vehicles   = JSON.parse(fs.readFileSync(vehiclesPath));
  const totalSlots = vehicles.reduce((s, v) => s + v.liveries.length, 0);
  res.render('fleet', { vehicles, totalSlots });
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`Shadow Construction → http://localhost:${PORT}`)
);
