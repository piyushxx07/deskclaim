const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const userService = require('../services/user.service');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', authRequired, requireRole('director', 'accounts'), wrap(async (req, res) => {
  const data = await userService.list();
  res.json({ success: true, data });
}));

router.get('/:id', authRequired, wrap(async (req, res) => {
  const data = await userService.getById(req.params.id);
  res.json({ success: true, data });
}));

module.exports = router;