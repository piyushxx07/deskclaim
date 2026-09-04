const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

class UserService {
  async list() {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, department, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(500, 'Failed to fetch users', error.message);
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, department, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new ApiError(500, 'Failed to fetch user', error.message);
    if (!data) throw new ApiError(404, 'User not found');
    return data;
  }
}

module.exports = new UserService();