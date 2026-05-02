const axios = require('axios');
const jwt = require('jsonwebtoken');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const API_KEY_FOR_AUTH =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

console.log('🔍 Auth Middleware Environment Check:', {
  hasSupabaseUrl: !!SUPABASE_URL,
  hasPrivilegedKey: !!process.env.SUPABASE_KEY,
  hasApiKeyForAuth: !!API_KEY_FOR_AUTH,
  hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET,
  usingExplicitPublicKey: !!(
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
  ),
});

if (
  SUPABASE_URL &&
  API_KEY_FOR_AUTH === process.env.SUPABASE_KEY &&
  !process.env.SUPABASE_PUBLISHABLE_KEY &&
  !process.env.SUPABASE_ANON_KEY &&
  !process.env.SUPABASE_JWT_SECRET
) {
  console.warn(
    'Auth: Add SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY), or SUPABASE_JWT_SECRET from Supabase → Project Settings → API, so stock routes can verify browser sessions.'
  );
}

/**
 * Validates the access token with Supabase Auth (same as Auth "Get user" API).
 */
async function fetchUserFromGoTrue(accessToken) {
  if (!SUPABASE_URL || !API_KEY_FOR_AUTH) return null;

  try {
    const res = await axios.get(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: API_KEY_FOR_AUTH,
      },
      timeout: 10000,
      validateStatus: () => true,
    });

    if (res.status === 200 && res.data && typeof res.data.id === 'string') {
      return res.data;
    }
    return null;
  } catch (e) {
    console.error('Auth GoTrue request failed:', e.message);
    return null;
  }
}

/**
 * Offline verification for HS256 access tokens (JWT secret from dashboard).
 */
function userFromJwtSecret(accessToken) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;

  try {
    const [headerPart] = accessToken.split('.');
    if (!headerPart) return null;
    const header = JSON.parse(
      Buffer.from(headerPart, 'base64url').toString('utf8')
    );
    if (header.alg !== 'HS256') return null;

    const payload = jwt.verify(accessToken, secret, {
      algorithms: ['HS256'],
    });

    if (!payload.sub) return null;

    return {
      id: payload.sub,
      email: payload.email,
      aud: payload.aud || 'authenticated',
      app_metadata: payload.app_metadata || {},
      user_metadata: payload.user_metadata || {},
    };
  } catch {
    return null;
  }
}

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    let user = await fetchUserFromGoTrue(token);
    if (!user) {
      user = userFromJwtSecret(token);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { authenticateUser };
