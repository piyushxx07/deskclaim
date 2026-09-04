const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { authRequired } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function login(req, res, next) {
  try {
    const user = await authService.login(req.body);
    const token = signToken(user);
    res.json({ success: true, token, user });
  } catch (e) { next(e); }
}

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    const { password_hash, ...safe } = user;
    res.status(201).json({ success: true, user: safe });
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required');
    res.json({ success: true, user: req.user });
  } catch (e) { next(e); }
}

const router = require('express').Router();
router.post('/login', login);
router.post('/register', register);
router.get('/me', authRequired, me);

module.exports = router;