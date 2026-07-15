const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const TABLE_NAME = 'users';

const toUserRecord = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  password: row.password_hash,
  role: row.role || 'customer',
  avatar: row.avatar,
  isActive: row.is_active ?? true,
  isEmailVerified: row.is_email_verified ?? false,
  refreshTokens: row.refresh_tokens || [],
  emailVerificationToken: row.email_verification_token,
  emailVerificationExpires: row.email_verification_expires,
  passwordResetToken: row.password_reset_token,
  passwordResetExpires: row.password_reset_expires,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const fromUserRecord = (user) => ({
  id: user.id,
  full_name: user.fullName,
  email: user.email,
  phone: user.phone,
  password_hash: user.password,
  role: user.role || 'customer',
  avatar: user.avatar,
  is_active: user.isActive ?? true,
  is_email_verified: user.isEmailVerified ?? false,
  refresh_tokens: user.refreshTokens || [],
  email_verification_token: user.emailVerificationToken,
  email_verification_expires: user.emailVerificationExpires,
  password_reset_token: user.passwordResetToken,
  password_reset_expires: user.passwordResetExpires,
});

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
};

const findByEmail = async (email) => {
  if (!supabase) return null;
  ensureSupabase();
  const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('email', email).maybeSingle();
  if (error) throw error;
  return data ? toUserRecord(data) : null;
};

const findById = async (id) => {
  if (!supabase) return null;
  ensureSupabase();
  const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toUserRecord(data) : null;
};

const findByRefreshToken = async (refreshToken) => {
  if (!supabase) return null;
  ensureSupabase();
  const { data, error } = await supabase.from(TABLE_NAME).select('*').filter('refresh_tokens', 'cs', JSON.stringify([refreshToken])).maybeSingle();
  if (error) throw error;
  return data ? toUserRecord(data) : null;
};

const findByEmailVerificationToken = async (token) => {
  if (!supabase) return null;
  ensureSupabase();
  const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('email_verification_token', token).maybeSingle();
  if (error) throw error;
  return data ? toUserRecord(data) : null;
};

const findByPasswordResetToken = async (token) => {
  if (!supabase) return null;
  ensureSupabase();
  const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('password_reset_token', token).maybeSingle();
  if (error) throw error;
  return data ? toUserRecord(data) : null;
};

const create = async (userData) => {
  if (!supabase) return null;
  ensureSupabase();
  try {
    const passwordHash = userData.password ? await bcrypt.hash(userData.password, 10) : null;
    const payload = {
      ...fromUserRecord({
        ...userData,
        password: passwordHash,
        role: userData.role || 'customer',
        isActive: userData.isActive ?? true,
        isEmailVerified: userData.isEmailVerified ?? false,
        refreshTokens: userData.refreshTokens || [],
      }),
    };
    console.log('📤 Payload being inserted into Supabase:', JSON.stringify(payload, null, 2));
    const { data, error } = await supabase.from(TABLE_NAME).insert(payload).select('*').single();
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    console.log('✅ User created in Supabase:', data);
    return toUserRecord(data);
  } catch (err) {
    console.error('❌ Error in create:', err.message);
    throw err;
  }
};

const update = async (user) => {
  if (!supabase) return null;
  ensureSupabase();
  const payload = fromUserRecord(user);
  const { data, error } = await supabase.from(TABLE_NAME).update(payload).eq('id', user.id).select('*').single();
  if (error) throw error;
  return toUserRecord(data);
};

const comparePassword = async (inputPassword, storedHash) => {
  if (!storedHash) return false;
  return bcrypt.compare(inputPassword, storedHash);
};

const createPasswordResetToken = () => crypto.randomBytes(32).toString('hex');
const createEmailVerificationToken = () => crypto.randomBytes(32).toString('hex');

module.exports = {
  findByEmail,
  findById,
  findByRefreshToken,
  findByEmailVerificationToken,
  findByPasswordResetToken,
  create,
  update,
  comparePassword,
  createPasswordResetToken,
  createEmailVerificationToken,
};
