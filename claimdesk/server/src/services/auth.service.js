const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const VALID_ROLES = ['employee', 'director', 'accounts'];

class AuthService {
  async login({ email, password }) {
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw new ApiError(500, 'Database error during login', error.message);
    if (!user) throw new ApiError(401, 'Invalid email or password');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new ApiError(401, 'Invalid email or password');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    };
  }

  async register({ email, password, name, role, department }) {
    if (!email || !password || !name || !role) {
      throw new ApiError(400, 'name, email, password and role are required');
    }
    if (!VALID_ROLES.includes(role)) throw new ApiError(400, 'Invalid role');
    if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');

    const existing = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (existing.data) throw new ApiError(409, 'Email already registered');

    const hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email: email.toLowerCase().trim(), password_hash: hash, name, role, department }])
      .select()
      .single();

    if (error) throw new ApiError(500, 'Failed to register user', error.message);
    return data;
  }
}

module.exports = new AuthService();