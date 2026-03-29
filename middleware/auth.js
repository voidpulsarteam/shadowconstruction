function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  if (req.session && req.session.user) return res.status(403).render('403');
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

function requireFleetAccess(req, res, next) {
  if (req.session && (req.session.user || req.session.fleetAccess)) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

module.exports = { requireLogin, requireAdmin, requireFleetAccess };
