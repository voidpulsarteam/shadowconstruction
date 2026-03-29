const express = require('express');
const bcrypt  = require('bcryptjs');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

const usersPath = path.join(__dirname, '../data/users.json');

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { error: req.flash('error'), info: req.flash('info') });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    req.flash('error', 'Username and password are required.');
    return res.redirect('/login');
  }

  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersPath)); } catch {}

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    req.flash('error', 'Invalid credentials.');
    return res.redirect('/login');
  }

  req.session.user = { username: user.username, role: user.role };
  const returnTo = req.session.returnTo || '/dashboard';
  delete req.session.returnTo;
  res.redirect(returnTo);
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
