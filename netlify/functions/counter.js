// netlify/functions/counter.js
// POST → increments upload count by 1, returns new value
// GET  → returns current count (for you to check anytime)

exports.handler = async (event) => {

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 500,
      headers: cors(),
      body: JSON.stringify({ error: 'Missing environment variables' }),
    };
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  try {

    if (event.httpMethod === 'GET') {
      // ── Just read the current count ──
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/counter?id=eq.uploads&select=value`,
        { headers }
      );
      const data = await res.json();
      const value = data?.[0]?.value ?? 0;
      return {
        statusCode: 200,
        headers: cors(),
        body: JSON.stringify({ value }),
      };
    }

    if (event.httpMethod === 'POST') {
      // ── Read current, increment by 1, save ──
      const getRes = await fetch(
        `${SUPABASE_URL}/rest/v1/counter?id=eq.uploads&select=value`,
        { headers }
      );
      const getData = await getRes.json();
      const current = getData?.[0]?.value ?? 0;
      const newValue = current + 1;

      await fetch(
        `${SUPABASE_URL}/rest/v1/counter?id=eq.uploads`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ value: newValue }),
        }
      );

      console.log(`[UPLOAD #${newValue}] — ${new Date().toISOString()}`);

      return {
        statusCode: 200,
        headers: cors(),
        body: JSON.stringify({ value: newValue }),
      };
    }

    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };

  } catch (err) {
    console.error('Counter error:', err.message);
    return {
      statusCode: 500,
      headers: cors(),
      body: JSON.stringify({ error: err.message }),
    };
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}