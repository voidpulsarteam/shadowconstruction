const express = require('express');
const fs      = require('fs');
const path    = require('path');
const bcrypt  = require('bcryptjs');
const router  = express.Router();

const tokensPath = path.join(__dirname, '../data/tokens.json');
function readTokens() {
  try { return JSON.parse(fs.readFileSync(tokensPath)); } catch { return []; }
}

router.get('/:token', (req, res) => {
  const tokens = readTokens();
  const entry  = tokens.find(t => t.token === req.params.token);
  if (!entry) {
    return res.render('fleet-access', { error: 'This link is invalid or has been revoked.', token: req.params.token, needsPassword: false, label: '' });
  }
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return res.render('fleet-access', { error: 'This access link has expired.', token: req.params.token, needsPassword: false, label: '' });
  }
  if (!entry.passwordHash) {
    req.session.fleetAccess = true;
    return res.redirect('/fleet');
  }
  res.render('fleet-access', { error: null, token: req.params.token, needsPassword: true, label: entry.label || '' });
});

router.post('/:token', (req, res) => {
  const tokens = readTokens();
  const entry  = tokens.find(t => t.token === req.params.token);
  if (!entry) {
    return res.render('fleet-access', { error: 'This link is invalid.', token: req.params.token, needsPassword: false, label: '' });
  }
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return res.render('fleet-access', { error: 'This access link has expired.', token: req.params.token, needsPassword: false, label: '' });
  }
  if (!bcrypt.compareSync(req.body.password || '', entry.passwordHash)) {
    return res.render('fleet-access', { error: 'Incorrect password. Try again.', token: req.params.token, needsPassword: true, label: entry.label || '' });
  }
  req.session.fleetAccess = true;
  res.redirect('/fleet');
});

module.exports = router;
