const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToSupabase } = require('../middleware/upload');
const voucherService = require('../services/voucher.service');
const aiService = require('../services/ai.service');
const ApiError = require('../utils/ApiError');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/dashboard', authRequired, wrap(async (req, res) => {
  const data = await voucherService.dashboard(req.user);
  res.json({ success: true, data });
}));

router.get('/:id/analyze', authRequired, requireRole('director', 'accounts'), wrap(async (req, res) => {
  const data = await aiService.analyzeVoucher(req.params.id);
  res.json({ success: true, data });
}));

router.get('/', authRequired, wrap(async (req, res) => {
  const data = await voucherService.listForUser(req.user, req.query);
  res.json({ success: true, data });
}));

router.get('/:id', authRequired, wrap(async (req, res) => {
  const data = await voucherService.getById(req.params.id, req.user);
  res.json({ success: true, data });
}));

router.post(
  '/',
  authRequired,
  requireRole('employee'),
  wrap(async (req, res) => {
    const data = await voucherService.createAsDraft({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data });
  })
);

router.put(
  '/:id',
  authRequired,
  requireRole('employee'),
  wrap(async (req, res) => {
    const data = await voucherService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data });
  })
);

router.delete(
  '/:id',
  authRequired,
  requireRole('employee'),
  wrap(async (req, res) => {
    const data = await voucherService.remove(req.params.id, req.user.id);
    res.json({ success: true, data });
  })
);

router.post(
  '/:id/submit',
  authRequired,
  requireRole('employee'),
  upload.single('signature'),
  wrap(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'Signature file is required');
    const url = await uploadToSupabase(req.file, `employee/${req.user.id}`);
    const data = await voucherService.submit(req.params.id, req.user.id, url);
    res.json({ success: true, data });
  })
);

router.post(
  '/:id/approve',
  authRequired,
  requireRole('director'),
  upload.single('signature'),
  wrap(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'Signature file is required');
    const url = await uploadToSupabase(req.file, `director/${req.user.id}`);
    const data = await voucherService.approve(req.params.id, req.user.id, url);
    res.json({ success: true, data });
  })
);

router.post(
  '/:id/reject',
  authRequired,
  requireRole('director'),
  wrap(async (req, res) => {
    const data = await voucherService.reject(req.params.id, req.user.id, req.body.reason);
    res.json({ success: true, data });
  })
);

module.exports = router;
