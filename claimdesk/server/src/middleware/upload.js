const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const ApiError = require('../utils/ApiError');

const BUCKET = process.env.SUPABASE_BUCKET || 'signatures';

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new ApiError(500, 'Supabase storage is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.mimetype);
    if (!ok) return cb(new ApiError(400, 'Only PNG, JPG or WEBP images are allowed'));
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

async function uploadToSupabase(file, prefix) {
  const supabase = getStorageClient();
  const safeName = (file.originalname || 'signature').replace(/[^a-zA-Z0-9.]/g, '_');
  const objectPath = `${prefix}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw new ApiError(500, 'Failed to upload signature', error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

module.exports = upload;
module.exports.uploadToSupabase = uploadToSupabase;
module.exports.BUCKET = BUCKET;
